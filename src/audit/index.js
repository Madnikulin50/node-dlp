const Options = require('../options')
const async = require('async')
const policyCreator = require('./policy')
const fs = require('fs')
const path = require('path')
const AnalyseLog = require('./analyze-log')
const tools = require('../tools')
const Case = require('../case')

let instance = null

class Audit {
  constructor (inOptions, onDone) {
    if (inOptions) {
      this.loadOptions(inOptions, (err, result) => {
        onDone(err, instance)
      })
    }
  }

  static create (inOptions, onDone) {
    if (instance) { return instance }
    instance = new Audit(inOptions, onDone)
    return instance
  }

  static get () {
    if (instance) { return instance }
    throw new Error('Audit not loaded')
  }

  findPolicy (inName) {
    return this.policies.find((element) => {
      if (element.name === inName) { return true }
      return false
    })
  }

  loadOptions (inOptions, onDone) {
    this.policies = []
    let policyOpts
    let auditOpts = inOptions.audit
    if (Array.isArray(auditOpts.policy)) { policyOpts = auditOpts.policy } else { policyOpts = [auditOpts.policy] }

    async.each(policyOpts, (opts, callback) => {
      policyCreator(opts, (err, result) => {
        if (result) { this.policies.push(result) }
        callback(err)
      })
    },
    (err) => {
      if (err) { return onDone(err) }
      this.actions = []

      auditOpts.actions.forEach((element) => {
        const Action = require(path.join(__dirname, 'actions', element.type))
        element.audit = this
        this.actions.push(new Action(element))
      })

      const options = new Options()
      const testFolder = options.agents.common.audit_fld
      fs.readdir(testFolder, (err, files) => {
        if (err) {
          console.log(err)
          onDone(null, null)
          return
        }
        async.eachSeries(files, (file, fileDone) => {
          this.processCatalog(path.join(testFolder, file), (err) => {
            if (err) { console.log(`Error ${err} on restored catalog ${file}`) }
            fileDone()
          })
        },
        (err) => {
          return onDone(err)
        })
      })
    })
  }

  processCatalog (inPath, onDone = (err) => { if (err) throw err }) {
    fs.exists(path.join(inPath, '.params'), (exists) => {
      if (!exists) { return tools.unlinkFolder(inPath, onDone) }
      Case.fromCatalog(inPath, (err, cs) => {
        if (err) { return tools.unlinkFolder(inPath, onDone) }
        return this.execute({case: cs}, onDone)
      })
    })
  }

  execute (inEnv, onDone = (err) => { if (err) throw err }) {
    inEnv.afterAllActions = []
    inEnv.result = {
      block: false
    }
    inEnv.analyseLog = new AnalyseLog()
    async.each(this.actions, (action, actionDone) => {
      action.do(inEnv, (err, result) => {
        actionDone(err)
      })
    },
    (err) => {
      if (err) { return onDone(err) }
      async.each(inEnv.afterAllActions, (action, actionDone) => {
        action.doAfterAll(inEnv, (err) => {
          return actionDone(err)
        })
      }, (err) => {
        return inEnv.case.clean(onDone(err, inEnv.result))
      })
    })
  }

  executeOnDB () {

  }
};

module.exports = Audit
