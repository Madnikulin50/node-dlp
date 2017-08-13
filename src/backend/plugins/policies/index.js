const Tools = require('../../../tools');

module.exports = function (in_Options, in_Backend) {
  let app = in_Backend.app;
  let audit = in_Options.audit;
  if (audit.policy === undefined)
    audit.policy = [];
  audit.policy.forEach((policy) => {
    if (policy.id === undefined)
      policy.id = Tools.generateId();
  });

  app.get('/api/get-policies', (req, res) => {
    let audit = in_Options.audit;
    res.json(audit.policy);
  });

  app.get('/api/get-policy', (req, res) => {
    let audit = in_Options.audit;
    var id = req.query.id;
    var policy = audit.policy.find((policy) => { return policy.id === id });
    if (policy === undefined)
      return res.sendStatus(400, err);
    res.json(policy);
  });

  app.post('/api/set-policy', (req, res) => {
    let audit = in_Options.policy;
    var id = req.query.id;
    if (id === undefined)
      id = Tools.generateId();
    var policyIdx = audit.policy.findIndex((policy) => { return policy.id === id });
    if (policyIdx === -1)
    {
      let policy = Object.assign({}, req.body);
      policy.id = id;
      audit.policy.push(policy);
      return res.sendStatus(200);;
    }
    audit.policy.splice(policyIdx, 1, req.body);
    res.sendStatus(200);
  });

  app.get('/api/remove-policy', (req, res) => {
    var id = req.query.id;
    var policyIdx = audit.policy.findIndex((policy) => { return policy.id === id });
    if (policyIdx === -1)
      return res.sendStatus(400, err);
    audit.policy.splice(policyIdx, 1, req.body);
    res.sendStatus(200);
  });
};