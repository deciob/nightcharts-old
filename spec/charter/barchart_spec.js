define(["mocha", "chai", "d3", "charter"], function(mocha, chai, d3, charter) {

  var should = chai.should();

  describe('charter', function () {



      it('should be an object', function () {
        var yippee = {};
        console.log(d3, '@@@@@@@@@@@@@@@@');
        yippee.should.be.an('object');
      });

    });


});

