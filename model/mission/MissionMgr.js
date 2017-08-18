"use strict";

const util         = require("util");
const DbPackEntity = require(ROOT_DIR +'lib/DbPackEntity');
const MissionCfg   = require(ROOT_DIR +'data/MissionCfg.json');
const Mission      = require(ROOT_DIR +'model/mission/Mission');
const Dict         = require(ROOT_DIR +'lib/collection/Dict');


module.exports = MissionMgr;

function MissionMgr(roleId) {
	DbPackEntity.call(this, "tbl_role", {"id":"roleId"}, "missionData");
	this.roleId = roleId;
	this.curMission = [];
}

util.inherits(MissionMgr, DbPackEntity);

const pro = MissionMgr.prototype;


// pro.add = function(mission) {
// 	this.pool.add(mission.getId(), mission);
// }

// pro.get = function(id) {
// 	return this.pool.get(id);
// }

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
		this.curMission = [parseInt(cfg.id)];
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
		self.curMission = obj.curMission || [];
		cb();
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
	let ret = {
		curMission : this.curMission
	};
	return ret;
}

pro.toData = function() {
	let ret = {
		curMission : this.curMission
	};
	return ret;
}
