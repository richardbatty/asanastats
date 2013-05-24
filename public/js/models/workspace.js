var app = app || {};

app.Workspace = Backbone.Model.extend({

  projects: function() {
    // Could refactor this so that the first time it's called it 
    // performs the operation and caches the result so that the 
    // second time it's called it just returns the cached result.
    var projects_list = [];
    var that = this;
    // debugger;
    app.projects.each(function(project) {
      if (project.get("workspace").id === that.id) {
        projects_list.push(project);
      }
    });
    return projects_list;
  }

});
