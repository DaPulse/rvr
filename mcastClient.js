const { asyncSleep } = require('./utils');
const { socket, modeDirs } = require('./mcast');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const _ = require('underscore');
let runningProc = null;
var Omx = require('node-omxplayer');
const { killZombieProcesses } = require('./killZombies');
// require('./killZombies');

// Put the module's role as an environment variable
const MODULE_TYPE = process.env.RVR_MODULE || 'video-front';
const IS_VIDEO = MODULE_TYPE.includes('video') ? true : false;
const FILE_EXTENSION = IS_VIDEO ? 'mp4' : 'mp3';

const MODES = {
  '1': 'rain',
  '2': 'jungle'
};

let players = {};

let currentState = {};

socket.on('message', function(message, rinfo) {
  try {
    const msgJson = JSON.parse(message);
    // console.log('received a message:');
    // console.log(msgJson);

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

  // console.log('start new player');
  let filePath;
  // switch (MODULE_TYPE) {
  //   case 'audio_front':
  filePath = '/home/pi/rvr/modes/' + modeDirs[state.mode].path + '/' + `${MODULE_TYPE}.${FILE_EXTENSION}`;
  console.log('file path', filePath);
  players[state.mode] = Omx(filePath);
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
