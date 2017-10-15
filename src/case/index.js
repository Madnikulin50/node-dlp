var fs = require('fs')
var path = require('path')
var crypto = require('crypto')
var md5 = require('md5')

const tools = require('../tools')

const params_fn = '.params'
const body_fn = '.body'
const attachments_fld = '.att'
const attchments_texts_fld = '.att_text'

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
    if (inField === 'body') { return fs.readFileSync(path.join(this._folder, body_fn), 'utf8') }
    return undefined
  }

  pushRule (in_Rule) {
    this.rules.push(in_Rule)
    storeParams()
  }

  isRulePresent (in_Rule) {
    return this.rules.indexOf(in_Rule) !== -1
  }

  storeParams () {
    fs.writeFile(path.join(this._folder, params_fn), JSON.stringify(this, '\t'), 'utf8')
  }

  loadParams (onDone) {
    fs.readFile(path.join(this._folder, params_fn), 'utf8', (err, data) => {
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

  setFolder (in_Folder) {
    this._folder = in_Folder
    if (!fs.existsSync(this._folder)) { fs.mkdirSync(this._folder) }
  }

  setBody (in_String, onDone) {
    fs.writeFile(path.join(this._folder, body_fn), in_String, 'utf8', onDone)
  }

  getEncodedBody (in_Encoding, onDone) {
    fs.readFile(path.join(this._folder, body_fn), in_Encoding, onDone)
  }

  getBody (onDone) {
    fs.readFile(path.join(this._folder, body_fn), onDone)
  }

  calcMD5 () {
    let buf = JSON.stringify(this)
    return md5(buf)
  }

  hasBodyStream () {
    return fs.existsSync(path.join(this._folder, body_fn))
  }

  getBodyStream () {
    return fs.createReadStream(path.join(this._folder, body_fn))
  }

  getAttachments (onDone) {
    fs.readdir(path.join(this._folder, attachments_fld), (err, files) => {
      if (err) { return onDone(null, []) }
      return onDone(err, files)
    })
  }

  getAttachmentStream (in_Filename) {
    return fs.createReadStream(path.join(path.join(this._folder, attachments_fld), in_Filename))
  }

  pushAttachment (inPath, in_Filename, onDone) {
    this.ensureFolder(path.join(this._folder, attachments_fld), (err) => {
      if (err) { return onDone(err) }
      fs.writeFile(path.join(this._folder, attachments_fld, in_Filename), fs.createReadStream(inPath), onDone)
    })
  }

  pushAttachmentFromBuffer (in_Filename, in_Buffer, onDone = (err) => { if (err) console.log(err) }) {
    this.ensureFolder(path.join(this._folder, attachments_fld), (err) => {
      if (err) { return onDone(err) }
      fs.writeFile(path.join(this._folder, attachments_fld, in_Filename), in_Buffer, onDone)
    })
  }

  ensureFolder (inPath, onDone) {
    fs.exists(inPath, (exists) => {
      exists ? onDone(null) : fs.mkdir(inPath, onDone)
    })
  }
}

module.exports = Case
