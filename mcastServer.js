const { asyncSleep } = require('./utils');
const { socket, MULTICAST_ADDR } = require('./mcast');
const { initSerialListener } = require('./serial');

socket.bind(socket.port);

let currentMode = 1;
initSerialListener(data => {
  console.log(data);
  if (data.mode) {
    // currentMode = parseInt(data.mode);
  }
});

setInterval(() => {
  if (currentMode == 1) {
    currentMode = 2;
  } else {
    currentMode = 1;
  }
}, 4000);

const sendMessage = async () => {
  console.log('send message');
  // const message = Buffer.from(`Message from process ${process.pid}`);
  const msg = JSON.stringify({ mode: currentMode });
  for (let i = 0; i < 1; i++) {
    await asyncSleep(10);
    socket.send(msg, 0, msg.length, socket.port, MULTICAST_ADDR, function() {
      console.info(`Sending msg "${msg}"`);
    });
  }
};

setInterval(sendMessage, 2000);
