"use strict";

const pvpCmgr = require(ROOT_DIR +'model/pvp/PvpCmgr').getInst();


module.exports = Handle;

function Handle() {
}

const pro = Handle.prototype;


pro.PVP_SCENE_READY = function(_null, msg, cb, clientSocket) {
	let roleId = msg.roleId;
	// console.error(">>>>>>>>>>>>>>>>>>", clientSocket.remoteAddress, clientSocket.remotePort);
	pvpCmgr.setReady(roleId, clientSocket.remotePort);
	cb(null, {});
}


