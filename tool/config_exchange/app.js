"use strict";

const fs = require('fs');
const csv = require("fast-csv");

const DATA_ANIMATION_ACTION = "../../../config/AnimationActionData.csv";
const DATA_DEGREE_EXP       = "../../../config/ExpData.csv";
const DATA_EQUIP            = "../../../config/ItemData.csv";
const DATA_MISSION          = "../../../config/MissionData.csv";
const DATA_ROBOT            = "../../../config/RoBotAttributesData.csv";
const DATA_ROBOT_CHARACTER  = "../../../config/RoBotSkeletonData.csv";
const DATA_TALENT_TREE      = "../../../config/RobotTalentData.csv";
const DATA_TALENT_BASE      = "../../../config/TalentData.csv"

const allNameDict = {}; // 文件表
const allIdxDict = {};  // 各文件字段索引表
const allProcDict = {}; // 各文件后续处理表
const allResultDict = {};


function parseAllConfig() {
	for (let key in allNameDict) {
		let nameDict = allNameDict[key];
		let firstRow = true;
		let result = [];
		csv.fromPath(key)
			.on("data", function(data){
				if ( firstRow ) {
					console.error(key);
					firstRow = false;
					parseHead(data, key, nameDict);
				}
				else {
					parseRow(data, key, result);
				}
			})
			.on("end", function(){
				allProcDict[key](result);
				allResultDict[key] = result;
				console.error('end', key);
			});
	}
}

function parseHead(row, key, nameDict) {
	let idxDict = {};
	for ( let i in row ) {
		let colName = row[i];
		if ( nameDict[colName] != null ) {
			idxDict[i] = nameDict[colName];
		}
	}
	allIdxDict[key] = idxDict;
}

function parseRow(row, key, table) {
	let idxDict = allIdxDict[key];
	let obj = {};
	for (let i in row) {
		if ( idxDict[i] != null ) {
			obj[idxDict[i]] = row[i];
		}
	}
	table.push(obj);
}


// 动作表，普通攻击和组合技的消耗、加成
allNameDict[DATA_ANIMATION_ACTION] = {
	'id_'                 : 'id',      // 动作id
	'attack_type_'        : 'type',    // 攻击类型
	'energy_consumption_' : 'engCost', // 动作能量消耗
	'attack_'             : 'attack',  // 攻击加成
	'cd_position_'        : 'cdPart',  // 该动作的cd时间根据哪个部位计算（每个部位cd时间不一样）
	'cd_time_'            : 'cd',      // 额外cd时间
	'attack_position_'    : 'dmgPart'  // 受击部位
};

allProcDict[DATA_ANIMATION_ACTION] = function(data) {
	fs.open('../../data/ActionCfg.json', 'w', (err, fd) => {
		if (err) {
			console.error(err);
			return;
		}
		fs.write(fd, JSON.stringify(data));
	});
};

// 机器人熟练度（分多种不同经验线）
allNameDict[DATA_DEGREE_EXP] = {
	'id_'    : 'id',
	'exp_1_' : 'exp1', // 熟练度等级
	'exp_2_' : 'exp2',
	'exp_3_' : 'exp3',
	'exp_4_' : 'exp4',
	'exp_5_' : 'exp5',
	'exp_6_' : 'exp6',
	'talent_id_1_' : 'talentId1', // 对应加成使用的天赋
	'talent_id_2_' : 'talentId2',
	'talent_id_3_' : 'talentId3',
	'talent_id_4_' : 'talentId4',
	'talent_id_5_' : 'talentId5',
	'talent_id_6_' : 'talentId6',
};

allProcDict[DATA_DEGREE_EXP] = function(data) {
	let dict = {};
	for (let i in data) {
		let row = data[i];
		for (let key in row) {
			row[key] = parseInt(row[key]);
		}
		//
		let newRow = {expList:[], talentIds:[]};
		for (let j=1; j<=6; ++j ) {
			newRow.expList.push(row["exp"+j]);
			newRow.talentIds.push(row["talentId"+j]);
		}
		dict[row.id] = newRow;
	}
	data = dict;
	fs.open('../../data/DegreeCfg.json', 'w', (err, fd) => {
		if (err) {
			console.error(err);
			return;
		}
		fs.write(fd, JSON.stringify(data));
	});
};

// 装备
allNameDict[DATA_EQUIP] = {
	'id_'                 : 'id',
	// 'name_'               : 'name',
	'game_money_'         : 'money',       // 金钱
	'real_money_'         : 'gem',         // 宝石
	'type_'               : 'part',        // 部位
	'armor_'              : 'hp',          // 生命
	'defense_'            : 'def',         // 防御
	'attack_'             : 'atk',         // 攻击
	'energy_consumption_' : 'engCost',     // 额外能量消耗（消耗更大）
	// 'cd_'                 : '',         // 额外cd消耗
	'energy_'             : 'eng',         // 能量
	'energy_recover_'     : 'engRec',      // 能量恢复
	'critrate_'           : 'critRate',    // 暴击概率
	'energy_reduce_rate_' : 'engReduce',   // 能量消耗减少
	// 'cd_reduce_rate_'     : '',         // cd降低
	'immune_crit_'        : 'critDef',     // 抗暴率
	'next_item_id_'       : 'nextEquipId', // 下一解锁装备id
	'current_level_'      : 'initlevel',   // 初始等级
	'max_level_'          : 'maxLevel',     // 最大可升等级
	'robot_skeletal_id_'  : 'robotCfgId' // 可装备机器人的cfg id
};

allProcDict[DATA_EQUIP] = function(data) {
	let dict = {};
	for (let i in data) {
		let row = data[i];
		for (let key in row) {
			if ( row[key] == "" ) {
				delete row[key];
			}
			else {
				row[key] = parseInt(row[key]);
			}
		}
		dict[row.id] = row;
	}
	data = dict;
	fs.open('../../data/EquipCfg.json', 'w', (err, fd) => {
		if (err) {
			console.error(err);
			return;
		}
		fs.write(fd, JSON.stringify(data));
	});
};

// 任务数据
allNameDict[DATA_MISSION] = {
	'id_'         : 'id',        // 任务id（分组id是3、4w位）
	'forward_id_' : 'forwardId', // 前置任务id
	'rank_'       : 'rank',      // 积分
	'money_'      : 'money'      // 金钱
};

allProcDict[DATA_MISSION] = function(data) {
	fs.open('../../data/MissionCfg.json', 'w', (err, fd) => {
		if (err) {
			console.error(err);
			return;
		}
		fs.write(fd, JSON.stringify(data));
	});
};

// 机器人基础数据
allNameDict[DATA_ROBOT] = {
	'id_'             : 'id',
	'armor_'          : 'hp',       // 护甲（生命）
	'attack_'         : 'atk',      // 攻击力
	'defense_'        : 'def',      // 防御力
	'energy_'         : 'eng',      // 能量
	'energy_recover_' : 'engRec',   // 能量恢复
	'critrate_'       : 'critRate', // 暴击率
	'immune_crit_'    : 'critDef'   // 防爆率
};

allProcDict[DATA_ROBOT] = function(data) {
	let dict = {};
	for (let i in data) {
		let row = data[i];
		for (let key in row) {
			row[key] = parseInt(row[key]);
		}
		dict[row.id] = row;
	}
	data = dict;
	fs.open('../../data/RobotBaseCfg.json', 'w', (err, fd) => {
		if (err) {
			console.error(err);
			return;
		}
		fs.write(fd, JSON.stringify(data));
	});
};

// 机器人角色数据
allNameDict[DATA_ROBOT_CHARACTER] = {
	'id_'                : 'id',
	'left_hand_id_'      : 'lHandId',    // 左手装备
	'right_hand_id_'     : 'rHandId',   // 右手装备
	'head_id_'           : 'headId',      // 头部装备
	'body_id_'           : 'bodyId',      // 胸部装备
	'left_arm_id_'       : 'lArmId',     // 左肩装备
	'right_arm_id_'      : 'rArmId',    // 右肩装备
	'left_leg_id_'       : 'lLegId',     // 左脚装备
	'right_leg_id_'      : 'rLegId',    // 右脚装备
	'characteristic_id_' : 'firstTalentId', // 初始天赋
	'proficiency_id_'    : 'degreeId',      // 熟练度索引
	'talent_id_'         : 'talentTreeId',  // 天赋树每层3选1（类似魔兽世界）
	'attributes_id_'     : 'attributesId' // 属性表索引（DATA_ROBOT）
};

allProcDict[DATA_ROBOT_CHARACTER] = function(data) {
	let dict = {};
	for (let i in data) {
		let row = data[i];
		for (let key in row) {
			row[key] = parseInt(row[key]);
		}
		dict[row.id] = row;
	}
	data = dict;
	fs.open('../../data/RobotCfg.json', 'w', (err, fd) => {
		if (err) {
			console.error(err);
			return;
		}
		fs.write(fd, JSON.stringify(data));
	});
};

// 机器人天赋数据
allNameDict[DATA_TALENT_TREE] = {
	'id_'        : 'id',
	'value_1_1_' : 'value_1_1', // 第一层天赋（索引到DATA_TALENT_BASE）
	'value_1_2_' : 'value_1_2',
	'value_1_3_' : 'value_1_3',
	'value_2_1_' : 'value_2_1', // 第二层天赋
	'value_2_2_' : 'value_2_2',
	'value_2_3_' : 'value_2_3',
	'value_3_1_' : 'value_3_1', // 第三层天赋
	'value_3_2_' : 'value_3_2',
	'value_3_3_' : 'value_3_3',
	'value_4_1_' : 'value_4_1', // 第四层天赋
	'value_4_2_' : 'value_4_2',
	'value_4_3_' : 'value_4_3',
	'value_5_1_' : 'value_5_1', // 第五层天赋
	'value_5_2_' : 'value_5_2',
	'value_5_3_' : 'value_5_3',
	'value_6_1_' : 'value_6_1', // 第六层天赋
	'value_6_2_' : 'value_6_2',
	'value_6_3_' : 'value_6_3'
};

allProcDict[DATA_TALENT_TREE] = function(data) {
	let dict = {};
	for (let i in data) {
		let row = data[i];
		dict[row.id] = [
			parseInt(row['value_1_1']), parseInt(row['value_1_2']), parseInt(row['value_1_3']),
			parseInt(row['value_2_1']), parseInt(row['value_2_2']), parseInt(row['value_2_3']),
			parseInt(row['value_3_1']), parseInt(row['value_3_2']), parseInt(row['value_3_3']),
			parseInt(row['value_4_1']), parseInt(row['value_4_2']), parseInt(row['value_4_3']),
			parseInt(row['value_5_1']), parseInt(row['value_5_2']), parseInt(row['value_5_3']),
			parseInt(row['value_6_1']), parseInt(row['value_6_2']), parseInt(row['value_6_3'])
		];
	}
	data = dict;
	fs.open('../../data/TalentTreeCfg.json', 'w', (err, fd) => {
		if (err) {
			console.error(err);
			return;
		}
		fs.write(fd, JSON.stringify(data));
	});
};

// 天赋最终属性加成表
allNameDict[DATA_TALENT_BASE] = {
	'id_'      : 'id',
	'type_1_'  : 'type_1',  // 属性类型
	'value_1_' : 'value_1', // 增加值
	'type_2_'  : 'type_2',
	'value_2_' : 'value_2',
	'type_3_'  : 'type_3',
	'value_3_' : 'value_3'
};

allProcDict[DATA_TALENT_BASE] = function(data) {
	let dict = {};
	for (let i in data) {
		let row = data[i];
		let newRow = [];
		if ( row['type_1'] != "" ) {
			newRow.push(parseInt(row['type_1']));
			newRow.push(parseInt(row['value_1']));
		}
		if ( row['type_2'] != "" ) {
			newRow.push(parseInt(row['type_2']));
			newRow.push(parseInt(row['value_2']));
		}
		if ( row['type_3'] != "" ) {
			newRow.push(parseInt(row['type_3']));
			newRow.push(parseInt(row['value_3']));
		}
		dict[row.id] = newRow;
	}
	data = dict;
	fs.open('../../data/TalentCfg.json', 'w', (err, fd) => {
		if (err) {
			console.error(err);
			return;
		}
		fs.write(fd, JSON.stringify(data));
	});
};

parseAllConfig();

