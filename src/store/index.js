

module.exports = function(in_Params, in_CB)
{
	var cls = require('./' + in_Params.type);
	var store = new cls(in_Params);
	return store.start({}, in_CB);
}