
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

var DataGetter = function(auth, relative_path) {
  // Constructor function
  // Taks an auth string (a base64-encoded authorisation string)
  // which authorises access for a particular asana user.
  // It returns an object that can get data for that user.

  // The public method is .getData, which takes a relative path, 
  // e.g. /projects or /tasks/2034052. When the data is got, 
  // a 'gotData' event is fired, with the array of objects passed.
  
  events.EventEmitter.call(this)

  var that = this;

  this.getData = function() {
    // The public method for this constructor. Takes a relative path
    // like '/projects' used to specify which asana data get.
    // Causes a chain of functions to be fired, ending in
    // a 'gotData' event being emitted, along with the data.
    that.emit("dataRequest");
  }

  this.getDeepData = function() {
    // This function uses the list of item-references and gets the actual data
    // for each reference. For example, /users gives us references to the
    // users available, but doesn't give us detailed data about them. This function
    // takes the list from /users (or /workspaces etc) and then goes to each of the 
    // /users/:id to get more detailed data.
    var deep_list = [];
    that.on("gotData", function(data) {
      data.forEach(function(reference) {
        var object_getter = new DataGetter('ccQkiMp.4xFjlmufvUKqnKOBEO4r9yT4:', relative_path + '/' + reference.id);

        // Set up a listener for each reference
        object_getter.on("gotData", function(item) {
          deep_list.push(item);

          // If the deep list has got all the deep data then emit "gotDeepData"
          if (deep_list.length === data.length) {
            that.emit("gotDeepData", deep_list);
          }
        });

        // Get the data for each reference.
        object_getter.getData();
      });
    })
    that.emit("dataRequest");
  }

  var getAPIResponse = function () {

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
  var workspacesDataGetter = new DataGetter('ccQkiMp.4xFjlmufvUKqnKOBEO4r9yT4:', '/workspaces')
    , usersDataGetter = new DataGetter('ccQkiMp.4xFjlmufvUKqnKOBEO4r9yT4:', '/users')
    , projectsDataGetter = new DataGetter('ccQkiMp.4xFjlmufvUKqnKOBEO4r9yT4:', '/projects');
  var workpaces_object = null
    , users_object = null
    , projects_object = null
    , count = 0;

  workspacesDataGetter.on("gotDeepData", function(workspaces_data) {
    workspaces_object = JSON.stringify(workspaces_data);
    count++;
    if (count > 2) {
      res.render('index', {
       workspaces_object: workspaces_object,
       users_object: users_object,
       projects_object: projects_object
     });
    }

  });

  usersDataGetter.on("gotDeepData", function(users_data) {
    users_object = JSON.stringify(users_data);
    count++;
    if (count > 2) {
      res.render('index', {
       workspaces_object: workspaces_object,
       users_object: users_object,
       projects_object: projects_object
     });
    }
  });

  projectsDataGetter.on("gotDeepData", function(projects_data) {
    projects_object = JSON.stringify(projects_data);
    count++;
    if (count > 2) {
      res.render('index', {
       workspaces_object: workspaces_object,
       users_object: users_object,
       projects_object: projects_object
     });
    }
  });

  workspacesDataGetter.getDeepData();
  usersDataGetter.getDeepData();
  projectsDataGetter.getDeepData();
});


app.get('/data/*', function(req, res) {
  // Listen for '/data/*' rather than just '/*' because needs client needs to be able
  // to access files like /js/main.js without going through this listener.

  // Weakness: I'm creating a new dataGetter every time someone makes a request. That means
  // if you reaload the page over and over more and more dataGetters are made. Will wait until
  // we have logins (or entering auth on the page) until I change this.

  // relative_path equals everything after '/data'.
  var relative_path = req.path.substring(5)
    , dataGetter = new DataGetter('ccQkiMp.4xFjlmufvUKqnKOBEO4r9yT4:', relative_path)
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




