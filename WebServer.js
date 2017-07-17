"use strict";

const https = require('https');
const mysql = require('mysql');
const net = require('net');


// 
const connection = mysql.createConnection({
  host     : '127.0.0.1',
  user     : 'root',
  password : '123456',
  database : 'iron_fight'
});

connection.connect();

connection.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
  if (error) throw error;
  console.log('The solution is: ', results[0].solution);
});

connection.end();

// 
const server = net.createServer((client) => {
  // 临时创造roleId
  let buf = Buffer.alloc(4);
  buf.writeInt32BE(12); // role id
  client.write(buf);

  client.on('end', () => {
    console.log('client disconnected');
  });

  client.on('error', (err) => {
    console.log('client error:', err);
  });

  client.on('data', (data) => {
    // steam请求发送
    // console.error("data>>>>", data, data.length);
    // console.log(data.toString('hex'));
    // sendTicket(data.toString('hex'));
  });
});

server.on('error', (err) => {
  throw err;
});

server.listen(8000, () => {
  console.log('server bound');
});

// 
function sendTicket(ticket) {
  const options = {
    hostname: 'api.steampowered.com',
    port: 443,
    path: '/ISteamUserAuth/AuthenticateUserTicket/v0001/?key=1FC2213F37BF615B29EFC2F08264F545&appid=480&ticket='+ ticket,
    method: 'GET'
  };

  const req = https.request(options, (res) => {
    //console.log('statusCode:', res.statusCode);
    //console.log('headers:', res.headers);

    res.on('data', (data) => {
      const obj = JSON.parse(data);
      if ( obj.response.error ) {
        console.error(obj.response.error);
        return;
      }
      const id = obj.response.params.steamid;
      console.error(">>>>>>>", id);
    });
  });

  req.on('error', (e) => {
    console.error(e);
  });

  req.end();
}


