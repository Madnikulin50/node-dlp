
class AnalyseLog {
  constructor () {
    this.elems = []
  }
  pushText (inString) {
    this.push(inString)
  }

  pushPolicyApply (inPolicy, inCondition, inInfo) {
    this.push({
      text: 'Apply police' + inPolicy + ' by condition ' + inCondition,
      policy: inPolicy,
      condition: inCondition,
      info: inInfo
    })
  }

  push (inElem) {
    this.elems(inElem)
  }
};

module.exports = AnalyseLog
