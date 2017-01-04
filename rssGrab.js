const fs = require('fs');
const uuid = require('node-uuid');
const rssParser = require('./index.js');

var ELASTICSEARCH 	= require('elasticsearch');
var CONSTANT 		= require('./constant.json');
var HTTP            = require('http');

var NODEMAILER      = require('nodemailer');


/**
 * ESCLIENT is ES CLient object
 */
var ESCLIENT = new ELASTICSEARCH.Client( {  
	hosts: [
		CONSTANT.elasticSearch.url
	]
});


// Create reusable transporter object using SMTP transport
var transporter = NODEMAILER.createTransport({
    service : 'gmail',
    auth: {
        user: CONSTANT.mail.email_id,
        pass: CONSTANT.mail.password
    },
    ignoreTLS : true
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
			        var content = data;
			        var id = String(data._id);

			        delete content["_id"];
			        content.id = id;

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
        path: '/feedfiles1/tech.rss'
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
            body: content
        }, function (error, response) {
            if(error)
            {
	            console.log("unable to insert ", error);
            }
            else
            {
	            console.log('EXCELLENT');
                // transporter.sendMail({
                //     from: 'anahita.neogi@gmail.com', // sender address
                //     to: 'tn@factordaily.com', // list of receivers
                //     subject: 'IANS indexing done', // Subject line
                //     html: 'Latest news synced', // html body
                //     //attachments: [{filename: 'scratch.zip', path: './UserListInMemory.zip'}]
                // }, function (error, info) {
                //     if (error) {
                //         console.log('========Message sent==error=====', error);
                //       //  return reject(error);
                //     }
                //     console.log('========Message sent==info=====', info);
                //     if(!error){
                //         var response = {
                //             message: 'Email has been sent, please follow the instruction as per mail.',
                //             response: 'success'
                //         };
                //     }
                // });
            }
            
        });
}
