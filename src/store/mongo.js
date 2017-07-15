var Base_Store_Dispatcher = require('./base');
var mongodb = require('mongodb');
var Grid = require('gridfs-stream');
var ObjectId = mongodb.ObjectID;

var streamToString = function(stream, cb) {
  const chunks = [];
  stream.on('data', (chunk) => {
    chunks.push(chunk.toString());
  });
  stream.on('end', () => {
    cb(chunks.join(''));
  });
}

var connectDb = function(in_StoreOptions, in_Callback)
{
	var MongoClient = mongodb.MongoClient;
 
	var url = 'mongodb://' + in_StoreOptions.server + ':' + in_StoreOptions.port + '/' + in_StoreOptions.db;
	MongoClient.connect(url, in_Callback);
};

class Mongo_Store_Dispatcher extends Base_Store_Dispatcher
{
	constructor(in_Options)
	{
		super(in_Options);
	}

	getIncidents(in_Params, in_CB)
	{
		connectDb(this, (err, db) => {
			
			if (err) {
				in_CB(err)
				return;
			}

			if (in_Params.start === undefined)
				in_Params.start = 0;
			if (in_Params.count === undefined)
				in_Params.count = 100;

			let collection = db.collection('incidents'); 
			let query = {};
			if (in_Params.filter !== undefined)
			{
				query = {
					$or:[
						{
							subject: { $regex: in_Params.filter }
						},
						{
							from: { $regex: in_Params.filter }
						},
						{
							to: { $regex: in_Params.filter }
						}
					]
				};
			}
			
			collection.find(query).sort({date: -1}).skip(in_Params.start).limit(in_Params.start + in_Params.count).toArray((err, items) => {
				if (err) {
					in_CB(err);
					return;
				}
				
				let result = 
				{
					num: items.length,
					items: items.filter((element) =>
					{
						element.numAttacments = 0;
						return true;
					})
				};
				in_CB(null, result);
			});
		});
	}

	removeIncident(in_Params, in_CB)
	{
		let ids = JSON.parse(in_Params.ids);
		var id = ids[0];
		connectDb(this, (err, db) => {
			if (err) {
				in_CB(err);
				return;
			}
			var collection = db.collection('incidents'); 
			var query = {'_id':new ObjectId(id)};
			collection.remove(query, (err) => {
				if (err) {
					in_CB(err);
					return;
				}
				in_CB(null, {ids: in_Params.ids});
			});
		});
	}

	getIncident(in_Params, in_CB)
	{
		var id = in_Params.id;
		connectDb(this, (err, db) => {
			if (err) {
				in_CB(err);
				return;
			}
			var collection = db.collection('incidents'); 
			var query = {'_id':new ObjectId(id)};
			collection.findOne(query).then((item) => {
				if (!item) {
					in_CB(err);
					return;
				}
				var gfs = Grid(db, mongodb);
				let bodyStream = gfs.createReadStream({_id: item.body});
				item.numAttacments = 0;
				streamToString(bodyStream, (str) => {
					item.body = str;
					in_CB(null, item);
				});
			});
		});
	}

	getNumIncidents(in_Params, in_CB)
	{
		connectDb(this, (err, db) => {
			if (err) {
				in_CB(err);
				return;
			}
			var collection = db.collection('incidents'); 
			var query = null;
			if (in_Params.unreaded !== undefined)
				query = {readed:{'$exists': false}};
			collection.count(query).then((data) => {
				if (!data) {
					in_CB(err);
					return;
				}
				
				
				in_CB(null, {count:data});
			});
		});
	}

	doStore(in_Params, in_CB)
	{
		var cs = in_Params.case;
		var db = new mongodb.Db(this.db, new mongodb.Server(this.server, this.port));
		db.open(function (err) 
		{
  			if (err)
			{
				in_CB(err);
				return console.log(err);
			}
			var collection = db.collection('incidents'); 
			let md5 = cs.calcMD5();
			var query = {'md5': md5};
			collection.findOne(query).then((item) => {
				if (item) {
					in_CB(null);
					return;
				}
				if (cs.hasBodyStream())
				{
					var gfs = Grid(db, mongodb);
					var writestream = gfs.createWriteStream(
					{
						filename: '.body.txt'
					});
					writestream.on('close', (file)=>
					{
						if (file === undefined)
							return;
						let collection = db.collection('incidents');
						let params = Object.assign({}, cs);
						params.body = file._id; 
						params.md5 = md5;
						collection.insert(params);
						in_CB(null);
					});
					cs.getBodyStream().pipe(writestream);
				}
				else
				{
					let collection = db.collection('incidents');
					let params = Object.assign({}, cs);
					params.md5 = md5;
					collection.insert(params);
					in_CB(null);
				}

				
			});
		});	
	}
};

module.exports = Mongo_Store_Dispatcher;