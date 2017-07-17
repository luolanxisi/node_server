"use strict";


module.exports = Remote;

function Remote() {
}


const pro = Remote.prototype;

pro.getHost = function(msg, cb) {
	let roleId = msg.roleId;
	let session = SessionMgr.getById(roleId);
	cb(null, {host:session.socket.remoteAddress});
}

pro.getSteamId = function(msg, cb) {
	let roleId = msg.roleId;
	let session = SessionMgr.getById(roleId);
	cb(null, {steamId:session.steamId});
}

pro.send = function(msg, cb) {
	let roleId = msg.roleId;
	let cmd    = msg.cmd;
	let data   = msg.data;
	SessionMgr.sendById(roleId, cmd, data);
	cb();
}


