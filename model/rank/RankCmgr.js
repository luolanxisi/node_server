"use strict";


const MAX_RANK_LEVEL = 7; // 青铜、白银、黄金、白金、钻石、大师、王者

const rankCmgr = new RankCmgr();

module.exports.getInst = function () {
	return rankCmgr;
};

function RankCmgr() {
	this.rankPool = [];
	for (let i=0; i<MAX_RANK_LEVEL; ++i) {
		this.rankPool.push([]);
	}
	let self = this;
	this.tick = setInterval(function() {
		try {
			self.matchClip();
		} catch (e) {
			console.log("Rank tick error:", e);
		}
	}, 10 * 1000);
}

var pro = RankCmgr.prototype;

// 先将玩家放入匹配池，每10秒进行一次匹配，匹配采用首尾模式（最大限度避免最近两人再战）
pro.findMatch = function(host, roleId, rank, data, cb) {
	let rankLevel = Math.floor(rank / 1000);
	if (rankLevel > MAX_RANK_LEVEL) {
		rankLevel = MAX_RANK_LEVEL
	}
	this.rankPool[rankLevel].push({
		host      : host,
		roleId    : roleId,
		rank      : rank,
		robotData : data.robotData,
		cb        : cb
	});
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
		let halfIndex = parseInt(size / 2) - 1;
		for (let j=0; j<halfIndex; ++j) {
			let p1 = rankRoles[j];
			let p2 = rankRoles[size-j];
			p1.cb(null, p1, p2);
			p2.cb(null, p2, p1);
		}
		this.rankPool[i] = newArray;
	}
}

pro.destory = function() {
	clearInterval(this.tick);
}

