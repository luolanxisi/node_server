"use strict";

const Server = require(ROOT_DIR +'lib/Server.js')


const serverMgr = new ServerMgr();

module.exports.getInst = function() {
	return serverMgr;
};

function ServerMgr() {
	this.idDict = {};
	this.typeDict = {};
	this.dispatchDict = {};
	//
	this.curSrvId = null;
	this.size = 0;
}

const pro = ServerMgr.prototype;


pro.add = function(srvId, srvType, cfg) {
	let server = new Server(srvId, srvType, cfg);
	this.idDict[srvId] = server;
	if ( this.typeDict[srvType] == null ) {
		this.typeDict[srvType] = [];
	}
	this.typeDict[srvType].push(server);
	++this.size;
}

pro.getById = function(srvId) {
	return this.idDict[srvId];
}

pro.getByType = function(srvType) {
	return this.typeDict[srvType];
}

pro.getByDispatch = function(srvType, dispatchId) {
	let idxInType = this.dispatchDict[srvType](srvType, dispatchId);
	return this.getByIdx(srvType, idxInType);
}

pro.regDispatch = function(srvType, func) {
	if ( ! func ) {
		func = normalDispatch;
	}
	this.dispatchDict[srvType] = func;
}

pro.getByIdx = function(srvType, idxInType) {
	let servers = this.typeDict[srvType];
	return servers[idxInType];
}

pro.isAllRunning = function() {
	for ( let srvId in this.idDict ) {
		let server = this.idDict[srvId];
		if ( ! server.isRunning() ) {
			return false;
		}
	}
	return true;
}

pro.each = function(cb) {
	for ( let srvId in this.idDict ) {
		cb(this.idDict[srvId]);
	}
}

pro.getSize = function() {
	return this.size;
}

pro.toData = function() {
	let data = [];
	for ( let srvId in this.idDict ) {
		let server = this.idDict[srvId];
		data.push(server.toData());
	}
	return data;
}

// 子进程用户生成master传过来的服务器列表
pro.fromData = function(data) {
	for (let i in data) {
		let srvData = data[i];
		if ( this.typeDict[srvData.type] == null ) {
			this.typeDict[srvData.type] = [];
		}
		let server = new Server(srvData.id, srvData.type, {host:srvData.host, port:srvData.port, clientPort:srvData.clientPort});
		this.typeDict[srvData.type].push(server);
		this.idDict[srvData.id] = server;
	}
}

pro.setCurrentServer = function(srvId) {
	this.curSrvId = srvId;
}

pro.getCurrentServer = function() {
	return this.idDict[this.curSrvId];
}

// 0 - (size-1)个服
function normalDispatch(srvType, id) {
	let servers = serverMgr.getByType(srvType);
	let idxInType = 0;
	if ( id != null ) {
		let size = servers.length;
		idxInType = id % size;
	}
	return idxInType;
}
