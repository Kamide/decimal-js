import { abs, Integer, max, sign } from './integer.js';
import { Rational } from './rational.js';

/**
 * Represents an arbitrary precision that of the form
 * ```js
 * 	digits * 10 ** -scale
 * ```
 * where `digits` is the signed integer representation
 * and `scale` is the number of decimal places.
 * @final
 */
export class Decimal {
	// #region properties

	#digits;
	#scale;

	/**
	 * @param {import('./integer.js').IntegerLike} [digits]
	 * @param {import('./integer.js').IntegerLike} [scale] >= 0n
	 */
	constructor(digits = 0n, scale = 0n) {
		this.#digits = Integer(digits);
		this.#scale = Integer(scale);

		if (this.scale < 0n) {
			throw new RangeError(`Decimal scale must be greater than or equal to zero, received ${scale}.`, { cause: { scale } });
		}
	}

	get digits() { return this.#digits; }
	get scale() { return this.#scale; }

	// #endregion

	// #region arithmetic

	plus(/**@type {Decimal[]}*/...those) {
		let { digits, scale } = this;

		for (const that of those) {
			if (scale > that.scale) {
				digits = digits
					+ that.digits * 10n ** (scale - that.scale);
			}
			else {
				digits = digits * 10n ** (that.scale - scale)
					+ that.digits;
				scale = that.scale;
			}
		}

		return new Decimal(digits, scale);
	}

	minus(/**@type {Decimal[]}*/...those) {
		let { digits, scale } = this;

		for (const that of those) {
			if (scale > that.scale) {
				digits = digits
					- that.digits * 10n ** (scale - that.scale);
			}
			else {
				digits = digits * 10n ** (that.scale - scale)
					- that.digits;
				scale = that.scale;
			}
		}

		return new Decimal(digits, scale);
	}

	times(/**@type {Decimal[]}*/...those) {
		let { digits, scale } = this;

		for (const that of those) {
			digits *= that.digits;
			scale += that.scale;
		}

		return new Decimal(digits, scale);
	}

	dividedBy(/**@type {Decimal[]}*/...those) {
		return this.toRational().dividedBy(...those.map(that => that.toRational()));
	}

	simplify() {
		let { digits, scale } = this;

		while (scale > 0n && digits % 10n === 0n) {
			digits /= 10n;
			scale--;
		}

		return new Decimal(digits, scale);
	}

	toScale(/**@type {import('./integer.js').IntegerLike}*/scale) {
		scale = Integer(scale);
		const difference = scale - this.scale;

		if (difference > 0n) {
			return new Decimal(this.digits * 10n ** difference, scale);
		}
		else if (difference < 0n) {
			return new Decimal(this.digits / 10n ** -difference, scale);
		}
		else {
			return this;
		}
	}

	inverse() {
		return this.toRational().inverse();
	}

	negation() {
		return new Decimal(-this.digits, this.scale);
	}

	abs() {
		return new Decimal(abs(this.digits), this.scale);
	}

	sign() {
		return sign(this.digits);
	}

	// #endregion

	// #region comparison

	compare(/**@type {Decimal}*/that, /**@type {(x: Decimal, y: Decimal) => boolean}*/predicate) {
		const scale = max(this.scale, that.scale);
		const x = this.toScale(scale);
		const y = that.toScale(scale);
		return predicate(x, y);
	}

	equalTo(/**@type {Decimal}*/that) {
		return this.compare(that, (x, y) => x.digits === y.digits);
	}

	lessThan(/**@type {Decimal}*/that) {
		return this.compare(that, (x, y) => x.digits < y.digits);
	}

	lessThanOrEqualTo(/**@type {Decimal}*/that) {
		return this.compare(that, (x, y) => x.digits <= y.digits);
	}

	greaterThan(/**@type {Decimal}*/that) {
		return this.compare(that, (x, y) => x.digits > y.digits);
	}

	greaterThanEqualTo(/**@type {Decimal}*/that) {
		return this.compare(that, (x, y) => x.digits >= y.digits);
	}

	max(/**@type {Decimal}*/that) {
		return this.greaterThan(that) ? this : that;
	}

	min(/**@type {Decimal}*/that) {
		return this.lessThan(that) ? this : that;
	}

	// #endregion

	// #region conversion

	toString() {
		let string = '';
		let digits = [...String(this.digits)];
		let scale = this.scale;

		while (scale > 0n) {
			string = (digits.at(-1) ?? '0') + string;
			digits.splice(-1, 1);
			scale--;

			if (scale === 0n) {
				string = '.' + string;
			}
		}

		if (digits.length === 0 || (digits.length === 1 && digits[0] === '-')) {
			digits.push('0');
		}

		string = digits.join('') + string;
		return string;
	}

	static fromString(/**@type {string}*/string) {
		let s = string.trim();
		const scale = s.includes('.') ? Integer(s.length - 1 - s.indexOf('.')) : 0n;
		s = s.replace('.', '');
		const digits = Integer(s);
		return new Decimal(digits, scale);
	}

	valueOf() {
		return Number(this.toString());
	}

	toRational() {
		return new Rational(this.digits, 10n ** this.scale);
	}

	toJSON() {
		return {
			digits: String(this.digits),
			scale: String(this.scale)
		};
	}

	static fromJSON(json) {
		return new Decimal(Integer(json.digits), Integer(json.scale));
	}

	/**
	 * @type {import('util').CustomInspectFunction}
	 */
	[Symbol.for('nodejs.util.inspect.custom')](depth, options) {
		return options.stylize(this.toString(), 'special');
	}

	get [Symbol.toStringTag]() {
		return Decimal.name;
	}

	// #endregion
}

/**
 * Tag function for instantiating a {@link Decimal}.
 * @param {TemplateStringsArray} strings
 * @returns {Decimal}
 */
export function d(strings) {
	return Decimal.fromString(strings[0]);
}
