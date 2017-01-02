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
					let contentId = undefined;
					var strdata = matching.item(k).innerHTML;
					var title= strdata.substring(strdata.lastIndexOf("<title>")+7,strdata.lastIndexOf("</title>"));
					var link = strdata.substring(strdata.lastIndexOf("<link>")+6,strdata.lastIndexOf("<pubdate>"));
					var publishDate = strdata.substring(strdata.lastIndexOf("<pubdate>")+9,strdata.lastIndexOf("</pubdate>"));
					var description = strdata.substring(strdata.lastIndexOf("<description>")+13,strdata.lastIndexOf("</description>"));
					var content = strdata.substring(strdata.lastIndexOf("<content>")+9,strdata.lastIndexOf("</content>"));						
						chunk = { 
							"title" : title,
							"link" :link,
							"publishDate" : publishDate,
							"description" :description,
							"content" :content,
						};
					
					output.findOne({link: link},function(err, result) {
						if (result === null){
							output.insertOne(chunk, (ie, insertResult) => {
								if (ie) config.loggerError(new Error(ie));
								config.loggerSuccess(link, chunk);
							});
						} else {
							console.log("data already exist")
						}
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
						let contentId = undefined;
						var strdata = matching.item(k).innerHTML;
						var title= strdata.substring(strdata.lastIndexOf("<title>")+7,strdata.lastIndexOf("</title>"));
						var link = strdata.substring(strdata.lastIndexOf("<link>")+6,strdata.lastIndexOf("<pubdate>"));
						var publishDate = strdata.substring(strdata.lastIndexOf("<pubdate>")+9,strdata.lastIndexOf("</pubdate>"));
						var description = strdata.substring(strdata.lastIndexOf("<description>")+13,strdata.lastIndexOf("</description>"));
						var content = strdata.substring(strdata.lastIndexOf("<content>")+9,strdata.lastIndexOf("</content>"));						
							chunk = { 
								"title" : title,
								"link" :link,
								"publishDate" : publishDate,
								"description" :description,
								"content" :content,
							};
						
						output.findOne({link: link},function(err, result) {
							if (result === null){
								output.insertOne(chunk, (ie, insertResult) => {
									if (ie) config.loggerError(new Error(ie));
									config.loggerSuccess(link, chunk);
								});
							} else {
								console.log("data already exist")
							}
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