
module.exports = function (inParams, onDone) {
  var Class = require('./' + inParams.type)
  var store = new Class(inParams)
  return store.start({}, onDone)
}
