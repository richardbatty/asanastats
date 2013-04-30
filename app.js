
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , https = require('https')
  , request = require('request');

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

function getAsanaData(api_key, path, callback) {
  console.log("Inside getAsanaData");
  var api_key = api_key
    , password = ''
    , options = {
        hostname: 'app.asana.com',
        path: path,
        method: 'GET',
        // Note that the auth variable is automatically converted into base64
        // If you convert it before assigning it to auth then it'll get 
        // encoded twice and so will not work
        auth: api_key + ':' + password
      }
    , data = ''
    , req = https.request(options, function(res) {
        console.log("statusCode: ", res.statusCode);
        console.log("headers: ", res.headers);
        res.on('data', function(chunk) {
          data += chunk.toString('utf-8');
        });
        res.on('end', function() {
          callback(data);
        });
      });
  req.end();
  req.on('error', function(e) {
    console.error(e);
  });
}

function displayData(data) {
  console.log("Data recieved: " + data);
}

app.get('/', routes.index);
app.get('/users', user.list);

getAsanaData('ccQkiMp.4xFjlmufvUKqnKOBEO4r9yT4', '/api/1.0/users/me', displayData);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});


