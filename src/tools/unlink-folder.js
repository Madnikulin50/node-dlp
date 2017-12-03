const fs = require('fs')
const path = require('path')
const async = require('async')

let unlinkDirOrFile = function (inPath, onDone) {
  fs.lstat(inPath, (err, stats) => {
    if (err) { return onDone(err) }
    if (stats.isDirectory()) {
      return fs.rmdir(inPath, (err) => {
        if (err) { console.log(`error on delete ${inPath} :${err}`) }
        return onDone(err)
      })
    } else {
      return fs.unlink(inPath, (err) => {
        if (err) { console.log(`error on delete ${inPath} :${err}`) }
        return onDone(err)
      })
    }
  })
}

let recursiveUnlink = function (inPath, onDone) {
  fs.readdir(inPath, (err, files) => {
    if (err ||
      files.length === 0) {
      return unlinkDirOrFile(inPath, onDone)
    }

    async.eachSeries(files, (file, fileDone) => {
      recursiveUnlink(path.join(inPath, file), (err) => {
        if (err) { return fileDone(err) }
        return fileDone()
      }, (err) => {
        if (err) { return onDone(err) }
        return unlinkDirOrFile(inPath, onDone)
      })
    })
  })
}

module.exports = recursiveUnlink
