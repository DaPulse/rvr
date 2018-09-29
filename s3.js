const util = require('util');
const exec = util.promisify(require('child_process').exec);
const fs = require('fs');
const { readdirSync, statSync } = require('fs');
var rimraf = require('rimraf');
const { join } = require('path');


let lastSyncTime = 0;
try {
  // lastSyncTime = parseInt(fs.readFileSync('./last_sync_time'));
} catch (err) {
  // console.log(err);
}


var AwsS3 = require('aws-sdk/clients/s3');
const s3 = new AwsS3({
  region: 'us-east-1'
});

const listDirectories = params => {
  return new Promise((resolve, reject) => {
    const s3params = {
      Bucket: 'monday-rvr',
      MaxKeys: 999,
      Delimiter: '',
      Prefix: ''
    };
    s3.listObjectsV2(s3params, (err, data) => {
      if (err) {
        reject(err);
      }
      resolve(data);
    });
  });
};

const syncS3 = async () => {
  try {
    let output = await exec(`mkdir modes`);
  } catch (err) {
    // folder already exist
  }
  try {
    let output = await exec(
      `cd modes && aws s3 sync s3://monday-rvr ./ --exclude "*" --include "*${
        global.MODULE_TYPE
      }*" --include "*.mp3" ${true ? '' : '--delete'}`
    );
    // console.log(output);
  } catch (err) {
    console.log(err);
  }
};

// socket.bind(PORT);
const getS3Files = async () => {
  try {
    folderPaths = {};
    const res = await listDirectories();
    res.Contents.forEach(element => {
      let key = element.Key;
      folderPath = key.split('/')[0];
      folderPaths[folderPath] = true;
    });
    return folderPaths;
  } catch (err) {
    console.log(err);
  }
};

const getDirs = p => readdirSync(p).filter(f => statSync(join(p, f)).isDirectory());

const deleteOldFolders = async () => {
  try {
  console.log('delete old folders if not exist in S3')
  const usedFolders = await getS3Files();
  if (usedFolders.length < 2) return;
  const dirs = getDirs('./modes/');
  dirs.forEach(dirPath => {
    if (!usedFolders[dirPath]) {
      rimraf(`./modes/${dirPath}/`, function() {
        console.log('Folder deleted', dirPath);
      });
    }
  });
  console.log(usedFolders);
} catch(err) {
  console.log('error with deleting folders that does not exist in S3')
}
};

s3sync = async () => {
  const timeNow = Math.floor(new Date().getTime() / 1000);
  console.log('delta from last s3 sync in seconds', timeNow - lastSyncTime);
  if (timeNow - lastSyncTime < 60 * 60) {
    return console.log('dont need to sync');
  }
  console.log('sync files from s3');
  await syncS3();
  fs.writeFileSync('./last_sync_time', timeNow);
  console.log('Finished to sync files from s3');
};

module.exports = {
  deleteOldFolders,
  s3sync
};
