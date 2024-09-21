/**
 * @jest-environment jsdom
 */

import { SavedStraightBond } from './SavedStraightBond';

import { NucleobaseMock } from './NucleobaseMock';

const SVGLineElementMock = {
  create: () => {
    let line = document.createElementNS('http://www.w3.org/2000/svg', 'line');

    line.x1 = { baseVal: { value: 0 } };
    line.y1 = { baseVal: { value: 0 } };
    line.x2 = { baseVal: { value: 0 } };
    line.y2 = { baseVal: { value: 0 } };

    return line;
  },
}

class DrawingMock {
  domNode = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

  bases = [];
}

let jsonSerializable = null;

let parentDrawing = null;

let id = null;

let domNode = null;

beforeEach(() => {
  window.SVGLineElement = SVGElement;

  parentDrawing = new DrawingMock();

  parentDrawing.domNode.append(document.createElementNS('http://www.w3.org/2000/svg', 'text'));
  parentDrawing.domNode.append(document.createElementNS('http://www.w3.org/2000/svg', 'circle'));
  parentDrawing.domNode.append(document.createElementNS('http://www.w3.org/2000/svg', 'line'));
  parentDrawing.domNode.append(document.createElementNS('http://www.w3.org/2000/svg', 'line'));
  parentDrawing.domNode.append(document.createElementNS('http://www.w3.org/2000/svg', 'text'));
  parentDrawing.domNode.append(document.createElementNS('http://www.w3.org/2000/svg', 'ellipse'));
  parentDrawing.domNode.append(document.createElementNS('http://www.w3.org/2000/svg', 'line'));
  parentDrawing.domNode.append(document.createElementNS('http://www.w3.org/2000/svg', 'text'));
  parentDrawing.domNode.append(document.createElementNS('http://www.w3.org/2000/svg', 'ellipse'));
  parentDrawing.domNode.append(document.createElementNS('http://www.w3.org/2000/svg', 'line'));

  for (let i = 0; i < 10; i++) {
    parentDrawing.bases.push(new NucleobaseMock());
  }

  id = 'id-18949182u9812u4918u42';

  domNode = SVGLineElementMock.create();
  domNode.id = id;

  parentDrawing.domNode.insertBefore(domNode, parentDrawing.domNode.childNodes[5]);

  jsonSerializable = {
    id,
    baseID1: parentDrawing.bases[0].id,
    baseID2: parentDrawing.bases[1].id,
  };
});

afterEach(() => {
  jsonSerializable = null;

  parentDrawing = null;

  id = null;

  domNode = null;
});

describe('SavedStraightBond class', () => {
  describe('recreate method', () => {
    it('retrieves the DOM node of the straight bond', () => {
      let savedStraightBond = new SavedStraightBond(jsonSerializable, parentDrawing);

      expect(savedStraightBond.recreate().domNode).toBe(domNode);
      expect(domNode).toBeTruthy();
    });

    it('checks if the straight bond ID was saved under `lineId`', () => {
      expect(id).toBeTruthy();
      jsonSerializable.lineId = id;
      jsonSerializable.id = undefined;

      let savedStraightBond = new SavedStraightBond(jsonSerializable, parentDrawing);

      expect(savedStraightBond.recreate().domNode).toBe(domNode);
      expect(domNode).toBeTruthy();
    });

    it('throws if the straight bond ID was not saved', () => {
      jsonSerializable.id = undefined;

      let savedStraightBond = new SavedStraightBond(jsonSerializable, parentDrawing);

      expect(() => savedStraightBond.recreate()).toThrow();
    });

    it('throws if no DOM node in the drawing has the straight bond ID', () => {
      domNode.remove();

      let savedStraightBond = new SavedStraightBond(jsonSerializable, parentDrawing);
      expect(() => savedStraightBond.recreate()).toThrow();

      parentDrawing.domNode.insertBefore(domNode, parentDrawing.domNode.childNodes[2]);

      expect(() => savedStraightBond.recreate()).not.toThrow();
    });

    it('retrieves bases 1 and 2', () => {
      jsonSerializable.baseID1 = parentDrawing.bases[5].id;
      jsonSerializable.baseID2 = parentDrawing.bases[2].id;

      let savedStraightBond = new SavedStraightBond(jsonSerializable, parentDrawing);

      expect(savedStraightBond.recreate().base1).toBe(parentDrawing.bases[5]);
      expect(savedStraightBond.recreate().base2).toBe(parentDrawing.bases[2]);
    });

    it('checks if base IDs 1 and 2 were saved as `baseId1` or `baseId2`', () => {
      jsonSerializable.baseId1 = parentDrawing.bases[5].id;
      jsonSerializable.baseId2 = parentDrawing.bases[2].id;

      jsonSerializable.baseID1 = undefined;
      jsonSerializable.baseID2 = undefined;

      let savedStraightBond = new SavedStraightBond(jsonSerializable, parentDrawing);

      expect(savedStraightBond.recreate().base1).toBe(parentDrawing.bases[5]);
      expect(savedStraightBond.recreate().base2).toBe(parentDrawing.bases[2]);
    });

    it('throws if base IDs 1 or 2 do not belong to any bases', () => {
      let savedStraightBond = new SavedStraightBond(jsonSerializable, parentDrawing);

      jsonSerializable.baseID1 = 'id-918u49812rj83ur';
      jsonSerializable.baseID2 = parentDrawing.bases[2].id;
      expect(() => savedStraightBond.recreate()).toThrow();

      jsonSerializable.baseID1 = parentDrawing.bases[3].id;
      jsonSerializable.baseID2 = 'id-2981u4928u9812u';
      expect(() => savedStraightBond.recreate()).toThrow();
    });

    it('throws if either base ID 1 or 2 was not saved', () => {
      let savedStraightBond = new SavedStraightBond(jsonSerializable, parentDrawing);

      jsonSerializable.baseID1 = undefined;
      jsonSerializable.baseID2 = parentDrawing.bases[3].id;
      expect(() => savedStraightBond.recreate()).toThrow();

      jsonSerializable.baseID1 = parentDrawing.bases[2].id;
      jsonSerializable.baseID2 = undefined;
      expect(() => savedStraightBond.recreate()).toThrow();

      jsonSerializable.baseID1 = parentDrawing.bases[2].id;
      jsonSerializable.baseID2 = parentDrawing.bases[3].id;
      expect(() => savedStraightBond.recreate()).not.toThrow();
    });

    it('restores base paddings 1 and 2', () => {
      jsonSerializable.basePadding1 = 23.149119;
      jsonSerializable.basePadding2 = 32.3891;

      let savedStraightBond = new SavedStraightBond(jsonSerializable, parentDrawing);

      expect(savedStraightBond.recreate().basePadding1).toBeCloseTo(23.149119);
      expect(savedStraightBond.recreate().basePadding2).toBeCloseTo(32.3891);
    });

    it('does not modify base paddings if no base paddings were saved', () => {
      jsonSerializable.basePadding1 = undefined;
      jsonSerializable.basePadding2 = undefined;

      let savedStraightBond = new SavedStraightBond(jsonSerializable, parentDrawing);

      expect(savedStraightBond.recreate().basePadding1).toBe(0);
      expect(savedStraightBond.recreate().basePadding2).toBe(0);
    });
  });
});
