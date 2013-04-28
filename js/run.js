(function() {
  requirejs.config({
    paths: {
      d3: "../lib/d3/d3",
      almond: "../node_modules/grunt-requirejs/node_modules/almond/almond",
      barchart: "charts/barchart"
    },
    shim: {
      d3: {
        exports: "d3"
      }
    },
    name: "almond",
    include: ["barchart"],
    wrap: true,
    insertRequire: ["barchart"]
  });

}).call(this);
