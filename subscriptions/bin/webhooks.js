import express from "express";
import webhooks from "../app/webhooks/index.js";
import { errorHandler, errorLogger } from "../app/errors/index.js";
import db from "../app/db/index.js";

const app = express();

const server = async () => {
  // init db
  await db.master.initConnection();
  await db.slave.initConnection();

  app.use(express.json());

  const port = process.env.SERVER_PORT || 80;

  webhooks.init(app);

  // должны быть последними
  app.use(errorLogger);
  app.use(errorHandler);

  app.listen(port);

  await process.on("SIGTERM", async () => {
    db.master.closeConnection();
    db.slave.closeConnection();
  });

  console.log(`HTTP webhoks start and listen :${port} port`);
};

server();
