
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , users = require('./routes/users')
  , http = require('http')
  , path = require('path')
  , https = require('https')
  , request = require('request')
  , _ = require('underscore')
  , mongojs = require('mongojs')
  , db = mongojs('mydb', ['users', 'projects'])
  , util = require('util')
  , events = require('events')
  ;

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
// app.use(express.basicAuth('testUser', 'testpass'));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

var DataGetter = function(auth) {
  // Constructor function
  // Taks an auth string (a base64-encoded authorisation string)
  // which authorises access for a particular asana user.
  // It returns an object that can get data for that user.

  // The public method is .getData, which takes a relative path, 
  // e.g. /projects or /tasks/2034052. When the data is got, 
  // a 'gotData' event is fired, with the array of objects passed.
  
  events.EventEmitter.call(this)

  var that = this;

  this.getData = function(relative_path) {
    // The public method for this constructor. Takes a relative path
    // like '/projects' used to specify which asana data get.
    // Causes a chain of functions to be fired, ending in
    // a 'gotData' event being emitted, along with the data.
    that.emit("dataRequest", relative_path);
  }

  var getAPIResponse = function (relative_path) {

    var options = {
          hostname: 'app.asana.com',
          path: '/api/1.0' + relative_path,
          method: 'GET',
          // Note that the auth variable is automatically converted into base64
          // If you convert it before assigning it to auth then it'll get 
          // encoded twice and so will not work
          auth: auth
        }
      , req = https.request(options, function(asana_response) {
          that.emit("asanaResponse", asana_response)
        });

    req.on('error', function(err) {
      console.log(err);
    });
    req.end();

  }

  var processResponse = function (asana_response) {

    var data = '';
    asana_response.on('data', function(chunk) {
      data += chunk.toString('utf-8');
    });
    asana_response.on('end', function() {
      // convert JSON string to JSON
      json_data = JSON.parse(data);
      that.emit("dataRecieved", json_data);

    });

  }

  var processData = function(data) {

    if (data["errors"] !== undefined) {
      that.emit("apiError", data["errors"]);
    } else {
      that.emit("gotData", data["data"]);
    }

  }

  this.on("dataRequest", getAPIResponse);
  this.on("asanaResponse", processResponse);
  this.on("dataRecieved", processData);

}

util.inherits(DataGetter, events.EventEmitter);


// REST api
app.get('/', function(req, res){
  var dataGetter = new DataGetter('ccQkiMp.4xFjlmufvUKqnKOBEO4r9yT4:');
  var workspaces_list = null;
  dataGetter.on("gotData", function(data) {
    console.log(JSON.stringify(data));
    res.render('index', {
      workspaces_object: JSON.stringify(data)
    });
  });
  dataGetter.getData('/workspaces');
  //res.sendfile('./public/static/index.html')
});


app.get('/data/*', function(req, res) {
  // Listen for '/data/*' rather than just '/*' because needs client needs to be able
  // to access files like /js/main.js without going through this listener.

  // Weakness: I'm creating a new dataGetter every time someone makes a request. That means
  // if you reaload the page over and over more and more dataGetters are made. Will wait until
  // we have logins (or entering auth on the page) until I change this.
  var dataGetter = new DataGetter('ccQkiMp.4xFjlmufvUKqnKOBEO4r9yT4:')
    // relative_path equals everything after '/data'.
    , relative_path = req.path.substring(5)
    , send_response = _.bind(res.send, res)
    ;

  console.log("relative_path : " + relative_path);
  dataGetter.on("gotData", send_response);
  dataGetter.on("apiError", send_response);

  dataGetter.getData(relative_path);

});


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});


console.log("App in server.js: " + app);
module.exports = app;
module.exports.DataGetter = DataGetter;
// module.exports.getAPIResponse = getAPIResponse;
// module.exports.processResponse = processResponse;




