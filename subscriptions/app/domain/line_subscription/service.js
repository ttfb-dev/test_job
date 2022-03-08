import { LineSubscriptionRepository } from "./repository.js";
import { subscriptionService } from "../subscription/index.js";

class LineSubscriptionService {
  repositoryMaster = undefined;
  repositorySlave = undefined;

  getRepository(master = false) {
    if (master) {
      if (this.repositoryMaster === undefined) {
        this.repositoryMaster = new LineSubscriptionRepository(true);
      }
      return this.repositoryMaster;
    }

    if (this.repositorySlave === undefined) {
      this.repositorySlave = new LineSubscriptionRepository();
    }
    return this.repositorySlave;
  }

  async refreshLineSubscription(login) {
    const repository = this.getRepository(true);
    const parents = await subscriptionService.getParents(
      login,
      login,
      new Set(),
      true
    );
    const children = await subscriptionService.getChildren(
      login,
      login,
      new Set(),
      true
    );
    await repository.updateLine(login, [...parents], [...children]);
  }

  async getLine(login, force = false) {
    const repository = this.getRepository(force);
    const lines = await repository.getLines([login]);
    return lines[0] ?? undefined;
  }
}

export default new LineSubscriptionService();
