export class EventParseError extends Error {
  constructor(message, string) {
    super(`Source: ${string}; message: ${message}`);
  }
}
