"use strict";

const util         = require('util');
const DbPackEntity = require(ROOT_DIR +'lib/DbPackEntity');
const Dict         = require(ROOT_DIR +'lib/collection/Dict');
const Robot        = require(ROOT_DIR +'model/robot/Robot');


module.exports = RobotMgr;

function RobotMgr(roleId) {
	DbPackEntity.call(this, "tbl_role", {"id":"roleId"}, "robotData");
	this.roleId = roleId;
	this.pool = new Dict();
	this.openEquips = new Dict();
	this.curRobot = null;
}

util.inherits(RobotMgr, DbPackEntity);


var pro = RobotMgr.prototype;

pro.addEquip = function(equipCfgId) {
	if (this.openEquips.has(equipCfgId)) {
		return;
	}
	this.openEquips.add(equipCfgId, true);
}

pro.hasEquip = function(equipCfgId) {
	return this.openEquips.has(equipCfgId);
}

pro.add = function(cfgId) {
	if (this.pool.has(cfgId)) {
		return;
	}
	let robot = Robot.createInit(cfgId);
	this.pool.add(robot.getId(), robot);
	return robot;
}

pro.get = function(cfgId) {
	this.pool.get(cfgId);
}

pro.setCurRobot = function(cfgId) {
	let robot = this.pool.get(cfgId);
	if (!robot) {
		return Auxiliary.createError(ErrorCode.ROBOT_NOT_EXIST);
;	}
	this.curRobot = robot;
}

pro.getCurRobot = function() {
	return this.curRobot;
}

// ===== 每个mgr类必须实现方法 =====

pro.register = function(cb) {
	let arr = [10001]; // , 10002, 10003
	for (let i in arr) {
		let cfgId = arr[i];
		let robot = this.add(cfgId);
		if (i == 0) {
			this.curRobot = robot;
		}
	}
	cb();
}

// save在DbPackEntity中实现

pro.load = function(cb) {
	cb();
}

pro.afterLoad = function(cb) {
	cb();
}

pro.online = function(cb) {
	cb();
}

pro.offline = function(cb) {
	cb();
}

pro.destory = function(cb) {
	cb();
}


pro.pack = function() {
	let elements = this.pool.getRaw();
	let arr = [];
	for (let i in elements) {
		let element = elements[i];
		arr.push(element.pack());
	}
	return arr;
}



