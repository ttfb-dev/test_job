import { EventParseError, EventCreateError } from "../errors/index.js";

/**
 * @abstract
 */
export class Event {
  constructor(type, data) {
    if (typeof type !== "string" || typeof data !== "object") {
      throw new EventCreateError(typeof type, typeof data);
    }
    this.type = type;
    this.data = data;
  }

  static fromObj(eventObj) {
    try {
      return new Event(eventObj.type, eventObj.data);
    } catch ({ message }) {
      throw new EventParseError(message, JSON.stringify(eventObj));
    }
  }

  toObj() {
    return { type: this.type, data: this.data };
  }
}

export const EVENT_NEW_SUBSCRIPTION = "new_subscription";
export const EVENT_NEW_UNSUBSCRIPTION = "new_unsubscription";
