"use strict";


exports.rttTime = function() {
	let myDate = new Date();
	return myDate.getTime() - time2017;
}

exports.retError = function(errCode, buf) {
	buf.writeUInt16BE(errCode, 0);
	return buf;
}

exports.netSend = function(role, buf) {
	role.getSocket().write(buf);
}

exports.cbAll = function(list, args) {
	for (let i in list) {
		list[i].apply(null, args);
	}
}

exports.normalCb = function(err, res) {
    if (err) {
    	console.error("rpc error:", err);
    }
}


var millsecond = Date.now();
var tickId = setInterval(function() {
	millsecond = Date.now();
}, 1000);

exports.now = function() {
    return Math.floor( millsecond / 1000 );
}

exports.createError = function(errCode, errDesc) {
    return {errCode:errCode, errDesc:errDesc};
}


exports.trace = function() {
	try {
		aa();
	} catch (err) {
		console.error(err);
	}
}

exports.log = function() {
	if (arguments[0] == null) {
		let date = new Date();
		date.setTime(millsecond);
		arguments[0] = '['+ date.toLocaleString() +']';
	}
	console.log.apply(console, arguments);
}

exports.error = function() {
	if (arguments[0] == null) {
		let date = new Date();
		date.setTime(millsecond);
		arguments[0] = '['+ date.toLocaleString() +']';
	}
	console.error.apply(console, arguments);
}

