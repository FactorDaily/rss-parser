let c = {

	//	Full MongoDB connection URL (you can specify user and password here)
	mongoUrl: 'mongodb://localhost:27027/rss-parser',

	//	Collection name
	mongoCollection: 'contents',

	//	String to parse or buffer to convert to string to parse
	input: '',

	//	Tag list splitted by space values of which must be saved
	filters: 'p',

	//	Generator function for cases you need your own key generation
	idGenerator: undefined,

	//	This will be called on each db inserting error
	loggerError: console.log,

	//	This will be called on each successfull insertion
	loggerSuccess: console.log,
};

module.exports = c;