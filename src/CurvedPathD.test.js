import { CurvedPathD } from './CurvedPathD';

import { MoveToSegment } from './MoveToSegment';

import { FinitePoint } from '@rnacanvas/points.oopified';

describe('`class CurvedPathD`', () => {
  test('`constructor()`', () => {
    // just one trailing segment
    var pathD = new CurvedPathD('M -10 2 Q 50 100 -2.5 -8');

    [[-10, 2], [50, 100], [-2.5, -8]].forEach((coordinates, i) => {
      expect(pathD.definingPoints[i]).toStrictEqual(new FinitePoint(...coordinates));
    });

    // multiple trailing segments of different types
    var pathD = new CurvedPathD('M 0 3 L 50 -100 Q 50 80 -2.9 -12 C 50 200 1 2 -12 15');

    [[0, 3], [50, -100], [50, 80], [-2.9, -12], [50, 200], [1, 2], [-12, 15]].forEach((coordinates, i) => {
      expect(pathD.definingPoints[i]).toStrictEqual(new FinitePoint(...coordinates));
    });

    // converts relative paths to absolute paths
    var pathD = new CurvedPathD('M 100 10 q 50 -2 -50 25 q 80 20 1 5');

    [[100, 10], [150, 8], [50, 35], [130, 55], [51, 40]].forEach((coordinates, i) => {
      expect(pathD.definingPoints[i]).toStrictEqual(new FinitePoint(...coordinates));
    });

    // an empty path definition string
    expect(() => new CurvedPathD('')).toThrow();

    // a random path definition string
    expect(() => new CurvedPathD('asdf')).toThrow();

    // doesn't start with an "M" command
    expect(() => new CurvedPathD('L 10 20')).toThrow();

    // just an "M" command
    expect(() => new CurvedPathD('M 1 2')).toThrow();

    // not all trailing commands are "L", "Q" or "C" commands
    expect(() => new CurvedPathD('M 0 0 Q 1 2 3 4 Q 5 6 7 8 H 9 Q 11 12 13 14')).toThrow();

    // there's a nonfinite number in the path definition
    expect(() => new CurvedPathD('M 0 0 Q 1 Infinity -1 -2')).toThrow();
  });

  test('`get segments()`', () => {
    // just one trailing command
    var pathD = new CurvedPathD('M -25.6 88 Q 100 -200 -3.4 6');

    expect(pathD.segments.map(segment => segment.toString())).toStrictEqual([
      'M -25.6 88',
      'Q 100 -200 -3.4 6',
    ]);

    // multiple trailing commands
    var pathD = new CurvedPathD('M 50 60 Q -10 20 30 0 Q 6 20 50 100 C 80 20 -1 -2 3 8 L -10 -12');

    expect(pathD.segments.map(segment => segment.toString())).toStrictEqual([
      'M 50 60',
      'Q -10 20 30 0',
      'Q 6 20 50 100',
      'C 80 20 -1 -2 3 8',
      'L  -10 -12',
    ]);
  });

  test('`get definingPoints()`', () => {
    // just one trailing segment
    var pathD = new CurvedPathD('M -10 2 Q 50 100 -2.5 -8');

    [[-10, 2], [50, 100], [-2.5, -8]].forEach((coordinates, i) => {
      expect(pathD.definingPoints[i]).toStrictEqual(new FinitePoint(...coordinates));
    });

    // multiple trailing segments of different types
    var pathD = new CurvedPathD('M 0 3 L 50 -100 Q 50 80 -2.9 -12 C 50 200 1 2 -12 15');

    [[0, 3], [50, -100], [50, 80], [-2.9, -12], [50, 200], [1, 2], [-12, 15]].forEach((coordinates, i) => {
      expect(pathD.definingPoints[i]).toStrictEqual(new FinitePoint(...coordinates));
    });
  });

  test('`get startPoint()`', () => {
    // just one trailing command
    var pathD = new CurvedPathD('M -25.6 88 Q 100 -200 -3.4 6');

    expect(pathD.startPoint).toStrictEqual(new FinitePoint(-25.6, 88));

    // multiple trailing commands
    var pathD = new CurvedPathD('M -50 10 Q 0 0 30 40 Q 12 15 -2 -5 L 10 100');

    expect(pathD.startPoint).toStrictEqual(new FinitePoint(-50, 10));
  });

  test('`get interveningPoints()`', () => {
    // zero intervening points
    var pathD = new CurvedPathD('M -10 2 L -2.5 -8');

    expect(pathD.interveningPoints).toStrictEqual([]);

    // multiple intervening points
    var pathD = new CurvedPathD('M 0 3 L 50 -100 Q 50 80 -2.9 -12 C 50 200 1 2 -12 15');

    expect(pathD.interveningPoints.length).toBe(5);

    [[50, -100], [50, 80], [-2.9, -12], [50, 200], [1, 2]].forEach((coordinates, i) => {
      expect(pathD.interveningPoints[i]).toStrictEqual(new FinitePoint(...coordinates));
    });
  });

  test('`get controlPoints()`', () => {
    // zero control points
    var pathD = new CurvedPathD('M -10 2 L -2.5 -8');

    expect(pathD.controlPoints).toStrictEqual([]);

    // multiple control points
    var pathD = new CurvedPathD('M 0 3 L 50 -100 Q 50 80 -2.9 -12 C 50 200 1 2 -12 15');

    expect(pathD.controlPoints.length).toBe(3);

    [[50, 80], [50, 200], [1, 2]].forEach((coordinates, i) => {
      expect(pathD.controlPoints[i]).toStrictEqual(new FinitePoint(...coordinates));
    });
  });

  test('`get endPoint()`', () => {
    // just one trailing segment
    var pathD = new CurvedPathD('M 10 20 Q 50 100 2 -24');

    expect(pathD.endPoint).toStrictEqual(new FinitePoint(2, -24));

    // multiple trailing segments
    var pathD = new CurvedPathD('M 1 2 Q 30 20 1 5 L -10 -20 C 1 2 50 97 -15.2 18');

    expect(pathD.endPoint).toStrictEqual(new FinitePoint(-15.2, 18));

    // should return the same point object (to facilitate direct modification)
    expect(pathD.endPoint).toBe(pathD.segments[3].endPoint);
  });

  test('`toString()`', () => {
    // just one trailing command
    var pathD = new CurvedPathD('M -25.6 88 Q 100 -200 -3.4 6');

    // modify the path definition some
    pathD.startPoint.x  = 57;
    pathD.segments[1].controlPoints[0].y = 208;
    pathD.segments[1].endPoint.y = -0.84;

    expect(pathD.toString()).toStrictEqual('M 57 88 Q 100 208 -3.4 -0.84');

    // multiple trailing commands
    var pathD = new CurvedPathD('M 50 60 Q -10 20 30 0 C -10 -20 6 20 50 100 Q -1 -2 3 8 L 200 300');

    // modify the path definition some
    pathD.startPoint.x = -2;
    pathD.segments[1].controlPoints[0].x = -2000;
    pathD.segments[2].endPoint.y = 500;
    pathD.endPoint.x += 5;

    expect(pathD.toString()).toBe('M -2 60 Q -2000 20 30 0 C -10 -20 6 20 50 500 Q -1 -2 3 8 L  205 300');
  });

  test('`drag()`', () => {
    var pathD = new CurvedPathD('M 10 20 L 50 100');

    // dragging the start point
    pathD.drag(-4, 56, { dragPoint: { x: 8, y: 9 } });

    expect(pathD.startPoint).toStrictEqual(new FinitePoint(6, 76));

    // dragging the end point
    pathD.drag(-19, -100, { dragPoint: { x: 48, y: 101 } });

    expect(pathD.endPoint).toStrictEqual(new FinitePoint(31, 0));

    var pathD = new CurvedPathD('M -55 100 L 20 30 Q 80 100 201 5 C 30 20 1 2 -8 -10');

    // the point to drag
    var p = pathD.segments[3].controlPoints[1];

    // dragging a control point
    pathD.drag(-12, 25, { dragPoint: { x: 0.5, y: 3 } });

    // must multiply the X and Y components of the drag vector by 2 (for control points)
    expect(pathD.segments[3].controlPoints[1]).toStrictEqual(new FinitePoint(-23, 52));

    // modifies the point in place (i.e., doesn't create a new "dragged" point)
    expect(pathD.segments[3].controlPoints[1]).toBe(p);
  });
});
