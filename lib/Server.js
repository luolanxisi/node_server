"use strict";


module.exports = Server;

function Server(srvId, srvType, cfg) {
	this.id   = srvId;
	this.type = srvType;
	this.host = cfg.host;
	this.port = cfg.port;
	this.clientPort = cfg.clientPort || null;
	this.running = false; // true表示运行中，false表示已关闭
	this.socket = null; // 与该服务进程通讯的接口，master为null
}

const pro = Server.prototype;

pro.getId = function() {
	return this.id;
}

pro.getType = function() {
	return this.type;
}

pro.getHost = function() {
	return this.host;
}

pro.getPort = function() {
	return this.port;
}

pro.getClientPort = function() {
	return this.clientPort;
}

pro.setRunning = function(value) {
	this.running = value;
}

pro.isRunning = function() {
	return this.running;
}

pro.setSocket = function(value) {
	this.socket = value;
}

pro.getSocket = function() {
	return this.socket;
}

pro.toData = function() {
	return {
		id   : this.id,
		type : this.type,
		host : this.host,
		port : this.port,
		clientPort : this.clientPort
	};
}


