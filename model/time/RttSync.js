"use strict";

const util = require('util');


function RttSync() {
	this.time = 0;
	this.avgRtt = 0;
}

module.exports = RttSync;

const pro = RttSync.prototype;


pro.stampTime = function() {
	this.time = new Date().getTime();
}

pro.diffTime = function() {
	let diff = new Date().getTime() - this.time;
	if ( this.avgRtt == 0 ) {
		this.avgRtt = diff;
	}
	else {
		this.avgRtt = Math.round((this.avgRtt + diff) / 2);
	}
}

pro.getRtt = function() {
	return this.avgRtt;
}

