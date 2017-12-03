var Agent = require('../index.js')
var Case = require('../../case')
var fs = require('fs')
var path = require('path')

class EmailAgent extends Agent {
  get name () {
    return 'unknown email agent'
  }

  start () {
    const testFolder = this.tmp_fld
    const fs = require('fs')
    fs.readdir(testFolder, (err, files) => {
      if (err) {
        console.log(err)
        return
      }
      files.forEach((file) => {
        if (file.endsWith('.eml')) { this.makeCaseFromEml(path.join(testFolder, file)) }
      })
    })
  }
  __makeAttachmentFileName (attachment) {
    let fn = attachment.filename
    if (fn === undefined) { fn = 'unknown' }
    if (path.extname(fn).length !== 0) { return fn }
    let contentType = attachment.contentType.split('/')
    fn = fn + '.' + (contentType.length === 2 ? contentType[1] : contentType[0])
    return fn
  }

  makeCaseFromEml (inFile) {
    let newCase = new Case()
    newCase.setFolder(path.join(this.audit_fld, newCase.id))
    const simpleParser = require('mailparser').simpleParser
    try {
      var readStream = fs.createReadStream(inFile)

      simpleParser(readStream, (err, mail) => {
        if (err) {
          fs.unlink(inFile)
          return
        }
        var params =
    {
      date: mail.date,
      from: mail.from !== undefined ? mail.from.text : undefined,
      to: mail.to !== undefined ? mail.to.text : undefined,

      subject: mail.subject,
      messageId: mail.messageId,
      channel: 'email'
    }
        if (mail.headers['x-node-dlp-agent'] !== undefined) { params.agent = mail.header['x-node-dlp-agent'] }
        newCase.setParams(params)
        newCase.setBody(mail.text)
        if (mail.attachments !== undefined && mail.attachments.length > 0) {
          mail.attachments.forEach((attachment) => {
            newCase.pushAttachmentFromBuffer(this.__makeAttachmentFileName(attachment), attachment.content)
          })
        }

        fs.unlink(inFile, (err) => { console.log(err) })
        this.makeAudit(newCase, (err) => {
          if (err) { console.log(err) }
        })
      })
    } catch (err) {
      console.log(err)
    }
  }
};

module.exports = EmailAgent
