const Options = require('../options');
const async = require('async');
const policy_creator = require('./policy');
const fs = require('fs');
const path = require('path');
const Analyse_Log = require('./analyze-log');
const tools = require('../tools');
const Case = require('../case');

let instance = null;

class Audit {
  constructor(in_Options, in_Cb) {
    if (in_Options)
      this.loadOptions(in_Options, (err, result) => {
        in_Cb(err, instance);
      });
  }

  static create(in_Options, in_Cb) {
    if (instance)
      return instance;
    instance = new Audit(in_Options, in_Cb);
    return instance;
  }

  static get() {
    if (instance)
      return instance;
    throw 'Audit not loaded';
  }

  findPolicy(in_Name) {
    return this.policies.find((element) => {
      if (element.name === in_Name)
        return true;
      return false;
    })
  }

  loadOptions(in_Options, in_CB) {
    this.policies = [];
    let policy_opts;
    let audit_opts = in_Options.audit;
    if (Array.isArray(audit_opts.policy))
      policy_opts = audit_opts.policy;
    else
      policy_opts = [audit_opts.policy];

    async.each(policy_opts, (opts, callback) => {
      policy_creator(opts, (err, result) => {
        if (result)
          this.policies.push(result);
        callback(err);
      });

    },
      (err) => {
        this.actions = [];

        audit_opts.actions.forEach((element) => {
          let action = require(__dirname + '/actions/' + element.type);
          element.audit = this;
          this.actions.push(new action(element));
        });

        const options = new Options();
        const testFolder = options.agents.common.audit_fld;
        fs.readdir(testFolder, (err, files) => {
          if (err) {
            console.log(err);
            in_CB(null, null);
            return;
          }
          async.eachSeries(files, (file, fileDone) => {
            this.processCatalog(path.join(testFolder, file), (err) => {
              if (err)
                console.log(`Error ${err} on restored catalog ${file}`);
              fileDone();
            });
          },
          (err) => {

          });
        });
        in_CB(null);
      });
  }
  processCatalog(in_Path, in_Callback = (err) => { if (err) throw err; }) {
    fs.exists(path.join(in_Path, '.params'), (exists) => {
      if (!exists)
        return tools.unlinkFolder(in_Path, in_Callback);
      Case.fromCatalog(in_Path, (err, cs) => {
        if (err)
          return tools.unlinkFolder(in_Path, in_Callback);
        return this.execute({case: cs}, in_Callback);
      });
    });
  }

  execute(in_Env, in_Callback = (err) => { if (err) throw err; }) {
    let err = null;
    let result = {};
    in_Env.afterAllActions = [];
    in_Env.result = {
      block: false
    };
    in_Env.analyseLog = new Analyse_Log();
    async.each(this.actions, (action, callback) => {
      action.do(in_Env, (err, result) => {
        callback();
      })
    },
      (err) => {
        async.each(in_Env.afterAllActions, (action, callback) => {
          action.doAfterAll(in_Env, (err) => {
            return callback(err);
          });
        }, (err) => {
          return in_Env.case.clean(in_Callback(err, in_Env.result));
        });
      });
  }

  executeOnDB() {

  }

};

module.exports = Audit;