const ip = require('ip');
const { s3sync, deleteOldFolders } = require('./s3');
const dgram = require('dgram');
const process = require('process');
const { join } = require('path');
const { readdirSync, statSync } = require('fs');

const PORT = 20000;
const MULTICAST_ADDR = '233.255.255.255';
let modeDirs = [];

const socket = dgram.createSocket({ type: 'udp4', reuseAddr: true });

socket.on('listening', function() {
  socket.addMembership(MULTICAST_ADDR);
  // setInterval(sendMessage, 1000);
  const address = socket.address();
  console.log(`UDP socket listening on ${address.address}:${address.port} pid: ${process.pid}`);
});

socket.port = PORT;
// socket.bind(PORT);

getModeDirsSerialString = () => {
  return `1;${modeDirs.map(e => e.name).join(';')};\n`;
};

const readModeFolders = () => {
  console.log('get s3 dir names into modes');
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

const initializeMcast = async () => {
  const SERVER_IP = ip.address();
  console.log('Device ip address: ', SERVER_IP);
  console.log('module name: ', global.MODULE_TYPE);

  deleteOldFolders();
  readModeFolders();


  await s3sync();
  // update mode folder names again after sync from s3
  readModeFolders();
}


module.exports = {
  socket,
  MULTICAST_ADDR,
  modeDirs,
  getModeDirsSerialString,
  initializeMcast
};