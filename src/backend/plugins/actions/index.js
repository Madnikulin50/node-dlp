const Tools = require('../../../tools')

module.exports = function (inOptions, inBackend) {
  let app = inBackend.app
  let audit = inOptions.audit
  if (audit.actions === undefined) { audit.actions = [] }
  audit.actions.forEach((action) => {
    if (action.id === undefined) { action.id = Tools.generateId() }
  })

  app.get('/api/get-actions', (req, res) => {
    let actions = inOptions.audit.actions.map((a) => {
      let action = Object.assign({}, a)
      action.audit = undefined
      return action
    })
    res.json(actions)
  })

  app.get('/api/get-action', (req, res) => {
    let audit = inOptions.audit
    var id = req.query.id
    var action = audit.actions.find((action) => { return action.id === id })
    if (action === undefined) {
      return res.sendStatus(400, 'fction not found')
    }
    var outAction = Object.assign({}, action)
    outAction.audit = undefined
    res.json(outAction)
  })

  app.post('/api/set-action', (req, res) => {
    let audit = inOptions.audit
    var id = req.query.id
    if (id === undefined) { id = Tools.generateId() }
    var actionIdx = audit.actions.findIndex((action) => { return action.id === id })
    if (actionIdx === -1) {
      let action = Object.assign({}, req.body)
      action.id = id
      audit.policies.push(action)
      return res.sendStatus(200)
    }
    audit.policies.splice(actionIdx, 1, req.body)
    res.sendStatus(200)
  })

  app.get('/api/remove-action', (req, res) => {
    let audit = inOptions.audit
    var id = req.query.id
    var actionIdx = audit.actions.findIndex((action) => { return action.id === id })
    if (actionIdx === -1) { return res.sendStatus(400, 'action not found') }
    audit.policies.splice(actionIdx, 1, req.body)
    res.sendStatus(200)
  })
}
