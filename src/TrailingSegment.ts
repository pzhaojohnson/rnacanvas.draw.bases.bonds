import { SVGPathData } from 'svg-pathdata';

import type { SVGCommand } from 'svg-pathdata';

import { FinitePoint } from '@rnacanvas/points.oopified';

/**
 * A segment that comes after at least one previous segment in an SVG path definition (for a curved bond).
 */
export class TrailingSegment {
  static from(command: SVGCommand): TrailingSegment | never {
    if (command.type !== SVGPathData.LINE_TO && command.type !== SVGPathData.QUAD_TO && command.type !== SVGPathData.CURVE_TO) {
      throw new Error('Trailing segments can only be created from "L", "Q" and "C" SVG path definition commands.');
    }

    if (command.relative) {
      throw new Error('The input SVG path definition command is a relative command.');
    }

    var controlPoints: FinitePoint[] = [];

    if (command.type === SVGPathData.QUAD_TO || command.type === SVGPathData.CURVE_TO) {
      controlPoints.push(new FinitePoint(command.x1, command.y1));
    }

    if (command.type === SVGPathData.CURVE_TO) {
      controlPoints.push(new FinitePoint(command.x2, command.y2));
    }

    var endPoint = new FinitePoint(command.x, command.y);

    return new TrailingSegment(controlPoints, endPoint);
  }

  constructor(public controlPoints: FinitePoint[], readonly endPoint: FinitePoint) {}

  toString(): string {
    if (this.controlPoints.length > 2) {
      throw new Error(`There can only be at most 2 control points: ${this.controlPoints.length} control points.`);
    }

    // the type of command
    let T = (
      this.controlPoints.length == 0 ? 'L'
      : this.controlPoints.length == 1 ? 'Q'
      : 'C'
    );

    return (
      T
      + ' '
      + this.controlPoints.map(p => `${p.x} ${p.y}`).join(' ')
      + ' '
      + `${this.endPoint.x} ${this.endPoint.y}`
    );
  }
}
