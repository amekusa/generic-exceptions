import Exception from './Exception.js';

class InvalidType extends Exception {
	constructor(msg = null, info = null) {
		super(typeof msg == 'string' ? msg : 'unexpected type of value detected', info);
	}
	expects(type) {
		if (!('expectedType' in this.info)) return false;
		return Array.isArray(this.info.expectedType) ?
			this.info.expectedType.includes(type) : (type === this.info.expectedType);
	}
	static failed(checked, ...expectedType) {
		return new InvalidType(null, {
			checked,
			expectedType: expectedType.length > 1 ? expectedType : expectedType[0],
			actualType: typeof checked
		});
	}
	static check(value, ...expectedType) {
		for (let type of expectedType) {
			if (isTypeOf(value, type)) return value;
		}
		return InvalidType.failed(value, expectedType).trigger();
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
