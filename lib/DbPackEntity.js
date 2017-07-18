"use strict";

const MysqlExtend = require(ROOT_DIR +'lib/MysqlExtend').getInst();
const Dict         = require(ROOT_DIR +'lib/collection/Dict');


module.exports = DbPackEntity;

function DbPackEntity(tableName, primaryDict, fieldName) {
	this.tableName = tableName;
	this.primaryDict = primaryDict;
	this.fieldName = fieldName;
}

var pro = DbPackEntity.prototype;

pro.save = function(cb) {
	let sqlArr = [];
	let saveData = this.pack();
	let paraArr = [this.tableName, this.fieldName, JSON.stringify(saveData)];
	sqlArr.push("UPDATE ?? SET ??=? WHERE");
	let first = true;
	for (let key in this.primaryDict) {
		let value = this.primaryDict[key];
		if ( first ) {
			sqlArr.push(" ??=?");
			first = false;
		}
		else {
			sqlArr.push(" AND ??=?");
		}
		paraArr.push(key);
		paraArr.push(this[value]);
	}
	MysqlExtend.query(sqlArr.join(''), paraArr, function (err, res) {
		if (err) {
			return cb(err);
		}
		cb();
	});
}

// 保存函数，需要各继承类自身实现
pro.pack = function() {
	console.error("Must to override property pack()");
}


