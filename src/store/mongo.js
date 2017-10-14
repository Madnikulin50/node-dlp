var Base_Store_Dispatcher = require('./base');
var mongodb = require('mongodb');
var Grid = require('gridfs-stream');
var async = require('async');
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
      if (in_Params.query)
        query = in_Params.query;
			
			collection.find(query).sort({date: 1}).skip(in_Params.start).limit(in_Params.start + in_Params.count).toArray((err, items) => {
				if (err) {
					in_CB(err);
					return;
				}
				
				let result = 
				{
					num: items.length,
					items: items.filter((element) =>
					{
            if (element.agent === 'undefined')
              element.agent = undefined;
						element.numAttachments = element.attachments !== undefined ? element.attachments.length : 0;
						return true;
					})
				};
				in_CB(null, result);
			});
		});
	}

	removeIncident(in_Params, in_CB)
	{
		let ids = in_Params.ids;
		
		connectDb(this, (err, db) => {
			if (err) {
				in_CB(err);
				return;
			}
      var collection = db.collection('incidents');
      async.each(ids, (id, idDone) => {
        let query = {'_id':new ObjectId(id)};
        collection.remove(query, (err) => {
          if (err)
            return idDone(err);
          return idDone();
        })
      },
      (err) => {
        if (err) {
          return in_CB(err);
        }
        return in_CB(null, {ids: in_Params.ids});
      });
		});
  }
  
  getAttachment(in_Params, in_CB)
  {
    var id = in_Params.id;
  
		connectDb(this, (err, db) => {
			if (err) {
				in_CB(err);
				return;
      }
      var gfs = Grid(db, mongodb);
      let stream = gfs.createReadStream({_id: id}, [{"content_type": 'application/octet-stream'}]);
      in_CB(null, stream);
    });
  }

  pushLabel(in_Params, in_CB)
  {
    var {id, label} = in_Params;
		connectDb(this, (err, db) => {
			if (err) {
				in_CB(err);
				return;
      }

      var collection = db.collection('incidents'); 
			var query = {'_id':new ObjectId(id)};
      collection.update(query, {
          labels:[label]
        }, 
        { upsert: true },
        in_CB(err)
      );
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
          if (str === 'undefined')
					  item.body = undefined;
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
  __doStoreIncident(in_AddParams, in_CB)
  {
    let collection = db.collection('incidents');
    let params = Object.assign({}, cs, in_AddParams);
    params.md5 = md5;
    collection.insert(params);
    in_CB(null);
  }

  __doStoreFiles(in_Params, in_CB)
  {
    var result = [];
    var cs = in_Params.case;
		var db = in_Params.db;
    cs.getAttachments((err, files) => {
      if (err)
        return in_CB(err);
      if (files.length === 0)
        return in_CB(null, []);
      async.each(files, (file, fileDone) => {
        var gfs = Grid(db, mongodb);
        var writestream = gfs.createWriteStream(
        {
          filename: file,
          attachment: true
        });
        writestream.on('close', (fd) => {
          if (file === undefined)
            return fileDone(`File ${file} not stored`);
          result.push({
            filename:file,
            size:fd.length,
            id: fd._id
          });
          return fileDone();
        });
        cs.getAttachmentStream(file).pipe(writestream);
      },
      (err) => {
        in_CB(err, result);
      });
    });
  }

  __doStoreBody(in_Params, in_CB)
  {
    var cs = in_Params.case;
		var db = in_Params.db;
		
    if (!cs.hasBodyStream())
      return in_CB();
    
    var gfs = Grid(db, mongodb);
    var writestream = gfs.createWriteStream(
    {
      filename: '.body.txt'
    });
    writestream.on('close', (file) =>
    {
      if (file === undefined)
        return in_CB('Body not stored');
      in_CB(null, file._id);
    });
    cs.getBodyStream().pipe(writestream);
    
  }

	doStore(in_Params, in_CB)
	{
		var cs = in_Params.case;
		var db = new mongodb.Db(this.db, new mongodb.Server(this.server, this.port));
		db.open((err) => {
  		if (err) {
        console.log(err)
				return in_CB(err);
      }
      
			var collection = db.collection('incidents'); 
      let md5 = cs.calcMD5();
      var add = {
        md5:md5
      };
			var query = {'md5': md5};
			collection.findOne(query).then((item) => {
				if (item) {
					return in_CB(null);
        }      
        this.__doStoreFiles({case:cs, db:db}, (err, result) => {
          if (err)
            return in_CB(err);
          if (result.length > 0)
            add.attachments = result;
          this.__doStoreBody({case:cs, db:db}, (err, result) => {
            if (result !== undefined)
              add.body = result;
            let incident = Object.assign({}, cs, add);
            collection.insert(incident);
            in_CB(null);
          });
        });
			});
		});	
	}
}

module.exports = Mongo_Store_Dispatcher;