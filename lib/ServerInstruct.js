"use strict";


const dict = {
	STOP                : 1, // 停服
	START_SERVER_FINISH : 2, // 子进程创建服务器结束
	SYNC_SERVER_LIST    : 3 // 同步服务器列表
};

exports.getDict = function() {
	return dict;
}
