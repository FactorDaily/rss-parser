const fs = require('fs');
const uuid = require('node-uuid');
const rssParser = require('./index.js');

var ELASTICSEARCH 	= require('elasticsearch');
var CONSTANT 		= require('./constant.json');
var HTTP            = require('http');


/**
 * ESCLIENT is ES CLient object
 */
var ESCLIENT = new ELASTICSEARCH.Client( {  
	hosts: [
		CONSTANT.elasticSearch.url
	]
});


function writeXML(rssData){
	
		fs.writeFile('./feed.xml', rssData, function (err) {
	  if (err) return console.log(err);
	  else
	  {
		  
		  console.log("now reading feeds");
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
	  }
	  
	});
		
}



function getRSS(callback) {

  /**
	  hardocoded because it comes from IANS
	  
  */
    return HTTP.get({
        host: '142.4.2.225',
        path: '/feedfiles1/ianseng.rss'
    }, function(response) {
        // Continuously update stream with data
        var body = '';
        response.on('data', function(d) {
            body += d;
        });
        response.on('end', function() {

            // Data reception is done, do whatever with it!
            //var parsed = JSON.parse(body);
            
            callback(body);
        });
    });

}


  
getRSS(writeXML);





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
            if(error)
            {
	            console.log("unable to insert ", error);
            }
            console.log(response);
        });
}