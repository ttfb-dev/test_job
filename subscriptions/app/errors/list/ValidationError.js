export class ValidationError extends Error {
  constructor(field) {
    super(`Field ${field} validation failed`);
  }
}
