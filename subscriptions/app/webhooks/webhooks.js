const webhooks = {
  init: (app) => {
    app.use("/webhooks", function (req, res) {
      console.log("got webhook message");
      res.send(200);
    });
  },
};

export default webhooks;
