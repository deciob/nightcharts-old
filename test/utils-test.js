var buster = require("buster");
var assert = buster.referee.assert;

var chart = require("../build/chart.js");

buster.testCase("Utils", {

    setUp: function () {
        this.myFunction = function() {};
        this.myOtherFunction = function(d) { return d; }
        
        this.__ = { 
          colour: 'LightSteelBlue',
          x: this.myOtherFunction
        };
    },

    "getset - calling with arguments is setter, without is getter": function () {

        chart.utils.getset(this.myFunction, this.__);

        this.myFunction.x('xxx');
        assert.equals(this.myFunction.x(), 'xxx');
        assert.equals(this.myFunction.colour(), 'LightSteelBlue');
        this.myFunction.colour('steelBlue');
        assert.equals(this.myFunction.colour(), 'steelBlue');
    }

});