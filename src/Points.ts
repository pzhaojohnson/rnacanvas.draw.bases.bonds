import { distance } from '@rnacanvas/points';

/**
 * A collection of points.
 */
export class Points<P extends PointLike> {
  readonly #points;

  constructor(points: P[]) {
    this.#points = points;
  }

  /**
   * Returns the closest point to the specified point.
   *
   * Returns the same point object that's in the points collection
   * (i.e., doesn't create any new point objects).
   */
  closest(p: PointLike): P {
    if (this.#points.length == 0) {
      throw new Error('This points collection is empty.');
    }

    // don't sort in place (just to be safe)
    let points = [...this.#points];

    points.sort((p1, p2) => distance(p1, p) - distance(p2, p));

    return points[0];
  }
}

type PointLike = {
  x: number;
  y: number;
};
