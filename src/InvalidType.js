import Exception from './Exception.js';

class InvalidType extends Exception {
	constructor(info = null) {
		super('invalid type of value detected', info);
	}
}

InvalidType.failed = function (checkedValue, expectedType, actualType = null) {
	return new InvalidType({
		checkedValue,
		expectedType,
		actualType: actualType || typeof checkedValue
	});
};

InvalidType.check = function (value, expectedType) {
	let actualType = typeof value;
	if (typeof expectedType == 'function' && actualType == 'object') {
		if (value instanceof expectedType) return true;
	} else if (actualType == expectedType) return true;
	throw InvalidType.failed(value, expectedType, actualType);
};

export default InvalidType;
