export class ClassMethodError extends Error {
  constructor(className, methodName, message) {
    super(`${className}.${methodName}: ${message}`);
  }
}
