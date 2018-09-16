// Play in VLC: vlc --fullscreen --video-on-top --no-video-title-show <filename>

const fs = require('fs');

const MODULE_TYPE = process.env.RVR_MODULE || 'video-front';
global.MODULE_TYPE = MODULE_TYPE;

const _ = require('underscore');
var Omx = require('node-omxplayer');

const { socket, modeDirs, initializeMcast } = require('./mcast');
const { fart } = require('./fart')

initializeMcast();

let players = {};

let currentState = {};

socket.on('message', function(message, rinfo) {
  try {
    const msgJson = JSON.parse(message);
    // console.log('received a message:');
    // console.log(msgJson);

    if (msgJson.fart) {
      fart(Omx);
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
  const folderPath = '/home/pi/rvr/modes/' + currentState.path + '/';
  const filePath = await getFilePath(folderPath);

  if (filePath) {
    console.log('file path', filePath);
    players[state.mode] = Omx(filePath);
  } else {
    console.log('file was not found for module');
  }
};

socket.bind(socket.port);
