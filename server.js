
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

var DataGetter = function() {
  
  var that = this;

  events.EventEmitter.call(this)

  this.getAndSaveData = function(path, auth) {
    that.emit("dataRequest", path, auth);
  }

  var getAPIResponse = function (path, auth) {
    console.log("inside getAPIResponse");
    // Takes a path for app.asana.com, an authorisation code, and a callback that operates
    // on the asana response object.
    var options = {
          hostname: 'app.asana.com',
          path: path,
          method: 'GET',
          // Note that the auth variable is automatically converted into base64
          // If you convert it before assigning it to auth then it'll get 
          // encoded twice and so will not work
          auth: auth
        }
      , req = https.request(options, function(asana_response) {
          console.log("inside https.request callback");
          console.log(that);
          that.emit("asanaResponse", asana_response)
        });

    req.on('error', function(err) {
      console.log(err);
    });
    req.end();

  }

  var processResponse = function (asana_response) {
    // Takes a response object from asana and listens for data from it
    // Also takes a node server response object
    // that has functions send() and json() which are called depending
    // on whether or not there are errors from asana.
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
    console.log("inside sendData");
    if (data["errors"] !== undefined) {
      that.emit("apiError", data["errors"]);
    } else {
      that.emit("dataProcessed", data["data"]);
    }
  }

  var saveData = function (data) {
    console.log("inside saveData");
    console.log(data);
    data.forEach(function(project) {
      db.projects.save(project, function(err) {
        if (err) {
          console.log(err);
        }
      });
    })
    // Need some error handling
    that.emit("dataSaved");
    console.log("Saved data");
  }

  var handleApiError = function(message) {
    console.log(message);
  }

  var getData = function() {
    db.projects.find(function(err, docs) {
      console.log(docs);
    });
  }

  this.on("dataRequest", getAPIResponse);
  this.on("asanaResponse", processResponse);
  this.on("dataRecieved", processData);
  this.on("apiError", handleApiError);
  this.on("dataProcessed", saveData);
  this.on("dataSaved", getData);

}

util.inherits(DataGetter, events.EventEmitter);

// REST api
app.get('/:path', function(req, res) {
  // bind the JSON function to res, so that when it is passed,
  // the JSON function is called in the right context

  var dataGetter = new DataGetter();
  dataGetter.getAndSaveData('/api/1.0/' + req.params.path, 'ccQkiMp.4xFjlmufvUKqnKOBEO4r9yT4:');

  // var JSONResponder = createJSONResponder(res);
  // getAPIResponse('/api/1.0/' + req.params.path, 'ccQkiMp.4xFjlmufvUKqnKOBEO4r9yT4:', JSONResponder);
});

app.get('/tags/:id', function(req, res) {
  var JSONResponder = createJSONResponder(res);
  getAPIResponse('/api/1.0/' + req.params.id, 'ccQkiMp.4xFjlmufvUKqnKOBEO4r9yT4:', JSONResponder);
});

app.get('/tags/:id/tasks', function(req, res) {
  var JSONResponder = createJSONResponder(res);
  getAPIResponse('/api/1.0/tags/' + req.params.id + '/tasks', 'ccQkiMp.4xFjlmufvUKqnKOBEO4r9yT4:', JSONResponder);
});

app.get('/users/:id', function(req, res) {
  var JSONResponder = createJSONResponder(res);
  getAPIResponse('/api/1.0/users/' + req.params.id, 'ccQkiMp.4xFjlmufvUKqnKOBEO4r9yT4:', JSONResponder);
});

app.get('/workspaces/:id/users', function(req, res) {
  var JSONResponder = createJSONResponder(res);
  getAPIResponse('/api/1.0/workspaces/' + req.params.id + '/users', 'ccQkiMp.4xFjlmufvUKqnKOBEO4r9yT4:', JSONResponder);
});

app.get('/workspaces/:id', function(req, res) {
  var JSONResponder = createJSONResponder(res);
  getAPIResponse('/api/1.0/workspaces/' + req.params.id, 'ccQkiMp.4xFjlmufvUKqnKOBEO4r9yT4:', JSONResponder);
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
  var JSONResponder = createJSONResponder(res);
  getAPIResponse('/api/1.0/workspaces/' + req.params.id + '/tasks', 'ccQkiMp.4xFjlmufvUKqnKOBEO4r9yT4:', JSONResponder);
});

app.get('/workspaces/:id/tags', function(req, res) {
  var JSONResponder = createJSONResponder(res);
  getAPIResponse('/api/1.0/workspaces/' + req.params.id + '/tags', 'ccQkiMp.4xFjlmufvUKqnKOBEO4r9yT4:', JSONResponder);
});

app.get('/workspaces/:id/projects', function(req, res) {
  var JSONResponder = createJSONResponder(res);
  getAPIResponse('/api/1.0/workspaces/' + req.params.id + '/projects', 'ccQkiMp.4xFjlmufvUKqnKOBEO4r9yT4:', JSONResponder);
});

app.get('/projects/:id', function(req, res) {
  var JSONResponder = createJSONResponder(res);
  getAPIResponse('/api/1.0/projects/' + req.params.id, 'ccQkiMp.4xFjlmufvUKqnKOBEO4r9yT4:', JSONResponder);
});

app.get('/projects/:id/tasks', function(req, res) {
  var JSONResponder = createJSONResponder(res);
  getAPIResponse('/api/1.0/projects/' + req.params.id + '/tasks', 'ccQkiMp.4xFjlmufvUKqnKOBEO4r9yT4:', JSONResponder);
});

app.get('/projects/:id/stories', function(req, res) {
  var JSONResponder = createJSONResponder(res);
  getAPIResponse('/api/1.0/projects/' + req.params.id + '/stories', 'ccQkiMp.4xFjlmufvUKqnKOBEO4r9yT4:', JSONResponder);
});

app.get('/tasks/:id', function(req, res) {
  var JSONResponder = createJSONResponder(res);
  getAPIResponse('/api/1.0/tasks/' + req.params.id, 'ccQkiMp.4xFjlmufvUKqnKOBEO4r9yT4:', JSONResponder);
});

app.get('/tasks/:id/subtasks', function(req, res) {
  var JSONResponder = createJSONResponder(res);
  getAPIResponse('/api/1.0/tasks/' + req.params.id + '/subtasks', 'ccQkiMp.4xFjlmufvUKqnKOBEO4r9yT4:', JSONResponder);
});

app.get('/tasks/:id/stories', function(req, res) {
  var JSONResponder = createJSONResponder(res);
  getAPIResponse('/api/1.0/tasks/' + req.params.id + '/stories', 'ccQkiMp.4xFjlmufvUKqnKOBEO4r9yT4:', JSONResponder);
});

app.get('/tasks/:id/projects', function(req, res) {
  var JSONResponder = createJSONResponder(res);
  getAPIResponse('/api/1.0/tasks/' + req.params.id + '/projects', 'ccQkiMp.4xFjlmufvUKqnKOBEO4r9yT4:', JSONResponder);
});

app.get('/tasks/:id/tags', function(req, res) {
  var JSONResponder = createJSONResponder(res);
  getAPIResponse('/api/1.0/tasks/' + req.params.id + '/tags', 'ccQkiMp.4xFjlmufvUKqnKOBEO4r9yT4:', JSONResponder);
});

app.get('/stories/:id', function(req, res) {
  var JSONResponder = createJSONResponder(res);
  getAPIResponse('/api/1.0/stories/' + req.params.id, 'ccQkiMp.4xFjlmufvUKqnKOBEO4r9yT4:', JSONResponder);
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
// module.exports.getAPIResponse = getAPIResponse;
// module.exports.processResponse = processResponse;




