"use strict";


const dict = {
	// 系统（内部调用，不与客户端交互）
	SYS_RPC          : 0,
	//SYS_RTT          : 1,
	// 平台
	WEB_STEAM_TICKET : 100, // 平台验证
	// 角色
	ROLE_LOGIN        : 200, // 角色登陆
	ROLE_SELECT_ROBOT : 210, // 改变使用机器人
	ROLE_UPDATE_INFO  : 211, // 改变玩家数据
	// 装备
	EQUIP_CHANGE     : 300, // 更换装备
	EQUIP_UPDATE     : 301, // 装备升级（升级后原来装备将消失）
	// 天赋
	TALENT_CHANGE    : 400, // 更换天赋
	// PVP竞技
	PVP_MATCH_START  : 500, // 匹配对手
	PVP_MATCH_SUCC   : 501, // 匹配成功（派发双方数据）
	PVP_BATTLE_END   : 502, // 战斗结算
	PVP_SCENE_READY  : 503, // 上报战斗准备完成
	PVP_SCENE_ALL_READY : 504, // 所有人准备完成，向对连双方派发对方地址
	// PVP_P2P_READY    : 504, // p2p连接完成
	// 任务
	MISSION_START    : 600, // 开始任务
	MISSION_COMPLETE : 601, // 任务完成
	MISSION_FAILURE  : 602, // 任务失败
	// 测试用GM指令
	GM_GIVE_ROBOT : 2000, // 获得机器人
	GM_GIVE_EQUIP : 2001, // 获得装备
	GM_GIVE_MONEY : 2002, // 获得金钱
	GM_ROBOT_SET_LEVEL : 2003, // 设置机器人等级
};

exports.getDict = function() {
	return dict;
}

// handle对应的字典可自行生成，关键是名字不能相同，且函数名要与key相同
const transDict = {};
// 系统协议族
transDict[dict.SYS_RPC]          = "connector.SteamHandle.SYS_RPC";
transDict[dict.SYS_RTT]          = "connector.SystemHandle.SYS_RTT";
// 平台
transDict[dict.WEB_STEAM_TICKET] = "web.SteamHandle.WEB_STEAM_TICKET";
// 角色
transDict[dict.ROLE_LOGIN]        = "connector.RoleHandle.ROLE_LOGIN";
transDict[dict.ROLE_SELECT_ROBOT] = "role.RoleHandle.ROLE_SELECT_ROBOT";
transDict[dict.ROLE_UPDATE_INFO]  = "role.RoleHandle.ROLE_UPDATE_INFO";
// 装备										
transDict[dict.EQUIP_CHANGE]     = "role.EquipHandle.EQUIP_CHANGE";
transDict[dict.EQUIP_UPDATE]     = "role.EquipHandle.EQUIP_UPDATE";
// 天赋
transDict[dict.TALENT_CHANGE]    = "role.TalentHandle.TALENT_CHANGE";
// PVP竞技
transDict[dict.PVP_MATCH_START]  = "role.PvpHandle.PVP_MATCH_START";
transDict[dict.PVP_MATCH_SUCC]   = "role.PvpHandle.PVP_MATCH_SUCC";
transDict[dict.PVP_BATTLE_END]   = "role.PvpHandle.PVP_BATTLE_END";
transDict[dict.PVP_SCENE_READY]  = "pvp.PvpHandle.PVP_SCENE_READY";
// 任务
transDict[dict.MISSION_START]    = "role.MissionHandle.MISSION_START";
transDict[dict.MISSION_COMPLETE] = "role.MissionHandle.MISSION_COMPLETE";
transDict[dict.MISSION_FAILURE]  = "role.MissionHandle.MISSION_FAILURE";
// 测试用GM指令
transDict[dict.GM_GIVE_ROBOT]  = "role.GmHandle.GM_GIVE_ROBOT";
transDict[dict.GM_GIVE_EQUIP]  = "role.GmHandle.GM_GIVE_EQUIP";
transDict[dict.GM_GIVE_MONEY]  = "role.GmHandle.GM_GIVE_MONEY";
transDict[dict.GM_ROBOT_SET_LEVEL]  = "role.GmHandle.GM_ROBOT_SET_LEVEL";


exports.getTransDict = function() {
	return transDict;
}


const typeDict = {
	CLIENT_REQUEST      : 1, // 正常客户端服务端通讯
	SERVER_HANDLE_CALL  : 10, // 转发handle调用
	SERVER_HANDLE_BACK  : 11, // 转发handle回复
	SERVER_REMOTE_CALL  : 12, // 转发remote专用
	SERVER_REMOTE_BACK  : 13 // 转发remote专用
};

exports.getTypeDict = function() {
	return typeDict;
}

