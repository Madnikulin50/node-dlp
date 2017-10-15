

module.exports = function(inOptions, in_Cb)
{
	var type = inOptions.type;
	var cls = require('./' + type);
	if (!cls)
		in_Cb('Undefined condition type ' + type, null);
	return new cls(inOptions, in_Cb);
}