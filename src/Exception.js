let options;

/**
 * The base class of all the other exceptions
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
	 * Additional information for debug
	 * @type {any}
	 */
	get info() {
		return this._info;
	}
	/**
	 * Throws this exception if `handler` option is not set.
	 * If `handler` option is set, calls it and returns the result
	 * @throws Exception
	 * @return {any}
	 */
	trigger() {
		if (typeof options.handler != 'function') throw this;
		return options.handler(this);
	}
	/**
	 * Returns `true` if `value` equals to or is included in [info.expected]{@link Exception#info}. Otherwise `false`.
	 * Recommended for using in combination with {@link Exception.check} method
	 * @param {any} value An expectation
	 * @return {boolean}
	 */
	expects(value) {
		if (!('expected' in this.info)) return false;
		return Array.isArray(this.info.expected) ?
			this.info.expected.includes(value) : (value === this.info.expected);
	}
	/**
	 * Resets all the options to the default
	 * @return {class} Exception class
	 */
	static reset() {
		options = {
			handler: null
		};
		return this;
	}
	/**
	 * Returns the option value by `name`.
	 * If `value` is provided, assigns the value to the option instead of returning it.
	 * You can customize some default behavior of `Exception` by changing the option values.
	 * @param {string} name Option name. **Available options:**
	 * - `handler`: If you assign a function, it will be invoked when `.trigger()` is called. The argument is the exception instance.
	 * @param {any} [value] Option value to set
	 * @return {any|class} The option value, or Exception class if `value` is provided
	 */
	static option(name, value = undefined) {
		if (arguments.length < 2) return options[name];
		options[name] = value;
		return this;
	}
	/**
	 * Returns all the current option values in a plain object form.
	 * If `set` is provided, assigns all the values in `set` to the options.
	 * @param {object} [set] Multiple sets of option names and values
	 * @return {object|class} The current options, or Exception class if `set` is provided
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
	 * Checks if `value` meets the expected condition(s). If it does, just returns `value` back.
	 * Otherwise, triggers an exception
	 * @abstract
	 * @param {any} value A value to check
	 * @param {...any} expected Expectations
	 * @return {any}
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
