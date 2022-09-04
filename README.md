# decimal-js

**decimal-js** is a JavaScript module for arbitrary precision decimal arithmetic.
It provides two immutable classes, `Decimal` and `Rational`, that are chainable.
It is implemented with `BigInt`, so there are no dependencies for arbitrary precision integers.

## Examples

### Instantiation

`decimal.js` exports `d`, a tag function for instantiating a `Decimal`.
It is preferred over the constructor.

```js
import assert from 'assert';
import { d, Decimal } from './index.js';

assert(d`3.14`.equalTo(new Decimal(314n, 2n)));
```

### Chaining

Most methods return a `Decimal` and accept multiple arguments.
The following computes `Math.sign(Math.abs((0.1 + 0.2 - 0.3 - 10) * 2 + 0.1 + 0.1))`.

```js
import assert from 'assert';
import { d } from './index.js';

assert(
	d`0.1`
		.plus(d`0.2`)
		.minus(d`0.3`, d`10`)
		.times(d`2`)
		.plus(d`0.1`, d`0.1`)
		.abs()
		.sign()
	=== 1n
);
```

### Lossless Division

`Decimal` is converted into `Rational` when dividing.
`Decimal` can be converted to `Rational` without precision loss but not the other way around.

```js
import assert from 'assert';
import { d, r } from './index.js';

assert(d`1`.dividedBy(d`3`).equalTo(r`1/3`));
assert(!d`1`.dividedBy(d`3`).toDecimal().toRational().equalTo(r`1/3`));
```

## Comparison with `Number`

| (index)  | 0.1  | 0.2  | 0.1 + 0.2           | 0.3  | 0.1 + 0.2 = 0.3 |
| -------- | ---- | ---- | ------------------- | ---- | --------------- |
| Number   | 0.1  | 0.2  | 0.30000000000000004 | 0.3  | false           |
| Decimal  | 0.1  | 0.2  | 0.3                 | 0.3  | true            |
| Rational | 1/10 | 2/10 | 3/10                | 3/10 | true            |

```js
import { d, r } from './index.js';

console.table({
	Number: {
		'0.1': 0.1,
		'0.2': 0.2,
		'0.1 + 0.2': 0.1 + 0.2,
		'0.3': 0.3,
		'0.1 + 0.2 = 0.3': 0.1 + 0.2 === 0.3
	},
	Decimal: {
		'0.1': d`0.1`,
		'0.2': d`0.2`,
		'0.1 + 0.2': d`0.1`.plus(d`0.2`),
		'0.3': d`0.3`,
		'0.1 + 0.2 = 0.3': d`0.1`.plus(d`0.2`).equalTo(d`0.3`)
	},
	Rational: {
		'0.1': r`1/10`,
		'0.2': r`2/10`,
		'0.1 + 0.2': r`1/10`.plus(r`2/10`),
		'0.3': r`3/10`,
		'0.1 + 0.2 = 0.3': r`1/10`.plus(r`2/10`).equalTo(r`3/10`)
	}
});
```
