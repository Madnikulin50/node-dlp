var Action = require('./index.js')

class BlockAction extends Action {
  do (inEnv, onDone) {
    this.isSatisfying(inEnv, (err, result) => {
      if (result) {
        console.log('Executed ' + this.type + ' action ' + (this.name !== undefined ? this.name : '(noname)'))
        inEnv.result.block = true
        inEnv.result.blockReason = 'Blocked by action ' + (this.name !== undefined ? this.name : '(noname)')
      }
      onDone(err, result)
    })
  }
};

module.exports = BlockAction
