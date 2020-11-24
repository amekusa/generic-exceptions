const assert = require('assert');

//////  Utils  //

const stream = require('stream');
class LogStream extends stream.Writable {
	constructor(options) {
		super(options);
		this._chunks = [];
	}
	get data() {
		return Buffer.concat(this._chunks).toString('utf8');
	}
	_write(chunk, enc, next) {
		this._chunks.push(chunk);
		next();
	}
}

function setupLogger() {
	const r = {};
	r.log = new LogStream();
	r.logger = new console.Console(log);
	return r;
}

function falsy(value) {
	return !!!value;
}

//////  Tests  //

const {
	NoSuchProp,
	InvalidType,
	Exception
} = require('./bundle');

beforeEach(() => {
	Exception.reset();
});

describe(`Exception`, () => {
	it(`.message`, () => {
		let ex = new Exception(`MSG`);
		assert.equal(ex.message, `MSG`);
	});
	it(`.info`, () => {
		let info = { X: 1, Y: 2 };
		let ex = new Exception(`A`, info);
		assert.deepEqual(ex.info, info);
	});
	it(`.trigger()`, () => {
		let ex = new Exception(`A`);
		assert.throws(() => {
			ex.trigger();
		});
	});
	it(`.expects(value)`, () => {
		assert.throws(() => {
			try {
				Exception.check('');
			} catch (e) {
				assert.ok(e.expects('TRUTHY'));
				assert.ok(e.expects(1));
				assert.ok(e.expects(true));
				throw e;
			}
		})
		assert.throws(() => {
			try {
				Exception.check(1, 2);
			} catch (e) {
				assert.ok(e.expects(2));
				throw e;
			}
		});
		assert.throws(() => {
			try {
				Exception.check(1, 2, 3);
			} catch (e) {
				assert.ok(e.expects(2));
				assert.ok(e.expects(3));
				assert.ok(!e.expects(1));
				throw e;
			}
		});
	});

	describe(`static`, () => {
		it(`.option(name)`, () => {
			let r = Exception.option('handler');
			assert.strictEqual(r, null);
		});
		it(`.option(name, value)`, () => {
			let r = Exception.option('handler', 'A');
			assert.equal(Exception.option('handler'), 'A');
			assert.strictEqual(r, Exception);
		});
		it(`.options()`, () => {
			let r = Exception.options();
			assert.deepEqual(r, {
				handler: Exception.option('handler')
			});
		});
		it(`.options(set)`, () => {
			let r = Exception.options({ handler: 'A' });
			assert.equal(Exception.option('handler'), 'A');
			assert.strictEqual(r, Exception);
		});
		it(`.check(value)`, () => {
			assert.throws(() => { Exception.check(false) });
			assert.throws(() => { Exception.check(0) });
			assert.throws(() => { Exception.check('') });
			assert.throws(() => { Exception.check(null) });
			assert.doesNotThrow(() => {
				Exception.check(true);
				Exception.check(1);
				Exception.check('A');
				Exception.check({});
			});
		});
		it('.check(value, expected)', () => {
			assert.throws(() => { Exception.check(1, true) });
			assert.throws(() => { Exception.check(1, '1') });
			assert.doesNotThrow(() => {
				Exception.check(1, 1);
			})
		});
		it('.check(value, expected, ...)', () => {
			assert.throws(() => { Exception.check(1, true, '1') });
			assert.doesNotThrow(() => {
				Exception.check(1, true, '1', 1);
			});
		});
	});

	describe('options', () => {
		it('handler: function', () => {
			let ex = new Exception('A');
			assert.throws(() => {
				ex.trigger();
			});
			Exception.option('handler', e => {
				assert.strictEqual(e, ex);
			});
			assert.doesNotThrow(() => {
				ex.trigger();
			});
		});
	});
});

describe(`InvalidType`, () => {
	it('.expects(type)', () => {
		assert.throws(() => {
			try {
				InvalidType.check(true, 'string');
			} catch (e) {
				assert.ok(e.expects('string'));
				assert.ok(!e.expects('int'));
				throw e;
			}
		});
		assert.throws(() => {
			try {
				InvalidType.check('A', 'int', 'boolean');
			} catch (e) {
				assert.ok(e.expects('int'));
				assert.ok(e.expects('boolean'));
				assert.ok(!e.expects('string'));
				throw e;
			}
		});
	});

	describe('static', () => {
		it(`.failed(value, type)`, () => {
			let ex = InvalidType.failed('A', 'boolean');
			assert.deepEqual(ex.info, {
				checked: 'A',
				expected: 'boolean',
				actual: 'string'
			});
		});
		it(`.failed(value, type, ...)`, () => {
			let ex = InvalidType.failed('A', 'int', 'boolean');
			assert.deepEqual(ex.info, {
				checked: 'A',
				expected: ['int', 'boolean'],
				actual: 'string'
			});
		});
		it(`.check(value, <primitive>)`, () => {
			assert.doesNotThrow(() => {
				InvalidType.check(true, 'boolean');
				InvalidType.check(1, 'number');
				InvalidType.check('A', 'string');
				InvalidType.check({}, 'object');
				InvalidType.check(() => {}, 'function');
			});
			assert.throws(() => { InvalidType.check(true, 'function') });
			assert.throws(() => { InvalidType.check(1, 'boolean') });
			assert.throws(() => { InvalidType.check('A', 'number') });
			assert.throws(() => { InvalidType.check({}, 'string') });
			assert.throws(() => { InvalidType.check(() => {}, 'object') });
		});
		it(`.check(value, <class>)`, () => {
			assert.doesNotThrow(() => {
				InvalidType.check(new String(), String);
				InvalidType.check([], Array);
				let ex = new InvalidType();
				InvalidType.check(ex, InvalidType);
				InvalidType.check(ex, Exception);
				InvalidType.check(ex, Error);
			});
			assert.throws(() => { InvalidType.check([], Error) });
			assert.throws(() => { InvalidType.check(new InvalidType(), Array) });
		});
		it(`.check(value, 'iterable')`, () => {
			let iterable = {};
			iterable[Symbol.iterator] = function* () {
				yield 1;
				yield 2;
				yield 3;
			};
			assert.doesNotThrow(() => {
				InvalidType.check(iterable, 'iterable');
				InvalidType.check([], 'iterable');
			});
			assert.throws(() => {
				InvalidType.check({}, 'iterable');
			});
		});
		it(`.check(value, <special-type>)`, () => {
			assert.doesNotThrow(() => {
				InvalidType.check(true, 'bool');
				InvalidType.check(1, 'int');
				InvalidType.check(1, 'integer');
			});
			assert.throws(() => { InvalidType.check(1, 'bool') });
			assert.throws(() => { InvalidType.check(1.2, 'int') });
			assert.throws(() => { InvalidType.check(1.2, 'integer') });
		});
		it(`.check(value, type, ...)`, () => {
			assert.doesNotThrow(() => {
				InvalidType.check(true, 'int', 'string', 'bool');
			});
			assert.throws(() => {
				try {
					InvalidType.check(true, 'int', 'string', 'object');
				} catch (e) {
					assert.deepEqual(e.info, {
						checked: true,
						expected: ['int', 'string', 'object'],
						actual: 'boolean'
					});
					throw e;
				}
			});
		});
	});

	describe('options', () => {
		it('handler :: inheritance', () => {
			assert.throws(() => {
				InvalidType.check('XXX', 'boolean');
			});
			Exception.option('handler', e => {
				assert.ok(e instanceof InvalidType);
			});
			assert.doesNotThrow(() => {
				InvalidType.check('XXX', 'boolean');
			});
		});
	});
});

describe(`NoSuchProp`, () => {
	it('.expects(prop)', () => {
		assert.throws(() => {
			try {
				NoSuchProp.check({ X:0, Y:1 }, 'Z');
			} catch (e) {
				assert.ok(e.expects('Z'));
				assert.ok(!e.expects('X'));
				throw e;
			}
		});
		assert.throws(() => {
			try {
				NoSuchProp.check({ X:0, Y:1 }, 'A', 'B');
			} catch (e) {
				assert.ok(e.expects('A'));
				assert.ok(e.expects('B'));
				assert.ok(!e.expects('X'));
				throw e;
			}
		});
	});

	describe('static', () => {
		it(`.failed(obj, prop)`, () => {
			let ex = NoSuchProp.failed({ X:0, Y:0 }, 'Z');
			assert.deepEqual(ex.info, {
				checked: { X:0, Y:0 },
				expected: 'Z'
			});
		});
		it(`.failed(obj, prop, ...)`, () => {
			let ex = NoSuchProp.failed({ X:0, Y:0 }, 'A', 'B');
			assert.deepEqual(ex.info, {
				checked: { X:0, Y:0 },
				expected: ['A', 'B']
			});
		});
		it(`.check(obj, prop)`, () => {
			assert.doesNotThrow(() => {
				NoSuchProp.check({ X:null }, 'X');
				NoSuchProp.check({ X:undefined }, 'X');
				NoSuchProp.check({ X:0, Y:0 }, 'X');
				NoSuchProp.check({ X:0, Y:0 }, 'X', 'Y');
				NoSuchProp.check({ X:0, Y:0 }, 'Y', 'Z');
			});
			assert.throws(() => { NoSuchProp.check({ X:0, Y:0 }, 'Z') });
			assert.throws(() => { NoSuchProp.check({ X:0, Y:0 }, 'A', 'B') });
			assert.throws(() => { NoSuchProp.check({}, 'X') });
			assert.throws(() => { NoSuchProp.check('XYZ', 'X') });
			assert.throws(() => {
				let obj = { X:0, Y:0 };
				delete obj.X;
				NoSuchProp.check(obj, 'X');
			});
		});
	});
});
