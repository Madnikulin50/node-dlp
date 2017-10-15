const _generateId = require('./generate-id.js')
const _unlinkFolder = require('./unlink-folder.js')

class Tools {
  generateId () {
    return _generateId()
  }

  unlinkFolder (inPath, onDone = (err) => { if (err) throw err }) {
    return _unlinkFolder(inPath, onDone)
  }
}

module.exports = new Tools()
