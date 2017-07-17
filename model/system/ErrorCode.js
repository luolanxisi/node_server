"use strict";


const dict = {
	SERVER_ERROR     : 1,
	LOGIN_ERROR      : 2,
	LOAD_ROLE        : 3,
	LOAD_MISSION     : 4,
	GET_MISSION      : 5,
	MISSION_NOT_EXIST : 6,
	PVP_JOIN_EXISTS  : 7,
	REQUEST_STEAM_ID : 8,
	CREATE_ROLE      : 9,
	CREATE_SESSION   : 10,
	EQUIP_UNFIX_ROBOT : 11, // 当前装备机器人无法使用
	EQUIP_NOT_HAVE : 12,
	ROBOT_NOT_EXIST : 13,
	MONEY_NOT_ENOUGH : 14,
	GEM_NOT_ENOUGH : 15,
	ROBOT_LEVEL_NOT_ENOUGH : 16,
};

exports.getDict = function() {
	return dict;
}
