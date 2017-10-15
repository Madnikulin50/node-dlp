var crypto = require('crypto')

module.exports = function () {
  return crypto.randomBytes(48).toString('hex')
}
