"use strict";

const RoleMgr = require(ROOT_DIR +'model/role/RoleMgr').getInst();


module.exports = Remote;

function Remote() {
}


const pro = Remote.prototype;


pro.online = function(msg, cb) {
	let roleId = msg.roleId;
	RoleMgr.get(roleId, function(err, role) {
		if (err) {
			return cb(err);
		}
		role.setOnline(function(err, res) {
			if (err) {
				return cb(err);
			}
			role.packLoginData(function(err, res) {
				if (err) {
					return cb(err);
				}
				cb(null, res);
			});
		});
	});
}

pro.offline = function(msg, cb) {
	let roleId = msg.roleId;
	RoleMgr.get(roleId, function(err, role) {
		if (err) {
			return cb(err);
		}
		role.setOffline(cb);
	});
}


