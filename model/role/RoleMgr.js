"use strict";

const Role = require(ROOT_DIR +'model/role/Role')
const Dict = require(ROOT_DIR +'lib/collection/Dict')

const roleMgr = new RoleMgr();

module.exports.getInst = function() {
	return roleMgr;
};

function RoleMgr() {
	this.pool = new Dict();
	this.waitQueueDict = {};
}

const pro = RoleMgr.prototype;


pro.get = function(roleId, cb) {
	let self = this;
	let role = this.pool.get(roleId);
	if ( ! role ) {
		if ( ! this.waitQueueDict[roleId] ) {
			this.waitQueueDict[roleId] = [];
		}
		let waitQueue = this.waitQueueDict[roleId];
		waitQueue.push(cb);
		if ( waitQueue.length > 1 ) {
			return;
		}
		let role = new Role(roleId);
		role.load(function(err, res) {
			if (err) {
				self.waitQueueDict[roleId] = [];
				return Auxiliary.cbAll(waitQueue, [err]);
			}
			self.waitQueueDict[roleId] = [];
			self.pool.add(roleId, role);
			Auxiliary.cbAll(waitQueue, [null, role]);
		});
	}
	else {
		cb(null, role);
	}
}

pro.remove = function(roleId, cb) {
	this.pool.remove(roleId);
	cb();
}

// 定时保存
pro.save = function(cb) {
	let size = this.pool.getSize();
	let count = 0;
	let roles = this.pool.getRaw();
	for (let i in roles) {
		let role = roles[i];
		role.save(function(err) {
			if (err) {
				console.error("save role fail!!", err);
			}
			++count;
			if (count >= size) {
				cb();
			}
		});
	}
}

