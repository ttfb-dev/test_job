export class WriteToSlaveRepositoryError extends Error {
  constructor(className, methodName) {
    super(`${className}.${methodName}`);
  }
}
