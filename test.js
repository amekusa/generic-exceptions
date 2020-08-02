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

describe(`Exception`, () => {
	it(`.info()`, () => {
		let info = { X: 1, Y: 2 };
		let ex = new Exception(`MSG`, info);
		assert.deepEqual(ex.info, info);
	});
});

describe(`InvalidType`, () => {
	it(`.failed()`, () => {
		let ex = InvalidType.failed('A', 'boolean', 'OK');
		assert.deepEqual(ex.info, {
			checkedValue: 'A',
			expectedType: 'boolean',
			actualType: 'OK'
		});
	});
	it(`.failed() :: auto type`, () => {
		let ex = InvalidType.failed('A', 'boolean');
		assert.deepEqual(ex.info, {
			checkedValue: 'A',
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
		assert.throws(() => {
			InvalidType.check(true, 'function');
			InvalidType.check(1, 'boolean');
			InvalidType.check('A', 'number');
			InvalidType.check({}, 'string');
			InvalidType.check(() => {}, 'object');
		});
	});
	it(`.check() :: classes`, () => {
		assert.doesNotThrow(() => {
			InvalidType.check([], Array);
			let ex = new InvalidType();
			InvalidType.check(ex, InvalidType);
			InvalidType.check(ex, Exception);
			InvalidType.check(ex, Error);
		});
		assert.throws(() => {
			InvalidType.check([], Error);
			let ex = new InvalidType();
			InvalidType.check(ex, Array);
		});
	});
});
