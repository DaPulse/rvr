const ip = require('ip');
const SERVER_IP = ip.address();
console.log('Device ip address: ', SERVER_IP);

const util = require('util');
const exec = util.promisify(require('child_process').exec);

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
const syncS3 = async () => {
  try {
    let output = await exec(`mkdir modes`);
  } catch (err) {
    // folder already exist
  }
  try {
    let output = await exec(`cd modes && aws s3 sync s3://monday-rvr ./ --delete`);
    console.log(output);
  } catch (err) {
    console.log(err);
  }
};

let modeDirs = [];

sync = async () => {
  console.log('sync files from s3');
  await syncS3();
  console.log('get s3 dir names into modes');
  const { readdirSync, statSync } = require('fs');
  const { join } = require('path');
  const getDirs = p => readdirSync(p).filter(f => statSync(join(p, f)).isDirectory());
  const dirs = getDirs('./modes/');
  dirs.forEach(dir => {
    const dirNum = parseInt(dir.split('--')[0]);
    const dirName = dir.split('--')[1];
    modeDirs[dirNum] = {
      mode: dirNum,
      path: dir,
      name: dirName
    };
  });
};
sync();

module.exports = {
  socket,
  MULTICAST_ADDR,
  modeDirs
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
