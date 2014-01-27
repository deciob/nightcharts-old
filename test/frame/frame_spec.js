define(['chai', 'data', 'frame/frame'], function(chai, data, Frame) {

  // TODO: simplify the data and stick it here, so the meaning of the tests 
  // are more clear.

  var assert = chai.assert,
    drawChart = function (data) {
      return data;
    },
    config = {
      frame: 1950,  // Start date in data.
      chart: { handleTransitionEnd: function(f) { return f; } },
      delta: 5,
      step: 1000,
      data: data,
      drawChart: drawChart
    },
    transition = new Frame(config);

  describe('frame/frame', function () {

    it('should should not step backward', function() {
      transition.dispatch.prev.call(transition);
      assert.isTrue(transition.frame === transition.initial_frame);
    });

    it('should step forward, without waiting for each transition to finish', function () {
      transition.dispatch.next.call(transition);
      transition.dispatch.next.call(transition);
      transition.dispatch.next.call(transition);
      assert.isTrue(transition.frame === 1965);
    });

    it('should step backward', function () {
      transition.dispatch.prev.call(transition);
      assert.isTrue(transition.frame === 1960);
    });

    it('should reset', function () {
      transition.dispatch.reset.call(transition);
      assert.isTrue(transition.frame === 1950);
    });

    it('should jump to 1990', function () {
      transition.dispatch.jump.call(transition, 1990);
      assert.isTrue(transition.frame === 1990);
    });

    // This one is more complicated... because it is tightly coupled with
    // the real chart functionality.
    //
    //it('should stop at 1995', function (done) {
    //  this.timeout(3000);
    //  transition.dispatch.start.call(transition);
    //  transition.dispatch.on('stop', function () {
    //    console.log('transition.frame')
    //    assert.isTrue(transition.frame === 1955);
    //    done();
    //  });
    //});

  });

});