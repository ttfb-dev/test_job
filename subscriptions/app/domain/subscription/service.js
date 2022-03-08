import { SubscriptionRepository } from "./repository.js";
import { accountService } from "../account/index.js";
import { lineSubscriptionService } from "../line_subscription/index.js";
import {
  SubscribeExistsError,
  ClassMethodError,
  EntityNotFoundError,
  SubscribeNotFoundError,
} from "../../errors/index.js";
import { Event, EVENT_NEW_SUBSCRIPTION, eventBus } from "../../events/index.js";

class SubscriptionService {
  repositoryMaster = undefined;
  repositorySlave = undefined;

  getRepository(master = false) {
    if (master) {
      if (this.repositoryMaster === undefined) {
        this.repositoryMaster = new SubscriptionRepository(true);
      }
      return this.repositoryMaster;
    }

    if (this.repositorySlave === undefined) {
      this.repositorySlave = new SubscriptionRepository();
    }
    return this.repositorySlave;
  }

  async subscribe(login, subscribeTo) {
    const repository = this.getRepository(true);

    const accounts = await accountService.getMany([login, subscribeTo]);

    const owner = accounts.find((account) => account.login === login);

    if (!owner) {
      throw new EntityNotFoundError("account", login);
    }

    const target = accounts.find((account) => account.login === subscribeTo);

    if (!target) {
      throw new EntityNotFoundError("account", subscribeTo);
    }

    const line = await lineSubscriptionService.getLine(login);

    if (line.children.includes(subscribeTo)) {
      throw new SubscribeExistsError();
    }

    try {
      // создаём подписку
      await repository.newSubscribe(
        owner.login,
        owner.source,
        target.login,
        target.source
      );
      // обновляем баланс двух аккаунтов
      await accountService.refreshAccounts([login, subscribeTo]);

      const subscriptionLine = await lineSubscriptionService.getLine(login);

      // создаём событие "подписка оформлена", в обработчике которого обновятся остальные аккаунты
      await eventBus.new(
        new Event(EVENT_NEW_SUBSCRIPTION, { login, subscribeTo }),
        true
      );
    } catch (err) {
      throw new ClassMethodError(
        repository.constructor.name,
        "newSubscribe",
        err.message
      );
    }
  }

  async unsubscribe(login, r_login) {
    const repository = this.getRepository(true);

    const subscriptionLine = await lineSubscriptionService.getLine(login);

    if (!subscriptionLine.children.includes(r_login)) {
      throw new SubscribeNotFoundError();
    }

    await repository.markRemoved(login, r_login);

    await accountService.refreshAccounts([login, r_login]);

    // получаем subscription_line уже без r_login и его children
    const newSubscriptionLine = await lineSubscriptionService.getLine(login);

    await accountService.sheduleAccountsRefresh([
      ...newSubscriptionLine.parents,
      ...newSubscriptionLine.children,
    ]);
  }

  async getParents(baseLogin, targetLogin, parents = new Set(), force = false) {
    const repository = this.getRepository(force);
    if (targetLogin === undefined) {
      targetLogin = baseLogin;
    }
    const targetParents = await repository.getAccountParents(targetLogin);
    for (const parent of targetParents) {
      if (parents.has(parent) || parent === baseLogin) {
        continue;
      }
      parents.add(parent);
      const parentParents = await this.getParents(
        baseLogin,
        parent,
        parents,
        force
      );
      parentParents.forEach((parentParent) => parents.add(parentParent));
    }
    return parents;
  }

  async getChildren(
    baseLogin,
    targetLogin,
    children = new Set(),
    force = false
  ) {
    const repository = this.getRepository(force);
    if (targetLogin === undefined) {
      targetLogin = baseLogin;
    }
    const targetChildren = await repository.getAccountChildren(targetLogin);
    for (const child of targetChildren) {
      if (children.has(child) || child === baseLogin) {
        continue;
      }
      children.add(child);
      const childChildren = await this.getChildren(baseLogin, child, children);
      childChildren.forEach((childChild) => children.add(childChild));
    }
    return children;
  }

  async performRemoval() {
    const repository = this.getRepository(true);
    await repository.performRemoval();
  }
}

export default new SubscriptionService();
