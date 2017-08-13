const _generateId = require('./generate-id.js');

class Tools
{
  constructor() {
  }

  generateId() {
    return _generateId();
  }
}

module.exports = new Tools();