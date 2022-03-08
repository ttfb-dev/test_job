import db from "../../db/index.js";
import {
  NotEnouthBalanceError,
  WriteToSlaveRepositoryError,
} from "../../errors/index.js";

export class AccountRepository {
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
    this.table = "account";
  }

  getAccounts = async (logins) => {
    const loginList = logins.join('", "');
    const query = `
      SELECT CAST(login as char) as login, source, balance_usd, balance_usd_sub
      FROM ${this.table}
      WHERE login in ("${loginList}")
    `;

    const [rows] = await this.connection.execute(query);

    return rows;
  };

  getLoginsToRefresh = async (limit) => {
    // лучше выбирать максимально свежие данные
    if (!this.isMaster) {
      throw new WriteToSlaveRepositoryError(
        this.constructor.name,
        "getLoginsToRefresh"
      );
    }
    const query = `
      SELECT CAST(login as char) as login
      FROM ${this.table}
      WHERE to_refresh = 1
      LIMIT 0, ${limit}
    `;

    const [rows] = await this.connection.execute(query);

    return rows.map((val) => val.login);
  };

  markAccountsToRefreshInProgress = async (logins) => {
    if (!this.isMaster) {
      throw new WriteToSlaveRepositoryError(
        this.constructor.name,
        "markAccountsToRefreshInProgress"
      );
    }
    const loginList = logins.join('", "');

    const query = `
      UPDATE ${this.table}
      SET to_refresh = -1
      WHERE login in ("${loginList}")
    `;

    await this.connection.execute(query);
  };

  markAccountsToRefresh = async (logins) => {
    if (!this.isMaster) {
      throw new WriteToSlaveRepositoryError(
        this.constructor.name,
        "markAccountsToRefresh"
      );
    }
    const loginList = logins.join('", "');

    const query = `
      UPDATE ${this.table}
      SET to_refresh = 1
      WHERE login in ("${loginList}")
      AND to_refresh = 0
    `;

    await this.connection.execute(query);
  };

  markAllAccountsToRefresh = async () => {
    if (!this.isMaster) {
      throw new WriteToSlaveRepositoryError(
        this.constructor.name,
        "markAccountsToRefresh"
      );
    }

    const query = `
      UPDATE ${this.table}
      SET to_refresh = 1
      WHERE to_refresh = 0
    `;

    await this.connection.execute(query);
  };

  refreshAccount = async (login, subBalance, subscribers_count = 0) => {
    if (!this.isMaster) {
      throw new WriteToSlaveRepositoryError(
        this.constructor.name,
        "refreshAccount"
      );
    }

    const query = `
      UPDATE ${this.table}
      SET balance_usd_sub = ${subBalance}, to_refresh = 0, subscribers_count = ${subscribers_count}
      WHERE login = ${login}
    `;

    await this.connection.execute(query);
  };

  getTop = async (limit) => {
    const query = `
      SELECT source, login, balance_usd, balance_usd_sub, subscribers_count
      FROM ${this.table}
      ORDER BY balance_usd_sub DESC, subscribers_count DESC
      LIMIT 0, ${limit}
    `;

    const [rows] = await this.connection.execute(query);

    return rows;
  };

  changeBalance = async (login, balanceDiff) => {
    const queryGetBalance = `
      SELECT balance_usd
      FROM ${this.table}
      WHERE login = ${login}
      LIMIT 1
    `;

    const queryUpdateBalance = `
      UPDATE ${this.table}
      SET balance_usd = balance_usd + ${balanceDiff}, balance_usd_sub = balance_usd_sub + ${balanceDiff}
      WHERE login = ${login}
      LIMIT 1
    `;

    try {
      await this.connection.execute(
        "SET TRANSACTION ISOLATION LEVEL SERIALIZABLE"
      );

      const [rows] = await this.connection.execute(queryGetBalance);

      const balance_usd = rows[0].balance_usd;

      if (balance_usd + balanceDiff < 0) {
        throw new NotEnouthBalanceError();
      }

      await this.connection.execute(queryUpdateBalance);
    } catch ({ message }) {
      this.connection.rollback();
      throw new NotEnouthBalanceError();
    }
  };
}
