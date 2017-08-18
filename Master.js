"use strict";

const net = require('net');
const fs = require('fs');
const childProcess = require('child_process');

global.ROOT_DIR = __dirname +"/";

const serverMgr = require(ROOT_DIR +'lib/ServerMgr.js').getInst();
const instruct = require(ROOT_DIR +'lib/ServerInstruct.js').getDict();
const masterCfg = require(ROOT_DIR +'config/master_config.json');
const srvCfg = require(ROOT_DIR +'config/server_config.json');


function Master() {
	this.srvDict = {};
	this.msgCount = 0;
	this.init();
}

const pro = Master.prototype;

pro.init = function() {
	let srvId = 0;
	for (let srvType in srvCfg) {
		let servers = srvCfg[srvType];
		for ( let i in servers ) {
			let cfg = servers[i];
			// let logFile = 'log/'+ cfg.port +'.log';
			// if (fs.existsSync(logFile)) {
			// 	fs.unlinkSync(logFile);
			// }
			// let out = fs.openSync(logFile, 'a');
			// let err = fs.openSync(logFile, 'a');
			// this.srvDict[cfg.port] = childProcess.fork(ROOT_DIR +"Application.js", [srvId, srvType, cfg.port, cfg.clientPort]);
			// this.srvDict[cfg.port] = childProcess.spawn("nohup", ['node', ROOT_DIR +"Application.js", srvId, srvType, cfg.port, cfg.clientPort], {stdio:[process.stdin, process.stdout, process.stderr, 'ipc']});
			// this.srvDict[cfg.port] = childProcess.spawn("node", [ROOT_DIR +"Application.js", srvId, srvType, cfg.port, cfg.clientPort], {detached: true, stdio:['ignore', out, err, 'ipc']});
			this.srvDict[cfg.port] = childProcess.spawn("node", [ROOT_DIR +"Application.js", srvId, srvType, cfg.port, cfg.clientPort], {stdio:[process.stdin, process.stdout, process.stderr, 'ipc']});
			serverMgr.add(srvId, srvType, cfg);
			++srvId;
			this.regMessage(this.srvDict[cfg.port], cfg.port);
		}
	}
}

pro.regMessage = function(child, port) {
	let self = this;
	child.on('message', (msg) => {
		switch (msg.ins) {
			case instruct.START_SERVER_FINISH:
				let server = serverMgr.getById(msg.srvId);
				server.setRunning(true);
				if ( serverMgr.isAllRunning() ) {
					// 给所有子进程发送服务器列表，并互相建立
					for (let i in this.srvDict) {
						let srv = this.srvDict[i];
						srv.send({ins: instruct.SYNC_SERVER_LIST, servers: serverMgr.toData()});
					}
				}
				break;
			case instruct.STOP:
				++this.msgCount;
				if (this.msgCount == serverMgr.getSize()) {
					console.log('close all server', this.msgCount);
					process.exit(1)
				}
				break;
		}
	});
}

// 与控制台通讯接口
const server = net.createServer((client) => {
	console.log('client connected');

	client.on('end', () => {
		console.log('client disconnected');
	});

	client.on('error', (err) => {
		console.log('client error:', err);
	});

	client.on('data', (data) => {
		try {
			switch (data.toString()) {
				case 'stop':
					for (let i in master.srvDict) {
						let srv = master.srvDict[i];
						console.log('stop port:', i);
						srv.send({ins: instruct.STOP});
						// srv.kill('SIGHUP');
					}
					break;
			}
		} catch (e) {
			console.error(e);
		}
	});

	//client.setNoDelay(true);
});

server.on('error', (err) => {
	console.log('master server error:', err);
});

server.listen(masterCfg.port, () => {
	console.log('server start listen', masterCfg.port);
});

process.on('close', (code, signal) => {
	console.log(`master process terminated due to receipt of signal ${signal}`);
});


const master = new Master();

module.exports.getInst = function() {
	return master;
}
