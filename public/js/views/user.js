var app = app || {};

app.ItemView = Backbone.View.extend({
  tagname: 'li',

  initialize: function() {
    render();
  },

  render: function() {
    this.$el.html( this.model.toJSON());
    return this;
  }
})