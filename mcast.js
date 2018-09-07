const fs = require('fs');
const ip = require('ip');
const SERVER_IP = ip.address();
console.log('Device ip address: ', SERVER_IP);

console.log('module name: ', global.MODULE_TYPE);

// const MODULE_TYPE = process.env.RVR_MODULE || 'unkown_module';

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
    let output = await exec(
      `cd modes && aws s3 sync s3://monday-rvr ./ --exclude "*" --include "*${global.MODULE_TYPE}*" --delete`
    );
    // console.log(output);
  } catch (err) {
    console.log(err);
  }
};

let modeDirs = [];

let lastSyncTime;
try {
  lastSyncTime = parseInt(fs.readFileSync('./last_sync_time'));
} catch (err) {
  // console.log(err);
  lastSyncTime = 0;
}

const readModeFolders = () => {
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
  console.log('module dirs:');
  console.log(dirs);
};

sync = async () => {
  const timeNow = Math.floor(new Date().getTime() / 1000);
  console.log('delta from last s3 sync in seconds', timeNow - lastSyncTime);
  if (timeNow - lastSyncTime < 60 * 60) {
    return console.log('dont need to sync');
  }
  console.log('sync files from s3');
  await syncS3();
  fs.writeFileSync('./last_sync_time', timeNow);
  console.log('Finished to sync files from s3');
  readModeFolders();
};

sync();
readModeFolders();

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
