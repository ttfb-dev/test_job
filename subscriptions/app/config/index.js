const init = () => {
  return {
    devMode: !!parseInt(process.env.DEV_MODE),
    serviceId: "subscriptions",
    logger: {
      level: process.env.LOGGER_LEVEL || "warn",
    },
    mysql: {
      master: {
        host: process.env.MYSQL_MASTER_HOST,
        port: process.env.MYSQL_PORT,
        user: "root",
        password: process.env.MYSQL_ROOT_PASSWORD,
        database: process.env.MYSQL_DB,
      },
      slave: {
        host: process.env.MYSQL_SLAVE_HOST,
        port: process.env.MYSQL_PORT,
        user: "root",
        password: process.env.MYSQL_ROOT_PASSWORD,
        database: process.env.MYSQL_DB,
      },
    },
    webhooks: {
      host: "http://subscriptions-webhooks",
      path: "/webhooks",
    },
    workers: {
      refreshAccount: {
        accountsPerJob: 100,
      },
    },
  };
};

export default init();
