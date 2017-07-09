
const advHosts = [
	'kraken.rambler.ru',
	'www.google-analytics.com',
	'ssp.rambler.ru',
	'www.tns-counter.ru',
	'ads.adfox.ru',
	'mc.webvisor.org',
	'autocontext.begun.ru',
	'subscriptions.rambler.ru',
	'.cloudfront.net/metrika',
	'counter.yadro.ru',
	'dsp-rambler.ru',
	'mediametrics.ru'
];
class Optimizer
{
	constructor()
	{

	}

	needBlock(in_Url)
	{
		/*if (in_Url.indexOf('.css') !== -1)
			return true;*/
		if (in_Url.indexOf('.map') !== -1)
			return true;
		for (let host of advHosts)
			if (in_Url.indexOf(host) !== -1)
				return true;
		return false;
	}
};

module.exports = Optimizer;