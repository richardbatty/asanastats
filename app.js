
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , https = require('https')
  , request = require('request')
  , _ = require('underscore');

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
app.use(express.basicAuth('testUser', 'testpass'));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

Function.prototype.partial = function(){
    // From John Resig: http://ejohn.org/blog/partial-functions-in-javascript/
    var fn = this 
      , args = Array.prototype.slice.call(arguments);
    return function(){
      var arg = 0;
      // Note that here 'arguments' refers to the arguments for the inner function
      // It is a different set of arguments from one above that is turned into an array
      // and assigned to 'args'
      for ( var i = 0; i < args.length && arg < arguments.length; i++ )
        if ( args[i] === undefined )
          args[i] = arguments[arg++];
      return fn.apply(this, args);
    };
  };

Function.prototype.dummy = function() {
  console.log("this is a dummy function");
};

function makeAuth(username, password) {
  return username + ':' + password;
}

function getHTTPSResponseFromAPI(hostname, path, auth, callback) {
  var options = {
        hostname: hostname,
        path: path,
        method: 'GET',
        // Note that the auth variable is automatically converted into base64
        // If you convert it before assigning it to auth then it'll get 
        // encoded twice and so will not work
        auth: auth
      }
    , req = https.request(options, callback);
  req.end();
  req.on('error', errorHandler);
}

// Takes path, auth, and callback
getAsanaResponse = getHTTPSResponseFromAPI.partial('app.asana.com', undefined, undefined, undefined);

function errorHandler(err) {
  console.log(err);
}

// Takes callback
processResponseAndDisplayData = processResponse.partial(undefined, displayData);

// Takes path and auth
getAsanaResponseAndDisplayStatusCode = getAsanaResponse.partial(undefined, undefined, displayStatusCode)

function processResponse(res, callback) {
  console.log("inside processResponse");
  // console.log(res);
  var data = '';
  console.log("statusCode: ", res.statusCode);
  console.log("headers: ", res.headers);
  res.on('data', function(chunk) {
    console.log("Inside res.on data");
    data += chunk.toString('utf-8');
    console.log(data);
  });
  res.on('end', function() {
    console.log("HELLOEOE");
    callback(data);
  });
}

function displayStatusCode(res) {
  console.log("Statuscode " + res.statusCode);
}

function displayData(data) {
  console.log("Data recieved: " + data);
}

app.get('/', routes.index);
app.get('/users', user.list);

// getAsanaResponse('/api/1.0/users/me', 'ccQkiMp.4xFjlmufvUKqnKOBEO4r9yT4:',  processResponseAndDisplayData);
// getAsanaResponseAndDisplayStatusCode('/api/1.0/users/me', 'ccQkiMp.4xFjlmufvUKqnKOBEO4r9yT4:');

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

console.log(global.toString);

module.exports.app = app;
module.exports.getHTTPSResponseFromAPI = getHTTPSResponseFromAPI;
module.exports.processResponse = processResponse;



