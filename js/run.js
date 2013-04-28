(function() {
  requirejs.config({
    paths: {
      d3: "../lib/d3/d3"
    },
    shim: {
      d3: {
        exports: "d3"
      }
    },
    name: "charts/barchart",
    wrap: true
  });

}).call(this);
