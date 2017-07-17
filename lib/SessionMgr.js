"use strict";

const protocolType = require(ROOT_DIR +'model/network/Proto').getTypeDict();

const instance = new SessionMgr();

module.exports.getInst = function() {
	return instance;
};

// SessionMgr只能在connector使用
function SessionMgr() {
	this.ticketDict = {};
	this.socketPool = {};
	this.idPool = {};
}

const pro = SessionMgr.prototype;


pro.get = function(socket) {
	return this.socketPool[this.getSocketHash(socket)];
}

pro.getById = function(roleId) {
	return this.idPool[roleId];
}

pro.remove = function(socket) {
	let key = this.getSocketHash(socket);
	let session = this.socketPool[key];
	if (session) {
		delete this.idPool[session.roleId];
		delete this.socketPool[key];
		App.callRemote("role.RoleRemote.offline", session.roleId, {roleId:session.roleId}, Auxiliary.normalCb);
	}
	return session;
}

pro.addTicket = function(roleId, ticket, steamId, expire) {
	this.ticketDict[ticket] = {roleId:roleId, ticket:ticket, steamId:steamId, expire:expire};
}

pro.checkAndCreate = function(ticket, socket) {
	let session = this.ticketDict[ticket];
	if ( session == null ) {
		return null;
	}
	delete this.ticketDict[ticket];
	if ( Auxiliary.now() > session.expire ) {
		return null;
	}
	delete session.ticket;
	delete session.expire;
	session.socket = socket;
	let key = this.getSocketHash(socket);
	this.socketPool[key] = session;
	this.idPool[session.roleId] = session;
	return session;
}

pro.sendById = function(roleId, cmd, args) {
	let session = this.idPool[roleId];
	let retBuf = BufferPool.createProtoBuffer(cmd, protocolType.CLIENT_REQUEST);
	let jsonStr = JSON.stringify(args);
	retBuf.writeProtoString(jsonStr);
	session.socket.write(retBuf.sliceRawBuffer());
}

pro.getSocketHash = function(socket) {
	return socket.remoteAddress +'_'+ socket.remotePort;
}
