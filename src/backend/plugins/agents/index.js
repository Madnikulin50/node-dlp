const Tools = require('../../../tools');

module.exports = function (in_Options, in_Backend) {
  let app = in_Backend.app;
  let agentsAllOptions = in_Options.agents;
  agentsAllOptions.agents.forEach((agent) => {
    if (agent.id === undefined)
      agent.id = Tools.generateId();
  });

  app.get('/api/get-agents', (req, res) => {
    let agentsAllOptions = in_Options.agents;
    res.json(agentsAllOptions.agents);
  });

  app.get('/api/get-agent', (req, res) => {
    let agentsAllOptions = in_Options.agents;
    var id = req.query.id;
    var agent = agentsAllOptions.agents.find((agent) => { return agent.id === id });
    if (agent === undefined)
      return res.sendStatus(400, "Not found");
    res.json(agent);
  });

  app.post('/api/set-agent', (req, res) => {
    let agentsAllOptions = in_Options.agents;
    var id = req.query.id;
    if (id === undefined)
      id = Tools.generateId();
    var agentIdx = agentsAllOptions.agents.findIndex((agent) => { return agent.id === id });
    if (agentIdx === -1)
    {
      let agent = Object.assign({}, req.body);
      agent.id = id;
      agentsAllOptions.agents.push(agent);
      return res.sendStatus(200);
    }
    agentsAllOptions.agents.splice(agentIdx, 1, req.body);
    res.sendStatus(200);
  });

  app.get('/api/remove-agent', (req, res) => {
    var id = req.query.id;
    var agentIdx = agentsAllOptions.agents.findIndex((agent) => { return agent.id === id });
    if (agentIdx === -1)
      return res.sendStatus(400, "Not found");
    agentsAllOptions.agents.splice(agentIdx, 1, req.body);
    res.sendStatus(200);
  });
};