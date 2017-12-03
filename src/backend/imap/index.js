
const imapServer = require('./server.js')
var defaultcommands = require('./defaultcommands.js')
const async = require('async')

var storeLoader = require('../../store')
class IMAP {
  constructor (inOptions) {
    this.options = inOptions
    let backendOpts = this.options.backend
    imapServer.IMAPServer(backendOpts.imap.portnum)
    defaultcommands.SetDefaultCommands()
    imapServer.IMAPCommands.LOGIN.callback = this.login.bind(this)
    imapServer.IMAPCommands.SELECT.callback = this.select.bind(this)
    imapServer.IMAPCommands.FETCH.callback = this.fetch.bind(this)
    let storeAllOptions = inOptions.store
    let storeOptions = storeAllOptions[storeAllOptions.active]

    storeLoader(storeOptions,
      (err, store) => {
        if (err) { throw err }
        this.store = store
      })
  }

  login (command, socket) {
    let backendOpts = this.options.backend
    let accounts = backendOpts.imap.accounts
    for (let i in accounts) {
      let account = accounts[i]
      if (command.args[0] === account.user &&
    command.args[1] === account.pass) {
        socket.write(command.tag + ' OK Welcome overwritten ' + command.args[0] + '\r\n')
        socket.IMAPState = imapServer.IMAPState.Authenticated
        return
      }
    }
    socket.write(command.tag + ' NO Wrong user or password.\r\n')
  }

  fetch (command, socket) {
    let ids = []
    let res
    {
      let start = command.args[0]
      let end = start
      if (start.indexOf(':') !== -1) { [start, end] = start.split(':') }
      start = parseInt(start)
      end = parseInt(end)
      for (let i = start; i <= end; i++) { ids.push(i) }
    }
    let cur = 0
    async.eachSeries(ids, (id, doneId) => {
      this.store.getIncident({id: this._selected[cur]}, (err, result) => {
        if (err) { return doneId(err) }
        cur++
        if (result === undefined) { return doneId() }
        res = `* ${id} FETCH `
        for (let i = 1; command.args.length; i++) {
          let arg = command.args[i]
          if (arg === undefined) { break }

          if (arg[0] === '(') {
            res += '('
            arg = arg.substr(1)
          }
          let post = ' '
          let j = arg.indexOf(')')
          if (j !== -1) {
            post = arg.substr(j) + ' '
            arg = arg.substr(0, j - 1)
          }

          if (arg === 'UID') { res += ' UID ' + result._id } else if (arg === 'FLAGS') { res += ' FLAGS (\\Seen)' } else if (arg === 'INTERNALDATE') {
            res += ` INTERNALDATE "${result.date}"`
          } else if (arg.startsWith('BODY.PEEK[HEADER.FIELDS')) {
            res += ` BODY.PEEK[HEADER.FIELDS `
            for (i = i + 1; i < command.args.length; i++) {
              arg = command.args[i]
              let j = arg.indexOf('])')
              if (j === -1) { res += arg + ' ' } else {
                res += arg.substr(0, j + 1)
                let data = ''
                if (result.date !== undefined) { data += `Date: ${result.date}\r\n` }
                if (result.from !== undefined) { data += `From: ${result.from}\r\n` }
                if (result.to !== undefined) { data += `To: ${result.to}\r\n` }
                if (result.cc !== undefined) { data += `CC: ${result.cc}\r\n` }
                if (result.bcc !== undefined) { data += `BCC: ${result.bcc}\r\n` }
                if (result.subject !== undefined) { data += `Subject: ${result.subject}\r\n` }
                res += ` {${data.length}} ` + data
                post = arg.substr(j + 1) + ' '
              }
            }
          }

          res += post
        }
        console.log(res)
        socket.write(res)
        doneId()
      })
    }, (err) => {
      if (err) { res = command.tag + ' ERR [READ-WRITE] FETCH err\r\n' } else { res = command.tag + ' OK [READ-WRITE] FETCH completed\r\n' }
      console.log(res)
      socket.write(res)
    })
  }

  select (command, socket) {
    this.store.getNumIncidents({}, (err, result) => {
      if (err) { return err }
      this.store.getIncidents({}, (err, incidents) => {
        if (err) {
          console.log(err)
          return
        }
        // get existent messages in mailbox
        var numExist = result.count
        var numRecent = result.count
        var numUnseen = result.count

        var res = '* ' + numExist + ' EXISTS\r\n'

        // get recent messages

        res += '* ' + numRecent + ' RECENT\r\n'
        this._selected = incidents.items.map(e => e._id)

        // get unseen messages

        res += '* OK [UNSEEN ' + numUnseen + '] Message ' + numUnseen + ' is first unseen\r\n'

        res += '* OK [UIDVALIDITY 3857529045] UIDs valid\r\n'

        res += '* OK [UIDNEXT 4392] Predicted next UID\r\n'

        res += '* FLAGS (\\Answered \\Flagged \\Deleted \\Seen \\Draft)\r\n'

        res += '* OK [PERMANENTFLAGS (\\Deleted \\Seen \\*)] Limited\r\n'

        res += command.tag + ' OK [READ-WRITE] SELECT completed\r\n'
        console.log(res)
        socket.write(res)
      })
    })
  }
}

module.exports = IMAP
