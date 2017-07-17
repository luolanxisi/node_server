"use strict";

const RoleMgr = require(ROOT_DIR +'model/role/RoleMgr').getInst();


module.exports = Handle;

function Handle() {
}

const pro = Handle.prototype;


pro.PVP_MATCH_START = function(roleId, msg, cb) {
	RoleMgr.get(roleId, function(err, role) {
		if (err) {
			return cb(err);
		}
		role.getRobotMgr(function(err, robotMgr) {
			if ( err ) {
				return cb(err);
			}
			let robot = robotMgr.getCurRobot();
			App.callRemote("connector.SystemRemote.getSteamId", roleId, {roleId:roleId}, function(err, res) {
				if ( err ) {
					return cb(err);
				}
				let args = {
					roleId  : roleId,
					steamId : res.steamId,
					// host   : res.host,
					// port   : role.getP2pPort(), // 需要存数据库
					rank    : role.getRank(),
					robot   : robot.toData()
				};
				App.callRemote("pvp.PvpRemote.join", null, args, function(err, data) {
					if ( err ) {
						return cb(err);
					}
					cb(null, data);
				});
			});
		});
	});
}

pro.PVP_BATTLE_END = function(roleId, msg, cb) {
	cb(null, {});
}

