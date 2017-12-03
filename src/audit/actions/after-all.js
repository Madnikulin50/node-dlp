var Action = require('./index.js')

class AfterAllAction extends Action {
  do (inEnv, onDone) {
    this.isSatisfying(inEnv, (err, result) => {
      if (result) { inEnv.afterAllActions.push(this) }
      onDone(err, result)
    })
  }

  doAfterAll (inEnv, onDone) {
    onDone(null)
  }
};

module.exports = AfterAllAction
