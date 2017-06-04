var Files_Packet = require('./files_packet.js');
var Data_Packet = require('./data_packet.js');

class Packet_Factory
{
	static makeFromProxy(in_Message)
	{
		var packet = new Data_Packet({
			incomingMessage: in_Message.incomingMessage,
		});
		
		return packet;		
	}
	
};

module.exports = Packet_Factory;