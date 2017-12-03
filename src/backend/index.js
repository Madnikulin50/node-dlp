var express = require('express')
var fs = require('fs')
var path = require('path')
var Telegram = require('./telegram')
var bodyParser = require('body-parser')

var IMAP = require('./imap')
var NNTP = require('./nntp')

class Backend {
  constructor (inOptions) {
    this.app = express()
    this.app.use(bodyParser.json())
    this.options = inOptions
    this.loadPlugins(inOptions)
    this.start()

    this.imap = new IMAP(inOptions)
    this.nntp = new NNTP(inOptions)

    let backendOpts = this.options.backend
    if (backendOpts['telegram-key']) {
      this.telegram = new Telegram(this.options)
    }
  }

  loadPlugins (inOptions) {
    const testFolder = path.join(__dirname, 'plugins')
    fs.readdirSync(testFolder).forEach(file => {
      var _plugin = require(path.join(testFolder, file))
      _plugin(inOptions, this)
    })
  }

  start () {
    let backendOpts = this.options.backend

    this.app.use(express.static(path.join(__dirname, '../fronend')))

    this.app.listen(backendOpts.portnum)
  }
}

module.exports = Backend
