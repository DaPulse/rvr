const fs = require('fs');

// comment 2

const MODULE_TYPE = process.env.RVR_MODULE || 'video-front';
global.MODULE_TYPE = MODULE_TYPE;

const { asyncSleep } = require('./utils');

const _ = require('underscore');
const MPlayer = require('mplayer');

var player = new MPlayer();
player.setOptions({ fullscreen: true, loop: 1000 });

const { socket, modeDirs } = require('./mcast');

let players = {};

let currentState = {};

let lastFartTime = new Date().getTime();

const fart = async (n = 2) => {
  if (n == 0) return;
  const timeNow = new Date().getTime();
  if (timeNow - lastFartTime < 500) return;
  lastFartTime = timeNow;
  console.log('Farting');
  const randomFart = Math.ceil(Math.random() * 8);
  let filePath = `~/rvr/farts/fart-0${randomFart}.mp3`;
  console.log('file path', filePath);
  Omx(filePath);
  const randomTime = Math.floor(Math.random() * 2000);
  await asyncSleep(randomTime);
  fart(n - 1);
};

socket.on('message', function(message, rinfo) {
  try {
    const msgJson = JSON.parse(message);
    // console.log('received a message:');
    // console.log(msgJson);

    if (msgJson.fart) {
      fart();
    }

    if (!_.isEqual(currentState, msgJson) && modeDirs.length > 0) {
      console.log('---');
      console.log(currentState);
      console.log(msgJson);
      console.log('state change!, new state', currentState.mode);
      currentState = msgJson;
      startState(currentState);
    }
  } catch (err) {
    // not json message
  }
});

const getFilePath = async folderPath => {
  const files = await fs.readdirSync(folderPath);
  for (let file of files) {
    try {
      if (file.split('.')[0] == MODULE_TYPE) {
        return `${folderPath}${file}`;
      }
    } catch (err) {
      console.log(err);
    }
  }
  return null;
};

const startState = async state => {
  console.log('startState');
  Object.keys(players).forEach(function(modeId) {
    const player = players[modeId];
    if (player && player.running) {
      // console.log('player modeId ' + modeId + ' was running, quit player');
      player.quit();
    }
  });

  // const folderPath = '/home/pi/rvr/modes/' + modeDirs[state.mode].path + '/';
  const folderPath = '/home/monday/rvr/modes/' + currentState.path + '/';
  const filePath = await getFilePath(folderPath);

  if (filePath) {
    console.log('file path', filePath);
    players[state.mode] = player.openFile(filePath); //Omx(filePath);
  } else {
    console.log('file was not found for module');
  }
};

socket.bind(socket.port);
