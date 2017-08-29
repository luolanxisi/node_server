"use strict";


module.exports = TcpPackage;

function TcpPackage(cb) {
	this.cb = cb;
	this.buffer = null;
	this.writeLen = 0;
}

const pro = TcpPackage.prototype;


pro.addBuffer = function(data) {
	try {
		// 未处理长度不足1位的情况
		if (this.buffer == null) {
			let len = data.readInt16BE(0);
			if (len < 9 || len > 8192) {
				aux.log(null, "Length less than min[9] or greater than max[8192]:", len);
				return;
			}
			//
			if (len < data.length) { // 粘包
				aux.log(null, "	>> len:", len, ", data length:", data.length);
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
	} catch(e) {
		aux.log(null, "addBuffer error:", e);
	}
}

pro.copyBuffer = function(data, srcStart, srcEnd) {
	data.copy(this.buffer, this.writeLen, srcStart, srcEnd);
	this.writeLen += (srcEnd - srcStart);
}

pro.callback = function() {
	try {
		this.cb(this.buffer);
	} catch (e) {
		aux.log(null, "callback error:", e);
	}
	this.buffer = null;
	this.writeLen = 0;
}

