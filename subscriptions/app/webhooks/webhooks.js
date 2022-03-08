import { errorWrapper } from "../errors/index.js";
import { eventBus } from "../events/index.js";

const webhooks = {
  init: (app) => {
    app.use("/webhooks", errorWrapper(eventBus.webhookHandler));
  },
};

export default webhooks;
