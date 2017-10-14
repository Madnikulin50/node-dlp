const fs = require('fs');
const path = require('path');
const async = require('async');

let unlinkDirOrFile = function(in_Path, in_CB) {
  fs.lstat(in_Path, (err, stats) => {
    if (err)
      return in_CB(err);
    if (stats.isDirectory())
      return fs.rmdir(in_Path, (err) => {
        if (err)
          console.log(`error on delete ${in_Path} :${err}`);
        return in_CB(err);
      });
    else
      return fs.unlink(in_Path, (err) => {
        if (err)
          console.log(`error on delete ${in_Path} :${err}`);
        return in_CB(err);
      });
  })
};

let recursiveUnlink = function (in_Path, in_CB) {
  fs.readdir(in_Path, (err, files) => {
    if (err ||
      files.length === 0) {
      
      return unlinkDirOrFile(in_Path, in_CB);
    }

    async.eachSeries(files, (file, fileDone) => {
      recursiveUnlink(path.join(in_Path, file), (err) => {
        if (err)
          return fileDone(err);
        return fileDone();
      }, (err) => {
        if (err)
          return in_CB(err);
        return unlinkDirOrFile(in_Path, in_CB);
      })
    })
  });
};

module.exports = recursiveUnlink;
