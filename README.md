# Installation

With `npm`:

```
npm install @rnacanvas/draw.bases.bonds
```

# Usage

All exports of this package can be accessed as named imports.

```javascript
// an example import
import { StraightBond } from '@rnacanvas/draw.bases.bonds';
```

## `class StraightBond`

A bond composed of an SVG line element
connecting two bases
(e.g., a primary or secondary bond).

### `readonly length`

The length of the line of a straight bond.

<b>Note that this property may not hold correct values
for straight bonds that have not been added to a drawing that is part of the document body.</b>

```javascript
// an RNAcanvas drawing
var drawing = new Drawing();

// add to the document body
document.body.append(drawing.domNode);

var base1 = drawing.addBase('A');
var base2 = drawing.addBase('U');

var sb = StraightBond.between(base1, base2);

// add to the drawing
drawing.domNode.append(sb.domNode);

base1.centerX = 0;
base1.centerY = 0;

base2.centerX = 10;
base2.centerY = 0;

sb.basePadding1 = 1;
sb.basePadding2 = 2;

sb.length; // 7
```

### `addEventListener()`

Can be used to listen for any changes to a straight bond.

```javascript
var base1 = Nucleobase.create('G');
var base2 = Nucleobase.create('C');

var sb = StraightBond.between(base1, base2);

// any function
var listener = () => {};

sb.addEventListener('change', listener);

sb.basePadding1 += 10; // listener called
sb.setAttribute('stroke', 'blue'); // listener called

// even direct DOM node manipulations are listened for
sb.domNode.setAttribute('stroke-width', '5'); // listener called
```

### `removeEventListener()`

Allows event listeners to be removed.

```javascript
var base1 = Nucleobase.create('A');
var base2 = Nucleobase.create('U');

var sb = StraightBond.between(base1, base2);

var listener = () => {};

sb.addEventListener('change', listener);
sb.basePadding1 += 10; // listener called

sb.removeEventListener('change', listener);
sb.basePadding1 += 10; // listener not called
```
