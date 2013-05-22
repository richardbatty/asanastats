var app = app || {};

// (function () {

  app.Workspaces = Backbone.Collection.extend({

    model: app.Workspace,
    url: '/data/workspaces'

  });

  app.workspaces = new app.Workspaces();
  // app.workspaces.fetch({
  //   reset: true,
  //   success: function() {
  //     console.log("success");
  //   },
  //   error: function() {
  //     console.log("error");
  //   }
  // });
// })();