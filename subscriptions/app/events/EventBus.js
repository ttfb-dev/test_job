import { eventProcessor } from "./EventProcessor.js";
import { Event } from "./index.js";
import fetch from "node-fetch";
import config from "../config/index.js";

const eventBus = {
  webhookHandler: async (req, res, next) => {
    const eventObjList = req.body;

    for (const eventObj of eventObjList) {
      const event = new Event(eventObj.type, eventObj.data);
      await eventBus.execute(event);
    }

    res.sendStatus(200);
  },

  new: async (event, async = true) => {
    if (async) {
      await eventBus.sendToWorker(event);
    } else {
      await eventBus.execute(event);
    }
  },

  execute: async (event) => {
    await eventProcessor.process(event);
  },

  sendToWorker: async (event) => {
    await fetch(`${config.webhooks.host}${config.webhooks.path}`, {
      method: "post",
      body: JSON.stringify([event]),
      headers: { "Content-Type": "application/json" },
    });
  },
};

export { eventBus };
