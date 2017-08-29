"use strict";

const net = require('net');
const fs = require('fs');
const child_process = require('child_process');

global.ROOT_DIR = __dirname +"/";

const BucketArray = require(ROOT_DIR +'lib/collection/BucketArray.js');
const RpcCallback = require(ROOT_DIR +'lib/RpcCallback.js');
const sessionMgr = require(ROOT_DIR +'lib/SessionMgr.js').getInst();
const serverMgr = require(ROOT_DIR +'lib/ServerMgr.js').getInst();
const instruct = require(ROOT_DIR +'lib/ServerInstruct.js').getDict();
const srvCfg = require(ROOT_DIR +'config/server_config.json');
const BufferPool = require(ROOT_DIR +'/lib/BufferPool');
const proto = require(ROOT_DIR +'model/network/Proto').getDict();
const protoTrans = require(ROOT_DIR +'model/network/Proto').getTransDict();
const protocolType = require(ROOT_DIR +'model/network/Proto').getTypeDict();
const TcpPackage = require(ROOT_DIR +'/lib/TcpPackage');

global.BufferPool = BufferPool;
global.ServerMgr  = serverMgr;
global.SessionMgr = sessionMgr;
global.proto      = proto;


// const port = process.argv[2];
// const srvId = process.argv[2];

// 每个Application代表一个服务端进程
function Application() {
	this.rpc = new Rpc();
	this.srvId = process.argv[2];
	let srvType = process.argv[3];
	let port = process.argv[4];
	let clientPort = process.argv[5];
	createRpcServer(port, function(err, res) {
		if (err) {
			aux.error(null, "start rpc server error", err);
			return;
		}
		// 
		if ( clientPort != "undefined" ) {
			createGameServer(clientPort, function(err, res) {
				if (err) {
					aux.error(null, "start rpc server error", err);
					return;
				}
				process.send({ ins: instruct.START_SERVER_FINISH, srvId: App.srvId});
			});
		}
		else {
			process.send({ ins: instruct.START_SERVER_FINISH, srvId: App.srvId});
		}
	});
}

Application.prototype.callRemote = function(procChain, dispatchId, msg, cb) {
	let arr = procChain.split('.');
	let srvType = arr[0];
	let remoteName = arr[1];
	let funcName = arr[2];
	let server = ServerMgr.getByDispatch(srvType, dispatchId);
	if ( server.id == App.srvId ) {
		this.rpc.remoteTypeDict[srvType][remoteName][funcName](null, msg, cb);
	}
	else {
		let cbId = App.rpc.genCb(cb);
		//
		let retBuf = BufferPool.createProtoBuffer(proto.SYS_RPC, protocolType.SERVER_REMOTE_CALL);
		retBuf.writeInt16BE(App.srvId); // srvId修改为本服，cbId不需要修改
		retBuf.writeInt16BE(cbId);
		retBuf.writeProtoString(procChain);
		let jsonStr = JSON.stringify(msg);
		retBuf.writeProtoString(jsonStr);
		server.getSocket().write(retBuf.sliceRawBuffer());
	}
}

// 分服、回掉处理
function Rpc() {
	// this.srvType = process.argv[3];
	this.handleTypeDict = {};
	this.remoteTypeDict = {};
	this.lifeCyc = null;
	this.cbList = new BucketArray(); // 远程调用回调函数
}

Rpc.prototype.init = function() {
	// 读取所有的handle和remote
	let server = ServerMgr.getById(App.srvId);
	this.readHandle(server.getType());
	this.readRemote(server.getType());
	this.readLifeCyc(server.getType());
	// server端rpc调用
	ServerMgr.regDispatch('web');
	ServerMgr.regDispatch('connector');
	ServerMgr.regDispatch('role');
	ServerMgr.regDispatch('pvp');
}

Rpc.prototype.readHandle = function(srvType) {
	let handleDict = {};
	this.handleTypeDict[srvType] = handleDict;
	let dir = ROOT_DIR +"servers/"+ srvType +"/handle";
	if (!fs.existsSync(dir)) {
		return;
	}
	let files = fs.readdirSync(dir);
	for (let i in files) {
		let file = files[i];
		if ( file.indexOf("\.js") == -1 ) {
			aux.error(null, "File in handle dir mush *.js :", file);
			continue;
		}
		let filePath = dir +"/"+ file;
		let Handle = require(filePath);
		let handleName = file.slice(0, -3);
		let handle = new Handle();
		handleDict[handleName] = handle;
	}
}

Rpc.prototype.readRemote = function(srvType) {
	let remoteDict = {};
	this.remoteTypeDict[srvType] = remoteDict;
	let dir = ROOT_DIR +"servers/"+ srvType +"/remote";
	if (!fs.existsSync(dir)) {
		return;
	}
	let files = fs.readdirSync(dir);
	for (let i in files) {
		let file = files[i];
		if ( file.indexOf("\.js") == -1 ) {
			aux.error(null, "File in remote dir mush *.js :", file);
			continue;
		}
		let filePath = dir +"/"+ file;
		let Remote = require(filePath);
		let remoteName = file.slice(0, -3);
		let remote = new Remote();
		remoteDict[remoteName] = remote;
		for (let funcName in remote) { // 以后需要分是否跨进程调用
			let orginFunc = remote[funcName];
			remote[funcName] = function(args) {
				orginFunc.apply(remote, args);
			}
		}
	}
}

Rpc.prototype.readLifeCyc = function(srvType) {
	let file = ROOT_DIR +"servers/"+ srvType +"/LifeCyc.js";
	if (!fs.existsSync(file)) {
		return;
	}
	this.lifeCyc = require(file);
}

Rpc.prototype.genCb = function(cb) {
	let rpcCallback = new RpcCallback();
	this.cbList.add(rpcCallback);
	rpcCallback.setCb(cb);
	return rpcCallback.getId();
}

Rpc.prototype.runCb = function(cbId, msg) { // 对于handle是buf，对于remote是msg
	let rpcCallback = this.cbList.remove(cbId);
	if ( msg.errCode ) {
		rpcCallback.cb(msg);
	}
	else {
		rpcCallback.cb(null, msg);
	}
}

function fitToServerHandle(clientSocket, session, buf, cmd) {
	let fitBuf = BufferPool.createBuffer();
	fitBuf.writeInt16BE(0); // len
	fitBuf.writeUInt8(protocolType.SERVER_HANDLE_CALL);
	fitBuf.writeInt16BE(cmd);
	// 新增协议，服务器id、回调函数id
	fitBuf.writeInt16BE(App.srvId);
	let cbId = App.rpc.genCb(function(err, buf) {
		if (err) {
			aux.error(null, "Error in fitToServerHandle", err);
		}
		clientSocket.write(buf.sliceRawBuffer());
	});
	fitBuf.writeInt16BE(cbId);
	fitBuf.writeUInt32BE(session.roleId); // 
	// 跳过客户端协议5字节头文件写入剩余内容
	fitBuf.writeBuffer(buf, 5);
	return fitBuf;
}

// ======== 与master进行管道通讯 ========
// 子进程间通讯回调
function onData(data) {

}

function onEnd() {
	
}

function onError(err) {
}

process.on('message', (msg) => {
	// aux.log(null, 'CHILD got message:', msg);
	switch (msg.ins) {
		case instruct.STOP:
			let lifeCyc = App.rpc.lifeCyc;
			if (lifeCyc == null || lifeCyc.beforeShutdown == null) {
				process.send({ ins: instruct.STOP, msg: 'close finish' });
				process.exit(1)
				return;
			}
			lifeCyc.beforeShutdown(App, function(err, res) {
				if (err) {
					aux.error(null, "Close server error:", err);
				}
				process.send({ ins: instruct.STOP, msg: 'close finish' });
				process.exit(1)
			});
			break;
		case instruct.SYNC_SERVER_LIST:
			serverMgr.fromData(msg.servers);
			serverMgr.setCurrentServer(App.srvId);
			App.rpc.init();
			serverMgr.each(function(srv) {
				if ( srv.id == App.srvId ) {
					return;
				}
				// 与其他socket创建连接
				const socket = net.createConnection({host:"localhost", port:srv.port}, () => {
					srv.setSocket(socket);
					socket.on('data', onData);
					socket.on('end', onEnd);
					socket.on('error', onError);
				});
			});
			break;
	}
});


function createRpcServer(port, cb) {
	// ======== 与客户端进行socket通讯，以及和其他进程进行rpc通讯 ========
	const server = net.createServer((client) => {
		aux.log(null, 'rpc connected');

		client.on('end', () => {
			aux.log(null, 'client disconnected');
		});

		client.on('error', (err) => {
			aux.log(null, 'client [rpc] error:', err);
		});

		client.on('data', (data) => {
			try {
				let buf = BufferPool.decorateBuffer(data);
				let len = buf.readInt16BE();
				let pType = buf.readUInt8();
				let cmd = buf.readInt16BE();
				let fromSrvId = buf.readInt16BE();
				let cbId = buf.readInt16BE();
				aux.log(null, "rpc data >>>>>>>>>>>>>", 'type', pType, ', cmd', cmd);
				if ( pType == protocolType.SERVER_REMOTE_CALL ) {
					let procChain = buf.readProtoString();
					let msgStr = buf.readProtoString();
					let msg = JSON.parse(msgStr);
					let arr = procChain.split('.');
					let srvType = arr[0];
					let remoteName = arr[1];
					let funcName = arr[2];
					let remote = App.rpc.remoteTypeDict[srvType][remoteName];
					aux.log(null, '>>>', procChain);
					remote[funcName]([msg, function(err, obj) { // 原remote已被替换
						let retBuf = BufferPool.createProtoBuffer(cmd, protocolType.SERVER_REMOTE_BACK);
						retBuf.writeInt16BE(App.srvId); // srvId修改为本服，cbId不需要修改
						retBuf.writeInt16BE(cbId);
						if ( err ) {
							obj = err;
						}
						else if ( obj == null ) {
							obj = {};
						}
						let jsonStr = JSON.stringify(obj);
						retBuf.writeProtoString(jsonStr);
						serverMgr.getById(fromSrvId).getSocket().write(retBuf.sliceRawBuffer());
					}]);
				}
				else if ( pType == protocolType.SERVER_REMOTE_BACK ) {
					let msgStr = buf.readProtoString();
					let msg = JSON.parse(msgStr);
					App.rpc.runCb(cbId, msg);
				}
				else {
					let arr = protoTrans[cmd].split('.');
					let srvType = arr[0];
					let handleName = arr[1];
					let funcName = arr[2];
					// aux.error(null, 'rpc handle', srvType+'.'+handleName+'.'+funcName);
					if ( pType == protocolType.SERVER_HANDLE_CALL ) { // 从rpc端过来的一定是目标服本身接收到，因此不用判断srvId
						let roleId = buf.readUInt32BE(); // 读取玩家id
						let handle = App.rpc.handleTypeDict[srvType][handleName];
						handle[funcName].call(handle, roleId, JSON.parse(buf.readProtoString()), function(err, obj) { // null参数应为session
							if ( err ) {
								obj = err;
							}
							let retBuf = BufferPool.createProtoBuffer(cmd, protocolType.SERVER_HANDLE_BACK);
							retBuf.writeInt16BE(App.srvId); // srvId修改为本服，cbId不需要修改
							retBuf.writeInt16BE(cbId);
							let jsonStr = JSON.stringify(obj);
							retBuf.writeProtoString(jsonStr);
							serverMgr.getById(fromSrvId).getSocket().write(retBuf.sliceRawBuffer());
						});
					}
					else if ( pType == protocolType.SERVER_HANDLE_BACK ) {
						let retBuf = BufferPool.createBuffer();
						retBuf.writeBuffer(buf, 0, 5); // 剔除srvId和cbId，但还未修改整理protocolType
						retBuf.writeBuffer(buf, 9);
						retBuf.setProtocolType(protocolType.CLIENT_REQUEST);
						App.rpc.runCb(cbId, retBuf); // buf永远在write时才会slice
					}
					else {
						aux.error(null, "rpc protocol type error >>>>>>>>>>>>>>>>", pType);
					}
				}
			} catch (e) {
				aux.error(null, 'rpc server error:', e);
			}
		});

		//client.setNoDelay(true);
	});

	server.on('error', (err) => {
		aux.log(null, 'application server error:', err);
	});

	server.listen(port, () => {
		aux.log(null, 'rpc start listen', port);
		cb();
	});
}

function createGameServer(port, cb) {
	// ======== 与客户端进行socket通讯，以及和其他进程进行rpc通讯 ========
	const server = net.createServer((client) => {
		aux.log(null, 'client connected');

		client.on('end', () => {
			SessionMgr.remove(client);
			aux.log(null, 'client disconnected');
		});

		client.on('error', (err) => {
			SessionMgr.remove(client);
			aux.log(null, 'client [game] error:', err);
		});


		let tcpPackage = new TcpPackage(function(data) {
			let cmd;
			try {
				// if ( client.remoteAddress == "::ffff:127.0.0.1" )
				let buf = BufferPool.decorateBuffer(data);
				let len = buf.readInt16BE();
				let pType = buf.readUInt8();
				cmd = buf.readInt16BE();
				let cbId = 0;
				let fromSrvId = 0;
				if ( pType == protocolType.SERVER_HANDLE_BACK ) {
					fromSrvId = buf.readInt16BE();
					cbId = buf.readInt16BE();
				}
				let session = SessionMgr.get(client);
				let server = ServerMgr.getCurrentServer();
				aux.error(null, "socket data >>>>>>>>>>>>>", 'len', len, ', cmd', cmd, ', real size:', data.length, server.type, server.port);
				//
				let arr = protoTrans[cmd].split('.');
				let srvType = arr[0];
				let handleName = arr[1];
				let funcName = arr[2];
				if (session == null) { // session不存在的阶段一定都是直连，主要是web和connector
					let handle = App.rpc.handleTypeDict[srvType][handleName];
					handle[funcName].call(handle, null, JSON.parse(buf.readProtoString()), function(err, obj, close) {
						let retBuf = BufferPool.createProtoBuffer(cmd, protocolType.CLIENT_REQUEST);
						let jsonStr = null;
						if ( err ) {
							jsonStr = JSON.stringify(err);
						}
						else {
							jsonStr = JSON.stringify(obj);
						}
						retBuf.writeProtoString(jsonStr);
						let retRawBuf = retBuf.sliceRawBuffer();
						let flushResult = client.write(retRawBuf);
						if (close) {
							//client.end();
						}
					}, client);
				}
				else { // 由于客户端从connector或web进，因此进入此分支必为转发
					let server = ServerMgr.getByDispatch(srvType, session.roleId);
					if ( server.id == App.srvId ) { // 直连端口，无需分服
						let handle = App.rpc.handleTypeDict[srvType][handleName];
						handle[funcName].call(handle, session.roleId, JSON.parse(buf.readProtoString()), function(err, obj) {
							let retBuf = BufferPool.createProtoBuffer(cmd, protocolType.SERVER_HANDLE_BACK);
							let jsonStr = null;
							if ( err ) {
								jsonStr = JSON.stringify(err);
							}
							else {
								jsonStr = JSON.stringify(obj);
							}
							retBuf.writeProtoString(jsonStr);
							client.write(retBuf.sliceRawBuffer());
						});
					}
					else if ( pType == protocolType.CLIENT_REQUEST ) { // 从客户端过来的请求，需要分服转发（实际上如果在connector本线程，可以直接转发）
						let fitBuf = fitToServerHandle(client, session, buf, cmd);
						server.getSocket().write(fitBuf.sliceRawBuffer());
					}
					else {
						aux.error(null, "client protocol type error >>>>>>>>>>>>>>>>", pType);
					}
				}
			} catch (e) {
				let server = ServerMgr.getCurrentServer();
				aux.log(null, "game server error", cmd, server, e);
			}
		});

		client.on('data', (data) => {
			tcpPackage.addBuffer(data);
		});

		//client.setNoDelay(true);
	});

	server.on('error', (err) => {
		aux.log(null, 'server has error', err);
	});

	server.listen(port, () => {
		aux.log(null, 'server start listen', port);
		cb();
	});
}

process.on('exit', (code) => {
	aux.log(null, `Child exited with code ${code}`);
});

process.on('close', (code, signal) => {
	aux.log(null, `child process terminated due to receipt of signal ${signal}`);
});


global.App = new Application();

// =================== 以下部分内容需要通过注册的形式给Application执行，因为GameServer只是在Master线程执行 ===================

// 游戏逻辑部分
global.Auxiliary   = require(ROOT_DIR +'lib/Auxiliary')
global.ErrorCode   = require(ROOT_DIR +'model/system/ErrorCode').getDict();
global.MysqlExtend = require(ROOT_DIR +'lib/MysqlExtend').getInst();

global.aux         = global.Auxiliary;
