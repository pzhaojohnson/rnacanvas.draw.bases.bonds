/**
 * The nucleobase interface used by bonds.
 */
export interface Nucleobase {
  readonly id: string;

  readonly centerPoint: {
    x: number;
    y: number;

    /**
     * The added listener is to be called whenever the X or Y coordinates
     * of the point change.
     */
    addEventListener(name: 'move', listener: () => void): void;
  };
}
