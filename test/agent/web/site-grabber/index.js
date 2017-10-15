const sgr = require(__dirname + '/../../../../src/agent/web/site-grabber')
var expect = require('chai').expect
const fs = require('fs')
const path = require('path')
const async = require('async')

describe('Testing site-grabber', function () {
  let grabber = new sgr()
  let cases = require(path.join(__dirname, 'urls.json'))
  // cases = [cases[0]];
  cases.forEach(cs => {
    it('Извлекаем текст по ссылке ' + cs.url, function () {
      var testPromise = new Promise(function (resolve, reject) {
        grabber.execute(cs, (err, data) => {
          if (err) { return reject(err)}
          resolve(data)
        })
      })
      return testPromise.then((result) => {
        expect(result).to.not.equals(null)
        if (result !== undefined) {
          expect(result).to.have.property('title')
          expect(result).to.have.property('plainText')
        }
      }, (err) => {
        expect(err).to.equal(null, 'Вернуло ошибку: ' + err)
      })
    }).timeout(60000)
  })
})
