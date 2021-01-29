import Exception from './Exception.js';

/**
 * Thrown to indicate that a variable has unexpected value.
 *
 * @example <caption>Value Checking</caption>
 * var value = 1;
 * var checked = InvalidValue.check(value, 0);       // Throws an exception
 * var checked = InvalidValue.check(value, 1);       // OK
 * var checked = InvalidValue.check(value, 0, 1, 2); // OK (multiple expectations)
 *
 * @example <caption>Using .info for debug inside 'catch' block</caption>
 * var value = 3;
 * try {
 *   InvalidValue.check(value, 0, 1, 2); // Throws
 * } catch (e) {
 *   console.debug( e.info.checked  ); // 3
 *   console.debug( e.info.expected ); // [0, 1, 2]
 * }
 *
 * @extends Exception
 * @hideconstructor
 */
class InvalidValue extends Exception {
	/**
	 * Returns `true` if `value` equals to or is included in [info.expected]{@link InvalidValue#info}. Otherwise `false`.
	 * Recommended for using alongside of {@link InvalidValue.check} method.
	 *
	 * @example
	 * value = 2;
	 * try {
	 *   InvalidValue.check(value, 0, 1); // Throws
	 * } catch (e) {
	 *   if (e.expects(0)) { ... } // true
	 *   if (e.expects(1)) { ... } // true
	 *   if (e.expects(2)) { ... } // false
	 * }
	 *
	 * @param {any} value An expectation
	 * @return {boolean}
	 */
	expects(value) {
		if (!('expected' in this.info)) return false;
		return Array.isArray(this.info.expected) ?
			this.info.expected.includes(value) : (value === this.info.expected);
	}
	static failed(checked, ...expected) {
		return new this(`unexpected value`, {
			checked,
			expected: expected.length > 1 ? expected : expected[0]
		});
	}
	/**
	 * Checks if `value` matches with the `expected` values.
	 * If it does, returns `value` untouched. Otherwise, [triggers]{@link InvalidValue#trigger} an exception.
	 *
	 * The triggered exception holds `value` and `expected` as `.info.checked` and `.info.expected`.
	 * @param {any} value A value to check
	 * @param {...any} expected Expected value(s)
	 * @return {any} the `value` argument untouched if it has no problem
	 */
	static check(value, ...expected) {
		if (arguments.length > 1) {
			for (let I of expected) {
				if (value === I) return value;
			}
		} else if (value) return value;
		return this.failed(value, ...expected).trigger();
	}
}

export default InvalidValue;
