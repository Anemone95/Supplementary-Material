module.exports = function(render) {
  render("show-message.htm", {
    message: this.query.message
  });
};

