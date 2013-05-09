
var http = require('http')
  , path = require('path')
  , https = require('https')
  , request = require('request')
  , _ = require('underscore')
  , mongojs = require('mongojs')
  , db = mongojs('mydb', ['users'])
  , asana_api = require('./asana_api')
  , app = require('./server')
  ;

// Function to create partially applied functions
// From John Resig: http://ejohn.org/blog/partial-functions-in-javascript/
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



var User = function User(data) {
  this.id = data.id,
  this.name = data.name, 
  this.email = data.email,
  this.workspaces = data.workspaces
}

function getAPIResponse(path, auth, callback) {
  // Takes a paht from app.asana.com and a callback that operates
  // on one data argument where the data is in JSON format.
  console.log(path);
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
        var data = '';
        asana_response.on('data', function(chunk) {
          data += chunk.toString('utf-8');
        });
        asana_response.on('end', function() {
          // convert JSON string to JSON
          json_data = JSON.parse(data);
          callback(json_data);
        });
    });
  req.end();
  req.on('error', function(err) {
    console.log(err);
  });
}

module.exports.getAPIResponse = getAPIResponse;

// function processResponse(res, callback) {
//   var data = '';
//   console.log("statusCode: ", res.statusCode);
//   console.log("headers: ", res.headers);
//   res.on('data', function(chunk) {
//     data += chunk.toString('utf-8');
//   });
//   res.on('end', function() {
//     callback(data);
//   });
// }

// function recordData(data) {
//   console.log("inside recorddata" + data);
//   data_obj = JSON.parse(data)
//   var user = new User(data_obj.data)
//   db.users.save(user, function(err, saved) {
//     if (err) throw err;
//   });
// // }


// // Takes callback
// processResponseAndRecordData = processResponse.partial(undefined, recordData);
// getAPIResponse(processResponseAndRecordData)

// module.exports.getHTTPSResponseFromAPI = getHTTPSResponseFromAPI;
// module.exports.processResponse = processResponse;