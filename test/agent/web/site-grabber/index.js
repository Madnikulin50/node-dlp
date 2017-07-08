const sgr = require(__dirname + '/../../../../src/agent/web/site-grabber');
var expect    = require("chai").expect;
const fs = require('fs');
const path = require('path');
const async = require('async');

describe("Testing site-grabber", function() {

	let grabber = new sgr();
	let cases = require(path.join(__dirname, 'urls.json'));
	//cases = [cases[0]];
	cases.forEach(cs => {
		it("Извлекаем текст по ссылке " + cs.url, function() {

			var testPromise = new Promise(function(resolve, reject) {
				grabber.execute(cs, (err) => {
					if (err)
						return reject(err);
					resolve(err);
				});
			});
			return testPromise.then((result) => {
				expect(result).to.equal(null, 'Должен возвращаться null');
			}, (err) => {
				expect(err).to.equal(null, 'Вернуло ошибку' + err);
			});
		}).timeout(60000);
	});
});