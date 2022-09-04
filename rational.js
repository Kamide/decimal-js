import { Decimal } from './decimal.js';
import { abs, greatestCommonDivisor, Integer, isTerminating, leastCommonMultiple, sign } from './integer.js';

export class Rational {
	// #region properties

	#numerator;
	#denominator;

	/**
	 * @param {import('./integer.js').IntegerLike} [numerator]
	 * @param {import('./integer.js').IntegerLike} [denominator] > 0n
	 */
	constructor(numerator = 0n, denominator = 1n) {
		this.#numerator = Integer(numerator);
		this.#denominator = Integer(denominator);

		if (this.denominator <= 0n) {
			throw new RangeError(`Rational denominator must be greater than zero, received ${denominator}.`, { cause: { denominator } });
		}
	}

	get numerator() { return this.#numerator; }
	get denominator() { return this.#denominator; }

	// #endregion

	// #region arithmetic

	plus(/**@type {Rational[]}*/...those) {
		let { numerator, denominator } = this;

		for (const that of those) {
			const lcm = leastCommonMultiple(denominator, that.denominator);
			const u = lcm / denominator;
			const v = lcm / that.denominator;
			numerator = numerator * u + that.numerator * v;
			denominator *= u;
		}

		return new Rational(numerator, denominator);
	}

	minus(/**@type {Rational[]}*/...those) {
		let { numerator, denominator } = this;

		for (const that of those) {
			const lcm = leastCommonMultiple(denominator, that.denominator);
			const factor = lcm / denominator;
			numerator = numerator * factor - that.numerator * lcm / that.denominator;
			denominator *= factor;
		}

		return new Rational(numerator, denominator);
	}

	times(/**@type {Rational[]}*/...those) {
		let { numerator, denominator } = this;

		for (const that of those) {
			numerator *= that.numerator;
			denominator *= that.denominator;
		}

		return new Rational(numerator, denominator);
	}

	dividedBy(/**@type {Rational[]}*/...those) {
		let { numerator, denominator } = this;

		for (const that of those) {
			if (that.numerator > 0n) {
				numerator *= that.denominator;
				denominator *= that.numerator;
			}
			else if (that.numerator < 0n) {
				numerator *= -that.denominator;
				denominator *= -that.numerator;
			}
			else {
				throw new RangeError(`Rational cannot divide by zero, received ${new Rational(numerator, denominator)} and ${that}.`);
			}
		}

		return new Rational(numerator, denominator);
	}

	simplify() {
		const gcd = greatestCommonDivisor(this.numerator, this.denominator);
		return new Rational(this.numerator / gcd, this.denominator / gcd);
	}

	inverse() {
		if (this.numerator >= 0n) {
			return new Rational(this.denominator, this.numerator);
		}
		else {
			return new Rational(-this.denominator, -this.numerator);
		}
	}

	negation() {
		return new Rational(-this.numerator, this.denominator);
	}

	abs() {
		return new Rational(abs(this.numerator), this.denominator);
	}

	sign() {
		return sign(this.numerator);
	}

	// #endregion

	// #region comparison

	compare(/**@type {Rational}*/that, /**@type {(x: Rational, y: Rational) => boolean}*/predicate) {
		const lcm = leastCommonMultiple(this.denominator, that.denominator);
		const u = lcm / this.denominator;
		const v = lcm / that.denominator;
		const x = this.times(new Rational(u, u));
		const y = that.times(new Rational(v, v));
		return predicate(x, y);
	}

	equalTo(/**@type {Rational}*/that) {
		return this.compare(that, (x, y) => x.numerator === y.numerator);
	}

	lessThan(/**@type {Rational}*/that) {
		return this.compare(that, (x, y) => x.numerator < y.numerator);
	}

	lessThanOrEqualTo(/**@type {Rational}*/that) {
		return this.compare(that, (x, y) => x.numerator <= y.numerator);
	}

	greaterThan(/**@type {Rational}*/that) {
		return this.compare(that, (x, y) => x.numerator > y.numerator);
	}

	greaterThanEqualTo(/**@type {Rational}*/that) {
		return this.compare(that, (x, y) => x.numerator >= y.numerator);
	}

	max(/**@type {Rational}*/that) {
		return this.greaterThan(that) ? this : that;
	}

	min(/**@type {Rational}*/that) {
		return this.lessThan(that) ? this : that;
	}

	// #endregion

	// #region conversion

	toString() {
		return this.numerator + '/' + this.denominator;
	}

	static fromString(/**@type {string}*/string) {
		const [numerator, denominator = '1'] = string.split('/');
		return new Rational(Integer(numerator), Integer(denominator));
	}

	valueOf() {
		return this.toDecimal().valueOf();
	}

	toDecimal(/**@type {import('./integer.js').IntegerLike}*/scale = 16n) {
		const limit = isTerminating(10n, this.denominator) ? Infinity : Integer(scale);
		let digits = this.numerator / this.denominator;
		let remainder = this.numerator % this.denominator;
		let s = 0n;

		while (remainder !== 0n && s < limit) {
			digits *= 10n;
			digits += remainder * 10n / this.denominator;
			remainder = remainder * 10n % this.denominator;
			s++;
		}

		return new Decimal(digits, scale);
	}

	toJSON() {
		return {
			numerator: String(this.numerator),
			denominator: String(this.denominator)
		};
	}

	static fromJSON(json) {
		return new Rational(Integer(json.numerator), Integer(json.denominator));
	}

	/**
	 * @type {import('util').CustomInspectFunction}
	 */
	[Symbol.for('nodejs.util.inspect.custom')](depth, options) {
		return options.stylize(this.toString(), 'special');
	}

	get [Symbol.toStringTag]() {
		return Rational.name;
	}

	// #endregion
}

/**
 * Tag function for instantiating a {@link Rational}.
 * @param {TemplateStringsArray} strings
 * @returns {Rational}
 */
export function r([string]) {
	return Rational.fromString(string);
}
