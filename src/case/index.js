var fs = require('fs')
var path = require('path')
var crypto = require('crypto')
var md5 = require('md5')

const tools = require('../tools')

const paramsFilename = '.params'
const bodyFilename = '.body'
const attachmentsField = '.att'
const attachmentsTextField = '.att_text'

class Case {
  constructor () {
    this.channel = 'undefined'
    this.agent = 'undefined'
    this.id = crypto.randomBytes(48).toString('hex')
  }

  static fromCatalog (inPath, onDone) {
    let cs = new Case()
    cs._folder = inPath
    cs.loadParams((err) => {
      if (err) { return onDone(err) }
      return onDone(null, cs)
    })
  }

  clean (onDone = (err) => { if (err) console.log(err) }) {
    return tools.unlinkFolder(this._folder, (err) => {
      onDone(err)
    })
  }

  getField (inField) {
    let val = this[inField]
    if (val !== undefined) { return val }
    if (inField === 'body') { return fs.readFileSync(path.join(this._folder, bodyFilename), 'utf8') }
    return undefined
  }

  pushRule (inRule) {
    this.rules.push(inRule)
    return this.storeParams()
  }

  isRulePresent (inRule) {
    return this.rules.indexOf(inRule) !== -1
  }

  storeParams () {
    fs.writeFile(path.join(this._folder, paramsFilename), JSON.stringify(this, '\t'), 'utf8')
  }

  loadParams (onDone) {
    fs.readFile(path.join(this._folder, paramsFilename), 'utf8', (err, data) => {
      if (err) { return onDone(err) }
      try {
        let params = JSON.parse(data)
        this.channel = undefined
        this.agent = undefined
        this.id = undefined
        Object.assign(this, params)
        return onDone()
      } catch (error) {
        return onDone(err)
      }
    })
  }

  getParams () {
    return this
  }

  setParams (inParams) {
    Object.assign(this, inParams)
    this.storeParams()
  }

  setFolder (inFolder) {
    this._folder = inFolder
    if (!fs.existsSync(this._folder)) { fs.mkdirSync(this._folder) }
  }

  setBody (inString, onDone) {
    fs.writeFile(path.join(this._folder, bodyFilename), inString, 'utf8', onDone)
  }

  getEncodedBody (inEncoding, onDone) {
    fs.readFile(path.join(this._folder, bodyFilename), inEncoding, onDone)
  }

  getBody (onDone) {
    fs.readFile(path.join(this._folder, bodyFilename), onDone)
  }

  calcMD5 () {
    let buf = JSON.stringify(this)
    return md5(buf)
  }

  hasBodyStream () {
    return fs.existsSync(path.join(this._folder, bodyFilename))
  }

  getBodyStream () {
    return fs.createReadStream(path.join(this._folder, bodyFilename))
  }

  getAttachments (onDone) {
    fs.readdir(path.join(this._folder, attachmentsField), (err, files) => {
      if (err) { return onDone(null, []) }
      return onDone(err, files)
    })
  }

  getAttachmentStream (inFilename) {
    return fs.createReadStream(path.join(path.join(this._folder, attachmentsField), inFilename))
  }

  pushAttachment (inPath, inFilename, onDone) {
    this.ensureFolder(path.join(this._folder, attachmentsField), (err) => {
      if (err) { return onDone(err) }
      fs.writeFile(path.join(this._folder, attachmentsField, inFilename), fs.createReadStream(inPath), onDone)
    })
  }

  pushAttachmentFromBuffer (inFilename, inBuffer, onDone = (err) => { if (err) console.log(err) }) {
    this.ensureFolder(path.join(this._folder, attachmentsField), (err) => {
      if (err) { return onDone(err) }
      fs.writeFile(path.join(this._folder, attachmentsField, inFilename), inBuffer, onDone)
    })
  }

  ensureFolder (inPath, onDone) {
    fs.exists(inPath, (exists) => {
      exists ? onDone(null) : fs.mkdir(inPath, onDone)
    })
  }
}

module.exports = Case
