"use strict";


module.exports = Handle;

function Handle() {
	this.funcDict = {};
}

var pro = Handle.prototype;

pro.exec = function(role, cmd, buf, cb) {
	let func = this.funcDict[cmd];
	func.call(func, role, buf, function(err, res) {
		if ( err ) {
			let len = 6;
			let writeBuf = Buffer.allocUnsafe(len);
			writeBuf.writeUInt16BE(len);
			writeBuf.writeUInt16BE(cmd);
			switch ( typeof(err) ) {
				case 'number':
					writeBuf.writeUInt16BE(err);
					break;
			}
			return cb(null, writeBuf);
		}
		return cb(null, res.sliceRawBuffer());
	});
}

pro.regFunc = function(cmd, func) {
	this.funcDict[cmd] = func;
	func.cmd = cmd;
}
