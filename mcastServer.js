const { asyncSleep } = require('./utils');
const { socket, MULTICAST_ADDR } = require('./mcast');

socket.bind(socket.port);

const sendMessage = async () => {
  console.log('send message');
  // const message = Buffer.from(`Message from process ${process.pid}`);
  const msg = JSON.stringify({ channel: 0 });
  for (let i = 0; i < 5; i++) {
    await asyncSleep(2);
    socket.send(msg, 0, msg.length, socket.port, MULTICAST_ADDR, function() {
      console.info(`Sending msg "${msg}"`);
    });
  }
};

setInterval(sendMessage, 1000);
