var storeLoader = require('../../../store');

module.exports = function(in_Options, in_Backend)
{
	let app = in_Backend.app;
	let storeAllOptions = in_Options.store;
	var storeOptions = storeAllOptions[storeAllOptions.active];
	var store = storeLoader(storeOptions,
	(err, store) => {
		if (err)
			throw err;

		app.post('/api/get-incidents', (req, res) => {
      var params  = req.body || {};
      params = Object.assign(params, req.query);
			let filter = params.filter;
			if (filter !== undefined &&
				filter.length === 0)
				filter = undefined;
			let start = params.start;
			if (start === undefined)
				start = 0;
			else
				start = parseInt(start);
			store.getIncidents({
				filter: filter,
				start: start,
			}, (err, data) => {
				if (err)
				{
					res.sendStatus(400, err);
				}
				res.json(data);
			});
    });
    app.get('/api/get-info', (req, res) => {
      res.json({});
		});
		app.get('/api/get-incident', (req, res) => {
			var id = req.query.id;
			store.getIncident({
				id: id
			}, (err, data) => {
				if (err)
				{
					return res.sendStatus(400, err);
				}
				res.json(data);
			});
    });

    app.get('/api/get-attachment', (req, res) => {
      var params  = req.body || {};
      params = Object.assign(params, req.query);
      store.getAttachment(params, (err, stream) => {
        stream.pipe(res);
      });
    });
    

		app.get('/api/remove-incident', (req, res) => {
			var ids = req.query.ids;
			store.removeIncident({
				ids: ids
			}, (err, data) => {
				if (err)
				{
					res.sendStatus(400, err);
				}
				res.json(data);
			});
		});

    app.get('/api/get-store-info', (req, res) => {
			store.getNumIncidents({
				unreaded: true
			}, (err, data) => {
				if (err)
				{
					res.sendStatus(400, err);
				}
				res.json(data);
			});
		});
		app.get('/api/get_num_unreaded_incidents.json', (req, res) => {
			store.getNumIncidents({
				unreaded: true
			}, (err, data) => {
				if (err)
				{
					res.sendStatus(400, err);
				}
				res.json(data);
			});
		});
	});


/*

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
	});*/
	
}
