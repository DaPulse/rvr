const { asyncSleep } = require('./utils');
const find = require('find-process');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

const PROCESS_NAME = '/usr/bin/omxplayer';
let isRunning = false;
// if more than one process with the name is running
// we will kill all the oldest processes
// and will keep only the newset time with the minimum uptime

let times = {};

const killZombieProcesses = async () => {
  if (isRunning) return;
  isRunning = true;
  let youngestProcessId = null;
  let youngestProcessTime = null;
  try {
    find('name', PROCESS_NAME).then(async processes => {
      console.log('num of processes found', processes.length);
      await asyncSleep(100);
      if (processes.length < 2) return (isRunning = false);
      for (var i = 0; i < processes.length; i++) {
        // console.log('---------');
        let process = processes[i];
        const pid = process.pid;
        // console.log('process id', pid);
        let time;
        try {
          let output = await exec(
            `ps -eo pid,etime,command | grep ${pid} | grep -v grep | awk '{print $2}' | awk -F : '{ printf("%.2f", $1*60+$2+($3/60)); }'`
          );
          time = parseInt(output.stdout);
        } catch (err) {
          console.log('ERROR, cant get time', err);
          time = 999999999999999999;
        }
        times[pid] = time;
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
        if (pid != youngestProcessId && times[pid] >= 2) {
          console.log('killing process id:', pid);
          try {
            await exec(`kill -9 ${pid} || 'no process to kill'`);
          } catch (err) {
            console.log('ERROR', err);
          }
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
setInterval(killZombieProcesses, 100);

module.exports = {};
