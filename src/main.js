class Exception extends Error {
	constructor(msg, info = null) {
		super(msg + (info ? '\nInfo: '+JSON.stringify(info) : ''));
		this._info = info || {};
	}
	get info() {
		return this._info;
	}
}

class InvalidType extends Exception {
	constructor(info = null) {
		super('invalid type of value detected', info);
	}
}

InvalidType.check = function (value, type) {
	let actualType = typeof value;
	if (typeof type == 'function' && actualType == 'object') {
		if (value instanceof type) return true;
	} else if (actualType == type) return true;
	throw new InvalidType({
		checkedValue: value,
		expectedType: type,
		actualType
	});
};

export {
	InvalidType,
	Exception
};
