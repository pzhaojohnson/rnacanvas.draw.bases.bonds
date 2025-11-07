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
