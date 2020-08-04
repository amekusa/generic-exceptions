import Exception from './Exception.js';

class InvalidType extends Exception {
	constructor(info = null) {
		super('unexpected type of value detected', info);
	}
	static failed(checkedValue, expectedType, actualType = null) {
		return new InvalidType({
			checkedValue,
			expectedType,
			actualType: actualType || typeof checkedValue
		});
	}
	static check(value, expectedType) {
		let actualType = typeof value;
		if (typeof expectedType == 'function' && actualType == 'object') {
			if (value instanceof expectedType) return true;
		} else if (actualType == expectedType) return true;
		return InvalidType.failed(value, expectedType, actualType).trigger();
	}
}

export default InvalidType;
