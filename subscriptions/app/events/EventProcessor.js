import { EVENT_NEW_SUBSCRIPTION } from "./Event.js";
import { accountService } from "../domain/account/index.js";
import { lineSubscriptionService } from "../domain/line_subscription/index.js";

export const eventProcessor = {
  async process(event) {
    switch (event.type) {
      case EVENT_NEW_SUBSCRIPTION:
        const { login, subscribeTo } = event.data;
        const parentLine = await lineSubscriptionService.getLine(login);
        const childLine = await lineSubscriptionService.getLine(subscribeTo);
        const accountsToRefresh = [
          ...parentLine.parents,
          ...parentLine.children,
          ...childLine.parents,
          ...childLine.children,
        ].filter((acc) => acc !== login && acc !== subscribeTo);

        await accountService.sheduleAccountsRefresh(accountsToRefresh);
        break;
    }
  },
};
