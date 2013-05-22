var app = app || {};

app.AppView = Backbone.View.extend({
  el: '#projects-list',
  
  initialize: function() {
    this.listenTo(app.projects, 'reset', this.render)
  },

  render: function() {
    var element = this.$el;
    element.append('<h2>Users</h2>');
    app.users.each(function(project) {
      var template = _.template($('#project-template').html(),  {name: project.get("name") });
      element.append( template );
    });
    element.append('<h2>Workspaces</h2>');
    app.workspaces.each(function(project) {
      var template = _.template($('#project-template').html(),  {name: project.get("name") });
      element.append( template );
    });
    element.append('<h2>Projects</h2>');
    app.projects.each(function(project) {
      var template = _.template($('#project-template').html(),  {name: project.get("name") });
      element.append( template );
    });

  }
});