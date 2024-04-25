import * as SVG from '@svgdotjs/svg.js';

import type { Nucleobase } from './Nucleobase';

import { assignUUID } from '@rnacanvas/draw.svg';

import { distance, direction } from '@rnacanvas/points';

import { isFiniteNumber } from '@rnacanvas/value-check';

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
  static defaults = {
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
   * Applies the default values contained in the `defaults` static property object
   * to the newly created straight bond.
   */
  static between<B extends Nucleobase>(base1: B, base2: B): StraightBond<B> {
    let line = (new SVG.Line()).node;
    let sb = new StraightBond(line, base1, base2);

    sb.assignUUID();

    sb.set(StraightBond.defaults);

    // to make sure that the newly created straight bond is positioned properly
    sb.reposition();

    return sb;
  }

  private cachedBasePadding1: number;
  private cachedBasePadding2: number;

  /**
   * Note that this constructor will not apply any default values to the newly created straight bond.
   *
   * @param line The line element that is the straight bond.
   * @param base1 Base 1 connected by the bond.
   * @param base2 Base 2 connected by the bond.
   */
  constructor(private line: SVGLineElement, readonly base1: B, readonly base2: B) {
    this.cachedBasePadding1 = distance(this.point1, this.base1.centerPoint);
    this.cachedBasePadding2 = distance(this.point2, this.base2.centerPoint);

    base1.addEventListener('move', () => this.reposition());
    base2.addEventListener('move', () => this.reposition());
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
    return this.cachedBasePadding1;
  }

  /**
   * Will reposition the straight bond.
   */
  set basePadding1(basePadding1) {
    this.cachedBasePadding1 = basePadding1;
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
    return this.cachedBasePadding2;
  }

  /**
   * Will reposition the straight bond.
   */
  set basePadding2(basePadding2) {
    this.cachedBasePadding2 = basePadding2;
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
  reposition(): void {
    let centerPoint1 = this.base1.centerPoint;
    let centerPoint2 = this.base2.centerPoint;

    let a = direction(centerPoint1, centerPoint2);

    this.setAttribute('x1', `${centerPoint1.x + (this.basePadding1 * Math.cos(a))}`);
    this.setAttribute('y1', `${centerPoint1.y + (this.basePadding1 * Math.sin(a))}`);
    this.setAttribute('x2', `${centerPoint2.x - (this.basePadding2 * Math.cos(a))}`);
    this.setAttribute('y2', `${centerPoint2.y - (this.basePadding2 * Math.sin(a))}`);
  }

  /**
   * Signals to the straight bond that bases have moved,
   * causing necessary follow-up actions to be performed
   * (e.g., repositioning the straight bond).
   */
  basesMoved(): void {
    this.reposition();
  }

  /**
   * Signals to the straight bond that bases have been removed,
   * causing necessary follow-up actions to be performed.
   *
   * If either base 1 or 2 of the straight bond lacks a parent container node (i.e., was removed),
   * then the straight bond will remove itself from any parent container node that it is in.
   */
  basesRemoved(): void {
    if (!this.base1.hasParent() || !this.base2.hasParent()) {
      this.remove();
    }
  }
}
