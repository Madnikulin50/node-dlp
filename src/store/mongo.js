var BaseStoreDispatcher = require('./base')
var mongodb = require('mongodb')
var Grid = require('gridfs-stream')
var async = require('async')
var ObjectId = mongodb.ObjectID

var streamToString = function (stream, cb) {
  const chunks = []
  stream.on('data', (chunk) => {
    chunks.push(chunk.toString())
  })
  stream.on('end', () => {
    cb(chunks.join(''))
  })
}

var connectDb = function (inStoreOptions, onDone) {
  var MongoClient = mongodb.MongoClient

  var url = 'mongodb://' + inStoreOptions.server + ':' + inStoreOptions.port + '/' + inStoreOptions.db
  MongoClient.connect(url, onDone)
}

class MongoStoreDispatcher extends BaseStoreDispatcher {
  getIncidents (inParams, onDone) {
    connectDb(this, (err, db) => {
      if (err) {
        return onDone(err)
      }

      if (inParams.start === undefined) { inParams.start = 0 }
      if (inParams.count === undefined) { inParams.count = 100 }

      let collection = db.collection('incidents')
      let query = {}
      if (inParams.filter !== undefined) {
        query = {
          $or: [
            {
              subject: { $regex: inParams.filter }
            },
            {
              from: { $regex: inParams.filter }
            },
            {
              to: { $regex: inParams.filter }
            }
          ]
        }
      }
      if (inParams.query) { query = inParams.query }

      collection.find(query).sort({date: 1}).skip(inParams.start).limit(inParams.start + inParams.count).toArray((err, items) => {
        if (err) {
          return onDone(err)
        }

        let result =
    {
      num: items.length,
      items: items.filter((element) => {
        if (element.agent === 'undefined') { element.agent = undefined }
        element.numAttachments = element.attachments !== undefined ? element.attachments.length : 0
        return true
      })
    }
        onDone(null, result)
      })
    })
  }

  removeIncident (inParams, onDone) {
    let ids = inParams.ids

    connectDb(this, (err, db) => {
      if (err) {
        onDone(err)
        return
      }
      var collection = db.collection('incidents')
      async.each(ids, (id, idDone) => {
        let query = {'_id': new ObjectId(id)}
        collection.remove(query, (err) => {
          if (err) { return idDone(err) }
          return idDone()
        })
      },
      (err) => {
        if (err) {
          return onDone(err)
        }
        return onDone(null, {ids: inParams.ids})
      })
    })
  }

  getAttachment (inParams, onDone) {
    var id = inParams.id

    connectDb(this, (err, db) => {
      if (err) {
        onDone(err)
        return
      }
      var gfs = Grid(db, mongodb)
      let stream = gfs.createReadStream({_id: id}, [{'content_type': 'application/octet-stream'}])
      onDone(null, stream)
    })
  }

  pushLabel (inParams, onDone) {
    var {id, label} = inParams
    connectDb(this, (err, db) => {
      if (err) {
        onDone(err)
        return
      }

      var collection = db.collection('incidents')
      var query = {'_id': new ObjectId(id)}
      collection.update(query, {
        labels: [label]
      },
      { upsert: true },
      onDone(err)
      )
    })
  }

  getIncident (inParams, onDone) {
    var id = inParams.id
    connectDb(this, (err, db) => {
      if (err) {
        onDone(err)
        return
      }
      var collection = db.collection('incidents')
      var query = {'_id': new ObjectId(id)}
      collection.findOne(query).then((item) => {
        if (!item) {
          onDone(err)
          return
        }
        var gfs = Grid(db, mongodb)
        let bodyStream = gfs.createReadStream({_id: item.body})
        item.numAttacments = 0
        streamToString(bodyStream, (str) => {
          if (str === 'undefined') { item.body = undefined }
          onDone(null, item)
        })
      })
    })
  }

  getNumIncidents (inParams, onDone) {
    connectDb(this, (err, db) => {
      if (err) {
        onDone(err)
        return
      }
      var collection = db.collection('incidents')
      var query = null
      if (inParams.unreaded !== undefined) { query = {readed: {'$exists': false}} }
      collection.count(query).then((data) => {
        if (!data) {
          onDone(err)
          return
        }

        onDone(null, {count: data})
      })
    })
  }

  __doStoreFiles (inParams, onDone) {
    var result = []
    var cs = inParams.case
    var db = inParams.db
    cs.getAttachments((err, files) => {
      if (err) { return onDone(err) }
      if (files.length === 0) { return onDone(null, []) }
      async.each(files, (file, fileDone) => {
        var gfs = Grid(db, mongodb)
        var writestream = gfs.createWriteStream(
          {
            filename: file,
            attachment: true
          })
        writestream.on('close', (fd) => {
          if (file === undefined) { return fileDone(`File ${file} not stored`) }
          result.push({
            filename: file,
            size: fd.length,
            id: fd._id
          })
          return fileDone()
        })
        cs.getAttachmentStream(file).pipe(writestream)
      },
      (err) => {
        onDone(err, result)
      })
    })
  }

  __doStoreBody (inParams, onDone) {
    var cs = inParams.case
    var db = inParams.db

    if (!cs.hasBodyStream()) { return onDone() }

    var gfs = Grid(db, mongodb)
    var writestream = gfs.createWriteStream(
      {
        filename: '.body.txt'
      })
    writestream.on('close', (file) => {
      if (file === undefined) { return onDone('Body not stored') }
      onDone(null, file._id)
    })
    cs.getBodyStream().pipe(writestream)
  }

  doStore (inParams, onDone) {
    var cs = inParams.case
    var db = new mongodb.Db(this.db, new mongodb.Server(this.server, this.port))
    db.open((err) => {
      if (err) {
        console.log(err)
        return onDone(err)
      }

      var collection = db.collection('incidents')
      let md5 = cs.calcMD5()
      var add = {
        md5: md5
      }
      var query = {'md5': md5}
      collection.findOne(query).then((item) => {
        if (item) {
          return onDone()
        }
        this.__doStoreFiles({case: cs, db: db}, (err, result) => {
          if (err) { return onDone(err) }
          if (result.length > 0) { add.attachments = result }
          this.__doStoreBody({case: cs, db: db}, (err, result) => {
            if (err) { return onDone(err) }
            if (result !== undefined) { add.body = result }
            let incident = Object.assign({}, cs, add)
            collection.insert(incident)
            return onDone()
          })
        })
      })
    })
  }
}

module.exports = MongoStoreDispatcher
