const fs = require('fs');

const MODULE_TYPE = process.env.RVR_MODULE || 'undefined_module';
global.MODULE_TYPE = MODULE_TYPE;

const { asyncSleep } = require('./utils');

const _ = require('underscore');
var Omx = require('node-omxplayer');

const { socket, modeDirs } = require('./mcast');

// Put the module's role as an environment variable
const IS_VIDEO = MODULE_TYPE.includes('video') ? true : false;
const FILE_EXTENSION = IS_VIDEO ? 'mp4' : 'mp3';

const MODES = {
  '1': 'rain',
  '2': 'jungle'
};

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
  let filePath = `/home/pi/rvr/farts/fart-0${randomFart}.mp3`;
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

const getFilePath = folderPath => {
  fs.readdirSync(folderPath).forEach(file => {
    try {
      console.log(file.split('.')[0]);
      console.log(MODULE_TYPE);
      console.log(`${folderPath}${file}`);
      if (file.split('.')[0] == MODULE_TYPE) {
        console.log('equal');
        return `${folderPath}${file}`;
      }
    } catch (err) {
      console.log(err);
    }
  });
  return null;
};

const startState = async state => {
  // console.log(state);
  console.log('startState');
  // if (runningProc) {
  //   try {
  //     // runningProc.kill('SIGKILL');
  //   } catch (err) {
  //     console.log('cant kill ', err);
  //   }
  // }
  // console.log('kill old players');
  Object.keys(players).forEach(function(modeId) {
    const player = players[modeId];
    if (player && player.running) {
      // console.log('player modeId ' + modeId + ' was running, quit player');
      player.quit();
    }
  });

  const folderPath = '/home/pi/rvr/modes/' + modeDirs[state.mode].path + '/';
  const filePath = getFilePath(folderPath);
  // filePath = '/home/pi/rvr/modes/' + modeDirs[state.mode].path + '/' + `${MODULE_TYPE}.${FILE_EXTENSION}`;
  // }
  if (filePath) {
    console.log('file path', filePath);
    players[state.mode] = Omx(filePath);
  } else {
    console.log('file was not found for module');
  }

  // // await playSound(MODES[state.mode] + '/front.mp3');
  // break;
  // }
};

// const playSound = async file => {
//   console.log('playSound', file);
//   try {
//     // runningProc = await exec(`omxplayer -o local /home/pi/rvr/modes/${file}`);
//     await exec(`omxplayer -o local /home/pi/rvr/modes/${file}`);
//   } catch (err) {
//     console.log('error starting player');
//     console.log(err);
//   }
//   // runningProc.on('exit', () => (runningProc = null));
//   await asyncSleep(100);
//   killZombieProcesses();
//   await asyncSleep(200);
//   killZombieProcesses();
// };

socket.bind(socket.port);
