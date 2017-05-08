var Agent = require('../index.js');
var Case = require('../../case'); 

class Email_Agent extends Agent
{
    constructor(in_Options)
    {

    }
	makeCaseFromEml(in_File)
	{
		let case = new Case();
		case.setFolder();
	}

};

module.exports = Email_Agent;