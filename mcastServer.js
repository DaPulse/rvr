const MODULE_TYPE = process.env.RVR_MODULE || 'undefined_module';
global.MODULE_TYPE = MODULE_TYPE;

const { asyncSleep } = require('./utils');
const { socket, MULTICAST_ADDR, getModeDirsSerialString } = require('./mcast');
const { sendSerialMessage, initSerialListener } = require('./serial');

socket.bind(socket.port);

let currentMode = 1;
initSerialListener(data => {
  console.log('Received message: ', data);
  if (data.action && data.action == 'play') {
    currentMode = parseInt(data.channel);
  }

  if (data.action && data.action == 'get_modes') {
    setTimeout(() => sendSerialMessage(getModeDirsSerialString()), 1000);
    console.log('Getting modes');
  }

  if (data.action && data.action == 'fart') {
    sendMessage(JSON.stringify({ mode: 999 }));
  }
});

const sendMessage = async message => {
  console.log('send message');
  // const message = Buffer.from(`Message from process ${process.pid}`);
  let msg;
  if (message) {
    msg = message;
  } else {
    msg = JSON.stringify({ mode: currentMode });
  }

  for (let i = 0; i < 1; i++) {
    await asyncSleep(10);
    socket.send(msg, 0, msg.length, socket.port, MULTICAST_ADDR, function() {
      console.info(`Sending msg "${msg}"`);
    });
  }
};

setInterval(sendMessage, 1000);
