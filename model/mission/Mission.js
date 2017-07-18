"use strict";


module.exports.createInit = function(cfgId) {
	let mission = new Mission();
	mission.init(cfgId);
	return mission;
}

module.exports.createLoad = function(data) {
	let mission = new Mission();
	mission.load(data);
	return mission;
}


function Mission() {
	this.id = 0; // id就是config id
	this.complete = false;
}

var pro = Mission.prototype;


pro.getMoney = function() {
	return 0;
}

pro.getRank = function() {
	return 0;
}

pro.pack = function() {
	return {
		id: this.id
	};
}

pro.toData = function() {
	return {
		id: this.id
	};
}

pro.save = function() {
	return {
		id       : this.id,
		complete : this.complete
	};
}

pro.init = function(cfgId) {

}

pro.load = function(data) {
	this.complete  = data.complete || false;
	this.id        = data.id || 0;
	this.forwardId = data.forwardId || 0;
	this.rank      = data.rank || 0;
	this.money     = data.money || 0;
}

