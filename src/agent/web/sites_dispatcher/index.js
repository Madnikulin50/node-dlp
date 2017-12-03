const fs = require('fs')
const path = require('path')
class SiteDispatcher {
  constructor (inOptions) {
    this.options = inOptions
    this.loadDispatchers()
  }

  loadDispatchers () {
    this.dispatchers = []
    fs.readdir(__dirname, (err, files) => {
      if (err) {
        return console.log(err)
      }
      files.forEach((file) => {
        var Class = require(path.join(__dirname, file))
        if (Class.IS_DISPATCHER === undefined) { return }
        this.dispatchers.push(new Class(this))
      })

      this.dispatchers.sort((a, b) => {
        return a.priority - b.priority
      })
    })
  }

  isInteresting (inPacket) {
    if (inPacket.isLikePost) { return true }

    if (!inPacket.isLikeGet) { return false }

    for (let i in this.dispatchers) {
      if (this.dispatchers[i].isMine(inPacket)) { return true }
    }
    return false
  }
  process (inParams, onDone = err => { if (err) throw err }) {
    for (let i in this.dispatchers) {
      if (this.dispatchers[i].isMine(inParams.packet)) {
        return this.dispatchers[i].process(inParams, onDone)
      }
    }
    return onDone(null, null)
  }
}

module.exports = SiteDispatcher
