var app = app || {};

var Workspace = Backbone.Router.extend({

  routes: {
    // Note that these routes are hash routes
    // so "users" will be executed when the path is /#users 
    "users": "users",
    "projects": "projects"
  },

  users: function() {
    users = new app.Users();
    users.fetch();
    console.log("initialised workspace");
  },

  projects: function() {
    console.log("Inside projects initialiser");
    projects = new app.Projects();
    projects.fetch();
    console.log("finding projects");
  }
})

app_router = new Workspace();

Backbone.history.start();