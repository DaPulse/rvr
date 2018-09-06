const { exec } = require('child_process');
var SerialPort = require('serialport');

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

    let msg = '';

    // Switches the port into "flowing mode"
    serialPort.on('data', function(data) {
      try {
        msg = msg + data.toString('utf8');
        if (data.includes('\n')) {
          let data = JSON.parse(msg.slice(0, -2));
          msg = '';

          if (data.mode) {
            callback(data);
            console.log(data);
          }
        }
      } catch (err) {
        console.log(err);
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
  initSerialListener
};
