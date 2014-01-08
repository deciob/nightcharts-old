define(['chai', 'utils/utils'], function(chai, utils) {

  var params, 
    assert = chai.assert,
    myFunction,
    myOtherFunction,
    __;

  before( function() {
    myFunction = function() {};
    myOtherFunction = function(d) { return d; }
    __ = { 
      colour: 'LightSteelBlue',
      x: myOtherFunction
    };
  });

  describe('utils/utils', function(){
    it('getset - calling with arguments is setter, without is getter', function(){
      utils.getset(myFunction, __);
      myFunction.x('xxx');
      assert.equal(myFunction.x(), 'xxx');
      assert.equal(myFunction.colour(), 'LightSteelBlue');
      myFunction.colour('steelBlue');
      assert.equal(myFunction.colour(), 'steelBlue');
    });
  });

});