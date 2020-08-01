class Exception extends Error {
	constructor(msg, info = null) {
		super(msg + (info ? '\n> info: '+JSON.stringify(info, null, 2) : ''));
		this.name = this.constructor.name;
		this._info = info;
	}
	get info() {
		return this._info;
	}
}

export default Exception;
