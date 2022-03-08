export class NotEnouthBalanceError extends Error {
  constructor() {
    super("Not enough money in the account");
  }
}
