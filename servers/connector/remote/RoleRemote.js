"use strict";

const RoleMgr = require(ROOT_DIR +'model/role/RoleMgr').getInst();


module.exports = Remote;

function Remote() {
}


const pro = Remote.prototype;


pro.webLogin = function(msg, cb) {
	let roleId  = msg.roleId;
	let ticket  = msg.ticket;
	let steamId = msg.steamId;
	let expire  = msg.expire;
	SessionMgr.addTicket(roleId, ticket, steamId, expire);
	cb(null, {});
}


