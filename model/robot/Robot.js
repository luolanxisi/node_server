"use strict";

const RobotBaseCfg  = require(ROOT_DIR +'data/RobotBaseCfg.json');
const RobotCfg      = require(ROOT_DIR +'data/RobotCfg.json');
const EquipCfg      = require(ROOT_DIR +'data/EquipCfg.json');
const TalentCfg     = require(ROOT_DIR +'data/TalentCfg.json');
const TalentTreeCfg = require(ROOT_DIR +'data/TalentTreeCfg.json');
const DegreeCfg     = require(ROOT_DIR +'data/DegreeCfg.json');


module.exports.createInit = function(cfgId) {
	let robot = new Robot();
	robot.init(cfgId);
	return robot;
}

module.exports.createLoad = function(data) {
	let robot = new Robot();
	robot.load(data);
	return robot;
}


function Robot() {
}

const pro = Robot.prototype;

pro.getId = function() {
	return this.id;
}

pro.initTalent = function(firstTalentId) {
	return [firstTalentId,0,0,0,0,0,0];
}

pro.init = function(cfgId) {
	let robotData = RobotCfg[cfgId];
	// 等级什么的
	this.id          = cfgId;
	this.exp         = 0; // 熟练度经验
	this.level       = 1; // 熟练度等级
	//
	this.hp          = 0; // 护甲（生命）
	this.atk         = 0; // 攻击力
	this.def         = 0; // 防御力
	this.eng         = 0; // 能量
	this.engRec      = 0; // 能量恢复
	this.critRate    = 0; // 暴击率
	this.critDef     = 0; // 防爆率
	this.atkEngCost  = 0; // 攻击能量消耗
	this.turboCd     = 0; // 涡轮CD
	this.engReduce   = 0; // 能耗减免率
	this.turboReduce = 0; // 涡轮CD减免
	// 创建装备
	this.head = this.createEquip(robotData.headId);
	this.lHand = this.createEquip(robotData.lHandId);
	this.rHand = this.createEquip(robotData.rHandId);
	this.lArm = this.createEquip(robotData.lArmId);
	this.rArm = this.createEquip(robotData.rArmId);
	this.body = this.createEquip(robotData.bodyId);
	this.lLeg = this.createEquip(robotData.lLegId);
	this.rLeg = this.createEquip(robotData.rLegId);
	this.headColor = "";
	this.lHandColor = "";
	this.rHandColor = "";
	this.lArmColor = "";
	this.rArmColor = "";
	this.bodyColor = "";
	this.lLegColor = "";
	this.rLegColor = "";
	// 天赋树共6层，每层3选1，初始有一个确定天赋
	this.talents = this.initTalent(robotData.firstTalentId);
	// 
	this.recount();
}

pro.load = function(data) {
	this.id          = data.id || 10001;
	this.exp         = data.exp || 0; // 熟练度经验
	this.level       = data.level || 0; // 熟练度等级
	//
	this.hp          = 0; // 护甲（生命）
	this.atk         = 0; // 攻击力
	this.def         = 0; // 防御力
	this.eng         = 0; // 能量
	this.engRec      = 0; // 能量恢复
	this.critRate    = 0; // 暴击率
	this.critDef     = 0; // 防爆率
	this.atkEngCost  = 0; // 攻击能量消耗
	this.turboCd     = 0; // 涡轮CD
	this.engReduce   = 0; // 能耗减免率
	this.turboReduce = 0; // 涡轮CD减免
	// 创建装备
	this.head = this.createEquip(data.headId);
	this.lHand = this.createEquip(data.lHandId);
	this.rHand = this.createEquip(data.rHandId);
	this.lArm = this.createEquip(data.lArmId);
	this.rArm = this.createEquip(data.rArmId);
	this.body = this.createEquip(data.bodyId);
	this.lLeg = this.createEquip(data.lLegId);
	this.rLeg = this.createEquip(data.rLegId);
	//
	this.headColor  = data.headColor || "";
	this.lHandColor = data.lHandColor || "";
	this.rHandColor = data.rHandColor || "";
	this.lArmColor  = data.lArmColor || "";
	this.rArmColor  = data.rArmColor || "";
	this.bodyColor  = data.bodyColor || "";
	this.lLegColor  = data.lLegColor || "";
	this.rLegColor  = data.rLegColor || "";
	// 天赋树共6层，每层3选1，初始有一个确定天赋
	this.talents = data.talents;
	// 
	this.recount();
}

pro.setLevel = function(value) {
	this.level = value;
}

pro.changeTalent = function(talentId) {
	let robotData = RobotCfg[this.id];
	let talentTree = TalentTreeCfg[robotData.talentTreeId];
	for (let i in talentTree) {
		if (talentId == talentTree[i]) {
			let talentLayer = Math.ceil((parseInt(i) + 1) / 3);
			this.talents[talentLayer] = talentId;
			if (talentLayer > this.level) {
				return Auxiliary.createError(ErrorCode.ROBOT_LEVEL_NOT_ENOUGH, 'Level was not enough');
			}
			break;
		}
	}
	this.recount();
}


pro.changeEquip = function(equipCfgId) {
	let data = EquipCfg[equipCfgId];
	if (!data) {
		return Auxiliary.createError(ErrorCode.EQUIP_UNFIX_ROBOT, 'Equip Cfg data is null');
	}
	if (data.robotCfgId != this.id) {
		return Auxiliary.createError(ErrorCode.EQUIP_UNFIX_ROBOT, 'Robot not suitable equip');
	}
	switch (data.part) {
		case EQUIP.HEAD:
			this.head = this.createEquip(data.id);
			break;
		case EQUIP.LHAND:
			this.lHand = this.createEquip(data.id);
			break;
		case EQUIP.RHAND:
			this.rHand = this.createEquip(data.id);
			break;
		case EQUIP.LARM:
			this.lArm = this.createEquip(data.id);
			break;
		case EQUIP.RARM:
			this.rArm = this.createEquip(data.id);
			break;
		case EQUIP.BODY:
			this.body = this.createEquip(data.id);
			break;
		case EQUIP.LLEG:
			this.lLeg = this.createEquip(data.id);
			break;
		case EQUIP.RLEG:
			this.rLeg = this.createEquip(data.id);
			break;
		default:
			console.error("Unknow equip part", data.part);
			return Auxiliary.createError(ErrorCode.EQUIP_UNFIX_ROBOT, "Unknow equip part: "+ data.part);
	}
	this.recount();
}

pro.updateEquip = function(role, equipCfgId) {
	let originData = EquipCfg[equipCfgId];
	let data = EquipCfg[originData.nextEquipId];
	if (!data) {
		return Auxiliary.createError(ErrorCode.EQUIP_UNFIX_ROBOT, 'Equip Cfg data is null');
	}
	if (data.robotCfgId != this.id) {
		return Auxiliary.createError(ErrorCode.EQUIP_UNFIX_ROBOT, 'Robot not suitable equip');
	}
	if ( !role.minusMoney(data.money) ) {
		return Auxiliary.createError(ErrorCode.MONEY_NOT_ENOUGH, 'Money was not enough');
	}
	switch (data.part) {
		case EQUIP.HEAD:
			this.head = this.createEquip(data.id);
			break;
		case EQUIP.LHAND:
			this.lHand = this.createEquip(data.id);
			break;
		case EQUIP.RHAND:
			this.rHand = this.createEquip(data.id);
			break;
		case EQUIP.LARM:
			this.lArm = this.createEquip(data.id);
			break;
		case EQUIP.RARM:
			this.rArm = this.createEquip(data.id);
			break;
		case EQUIP.BODY:
			this.body = this.createEquip(data.id);
			break;
		case EQUIP.LLEG:
			this.lLeg = this.createEquip(data.id);
			break;
		case EQUIP.RLEG:
			this.rLeg = this.createEquip(data.id);
			break;
		default:
			console.error("Unknow equip part", data.part);
			return Auxiliary.createError(ErrorCode.EQUIP_UNFIX_ROBOT, "Unknow equip part: "+ data.part);
	}
	this.recount();
}

pro.recount = function() {
	let data = RobotBaseCfg[this.id];
	// 机体基础数值
	this.hp          = data.hp || 0;
	this.atk         = data.atk || 0;
	this.def         = data.def || 0;
	this.eng         = data.eng || 0;
	this.engRec      = data.engRec || 0;
	this.critRate    = data.critRate || 0;
	this.critDef     = data.critDef || 0;
	this.atkEngCost  = 0;
	this.turboCd     = 0;
	this.engReduce   = 0;
	this.turboReduce = 0;
	// 装备数值 = (机体基础数值 + 装备数值 * 天赋百分比) * 熟练度百分比
	// 天赋对装备的影响
	this.countTalent();
	// 基础数值对装备的影响
	this.countBase();
	// 熟练度对装备的影响
	this.countDegree();
	// 取整
	this.hp = Math.floor(this.hp);
	this.atk = Math.floor(this.atk);
	this.def = Math.floor(this.def);
	this.eng = Math.floor(this.eng);
	this.engRec = Math.floor(this.engRec);
	this.critRate = Math.floor(this.critRate);
	this.critDef = Math.floor(this.critDef);
	this.atkEngCost = Math.floor(this.atkEngCost);
	this.turboCd = Math.floor(this.turboCd);
	this.engReduce = Math.floor(this.engReduce);
	this.turboReduce = Math.floor(this.turboReduce);
}

pro.createEquip = function(equipId) {
	let obj = {id:equipId};
	let data = EquipCfg[equipId];
	this.countEquipAttribute(obj, data, 'hp');
	this.countEquipAttribute(obj, data, 'def');
	this.countEquipAttribute(obj, data, 'atk');
	this.countEquipAttribute(obj, data, 'engCost');
	this.countEquipAttribute(obj, data, 'eng');
	this.countEquipAttribute(obj, data, 'engRec');
	this.countEquipAttribute(obj, data, 'critRate');
	this.countEquipAttribute(obj, data, 'engReduce');
	this.countEquipAttribute(obj, data, 'critDef');
	return obj;
}

pro.countEquipAttribute = function(obj, data, key) {
	if ( data[key] ) {
		obj[key] = parseInt(data[key]) || 0;
	}
}

pro.countBase = function() {
	this.countBaseAttribute(this.head);
	this.countBaseAttribute(this.lHand);
	this.countBaseAttribute(this.rHand);
	this.countBaseAttribute(this.lArm);
	this.countBaseAttribute(this.rArm);
	this.countBaseAttribute(this.body);
	this.countBaseAttribute(this.lLeg);
	this.countBaseAttribute(this.rLeg);
}

pro.countBaseAttribute = function(equip) {
	let data = RobotBaseCfg[this.id];
	for (let key in equip) {
		if ( data[key] && key != 'id' ) {
			equip[key] += data[key] || 0;
		}
	}
}

pro.countTalent = function() {
	for (let i in this.talents) {
		let talentId = this.talents[i];
		if ( talentId == 0 ) {
			continue;
		}
		let attributeList = TalentCfg[talentId];
		let size = attributeList.length;
		for (let i=0; i<size; i+=2) {
			let type = attributeList[i];
			let value = attributeList[i+1];
			this.countTalentAttribute(type, value);
		}
	}
}

pro.countTalentAttribute = function(type, value) {
	switch (type) {
		case ATTRIBUTE.LHAND_ATTACK:
			this.lHand.atk *= (1 + value);
			break;
		case ATTRIBUTE.LHAND_DEFENSE:
			this.lHand.def *= (1 + value);
			break;
		case ATTRIBUTE.LHAND_ENERGY:
			this.lHand.eng *= (1 + value);
			break;
		case ATTRIBUTE.LHAND_ENERGY_RECOVER:
			this.lHand.engRec *= (1 + value);
			break;
		// case ATTRIBUTE.LHAND_CD_REDUCE:
		// 	break;
		case ATTRIBUTE.LHAND_CRIT:
			this.lHand.critRate *= (1 + value);
			break;
		case ATTRIBUTE.LHAND_CRIT_DEFENSE:
			this.lHand.critDef *= (1 + value);
			break;
		case ATTRIBUTE.LHAND_ENERGY_REDUCE:
			this.lHand.engReduce *= (1 + value);
			break;
		case ATTRIBUTE.BODY_ATTACK:
			this.body.atk *= (1 + value);
			break;
		case ATTRIBUTE.BODY_DEFENSE:
			this.body.def *= (1 + value);
			break;
		case ATTRIBUTE.BODY_ENERGY:
			this.body.eng *= (1 + value);
			break;
		case ATTRIBUTE.BODY_ENERGY_RECOVER:
			this.body.engRec *= (1 + value);
			break;
		// case ATTRIBUTE.BODY_CD_REDUCE:
		// 	break;
		case ATTRIBUTE.BODY_CRIT:
			this.body.critRate *= (1 + value);
			break;
		case ATTRIBUTE.BODY_CRIT_DEFENSE:
			this.body.critDef *= (1 + value);
			break;
		case ATTRIBUTE.BODY_ENERGY_REDUCE:
			this.body.engReduce *= (1 + value);
			break;
		case ATTRIBUTE.RHAND_ATTACK:
			this.rHand.atk *= (1 + value);
			break;
		case ATTRIBUTE.RHAND_DEFENSE:
			this.rHand.def *= (1 + value);
			break;
		case ATTRIBUTE.RHAND_ENERGY:
			this.rHand.eng *= (1 + value);
			break;
		case ATTRIBUTE.RHAND_ENERGY_RECOVER:
			this.rHand.engRec *= (1 + value);
			break;
		// case ATTRIBUTE.RHAND_CD_REDUCE:
		// 	break;
		case ATTRIBUTE.RHAND_CRIT:
			this.rHand.critRate *= (1 + value);
			break;
		case ATTRIBUTE.RHAND_CRIT_DEFENSE:
			this.rHand.critDef *= (1 + value);
			break;
		case ATTRIBUTE.RHAND_ENERGY_REDUCE:
			this.rHand.engReduce *= (1 + value);
			break;
		case ATTRIBUTE.HEAD_ATTACK:
			this.head.atk *= (1 + value);
			break;
		case ATTRIBUTE.HEAD_DEFENSE:
			this.head.def *= (1 + value);
			break;
		case ATTRIBUTE.HEAD_ENERGY:
			this.head.eng *= (1 + value);
			break;
		case ATTRIBUTE.HEAD_ENERGY_RECOVER:
			this.head.engRec *= (1 + value);
			break;
		// case ATTRIBUTE.HEAD_CD_REDUCE:
		// 	break;
		case ATTRIBUTE.HEAD_CRIT:
			this.head.critRate *= (1 + value);
			break;
		case ATTRIBUTE.HEAD_CRIT_DEFENSE:
			this.head.critDef *= (1 + value);
			break;
		case ATTRIBUTE.HEAD_ENERGY_REDUCE:
			this.head.engReduce *= (1 + value);
			break;
		case ATTRIBUTE.LHAND_HP:
			this.lHand.hp *= (1 + value);
			break;
		case ATTRIBUTE.RHAND_HP:
			this.rHand.hp *= (1 + value);
			break;
		case ATTRIBUTE.BODY_HP:
			this.body.hp *= (1 + value);
			break;
		case ATTRIBUTE.HEAD_HP:
			this.head.hp *= (1 + value);
			break;
		default:
			console.error("Unknow talent attribute", type);
	}
}

pro.countDegree = function() {
	let robotData = RobotCfg[this.id];
	let degreeData = DegreeCfg[robotData.degreeId];
	for (let i=0; i<this.level; ++i) {
		let talentId = degreeData.talentIds[i];
		let attributeList = TalentCfg[talentId];
		let size = attributeList.length;
		for (let i=0; i<size; i+=2) {
			let type = attributeList[i];
			let value = attributeList[i+1];
			this.countTalentAttribute(type, value);
		}
	}
}

pro.toData = function() {
	return {
		id          : this.id,
		exp         : this.exp,
		level       : this.level,
		//
		hp          : this.hp,
		atk         : this.atk,
		def         : this.def,
		eng         : this.eng,
		engRec      : this.engRec,
		critRate    : this.critRate,
		critDef     : this.critDef,
		atkEngCost  : this.atkEngCost,
		turboCd     : this.turboCd,
		engReduce   : this.engReduce,
		turboReduce : this.turboReduce,
		//
		head      : this.head,
		lHand     : this.lHand,
		rHand     : this.rHand,
		lArm      : this.lArm,
		rArm      : this.rArm,
		body      : this.body,
		lLeg      : this.lLeg,
		rLeg      : this.rLeg,
		//
		headColor  : this.headColor,
		lHandColor : this.lHandColor,
		rHandColor : this.rHandColor,
		lArmColor  : this.lArmColor,
		rArmColor  : this.rArmColor,
		bodyColor  : this.bodyColor,
		lLegColor  : this.lLegColor,
		rLegColor  : this.rLegColor,
		talents    : this.talents
	};
}

pro.pack = function() {
	return {
		id      : this.id,
		exp     : this.exp,
		level   : this.level,
		headId  : this.head.id,
		lHandId : this.lHand.id,
		rHandId : this.rHand.id,
		lArmId  : this.lArm.id,
		rArmId  : this.rArm.id,
		bodyId  : this.body.id,
		lLegId  : this.lLeg.id,
		rLegId  : this.rLeg.id,
		headColor  : this.headColor,
		lHandColor : this.lHandColor,
		rHandColor : this.rHandColor,
		lArmColor  : this.lArmColor,
		rArmColor  : this.rArmColor,
		bodyColor  : this.bodyColor,
		lLegColor  : this.lLegColor,
		rLegColor  : this.rLegColor,
		talents    : this.talents
	};
}


const EQUIP = {
	HEAD  : 1,
	LHAND : 2,
	RHAND : 3,
	LARM  : 4,
	RARM  : 5,
	BODY  : 6,
	LLEG  : 7,
	RLEG  : 8
};

const ATTRIBUTE = {
	//
	LHAND_ATTACK         : 1, // 左手攻击力
	LHAND_DEFENSE        : 2, // 左手防御力
	LHAND_ENERGY         : 3, // 左手能量值
	LHAND_ENERGY_RECOVER : 4, // 左手能量值回复
	LHAND_CD_REDUCE      : 5, // 左手cd回复
	LHAND_CRIT           : 6, // 左手暴击率
	LHAND_CRIT_DEFENSE   : 7, // 左手防爆率
	LHAND_ENERGY_REDUCE  : 8, // 左手能耗减免率
	//
	BODY_ATTACK         : 9,  // 身体攻击力
	BODY_DEFENSE        : 10, // 身体防御力
	BODY_ENERGY         : 11, // 身体能量值
	BODY_ENERGY_RECOVER : 12, // 身体能量值回复
	BODY_CD_REDUCE      : 13, // 身体cd回复
	BODY_CRIT           : 14, // 身体暴击率
	BODY_CRIT_DEFENSE   : 15, // 身体防爆率
	BODY_ENERGY_REDUCE  : 16, // 身体能耗减免率
	//
	RHAND_ATTACK         : 17, // 右手攻击力
	RHAND_DEFENSE        : 18, // 右手防御力
	RHAND_ENERGY         : 19, // 右手能量值
	RHAND_ENERGY_RECOVER : 20, // 右手能量值回复
	RHAND_CD_REDUCE      : 21, // 右手cd回复
	RHAND_CRIT           : 22, // 右手暴击率
	RHAND_CRIT_DEFENSE   : 23, // 右手防爆率
	RHAND_ENERGY_REDUCE  : 24, // 右手能耗减免率
	//
	HEAD_ATTACK         : 25, // 头攻击力
	HEAD_DEFENSE        : 26, // 头防御力
	HEAD_ENERGY         : 27, // 头能量值
	HEAD_ENERGY_RECOVER : 28, // 头能量值回复
	HEAD_CD_REDUCE      : 29, // 头cd回复
	HEAD_CRIT           : 30, // 头暴击率
	HEAD_CRIT_DEFENSE   : 31, // 头防爆率
	HEAD_ENERGY_REDUCE  : 32, // 头能耗减免率
	//
	LHAND_HP : 33, // 头护甲
	RHAND_HP : 34, // 身体护甲
	BODY_HP  : 35, // 左手护甲
	HEAD_HP  : 36, // 右手护甲
};



