(function() {
  require.config({
    baseUrl: "../js",
    urlArgs: "v=" + (new Date()).getTime(),
    paths: {
      d3: "../lib/d3/d3",
      lodash: "../lib/lodash/lodash",
      chai: "../lib/chai/chai",
      sinonChai: "../lib/sinon-chai/lib/sinon-chai",
      sinon: "../lib/sinon/index",
      mocha: "../lib/mocha/mocha",
      barchart: "./charts/barchart",
      barchart_spec: "../spec/js/charter/barchart_spec",
      data: "../spec/js/spec_data"
    },
    shim: {
      d3: {
        exports: "d3"
      },
      sinon: {
        exports: "sinon"
      },
      mocha: {
        init: function() {
          mocha.setup("bdd");
          return mocha;
        }
      }
    }
  });

  requirejs(["../spec/js/main"]);

}).call(this);
