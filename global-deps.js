/*!
 * Install global dependencies
 * @author amekusa (https://amekusa.com)
 */

const proc = require('child_process');

function run(cmd) {
	return new Promise((resolve, reject) => {
		console.log(`cmd:`, cmd);
		proc.exec(cmd, {}, function(err, out) {
			if (!err) return resolve(out);
			return reject(err);
		});
	});
}

function main(deps) {
	console.log(`dependencies:`, JSON.stringify(deps, null, 2));
	run(`npm ls -g ${Object.keys(deps).join(' ')} --json --depth=0`).then(out => {
		let installs = [];
		let result = JSON.parse(out);
		if (result && 'dependencies' in result) {
			for (let i in deps) {
				let I = deps[i];
				if (i in result.dependencies && I.version <= result.dependencies[i].version) {
					console.log(
						`newer version of '${i}' is already installed:`,
						`${I.version} > ${result.dependencies[i].version}`
					);
					continue;
				}
				installs.push(i+'@'+I.version);
			}
		} else {
			for (let i in deps) installs.push(i+'@'+deps[i].version);
		}
		return installs;

	}).then(installs => {
		if (!installs.length) {
			console.log(`nothing to do.`);
			return true;
		}
		console.log(`installs:`, installs);
		return run(`npm i -g ${installs.join(' ')}`);

	}).then(() => {
		console.log(`npm-setup done.`);
	});
}

main({
	'rollup':    { version: '2.22.1' },
	'nyc':       { version: '15.1.0' },
	'mocha':     { version: '8.0.1' },
	'codecov':   { version: '3.7.2' },
	'npm-watch': { version: '0.6.0' }
});
