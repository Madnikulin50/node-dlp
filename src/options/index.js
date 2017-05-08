var fs = require('fs');
var path = require('path');

class Options
{
    constructor(in_Path)
    {
        this._config_folder = in_Path;
    }

    load(path)
    {

    };

    get backend()
    {
        let fn = path.join(this._config_folder, 'backend.json');
        let opt = fs.existsSync(fn) ? require(fn) : {};
        Object.assign(opt, 
        {
            backend:
            {
                portnum:1212
            }
        });
        return opt;
    }

    get audit()
    {
        let fn = path.join(this._config_folder, 'audit.json');
        let opt = fs.existsSync(fn) ? require(fn) : {};
        return opt;
    }

    get agents()
    {
        let fn = path.join(this._config_folder, 'agents.json');
        let opt = fs.existsSync(fn) ? require(fn) : {};
        return opt;
    }
};

exports = module.exports = Options;