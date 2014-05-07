define(['chai', 'sample_data', 'd3', 'frame/frame'], function(chai, sample_data, d3, Frame) {

  // TODO: simplify the data and stick it here, so the meaning of the tests 
  // are more clear.

  var assert = chai.assert,
    drawChart = function (data) {
      return data;
    },
    __ = {
      initial_frame: 1950,  // Start date in data.
      draw_dispatch: d3.dispatch('draw'),
      delta: 5,
      step: 500,
      data: sample_data,
      frame_type: 'block',
      frame_identifier: 'year',
    },
    FrameConstructor = Frame(__);
    frame = FrameConstructor();

  describe('frame/frame', function () {

    it('should not step backward', function() {
      frame.dispatch.prev.call(frame);
      assert.isTrue(frame.frame === frame.initial_frame());
    });

    it('should step forward, without waiting for each frame to finish', function () {
      frame.dispatch.next.call(frame);
      frame.dispatch.next.call(frame);
      frame.dispatch.next.call(frame);
      assert.isTrue(frame.frame === 1965);
    });

    it('should step backward', function () {
      frame.dispatch.prev.call(frame);
      assert.isTrue(frame.frame === 1960);
    });

    it('should reset', function () {
      frame.dispatch.reset.call(frame);
      assert.isTrue(frame.frame === 1950);
    });

    it('should jump to 1990', function () {
      frame.dispatch.jump.call(frame, 1990);
      assert.isTrue(frame.frame === 1990);
    });

    // This one is more complicated... because it is tightly coupled with
    // the real chart functionality.
    //
    //it('should stop at 1995', function (done) {
    //  this.timeout(3000);
    //  frame.dispatch.start.call(frame);
    //  frame.dispatch.on('stop', function () {
    //    console.log('frame.frame')
    //    assert.isTrue(frame.frame === 1955);
    //    done();
    //  });
    //});

  });

});