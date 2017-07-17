"use strict";

const util         = require("util");
const DbPackEntity = require(ROOT_DIR +'lib/DbPackEntity');
const MissionCfg   = require(ROOT_DIR +'data/MissionCfg.json');
const Mission      = require(ROOT_DIR +'model/mission/Mission');
const Dict         = require(ROOT_DIR +'lib/collection/Dict');


module.exports = MissionMgr;

function MissionMgr(roleId) {
	this.roleId = roleId;
	this.elements = new Dict();
	this.curMission = 0;
}

util.inherits(MissionMgr, DbPackEntity);

var pro = MissionMgr.prototype;


pro.add = function(mission) {
	this.elements.add(mission.getId(), mission);
}

pro.get = function(id) {
	return this.elements.get(id);
}

pro.setCurMission = function(value) {
	this.curMission = value;
}

pro.getCurMission = function(value) {
	return this.curMission;
}

// ===== 每个mgr类必须实现方法 =====

pro.register = function(cb) {
	for ( let i in MissionCfg ) {
		let cfg = MissionCfg[i];
		let idStr = cfg.id.toString();
		let team = parseInt(idStr.slice(1, 3)); // 提取分组id
		if ( team > 1 ) {
			break;
		}
		// 先初始化第一组任务，当通关BOSS关卡后会开启第二组任务
		let mission = Mission.createInit(cfg.id);
	}
	cb();
}

pro.load = function(cb) {
	let self = this;
	MysqlExtend.query('SELECT missionData FROM tbl_role WHERE id=? LIMIT 1', [this.roleId], function (err, res) {
		if (err) {
			return cb(err);
		}
		let obj = JSON.parse(res[0].missionData);
		for (let i in obj.elements) {
			let missionData = obj.elements[i];
			let mission = new Mission();
			mission.load(missionData);
			self.add(mission);
		}
		self.afterLoad(cb);
	});
}

pro.afterLoad = function(cb) {
	cb(null, this);
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

