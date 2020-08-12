const truthy = Symbol('<truthy>');
let options;

class Exception extends Error {
	constructor(msg, info = null) {
		super(msg + (info ? '\n> info: '+JSON.stringify(info, null, 2) : ''));
		this.name = this.constructor.name;
		this._info = info;
	}
	get info() {
		return this._info;
	}
	trigger() {
		if (typeof options.handler != 'function') throw this;
		return options.handler(this);
	}
	expects(value) {
		if (!('expected' in this.info)) return false;
		if (this.info.expected == truthy) return !!value;
		return Array.isArray(this.info.expected) ?
			this.info.expected.includes(value) : (value === this.info.expected);
	}
	static reset() {
		options = {
			handler: null
		};
		return Exception;
	}
	static option(name, value) {
		if (arguments.length < 2) return options[name];
		options[name] = value;
		return Exception;
	}
	static options(set) {
		if (!arguments.length) return Object.assign({}, options);
		Object.assign(options, set);
		return Exception;
	}
	static failed(checked, ...expected) {
		return new Exception(`unexpected value`, {
			checked,
			expected: expected.length < 1 ? truthy :
				(expected.length > 1 ? expected : expected[0])
		});
	}
	static check(value, ...expected) {
		if (arguments.length > 1) {
			for (let I of expected) {
				if (value === I) return value;
			}
		} else if (value) return value;
		return Exception.failed(value, ...expected).trigger();
	}
}

Exception.reset();

export default Exception;
