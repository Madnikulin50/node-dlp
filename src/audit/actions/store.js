var Action = require('./index.js');
var mongo = require('mongodb');
var Grid = require('gridfs-stream');
var Options = require('../../options');

class Store_Action extends Action
{
	constructor(in_Action_Options)
	{
		super(in_Action_Options);
		var options = new Options();
		Object.assign(this, options.store);
		return this;
	}

	do(in_Case, in_Callback)
	{
		var db = new mongo.Db(this.db, new mongo.Server(this.server, this.port));
		db.open(function (err) 
		{
  			if (err)
			  return console.log(err);
  			var gfs = Grid(db, mongo);
			var writestream = gfs.createWriteStream(
			{
				filename: '.body.txt'
			});
			writestream.on('close', (file)=>
			{
				if (file === undefined)
					return;
				let collection = db.collection('incidents');
				let params = Object.assign({}, in_Case);
				params.body = file._id; 
				collection.insert(params);
			});
			in_Case.getBodyStream().pipe(writestream);
		});

		return super.do(in_Case);
	}
};

module.exports = Store_Action;