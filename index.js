const jsdom = require('jsdom');
const mongo = require('mongodb').MongoClient;
let config = require('./config');
var htmlToText = require('html-to-text');

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

																	// content is returning string with HTML tags like <p><hr><br>
					var text = htmlToText.fromString(content, {  	// removes html tags and convert it to text but didn't able to remove all the tags
					    wordwrap: 130
					});	
					var text2 = htmlToText.fromString(text, {		// this convert all ther remaining html to text
					    wordwrap: 130
					});
					console.log("================text===============",text2);		
						chunk = { 
							"title" : title,
							"link" :link,
							"publishDate" : publishDate,
							"description" :description,
							"content" :text2,
						};											
					contentId = config.idGenerator(x);	

					output.findOne({link: link},function(err, result) {  // check link in mongodb for duplicate insersion
						if (result === null){
							output.insertOne(chunk, (ie, insertResult) => {  // insert eliment in to mongodb 
								if (ie) config.loggerError(new Error(ie));
								config.loggerSuccess(contentId, chunk);  
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

						// detecting title, link, publishDate, description, content from strdata via substring 

						var title= strdata.substring(strdata.lastIndexOf("<title>")+7,strdata.lastIndexOf("</title>"));
						var link = strdata.substring(strdata.lastIndexOf("<link>")+6,strdata.lastIndexOf("<pubdate>"));
						var publishDate = strdata.substring(strdata.lastIndexOf("<pubdate>")+9,strdata.lastIndexOf("</pubdate>"));
						var description = strdata.substring(strdata.lastIndexOf("<description>")+13,strdata.lastIndexOf("</description>"));
						var content = strdata.substring(strdata.lastIndexOf("<content>")+9,strdata.lastIndexOf("</content>"));

																		// content is returning string with HTML tags like <p><hr><br>
						var text = htmlToText.fromString(content, {  	// removes html tags and convert it to text but didn't able to remove all the tags
						    wordwrap: 130
						});	
						var text2 = htmlToText.fromString(text, {		// this convert all ther remaining html to text
						    wordwrap: 130
						});
						
						chunk = { 
							"title" : title,
							"link" :link,
							"publishDate" : publishDate,
							"description" :description,
							"content" :text2,
						};											
						contentId = config.idGenerator(x);	

						output.findOne({link: link},function(err, result) {  // check link in mongodb for duplicate insersion
							if (result === null){
								output.insertOne(chunk, (ie, insertResult) => {  // insert eliment in to mongodb 
									if (ie) config.loggerError(new Error(ie));
									config.loggerSuccess(contentId, chunk);  
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