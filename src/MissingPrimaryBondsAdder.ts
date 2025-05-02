import { consecutivePairs } from '@rnacanvas/base-pairs';

export class MissingPrimaryBondsAdder {
  #targetDrawing;

  #drawingObserver = new MutationObserver(() => this.#addMissingPrimaryBonds());

  constructor(targetDrawing: Drawing) {
    this.#targetDrawing = targetDrawing;

    this.#drawingObserver.observe(targetDrawing.domNode, { childList: true, subtree: true });
  }

  #addMissingPrimaryBonds(): void {
    let bases = [...this.#targetDrawing.bases];

    // primary bond partners for all bases
    let partners = new Map<Nucleobase, Set<Nucleobase>>();

    bases.forEach(b => partners.set(b, new Set()));

    [...this.#targetDrawing.primaryBonds].forEach(pb => {
      partners.get(pb.base1)?.add(pb.base2);
      partners.get(pb.base2)?.add(pb.base1);
    });

    consecutivePairs(bases).forEach(([base1, base2]) => {
      if (!partners.get(base1)?.has(base2)) {
        this.#targetDrawing.addPrimaryBond(base1, base2);
      }
    });
  }
}

interface Drawing {
  readonly domNode: SVGSVGElement;

  /**
   * The ordering of bases in this iterable is the ordering of bases in the drawing.
   */
  readonly bases: Iterable<Nucleobase>;

  readonly primaryBonds: Iterable<PrimaryBond>;

  /**
   * Adds a primary bond between the two bases.
   */
  addPrimaryBond(base1: Nucleobase, base2: Nucleobase): void;
}

interface Nucleobase {}

interface PrimaryBond {
  readonly base1: Nucleobase;
  readonly base2: Nucleobase;
}
