(function(define) {
define(function(require) {

  var buster, assert, orientation;

  buster = require('buster');
  assert = buster.referee.assert;
  utils = require('../../src/utils/utils');

  buster.testCase("utils/utils", {

    setUp: function () {
      this.myFunction = function() {};
      this.myOtherFunction = function(d) { return d; }
      
      this.__ = { 
        colour: 'LightSteelBlue',
        x: this.myOtherFunction
      };
    },
  
    "getset - calling with arguments is setter, without is getter": function () {

      utils.getset(this.myFunction, this.__);

      this.myFunction.x('xxx');
      assert.equals(this.myFunction.x(), 'xxx');
      assert.equals(this.myFunction.colour(), 'LightSteelBlue');
      this.myFunction.colour('steelBlue');
      assert.equals(this.myFunction.colour(), 'steelBlue');
    }
  
  });
  
});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));