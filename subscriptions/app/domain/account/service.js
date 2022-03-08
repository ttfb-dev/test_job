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
}

export default new AccountService();

[
  "60000000000063843",
  "60000000000068851",
  "60000000000069853",
  "60000000000065845",
  "60000000000067850",
  "60000000000070854",
  "60000000000071855",
  "60000000000066847",
];
