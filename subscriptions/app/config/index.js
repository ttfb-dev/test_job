const init = () => {
  return {
    devMode: !!parseInt(process.env.DEV_MODE),
    serviceId: "subscriptions",
    logger: {
      level: process.env.LOGGER_LEVEL || "warn",
    },
    mysql: {
      host: process.env.MYSQL_HOST,
      port: process.env.MYSQL_PORT,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DB,
    },
  };
};

export default init();
