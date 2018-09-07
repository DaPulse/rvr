const { asyncSleep } = require('./utils');
const { socket } = require('./mcast');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const _ = require('underscore');
let runningProc = null;
const { killZombieProcesses } = require('./killZombies');
require('./killZombies');

// Put the module's role as an environment variable
const MODULE_TYPE = process.env.RVR_MODULE || 'audio_front';

const MODES = {
  '1': 'rain',
  '2': 'jungle'
};

let currentState = {};

socket.on('message', function(message, rinfo) {
  try {
    const msgJson = JSON.parse(message);
    console.log('received a message:');
    console.log(msgJson);

    if (!_.isEqual(currentState, msgJson)) {
      currentState = msgJson;
      startState(currentState);
    }
  } catch (err) {
    // not json message
  }
});

const startState = async state => {
  console.log('startState');
  if (runningProc) {
    try {
      runningProc.kill('SIGKILL');
    } catch (err) {
      console.log('cant kill ', err);
    }
  }
  switch (MODULE_TYPE) {
    case 'audio_front':
      await playSound(MODES[state.mode] + '/front.mp3');
      break;
  }
  currentState = {};
};

const playSound = async file => {
  console.log('playSound', file);
  try {
    runningProc = await exec(`omxplayer -o local /home/pi/rvr/modes/${file}`);
  } catch (err) {
    console.log('error starting player');
    console.log(err);
  }
  runningProc.on('exit', () => (runningProc = null));
  await asyncSleep(10);
  killZombieProcesses();
  await asyncSleep(10);
  killZombieProcesses();
};

socket.bind(socket.port);
