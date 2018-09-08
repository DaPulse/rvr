const MODULE_TYPE = process.env.RVR_MODULE || 'undefined_module';
global.MODULE_TYPE = MODULE_TYPE;

const { asyncSleep } = require('./utils');
const { socket, modeDirs, MULTICAST_ADDR, getModeDirsSerialString } = require('./mcast');
const { sendSerialMessage, initSerialListener } = require('./serial');

socket.bind(socket.port);

let lastSentTime = new Date().getTime();

let currentMode = 1;

setInterval(() => {
  if (currentMode == 2) {
    currentMode = 1;
  } else {
    currentMode = 2;
  }
}, 2000);

initSerialListener(data => {
  console.log('Received message: ', data);
  if (data.action && data.action == 'play') {
    if (parseInt(data.channel) != currentMode) {
      currentMode = parseInt(data.channel);
      sendMessage();
    }
  }

  if (data.action && data.action == 'get_modes') {
    setTimeout(() => sendSerialMessage(getModeDirsSerialString()), 1000);
    console.log('Getting modes');
  }

  if (data.action && data.action == 'fart') {
    sendMessage(JSON.stringify({ fart: true }));
  }
});

const sendMessage = async message => {
  if (new Date().getTime - lastSentTime < 100) return;
  lastSentTime = new Date().getTime();

  console.log('send message');
  // const message = Buffer.from(`Message from process ${process.pid}`);
  let msg;
  if (message) {
    msg = message;
  } else {
    const path = (modeDirs[currentMode] || {}).path;
    msg = JSON.stringify({ mode: currentMode, path });
  }

  for (let i = 0; i < 1; i++) {
    await asyncSleep(10);
    socket.send(msg, 0, msg.length, socket.port, MULTICAST_ADDR, function() {
      console.info(`Sending msg "${msg}"`);
    });
  }
};

setInterval(sendMessage, 1000);
