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
	it(`.info()`, () => {
		let info = { X: 1, Y: 2 };
		let ex = new Exception(`A`, info);
		assert.deepEqual(ex.info, info);
	});
	it('.trigger()', () => {
		let ex = new Exception(`A`);
		assert.throws(() => {
			ex.trigger();
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

	describe('static', () => {
		it(`.failed()`, () => {
			let ex = InvalidType.failed('A', 'boolean', 'OK');
			assert.deepEqual(ex.info, {
				checked: 'A',
				expectedType: 'boolean',
				actualType: 'OK'
			});
		});
		it(`.failed() :: auto type`, () => {
			let ex = InvalidType.failed('A', 'boolean');
			assert.deepEqual(ex.info, {
				checked: 'A',
				expectedType: 'boolean',
				actualType: 'string'
			});
		});
		it(`.check() :: primitives`, () => {
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
		it(`.check() :: classes`, () => {
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
		it('.check() :: iterable', () => {
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
		it('.check() :: special types', () => {
			assert.doesNotThrow(() => {
				InvalidType.check(true, 'bool');
				InvalidType.check(1, 'int');
				InvalidType.check(1, 'integer');
			});
			assert.throws(() => { InvalidType.check(1, 'bool') });
			assert.throws(() => { InvalidType.check(1.2, 'int') });
			assert.throws(() => { InvalidType.check(1.2, 'integer') });
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
