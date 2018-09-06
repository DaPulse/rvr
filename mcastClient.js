const { socket } = require('./mcast');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const _ = require('underscore');

// Put the module's role as an environment variable
const MODULE_TYPE = process.env.RVR_MODULE || 'audio_front';

const MODE_SOUND_FRONT_MAP = {
  '1': 'jungle.mp3',
  '2': 'rain.mp3'
};

const MODE_SOUND_BACK_MAP = {
  '1': 'jungle.mp3',
  '2': 'rain.mp3'
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
  switch (MODULE_TYPE) {
    case 'audio_front':
      await playSound(MODE_SOUND_FRONT_MAP[state.mode]);
      break;
  }
};

const playSound = async file => {
  console.log('playSound', file);
  await exec(`omxplayer -o local /home/rvr/audio/${file}`);
};

socket.bind(socket.port);
