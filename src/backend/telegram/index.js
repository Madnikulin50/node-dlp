const TelegramBot = require('node-telegram-bot-api');
var storeLoader = require('../../store');
class Telegram
{
	constructor(in_Options)
	{
		this.options = in_Options;
		let backend_opts = this.options.backend;
		this.token = backend_opts['telegram-key'];

		this.bot = new TelegramBot(this.token, {polling: true});
		
		let storeAllOptions = in_Options.store;
		var storeOptions = storeAllOptions[storeAllOptions.active];
		storeLoader(storeOptions, (err, store) => {
			this.store = store;
			// Matches "/echo [whatever]" 
			this.bot.onText(/\/echo (.+)/, this.onEcho.bind(this));
			this.bot.onText(/\/list (.+)/, this.onList.bind(this));
			this.bot.onText(/\/search (.+)/, this.onSearch.bind(this));
			this.bot.onText(/\/view (.+)/, this.onView.bind(this));
			// Listen for any kind of message. There are different kinds of 
			// messages. 
			//this.bot.on('message', this.onMessage.bind(this));
		});
	}

	onEcho(msg, match)
	{
		// 'msg' is the received Message from Telegram 
		// 'match' is the result of executing the regexp above on the text content 
		// of the message 
		
		const chatId = msg.chat.id;
		const resp = match[1]; // the captured "whatever" 
		
		// send back the matched "whatever" to the chat 
		this.bot.sendMessage(chatId, resp);
	}

	buildDate(in_Item)
	{
		let date = new Date(in_Item.date);
    	return date.toLocaleDateString('ru-RU');
	}

	buildFrom(in_Item)
	{
		if (in_Item.from !== undefined &&
			in_Item.from.length > 0)
			return in_Item.from;
		if (in_Item.user !== undefined &&
			in_Item.user.length > 0)
			return in_Item.user;
		if (in_Item.src_ip !== undefined &&
			in_Item.src_ip.length > 0)
			return in_Item.src_ip;
		return 'Unknown';
	}

	buildTo(in_Item)
	{
		if (in_Item.to !== undefined &&
			in_Item.to.length > 0)
			return in_Item.to;
		if (in_Item.service !== undefined &&
			in_Item.service.length > 0)
			return in_Item.service;
		if (in_Item.dst_host !== undefined &&
			in_Item.dst_host.length > 0)
			return in_Item.dst_host;
		return 'Unknown';
	}

	buildList(in_Items)
	{
		let result = "";
		in_Items.forEach((item) => {
			result += item.id + '.-(' + this.buildDate(item) +') ' + this.buildFrom(item) +
				'->' + this.buildTo(item) + (item.subject === undefined ? '' : ('-' + item.subject)) + '\r\n';
		});
		return result;
	}

	onList(msg, match)
	{
		// 'msg' is the received Message from Telegram 
		// 'match' is the result of executing the regexp above on the text content 
		// of the message 
		
		const chatId = msg.chat.id;
		const resp = match[1]; // the captured "whatever" 
		this.store.getIncidents({
			start: 0,
			count: 10,
		}, (err, data) => {
			if (err)
			{
				this.bot.sendMessage(chatId, err);
				return;
			}
		

			this.bot.sendMessage(chatId, this.buildList(data.items));
		});
	}

	onSearch(msg, match)
	{
	}

	onView(msg, match)
	{
		// 'msg' is the received Message from Telegram 
		// 'match' is the result of executing the regexp above on the text content 
		// of the message 
		
		const chatId = msg.chat.id;
		this.store.getIncident({
				id: match[1]
		}, (err, item) => {
			if (err)
				return this.bot.sendMessage(chatId, err);
			let result = this.buildDate(item) + '-' + this.buildFrom(item) + '->' + this.buildTo(item) + '\r\n'
			this.bot.sendMessage(chatId, result);
		});
		// send back the matched "whatever" to the chat 
		
	}

	onMessage(msg)
	{
		const chatId = msg.chat.id;
	
		// send a message to the chat acknowledging receipt of their message 
		this.bot.sendMessage(chatId, 'Received your message ' + msg);
	}	
}

module.exports = Telegram;