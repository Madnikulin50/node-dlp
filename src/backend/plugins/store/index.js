const Tools = require('../../../tools');

module.exports = function (in_Options, in_Backend) {
  let app = in_Backend.app;
  let allOptions = in_Options.store;
  

  app.get('/api/get-store', (req, res) => {
    let allOptions = in_Options.store;
    res.json(allOptions.agents);
  });

  app.get('/api/set-store', (req, res) => {
    let allOptions = in_Options.store;
    allOptions.mongo = Object.assign({}, req.body.mongo);
    allOptions.postgres = Object.assign({}, req.body.postgres)
    res.sendStatus(200);
  });
};