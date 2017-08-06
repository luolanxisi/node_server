"use strict";

const https = require('https');


module.exports = Handle;

function Handle() {
}

const pro = Handle.prototype;


pro.WEB_STEAM_TICKET = function(role, msg, cb) {
	let ticket = msg.ticket; // ticket.toString('hex')
	// let time   = msg.time; // 临时测试代码

	const options = {
		hostname: 'api.steampowered.com',
		port: 443,
		path: '/ISteamUserAuth/AuthenticateUserTicket/v0001/?key=1FC2213F37BF615B29EFC2F08264F545&appid=480&ticket='+ ticket,
		method: 'GET'
	};

	// ticket += time; // 临时测试代码

	const req = https.request(options, (res) => {
		//console.log('statusCode:', res.statusCode);
		//console.log('headers:', res.headers);

		res.on('data', (data) => {
			const obj = JSON.parse(data);
			if ( obj.response.error ) {
				return cb(Auxiliary.createError(ErrorCode.REQUEST_STEAM_ID, obj.response.error.errordesc), null, true);
			}
			const steamId = obj.response.params.steamid;
			const platformId = steamId;
			// const platformId = steamId.slice(0, 9) - parseInt(time); // 临时测试代码
			// 该处还未保证sql执行原子性
			MysqlExtend.query('SELECT roleId FROM tbl_platform WHERE id=? LIMIT 1', [platformId], function (err, res) {
				if (err) {
					console.log(err);
					return cb(Auxiliary.createError(ErrorCode.CREATE_ROLE), null, true);
				}
				if ( res.length == 0 ) { // 新建账号
					let regTime = Math.floor((new Date()).getTime() / 1000);
					MysqlExtend.query("INSERT INTO tbl_role(name, regTime, lastLogin, missionData, robotData, itemData) VALUES(?, ?, ?, '{}', '{}', '{}')", ['Guest', regTime, regTime], function (err, res) {
						if (err) {
							console.log(err);
							return cb(Auxiliary.createError(ErrorCode.CREATE_ROLE), null, true);
						}
						let roleId = res.insertId;
						// console.error(roleId);
						MysqlExtend.query('INSERT INTO tbl_platform(id, roleId) VALUES(?, ?)', [platformId, roleId], function (err, res) {
							if (err) {
								console.log(err);
								return cb(Auxiliary.createError(ErrorCode.CREATE_ROLE), null, true);
							}
							loginSucc(roleId, ticket, steamId, cb);
						});
					});
				}
				else {
					let roleId = res[0].roleId;
					loginSucc(roleId, ticket, steamId, cb);
				}
			});
		});
	});

	req.on('error', (e) => {
		cb(Auxiliary.createError(ErrorCode.REQUEST_STEAM_ID, e), null, true);
	});

	req.end();
}

function loginSucc(roleId, ticket, steamId, cb) {
	// 分服
	let server = ServerMgr.getByDispatch('connector', roleId);
	let args = {
		roleId  : roleId,
		ticket  : ticket,
		steamId : steamId,
		expire  : Auxiliary.now() + 300
	};
	App.callRemote("connector.RoleRemote.webLogin", roleId, args, function(err, res) {
		if ( err ) {
			return cb(Auxiliary.createError(ErrorCode.CREATE_ROLE), null, true);
		}
		cb(null, {host:server.getHost(), port:server.getClientPort()}, true);
	});
}
