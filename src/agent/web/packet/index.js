var FilesPacket = require('./files_packet.js')
var DataPacket = require('./data_packet.js')

class PacketFactory {
  static makeFromProxy (inMessage) {
    var packet = new DataPacket({
      incomingMessage: inMessage.incomingMessage
    })

    return packet
  }

  static makeFromFiles (inParams) {
    var packet = new FilesPacket({
      incomingMessage: inParams.incomingMessage
    })

    return packet
  }
};

module.exports = PacketFactory
