rss-parser
===================
Basic rss parser which makes you able to store some parts of RSS feed using MongoDB.

----------
#### Install
You will need Node.js >=6.2.1 and some NPM packages to make it work. [Install](https://nodejs.org/en/download/package-manager/) Node.js by using your system package manager or just download the last version [here](https://nodejs.org/en/download/current/). Then you can clone this repository by:
```
git clone https://github.com/perimetral/rss-parser.git
```
or install it as your Node.js application dependency by:
```
npm i --save perimetral/rss-parser
```    
----------
#### Usage
First of all there are configuration file *config.js*. You are free to reconfigure every option in it as you want. It are static options which will be applied once when importing module. You can import module to your application by:
```
const rssParser = require('rss-parser');
```
 There will be object with two member functions:
 
***parse(options) > Promise***

Takes *options* as argument and returns Promise object.

***parseCallback(options, callback) > undefined***

Takes *options* and *callback* as arguments and returns nothing.

In each case *options* is object which has same keys as in *config.js* file. Values will replace ones from *config.js* each call. If you want to keep defaults, just call functions with empty *options* object, like this:
```
const rssParser = require('rss-parser');
rssParser.parse({}).catch((e) => {
    //  ... process runtime error someway
});
```
Notice *callback* in ***parseCallback*** will be called only in case of runtime error and Promise from ***parse*** can only throw if error. There are other additional configurable functions for reporting results. See below for describing and examples.

----------
#### Configuration
There are couple of configuration options. Default ones are already defined at *config.js* file. Feel free to redefine any of it. Also both of member functions which are exported by module takes *options* object as first argument. Use it to redefine options which are in *config.js* per current function call.

*mongoUrl*

String. Required. Represents full URL for MongoDB connection.
Default is: **mongodb://localhost:27027/rss-parser**


*mongoCollection*

String. Required. Represents collection name in which MongoDB will store data.
Default is: **contents**


*input*

String or Buffer. Required. If buffer it will be converted to string. Data to parse (like file contents).
Default is empty, so **you must define it** in *config.js* by yourself or call functions with *input* defined in *options* object.


*filters*

String. Required. List of tags, contents of which must be stored at database, splitted by space. See examples for additional usage.
Default is: **p**


*idGenerator*

Function. Optional. May be defined for keys generating before storing results at database. If defined, takes tag name as first argument. If undefined, key of each stored value will be queue index (**0** for first, **1** for next etc.).
Default is: **undefined**


*loggerError*

Function. Required. It is called each time there is error while trying to insert data to database. Takes error object as first argument. Notice runtime errors will not call this function, there are other mechanism to catch them (see *Usage*).
Default is: **console.log**


*loggerSuccess*

Function. Required. It is called each time there was successfull inserting of data to database. Takes inserted data object as first argument.
Default is: **console.log**


----
#### Examples
Below you can see several examples of using the module.

Basic RSS parsing, considering there is file **rss.xml** with feed data:
```
const fs = require('fs');
const rssParser = require('rss-parser');
rssParser.parse({
    input: fs.readFileSync('./rss.xml', 'utf8'),
}).catch((e) => {
    //  ... process runtime error someway
});
```
Same using callback instead of Promise:
```
const fs = require('fs');
const rssParser = require('rss-parser');
rssParser.parseCallback({
    input: fs.readFileSync('./rss.xml', 'utf8'),
}, (e) => {
    //  ... process runtime error someway
});
```
Parsing **title** and **p** tags using buffer as input:
```
const fs = require('fs');
const rssParser = require('rss-parser');
let data = Buffer.from(fs.readFileSync('./rss.xml', 'utf8'));
rssParser.parse({
    input: data,
    filters: 'title p',
}).catch((e) => {
    //  ... process runtime error someway
});
```
Using custom key generator with custom error logger:
```
const fs = require('fs');
const uuid = require('node-uuid');
const rssParser = require('rss-parser');
rssParser.parse({
    input: fs.readFileSync('./rss.xml', 'utf8'),
    idGenerator: (tag) => {
        return uuid.v4();
    },
    loggerError: (e) => {
        console.log('DATA INSERTING ERROR!');
        console.log(e.name);
        console.log(e.stack);
    },
}).catch((e) => {
    //  ... process runtime error someway
});
```
