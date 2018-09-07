const ip = require('ip');
const SERVER_IP = ip.address();
console.log('Device ip address: ', SERVER_IP);

const PORT = 20000;
const MULTICAST_ADDR = '233.255.255.255';

const dgram = require('dgram');
const process = require('process');

const socket = dgram.createSocket({ type: 'udp4', reuseAddr: true });

socket.on('listening', function() {
  socket.addMembership(MULTICAST_ADDR);
  // setInterval(sendMessage, 1000);
  const address = socket.address();
  console.log(`UDP socket listening on ${address.address}:${address.port} pid: ${process.pid}`);
});

socket.port = PORT;

// socket.bind(PORT);

module.exports = {
  socket,
  MULTICAST_ADDR
};

// const sendMessage = async () => {
//   // const message = Buffer.from(`Message from process ${process.pid}`);
//   const msg = JSON.stringify({ channel: 0 });
//   for (let i = 0; i < 5; i++) {
//     await asyncSleep(2);
//     socket.send(msg, 0, msg.length, PORT, MULTICAST_ADDR, function() {
//       console.info(`Sending msg "${msg}"`);
//     });
//   }
// };

// // socket.on('message', function(message, rinfo) {
// //   console.info(`Message from: ${rinfo.address}:${rinfo.port} - ${message}`);
// // });
