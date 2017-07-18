"use strict";

const RoleMgr = require(ROOT_DIR +'model/role/RoleMgr').getInst();


module.exports = Handle;

function Handle() {
}

const pro = Handle.prototype;


pro.GM_GIVE_ROBOT = function(roleId, msg, cb) {
	let list = msg.robotCfgIds;
	RoleMgr.get(roleId, function(err, role) {
		if (err) {
			return cb(err);
		}
		role.getRobotMgr(function(err, robotMgr) {
			if (err) {
				return cb(err);
			}
			for (let i in list) {
				let robotCfgId = list[i];
				robotMgr.add(robotCfgId);
			}
			cb(null, {});
		});
	});
}

pro.GM_GIVE_EQUIP = function(roleId, msg, cb) {
	let list = msg.equipCfgIds;
	RoleMgr.get(roleId, function(err, role) {
		if (err) {
			return cb(err);
		}
		role.getRobotMgr(function(err, robotMgr) {
			if (err) {
				return cb(err);
			}
			let retErr;
			for (let i in list) {
				let equipCfgId = list[i];
				retErr = robotMgr.addEquip(equipCfgId);
			}
			if (retErr) {
				cb(retErr);
			}
			cb(null, {});
		});
	});
}

pro.GM_GIVE_MONEY = function(roleId, msg, cb) {
	let money = msg.money;
	let gem = msg.gem;
	RoleMgr.get(roleId, function(err, role) {
		if (err) {
			return cb(err);
		}
		role.addMoney(money);
		role.addGem(gem);
		cb(null, {});
	});
}

pro.GM_ROBOT_SET_LEVEL = function(roleId, msg, cb) {
	let level = msg.level;
	RoleMgr.get(roleId, function(err, role) {
		if (err) {
			return cb(err);
		}
		role.getRobotMgr(function(err, robotMgr) {
			if (err) {
				return cb(err);
			}
			let robot = robotMgr.getCurRobot();
			robot.setLevel(level);
			let retData = robot.toData();
			cb(null, retData);
		});
	});
}

