
module.exports = function (inOptions, onDone) {
  const type = inOptions.type
  const Class = require('./' + type)
  if (!Class) { onDone('Undefined condition type ' + type, null) }
  return new Class(inOptions, onDone)
}
