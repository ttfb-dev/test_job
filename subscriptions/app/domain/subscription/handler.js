import subscriptionService from "./service.js";

const subscriptionHandler = {
  subscribe: async (req, res, next) => {
    const login = req.headers["user"];
    const subscribeTo = req.body["subscribe_to"];

    await subscriptionService.subscribe(login, subscribeTo);

    res.sendStatus(200);
  },
  unsubscribe: async (req, res, next) => {
    const login = req.headers["user"];
    const unsubscribeFrom = req.body["unsubscribe_from"];

    await subscriptionService.unsubscribe(login, unsubscribeFrom);

    res.sendStatus(200);
  },
  test: async (req, res, next) => {
    res.sendStatus(200);
  },
};

export default subscriptionHandler;
