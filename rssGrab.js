const fs = require('fs');
const uuid = require('node-uuid');
const rssParser = require('./index.js');

var ELASTICSEARCH 	= require('elasticsearch');
var CONSTANT 		= require('./constant.json');


/**
 * ESCLIENT is ES CLient object
 */
var ESCLIENT = new ELASTICSEARCH.Client( {  
	hosts: [
		CONSTANT.elasticSearch.url
	]
});



rssParser.parse({
    input: fs.readFileSync('./feed.xml', 'utf8'),
    idGenerator: (tag) => {
        return uuid.v4();
    },
    loggerError: (e) => {
        console.log('DATA INSERTING ERROR!');
        console.log(e.name);
        console.log(e.stack);
    },
     loggerSuccess: (id, data) => {
        console.log('DATA INSERTING Sucess!');
        

        var content = data[id];
        var id = String(data._id);

        console.log("****",id);
        create(content, id);
        
    }
}).catch((e) => {
    //  ... process runtime error someway
    console.log(e);
});

/**
 * Create Indexing in ES
 */
function create(content, id) {

        ESCLIENT.create({
            index: CONSTANT.elasticSearch.index,
            type: CONSTANT.elasticSearch.type,
            id: id,
            body: {
                content: content
            }
        }, function (error, response) {
            console.log(error);
            console.log(response);
        });
}