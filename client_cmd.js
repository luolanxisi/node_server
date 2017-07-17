"use strict";

const net = require('net');
const readline = require('readline');

global.ROOT_DIR = __dirname +"/";

const masterCfg = require(ROOT_DIR +'config/master_config.json');


const client = net.createConnection({host:"localhost", port:masterCfg.port}, () => {
	console.error("connenct to server:", masterCfg.port);

	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});

	rl.on('line', (input) => {
		console.log(`Received: ${input}`);
		switch (input) {
			case 'stop':
				console.error('close server');
				client.write("stop");
				break;
		}
	});
});


client.on('data', (data) => {

});

client.on('end', () => {

});

client.on('error', (err) => {

});


