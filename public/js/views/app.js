var app = app || {};

app.AppView = Backbone.View.extend({
  el: '#items',

  initialize: function() {
    this.listenTo(items, 'add', this.addOne);
    this.render();
  },

  render: function() {
    this.$el.html('Test html');
    return this;
  },

  addOne: function( item ) {
    console.log("Inside addone");
  }

});
