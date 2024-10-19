import type { Nucleobase } from './Nucleobase';

/**
 * The drawing interface used by bonds.
 */
export interface Drawing<B extends Nucleobase> {
  /**
   * The DOM node corresponding to the drawing.
   */
  readonly domNode: SVGSVGElement;

  /**
   * All bases in the drawing.
   */
  readonly bases: Iterable<B>;
}
