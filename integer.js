/**
 * @typedef {bigint | number | string} IntegerLike
 */

/**
 * Returns a `bigint` from an integerlike value.
 * Rejects floats, NaN, Infinity, empty strings, and booleans.
 * @param {IntegerLike} value
 * @returns {bigint}
 */
export function Integer(value) {
	let v = String(value).trim() || 'NaN';
	return BigInt(v);
}

export function max(/**@type {bigint}*/x, /**@type {bigint}*/y) {
	return x > y ? x : y;
}

export function min(/**@type {bigint}*/x, /**@type {bigint}*/y) {
	return x > y ? x : y;
}

export function abs(/**@type {bigint}*/n) {
	return n >= 0n ? n : -n;
}

/**
 * Returns 1 if positive, -1 if negative, or 0.
 * @param {bigint} n
 * @returns {bigint}
 */
export function sign(n) {
	if (n > 0n) {
		return 1n;
	}
	else if (n < 0n) {
		return -1n;
	}
	else {
		return 0n;
	}
}

/**
 * Implemented with Euclid's algorithm.
 * @param {bigint} x
 * @param {bigint} y
 * @returns {bigint}
 */
export function greatestCommonDivisor(x, y) {
	if (y === 0n) {
		return x;
	}
	return greatestCommonDivisor(y, x % y);
}

/**
 * Returns a positive integer.
 * @param {bigint} x
 * @param {bigint} y
 * @returns {bigint}
 */
export function leastCommonMultiple(x, y) {
	return x * y / greatestCommonDivisor(x, y);
}

export function* primeFactors(/**@type {bigint}*/dividend) {
	if (dividend < 0n) {
		dividend = -dividend;
	}

	let divisor = 2n;

	while (dividend >= 2n) {
		if (dividend % divisor === 0n) {
			yield divisor;
			dividend /= divisor;
		}
		else {
			divisor++;
		}
	}
}

export function distinctPrimeFactors(/**@type {bigint}*/dividend) {
	return new Set(primeFactors(dividend));
}

/**
* Returns `true` if
* ```js
* 	dividend / divisor
* ```
* is terminating.
* @param {bigint} dividend
* @param {bigint} divisor
* @returns {boolean}
*/
export function isTerminating(dividend, divisor) {
	const distinct = distinctPrimeFactors(dividend);

	for (const primeFactor of primeFactors(divisor)) {
		if (!distinct.has(primeFactor)) {
			return false;
		}
	}

	return true;
}
