"use strict";

const fs = require('fs');


readMap();


function readMap() {
	let srcPath = "F:/cookbook/new_project/config/map_data";
	let dstPath = "F:/cookbook/egret/test_wing/resource/config/map_data";
	let fileName = "map_1.json";
	let extName = "map_1_ext.json";
	//
	let mapExt = require(srcPath +'/'+ extName);
	let mapCfg = require(srcPath +'/'+ fileName);
	let data = mapCfg.layers[0].data;
	let mapWidth = mapCfg.width;
	let mapHeight = mapCfg.height;
	let tileWidth = mapCfg.tilewidth;
	let tileHeight = mapCfg.tileheight;
	let newData = {
		width: mapWidth * tileWidth,
		height: mapHeight * tileHeight,
		planets: {}
	};
	let genId = 1;
	for (let i=0; i<mapHeight; ++i) {
		for (let j=0; j<mapWidth; ++j) {
			let index = i * mapWidth + j;
			let value = data[index];
			if (value != 0) {
				let id = genId;
				let dict = mapExt.planets[id];
				dict.id = id;
				dict.x = j * tileWidth;
				dict.y = i * tileHeight;
				dict.resId = value;
				newData.planets[id] = dict;
				++genId;
			}
		}
	}
	//
	fs.open(dstPath +'/'+ fileName, 'w', (err, fd) => {
		if (err) {
			console.error(err);
			return;
		}
		fs.write(fd, JSON.stringify(newData));
	});
}



