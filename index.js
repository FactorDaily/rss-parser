const xml2js = require('xml2js');
const mongo = require('mongodb').MongoClient;
let config = require('./config');

const parseCallback = (options, callback) => {
	config = Object.assign(config, options);
	if (! config.input.length) return callback(new Error('No input specified!'));
	if (Buffer.isBuffer(config.input)) config.input = config.input.toString('utf8');

	mongo.connect(config.mongo.url, (me, db) => {
		if (me) return callback(new Error(me));

		let output = db.collection(config.mongo.collection)
		xml2js.parseString(config.input, (e, result) => {
			let index = 0;
			for (let i in result) {
				for (let tag in result[i]) {
					if (config.filters.includes(tag)) {
						let chunk = undefined;
						if (config.idGenerator) {
							let contentId = config.idGenerator(tag);
							chunk = { [contentId]: result[i][tag] };
						} else {
							chunk = { [index]: result[i][tag] };
							index += 1;
						};
						output.insertOne(chunk, (ie, insertResult) => {
							if (e) config.logger.error(new Error(e));
							config.logger.success(insertResult);
						});
					};
				};

				if ('description' in result[i]) {
					xml2js.parseString(result[i].description, (e2, description) => {
						for (let tag in description) {
							if (config.filters.includes(tag)) {
								let chunk = undefined;
								if (config.idGenerator) {
									let contentId = config.idGenerator(tag);
									chunk = { [contentId]: description[tag] };
								} else {
									chunk = { [index]: description[tag] };
									index += 1;
								};
								output.insertOne(chunk, (ie, insertResult) => {
									if (e) config.logger.error(new Error(e));
									config.logger.success(insertResult);
								});
							};
						};
					});
				};
			};
		});
	});
};

const parse = (options) => {
	return new Promise((go, stop) => {
		config = Object.assign(config, options);
		if (! config.input.length) return stop(new Error('No input specified!'));
		if (Buffer.isBuffer(config.input)) config.input = config.input.toString('utf8');

		mongo.connect(config.mongo.url, (me, db) => {
			if (me) return stop(new Error(me));

			let output = db.collection(config.mongo.collection)
			xml2js.parseString(config.input, (e, result) => {
				let index = 0;
				for (let i in result) {
					for (let tag in result[i]) {
						if (config.filters.includes(tag)) {
							let chunk = undefined;
							if (config.idGenerator) {
								let contentId = config.idGenerator(tag);
								chunk = { [contentId]: result[i][tag] };
							} else {
								chunk = { [index]: result[i][tag] };
								index += 1;
							};
							output.insertOne(chunk, (ie, insertResult) => {
								if (e) config.logger.error(new Error(e));
								config.logger.success(insertResult);
							});
						};
					};

					if ('description' in result[i]) {
						xml2js.parseString(result[i].description, (e2, description) => {
							for (let tag in description) {
								if (config.filters.includes(tag)) {
									let chunk = undefined;
									if (config.idGenerator) {
										let contentId = config.idGenerator(tag);
										chunk = { [contentId]: description[tag] };
									} else {
										chunk = { [index]: description[tag] };
										index += 1;
									};
									output.insertOne(chunk, (ie, insertResult) => {
										if (e) config.logger.error(new Error(e));
										config.logger.success(insertResult);
									});
								};
							};
						});
					};
				};
			});
		});
	});
};

module.exports = {
	parseCallback,
	parse,
};