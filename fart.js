const { asyncSleep } = require('./utils');

let lastFartTime = new Date().getTime();

const getFartFile = () => {
    const timeNow = new Date().getTime();
    if (timeNow - lastFartTime < 200) return;
    lastFartTime = timeNow;
    console.log('Farting');
    const randomFart = Math.ceil(Math.random() * 8);
    let filePath = `/home/monday/rvr/farts/fart-0${randomFart}.mp3`;
    return filePath;
};

module.exports = {
  getFartFile,
}
