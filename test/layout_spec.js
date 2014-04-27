define([
  'chai', 
  'd3',
  'utils',
  'layout'
], function (chai, d3, utils, layout) {

  describe('layout', function() {

    var assert = chai.assert,
        body,
        element;
  
    function createDomElements () {
      body = d3.select('body');
      element = body.append('div');
      element.attr('id', 'element-id');
      element.style('width', '400px');
      element.style('height', '400px');
    }
  
    function removeDomElements () {
      element.remove();
    }

    beforeEach( function() {
      createDomElements();
    });

    afterEach( function() {
      removeDomElements();
    });
  
    describe('setDimensions passing width and height', function() {

      it('should set the selection width and height to the passed width and \
        height', function() {
        var __ = {
                  width: 200,
                  height: 100,
                  margin: {top: 20, right: 20, bottom: 40, left: 40},
                },
            selection = d3.select('#element-id');

        __ = layout.setDimensions.call(utils, selection, __);

        assert.equal(__.w, 200 - __.margin.left - __.margin.right);
        assert.equal(__.h, 100 - __.margin.top - __.margin.bottom);
      });
  
    });

    describe('setDimensions passing width and ratio', function() {

      it('should set the selection width to the passed width and the selection \
        height to half of the passed width', function() {
        var __ = {
                  width: 400,
                  ratio: .5,
                  margin: {top: 20, right: 20, bottom: 40, left: 40},
                },
            selection = d3.select('#element-id');

        __ = layout.setDimensions.call(utils, selection, __);

        assert.equal(__.w, 400 - __.margin.left - __.margin.right);
        assert.equal(__.h, 200 - __.margin.top - __.margin.bottom);
      });
  
    });

    describe('setDimensions passing ratio', function() {

      it('should set the selection width to the parents width and the selection \
        height to half of the width', function() {
        var __ = {
                  ratio: .5,
                  margin: {top: 20, right: 20, bottom: 40, left: 40},
                },
            selection = d3.select('#element-id');

        __ = layout.setDimensions.call(utils, selection, __);

        assert.equal(__.w, 400 - __.margin.left - __.margin.right);
        assert.equal(__.h, 200 - __.margin.top - __.margin.bottom);
      });
  
    });

    describe('setDimensions passing ratio and height', function() {

      it('should set the selection width to the parents width and the selection \
        height to the passed height', function() {
        var __ = {
                  ratio: .5,
                  height: 220,
                  margin: {top: 20, right: 20, bottom: 40, left: 40},
                },
            selection = d3.select('#element-id');

        __ = layout.setDimensions.call(utils, selection, __);

        assert.equal(__.w, 400 - __.margin.left - __.margin.right);
        assert.equal(__.h, 220 - __.margin.top - __.margin.bottom);
      });
  
    });

  });

});