"use strict";

const Role = require(ROOT_DIR +'model/role/Role')
const Dict = require(ROOT_DIR +'lib/collection/Dict')

const roleMgr = new RoleMgr();

module.exports.getInst = function() {
	return roleMgr;
};

function RoleMgr() {
	if (ServerMgr.getCurrentServer().type != "role") {
		console.error("Use role mgr not in role process !!");
		return;
	}
	let self = this;
	this.pool = new Dict();
	this.waitQueueDict = {};
	this.tickId = setInterval(function() {
		try {
			self.save(function() {
				let server = ServerMgr.getCurrentServer();
				console.log("save end >>>>>>", server.getType(), server.getId());
			});
		} catch (e) {
			console.log("Save tick error:", e);
		}		
	}, 300 * 1000);
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
		role.stampLastUse();
		cb(null, role);
	}
}

pro.remove = function(roleId, cb) {
	this.pool.remove(roleId);
	cb();
}

// 定时保存
pro.save = function(cb) {
	let self = this;
	let now = Auxiliary.now();
	let size = this.pool.getSize();
	let count = 0;
	if (this.pool.getSize() <= 0) {
		return cb();
	}
	let roles = this.pool.getRaw();
	for (let i in roles) {
		let role = roles[i];
		role.save(function(err) {
			self.checkGc(role, now);
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

pro.checkGc = function(role, now) {
	if ( now - role.getLastUse() > 300 ) { // 300
		this.remove(role.getId(), Auxiliary.normalCb);
		role.destory(Auxiliary.normalCb);
	}
}

pro.destory = function(cb) {
	clearInterval(this.tickId);
	try {
		this.save(function() {
			let server = ServerMgr.getCurrentServer();
			console.log("Close save end >>>>>>", server.getType(), server.getId());
		});
	} catch (e) {
		console.log("Close save error:", e);
	} finally {
		cb();
	}
}

