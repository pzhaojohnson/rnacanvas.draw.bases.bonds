import { FinitePoint } from '@rnacanvas/points.oopified';

import { SVGPathData } from 'svg-pathdata';

import type { SVGCommand } from 'svg-pathdata';

export class MoveToSegment {
  static from(command: SVGCommand): MoveToSegment | never {
    if (command.type !== SVGPathData.MOVE_TO) {
      throw new Error('SVG path definition command is not of type "M".');
    }

    if (command.relative) {
      throw new Error('The input SVG path definition command is a relative command.');
    }

    let startPoint = new FinitePoint(command.x, command.y);

    return new MoveToSegment(startPoint);
  }

  constructor(readonly startPoint: FinitePoint) {}

  /**
   * Same point object as the start point.
   */
  get endPoint(): FinitePoint {
    return this.startPoint;
  }

  toString(): string {
    return `M ${this.startPoint.x} ${this.startPoint.y}`;
  }
}
