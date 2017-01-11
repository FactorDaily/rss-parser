let c = {

	//	Full MongoDB connection URL (you can specify user and password here)
	mongoUrl: 'mongodb://localhost:2900/ians',

	//	Collection name
	mongoCollection: 'contents',

	//	String to parse or buffer to convert to string to parse
	input: './feed.xml',

	//	Tag list splitted by space values of which must be saved
	filters: 'item',

	//	Generator function for cases you need your own key generation
	idGenerator: undefined,

	//	This will be called on each db inserting error
	loggerError: console.log,

	//	This will be called on each successfull insertion
	loggerSuccess: console.log,
};

module.exports = c;