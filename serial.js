const { exec } = require('child_process');
var SerialPort = require('serialport');

let serial = null;

const sendSerialMessage = message => {
  console.log('Sending message on serial: ', message);
  serial.write(message);
  serial.flush();
};

const initSerialListener = callback => {
  const piArduinoDevicePrefix = 'ttyACM';
  // usbmodem is for mac
  exec('ls /dev/ | grep -E "(ttyACM|cu.usbmodem).*"', (err, stdout, stderr) => {
    let devices = stdout.split('\n');

    console.log(devices);
    devices.forEach(device => {
      try {
        serialListen(device);
      } catch (err) {
        console.log('error...');
        // can't connect to device
      }
    });
  });

  const serialListen = device => {
    console.log('device name', `/dev/${device}`);
    var serialPort = new SerialPort(`/dev/${device}`, {
      baudRate: 9600
    });

    console.log('Set serial to ', serial);

    let msg = '';

    serialPort.on('open', () => {
      serial = serialPort;
    });

    // Switches the port into "flowing mode"
    serialPort.on('data', function(data) {
      console.log('data: ', data.toString('utf8'))
      console.log('msg: ', msg)
      try {
        msg = msg + data.toString('utf8');
        if (data.includes('\n')) {
          console.log('msg to parse: ', msg)
          let data = JSON.parse(msg.slice(0, -2));
          msg = '';

          callback(data);
        }
      } catch (err) {
        msg = '';
        console.log('a', data.toString('utf8'));
        console.log('b', err);
      }
    });

    // Read data that is available but keep the stream from entering //"flowing mode"
    // serialPort.on('readable', function () {
    //   const data = port.read();
    //   console.log(data.toString('utf8'))
    //
    // });
  };
};

module.exports = {
  initSerialListener,
  sendSerialMessage
};
