var EmailSheduledAgent = require('../sheduled.js');


class POP3_Agent extends EmailSheduledAgent
{
    constructor(inOptions)
    {
        super(inOptions);
        Object.assign(this, inOptions);
    }
	get name() {
		return 'pop3';
	}

    do()
    {
        console.log("Starting POP3 task\nserver - " + this.server + ":" + this.port +  (this.tls ? 'tls' : 'plain') + "\nuser - " + this.user);
        
    }
};

module.exports = POP3_Agent;