// Play in VLC: vlc --fullscreen --video-on-top --no-video-title-show <filename>

const fs = require('fs');
const { spawn } = require('child_process');
let vlcProcess = null;

const MODULE_TYPE = process.env.RVR_MODULE || 'video-front';
global.MODULE_TYPE = MODULE_TYPE;

const _ = require('underscore');

const { socket, modeDirs, initializeMcast } = require('./mcast');
const { getFartFile } = require('./fart')

initializeMcast();

let players = {};

let currentState = {};

let lastFartTime = 0;

socket.on('message', function(message, rinfo) {
  try {
    const msgJson = JSON.parse(message);
    console.log('received a message:');
    console.log(msgJson);

    if (msgJson.fart) {
      const file = getFartFile();
      console.log(file)
      playVideoFile(file)
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

  // Object.keys(players).forEach(function(modeId) {
  //   const player = players[modeId];
  //   if (player && player.running) {
  //     console.log('player modeId ' + modeId + ' was running, quit player');
      // player.quit();
    // }
  // });

  // const folderPath = '/home/pi/rvr/modes/' + modeDirs[state.mode].path + '/';
  const folderPath = '/home/monday/rvr/modes/' + currentState.path + '/';
  const filePath = await getFilePath(folderPath);

  if (filePath) {
    console.log('file path', filePath);
    playVideoFile(filePath);
    // players[state.mode] = Omx(filePath);
  } else {
    console.log('file was not found for module');
  }
};

const playVideoFile = file => {
  console.log('playVideoFile')
  // if(vlcProcess) {
  //   // Something else is playing
  //   vlcProcess.kill();
  //   while(!vlcProcess.killed) {}

  //   vlcProcess = null;
  // }

  // let killer = spawn('/usr/bin/pkill vlc', {shell: true});
  // killer.on('exit', () => {
  //   console.log('killed all vlc players')
  // })


  // console.log('file to play: ', file)
  // vlcProcess = spawn('/usr/bin/vlc', ['--fullscreen' ,'--video-on-top', '--no-video-title-show', '--qt-continue=0', '--play-and-exit', file]);

  vlcProcess = spawn(`/usr/bin/pkill -9 vlc ; /usr/bin/vlc --fullscreen --video-on-top --no-video-title-show --qt-continue=0 --play-and-exit ${file}`, {shell: true});

  vlcProcess.on('exit', () => {
    vlcProcess = null; console.log('started new vlc process'); 
  });
  vlcProcess.on('close', () => vlcProcess = null);
};

socket.bind(socket.port);
