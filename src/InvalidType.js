import Exception from './Exception.js';

class InvalidType extends Exception {
	constructor(msg = null, info = null) {
		super(typeof msg == 'string' ? msg : 'unexpected type of value detected', info);
	}
	static failed(checked, expectedType, actualType = null) {
		return new InvalidType(null, {
			checked,
			expectedType,
			actualType: actualType || typeof checked
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
