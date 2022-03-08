import db from "../../db/index.js";
import { WriteToSlaveRepositoryError } from "../../errors/index.js";

export class SubscriptionRepository {
  table;
  connection;
  isMaster = false;

  constructor(master = false) {
    if (master) {
      this.connection = db.master.connection;
      this.isMaster = true;
    } else {
      this.connection = db.slave.connection;
    }
    this.table = "subscription";
  }

  getAccountChildren = async (login) => {
    const query = `
      SELECT CAST(r_login as char) as r_login
      FROM ${this.table}
      WHERE login = ?
      AND removed = 0
    `;

    const [rows] = await this.connection.execute(query, [login]);

    return rows.map((val) => val.r_login);
  };

  getAccountParents = async (login) => {
    const query = `
      SELECT CAST(login as char) as login
      FROM ${this.table}
      WHERE r_login = ?
      AND removed = 0
    `;

    const [rows] = await this.connection.execute(query, [login]);

    return rows.map((val) => val.login);
  };

  newSubscribe = async (login, source, r_login, r_source) => {
    if (!this.isMaster) {
      throw new WriteToSlaveRepositoryError(
        this.constructor.name,
        "newSubscribe"
      );
    }

    const query = `
      INSERT INTO ${this.table}
      (login, source, r_login, r_source, removed)
      VALUES ('${login}', '${source}', '${r_login}', '${r_source}', 0)
      ON DUPLICATE KEY UPDATE removed = 0;
    `;

    await this.connection.execute(query);
  };

  markRemoved = async (login, r_login) => {
    if (!this.isMaster) {
      throw new WriteToSlaveRepositoryError(
        this.constructor.name,
        "markRemoved"
      );
    }

    const query = `
      UPDATE ${this.table}
      SET removed = 1
      WHERE login = ${login}
        AND r_login = ${r_login}
      LIMIT 1
    `;

    await this.connection.execute(query);
  };

  performRemoval = async () => {
    if (!this.isMaster) {
      throw new WriteToSlaveRepositoryError(
        this.constructor.name,
        "performRemoval"
      );
    }

    const query = `
      DELETE FROM ${this.table}
      WHERE removed = 1
    `;

    await this.connection.execute(query);
  };
}
