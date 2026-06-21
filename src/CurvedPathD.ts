import { SVGPathData } from 'svg-pathdata';

import { MoveToSegment } from './MoveToSegment';

import { TrailingSegment } from './TrailingSegment';

import type { FinitePoint } from '@rnacanvas/points.oopified';

import { Points } from './Points';

import { last } from '@rnacanvas/utilities';

/**
 * Represents an SVG path definition for a curved bond.
 */
export class CurvedPathD {
  #moveToSegment: MoveToSegment;

  #trailingSegments: [TrailingSegment, ...TrailingSegment[]];

  constructor(d: string) {
    let data = new SVGPathData(d);

    // don't forget to convert to absolute
    data = data.toAbs();

    if (data.commands.length == 0) {
      throw new Error("The input SVG path definition doesn't have any commands.");
    }

    this.#moveToSegment = MoveToSegment.from(data.commands[0]);

    if (data.commands.length < 2) {
      throw new Error('An SVG path definition for a curved bond must start with an "M" command followed by one or more trailing commands.');
    }

    this.#trailingSegments = [
      TrailingSegment.from(data.commands[1]),
      ...data.commands.slice(2).map(command => TrailingSegment.from(command)),
    ];
  }

  get segments(): [MoveToSegment, TrailingSegment, ...TrailingSegment[]] {
    return [
      this.#moveToSegment,
      this.#trailingSegments[0],
      ...this.#trailingSegments.slice(1),
    ];
  }

  /**
   * All points defining the SVG path definition.
   */
  get definingPoints(): FinitePoint[] {
    return [
      this.startPoint,
      ...this.#trailingSegments.flatMap(segment => [...segment.controlPoints, segment.endPoint]),
    ];
  }

  get startPoint(): FinitePoint {
    return this.#moveToSegment.startPoint;
  }

  /**
   * All points defining the SVG path definition except for the start point and end point.
   */
  get interveningPoints(): FinitePoint[] {
    return [
      ...this.#trailingSegments.slice(0, -1).flatMap(segment => [...segment.controlPoints, segment.endPoint]),
      ...last(this.#trailingSegments).controlPoints,
    ];
  }

  /**
   * All control points in the SVG path definition.
   */
  get controlPoints(): FinitePoint[] {
    return this.#trailingSegments.flatMap(segment => segment.controlPoints);
  }

  get endPoint(): FinitePoint {
    if (this.#trailingSegments.length == 0) {
      throw new Error('This SVG path definition has no trailing segments.');
    }

    return last(this.#trailingSegments).endPoint;
  }

  toString(): string {
    return this.segments.map(segment => segment.toString()).join(' ');
  }

  /**
   * The `dragPoint` is the point at which dragging was initiated from
   * (e.g., the point on the curve that was clicked on at the start of dragging).
   */
  drag(x: number, y: number, options: { dragPoint: { x: number, y: number } }): void {
    let definingPoints = new Points(this.definingPoints);

    // the point to drag
    let p = definingPoints.closest(options.dragPoint);

    // multiply by 2 for control points (since control points aren't directly on the curve)
    if (this.controlPoints.includes(p)) {
      x *= 2;
      y *= 2;
    }

    // modify the point in place
    p.displace({ x, y });
  }
}
