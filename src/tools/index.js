const _generateId = require('./generate-id.js');
const _unlinkFolder = require('./unlink-folder.js');

class Tools
{
  constructor() {
  }

  generateId() {
    return _generateId();
  }

  unlinkFolder(in_Path, in_CB = (err) => { if (err) throw err }) {
    return _unlinkFolder(in_Path, in_CB);
  }
}

module.exports = new Tools();