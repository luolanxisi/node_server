"use strict";

global.BASE_PATH = __dirname;
global.aux   = require(BASE_PATH +'/lib/Auxiliary');

const net = require('net');
const utils = require('./lib/Auxiliary');
const RttSync = require('./model/time/RttSync');
const proto = require('./model/network/Proto').getDict();
const protocolType = require('./model/network/Proto').getTypeDict();
const sysCfg = require(BASE_PATH +'/model/system/SystemConfig').getDict();
const BufferPool = require(BASE_PATH +'/lib/BufferPool');
const TcpPackage = require(BASE_PATH +'/lib/TcpPackage');


const regCase = {};
regCase[proto.ROLE_LOGIN]       = {send:sROLE_LOGIN, recv:rROLE_LOGIN};
regCase[proto.ROLE_SELECT_ROBOT] = {send:sROLE_SELECT_ROBOT, recv:rNORMAL_BACK};
regCase[proto.MISSION_START]    = {send:sMISSION_START, recv:rNORMAL_BACK};
regCase[proto.MISSION_COMPLETE] = {send:sMISSION_COMPLETE, recv:rNORMAL_BACK};
regCase[proto.MISSION_FAILURE]  = {send:sMISSION_FAILURE, recv:rNORMAL_BACK};
regCase[proto.EQUIP_CHANGE]     = {send:sEQUIP_CHANGE, recv:rNORMAL_BACK};
regCase[proto.EQUIP_UPDATE]     = {send:sEQUIP_UPDATE, recv:rNORMAL_BACK};
regCase[proto.TALENT_CHANGE]    = {send:sTALENT_CHANGE, recv:rNORMAL_BACK};
regCase[proto.PVP_MATCH_START]  = {send:sPVP_MATCH_START, recv:rPVP_MATCH_START};
regCase[proto.PVP_SCENE_READY]  = {send:sPVP_SCENE_READY, recv:rNORMAL_BACK};
regCase[proto.GM_GIVE_ROBOT]    = {send:sGM_GIVE_ROBOT, recv:rNORMAL_BACK};
regCase[proto.GM_GIVE_EQUIP]    = {send:sGM_GIVE_EQUIP, recv:rNORMAL_BACK};
regCase[proto.GM_GIVE_MONEY]    = {send:sGM_GIVE_MONEY, recv:rNORMAL_BACK};
regCase[proto.GM_ROBOT_SET_LEVEL]    = {send:sGM_ROBOT_SET_LEVEL, recv:rNORMAL_BACK};
regCase[proto.ROLE_UPDATE_INFO]    = {send:sROLE_UPDATE_INFO, recv:rNORMAL_BACK};
//
regCase[proto.PVP_MATCH_SUCC]   = {recv:rPVP_MATCH_SUCC};
regCase[proto.PVP_SCENE_ALL_READY] = {recv:rNORMAL_BACK};

var testIdx = 0;
const testList = [
	proto.ROLE_LOGIN,
	// proto.GM_GIVE_ROBOT,
	// proto.GM_GIVE_EQUIP,
	// proto.GM_GIVE_MONEY,
	// proto.GM_ROBOT_SET_LEVEL,
	// proto.ROLE_SELECT_ROBOT,
		// proto.PVP_MATCH_START,
		// proto.PVP_SCENE_READY,
		// proto.MISSION_START,
		// proto.MISSION_COMPLETE,
		// proto.MISSION_FAILURE,
	// proto.EQUIP_CHANGE,
	// proto.EQUIP_UPDATE,
	// proto.TALENT_CHANGE,
	proto.ROLE_UPDATE_INFO
];

const idx = process.argv[2] || 0;
const time = parseInt(process.argv[3]) || 1000;

const rttSync = new RttSync();
const tickets = [
	"140000009da46e028bbb938841a3b909010010011d35a559180000000100000002000000daca16740000000067ec000001000000b2000000320000000400000041a3b90901001001e0010000daca16740701a8c0000000003b35a559bbe4c05901000000000000000000756eebd4fe696a1f99ffb2560b322315eee3b907ad804251177337346d708bd6f86a995e65cb8fbfdac8e46c7d1893829e80c10906daf729c0a837009d7b5025f35548f43ae19fdf41afba29ca60710ba87f5e50b35d512f350d0a014c5aba3699bd7b94db339a87319ee1cadff2baa3d972e3e9d93d366e2344baf4a910a62c",
	"14000000bf3b350df96d5438b22f080301001001d995d4581800000001000000020000006a0ff63a00000000812ca90007000000b20000003200000004000000b22f080301001001e00100006a0ff63a1701000a00000000958fc758153fe35801000000000000000000a7ec3ca1115b0e3123dfdbd2fa46d4f8547ecd18385db3959bc0e84233d9bc217d976b62dcdb9871cc088571287691495528a2e188a59f79f0242578ac207bf61efe96ba6c2bb55c0ffc8398d062016a0f55e58c0e5a57303f9068dee40c35a86e5eb357bfe5cbb94a39f993c977e294d377ddb0bf864e35d42a17653429e0fd"
];
const ticket = tickets[idx];
console.error(ticket);

var client = null;
var natClient = null; // NAT穿透辅助接口
var roleId = null;

const webClient = net.createConnection({host:"106.14.156.178", port:8000}, () => { // 用steam平台ticket进行登录 106.14.156.178
	console.log('connected to web server!');
	let buf = BufferPool.createBuffer();
	buf.writeInt16BE(0);
	buf.writeUInt8(protocolType.CLIENT_REQUEST);
	buf.writeInt16BE(proto.WEB_STEAM_TICKET);
	buf.writeProtoString(JSON.stringify({ticket: ticket, time: time})); // 临时代码
	webClient.write(buf.sliceRawBuffer());

	webClient.on('data', (data) => {
		let buf = BufferPool.decorateBuffer(data);
		let len = buf.readInt16BE();
		let protocolType = buf.readUInt8();
		let cmd = buf.readInt16BE();
		let objStr = buf.readProtoString();
		let obj = JSON.parse(objStr);
		console.error("web server message >>>>>>", obj);
		webClient.end();

		client = net.createConnection({host:obj.host, port:obj.port}, () => { // 10.0.1.200
			console.log('connected to server!');
			startTest(client);
		});

		let tcpPackage = new TcpPackage(function(data) {
			let len = data.readInt16BE(0);
			let protocolType = data.readUInt8(2);
			let cmd = data.readInt16BE(3);
			let jsonSize = data.readInt16BE(5);
			let objStr = data.toString('utf8', 7);
			console.log("client len:", len, ", cmd:", cmd, ", buffer size:", data.length, objStr);
			regCase[cmd].recv(JSON.parse(objStr));
		});

		client.on('data', (data) => {
			tcpPackage.addBuffer(data);
		});

		client.on('end', () => {
			console.log('disconnected from server');
		});

		client.on('error', (err) => {
			console.log('server error:', err);
		});

		client.setNoDelay(true);
	});
});



function startTest(client) {
	regCase[testList[testIdx++]].send(client);
}

function sROLE_LOGIN(client) {
	let buf = BufferPool.createBuffer();
	buf.writeInt16BE(0);
	buf.writeUInt8(protocolType.CLIENT_REQUEST);
	buf.writeInt16BE(proto.ROLE_LOGIN);
	buf.writeProtoString(JSON.stringify({ticket : ticket})); // (ticket+time)
	client.write(buf.sliceRawBuffer());
}

function sROLE_SELECT_ROBOT(client) {
	let buf = BufferPool.createBuffer();
	buf.writeInt16BE(0);
	buf.writeUInt8(protocolType.CLIENT_REQUEST);
	buf.writeInt16BE(proto.ROLE_SELECT_ROBOT);
	buf.writeProtoString(JSON.stringify({
		robotCfgId : 10001
	}));
	client.write(buf.sliceRawBuffer());
}

function sROLE_UPDATE_INFO(client) {
	let buf = BufferPool.createBuffer();
	buf.writeInt16BE(0);
	buf.writeUInt8(protocolType.CLIENT_REQUEST);
	buf.writeInt16BE(proto.ROLE_UPDATE_INFO);
	buf.writeProtoString(JSON.stringify({
		rank: 100,
		money: 10001,
		gem: 203,
		curMission: [30101, 30201],
		items: [110001,110002,110003,110004,110005,110006,110007,110008,120001,120002,120003,120004,120005,120006,120007,120008,130001,130002,130003,130004,130005,130006,130007,130008],
		curRobotId: 10001,
		robotWarList: [10001, 10002, 10003],
		first: false;
		robotList: [
			{
				id : 10001,
				headId : 110003,
				lHandId : 110001,
				rHandId : 110002,
				lArmId : 110005,
				rArmId : 110006,
				bodyId : 110004,
				lLegId : 110007,
				rLegId : 110008,
				headColor : "#678765",
				lHandColor : "#678765",
				rHandColor : "#678765",
				lArmColor : "#678765",
				rArmColor : "#678765",
				bodyColor : "#678765",
				lLegColor : "#678765",
				rLegColor : "#678743",
				talents : [2, 9, 17, 4, 11, 16]
			},
			{
				id : 10002,
				headId : 120003,
				lHandId : 120001,
				rHandId : 120002,
				lArmId : 120005,
				rArmId : 120006,
				bodyId : 120004,
				lLegId : 120007,
				rLegId : 120008,
				headColor : "#678765",
				lHandColor : "#678765",
				rHandColor : "#678765",
				lArmColor : "#678765",
				rArmColor : "#678765",
				bodyColor : "#678765",
				lLegColor : "#678765",
				rLegColor : "#678776",
				talents : [9, 7, 2, 11, 3, 14]
			}
		]
	}));
	client.write(buf.sliceRawBuffer());
}

function sGM_GIVE_ROBOT(client) {
	let buf = BufferPool.createBuffer();
	buf.writeInt16BE(0);
	buf.writeUInt8(protocolType.CLIENT_REQUEST);
	buf.writeInt16BE(proto.GM_GIVE_ROBOT);
	buf.writeProtoString(JSON.stringify({
		robotCfgIds : [10002]
	}));
	client.write(buf.sliceRawBuffer());
}

function sGM_GIVE_EQUIP(client) {
	let buf = BufferPool.createBuffer();
	buf.writeInt16BE(0);
	buf.writeUInt8(protocolType.CLIENT_REQUEST);
	buf.writeInt16BE(proto.GM_GIVE_EQUIP);
	buf.writeProtoString(JSON.stringify({
		equipCfgIds : [110002]
	}));
	client.write(buf.sliceRawBuffer());
}

function sGM_GIVE_MONEY(client) {
	let buf = BufferPool.createBuffer();
	buf.writeInt16BE(0);
	buf.writeUInt8(protocolType.CLIENT_REQUEST);
	buf.writeInt16BE(proto.GM_GIVE_MONEY);
	buf.writeProtoString(JSON.stringify({
		money : 1000000,
		gem   : 10000
	}));
	client.write(buf.sliceRawBuffer());
}

function sGM_ROBOT_SET_LEVEL(client) {
	let buf = BufferPool.createBuffer();
	buf.writeInt16BE(0);
	buf.writeUInt8(protocolType.CLIENT_REQUEST);
	buf.writeInt16BE(proto.GM_ROBOT_SET_LEVEL);
	buf.writeProtoString(JSON.stringify({
		level : 6
	}));
	client.write(buf.sliceRawBuffer());
}

function sMISSION_START(client) {
	let buf = BufferPool.createBuffer();
	buf.writeInt16BE(0);
	buf.writeUInt8(protocolType.CLIENT_REQUEST);
	buf.writeInt16BE(proto.MISSION_START);
	buf.writeProtoString(JSON.stringify({
		missionId : 1
	}));
	client.write(buf.sliceRawBuffer());
}

function sMISSION_COMPLETE(client) {
	let buf = BufferPool.createBuffer();
	buf.writeInt16BE(0);
	buf.writeUInt8(protocolType.CLIENT_REQUEST);
	buf.writeInt16BE(proto.MISSION_COMPLETE);
	buf.writeProtoString(JSON.stringify({}));
	client.write(buf.sliceRawBuffer());
}

function sMISSION_FAILURE(client) {
	let buf = BufferPool.createBuffer();
	buf.writeInt16BE(0);
	buf.writeUInt8(protocolType.CLIENT_REQUEST);
	buf.writeInt16BE(proto.MISSION_FAILURE);
	buf.writeProtoString(JSON.stringify({}));
	client.write(buf.sliceRawBuffer());
}

function sEQUIP_UNLOCK(client) {
	let buf = BufferPool.createBuffer();
	buf.writeInt16BE(0);
	buf.writeUInt8(protocolType.CLIENT_REQUEST);
	buf.writeInt16BE(proto.EQUIP_UNLOCK);
	buf.writeProtoString(JSON.stringify({}));
	client.write(buf.sliceRawBuffer());
}

function sEQUIP_CHANGE(client) {
	let buf = BufferPool.createBuffer();
	buf.writeInt16BE(0);
	buf.writeUInt8(protocolType.CLIENT_REQUEST);
	buf.writeInt16BE(proto.EQUIP_CHANGE);
	buf.writeProtoString(JSON.stringify({equipCfgId:110002}));
	client.write(buf.sliceRawBuffer());
}

function sEQUIP_UPDATE(client) {
	let buf = BufferPool.createBuffer();
	buf.writeInt16BE(0);
	buf.writeUInt8(protocolType.CLIENT_REQUEST);
	buf.writeInt16BE(proto.EQUIP_UPDATE);
	buf.writeProtoString(JSON.stringify({equipCfgId:110002}));
	client.write(buf.sliceRawBuffer());
}

function sTALENT_CHANGE(client) {
	let buf = BufferPool.createBuffer();
	buf.writeInt16BE(0);
	buf.writeUInt8(protocolType.CLIENT_REQUEST);
	buf.writeInt16BE(proto.TALENT_CHANGE);
	buf.writeProtoString(JSON.stringify({talentId:13}));
	client.write(buf.sliceRawBuffer());
}

function sPVP_MATCH_START(client) {
	let buf = BufferPool.createBuffer();
	buf.writeInt16BE(0);
	buf.writeUInt8(protocolType.CLIENT_REQUEST);
	buf.writeInt16BE(proto.PVP_MATCH_START);
	buf.writeProtoString(JSON.stringify({}));
	client.write(buf.sliceRawBuffer());
}

function sPVP_SCENE_READY(client) {
	let buf = BufferPool.createBuffer();
	buf.writeInt16BE(0);
	buf.writeUInt8(protocolType.CLIENT_REQUEST);
	buf.writeInt16BE(proto.PVP_SCENE_READY);
	buf.writeProtoString(JSON.stringify({roleId:roleId}));
	natClient.write(buf.sliceRawBuffer());
}


function rROLE_LOGIN(data) {
	roleId = data.roleId;
	if ( testIdx < testList.length ) {
		regCase[testList[testIdx++]].send(client);
	}
}

function rPVP_MATCH_START(data) {
	console.error("rPVP_MATCH_START back", data);
}

function rPVP_MATCH_SUCC(data) {
	console.error("rPVP_MATCH_SUCC back", data);
	natClient = net.createConnection({host:data.p2pHelpHost, port:data.p2pHelpPort}, () => {
		console.error("nat connected success", testIdx, testList.length);
		if ( testIdx < testList.length ) {
			regCase[testList[testIdx++]].send(client);
		}
	});
}

function rPVP_SCENE_READY(data) {
	console.error("rPVP_SCENE_READY back", data);
}

function rNORMAL_BACK(data) {
	// console.error("normal back", data);
	if ( testIdx < testList.length ) {
		regCase[testList[testIdx++]].send(client);
	}
}


