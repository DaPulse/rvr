const { asyncSleep } = require('./utils');

let lastFartTime = new Date().getTime();

const fart = async (omxPlayer, n = 2) => {
  for (let index of new Array(n)) {
    const timeNow = new Date().getTime();
    if (timeNow - lastFartTime < 500) return;
    lastFartTime = timeNow;
    console.log('Farting');
    const randomFart = Math.ceil(Math.random() * 8);
    let filePath = `/home/pi/rvr/farts/fart-0${randomFart}.mp3`;
    console.log('file path', filePath);
    omxPlayer(filePath);
    const randomTime = Math.floor(Math.random() * 2000);
    await asyncSleep(randomTime);
  }
};

module.exports = {
    fart
}
