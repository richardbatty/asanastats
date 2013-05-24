var app = app || {};

app.AppView = Backbone.View.extend({

  initialize: function() {
    initialRenderer = this.renderer(3);
    this.listenTo(app.projects, 'reset', initialRenderer);
    this.listenTo(app.users, 'reset', initialRenderer);
    this.listenTo(app.workspaces, 'reset', initialRenderer);
  },

  renderer: function(max_calls) {
    // Returns a function that you call every time a collection
    // is reset. If the function has been called max_calls times already
    // then it executes renderAll, which renders all the views.
    // If the function has been called less than max_calls then it
    // just increments the counter.
    var count = 0;
    return function() {
      count++;
      console.log(count);
      if (!(count < max_calls)) {
          this.renderAll();  
      }
    }
  },

  renderAll: function() {
    this.renderUsers();
    this.renderWorkspaces();
    this.renderProjects();
  },

  renderUsers: function() {
    var element = $('#users-list');
    element.empty();
    element.append('<h2>Users</h2>');
    app.users.each(function(user) {
      var template = _.template($('#user-template').html(),  {name: user.get("name") });
      element.append( template );
    });

  },

  renderProjects: function() {
    var element = $('#projects-list');
    element.empty();
    element.append('<h2>Projects</h2>');
    app.projects.each(function(project) {
      var template = _.template($('#project-template').html(),  {name: project.get("name") });
      element.append( template );
    });
  },

  renderWorkspaces: function() {
    var element = $('#workspaces-list');
    element.empty();
    element.append('<h2>Workspaces</h2>');
    app.workspaces.each(function(workspace) {
      var workspace_template = _.template($('#workspace-template').html(),  { name: workspace.get("name") });
      element.append( workspace_template );
      workspace_projects = workspace.projects();
      workspace_projects.forEach(function(project) {
        var project_template = _.template($('#project-template').html(), { name: project.get("name") });
        element.append( project_template );
      })
    });
  }
});