let options;

/**
 * The base class of all the other exceptions.
 */
class Exception extends Error {
	/**
	 * @param {string} [msg] Message
	 * @param {any} [info] Additional information for debug
	 */
	constructor(msg = null, info = null) {
		super((typeof msg == 'string' ? msg : '') + (info ? `\n> info: ${JSON.stringify(info, null, 2)}` : ''));
		this.name = this.constructor.name;
		this._info = info;
	}
	/**
	 * Additional informations for debug.
	 * @type {any}
	 */
	get info() {
		return this._info;
	}
	/**
	 * Throws this exception if `handler` option is not set.
	 * If `handler` option is set, calls it and returns the result.
	 * @see Exception.option
	 * @return {any} The result of [option.handler]{@link Exception.option} function
	 * @throws This exception
	 */
	trigger() {
		if (typeof options.handler != 'function') throw this;
		return options.handler(this);
	}
	/**
	 * Returns `true` if `value` equals to or is included in [info.expected]{@link Exception#info}. Otherwise `false`.
	 * Recommended for using alongside of {@link Exception.check} method.
	 *
	 * @example
	 * value = 2;
	 * try {
	 *   Exception.check(value, 0, 1); // Throws
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
	/**
	 * Resets all the options to the default values.
	 * @return {class} This exception class
	 */
	static reset() {
		options = {
			handler: null
		};
		return this;
	}
	/**
	 * Returns the value of the option specified by `name`.
	 * If `value` is provided, assigns the value to the option instead of returning it.
	 * You can customize the default behavior of `Exception` at some level by changing the option values.
	 *
	 * ##### Available options:
	 * | Name | Type | Description |
	 * |-----:|:-----|:------------|
	 * | `handler` | function | Runs when [trigger()]{@link Exception#trigger} is called. Receives the triggered exception instance as the argument |
	 *
	 * @param {string} name Option name
	 * @param {any} [value] Option value to set
	 * @return {any|class} The option value, or this exception class if `value` is provided
	 */
	static option(name, value = undefined) {
		if (arguments.length < 2) return options[name];
		options[name] = value;
		return this;
	}
	/**
	 * If `set` is not provided, returns all the current option values in a plain object form.
	 * If `set` is provided, assigns each value in `set` to the option corresponding with the key.
	 * @param {object} [set] Multiple key-value pairs
	 * @return {object|class} The current options in a plain object form, or this exception class if `set` is provided
	 */
	static options(set) {
		if (!arguments.length) return Object.assign({}, options);
		Object.assign(options, set);
		return this;
	}
	static failed(checked, ...expected) {
		return new this(`unexpected value`, {
			checked,
			expected: expected.length > 1 ? expected : expected[0]
		});
	}
	/**
	 * Checks if `value` matches with the `expected` values.
	 * If it does, just returns `value`. Otherwise, [triggers]{@link Exception#trigger} an exception.
	 *
	 * The triggered exception holds `value` and `expected` as `.info.checked` and `.info.expected`.
	 *
	 * @example <caption>Value Checking</caption>
	 * var value = 1;
	 * var checked = Exception.check(value, 0);       // Throws an exception
	 * var checked = Exception.check(value, 1);       // OK
	 * var checked = Exception.check(value, 0, 1, 2); // OK (multiple expectations)
	 *
	 * @example <caption>Using .info for debug inside 'catch' block</caption>
	 * var value = 3;
	 * try {
	 *   Exception.check(value, 0, 1, 2); // Throws
	 * } catch (e) {
	 *   console.debug( e.info.checked  ); // 3
	 *   console.debug( e.info.expected ); // [0, 1, 2]
	 * }
	 *
	 * @param {any} value A value to check
	 * @param {...any} expected Expected value(s)
	 * @return {any} Just returns the `value` argument if there's no problem
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

Exception.reset();

export default Exception;
