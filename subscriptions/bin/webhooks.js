import express from "express";
import webhooks from "../app/webhooks/index.js";
import db from "../app/db/index.js";

const app = express();

const server = async () => {
  // init db
  db.initConnection();

  app.use(express.json());

  const port = process.env.SERVER_PORT || 80;

  webhooks.init(app);

  app.listen(port);

  await process.on("SIGTERM", async () => {
    db.closeConnection();
  });

  console.log(`HTTP webhoks start and listen :${port} port`);
};

server();
