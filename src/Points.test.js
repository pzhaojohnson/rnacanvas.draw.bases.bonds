import { Points } from './Points';

describe('`class Points`', () => {
  test('`closest()`', () => {
    // an empty points collection
    var points = new Points([]);

    expect(() => points.closest({ x: 0, y: 0 })).toThrow();

    // a collection with one point
    var points = new Points([
      { x: 50, y: 200 },
    ]);

    expect(points.closest({ x: 10, y: -20 }).x).toBe(50);
    expect(points.closest({ x: 10, y: -20 }).y).toBe(200);

    // a collection with multiple points
    var points = new Points([
      { x: 2.2, y: 0 },
      { x: -1000, y: 300 },
      { x: 55.2, y: 712 },
      { x: 314, y: -21.8 },
      { x: 500, y: 811 },
    ]);

    expect(points.closest({ x: 300, y: -15 }).x).toBe(314);
    expect(points.closest({ x: 300, y: -15 }).y).toBe(-21.8);

    var p = { x: 30, y: 110 };

    var points = new Points([p]);

    // returns the same point object that's in the points collection
    expect(points.closest({ x: 25, y: 100 })).toBe(p);
  });
});
