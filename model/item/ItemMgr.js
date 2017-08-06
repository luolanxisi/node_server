"use strict";

const util         = require("util");
const DbPackEntity = require(ROOT_DIR +'lib/DbPackEntity');


module.exports = ItemMgr;

function ItemMgr(roleId) {
	DbPackEntity.call(this, "tbl_role", {"id":"roleId"}, "itemData");
	this.roleId = roleId;
	this.pool = [];
}

util.inherits(ItemMgr, DbPackEntity);

const pro = ItemMgr.prototype;

pro.setItems = function(arr) {
	this.pool = arr;
}

pro.register = function(cb) {
	cb();
}

pro.load = function(cb) {
	let self = this;
	MysqlExtend.query('SELECT itemData FROM tbl_role WHERE id=? LIMIT 1', [this.roleId], function (err, res) {
		if (err) {
			return cb(err);
		}
		let obj = JSON.parse(res[0].itemData);
		self.pool = obj.elements || [];
		cb();
	});
}

pro.afterLoad = function(cb) {
	cb(null, this);
}

pro.online = function(cb) {
	cb();
}

pro.offline = function(cb) {
	cb();
}

pro.destory = function(cb) {
	cb();
}

pro.pack = function() {
	let ret = {
		elements : this.pool
	};
	return ret;
}

pro.toData = function() {
	let ret = {
		elements : this.pool
	};
	return ret;
}


