var SerialPort = require('serialport');
var serialPort = new SerialPort('/dev/cu.usbmodem14321', {
  baudRate: 9600
});

let msg = '';

// Switches the port into "flowing mode"
serialPort.on('data', function(data) {
  msg = msg + data.toString('utf8');
  if (data.includes('\n')) {
    let data = JSON.parse(msg.slice(0, -2));

    if (data.channel) {
      currentChannel = parseInt(data.channel);
    }
  }
});

// Read data that is available but keep the stream from entering //"flowing mode"
// serialPort.on('readable', function () {
//   const data = port.read();
//   console.log(data.toString('utf8'))
//
// });
