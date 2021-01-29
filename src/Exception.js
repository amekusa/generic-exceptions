let options;

/**
 * The base class of all the other exceptions.
 */
class Exception extends Error {
	/**
	 * @param {string} [msg] Message
	 * @param {any} [info] Additional information for debug
	 * @param {boolean} [hidesInfo=false] Whether or not to hide `info`
	 */
	constructor(msg = null, info = null, hidesInfo = false) {
		super((msg ? format(msg, info) : '') + ((info && !hidesInfo) ? `\n[${new.target.name}] To debug, catch me and see .info: ${JSON.stringify(info, null, 2)}` : ''));
		this.name = new.target.name;
		this._info = info;
	}
	/**
	 * Additional informations for debug.
	 * @type {any}
	 * @readonly
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
	 * Returns whether this exception has expected `value` specifically.
	 * @param {any} value An expectation
	 * @return {boolean}
	 * @abstract
	 */
	expects(value) {
		return false; // noop
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
	/**
	 * Checks whether `value` meets the expected condition varied by each subclass.
	 * @param {any} value A value to check
	 * @return {any} the `value` argument untouched if there's no problem. Otherwise triggers the exception.
	 * @abstract
	 */
	static check(value) {
		return value; // noop
	}
}

function format(str, data) {
	let r = str;
	if (typeof data == 'object') {
		for (let i in data) r = r.replaceAll(`%${i}%`, data[i]);
	}
	return r;
}

Exception.reset();
export default Exception;
