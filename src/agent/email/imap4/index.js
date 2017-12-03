const EmailSheduledAgent = require('../sheduled.js')
const path = require('path')
const fs = require('fs')
const Imap = require('imap')
const inspect = require('util').inspect

class Imap4Agent extends EmailSheduledAgent {
  constructor (inOptions) {
    super(inOptions)
    Object.assign(this, inOptions)
  }

  get name () {
    return 'imap4'
  }

  do () {
    console.log('Starting IMAP4 task\nserver - ' + this.server + ':' + this.port + (this.tls ? 'tls' : 'plain') + '\nuser - ' + this.user)

    var imap = new Imap(
      {
        user: this.user,
        password: this.pass,
        host: this.server,
        port: this.port,
        tls: this.tls
      })
    imap.once('ready', function () {
      imap.openBox('INBOX', true, function (err, box) {
        if (err) { throw err }
        imap.search([ 'UNSEEN', ['SINCE', 'May 20, 2010'] ], function (err, results) {
          if (err) { throw err }
          var f = imap.fetch(results, { bodies: '' })
          f.on('message', function (msg, seqno) {
            console.log('Message #%d', seqno)
            var prefix = '(#' + seqno + ') '
            msg.on('body', function (stream, info) {
              console.log(prefix + 'Body')
              let fn = path.join(this.tmp_fld, 'msg-' + seqno + '-body.eml')
              let writeStream = fs.createWriteStream(fn)
              writeStream.write('X-Node-DLP-Agent:IMAP4\r\n')
              writeStream.on('close', function () {
                this.makeCaseFromEml(fn)
              }.bind(this))
              stream.pipe(writeStream)
            }.bind(this))
            msg.once('attributes', function (attrs) {
              console.log(prefix + 'Attributes: %s', inspect(attrs, false, 8))
            })
            msg.once('end', function () {
              console.log(prefix + 'Finished')
            })
          }.bind(this))
          f.once('error', function (err) {
            console.log('Fetch error: ' + err)
          })
          f.once('end', function () {
            console.log('Done fetching all messages!')
            imap.end()
          })
        }.bind(this))
      }.bind(this))
    }.bind(this))
    imap.once('error', function (err) {
      console.log(err)
    })

    imap.once('end', function () {
      console.log('Connection ended')
    })

    imap.connect()
  }
};

module.exports = Imap4Agent
