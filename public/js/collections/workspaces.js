var app = app || {};

(function () {

  var Workspaces = Backbone.Collection.extend({

    model: app.Workspace,
    url: '/data/workspaces'

  });

  app.workspaces = new Workspaces();
  app.workspaces.fetch({
    reset: true,
    success: function() {
      console.log("success");
    },
    error: function() {
      console.log("error");
    }
  });
})();