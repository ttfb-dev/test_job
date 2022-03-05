import path from "path";
import express from "express";
import fetch from "node-fetch";

const router = {
  init: (app) => {
    app.use("/schema", express.static(path.join(__dirname, "/public/schema")));
    app.use("/hi", async function (req, res) {
      await fetch("http://subscriptions/webhooks");
      res.send(200);
    });
  },
};

export default router;
