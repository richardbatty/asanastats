var app = app || {};

// (function () {

  app.Users = Backbone.Collection.extend({

    model: app.User,
    url: '/data/users'

  });

  app.users = new app.Users();
//   app.users.fetch({
//     reset: true,
//     success: function() {
//       console.log("success");
//     },
//     error: function() {
//       console.log("error");
//     }
//   });
// })();