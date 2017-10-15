var Email_Agent = require('./index.js');
var schedule = require('node-schedule');


class EmailSheduledAgent extends Email_Agent
{
    constructor(inOptions)
    {
        super(inOptions);
        this.shedule = inOptions.shedule;
    }

    start(inParams, onDone)
    {
		if (this.enabled)
        	this._job = schedule.scheduleJob(this.shedule, this.do.bind(this));
		super.start();
    }

    stop(inParams, onDone)
    {
        this._job.cancel();
        this._job = undefined;
    }

    do()
    {
        console.log("Do nothing");

    }
};

module.exports = EmailSheduledAgent;