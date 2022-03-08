import { accountService } from "./index.js";
import cache from "../../cache/index.js";
import { EntityNotFoundError } from "../../errors/index.js";

const accountHandler = {
  refreshAccounts: async (req, res, next) => {
    await accountService.sheduleAllAccountsRefresh();
    res.sendStatus(200);
  },

  refreshAccount: async (req, res, next) => {
    const login = req.headers["user"];
    const account = await accountService.get(login);
    if (account === undefined) {
      throw new EntityNotFoundError("account", login);
    }
    await accountService.refreshAccount(login);
    res.sendStatus(200);
  },

  changeBalance: async (req, res, next) => {
    const { login, balance_diff } = req.body;
    await accountService.changeBalance(login, balance_diff);
    res.sendStatus(200);
  },

  getTop: async (req, res, next) => {
    const cacheKey = "accounts_top_rating";
    const cacheTtl = 10000;
    const cachedTop = await cache.get(cacheKey);
    if (cachedTop !== undefined) {
      res.json({ rating: cachedTop });
      return;
    }

    const top = await accountService.getTop();

    await cache.set(cacheKey, top, cacheTtl);

    res.json({ rating: top });
  },
};

export default accountHandler;
