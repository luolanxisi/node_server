"use strict";

const RoleMgr = require(ROOT_DIR +'model/role/RoleMgr').getInst();


exports.beforeStartup = function(app, cb) {
	cb();
}

exports.afterStartup = function(app, cb) {
	cb();
}

exports.afterStartAll = function(app) {
}

exports.beforeShutdown = function(app, cb) {
	RoleMgr.destory(cb);
}
