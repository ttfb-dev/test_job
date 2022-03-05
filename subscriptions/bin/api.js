import express from "express";
import router from "../app/router/index.js";
import db from "../app/db/index.js";

const app = express();

const server = async () => {
  // init db
  db.initConnection();

  app.use(express.urlencoded({ extended: true }));

  const port = process.env.SERVER_PORT || 80;

  router.init(app);

  app.listen(port);

  await process.on("SIGTERM", async () => {
    db.closeConnection();
  });

  console.log(`HTTP server start and listen :${port} port`);
};

server();
