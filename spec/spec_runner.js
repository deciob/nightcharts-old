require.config({

  baseUrl:'../js',
  urlArgs: "v="+(new Date()).getTime(),

  paths: {

    d3: "../lib/d3/d3",
    chai: "../node_modules/chai/chai",
    mocha: "../lib/mocha/mocha",
    barchart: "./charts/barchart"

  },

  shim: {

    d3: {
      exports: "d3"
    },
    chai: {
      exports: "chai"
    },
    mocha: {
      init: function () {
        mocha.setup('bdd');
        return mocha;
      }
    }

  }

});

requirejs(['../spec/main']);