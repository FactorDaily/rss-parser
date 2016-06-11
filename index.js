const jsdom = require('jsdom');
const mongo = require('mongodb').MongoClient;
let config = require('./config');

const parseCallback = (options = {}, callback) => {
	config = Object.assign(config, options);
	if (! config.input.length) return callback(new Error('No input specified!'));
	if (Buffer.isBuffer(config.input)) config.input = config.input.toString('utf8');
	let filters = config.filters.split(' ');

	mongo.connect(config.mongoUrl, (me, db) => {
		if (me) return callback(new Error(me));

		let output = db.collection(config.mongoCollection)
		let input = config.input;
		while (input.includes('CDATA')) input = input.replace('<![CDATA[', '').replace(']]>', '');

		jsdom.env(input, (e, w) => {
			filters.forEach((x, i, ar) => {
				let matching = w.document.querySelectorAll(x);
				for (let k = 0; k < matching.length; k++) {
					let chunk = undefined;
					if (config.idGenerator) {
						let contentId = config.idGenerator(x);
						chunk = { [contentId]: matching.item(k).innerHTML };
					} else chunk = { [k]: matching.item(k).innerHTML };
					output.insertOne(chunk, (ie, insertResult) => {
						if (ie) config.loggerError(new Error(ie));
						config.loggerSuccess(insertResult);
					});
				};
			});
		});
	});
};

const parse = (options = {}) => {
	return new Promise((go, stop) => {
		config = Object.assign(config, options);
		if (! config.input.length) return stop(new Error('No input specified!'));
		if (Buffer.isBuffer(config.input)) config.input = config.input.toString('utf8');
		let filters = config.filters.split(' ');

		mongo.connect(config.mongoUrl, (me, db) => {
			if (me) return stop(new Error(me));

			let output = db.collection(config.mongoCollection)
			let input = config.input;
			while (input.includes('CDATA')) input = input.replace('<![CDATA[', '').replace(']]>', '');

			jsdom.env(input, (e, w) => {
				filters.forEach((x, i, ar) => {
					let matching = w.document.querySelectorAll(x);
					for (let k = 0; k < matching.length; k++) {
						let chunk = undefined;
						if (config.idGenerator) {
							let contentId = config.idGenerator(x);
							chunk = { [contentId]: matching.item(k).innerHTML };
						} else chunk = { [k]: matching.item(k).innerHTML };
						output.insertOne(chunk, (ie, insertResult) => {
							if (ie) config.loggerError(new Error(ie));
							config.loggerSuccess(insertResult);
						});
					};
				});
			});
		});
	});
};

module.exports = {
	parseCallback,
	parse,
};