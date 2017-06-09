

module.exports = function(in_Options, in_Cb)
{
	var type = in_Options.type;
	var cls = require('./' + type);
	if (!cls)
		in_Cb('Undefined condition type ' + type, null);
	return new cls(in_Options, in_Cb);
}