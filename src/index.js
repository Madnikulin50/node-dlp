var Options = require('./options')
var Backend = require('./backend')
var Agent = require('./agent')
var path = require('path')
var Audit = require('./audit')

var opts = new Options(path.join(process.cwd(), 'config'))

var backend = new Backend(opts)

var audit = Audit.create(opts, (err) => {
  if (err) { throw err }
  Agent.createAgentManager(opts)
})

process.on('uncaughtException', (err) => {
  console.error(err.message)
  if (err.stack) {
    console.error(err.stack)
  }
  process.exit(1)
})
