export class SubscribeExistsError extends Error {
  constructor() {
    super("Subscribe already exists");
  }
}
