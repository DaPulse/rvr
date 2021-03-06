const ip = require('ip');

const SERVER_IP = ip.address();

console.log('server ip address, ', SERVER_IP);

let clients = {};

// creating a udp server
var udp = require('dgram');
var server = udp.createSocket('udp4');

// emits when any error occurs
server.on('error', function(error) {
  console.log('Error: ' + error);
  server.close();
});

// emits on new datagram msg
server.on('message', function(msg, info) {
  console.log('message received');
  console.log(msg.toString());
  msgJson = JSON.parse(msg.toString());
  if (msgJson.type == 'ping') {
    clients[msgJson.ip] = msgJson;
  }

  console.log(clients);

  // console.log('Received %d bytes from %s:%d\n', msg.length, info.address, info.port);

  // console.log(info);

  // //sending msg
  // const responseMsg = JSON.stringify({ msg: 'I received' });
  // server.send(responseMsg, info.port, info.address, function(error) {
  //   if (error) {
  //     client.close();
  //   } else {
  //     console.log('Data sent !!!');
  //   }
  // });
});

//emits when socket is ready and listening for datagram msgs
server.on('listening', function() {
  var address = server.address();
  var port = address.port;
  var family = address.family;
  var ipaddr = address.address;
  console.log('Server is listening at port' + port);
  console.log('Server ip :' + ipaddr);
  console.log('Server is IP4/IP6 : ' + family);
});

//emits after the socket is closed using socket.close();
server.on('close', function() {
  console.log('Socket is closed !');
});

server.bind('2222');

const changeChannel = () => {
  console.log('send change channel message');

  Object.keys(clients).forEach(function(clientIp) {
    console.log('client ip: ', clientIp);
    // const msg = JSON.stringify({ type: 'change_channel', channel: 3 });
    const msg = JSON.stringify({ test: 'aaa' });
    server.send(msg, '2222', clientIp, function(error) {
      if (error) {
        client.close();
      } else {
        console.log('Data sent !!!');
      }
    });

    // do something with obj[key]
  });
};

setInterval(changeChannel, 1000);

// setTimeout(function() {
//   server.close();
// }, 5000);
