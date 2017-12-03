var Agent = require('../index.js')
var Case = require('../../case')
var fs = require('fs')
var path = require('path')
var SiteDispatcher = require('./sites_dispatcher')
var SiteGrabber = require('./site-grabber')

class WebAgent extends Agent {
  constructor (inOptions) {
    super(inOptions)
    this.siteDispatcher = new SiteDispatcher(inOptions)
    if (inOptions.use_grabber === true) { this.siteGrabber = new SiteGrabber(inOptions) }
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
        if (file.endsWith('.http')) { this.makeCaseFromHttp(path.join(testFolder, file)) }
      })
    })
  }
  makeCaseFromInputMessage (inMessage) {
    return Packet.makeFromData(inMessage)
  }
  makeCaseFromHttp (inFile) {
    let newCase = new Case()
    newCase.setFolder(path.join(this.audit_fld, newCase.id))
    try {
      /* var readStream = fs.createReadStream(inFile)

      simpleParser(readStream, (err, mail) => 
      {
        if (err)
        {
          fs.unlink(inFile);
          return;
        }
        var params =
        {
          date: mail.date,
          from: mail.from !== undefined ? mail.from.text : undefined,
          to: mail.to !== undefined ? mail.to.text : undefined,

          subject: mail.subject,
          messageId: mail.messageId,
          channel:'email'				 
        };
        if (mail.headers['x-node-dlp-agent'] !== undefined)
          params.agent = mail.header['x-node-dlp-agent']
        newCase.setParams(params);
        newCase.setBody(mail.text);
      
        fs.unlink(inFile, (err)=>{ console.log(err);});
        this.makeAudit(newCase);
      }); */
      fs.unlink(inFile, (err) => { if (err) console.log(err) })
    } catch (err) {
      console.log(err)
    }
  }
};

module.exports = WebAgent
