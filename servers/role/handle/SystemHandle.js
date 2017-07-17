"use strict";

const util = require('util');


module.exports = Handle;

function Handle() {
}

const pro = Handle.prototype;


pro.SYS_RTT = function(role, msg, cb) {
	return msg;
}

