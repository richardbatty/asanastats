var should = require('should')
  , app = require('../server')
  , asana_api = require('../asana_api');



describe('getHTTPResponseFromAPI', function() {
  var hostname = 'app.asana.com'
    , method = 'GET'
    , path = '/api/1.0/users/me'
    , auth = 'ccQkiMp.4xFjlmufvUKqnKOBEO4r9yT4:'
    ;

  it('should send a 200 status code', function(done) {
    asana_api.getHTTPSResponseFromAPI(hostname, path, auth, function(res) {
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
    asana_api.getHTTPSResponseFromAPI(hostname, path, auth, function(_res) {
      asana_api.processResponse(_res, function(_data) {
        res = _res
        data = _data;
        done();
    });
    });
  });
  it('data should not contain errors', function(done) {
    should.not.exist(data["errors"]);
    done();
  })
  it('data should have content type of json', function(done) {
    res.should.be.json;
    done();
  })
  it('data should be in parseable JSON format', function(done) {
    // JSON.parse throws a syntax error if data isn't in JSON format
    JSON.parse(data);
    done();
  });
});
