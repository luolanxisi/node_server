"use strict";


module.exports = Handle;

function Handle() {
}

const pro = Handle.prototype;

pro.ROLE_LOGIN = function(_null, msg, cb, clientSocket) {
	let ticket = msg.ticket;
	let session = SessionMgr.checkAndCreate(ticket, clientSocket);
	if ( session ) {
		App.callRemote("role.RoleRemote.online", session.roleId, {roleId:session.roleId}, function(err, res) {
			if (err) {
				return cb(Auxiliary.createError(ErrorCode.CREATE_SESSION));
			}
			cb(null, res);
		});
	}
	else {
		cb(Auxiliary.createError(ErrorCode.CREATE_SESSION));
	}
}


