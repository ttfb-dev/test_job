import db from "../../db/index.js";
import { WriteToSlaveRepositoryError } from "../../errors/index.js";

export class LineSubscriptionRepository {
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
    this.table = "line_subscription";
  }

  getLines = async (logins) => {
    const loginList = logins.join('", "');
    const query = `
      SELECT CAST(login as char) as login, parents, children
      FROM ${this.table}
      WHERE login in ("${loginList}")
    `;

    const [rows] = await this.connection.execute(query);

    const result = rows.map((row) => {
      return {
        login: row.login,
        parents: JSON.parse(row.parents),
        children: JSON.parse(row.children),
      };
    });

    return result;
  };

  updateLine = async (login, parents, children) => {
    if (!this.isMaster) {
      throw new WriteToSlaveRepositoryError(
        this.constructor.name,
        "updateLine"
      );
    }

    const query = `
      INSERT INTO ${this.table} (login, parents, children) 
        VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE parents = ?, children = ?;
    `;

    await this.connection.execute(query, [
      login,
      JSON.stringify(parents),
      JSON.stringify(children),
      JSON.stringify(parents),
      JSON.stringify(children),
    ]);
  };
}
