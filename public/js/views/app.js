var app = app || {};

app.AppView = Backbone.View.extend({
  el: '#projects-list',
  
  initialize: function() {
    this.listenTo(app.projects, 'reset', this.render)
  },

  render: function() {
    var element = this.$el;
    app.projects.each(function(project) {
      var template = _.template($('#project-template').html(),  {name: project.get("name") });
      element.append( template );
    });
  }
});