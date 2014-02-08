(function(define) {
  return define(["chart"], function(chart) {

    return function () {
      return chart.bar();
    };

  });
})(typeof define === "function" && define.amd ? define : function(factory) {
  return module.exports = factory(require);
});