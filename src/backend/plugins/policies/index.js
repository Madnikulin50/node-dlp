const Tools = require('../../../tools')

module.exports = function (inOptions, inBackend) {
  let app = inBackend.app
  let audit = inOptions.audit
  if (audit.policy === undefined) { audit.policy = [] }
  audit.policy.forEach((policy) => {
    if (policy.id === undefined) { policy.id = Tools.generateId() }
  })

  app.get('/api/get-policies', (req, res) => {
    let audit = inOptions.audit
    res.json(audit.policy)
  })

  app.get('/api/get-policy', (req, res) => {
    let audit = inOptions.audit
    var id = req.query.id
    var policy = audit.policy.find((policy) => { return policy.id === id })
    if (policy === undefined) { return res.sendStatus(400, 'policy not found') }
    res.json(policy)
  })

  app.post('/api/set-policy', (req, res) => {
    let audit = inOptions.policy
    var id = req.query.id
    if (id === undefined) { id = Tools.generateId() }
    var policyIdx = audit.policy.findIndex((policy) => { return policy.id === id })
    if (policyIdx === -1) {
      let policy = Object.assign({}, req.body)
      policy.id = id
      audit.policy.push(policy)
      return res.sendStatus(200)
    }
    audit.policy.splice(policyIdx, 1, req.body)
    res.sendStatus(200)
  })

  app.get('/api/remove-policy', (req, res) => {
    var id = req.query.id
    var policyIdx = audit.policy.findIndex((policy) => { return policy.id === id })
    if (policyIdx === -1) { return res.sendStatus(400, 'policy not found') }
    audit.policy.splice(policyIdx, 1, req.body)
    res.sendStatus(200)
  })
}
