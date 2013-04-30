var should = require('should')
  , app = require('../app');



describe('getHTTPResponseFromAPI', function() {
  var hostname = 'app.asana.com'
    , method = 'GET'
    , path = '/api/1.0/users/me'
    , auth = 'ccQkiMp.4xFjlmufvUKqnKOBEO4r9yT4:'
    ;

  it('should send a 200 status code', function(done) {
    app.getHTTPSResponseFromAPI(hostname, path, auth, function(res) {
      // console.log(res);
      res.should.have.status(200);
      done();
    });
  });
});

describe('processResponse', function() {
  var data = null
    , res = null;
  before(function(done) {
    var hostname = 'app.asana.com'
    , method = 'GET'
    , path = '/api/1.0/users/me'
    , auth = 'ccQkiMp.4xFjlmufvUKqnKOBEO4r9yT4:'
    ;
    app.getHTTPSResponseFromAPI(hostname, path, auth, function(_res) {
      app.processResponse(_res, function(_data) {
        res = _res
        data = _data;
        done();
    });
    });
  });
  it('should have content type of json', function(done) {
    res.should.be.json;
    done();
  })
  it('should return data in JSON format', function(done) {
    // JSON.parse throws a syntax error if data isn't in JSON format
    JSON.parse(data);
    done();
  });
});

