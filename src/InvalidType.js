import Exception from './Exception.js';

/**
 * Thrown to indicate that the type of a value isn't expected.
 *
 * @example <caption>Basic Usage</caption>
 * function greet(name) {
 *   var checked = InvalidType.check(name, 'string');
 *   alert('Hello, ' + checked);
 * }
 * greet('John'); // "Hello, John"
 * greet(1234);   // Throws: "unexpected type of value ..."
 *
 * @example <caption>Multiple Expectations</caption>
 * var value = 'ABC';
 * InvalidType.check(value, 'boolean', 'string', 'object'); // OK
 *
 * @example <caption>Class Checking</caption>
 * class Beagle extends Dog {
 *   ...
 * }
 * var oliver = new Beagle();
 * InvalidType.check(oliver, Dog);      // OK
 * InvalidType.check(oliver, Beagle);   // OK
 * InvalidType.check(oliver, ShibaInu); // Throws
 *
 * @example <caption>Using .info for debug inside 'catch'</caption>
 * value = 123;
 * try {
 *   InvalidType.check(value, 'string', 'object');
 * } catch (e) {
 *   console.debug( e.info.checked  ); // 123
 *   console.debug( e.info.expected ); // ['string', 'object']
 *   console.debug( e.info.actual   ); // 'number'
 * }
 *
 * @extends Exception
 * @hideconstructor
 */
class InvalidType extends Exception {
	/**
	 * Returns if this exception expected `type`.
	 * @param {string|class} type
	 * @return {boolean}
	 * @see InvalidType.check
	 */
	expects(type) {
		return super.expects(type);
	}
	static failed(checked, ...expected) {
		return new this(`unexpected type of value`, {
			checked,
			expected: expected.length > 1 ? expected : expected[0],
			actual: typeof checked
		});
	}
	/**
	 * Checks if the type of `value` matches with `expected`. If it does, just returns `value`.
	 * Otherwise, [triggers]{@link InvalidType#trigger} an exception.
	 *
	 * The triggered exception holds `value` and `expected` as `.info.checked` and `.info.expected`.
	 * And the actual type is stored in `.info.actual`.
	 *
	 * @param {any} value A value to check the type
	 * @param {...string|class} expected The expected type(s)
	 * ##### Available Types
	 * | Type | Description |
	 * |-----:|:------------|
	 * | Any type that `typeof` returns | See: {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof} |
	 * | `bool` | Alias of `boolean` |
	 * | `int`, `integer` | Matches with integer numbers |
	 * | `iterable` | Matches with an array or array-like object |
	 * | A class (constructor function) | Matches with an instance of the class |
	 *
	 * @return {any} Just returns the `value` argument if there's no problem
	 */
	static check(value, ...expected) {
		for (let type of expected) {
			if (isTypeOf(value, type)) return value;
		}
		return this.failed(value, expected).trigger();
	}
}

function isTypeOf(value, expected) {
	if (typeof expected == 'function') return value instanceof expected;

	if (expected == 'iterable') {
		if (value === null) return false;
		if (value === undefined) return false;
		return typeof value[Symbol.iterator] == 'function';
	}

	let actual = typeof value;
	if (actual === expected) return true;

	switch (actual) {
	case 'boolean':
		return expected == 'bool';
	case 'number':
		switch (expected) {
		case 'int':
		case 'integer':
			return isFinite(value) && Math.floor(value) === value;
		}
		break;
	}
	return false;
}

export default InvalidType;
