var BaseStoreDispatcher = require('./base')
var pg = require('pg')
var async = require('async')

var fields_definition = [
  { name: 'undefinded'},
  { name: 'from', list: true},
  { name: 'to', list: true},
  { name: 'cc', list: true},
  { name: 'bcc', list: true},
  { name: 'agent'},
  { name: 'service'},
  { name: 'channel'},
  { name: 'dst_host'},
  { name: 'src_ip'}
]
class String_Ref {
  constructor (inField, inValue) {
    this.field = inField
    this.value = inValue
  }
  static fieldIndex (inFieldName) {
    for (let i = 1; i < fields_definition.length; i++) {
      if (fields_definition[i].name === inFieldName) { return i }
    }
    return -1
  }
  static fromValuesList (inFieldName, inValueList) {
    if (inValueList === undefined) { return [] }
    let field = String_Ref.fieldIndex(inFieldName)
    if (field === -1) { return [] }
    var result = []
    let val_arr = inValueList.split(';')
    for (let i in val_arr) {
      result.push(new String_Ref(field, val_arr[i]))
    }
    return result
  }

  static fromValue (inFieldName, inValue) {
    if (inValue === undefined) { return [] }
    let field = String_Ref.fieldIndex(inFieldName)
    if (field === -1) { return [] }
    return [new String_Ref(field, inValue)]
  }
};

class Postgres_Store_Dispatcher extends BaseStoreDispatcher {
  constructor (inOptions) {
    super(inOptions)
    this.pool = new pg.Pool(this)
    this.pool.on('error', function (err, client) {
      console.error('idle client error', err.message, err.stack)
    })
  }

  connect (onDone) {
    return this.pool.connect(onDone)
  }

  query (text, values, callback) {
    console.log('query:', text, values)
    return this.pool.query(text, values, callback)
  }

  executeSimpleCommand (in_String, onDone) {
    console.log('Execute simple command (' + in_String + ')')
    this.connect((err, client, done) =>	{
      if (err) { return onDone(err) }

      client.query(in_String, (err, result) => {
        if (err) { return onDone(err) }
        onDone(null, result.rows)
        done()
      })
    })
  }

  executeCommand (in_String, in_Parameters, onDone) {
    console.log('Execute command (' + in_String + ')')
    this.connect((err, client, done) =>	{
      if (err) { return onDone(err) }

      client.query(in_String, in_Parameters, (err, result) => {
        if (err) { return onDone(err) }
        onDone(null, result.rows)
        done()
      })
    })
  }

  prepareString (in_String) {
    var string = in_String.replace("'", "\'")
    return string
  }

  insertFields (inID, in_Case, onDone) {
    let fields = []
    for (let i = 1; i < fields_definition.length; i++) {
      let def = fields_definition[i]
      if (in_Case[def.name] === undefined) { continue }
      if (def.list !== undefined) { fields = fields.concat(String_Ref.fromValuesList(def.name, in_Case[def.name])) } else { fields = fields.concat(String_Ref.fromValue(def.name, in_Case[def.name])) }
    }

    async.eachSeries(fields, (field, callback) => {
      this.executeSimpleCommand('select insert_string_ref(' + inID +
    ', ' + field.field + ", '" + this.prepareString(field.value) + "');", (err, result) => {
        if (err) { throw err }
        callback()
      })
    },
    (err) => {
      console.log('All fields stored for id ' + inID)
      onDone(err)
    })
  }
  doStore (inParams, onDone) {
    var cs = inParams.case
    this.connect((err, client, done) => {
      if (err) {
        return onDone(err)
      }

      let md5 = cs.calcMD5()
      this.executeSimpleCommand("select * from main where md5 = '" + md5 + "'", (err, result) => {
        if (err) {
          return onDone(err)
        }
        if (result.length > 0) {
          console.log('Already in store')
          onDone(null)
          return done(null)
        }

        let date = new Date(cs.date)
        let dateString = [date.getFullYear(), date.getMonth() + 1, date.getDate()].join('-') +
     ' ' + [date.getHours(), date.getMinutes(), date.getSeconds()].join(':')

        client.query("INSERT INTO main (date) values ('" + dateString + "'); select CURRVAL('main_seq')", (err, result) => {
          if (err) {
            onDone(err)
            return done(err)
          }
          let id = result.rows[0].currval
          this.insertFields(id, cs, (err) => {
            console.log('New incdent reqistrating on id ' + id)
            if (cs.channel === 'web' ||
       cs.channel === 'proxy') {
              if (err) {
                onDone(err)
                return done(err)
              }

              this.executeSimpleCommand('insert into net (id, subject) values(' + id + ", '" + cs.subject + "');", (err, result) => {
                if (err) {
                  onDone(err)
                  return done(err)
                }
                cs.getEncodedBody('utf8', (err, data) => {
                  if (err) {
                    onDone(err)
                    return done(err)
                  }

                  this.executeCommand('insert into blob (id, blob_type, blob) values(' + id + ', 1, $1)', [data], (err, result) => {
                    if (err) {
                      onDone(err)
                      return done(err)
                    }
                    onDone(err)
                    done(err)
                  })
                })
              })
            }
          })
        })
      })
    })

    /* var db = new mongodb.Db(this.db, new mongodb.Server(this.server, this.port));
    db.open(function (err) 
    {
        if (err)
      {
        onDone(err);
        return console.log(err);
      }

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
        collection.insert(params);
        onDone(null);
      });
      cs.getBodyStream().pipe(writestream);
    }); */
  }
  uintToString (array) {
    var out, i, len, c
    var char2, char3

    out = ''
    len = array.length
    i = 0
    while (i < len) {
      c = array[i++]
      switch (c >> 4) {
        case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:
        // 0xxxxxxx
          out += String.fromCharCode(c)
          break
        case 12: case 13:
        // 110x xxxx   10xx xxxx
          char2 = array[i++]
          out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F))
          break
        case 14:
        // 1110 xxxx  10xx xxxx  10xx xxxx
          char2 = array[i++]
          char3 = array[i++]
          out += String.fromCharCode(((c & 0x0F) << 12) |
                       ((char2 & 0x3F) << 6) |
                       ((char3 & 0x3F) << 0))
          break
      }
    }

    return out
  }

  getIncident (inParams, onDone) {
    var id = inParams.id

    let query = 'select main.id as _id, '
    query += 'main.date as date'

    for (let i = 1; i < fields_definition.length; i++) {
      query += ', get_string_refs(main.id, ' + i + ') as ' + fields_definition[i].name
    }

    query += ', subject from main left join net on main.id = net.id where main.id = ' + id
  }


    /* var db = new mongodb.Db(this.db, new mongodb.Server(this.server, this.port));
    db.open(function (err) 
    {
        if (err)
      {
        onDone(err);
        return console.log(err);
      }

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
        collection.insert(params);
        onDone(null);
      });
      cs.getBodyStream().pipe(writestream);
    }); */
  }

  uintToString (array) {
    var out, i, len, c
    var char2, char3

    out = ''
    len = array.length
    i = 0
    while (i < len) {
      c = array[i++]
      switch (c >> 4) {
        case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:
        // 0xxxxxxx
          out += String.fromCharCode(c)
          break
        case 12: case 13:
        // 110x xxxx   10xx xxxx
          char2 = array[i++]
          out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F))
          break
        case 14:
        // 1110 xxxx  10xx xxxx  10xx xxxx
          char2 = array[i++]
          char3 = array[i++]
          out += String.fromCharCode(((c & 0x0F) << 12) |
                       ((char2 & 0x3F) << 6) |
                       ((char3 & 0x3F) << 0))
          break
      }
    }

    return out
  }

  getIncident (inParams, onDone) {
    var id = inParams.id

    let query = 'select main.id as _id, '
    query += 'main.date as date'

    for (let i = 1; i < fields_definition.length; i++) {
      query += ', get_string_refs(main.id, ' + i + ') as ' + fields_definition[i].name
    }

    query += ', subject from main left join net on main.id = net.id where main.id = ' + id

    this.executeSimpleCommand(query, (err, items) => {
      if (err) {
        onDone(err)
        return
      }
      if (items.length === 0) { return onDone('Not found message by id=' + id) }
      var item = items[0]
      item.numAttacments = 0
      item.body = ''
      this.executeSimpleCommand('select blob from blob where id = ' + id + ' and blob_type = 1 limit 1',
        (err, readResult) => {
          if (err === null &&
      readResult.length > 0 &&
      readResult[0].blob !== undefined) { item.body = this.uintToString(readResult[0].blob) }
          onDone(null, item)
        })
    })
  }

  getIncidents (inParams, onDone) {
    let query = 'select main.id as _id, '
    query += 'main.date as date'

    for (let i = 1; i < fields_definition.length; i++) {
      query += ', get_string_refs(main.id, ' + i + ') as ' + fields_definition[i].name
    }

    query += ', subject from main left join net on main.id = net.id order by date desc'

    this.executeSimpleCommand(query, (err, items) => {
      if (err) {
        onDone(err)
        return
      }
      let result =
   {
     num: items.length,
     items: items.filter((element) => {
       element.numAttacments = 0
       return true
     })
   }
      onDone(null, result)
    })

    /* connectDb(this, (err, db) => {
      
      if (err) {
        onDone(err)
        return;
      }

      if (inParams.start === undefined)
        inParams.start = 0;
      if (inParams.count === undefined)
        inParams.count = 100;

      let collection = db.collection('incidents'); 
      let query = {};
      if (inParams.filter !== undefined)
      {
        query = {
          $or:[
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
        };
      }

      collection.find(query).sort({date: -1}).skip(inParams.start).limit(inParams.start + inParams.count).toArray((err, items) => {
        if (err) {
          onDone(err);
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
        onDone(null, result);
      });
    }); */
  }

  getNumIncidents (inParams, onDone) {
    onDone(null, {count: 0})
  }
}

module.exports = Postgres_Store_Dispatcher
