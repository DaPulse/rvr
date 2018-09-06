const ip = require('ip');

const CLIENT_IP = ip.address();

var udp = require('dgram');
// var buffer = require('buffer');

// -------------------- udp client ----------------

// creating a client socket
var client = udp.createSocket('udp4');

//buffer msg
var data = Buffer.from('siddheshrane');

client.on('message', function(msg, info) {
  console.log('Data received from server : ' + msg.toString());
  console.log('Received %d bytes from %s:%d\n', msg.length, info.address, info.port);
});

//sending msg
// client.send(data, 2222, 'localhost', function(error) {
//   if (error) {
//     client.close();
//   } else {
//     console.log('Data sent !!!');
//   }
// });

const pingToServer = () => {
  const msg = { type: 'ping', ip: CLIENT_IP };
  client.send(JSON.stringify(msg), 2222, 'localhost');
};

setInterval(pingToServer, 2000);

// var data1 = Buffer.from('hello');
// var data2 = Buffer.from('world');

//sending multiple msg
// client.send([data1, data2], 2222, 'localhost', function(error) {
//   if (error) {
//     client.close();
//   } else {
//     console.log('Data sent !!!');
//   }
// });
