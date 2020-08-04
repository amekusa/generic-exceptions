const truthy = Symbol('<Truthy>');
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
	static failed(checked, expected) {
		return new Exception(`unexpected value`, {
			checked,
			expected
		});
	}
	static check(value, expected = truthy) {
		if (arguments.length < 2 && value) return value;
		if (value === expected) return value;
		return Exception.failed(value, truthy).trigger();
	}
}

Exception.reset();

export default Exception;
