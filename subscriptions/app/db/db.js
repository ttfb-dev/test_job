import mysql from "mysql2/promise";
import config from "../config/index.js";

const db = {
  master: {
    connection: undefined,

    initConnection: async () => {
      db.master.connection = await mysql.createConnection(config.mysql.master);
    },

    closeConnection: async () => {
      await db.master.connection.end();
    },
  },
  slave: {
    connection: undefined,

    initConnection: async () => {
      db.slave.connection = await mysql.createConnection(config.mysql.slave);
    },

    closeConnection: async () => {
      await db.slave.connection.end();
    },
  },
};

export default db;
