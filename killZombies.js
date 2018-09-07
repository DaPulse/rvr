const { asyncSleep } = require('./utils');
const find = require('find-process');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

const PROCESS_NAME = 'omxpalyer';
let isRunning = false;
// if more than one process with the name is running
// we will kill all the oldest processes
// and will keep only the newset time with the minimum uptime

const killZombieProcesses = async () => {
  if (isRunning) return;
  isRunning = true;
  let youngestProcessId = null;
  let youngestProcessTime = null;
  try {
    find('name', PROCESS_NAME).then(async processes => {
      // console.log('num of processes found', processes.length);
      if (processes.length < 2) return (isRunning = false);
      for (var i = 0; i < processes.length; i++) {
        // console.log('---------');
        let process = processes[i];
        const pid = process.pid;
        // console.log('process id', pid);
        let output = await exec(
          `ps -eo pid,etime,command | grep ${pid} | grep -v grep | awk '{print $2}' | awk -F : '{ printf("%.2f", $1*60+$2+($3/60)); }'`
        );
        let time = output.stdout;
        time = parseInt(time);
        // console.log('uptime:', time);

        if (!youngestProcessId) {
          youngestProcessId = pid;
          youngestProcessTime = time;
        } else {
          if (time < youngestProcessTime) {
            youngestProcessId = pid;
            youngestProcessTime = time;
          }
        }
      }

      for (var i = 0; i < processes.length; i++) {
        let process = processes[i];
        const pid = process.pid;
        if (pid != youngestProcessId) {
          console.log('killing process id:', pid);
          await exec('kill -9 ' + pid);
        }
      }

      isRunning = false;
      // await asyncSleep(1000);
    });
  } catch (err) {
    console.log('error', err);
    isRunning = false;
  }
};

console.log('initialized killing zombies processes script');
setInterval(killZombieProcesses, 2);

module.exports = {};
