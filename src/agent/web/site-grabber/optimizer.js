
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
]
class Optimizer {
  needBlock (inUrl) {
    /* if (inUrl.indexOf('.css') !== -1)
      return true; */
    if (inUrl.indexOf('.map') !== -1) { return true }
    for (let host of advHosts) {
      if (inUrl.indexOf(host) !== -1) { return true }
    }
    return false
  }
};

module.exports = Optimizer
