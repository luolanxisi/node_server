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

pro.ROLE_UPDATE_INFO = function(roleId, msg, cb) {
	let rank       = msg.rank;
	let money      = msg.money;
	let gem        = msg.gem;
	let curMission = msg.curMission;
	let items      = msg.items;
	let curRobotId = msg.curRobotId;
	let robotList  = msg.robotList;
	let robotWarList = msg.robotWarList;
	RoleMgr.get(roleId, function(err, role) {
		if (err) {
			return cb(err);
		}
		role.setFirst();
		if (rank != null) {
			role.setRank(rank);
		}
		if (money != null) {
			role.setMoney(money);
		}
		if (gem != null) {
			role.setGem(gem);
		}
		procMission(role, curMission, function(err) {
			if (err) {
				return cb(err);
			}
			procItem(role, items, function(err) {
				if (err) {
					return cb(err);
				}
				procRobot(role, curRobotId, robotList, robotWarList, function(err) {
					if (err) {
						return cb(err);
					}
					cb(null, {});
				});
			});
		});
	});
}

function procMission(role, curMission, cb) {
	if (curMission == null) {
		cb();
	}
	else {
		role.getMissionMgr(function(err, missionMgr) {
			if (err) {
				return cb(err);
			}
			missionMgr.setCurMission(curMission);
			cb();
		});
	}
}

function procItem(role, items, cb) {
	if (items == null) {
		cb();
	}
	else {
		role.getItemMgr(function(err, itemMgr) {
			if (err) {
				return cb(err);
			}
			itemMgr.setItems(items);
			cb();
		});
	}
}

function procRobot(role, curRobotId, robotList, robotWarList, cb) {
	if (curRobotId == null && robotList == null && robotWarList == null) {
		cb();
	}
	else {
		role.getRobotMgr(function(err, robotMgr) {
			if (err) {
				return cb(err);
			}
			//
			if (curRobotId != null) {
				robotMgr.setCurRobot(curRobotId);
			}
			if (robotList != null) {
				for (let i in robotList) {
					let robotData = robotList[i];
					let robot = robotMgr.get(robotData.id);
					if (robot) {
						robot.load(robotData);
					}
					else {
						robot = robotMgr.add(robotData.id);
						if (robot) {
							robot.load(robotData);
						}
					}
				}
			}
			if (robotWarList != null) {
				robotMgr.setWarList(robotWarList);
			}
			cb();
		});
	}
}


