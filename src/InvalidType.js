import Exception from './Exception.js';

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

export default InvalidType;
