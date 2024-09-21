/**
 * Primarily meant for testing purposes.
 */
export class NucleobaseMock {
  id = `${Math.random()}`;

  centerPoint = new TrackablePoint();
}

type EventListener = () => void;

class TrackablePoint {
  #x = 0;
  #y = 0;

  #eventListeners: { 'move': EventListener[] } = { 'move': [] };

  get x() { return this.#x; }
  set x(x) {
    this.#x = x;
    this.#callEventListeners('move');
  }

  get y() { return this.#y; }
  set y(y) {
    this.#y = y;
    this.#callEventListeners('move');
  }

  set(point: { x: number, y: number }): void {
    this.#x = point.x;
    this.#y = point.y;

    this.#callEventListeners('move');
  }

  addEventListener(name: 'move', listener: EventListener) {
    this.#eventListeners[name].push(listener);
  }

  #callEventListeners(name: 'move') {
    this.#eventListeners[name].forEach(listener => listener());
  }
}
