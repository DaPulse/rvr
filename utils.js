const asyncSleep = millis => new Promise(resolve => setTimeout(resolve, millis));

module.exports = {
  asyncSleep
};
