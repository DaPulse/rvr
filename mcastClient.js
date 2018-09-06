const { socket } = require('./mcast');

socket.on('message', function(message, rinfo) {
  try {
    // console.info(`Message from: ${rinfo.address}:${rinfo.port} - ${message}`);
    const msgJson = JSON.parse(message);
    console.log('received a message:');
    console.log(msgJson);
  } catch (err) {
    // not json message
  }
});

socket.bind(socket.port);
