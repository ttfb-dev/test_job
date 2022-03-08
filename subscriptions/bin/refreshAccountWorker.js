import { CronJob } from "cron";
import { accountService } from "../app/domain/account/index.js";
import db from "../app/db/index.js";

// init db
await db.master.initConnection();
await db.slave.initConnection();

const refreshAccountJob = new CronJob(
  "*/10 * * * * *",
  async () => {
    try {
      await accountService.plannedAccountRefresh();
    } catch ({ message }) {
      console.error(message);
    }
  },
  null,
  true,
  "Europe/London"
);

refreshAccountJob.start();
