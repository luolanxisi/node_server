"use strict";

const RoleMgr = require(ROOT_DIR +'model/role/RoleMgr').getInst();


module.exports = Handle;

function Handle() {
}


const pro = Handle.prototype;


pro.CONFIG_P2PPort = function(roleId, msg, cb) {
	let port = msg.port;
	RoleMgr.get(roleId, function(err, role) {
		role.setP2pPort();
		cb(null, {});
	});
}

