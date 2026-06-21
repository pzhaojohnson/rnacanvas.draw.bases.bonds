import { MoveToSegment } from './MoveToSegment';

import { FinitePoint } from '@rnacanvas/points.oopified';

import { SVGPathData } from 'svg-pathdata';

describe('`class MoveToSegment`', () => {
  test('`static from()`', () => {
    var pathD = new SVGPathData('M 10 20 Q 1 2 50 100');

    // from an "M" command
    var segment = MoveToSegment.from(pathD.commands[0]);

    expect(segment.startPoint.x).toBe(10);
    expect(segment.startPoint.y).toBe(20);

    // from not an "M" command
    expect(() => MoveToSegment.from(pathD.commands[1])).toThrow();

    expect(pathD.commands[1]).toBeTruthy();

    var pathD = new SVGPathData('M 10 20 m 100 200');

    // from a relative command
    expect(() => MoveToSegment.from(pathD.commands[1])).toThrow();

    expect(pathD.commands[1]).toBeTruthy();
  });

  test('`constructor()`', () => {
    var startPoint = new FinitePoint(-20, 89);

    var segment = new MoveToSegment(startPoint);

    // stores the start point object (doesn't create a new point object)
    expect(segment.startPoint).toBe(startPoint);
  });

  test('`get endPoint()`', () => {
    var startPoint = new FinitePoint(10, 20);

    var segment = new MoveToSegment(startPoint);

    expect(segment.endPoint).toBe(startPoint);
  });

  test('`toString()`', () => {
    var startPoint = new FinitePoint(-12.2, 84);

    var segment = new MoveToSegment(startPoint);

    // change the start point some
    startPoint.x = 30;

    expect(segment.toString()).toBe('M 30 84');
  });
});
