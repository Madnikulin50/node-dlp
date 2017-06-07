var Base_Store = require('./base');
var mongo = require('mongodb');
var Grid = require('gridfs-stream');


class Mongo_Store extends Base_Store
{
	constructor(in_Options)
	{
		super(in_Options);
	}

	
};

module.exports = Mongo_Store;