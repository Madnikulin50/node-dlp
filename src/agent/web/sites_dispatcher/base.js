var Case = require('../../../case')
var path = require('path')

class BaseDispatcher {
  constructor (inOptions) {
    Object.assign(this, inOptions)
  }

  get priority () {
    return 127
  }

  get service () {
    return 'unknown'
  }

  isMine (inPacket) {
    return false
  }

  fillCase (inParams, inCase) {
    let packet = inParams.packet
    inCase.setParams({
      service: inParams.service || this.service,
      date: (new Date()).toUTCString(),
      user: packet.user,
      src_ip: packet.src_ip,
      dst_host: packet.host,
      channel: 'web',
      agent: inParams.agent.name,
      user_agent: packet.userAgent
    })
  }

  createCase (inParams) {
    let newCase = new Case()
    newCase.setFolder(path.join(inParams.agent.audit_fld, newCase.id))
    this.fillCase(inParams, newCase)
    return newCase
  }

  finishCase (inParams, onDone = (err) => { if (err) throw err }) {
    if (inParams.agent !== undefined) {
      return inParams.agent.makeAudit(inParams.case, onDone)
    }
    onDone('Not set agent reference')
  }

  finishCaseSimple (inParams, inCase, onDone = (err) => { if (err) throw err }) {
    let p = Object.assign({}, inParams)
    p.case = inCase
    return this.finishCase(p, onDone)
  }

  processDefaultPost (inParams, onDone) {
    let cs = this.createCase(inParams)
    let params =
  {
    subject: 'Default POST logging'
  }
    cs.setParams(params)
    cs.setBody('Default POST body', (err) => {
      if (err) { return onDone(err) }
      this.finishCaseSimple(inParams, cs, onDone)
    })
  }

  process (inParams, onDone) {
    let packet = inParams.packet
    if (packet.isLikePost) { return this.processDefaultPost(inParams, onDone) }
    console.log('Unknown how process HTTP request ' + packet.method + ' ' + packet.host + packet.url)
    return false
  }

  createSearchCase (inParams, inSearch, onDone) {
    let cs = this.createCase(inParams)
    let params =
  {
    subject: inParams.packet.query.bq === undefined ? 'Search' : 'Fast search'
  }
    cs.setParams(params)
    cs.setBody(inSearch, err => {
      if (err) return onDone(err)
      this.finishCaseSimple(inParams, cs, onDone)
    })
  }
}

module.exports = BaseDispatcher
