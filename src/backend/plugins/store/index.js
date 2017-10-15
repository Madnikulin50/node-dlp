
module.exports = function (inOptions, inBackend) {
  let app = inBackend.app

  app.get('/api/get-store', (req, res) => {
    let allOptions = inOptions.store
    res.json(allOptions.agents)
  })

  app.get('/api/set-store', (req, res) => {
    let allOptions = inOptions.store
    allOptions.mongo = Object.assign({}, req.body.mongo)
    allOptions.postgres = Object.assign({}, req.body.postgres)
    res.sendStatus(200)
  })
}
