"use strict";


module.exports = RpcCallback;


function RpcCallback() {
    this.id = null;
    this.cb = null;
}

var pro = RpcCallback.prototype;

pro.getId = function() {
	return this.id;
}

pro.setCb = function(cb) {
	this.cb = cb;
}
