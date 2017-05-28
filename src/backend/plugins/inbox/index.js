
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

module.exports = function(in_Options, in_Backend)
{
	let app = in_Backend.app;
	var storeOptions = in_Options.store;

	app.get('/api/get_incidents.json', (req, res) => {
		let filter = req.query.filter;
		if (filter !== undefined &&
			filter.length === 0)
			filter = undefined;
		let start = req.query.start;
		if (start === undefined)
			start = 0;
		else
			start = parseInt(start);
		connectDb(storeOptions, (err, db) => {
			
			if (err) {
				res.send(400);
				return;
			}
			let collection = db.collection('incidents'); 
			let query = {};
			if (filter !== undefined)
			{
				query = {
					$or:[
						{
							subject: { $regex: filter }
						},
						{
							from: { $regex: filter }
						},
						{
							to: { $regex: filter }
						}
					]
				};
			}
			

			collection.find(query).sort({date: 1}).skip(start).limit(start + 100).toArray((err, items) => {
				if (err) {
					res.send(400);
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
				res.json(result);
			});
		});
	});

	app.get('/api/get_incident.json', (req, res) => {
		var id = req.query.id;
		connectDb(storeOptions, (err, db) => {
			if (err) {
				res.send(400);
				return;
			}
			var collection = db.collection('incidents'); 
			var query = {'_id':new ObjectId(id)};
			collection.findOne(query).then((item) => {
				if (!item) {
					res.send(400);
					return;
				}
				var gfs = Grid(db, mongodb);
				let bodyStream = gfs.createReadStream({_id: item.body});
				item.numAttacments = 0;
				streamToString(bodyStream, (str) => {
					item.body = str;
					res.json(item);
				});
			});
		});
	});

	app.get('/api/get_num_unreaded_incidents.json', (req, res) => {
		connectDb(storeOptions, (err, db) => {
			if (err) {
				res.send(400);
				return;
			}
			var collection = db.collection('incidents'); 
			var query = {readed:{'$exists': false}};
			collection.count(query).then((data) => {
				if (!data) {
					res.send(400);
					return;
				}
				
				
				res.json({count:data});
			});
		});
	});

	app.get('/api/get_incident_blob', (req, res) => {
		let _id = req
		connectDb(storeOptions, (err, db) => {
			if (err) {
				res.send(400);
				return;
			}
			var collection = db.collection('incidents'); 

			collection.find({}).toArray((err, items) => {
				if (err) {
					res.send(400);
					return;
				}
				
				let result = 
				{
					num: items.length,
					items: items
				};
				res.json(result);
			});
		});
	});
	
}
