"use strict";

const RoleMgr = require(ROOT_DIR +'model/role/RoleMgr').getInst();


module.exports = Handle;

function Handle() {
}

const pro = Handle.prototype;


pro.TALENT_CHANGE = function(roleId, msg, cb) {
	let talentId = msg.talentId;
	RoleMgr.get(roleId, function(err, role) {
		if (err) {
			return cb(err);
		}
		role.getRobotMgr(function(err, robotMgr) {
			if (err) {
				return cb(err);
			}
			let robot = robotMgr.getCurRobot();
			let retErr = robot.changeTalent(talentId);
			if (retErr) {
				return cb(retErr);
			}
			let retData = robot.toData();
			cb(null, retData);
		});
	});
}


