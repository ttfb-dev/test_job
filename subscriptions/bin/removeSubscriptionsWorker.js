import { CronJob } from "cron";
import { subscriptionService } from "../app/domain/subscription/index.js";
import db from "../app/db/index.js";

// init db
await db.master.initConnection();
await db.slave.initConnection();

// стоит запускать раз в сутки, в часы минимальной нагрузки
const removeSubscriptionsJob = new CronJob(
  "*/30 * * * * *",
  async () => {
    try {
      await subscriptionService.performRemoval();
    } catch ({ message }) {
      console.error(message);
    }
  },
  null,
  true,
  "Europe/London"
);

removeSubscriptionsJob.start();
