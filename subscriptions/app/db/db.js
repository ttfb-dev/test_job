import mysql from "mysql2";
import config from "../config/index.js";

const db = {
  connection: undefined,

  initConnection: () => {
    db.connection = mysql.createConnection(config.mysql);
  },

  closeConnection: () => {
    db.connection.end();
  },
};

export default db;
