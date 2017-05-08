var Email_Sheduled_Agent = require('../sheduled.js');


class POP3_Agent extends Email_Sheduled_Agent
{
    constructor(in_Options)
    {
        super(in_Options);
        Object.assign(this, in_Options);
    }

    do()
    {
        console.log("Starting POP3 task\nserver - " + this.server + ":" + this.port +  (this.tls ? 'tls' : 'plain') + "\nuser - " + this.user);
        
    }
};

module.exports = POP3_Agent;