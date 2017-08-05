"use strict";

const MysqlExtend = require(ROOT_DIR +'lib/Auxiliary')


module.exports = GcEntity;


function GcEntity(gcTime, checkInterval) {
	this.gcTime = gcTime;
	this.checkInterval = checkInterval || 60 * 1000;
	this.gcPool = {};
	let self = this;
	this.tick = setInterval(function() {
		try {
			self.gcCheck();
		} catch (e) {
			console.log("Gc tick error:", e);
		}
	}, this.checkInterval);
}

const pro = GcEntity.prototype;


pro.getGcPool = function() {
	console.error("Must to override property getGcPool()");
}

pro.gcAdd = function(entity) {
	gcPool[entity] = Auxiliary.now();
}

pro.gcUpdate = function(entity) {
	gcPool[entity] = Auxiliary.now();
}

pro.gcRemove = function(entity) {
	console.error("Must to override property gcRemove()");
}

pro.gcCheck = function() {
	let self = this;
	let pool = this.getGcPool();
	let now = Auxiliary.now();
	for ( let entity in pool ) {
		let lastTime = pool[entity];
		if ( now - lastTime > gcTime ) {
			self.gcRemove(entity);
		}
	}
}

