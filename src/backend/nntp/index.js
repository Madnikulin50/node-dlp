'use strict';
const async = require('async');
var storeLoader = require('../../store');
const nntpServer = require('nntp-server');
const {promisify} = require('util');
const from2 = require('from2');
const debug = require('debug');
debug.log = console.info.bind(console);
class NNTP
{
	constructor(inOptions)
	{
		this.options = inOptions;
		let backendOpts = this.options.backend;
		let storeAllOptions = inOptions.store;
		let storeOptions = storeAllOptions[storeAllOptions.active];

		let store = storeLoader(storeOptions,
		(err, store) => {
			if (err)
				throw err;
			this.store = store;
			this.nntp = new nntpServer({ secure: false });
			this.initServer();
			this.nntp.listen('nntp://localhost:8119');
		});
	}

	initServer() {
		let nntp = this.nntp;
		
		let def_groups = [
			{
				name:"incidents.all",
				filter:{},
				description:"All incidents",
				create_ts: "2017-07-15 3:14:24.05",
			},
			{
				name:"incidents.unreaded",
				filter:{unreaded:true},
				description:"Not readed",
				create_ts: "2017-06-15 3:14:24.05",
			}
		];

		nntp._getGroups = async (session, ts, wildmat) => {

			let selg = def_groups.filter(group => wildmat === undefined ? true : group.description.indexOf(wildmat) !== -1);
			await Promise.all(selg.map(async (group) => {
					const getNumIncidentsAsync  = promisify(this.store.getNumIncidents.bind(this.store));
					let result  = await getNumIncidentsAsync(group.filter);
					group.min_index = 0;
					group.max_index = result.count;
					group.total = result.count;
				}));
			return Promise.resolve(selg);
		};

		nntp._selectGroup = async (session, group_id) => {
			
			let grp = def_groups.filter(g => g.name === group_id)[0];
			if (grp === undefined)
				return Promise.reject("Group not found");
			const getNumIncidentsAsync  = promisify(this.store.getNumIncidents.bind(this.store));
			let numResult  = await getNumIncidentsAsync(grp.filter);
			const getIncidentsAsync  = promisify(this.store.getIncidents.bind(this.store));
			let result  = await getIncidentsAsync({conditions: grp.filter,
				count: numResult.count});
			if (session.group !== undefined)
				session.group = Object.assign({}, grp);
			session.group.min_index = 1;
			session.group.max_index = result.items.length;
			session.group.total = result.items.length;
			session.group.current_article = session.group.total > 0 ? session.group.min_index : 0;
			session.group.items = result.items.map((e, index) => {
				e.index = index + 1;
				e.head = "";
				if (e.from === undefined ||
					e.from === null) {
					if (e.user !== undefined && 
						e.user !== null)
						e.from = e.user;
					else if (e.src_ip !== undefined&& 
						e.src_ip !== null)
						e.from = e.src_ip;
				}
				return e;
			});
			//console.log('selectGroup ' + JSON.stringify(session.group));
			return Promise.resolve(true);
		};


		nntp._getArticle = async (session, message_id) => {
			let match, msg;

			match = message_id.match(/^<([^<>]+)>$/);

			if (match) {
				let id = match[1];
				msg =  session.group.items
					.filter((m) => m.id === id);

			}
			else {
				match = message_id.match(/^(\d+)$/);

				if (match) {
					let index = Number(match[1]);

					msg = session.group.items
					.filter((m) => m.index === index);
				}
			}

			if (msg === undefined
				|| msg.length == 0)
				return Promise.reject('Message not found');
			msg = msg[0];
			const getIncidentAsync  = promisify(this.store.getIncident.bind(this.store));
			let result  = await getIncidentAsync({id:msg._id});
					
			if (msg) {
				msg.head = msg.head.trimRight();
				msg.body = result.body.trimRight();
			}

			return Promise.resolve(msg || null);
		};

		nntp._getRange = function (session, first, last) {
			let result = session.group.items
			.filter((m, index) => index >= first - 1  && index < last);

			return Promise.resolve(result);
		};

		nntp._getNewNews = function (session, ts, wildmat) {
			let result = messages
			.filter(msg => !ts || msg.ts > ts)
			.filter(msg => (wildmat ? wildmat.test(msg.group) : true));

			return from2.obj(result);
		};

		nntp._buildHead =  (session, msg) =>
		{
			let head = msg.head;
			if (head === undefined)
				head = "";
			let ignored = ['body', 'id', '_folder'];
			for (let i in msg)
			{
				if (ignored.findIndex(item => i === item) !== -1)
					continue;
				
				switch (i)
				{
				case '_id':
					head += `id:<${msg[i]}>\r\n`;
					break;
				default:
					let key = i;
					head += `${key}:${msg[i]}\r\n`;
				}
				
			}
			return head;
		};

		nntp._buildBody = (session, msg) => {
			return msg.body; 
		};

		nntp._buildHeaderField = function (session, msg, field) {
			if (msg[field] !== undefined)
				return msg[field];
			switch (field) {
			case 'from':
				{
					if (msg.from)
						return msg.from;
					if (msg.user !== undefined)
						return msg.user;
					if (msg.src_ip !== undefined)
						return msg.src_ip;

					return 'localhost';
				}
			case ':lines':
				return '2';//msg.body.split('\n').length.toString();

			case ':bytes':
				return "";//Buffer.byteLength(msg.body).toString();

			case 'message-id':
				return '<' + msg._id + '>';

			default:

				let match = msg.head
				.split('\n')
				.map(str => str.match(/^(.*?):\s*(.*)$/))
				.filter(m => m && m[1].toLowerCase() === field);

				return match.length ? match[0][2] : null;
			}
		};

		nntp._authenticate = function (session) {
			return Promise.resolve(true);/*Promise.resolve(
			session.authinfo_user === 'foo' &&
			session.authinfo_pass === 'bar'
			);*/
		};

		nntp._onError = function (err) {
			// make tests fail; we can't just throw error because node.js
			// does not yet abort on unhandled exceptions
			/* eslint-disable no-console */
			console.log(err);
			//process.exit(1);
		};

  		return nntp;
	}
};

module.exports = NNTP;