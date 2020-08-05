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
		return isTypeOf(value, expectedType) ? value :
			InvalidType.failed(value, expectedType).trigger();
	}
}

function isTypeOf(value, expectedType) {
	let actualType = typeof value;
	if (actualType === expectedType) return true;

	switch (actualType) {
	case 'object':
		if (typeof expectedType == 'function') return value instanceof expectedType;
		if (expectedType == 'iterable') return typeof value[Symbol.iterator] == 'function';
		break;
	case 'boolean':
		return expectedType == 'bool';
	case 'number':
		switch (expectedType) {
		case 'int':
		case 'integer':
			return isFinite(value) && Math.floor(value) === value;
		}
		break;
	}
	return false;
}

export default InvalidType;
