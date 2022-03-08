const express = require("express");
const path = require("path");
const jwt_decode = require("jwt-decode");

const app = express();

const server = async () => {
  app.use(express.urlencoded({ extended: true }));

  const port = process.env.SERVER_PORT || 80;

  app.use("/schema", express.static(path.join(__dirname, "/public/schema")));

  app.use("/v1/auth/intro", function (req, res) {
    const token = req.body.token;

    // имитация поддержки интроспекции токена по rfc oauth 2.0 https://datatracker.ietf.org/doc/html/rfc7662
    if (typeof token === "string" && token.length > 0) {
      try {
        const data = jwt_decode(token);
        res.json({
          ...data,
          active: true,
        });
        return;
      } catch {}
    }

    res.json({
      active: false,
    });
  });

  app.listen(port);

  console.log(`HTTP server start and listen :${port} port`);
};

server();
