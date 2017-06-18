var Base_Packet = require('./base.js');
var url = require('url');
var uaParser = require('ua-parser');

class Data_Packet extends Base_Packet
{
	constructor(in_Object)
	{
		super(in_Object);
		this._data = in_Object;
		this.isFull = true;
	}

	get method() {
		return this._data.incomingMessage.method;
	}
	get host() {
		return this._data.incomingMessage.headers.host;
	}

	get pathName() {
		if (this._pathName == undefined)
		{
			this.prepareUrl();
		}
		return this._pathName;
	}

	get url() {
		return this._data.incomingMessage.url;
	}

	get query()
	{
		if (this._query == undefined)
		{
			this.prepareUrl();
		}
		return this._query;
	}
	prepareUrl()
	{
		var url_parts = url.parse(this.url, true);
		this._query = url_parts.query;
		this._pathName = url_parts.pathname;
	}

	get isLikeGet()
	{
		return this.method === 'GET';
	}

	get isLikePost()
	{
		return this.method == 'POST' ||
			this.method === 'PUT';
	}

	get userAgent()
	{
		return uaParser.parse(this._data.incomingMessage.headers['user-agent']);
	}

};

 module.exports = Data_Packet;
