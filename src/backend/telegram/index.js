const TelegramBot = require('node-telegram-bot-api')
var storeLoader = require('../../store')
class Telegram {
  constructor (inOptions) {
    this.options = inOptions
    let backendOpts = this.options.backend
    this.token = backendOpts['telegram-key']

    this.bot = new TelegramBot(this.token, {polling: true})

    let storeAllOptions = inOptions.store
    var storeOptions = storeAllOptions[storeAllOptions.active]
    storeLoader(storeOptions, (err, store) => {
      if (err) { throw err }
      this.store = store
      // Matches "/echo [whatever]" 
      this.bot.onText(/\/echo (.+)/, this.onEcho.bind(this))
      this.bot.onText(/\/list (.+)/, this.onList.bind(this))
      this.bot.onText(/\/search (.+)/, this.onSearch.bind(this))
      this.bot.onText(/\/view (.+)/, this.onView.bind(this))
      // Listen for any kind of message. There are different kinds of 
      // messages. 
      // this.bot.on('message', this.onMessage.bind(this));
    })
  }

  onEcho (msg, match) {
    // 'msg' is the received Message from Telegram 
    // 'match' is the result of executing the regexp above on the text content 
    // of the message 

    const chatId = msg.chat.id
    const resp = match[1] // the captured "whatever" 

    // send back the matched "whatever" to the chat 
    this.bot.sendMessage(chatId, resp)
  }

  buildDate (inItem) {
    let date = new Date(inItem.date)
    return date.toLocaleDateString('ru-RU')
  }

  buildFrom (inItem) {
    if (inItem.from !== undefined &&
   inItem.from.length > 0) { return inItem.from }
    if (inItem.user !== undefined &&
   inItem.user.length > 0) { return inItem.user }
    if (inItem.src_ip !== undefined &&
   inItem.src_ip.length > 0) { return inItem.src_ip }
    return 'Unknown'
  }

  buildTo (inItem) {
    if (inItem.to !== undefined &&
   inItem.to.length > 0) { return inItem.to }
    if (inItem.service !== undefined &&
   inItem.service.length > 0) { return inItem.service }
    if (inItem.dst_host !== undefined &&
   inItem.dst_host.length > 0) { return inItem.dst_host }
    return 'Unknown'
  }

  buildList (inItems) {
    let result = ''
    inItems.forEach((item) => {
      result += item.id + '.-(' + this.buildDate(item) + ') ' + this.buildFrom(item) +
    '->' + this.buildTo(item) + (item.subject === undefined ? '' : ('-' + item.subject)) + '\r\n'
    })
    return result
  }

  onList (msg, match) {
    // 'msg' is the received Message from Telegram 
    // 'match' is the result of executing the regexp above on the text content 
    // of the message 

    const chatId = msg.chat.id
    this.store.getIncidents({
      start: 0,
      count: 10
    }, (err, data) => {
      if (err) {
        this.bot.sendMessage(chatId, err)
        return
      }

      this.bot.sendMessage(chatId, this.buildList(data.items))
    })
  }

  onSearch (msg, match) {
  }

  onView (msg, match) {
    // 'msg' is the received Message from Telegram 
    // 'match' is the result of executing the regexp above on the text content 
    // of the message 

    const chatId = msg.chat.id
    this.store.getIncident({
      id: match[1]
    }, (err, item) => {
      if (err) { return this.bot.sendMessage(chatId, err) }
      let result = this.buildDate(item) + '-' + this.buildFrom(item) + '->' + this.buildTo(item) + '\r\n'
      this.bot.sendMessage(chatId, result)
    })
    // send back the matched "whatever" to the chat 
  }

  onMessage (msg) {
    const chatId = msg.chat.id

    // send a message to the chat acknowledging receipt of their message 
    this.bot.sendMessage(chatId, 'Received your message ' + msg)
  }
}

module.exports = Telegram
