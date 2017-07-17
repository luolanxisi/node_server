"use strict";

const RoleMgr = require(ROOT_DIR +'model/role/RoleMgr').getInst();


module.exports = Handle;

function Handle() {
}

const pro = Handle.prototype;


pro.ROLE_SELECT_ROBOT = function(roleId, msg, cb) {
	let robotCfgId = msg.robotCfgId;
	RoleMgr.get(roleId, function(err, role) {
		if (err) {
			return cb(err);
		}
		role.getRobotMgr(function(err, robotMgr) {
			if (err) {
				return cb(err);
			}
			let retErr = robotMgr.setCurRobot(robotCfgId);
			if (retErr) {
				return cb(retErr);
			}
			cb(null, {});
		});
	});
}
