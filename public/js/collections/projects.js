var app = app || {};

// (function () {

app.Projects = Backbone.Collection.extend({

  model: app.Project,
  url: '/data/projects'

});

app.projects = new app.Projects();
//   app.projects.fetch({
//     reset: true,
//     success: function() {
//       console.log("success");
//     },
//     error: function() {
//       console.log("error");
//     }
//   });
//   console.log(app.projects.models);
// })();