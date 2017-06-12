var express = require('express');
var fs = require('fs');
var path = require('path');
var Telegram = require('./telegram');

class Backend
{
    constructor(in_Options)
    {
        this.app = express();
		this.options = in_Options;
		this.loadPlugins(in_Options);
		this.start();

		let backend_opts = this.options.backend;
		if (backend_opts["telegram-key"])
		{
			this.telegram = new Telegram(this.options);
		}
    }

	loadPlugins(in_Options)
	{
		const testFolder = path.join(__dirname, 'plugins');
		fs.readdirSync(testFolder).forEach(file => 
		{
  			var _plugin = require(path.join(testFolder, file));
			_plugin(in_Options, this);
		});
	}

	start()
	{
		let backend_opts = this.options.backend;
		this.app.use(express.static(path.join(__dirname, '../fronend')));
		
		this.app.listen(backend_opts.portnum);
	}

};

module.exports = Backend;