"use strict";

const mysql = require('mysql');


const mysqlExtend = new MysqlExtend();

function MysqlExtend() {
	// this.connection = mysql.createConnection({
	// 	host     : 'localhost',
	// 	user     : 'root',
	// 	password : '123456',
	// 	database : 'iron_fight'
	// });

	// this.connection.connect();

	// this.connection.on('error', function(err) {
	// 	console.log("mysql error:", err.code);
	// });
	//
	this.connection = mysql.createPool({
		connectionLimit : 10,
		host     : 'localhost',
		user     : 'root',
		password : '123456',
		database : 'iron_fight'
	});
}


module.exports.getInst = function() {
	return mysqlExtend;
}


const pro = MysqlExtend.prototype;

pro.query = function(sql, args, cb) {
	this.connection.query(sql, args, cb);
}

pro.close = function() {
	this.connection.end();
}
