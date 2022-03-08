import { AccountRepository } from "./repository.js";
import { lineSubscriptionService } from "../line_subscription/index.js";
import config from "../../config/index.js";

class AccountService {
  repositoryMaster = undefined;
  repositorySlave = undefined;

  getRepository(master = false) {
    if (master) {
      if (this.repositoryMaster === undefined) {
        this.repositoryMaster = new AccountRepository(true);
      }
      return this.repositoryMaster;
    }

    if (this.repositorySlave === undefined) {
      this.repositorySlave = new AccountRepository();
    }
    return this.repositorySlave;
  }

  async get(login, force = false) {
    const accounts = await this.getMany([login], force);
    return accounts[0] ?? undefined;
  }

  async getMany(logins, force = false) {
    const repository = this.getRepository(force);
    const accounts = await repository.getAccounts(logins);
    return accounts;
  }

  async refreshAccounts(logins) {
    for (const login of logins) {
      await this.refreshAccount(login);
    }
  }

  async refreshAccount(login) {
    const repository = this.getRepository(true);
    await lineSubscriptionService.refreshLineSubscription(login);
    const subscriptionLine = await lineSubscriptionService.getLine(login, true);

    const accounts = await this.getMany([login, ...subscriptionLine.parents]);

    const account = accounts.find((acc) => acc.login === login);

    const parentAccounts = accounts.filter((acc) =>
      subscriptionLine.parents.includes(acc.login)
    );

    let balanceUsdSub = account.balance_usd;
    parentAccounts.forEach((acc) => {
      balanceUsdSub += acc.balance_usd;
    });

    await repository.refreshAccount(
      login,
      balanceUsdSub,
      parentAccounts.length
    );
  }

  async sheduleAccountsRefresh(logins) {
    const repository = this.getRepository(true);
    await repository.markAccountsToRefresh(logins);
  }

  async plannedAccountRefresh() {
    const repository = this.getRepository(true);
    const logins = await repository.getLoginsToRefresh(
      config.workers.refreshAccount.accountsPerJob
    );
    if (logins.length === 0) {
      return;
    }
    await repository.markAccountsToRefreshInProgress(logins);
    await this.refreshAccounts(logins);
  }

  async sheduleAllAccountsRefresh() {
    const repository = this.getRepository(true);
    await repository.markAllAccountsToRefresh();
  }

  async getTop() {
    const repository = this.getRepository();
    const top = await repository.getTop(5);
    return top;
  }

  async changeBalance(login, balanceDiff) {
    const repository = this.getRepository(true);
    const account = await this.get(login);
    if (account === undefined) {
      throw new EntityNotFoundError("account", login);
    }

    // в своём аккаунте меняем баланс
    await repository.changeBalance(login, balanceDiff);

    const subscriptionLine = await lineSubscriptionService.getLine(login, true);

    // и планируем обновление балансов всех, кто на нас подписан
    await this.sheduleAccountsRefresh(subscriptionLine.parents);
  }
}

export default new AccountService();
