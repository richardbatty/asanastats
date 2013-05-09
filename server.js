
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
  , db = mongojs('mydb', ['users'])
  , asana_api = require('./asana_api');
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



function logResponse(res) {
  console.log("REsponse: " + res);
}
// REST api

app.get('/:path', function(req, res) {
  // bind the JSON function to res, so that when it is passed,
  // the JSON function is called in the right context
  bound_res_JSON = _.bind(res.json, res);
  asana_api.getAPIResponse('/api/1.0/' + req.params.path, 'ccQkiMp.4xFjlmufvUKqnKOBEO4r9yT4:', bound_res_JSON);
});

app.get('/tags/:id', function(req, res) {
  bound_res_JSON = _.bind(res.json, res);
  asana_api.getAPIResponse('/api/1.0/tags/' + req.params.id, 'ccQkiMp.4xFjlmufvUKqnKOBEO4r9yT4:', bound_res_JSON);
});

app.get('/tags/:id/tasks', function(req, res) {
  bound_res_JSON = _.bind(res.json, res);
  asana_api.getAPIResponse('/api/1.0/tags/' + req.params.id + '/tasks', 'ccQkiMp.4xFjlmufvUKqnKOBEO4r9yT4:', bound_res_JSON);
});

app.get('/users/:id', function(req, res) {
  bound_res_JSON = _.bind(res.json, res);
  asana_api.getAPIResponse('/api/1.0/users/' + req.params.id, 'ccQkiMp.4xFjlmufvUKqnKOBEO4r9yT4:', bound_res_JSON);
});

app.get('/workspaces/:id/users', function(req, res) {
  console.log("FIRING");
  bound_res_JSON = _.bind(res.json, res);
  asana_api.getAPIResponse('/api/1.0/workspaces/' + req.params.id + '/users', 'ccQkiMp.4xFjlmufvUKqnKOBEO4r9yT4:', bound_res_JSON);
});

app.get('/workspaces/:id', function(req, res) {
  bound_res_JSON = _.bind(res.json, res);
  asana_api.getAPIResponse('/api/1.0/workspaces/' + req.params.id, 'ccQkiMp.4xFjlmufvUKqnKOBEO4r9yT4:', bound_res_JSON);
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
  bound_res_JSON = _.bind(res.json, res);
  asana_api.getAPIResponse('/api/1.0/workspaces/' + req.params.id + '/tasks', 'ccQkiMp.4xFjlmufvUKqnKOBEO4r9yT4:', bound_res_JSON);
});

app.get('/workspaces/:id/tags', function(req, res) {
  bound_res_JSON = _.bind(res.json, res);
  asana_api.getAPIResponse('/api/1.0/workspaces/' + req.params.id + '/tags', 'ccQkiMp.4xFjlmufvUKqnKOBEO4r9yT4:', bound_res_JSON);
});

app.get('/workspaces/:id/projects', function(req, res) {
  bound_res_JSON = _.bind(res.json, res);
  asana_api.getAPIResponse('/api/1.0/workspaces/' + req.params.id + '/projects', 'ccQkiMp.4xFjlmufvUKqnKOBEO4r9yT4:', bound_res_JSON);
});

app.get('/projects/:id', function(req, res) {
  bound_res_JSON = _.bind(res.json, res);
  asana_api.getAPIResponse('/api/1.0/projects/' + req.params.id, 'ccQkiMp.4xFjlmufvUKqnKOBEO4r9yT4:', bound_res_JSON);
});

app.get('/projects/:id/tasks', function(req, res) {
  bound_res_JSON = _.bind(res.json, res);
  asana_api.getAPIResponse('/api/1.0/projects/' + req.params.id + '/tasks', 'ccQkiMp.4xFjlmufvUKqnKOBEO4r9yT4:', bound_res_JSON);
});

app.get('/projects/:id/stories', function(req, res) {
  bound_res_JSON = _.bind(res.json, res);
  asana_api.getAPIResponse('/api/1.0/projects/' + req.params.id + '/stories', 'ccQkiMp.4xFjlmufvUKqnKOBEO4r9yT4:', bound_res_JSON);
});

app.get('/tasks/:id', function(req, res) {
  bound_res_JSON = _.bind(res.json, res);
  asana_api.getAPIResponse('/api/1.0/tasks/' + req.params.id, 'ccQkiMp.4xFjlmufvUKqnKOBEO4r9yT4:', bound_res_JSON);
});

app.get('/tasks/:id/subtasks', function(req, res) {
  bound_res_JSON = _.bind(res.json, res);
  asana_api.getAPIResponse('/api/1.0/tasks/' + req.params.id + '/subtasks', 'ccQkiMp.4xFjlmufvUKqnKOBEO4r9yT4:', bound_res_JSON);
});

app.get('/tasks/:id/stories', function(req, res) {
  bound_res_JSON = _.bind(res.json, res);
  asana_api.getAPIResponse('/api/1.0/tasks/' + req.params.id + '/stories', 'ccQkiMp.4xFjlmufvUKqnKOBEO4r9yT4:', bound_res_JSON);
});

app.get('/tasks/:id/projects', function(req, res) {
  bound_res_JSON = _.bind(res.json, res);
  asana_api.getAPIResponse('/api/1.0/tasks/' + req.params.id + '/projects', 'ccQkiMp.4xFjlmufvUKqnKOBEO4r9yT4:', bound_res_JSON);
});

app.get('/tasks/:id/tags', function(req, res) {
  bound_res_JSON = _.bind(res.json, res);
  asana_api.getAPIResponse('/api/1.0/tasks/' + req.params.id + '/tags', 'ccQkiMp.4xFjlmufvUKqnKOBEO4r9yT4:', bound_res_JSON);
});

app.get('/stories/:id', function(req, res) {
  bound_res_JSON = _.bind(res.json, res);
  asana_api.getAPIResponse('/api/1.0/stories/' + req.params.id, 'ccQkiMp.4xFjlmufvUKqnKOBEO4r9yT4:', bound_res_JSON);
});

app.get('/', function(req, res){
  res.render('index', {
    title: 'Home'
  });
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

module.exports.app = app;



