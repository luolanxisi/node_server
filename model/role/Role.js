"use strict";

const Dict = require(ROOT_DIR +'lib/collection/Dict');
const MissionMgr = require(ROOT_DIR +'model/mission/MissionMgr');
const RobotMgr = require(ROOT_DIR +'model/robot/RobotMgr');

const MISSION_MGR = 1;
const ROBOT_MGR   = 2;

module.exports = Role;

function Role(id) {
	this.id = id;
	this.name = null;
	this.rank = 0; // 积分
	this.money = 0; // 金币
	this.gem  = 0;
	this.p2pPort = 0;
	this.online = false;
	// 
	this.mgrDict = new Dict();
	this.mgrDict.add(MISSION_MGR,  {class:MissionMgr, obj:null, waitQueue:[]}); // 当有请求开始读取时状态时等待队列不为空，读完后赋值并按顺序回调
	this.mgrDict.add(ROBOT_MGR, {class:RobotMgr, obj:null, waitQueue:[]});
}

var pro = Role.prototype;

pro.getId = function() {
	return this.id;
}

pro.getName = function() {
	return this.name;
}

pro.getRank = function() {
	return this.rank;
}

pro.setP2pPort = function(value) {
	this.p2pPort = value || 0;
}

pro.getP2pPort = function() {
	return this.p2pPort;
}

pro.addGem = function(value) {
	this.gem += value || 0;
}

pro.minusGem = function(value) {
	value = value || 0;
	if (this.gem < value) {
		return false;
	}
	else {
		this.gem -= value;
		return true;
	}
}

pro.getGem = function() {
	return this.gem;
}

pro.addMoney = function(value) {
	this.money += value || 0;
}

pro.minusMoney = function(value) {
	value = value || 0;
	if (this.money < value) {
		return false;
	}
	else {
		this.money -= value;
		return true;
	}
}

pro.getMoney = function() {
	return this.money;
}

pro.getMissionMgr = function(cb) {
	this.getMgr(MISSION_MGR, cb);
}

pro.getRobotMgr = function(cb) {
	this.getMgr(ROBOT_MGR, cb);
}

pro.getMgr = function(key, cb) {
	let mgr = this.mgrDict.get(key);
	if ( mgr.obj === null ) {
		mgr.waitQueue.push(cb);
		if ( mgr.waitQueue.length > 1 ) {
			return;
		}
		let obj = new mgr.class(this.id);
		let waitQueue = mgr.waitQueue;
		obj.load(function(err, res) {
			if (err) {
				mgr.waitQueue = [];
				return Auxiliary.cbAll(waitQueue, [err]);
			}
			obj.afterLoad(function(err, res) {
				if (err) {
					mgr.waitQueue = [];
					return Auxiliary.cbAll(waitQueue, [err]);
				}
				mgr.waitQueue = [];
				mgr.obj = obj;
				Auxiliary.cbAll(waitQueue, [null, mgr.obj]);
			});
		});
	}
	else {
		cb(null, mgr.obj);
	}
}


// ===== 每个mgr类必须实现方法 =====

pro.register = function(cb) {
	let self = this;
	let total = this.mgrDict.getSize();
	//
	let count = 0;
	let mgrDict = this.mgrDict.getRaw();
	for ( let key in mgrDict ) {
		this.getMgr(key, function(err, mgr) {
			if (err) {
				console.error(err);
			}
			mgr.register(function(err, res) {
				if (err) {
					console.error(err);
				}
				++count;
				if (count >= total) {
					cb(null, self);
				}
			});
		});
	}
}

pro.save = function(cb) {
	let self = this;
	let count = 0;
	let mgrDict = this.mgrDict.getRaw();
	for ( let key in mgrDict ) {
		this.getMgr(key, function(err, mgr) {
			if (err) {
				console.error(err);
			}
			mgr.save(function(err, res) {
				if (err) {
					console.error(err);
				}
				++count;
				if (count >= total) {
					cb(null, self);
				}
			});
		});
	}
}

pro.load = function(cb) {
	let self = this;
	MysqlExtend.query('SELECT name, regTime, lastLogin, p2pPort FROM tbl_role WHERE id=? LIMIT 1', [this.id], function (err, res) {
		if (err) {
			return cb(ErrorCode.LOGIN_ERROR);
		}
		let row        = res[0];
		self.name      = row.name;
		self.regTime   = row.regTime;
		self.lastLogin = row.lastLogin;
		self.p2pPort   = row.p2pPort || 0;
		if ( self.regTime == self.lastLogin ) {
			self.register(function(err, res) {
				if ( err ) {
					return cb(err);
				}
				self.afterLoad(cb);
			});
		}
		else {
			self.afterLoad(cb);
		}
	});
}

// load之后执行，数据之间有依赖的放在此处（如：机器人之间有队伍组合加成）
pro.afterLoad = function(cb) {
	this.lastLogin = Math.floor((new Date()).getTime() / 1000);
	cb(null, this);
}

pro.setOnline = function(cb) {
	this.online = true;
	cb();
}

pro.setOffline = function(cb) {
	this.online = false;
	App.callRemote("pvp.PvpRemote.quit", this.id, {roleId:this.id}, Auxiliary.normalCb);
	cb();
}

pro.destory = function(cb) {
	cb();
}



