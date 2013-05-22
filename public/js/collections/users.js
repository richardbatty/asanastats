var app = app || {};

(function () {

  var Users = Backbone.Collection.extend({

    model: app.User,
    url: '/data/users'

  });

  app.users = new Users();
  app.users.fetch({
    reset: true,
    success: function() {
      console.log("success");
    },
    error: function() {
      console.log("error");
    }
  });
})();