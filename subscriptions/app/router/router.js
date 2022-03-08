import express from "express";
import { accountHandler } from "../domain/account/index.js";
import { subscriptionHandler } from "../domain/subscription/index.js";
import { errorWrapper } from "../errors/index.js";
import { body, header } from "express-validator";
import validator from "./validator.js";

const router = {
  init: (app) => {
    app.use("/schema", express.static("public/schema"));

    app.get("/v1/rating", errorWrapper(accountHandler.getTop));

    app.post("/v1/refresh-all", errorWrapper(accountHandler.refreshAccounts));

    app.post(
      "/v1/refresh",
      header("user").isNumeric({ no_symbols: true }),
      errorWrapper(accountHandler.refreshAccount)
    );

    app.post(
      "/v1/change-balance",
      body("login").isNumeric({ no_symbols: true }),
      body("correlation").isString(),
      body("correlation").custom(validator.checkCorrelation),
      body("balance_diff").isInt(),
      errorWrapper(accountHandler.changeBalance)
    );

    app.post(
      "/v1/subscribe",
      body("subscribe_to").isNumeric({ no_symbols: true }),
      header("user").isNumeric({ no_symbols: true }),
      errorWrapper(subscriptionHandler.subscribe)
    );

    app.post(
      "/v1/unsubscribe",
      body("unsubscribe_from").isNumeric({ no_symbols: true }),
      header("user").isNumeric({ no_symbols: true }),
      errorWrapper(subscriptionHandler.unsubscribe)
    );
  },
};

export default router;
