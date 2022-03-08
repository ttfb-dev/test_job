export class EventCreateError extends Error {
  constructor(typeType, dataType) {
    super(
      `Failed to create Event: typeof type is ${typeType}, typeof data is ${dataType}`
    );
  }
}
