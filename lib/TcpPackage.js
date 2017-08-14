"use strict";


module.exports = TcpPackage;

function TcpPackage(cb) {
	this.cb = cb;
	this.buffer = null;
	this.writeLen = 0;
}

const pro = TcpPackage.prototype;


pro.addBuffer = function(data) {
	// 未处理长度不足1位的情况
	if (this.buffer == null) {
		let len = data.readInt16BE(0);
		if (len < data.length) { // 粘包
			this.buffer = data.slice(0, len);
			this.callback();
			//
			this.addBuffer(data.slice(len, data.length));
		}
		else if (len > data.length) { // 分包
			this.buffer = Buffer.allocUnsafe(len);
			this.copyBuffer(data, 0, data.length);
		}
		else { // 完整
			this.buffer = data;
			this.callback();
		}
	}
	else { // 之前已经有部分buffer
		let len = this.buffer.readInt16BE(0);
		let restLen = len - this.writeLen;
		if (restLen < data.length) { // 粘包
			this.copyBuffer(data, 0, restLen);
			this.callback();
			//
			this.addBuffer(data.slice(restLen, data.length));
		}
		else if (restLen > data.length) { // 分包
			this.copyBuffer(data, 0, data.length);
		}
		else { // 完整
			this.copyBuffer(data, 0, data.length);
			this.callback();
		}
	}
}

pro.copyBuffer = function(data, srcStart, srcEnd) {
	data.copy(this.buffer, this.writeLen, srcStart, srcEnd);
	this.writeLen += (srcEnd - srcStart);
}

pro.callback = function() {
	this.cb(this.buffer);
	this.buffer = null;
	this.writeLen = 0;
}

