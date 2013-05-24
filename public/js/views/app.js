var app = app || {};

app.AppView = Backbone.View.extend({
  
  initialize: function() {
    this.listenTo(app.projects, 'reset', this.renderProjects);
    this.listenTo(app.users, 'reset', this.renderUsers);
    this.listenTo(app.workspaces, 'reset', this.renderWorkspaces);
  },

  renderUsers: function() {
    var element = $('#users-list');
    app.users.each(function(user) {
      var template = _.template($('#user-template').html(),  {name: user.get("name") });
      element.append( template );
    });

  },

  renderProjects: function() {
    var element = $('#projects-list');
    app.projects.each(function(project) {
      var template = _.template($('#project-template').html(),  {name: project.get("name") });
      element.append( template );
    });
  },

  renderWorkspaces: function() {
    var element = $('#workspaces-list');
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