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
});
