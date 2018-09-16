const util = require('util');
const exec = util.promisify(require('child_process').exec);
const { readdirSync, statSync } = require('fs');
var rimraf = require('rimraf');
const { join } = require('path');
const ip = require('ip');
const SERVER_IP = ip.address();
console.log('Device ip address: ', SERVER_IP);

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

module.exports = {
  deleteOldFolders
};
