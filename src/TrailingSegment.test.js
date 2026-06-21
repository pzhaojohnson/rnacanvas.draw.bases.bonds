import { TrailingSegment } from './TrailingSegment';

import { SVGPathData } from 'svg-pathdata';

import { FinitePoint } from '@rnacanvas/points.oopified';

describe('`class TrailingSegment`', () => {
  test('`static from()`', () => {
    var pathD = new SVGPathData('M 0 0 L 10 -30 Q 12 -18 8.4 10 C 10 20 -2 -3 50 30');

    // from an "L" command
    var segment = TrailingSegment.from(pathD.commands[1]);

    expect(segment.controlPoints.length).toBe(0);

    expect(segment.endPoint.x).toBe(10);
    expect(segment.endPoint.y).toBe(-30);

    // from a "Q" command
    var segment = TrailingSegment.from(pathD.commands[2]);

    expect(segment.controlPoints.length).toBe(1);

    expect(segment.controlPoints[0].x).toBe(12);
    expect(segment.controlPoints[0].y).toBe(-18);

    expect(segment.endPoint.x).toBe(8.4);
    expect(segment.endPoint.y).toBe(10);

    // from a "C" command
    var segment = TrailingSegment.from(pathD.commands[3]);

    expect(segment.controlPoints.length).toBe(2);

    [[10, 20], [-2, -3]].forEach(([x, y], i) => {
      expect(segment.controlPoints[i].x).toBe(x);
      expect(segment.controlPoints[i].y).toBe(y);
    });

    expect(segment.endPoint.x).toBe(50);
    expect(segment.endPoint.y).toBe(30);

    // throws for unrecognized commands
    expect(() => TrailingSegment.from(pathD.commands[0])).toThrow();

    expect(pathD.commands[0]).toBeTruthy();

    var pathD = new SVGPathData('M 10 20 l 80 100');

    // throws for relative commands
    expect(() => TrailingSegment.from(pathD.commands[1])).toThrow();

    expect(pathD.commands[1].relative).toBeTruthy();
  });

  test('`constructor()`', () => {
    var controlPoints = [
      new FinitePoint(1, 2),
      new FinitePoint(50, 60),
    ];

    var endPoint = new FinitePoint(-10, -20);

    var segment = new TrailingSegment(controlPoints, endPoint);

    // stores control points array
    expect(segment.controlPoints).toBe(controlPoints);

    // stores end point
    expect(segment.endPoint).toBe(endPoint);
  });

  test('`toString()`', () => {
    var endPoint = new FinitePoint(-20, 30);

    // zero control points
    var segment = new TrailingSegment([], endPoint);
    expect(segment.toString()).toBe('L  -20 30');

    // one control point
    segment.controlPoints = [
      new FinitePoint(-100, 200),
    ];

    expect(segment.toString()).toBe('Q -100 200 -20 30');

    // two control points
    segment.controlPoints = [
      new FinitePoint(54, -16.2),
      new FinitePoint(21, 18),
    ];

    expect(segment.toString()).toBe('C 54 -16.2 21 18 -20 30');

    // more than two control points
    segment.controlPoints = [
      new FinitePoint(1, 2),
      new FinitePoint(3, 4),
      new FinitePoint(10, 20),
    ];

    expect(() => segment.toString()).toThrow();
  });
});
