"use strict";


const MAX_RANK_LEVEL = 7; // 青铜、白银、黄金、白金、钻石、大师、王者

const instance = new PvpCmgr();

module.exports.getInst = function () {
	return instance;
};

function PvpCmgr() {
	this.joinHash = {}; // 已经参加
	this.rankPool = [];
	for (let i=0; i<MAX_RANK_LEVEL; ++i) {
		this.rankPool.push([]);
	}
	let self = this;
	this.tick = setInterval(function() {
		try {
			self.matchClip();
		} catch (e) {
			console.log("Match tick error:", e);
		}
	}, 3000); // 10000
}

const pro = PvpCmgr.prototype;

// 先将玩家放入匹配池，每10秒进行一次匹配，匹配采用首尾模式（最大限度避免最近两人再战）
pro.join = function(data, cb) {
	let rankLevel = Math.floor(data.rank / 1000);
	if (rankLevel > MAX_RANK_LEVEL) {
		rankLevel = MAX_RANK_LEVEL;
	}
	let obj = {
		steamId : data.steamId,
		// host   : data.host,
		roleId  : data.roleId,
		rank    : data.rank,
		// port   : data.port,
		robot   : data.robot,
		cb      : cb
	};
	if ( this.joinHash[data.roleId] ) {
		this.exchange(data.roleId, obj);
	}
	else {
		this.joinHash[data.roleId] = obj; // 跨服版本需要根据服务器来源和roleId一起判断
		this.rankPool[rankLevel].push(obj);
	}
}

pro.quit = function(roleId) {
	let obj = this.joinHash[roleId];
	if (obj == null) {
		return;
	}
	delete this.joinHash[roleId];
	let rankLevel = Math.floor(obj.rank / 1000);
	let list = this.rankPool[rankLevel];
	for (let i in list) {
		if (obj.roleId == list[i].roleId) {
			list.splice(i, 1);
			break;
		}
	}
}

pro.exchange = function(roleId, newObj) {
	let obj = this.joinHash[roleId];
	this.joinHash[roleId] = newObj;
	let rankLevel = Math.floor(obj.rank / 1000);
	let list = this.rankPool[rankLevel];
	for (let i in list) {
		if (roleId == list[i].roleId) {
			list[i] = newObj;
			return;
		}
	}
	list.push(newObj); // 找不到代表已进入战斗
}

pro.matchClip = function() {
	for (let i=0; i<MAX_RANK_LEVEL; ++i) {
		let newArray = [];
		let rankRoles = this.rankPool[i];
		let size = 0; // 参与本次匹配的个数需要为偶数，舍弃最后一个
		if (rankRoles.length % 2 == 0) {
			size = rankRoles.length;
		}
		else {
			size = rankRoles.length - 1;
			newArray.push(rankRoles.pop()); // 被舍弃的最后一个参与到下次匹配中去
		}
		let halfIndex = parseInt(size / 2);
		for (let j=0; j<halfIndex; ++j) {
			let p1 = rankRoles[j];
			let p2 = rankRoles[size-j-1];
			p1.cb(null, [p1, p2]);
			p1.enemy = p2;
			p2.enemy = p1;
			p1.p2pPort = 0;
			p2.p2pPort = 0;
		}
		this.rankPool[i] = newArray;
	}
}

pro.setReady = function(roleId, port) {
	let obj = this.joinHash[roleId];
	obj.p2pPort = port;
	let enemy = obj.enemy;
	if ( enemy.p2pPort != 0 ) {
		let p2pInfo = {};
		p2pInfo[obj.roleId]   = obj.p2pPort;
		p2pInfo[enemy.roleId] = enemy.p2pPort;
		let data = {p2pInfo:p2pInfo, startTime:Auxiliary.now()+5};
		App.callRemote("connector.SystemRemote.send", null, {roleId:obj.roleId, cmd:proto.PVP_SCENE_ALL_READY, data:data}, Auxiliary.normalCb);
		App.callRemote("connector.SystemRemote.send", null, {roleId:enemy.roleId, cmd:proto.PVP_SCENE_ALL_READY, data:data}, Auxiliary.normalCb);
	}
}

pro.destory = function() {
	clearInterval(this.tick);
}


