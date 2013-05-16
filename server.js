
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

Function.prototype.partial = function(){
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

var DataGetter = function(auth) {
  // Constructor function
  // Taks an auth string (a base64-endocded authorisation string)
  // which authorises access for a particular asana user.
  // It returns an object that can get data for that user.

  // The public method is .getData, which takes a relative path, 
  // e.g. /projects or /tasks/2034052. When the data is got, 
  // a 'gotData' event is fired, with the array of objects passed.
  
  events.EventEmitter.call(this)

  var that = this;

  this.getData = function(relative_path) {
    // The public method for this constructor. Takes the relative path
    // used to specify which asana data get.
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
app.get('/:path', function(req, res) {

  var dataGetter = new DataGetter('ccQkiMp.4xFjlmufvUKqnKOBEO4r9yT4:')
    , relative_path = '/' + req.params.path
    , send_response = _.bind(res.send, res)
    ;

  dataGetter.on("gotData", send_response);
  dataGetter.on("apiError", send_response);

  dataGetter.getData(relative_path);

});

app.get('/tags/:id', function(req, res) {

  var dataGetter = new DataGetter('ccQkiMp.4xFjlmufvUKqnKOBEO4r9yT4:')
    , relative_path = '/tags/' + req.params.id
    , send_response = _.bind(res.send, res)
    ;

  dataGetter.on("gotData", send_response);
  dataGetter.on("apiError", send_response);

  dataGetter.getData(relative_path);

});

app.get('/tags/:id/tasks', function(req, res) {

  var dataGetter = new DataGetter('ccQkiMp.4xFjlmufvUKqnKOBEO4r9yT4:')
    , relative_path = '/tags/' + req.params.id + '/tasks'
    , send_response = _.bind(res.send, res)
    ;

  dataGetter.on("gotData", send_response);
  dataGetter.on("apiError", send_response);

  dataGetter.getData(relative_path);

});

app.get('/users/:id', function(req, res) {

  var dataGetter = new DataGetter('ccQkiMp.4xFjlmufvUKqnKOBEO4r9yT4:')
    , relative_path = '/users/' + req.params.id
    , send_response = _.bind(res.send, res)
    ;

  dataGetter.on("gotData", send_response);
  dataGetter.on("apiError", send_response);

  dataGetter.getData(relative_path);

});

app.get('/workspaces/:id/users', function(req, res) {

  var dataGetter = new DataGetter('ccQkiMp.4xFjlmufvUKqnKOBEO4r9yT4:')
    , relative_path = '/workspaces/' + req.params.id + '/users'
    , send_response = _.bind(res.send, res)
    ;

  dataGetter.on("gotData", send_response);
  dataGetter.on("apiError", send_response);

  dataGetter.getData(relative_path);

});

app.get('/workspaces/:id', function(req, res) {

  var dataGetter = new DataGetter('ccQkiMp.4xFjlmufvUKqnKOBEO4r9yT4:')
    , relative_path = '/workspaces/' + req.params.id
    , send_response = _.bind(res.send, res)
    ;

  dataGetter.on("gotData", send_response);
  dataGetter.on("apiError", send_response);

  dataGetter.getData(relative_path);

});

app.get('/workspaces/:id/tasks', function(req, res) {
  // Doesn't work on the api end - they say it would be too much data
  // http://stackoverflow.com/questions/11661832/asana-tasks-api-does-not-work-for-get-tasks-get-workspaces-workspace-id-tasks  
  // "You must always filter a task query with something, as we do not 
  // yet support pagination and all tasks in a workspaces will usually 
  // be a huge volume of data. Specifying a project implicitly scopes 
  // the query to a workspace, as every project exists in exactly one 
  // workspace. You can specify assignee, but then you must additionally 
  // filter by workspace.""
  // "So your choices for filtering tasks are either by project or by BOTH assignee and workspace.""

  var dataGetter = new DataGetter('ccQkiMp.4xFjlmufvUKqnKOBEO4r9yT4:')
    , relative_path = '/workspaces/' + req.params.id + '/tasks'
    , send_response = _.bind(res.send, res)
    ;

  dataGetter.on("gotData", send_response);
  dataGetter.on("apiError", send_response);

  dataGetter.getData(relative_path);

});

app.get('/workspaces/:id/tags', function(req, res) {

  var dataGetter = new DataGetter('ccQkiMp.4xFjlmufvUKqnKOBEO4r9yT4:')
    , relative_path = '/workspaces/' + req.params.id + '/tags'
    , send_response = _.bind(res.send, res)
    ;

  dataGetter.on("gotData", send_response);
  dataGetter.on("apiError", send_response);

  dataGetter.getData(relative_path);

});

app.get('/workspaces/:id/projects', function(req, res) {

  var dataGetter = new DataGetter('ccQkiMp.4xFjlmufvUKqnKOBEO4r9yT4:')
    , relative_path = '/workspaces' + req.params.id + '/projects'
    , send_response = _.bind(res.send, res)
    ;

  dataGetter.on("gotData", send_response);
  dataGetter.on("apiError", send_response);

  dataGetter.getData(relative_path);

});

app.get('/projects/:id', function(req, res) {

  var dataGetter = new DataGetter('ccQkiMp.4xFjlmufvUKqnKOBEO4r9yT4:')
    , relative_path = '/projects/' + req.params.id
    , send_response = _.bind(res.send, res)
    ;

  dataGetter.on("gotData", send_response);
  dataGetter.on("apiError", send_response);

  dataGetter.getData(relative_path);

});

app.get('/projects/:id/tasks', function(req, res) {

  var dataGetter = new DataGetter('ccQkiMp.4xFjlmufvUKqnKOBEO4r9yT4:')
    , relative_path = '/projects/' + req.params.id + '/tasks'
    , send_response = _.bind(res.send, res)
    ;

  dataGetter.on("gotData", send_response);
  dataGetter.on("apiError", send_response);

  dataGetter.getData(relative_path);

});

app.get('/projects/:id/stories', function(req, res) {

  var dataGetter = new DataGetter('ccQkiMp.4xFjlmufvUKqnKOBEO4r9yT4:')
    , relative_path = '/projects/' + req.params.id + '/stories'
    , send_response = _.bind(res.send, res)
    ;

  dataGetter.on("gotData", send_response);
  dataGetter.on("apiError", send_response);

  dataGetter.getData(relative_path);

});

app.get('/tasks/:id', function(req, res) {

  var dataGetter = new DataGetter('ccQkiMp.4xFjlmufvUKqnKOBEO4r9yT4:')
    , relative_path = '/tasks' + req.params.id
    , send_response = _.bind(res.send, res)
    ;

  dataGetter.on("gotData", send_response);
  dataGetter.on("apiError", send_response);

  dataGetter.getData(relative_path);

});

app.get('/tasks/:id/subtasks', function(req, res) {

  var dataGetter = new DataGetter('ccQkiMp.4xFjlmufvUKqnKOBEO4r9yT4:')
    , relative_path = '/tasks' + req.params.id + '/subtasks'
    , send_response = _.bind(res.send, res)
    ;

  dataGetter.on("gotData", send_response);
  dataGetter.on("apiError", send_response);

  dataGetter.getData(relative_path);

});

app.get('/tasks/:id/stories', function(req, res) {

  var dataGetter = new DataGetter('ccQkiMp.4xFjlmufvUKqnKOBEO4r9yT4:')
    , relative_path = '/tasks/' + req.params.id + '/stories'
    , send_response = _.bind(res.send, res)
    ;

  dataGetter.on("gotData", send_response);
  dataGetter.on("apiError", send_response);

  dataGetter.getData(relative_path);

});

app.get('/tasks/:id/projects', function(req, res) {

  var dataGetter = new DataGetter('ccQkiMp.4xFjlmufvUKqnKOBEO4r9yT4:')
    , relative_path = '/tasks' + req.params.id + '/projects'
    , send_response = _.bind(res.send, res)
    ;

  dataGetter.on("gotData", send_response);
  dataGetter.on("apiError", send_response);

  dataGetter.getData(relative_path);

});

app.get('/tasks/:id/tags', function(req, res) {

  var dataGetter = new DataGetter('ccQkiMp.4xFjlmufvUKqnKOBEO4r9yT4:')
    , relative_path = '/tasks/' + req.params.id + '/tags'
    , send_response = _.bind(res.send, res)
    ;

  dataGetter.on("gotData", send_response);
  dataGetter.on("apiError", send_response);

  dataGetter.getData(relative_path);

});

app.get('/stories/:id', function(req, res) {

  var dataGetter = new DataGetter('ccQkiMp.4xFjlmufvUKqnKOBEO4r9yT4:')
    , relative_path = '/stories/' + req.params.id
    , send_response = _.bind(res.send, res)
    ;

  dataGetter.on("gotData", send_response);
  dataGetter.on("apiError", send_response);

  dataGetter.getData(relative_path);

});


app.get('/', function(req, res){
  res.sendfile('./public/static/index.html')
});



/*
List of things to get from asana:
/users - all userse in all workspaces that the authenticated
user can access

/user/user-id for individual users

/workspaces/workspace-id/users - all users in a single workspace
or organisation

POST /tasks - create a new task

POST /workspaces/workspace-id/tasks 

GET /tasks/task-id - show a specific task

PUT /tasks/task-id - update specific existing task

DELETE /tasks/task-id - delete a specific existing task

GET /tasks
GET /projects/project-id/tasks
GET /workspaces/workspace-id/tasks


GET /tasks/task-id/subtasks
POST /tasks
POST /tasks/parent-id/subtasks
POST /tasks/task-id/setParent

GET /tasks/task-id/stories - get a series of stories associated 
with the task - e.g. comments and actions performed on it

etc - see documentation

*/




http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});


console.log("App in server.js: " + app);
module.exports = app;
module.exports.DataGetter = DataGetter;
// module.exports.getAPIResponse = getAPIResponse;
// module.exports.processResponse = processResponse;




