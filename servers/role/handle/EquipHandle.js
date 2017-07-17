"use strict";

const RoleMgr = require(ROOT_DIR +'model/role/RoleMgr').getInst();


module.exports = Handle;

function Handle() {
}

const pro = Handle.prototype;


pro.EQUIP_CHANGE = function(roleId, msg, cb) {
	let equipCfgId = msg.equipCfgId;
	RoleMgr.get(roleId, function(err, role) {
		if (err) {
			return cb(err);
		}
		role.getRobotMgr(function(err, robotMgr) {
			if (err) {
				return cb(err);
			}
			if (!robotMgr.hasEquip(equipCfgId)) {
				return cb(Auxiliary.createError(ErrorCode.EQUIP_NOT_HAVE, 'Eqiup not exist'));
			}
			let robot = robotMgr.getCurRobot();
			let retErr = robot.changeEquip(equipCfgId);
			if (retErr) {
				return cb(retErr);
			}
			let retData = robot.toData();
			cb(null, retData);
		});
	});
}

pro.EQUIP_UPDATE = function(roleId, msg, cb) {
	let equipCfgId = msg.equipCfgId;
	RoleMgr.get(roleId, function(err, role) {
		if (err) {
			return cb(err);
		}
		role.getRobotMgr(function(err, robotMgr) {
			if (err) {
				return cb(err);
			}
			if (!robotMgr.hasEquip(equipCfgId)) {
				return cb(Auxiliary.createError(ErrorCode.EQUIP_NOT_HAVE, 'Eqiup not exist'));
			}
			// 需要在RobotMgr中检查对应装备是否开放
			let robot = robotMgr.getCurRobot();
			let retErr = robot.updateEquip(role, equipCfgId);
			if (retErr) {
				return cb(retErr);
			}
			let retData = robot.toData();
			cb(null, retData);
		});
	});
}


