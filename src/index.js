var Options = require('./options');
var Backend = require('./backend');
var Agent = require('./agent');
var path = require('path');
var Audit = require('./audit');

var opts = new Options(path.join(process.cwd(), 'config'));

var backend = new Backend(opts);

var audit = new Audit(opts);

var agents = Agent.createAgentManager(opts);




