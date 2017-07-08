const sgr = require('../../../../agent/web/site-grabber');
var expect    = require("chai").expect;
const fs = require('fs');
const path = require('path');
const async = require('async');

describe("Договора", function() {

	let grabber = new sgr();
	let urls = require(path.join(__dirname, 'urls.json'));

	urls.forEach(url => {
		it("Извлекаем текст по ссылке" + url.url, function() {

			var testPromise = new Promise(function(resolve, reject) {
				grabber.execute(params, (err) => {
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
		});
	});
});