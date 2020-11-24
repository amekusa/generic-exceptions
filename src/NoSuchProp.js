import Exception from './Exception.js';

/**
 * Thrown to indicate that an object doesn't have expected properties.
 * @extends Exception
 * @hideconstructor
 */
class NoSuchProp extends Exception {
	/**
	 * Checks if `prop` is expected by this exception.
	 * @param {string} prop Name of a property to check
	 * @return {boolean} `true` if `prop` is expected
	 */
	expects(prop) {
		return super.expects(prop);
	}
	static failed(obj, ...prop) {
		return new this(`expected properties missing`, {
			checked: obj,
			expected: prop.length > 1 ? prop : prop[0]
		});
	}
	/**
	 * Checks if `obj` has `prop` as its property. If it doesn't, [triggers]{@link NoSuchProp#trigger} an exception.
	 * Otherwise, just returns `obj`.
	 *
	 * The triggered exception holds `obj` and `prop` as `.info.checked` and `.info.expected`.
	 * 
	 * @param {object} obj The object to check
	 * @param {...string} prop The property name to check if it exists
	 * @return {object} Just returns the `obj` argument if there's no problem
	 */
	static check(obj, ...prop) {
		if (typeof obj == 'object') {
			for (let I of prop) {
				if (I in obj) return obj;
			}
		}
		return this.failed(obj, ...prop).trigger();
	}
}

export default NoSuchProp;
