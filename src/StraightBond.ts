import * as SVG from '@svgdotjs/svg.js';

import type { Nucleobase } from './Nucleobase';

import type { Drawing } from './Drawing';

import { assignUUID } from '@rnacanvas/draw.svg';

import { distance, direction } from '@rnacanvas/points';

import { isNumber, isFiniteNumber } from '@rnacanvas/value-check';

import { isNonNullObject } from '@rnacanvas/value-check';

/**
 * A two-dimensional point.
 */
export type Point = {
  x: number;
  y: number;
};

const settablePropertyNames = [
  'basePadding1',
  'basePadding2',
] as const;

const setterMethodNames = {
  'basePadding1': 'setBasePadding1',
  'basePadding2': 'setBasePadding2',
} as const;

/**
 * A bond that is a straight line between two bases.
 */
export class StraightBond<B extends Nucleobase> {
  /**
   * Default values for newly created straight bonds.
   */
  static defaultValues = {
    attributes: {
      'stroke': '#000000',
      'stroke-width': '2',
    },
    basePadding1: 6,
    basePadding2: 6,
  };

  /**
   * Creates a new straight bond connecting bases 1 and 2.
   *
   * Applies the default values contained in the `defaultValues` static property object
   * to the newly created straight bond.
   */
  static between<B extends Nucleobase>(base1: B, base2: B): StraightBond<B> {
    let line = (new SVG.Line()).node;
    let sb = new StraightBond(line, base1, base2);

    sb.assignUUID();

    sb.set(StraightBond.defaultValues);

    // to make sure that the newly created straight bond is positioned properly
    sb.reposition();

    return sb;
  }

  /**
   * Note that this constructor will not apply any default values to the newly created straight bond.
   *
   * @param line The line element that is the straight bond.
   * @param base1 Base 1 connected by the bond.
   * @param base2 Base 2 connected by the bond.
   */
  constructor(private line: SVGLineElement, readonly base1: B, readonly base2: B) {
    if (!this.domNode.dataset.basePadding1) {
      this.domNode.dataset.basePadding1 = `${distance(this.point1, this.base1.centerPoint)}`;
    }

    if (!this.domNode.dataset.basePadding2) {
      this.domNode.dataset.basePadding2 = `${distance(this.point2, this.base2.centerPoint)}`;
    }

    base1.centerPoint.addEventListener('move', () => this.reposition());
    base2.centerPoint.addEventListener('move', () => this.reposition());
  }

  /**
   * The two bases bound by the straight bond.
   *
   * In the returned base-pair, the two bases bound by the straight bond
   * will be ordered base 1 and then base 2.
   */
  get basePair(): [B, B] {
    return [this.base1, this.base2];
  }

  /**
   * The actual DOM node of the line element that is the straight bond.
   */
  get domNode() {
    return this.line;
  }

  /**
   * Get an attribute of the line element that is the straight bond.
   */
  getAttribute(name: string) {
    return this.domNode.getAttribute(name);
  }

  /**
   * Set an attribute of the line element that is the straight bond.
   */
  setAttribute(name: string, value: string): void {
    this.domNode.setAttribute(name, value);
  }

  /**
   * This method is meant to receive as input an object of attribute values
   * keyed by attribute name.
   *
   * Invalid inputs are ignored.
   */
  setAttributes(attributes: { [name: string]: unknown } | unknown): void {
    if (!isNonNullObject(attributes)) {
      return;
    }

    try {
      (new SVG.Line(this.domNode)).attr(attributes);
    } catch {}
  }

  /**
   * The `id` property of the line element that is the straight bond.
   */
  get id() {
    // don't use the `id` method provided by the SVG.js library for SVG elements
    // (since it will auto-initialize IDs)
    return this.domNode.id;
  }

  /**
   * Assigns a new UUID to the straight bond.
   *
   * (Overwrites any preexisting ID that the straight bond had.)
   */
  assignUUID(): void {
    assignUUID(this.domNode);
  }

  /**
   * Appends the line element that is the straight bond to the given container node.
   */
  appendTo(container: Node): void {
    container.appendChild(this.domNode);
  }

  /**
   * Removes the line element that is the straight bond from its parent container node.
   *
   * Has no effect if the straight bond (line element) had no parent container node to begin with.
   */
  remove(): void {
    this.domNode.remove();
  }

  /**
   * Returns true if the line element that is the straight bond is a child (or grandchild, great-grandchild, etc.)
   * of the given container node.
   *
   * Returns false otherwise, including if the given container node is the straight bond (line element) itself.
   */
  isIn(container: Node): boolean {
    return container.contains(this.domNode) && container !== this.domNode;
  }

  /**
   * Returns true if the line element that is the straight bond is a child of any sort of parent container node.
   *
   * Returns false otherwise.
   */
  hasParent(): boolean {
    return this.domNode.parentNode ? true : false;
  }

  /**
   * The length of the line element that is the straight bond.
   *
   * Note that this method might throw if the straight bond has not been added to the document of the webpage.
   */
  getTotalLength(): number | never {
    return this.domNode.getTotalLength();
  }

  /**
   * Get a point along the length of the straight bond (going from point 1 to point 2).
   *
   * Note that this method might throw if the straight bond has not been added to the document of the webpage.
   */
  getPointAtLength(length: number): Point | never {
    return this.domNode.getPointAtLength(length);
  }

  /**
   * The point connecting with base 1 of the straight bond.
   */
  get point1(): Point {
    // don't use `getPointAtLength` method to retrieve this point
    // (might throw if the straight bond has not been added to the document of the webpage)
    return {
      x: this.domNode.x1.baseVal.value,
      y: this.domNode.y1.baseVal.value,
    };
  }

  /**
   * The point connecting with base 2 of the straight bond.
   */
  get point2(): Point {
    // don't use `getPointAtLength` or `getTotalLength` methods when retrieving this point
    // (they might throw errors if the straight bond has not been added to the document of the webpage)
    return {
      x: this.domNode.x2.baseVal.value,
      y: this.domNode.y2.baseVal.value,
    };
  }

  /**
   * The distance that point 1 is meant to be from base 1 of the straight bond.
   *
   * Note that this is not the same thing as the current distance between point 1 and base 1 of the straight bond.
   *
   * (This is to allow for proper repositioning of the straight bond after its bases have been moved.)
   */
  get basePadding1(): number {
    let basePadding1 = Number.parseFloat(this.domNode.dataset.basePadding1 ?? '');

    if (Number.isFinite(basePadding1)) {
      return basePadding1;
    } else {
      return 0;
    }
  }

  /**
   * Will reposition the straight bond.
   */
  set basePadding1(basePadding1) {
    this.domNode.dataset.basePadding1 = `${basePadding1}`;

    this.reposition();
  }

  /**
   * Values that are not finite numbers are ignored.
   *
   * Negative values are clamped to zero.
   */
  setBasePadding1(basePadding1: number | unknown): void {
    if (!isFiniteNumber(basePadding1)) {
      return;
    }

    // make at least zero
    this.basePadding1 = Math.max(0, basePadding1);
  }

  /**
   * The distance that point 2 is meant to be from base 2 of the straight bond.
   *
   * Note that this is not the same thing as the current distance between point 2 and base 2 of the straight bond.
   *
   * (This is to allow for proper repositioning of the straight bond after its bases have been moved.)
   */
  get basePadding2(): number {
    let basePadding2 = Number.parseFloat(this.domNode.dataset.basePadding2 ?? '');

    if (Number.isFinite(basePadding2)) {
      return basePadding2;
    } else {
      return 0;
    }
  }

  /**
   * Will reposition the straight bond.
   */
  set basePadding2(basePadding2) {
    this.domNode.dataset.basePadding2 = `${basePadding2}`;

    this.reposition();
  }

  /**
   * Values that are not finite numbers are ignored.
   *
   * Negative values are clamped to zero.
   */
  setBasePadding2(basePadding2: number | unknown): void {
    if (!isFiniteNumber(basePadding2)) {
      return;
    }

    // make at least zero
    this.basePadding2 = Math.max(0, basePadding2);
  }

  /**
   * Returns true if the sum of base paddings 1 and 2 is greater than
   * the distance between the center points of bases 1 and 2 for the straight bond.
   *
   * Returns false otherwise.
   */
  isInverted(): boolean {
    return this.basePadding1 + this.basePadding2 > distance(this.base1.centerPoint, this.base2.centerPoint);
  }

  /**
   * Sets values of the straight bond.
   *
   * Is supposed to receive as input an object of property values (keyed by property name).
   *
   * The input object can also contain an attributes child object (with key `attributes`).
   */
  set(values: unknown) {
    try {
      this.setAttributes((values as any).attributes);
    } catch {}

    settablePropertyNames.forEach(name => {
      try {
        this[setterMethodNames[name]]((values as any)[name]);
      } catch {}
    });
  }

  /**
   * Repositions the straight bond based on the current positions of bases 1 and 2.
   */
  private reposition(): void {
    let centerPoint1 = this.base1.centerPoint;
    let centerPoint2 = this.base2.centerPoint;

    let a = direction(centerPoint1, centerPoint2);

    this.setAttribute('x1', `${centerPoint1.x + (this.basePadding1 * Math.cos(a))}`);
    this.setAttribute('y1', `${centerPoint1.y + (this.basePadding1 * Math.sin(a))}`);
    this.setAttribute('x2', `${centerPoint2.x - (this.basePadding2 * Math.cos(a))}`);
    this.setAttribute('y2', `${centerPoint2.y - (this.basePadding2 * Math.sin(a))}`);
  }

  /**
   * Returns the serialized form of the straight bond,
   * which is used when saving drawings.
   *
   * Throws if unable to properly do so
   * (e.g., the straight bond or one of its bases has a falsy ID).
   */
  serialized() {
    let id = this.id;
    if (!id) { throw new Error('Straight bond ID is falsy.'); }

    let baseID1 = this.base1.id;
    if (!baseID1) { throw new Error('Base 1 ID is falsy.'); }

    let baseID2 = this.base2.id;
    if (!baseID2) { throw new Error('Base 2 ID is falsy.'); }

    return { id, baseID1, baseID2 };
  }

  /**
   * Recreates a saved straight bond from its serialized form.
   *
   * Throws if unable to do so.
   *
   * @param savedBond The serialized form of a saved straight bond.
   * @param parentDrawing The drawing that the saved straight bond is in.
   */
  static deserialized<B extends Nucleobase>(savedBond: unknown, parentDrawing: Drawing<B>) {
    if (!isNonNullObject(savedBond)) { throw new Error('Saved straight bond must be an object.'); }

    // straight bond IDs used to be saved under `lineId`
    let id = savedBond.id ?? savedBond.lineId;
    if (!id) { throw new Error('Straight bond ID is missing.'); }

    let domNode = parentDrawing.domNode.querySelector('#' + id);
    if (!domNode) { throw new Error('Unable to find straight bond DOM node.'); }
    if (!(domNode instanceof SVGLineElement)) { throw new Error('Straight bond DOM node must be an SVG line element.'); }

    // base IDs used to be saved under `baseId1` and `baseId2`
    let baseID1 = savedBond.baseID1 ?? savedBond.baseId1;
    let baseID2 = savedBond.baseID2 ?? savedBond.baseId2;

    if (!baseID1) { throw new Error('Missing base 1 ID.'); }
    if (!baseID2) { throw new Error('Missing base 2 ID.'); }

    let base1 = [...parentDrawing.bases].find(b => b.id === baseID1);
    let base2 = [...parentDrawing.bases].find(b => b.id === baseID2);

    if (!base1) { throw new Error('Unable to find base 1.'); }
    if (!base2) { throw new Error('Unable to find base 2.'); }

    let sb = new StraightBond(domNode, base1, base2);

    // base paddings used to be saved as JSON object properties
    if (isNumber(savedBond.basePadding1)) { sb.basePadding1 = savedBond.basePadding1; }
    if (isNumber(savedBond.basePadding2)) { sb.basePadding2 = savedBond.basePadding2; }

    return sb;
  }
}
