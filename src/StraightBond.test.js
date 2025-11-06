/**
 * @jest-environment jsdom
 */

import { StraightBond } from './StraightBond';

import * as SVG from '@svgdotjs/svg.js';

import { NucleobaseMock } from './NucleobaseMock';

import { distance } from '@rnacanvas/points';

const SVGLineElement = (new SVG.Line()).node.constructor;

['x1', 'y1', 'x2', 'y2'].forEach(coordinateName => {
  if (!SVGLineElement.prototype[coordinateName]) {
    Object.defineProperty(SVGLineElement.prototype, coordinateName, {
      value: { baseVal: { value: 0 } },
      writable: true,
    });
  }
});

if (!SVGLineElement.prototype.getTotalLength) {
  SVGLineElement.prototype.getTotalLength = () => 0;
}

if (!SVGLineElement.prototype.getPointAtLength) {
  SVGLineElement.prototype.getPointAtLength = () => ({ x: 0, y: 0 });
}

function createSVGLineElement() {
  return (new SVG.Line()).node;
}

describe('StraightBond class', () => {
  describe('between static method', () => {
    it('passes bases 1 and 2 to the newly created straight bond in the correct order', () => {
      let base1 = new NucleobaseMock();
      let base2 = new NucleobaseMock();
      let sb = StraightBond.between(base1, base2);

      expect(sb.base1).toBe(base1);
      expect(sb.base2).toBe(base2);

      expect(base1).toBeTruthy();
      expect(base2).toBeTruthy();
    });

    it('assigns a UUID to the newly created straight bond', () => {
      let sb = StraightBond.between(new NucleobaseMock(), new NucleobaseMock());
      expect(sb.id.length).toBeGreaterThanOrEqual(36);
    });

    it('positions the newly created straight bond', () => {
      let base1 = new NucleobaseMock();
      let base2 = new NucleobaseMock();

      base1.centerPoint.set({ x: 512.8, y: 88.7 });
      base2.centerPoint.set({ x: -102.4, y: -33 });

      let sb = StraightBond.between(base1, base2);

      expect(Number.parseFloat(sb.getAttribute('x1'))).toBeCloseTo(506.9140633847461);
      expect(Number.parseFloat(sb.getAttribute('y1'))).toBeCloseTo(87.53563315007088);
      expect(Number.parseFloat(sb.getAttribute('x2'))).toBeCloseTo(-96.51406338474614);
      expect(Number.parseFloat(sb.getAttribute('y2'))).toBeCloseTo(-31.835633150070876);
    });
  });

  test('`constructor()`', () => {
    let drawing = new DrawingMock();

    let domNode = document.createElementNS('http://www.w3.org/2000/svg', 'line');

    let base1 = [...drawing.bases][4];
    let base2 = [...drawing.bases][8];

    expect(base1).toBeTruthy();
    expect(base2).toBeTruthy();

    var sb = new StraightBond(domNode, base1, base2);

    expect(sb.domNode).toBe(domNode);
    expect(sb.base1).toBe(base1);
    expect(sb.base2).toBe(base2);

    domNode.x1 = { baseVal: { value: 8.34 } };
    domNode.y1 = { baseVal: { value: -80 } };
    domNode.x2 = { baseVal: { value: 123 } };
    domNode.y2 = { baseVal: { value: 62 } };

    base1.centerPoint.x = 20;
    base1.centerPoint.y = 5;
    base2.centerPoint.x = 101;
    base2.centerPoint.y = 98.1;

    domNode.removeAttribute('data-base-padding1');
    domNode.removeAttribute('data-base-padding2');

    var sb = new StraightBond(domNode, base1, base2);

    // calculates and caches base paddings (when not already cached)
    expect(Number.parseFloat(domNode.dataset.basePadding1)).toBeCloseTo(85.79601156230981, 6);
    expect(Number.parseFloat(domNode.dataset.basePadding2)).toBeCloseTo(42.27540656220824, 6);

    // does not override already cached base paddings
    domNode.dataset.basePadding1 = '7.871924';
    domNode.dataset.basePadding2 = '-18.3194';

    var sb = new StraightBond(domNode, base1, base2);

    expect(Number.parseFloat(domNode.dataset.basePadding1)).toBe(7.871924);
    expect(Number.parseFloat(domNode.dataset.basePadding2)).toBe(-18.3194);

    domNode.removeAttribute('x1');
    domNode.removeAttribute('y1');

    // sets up a listener for base 1 movement
    base1.centerPoint.x += 20;

    expect(domNode.getAttribute('x1')).toBeTruthy();
    expect(domNode.getAttribute('y1')).toBeTruthy();

    domNode.removeAttribute('x2');
    domNode.removeAttribute('y2');

    // sets up a listener for base 2 movement
    base2.centerPoint.y -= 10;

    expect(domNode.getAttribute('x2')).toBeTruthy();
    expect(domNode.getAttribute('y2')).toBeTruthy();
  });

  test('basePair getter', () => {
    let base1 = new NucleobaseMock();
    let base2 = new NucleobaseMock();

    let sb = StraightBond.between(base1, base2);

    expect(sb.basePair).toStrictEqual([base1, base2]);
    expect(sb.basePair[0]).toBe(base1);
    expect(sb.basePair[1]).toBe(base2);
  });

  test('domNode getter', () => {
    let line = createSVGLineElement();

    let sb = new StraightBond(line, new NucleobaseMock(), new NucleobaseMock());

    expect(sb.domNode).toBe(line);
    expect(line).toBeTruthy();
  });

  test('getAttribute method', () => {
    let line = createSVGLineElement();

    let sb = new StraightBond(line, new NucleobaseMock(), new NucleobaseMock());

    line.setAttribute('stroke', '#5567ab');
    line.setAttribute('stroke-width', '2.63');

    expect(sb.getAttribute('stroke')).toBe('#5567ab');
    expect(sb.getAttribute('stroke-width')).toBe('2.63');
  });

  test('setAttribute method', () => {
    let line = createSVGLineElement();

    let sb = new StraightBond(line, new NucleobaseMock(), new NucleobaseMock());

    sb.setAttribute('stroke', '#72bf89');
    sb.setAttribute('stroke-linecap', 'round');

    expect(line.getAttribute('stroke')).toBe('#72bf89');
    expect(line.getAttribute('stroke-linecap')).toBe('round');
  });

  describe('setAttributes method', () => {
    it('sets attributes', () => {
      let sb = StraightBond.between(new NucleobaseMock(), new NucleobaseMock());

      sb.setAttributes({ 'stroke': '#ee52bc', 'stroke-width': '8.27', 'stroke-dasharray': '2 3.1 5 5' });

      expect(sb.line.getAttribute('stroke')).toBe('#ee52bc');
      expect(sb.line.getAttribute('stroke-width')).toBe('8.27');
      expect(sb.line.getAttribute('stroke-dasharray')).toBe('2 3.1 5 5');
    });

    test('invalid inputs', () => {
      let sb = StraightBond.between(new NucleobaseMock(), new NucleobaseMock());

      expect(() => sb.setAttributes({ 'asdf': false })).not.toThrow();
      expect(() => sb.setAttributes(null)).not.toThrow();
      expect(() => sb.setAttributes('qwer')).not.toThrow();
    });
  });

  describe('id getter', () => {
    it('returns the ID of the line element that is the straight bond', () => {
      let line = createSVGLineElement();

      line.setAttribute('id', 'line-38147827491827492');

      let sb = new StraightBond(line, new NucleobaseMock(), new NucleobaseMock());
      expect(sb.id).toBe('line-38147827491827492');
    });

    /**
     * Note that the `id` method provided by the SVG.js library for SVG elements
     * will auto-initialize IDs.
     */
    it('does not auto-initialize the ID', () => {
      let line = createSVGLineElement();
      expect(line.getAttribute('id')).toBeFalsy();

      let sb = new StraightBond(line, new NucleobaseMock(), new NucleobaseMock());
      expect(sb.id).toBeFalsy();

      // is still falsy too
      expect(line.getAttribute('id')).toBeFalsy();
    });
  });

  test('assignUUID method', () => {
    let sb = new StraightBond(createSVGLineElement(), new NucleobaseMock(), new NucleobaseMock());
    expect(sb.id).toBeFalsy();

    sb.assignUUID();
    expect(sb.id.length).toBeGreaterThanOrEqual(36);

    // must begin with a letter (per the rules for SVG element IDs)
    expect(sb.id.charAt(0)).toMatch(/[A-Za-z]/);
  });

  test('appendTo method', () => {
    let line = createSVGLineElement();
    let sb = new StraightBond(line, new NucleobaseMock(), new NucleobaseMock());

    let container = (new SVG.Svg()).node;

    expect(container.contains(line)).toBeFalsy();
    sb.appendTo(container);
    expect(container.contains(line)).toBeTruthy();
  });

  test('remove method', () => {
    let line = createSVGLineElement();
    let sb = new StraightBond(line, new NucleobaseMock(), new NucleobaseMock());

    let container = (new SVG.Svg()).node;
    sb.appendTo(container);

    expect(container.contains(line)).toBeTruthy();
    sb.remove();
    expect(container.contains(line)).toBeFalsy();
  });

  test('isIn method', () => {
    let line = createSVGLineElement();
    let sb = new StraightBond(line, new NucleobaseMock(), new NucleobaseMock());

    let container1 = (new SVG.Svg()).node;
    let container2 = (new SVG.Svg()).node;

    sb.appendTo(container1);

    expect(sb.isIn(container1)).toBe(true);
    expect(sb.isIn(container2)).toBe(false);

    // also worth checking
    // (since the `contains` method of nodes will return true for the node itself)
    expect(sb.isIn(line)).toBe(false);
  });

  test('hasParent method', () => {
    let sb = StraightBond.between(new NucleobaseMock(), new NucleobaseMock());
    expect(sb.hasParent()).toBe(false);

    let container1 = (new SVG.Svg()).node;
    sb.appendTo(container1);
    expect(sb.hasParent()).toBe(true);

    sb.remove();
    expect(sb.hasParent()).toBe(false);

    // without calling any sort of append/insert method of the straight bond directly
    let container2 = (new SVG.Svg()).node;
    container2.appendChild(sb.domNode);
    expect(sb.hasParent()).toBe(true);
  });

  test('getTotalLength method', () => {
    let line = createSVGLineElement();
    line.getTotalLength = () => 18.0273994;

    let sb = new StraightBond(line, new NucleobaseMock(), new NucleobaseMock());
    expect(sb.getTotalLength()).toBe(18.0273994);
  });

  test('getPointAtLength method', () => {
    let line = createSVGLineElement();
    line.getPointAtLength = length => length === 17.48 ? { x: 84.02, y: -12.338 } : { x: 0, y: 0 };

    let sb = new StraightBond(line, new NucleobaseMock(), new NucleobaseMock());

    expect(sb.getPointAtLength(17.48)).toStrictEqual({ x: 84.02, y: -12.338 });
  });

  describe('point1 getter', () => {
    it('returns point 1', () => {
      let line = createSVGLineElement();

      line.x1 = { baseVal: { value: 15.3819 } };
      line.y1 = { baseVal: { value: -82.3718 } };

      let sb = new StraightBond(line, new NucleobaseMock(), new NucleobaseMock());
      expect(sb.point1).toStrictEqual({ x: 15.3819, y: -82.3718 });
    });

    /**
     * The `getPointAtLength` method might throw if the straight bond has not been added to the document
     * of the webpage.
     */
    it('does not use getPointAtLength method', () => {
      let line = createSVGLineElement();
      line.getPointAtLength = jest.fn();

      let sb = new StraightBond(line, new NucleobaseMock(), new NucleobaseMock());

      // access
      sb.point1;

      expect(line.getPointAtLength).not.toHaveBeenCalled();
    });
  });

  describe('point2 getter', () => {
    it('returns point 2', () => {
      let line = createSVGLineElement();

      line.x2 = { baseVal: { value: -9927.3 } };
      line.y2 = { baseVal: { value: 48791.3 } };

      let sb = new StraightBond(line, new NucleobaseMock(), new NucleobaseMock());
      expect(sb.point2).toStrictEqual({ x: -9927.3, y: 48791.3 });
    });

    /**
     * The `getPointAtLength` and `getTotalLength` methods might throw if the straight bond has not been added
     * to the document of the webpage.
     */
    it('does not use getPointAtLength or getTotalLength methods', () => {
      let line = createSVGLineElement();

      line.getPointAtLength = jest.fn();
      line.getTotalLength = jest.fn();

      let sb = new StraightBond(line, new NucleobaseMock(), new NucleobaseMock());

      // access
      sb.point2;

      expect(line.getPointAtLength).not.toHaveBeenCalled();
      expect(line.getTotalLength).not.toHaveBeenCalled();
    });
  });

  test('basePadding1 getter and setter', () => {
    let line = createSVGLineElement();

    line.x1 = { baseVal: { value: 18 } };
    line.y1 = { baseVal: { value: 5 } };
    line.x2 = { baseVal: { value: 37 } };
    line.y2 = { baseVal: { value: 5 } };

    let base1 = new NucleobaseMock();
    let base2 = new NucleobaseMock();

    base1.centerPoint.set({ x: 15, y: 5 });
    base2.centerPoint.set({ x: 45, y: 5 });

    let sb = new StraightBond(line, base1, base2);
    expect(sb.basePadding1).toBeCloseTo(3);

    // must account for the movement of base 1
    base1.centerPoint.set({ x: 45, y: 50 });

    // has not changed yet
    expect(sb.basePadding1).toBeCloseTo(3);

    sb.basePadding1 = 7;
    expect(sb.basePadding1).toBeCloseTo(7);

    expect(Number.parseFloat(sb.getAttribute('x1'))).toBeCloseTo(45);
    expect(Number.parseFloat(sb.getAttribute('y1'))).toBeCloseTo(43);
    expect(Number.parseFloat(sb.getAttribute('x2'))).toBeCloseTo(45);
    expect(Number.parseFloat(sb.getAttribute('y2'))).toBeCloseTo(13);

    // converts nonfinite values to zero
    sb.domNode.dataset.basePadding1 = 'asdf';
    expect(sb.basePadding1).toBe(0);
  });

  describe('setBasePadding1 method', () => {
    let sb = null;

    beforeEach(() => {
      sb = StraightBond.between(new NucleobaseMock(), new NucleobaseMock());
    });

    it('sets base padding 1', () => {
      sb.setBasePadding1(57.096);
      expect(sb.basePadding1).toBeCloseTo(57.096);
    });

    it('ignores values that are not finite numbers', () => {
      sb.basePadding1 = 12.08;

      sb.setBasePadding1(NaN);
      sb.setBasePadding1(Infinity);
      sb.setBasePadding1('5');
      sb.setBasePadding1(true);
      sb.setBasePadding1({});
      sb.setBasePadding1(null);
      sb.setBasePadding1(undefined);

      expect(sb.basePadding1).toBeCloseTo(12.08);
    });

    it('clamps negative values to zero', () => {
      sb.basePadding1 = 18;
      expect(sb.basePadding1).toBeCloseTo(18);

      sb.setBasePadding1(-10);
      expect(sb.basePadding1).toBeCloseTo(0);
    });
  });

  test('basePadding2 getter and setter', () => {
    let line = createSVGLineElement();

    line.x1 = { baseVal: { value: 9 } };
    line.y1 = { baseVal: { value: -6 } };
    line.x2 = { baseVal: { value: 9 } };
    line.y2 = { baseVal: { value: 24 } };

    let base1 = new NucleobaseMock();
    let base2 = new NucleobaseMock();

    base1.centerPoint.set({ x: 9, y: -8 });
    base2.centerPoint.set({ x: 9, y: 30 });

    let sb = new StraightBond(line, base1, base2);
    expect(sb.basePadding2).toBeCloseTo(6);

    // must account for the movement of base 2
    base2.centerPoint.set({ x: -30, y: -8 });

    // has not changed yet
    expect(sb.basePadding2).toBeCloseTo(6);

    sb.basePadding2 = 10.5;
    expect(sb.basePadding2).toBeCloseTo(10.5);

    expect(Number.parseFloat(sb.getAttribute('x1'))).toBeCloseTo(7);
    expect(Number.parseFloat(sb.getAttribute('y1'))).toBeCloseTo(-8);
    expect(Number.parseFloat(sb.getAttribute('x2'))).toBeCloseTo(-19.5);
    expect(Number.parseFloat(sb.getAttribute('y2'))).toBeCloseTo(-8);

    // converts nonfinite values to zero
    sb.domNode.dataset.basePadding2 = 'asdf';
    expect(sb.basePadding2).toBe(0);
  });

  describe('setBasePadding2 method', () => {
    it('sets base padding 2', () => {
      let sb = StraightBond.between(new NucleobaseMock(), new NucleobaseMock());

      sb.setBasePadding2(88.291);
      expect(sb.basePadding2).toBeCloseTo(88.291);
    });

    it('ignores values that are not finite numbers', () => {
      let sb = StraightBond.between(new NucleobaseMock(), new NucleobaseMock());

      sb.basePadding2 = 23.81;

      sb.setBasePadding2(NaN);
      sb.setBasePadding2(Infinity);
      sb.setBasePadding2('12');
      sb.setBasePadding2(true);
      sb.setBasePadding2({});
      sb.setBasePadding2(null);
      sb.setBasePadding2(undefined);

      expect(sb.basePadding2).toBeCloseTo(23.81);
    });

    it('clamps negative values to zero', () => {
      let sb = StraightBond.between(new NucleobaseMock(), new NucleobaseMock());

      sb.basePadding2 = 15;
      expect(sb.basePadding2).toBeCloseTo(15);

      sb.setBasePadding2(-12);
      expect(sb.basePadding2).toBeCloseTo(0);
    });
  });

  test('isInverted method', () => {
    let base1 = new NucleobaseMock();
    let base2 = new NucleobaseMock();

    base1.centerPoint.set({ x: 60, y: 10 });
    base2.centerPoint.set({ x: 68, y: -5 });
    expect(distance(base1.centerPoint, base2.centerPoint)).toBeCloseTo(17);

    let sb = StraightBond.between(base1, base2);

    sb.basePadding1 = 4;
    sb.basePadding2 = 6;
    expect(sb.isInverted()).toBe(false);

    sb.basePadding1 = 15;
    sb.basePadding2 = 6;
    expect(sb.isInverted()).toBe(true);
  });

  test('set method', () => {
    let sb = StraightBond.between(new NucleobaseMock(), new NucleobaseMock());

    // sets attributes
    sb.set({ attributes: { 'stroke': '#ab598d', 'stroke-width': '8.15' } });
    expect(sb.domNode.getAttribute('stroke')).toBe('#ab598d');
    expect(sb.domNode.getAttribute('stroke-width')).toBe('8.15');

    // sets properties
    sb.set({ basePadding1: 8.719, basePadding2: 15.42 });
    expect(sb.basePadding1).toBeCloseTo(8.719);
    expect(sb.basePadding2).toBeCloseTo(15.42);
  });

  test('`serialized()`', () => {
    let sb = StraightBond.between(new NucleobaseMock(), new NucleobaseMock());

    sb.domNode.id = 'id-7851826';
    expect(sb.serialized().id).toBe('id-7851826');

    sb.base1.id = 'id-869172';
    sb.base2.id = 'id-0316824';
    expect(sb.serialized().baseID1).toBe('id-869172');
    expect(sb.serialized().baseID2).toBe('id-0316824');
  });

  test('`static deserialized()`', () => {
    let parentDrawing = new DrawingMock();

    expect(parentDrawing.bases.length).toBeGreaterThanOrEqual(8);
    let base1 = parentDrawing.bases[6];
    let base2 = parentDrawing.bases[3];

    let sb1 = StraightBond.between(base1, base2);

    expect(parentDrawing.domNode.childNodes.length).toBeGreaterThanOrEqual(8);
    parentDrawing.domNode.insertBefore(sb1.domNode, parentDrawing.domNode.childNodes[5]);

    sb1.basePadding1 = 12.7846174;
    sb1.basePadding2 = 4.76824;

    // JSDOM does not define `SVGLineElement`
    expect(globalThis.SVGLineElement).toBeFalsy();
    globalThis.SVGLineElement = SVGElement;

    let sb2 = StraightBond.deserialized(sb1.serialized(), parentDrawing);

    expect(sb2.domNode).toBe(sb1.domNode);

    expect(sb2.base1).toBe(sb1.base1);
    expect(sb2.base2).toBe(sb1.base2);

    expect(sb2.basePadding1).toBeCloseTo(12.7846174);
    expect(sb2.basePadding2).toBeCloseTo(4.76824);

    // straight bond IDs used to be saved under `lineId`
    sb2 = StraightBond.deserialized({ ...sb1.serialized(), id: undefined, lineId: sb1.id }, parentDrawing);
    expect(sb2.domNode).toBe(sb1.domNode);

    // base ID 1 used to be saved under `baseId1`
    sb2 = StraightBond.deserialized({ ...sb1.serialized(), baseID1: undefined, baseId1: sb1.base1.id }, parentDrawing);
    expect(sb2.base1).toBe(sb1.base1);

    // base ID 2 used to be saved under `baseId2`
    sb2 = StraightBond.deserialized({ ...sb1.serialized(), baseID2: undefined, baseId2: sb1.base2.id }, parentDrawing);
    expect(sb2.base2).toBe(sb1.base2);

    // base paddings used to be saved as JSON properties
    sb2 = StraightBond.deserialized({ ...sb1.serialized(), basePadding1: -8.735814, basePadding2: 65.41487 }, parentDrawing);

    expect(sb2.basePadding1).toBeCloseTo(-8.735814, 6);
    expect(sb2.basePadding2).toBeCloseTo(65.41487, 6);
  });
});

class DrawingMock {
  bases = [
    new NucleobaseMock(),
    new NucleobaseMock(),
    new NucleobaseMock(),
    new NucleobaseMock(),
    new NucleobaseMock(),
    new NucleobaseMock(),
    new NucleobaseMock(),
    new NucleobaseMock(),
    new NucleobaseMock(),
    new NucleobaseMock(),
  ];

  constructor() {
    this.domNode = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

    this.domNode.append(document.createElementNS('http://www.w3.org/2000/svg', 'text'));
    this.domNode.append(document.createElementNS('http://www.w3.org/2000/svg', 'text'));
    this.domNode.append(document.createElementNS('http://www.w3.org/2000/svg', 'path'));
    this.domNode.append(document.createElementNS('http://www.w3.org/2000/svg', 'text'));
    this.domNode.append(document.createElementNS('http://www.w3.org/2000/svg', 'text'));
    this.domNode.append(document.createElementNS('http://www.w3.org/2000/svg', 'circle'));
    this.domNode.append(document.createElementNS('http://www.w3.org/2000/svg', 'text'));
    this.domNode.append(document.createElementNS('http://www.w3.org/2000/svg', 'text'));
    this.domNode.append(document.createElementNS('http://www.w3.org/2000/svg', 'ellipse'));
    this.domNode.append(document.createElementNS('http://www.w3.org/2000/svg', 'rect'));
    this.domNode.append(document.createElementNS('http://www.w3.org/2000/svg', 'text'));
  }
}
