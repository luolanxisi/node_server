"use strict";

const RoleMgr = require(ROOT_DIR +'model/role/RoleMgr').getInst();


module.exports = Handle;

function Handle() {
}


const pro = Handle.prototype;


pro.MISSION_START = function(roleId, msg, cb) {
	let missionId = msg.missionId;
	RoleMgr.get(roleId, function(err, role) {
		if (err) {
			return cb(err);
		}
		role.getMissionMgr(function(err, missionMgr) {
			if (err) {
				return cb(err);
			}
			missionMgr.setCurMission(missionId);
			role.getRobotMgr(function(err, robotMgr) {
				if (err) {
					return cb(err);
				}
				let robot = robotMgr.getCurRobot();
				let retData = robot.toData();
				cb(null, retData);
			});
		});
	});
}

pro.MISSION_COMPLETE = function(roleId, msg, cb) {
	let missionId = msg.missionId;
	RoleMgr.get(roleId, function(err, role) {
		if (err) {
			return cb(err);
		}
		role.getMissionMgr(function(err, missionMgr) {
			if (err) {
				return cb(err);
			}
			let missionId = missionMgr.getCurMission();
			let mission = missionMgr.get(missionId);
			if ( ! mission ) {
				return cb(ErrorCode.MISSION_NOT_EXIST);
			}
			let retData = {
				score : mission.getScore(),
				gold : mission.getGold()
			};
			console.error(retData);
			cb(null, retData);
		});
	});
}

pro.MISSION_FAILURE = function(roleId, msg, cb) {
	// let writeBuf = BufferPool.createProtoBuffer(this.cmd);
	// role.getMissionMgr(function(err, missionMgr) {
	// 	if (err) {
	// 		return cb(ErrorCode.SERVER_ERROR);
	// 	}
	// 	cb(null, writeBuf);
	// });
	cb(null, {});
}

