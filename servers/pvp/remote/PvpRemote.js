"use strict";

const pvpCmgr = require(ROOT_DIR +'model/pvp/PvpCmgr').getInst();


module.exports = Remote;

function Remote() {
}


const pro = Remote.prototype;


pro.join = function(msg, cb) {
	let roleId = msg.roleId;
	let error = pvpCmgr.join(msg, function(err, roles) {
		if ( err ) {
			return cb(err);
		}
		// let server = ServerMgr.getByType('pvp')[0];
		let data = {
			// p2pHelpHost : server.getHost(),
			// p2pHelpPort : server.getClientPort(),
			randomSeed  : Auxiliary.now(),
			roles       : roles
		};
		for (let i in roles) {
			let roleData = roles[i];
			let args = {
				roleId : roleData.roleId,
				cmd    : proto.PVP_MATCH_SUCC,
				data   : data
			};
			App.callRemote("connector.SystemRemote.send", roleData.roleId, args, Auxiliary.normalCb);
		}
	});
	if ( error ) {
		return cb(error);
	}
	cb(null, {});
}

pro.quit = function(msg, cb) {
	let roleId = msg.roleId;
	pvpCmgr.quit(roleId, function(err, res) {
		if ( err ) {
			return cb(err);
		}
		cb(null, {});
	});
}


