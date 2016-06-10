let c = {

	//	MongoDB connetion preferences
	mongo: {
		//	Full MongoDB connection URL (you can specify user and password here)
		url: 'mongodb://localhost:27027/rss-parser',

		//	Collection name
		collection: 'contents',
	},

	//	String to parse or buffer to convert to string to parse
	input: '',

	//	Tag list splitted by space values of which must be saved
	filters: 'p',

	//	Generator function for cases you need your own key generation
	idGenerator: undefined,

	//	Logger functions
	logger: {
		//	This will be called on each db inserting error
		error: (e) => { console.log(e); },

		//	This will be called on each successfull insertion
		success: (data) => { console.log(data); },
	},
};

module.exports = c;