(function() {
  define(["mocha", "sinon", "chai", "sinonChai", "lodash", "d3", "charter", "data"], function(mocha, sinon, chai, sinonChai, _, d3, charter, data) {
    'use strict';
    var barchart, barchartSpy, should;

    should = chai.should();
    barchart = barchartSpy = null;
    return describe("barchart", function() {
      barchart = charter.barchart({
        expose: true
      });
      before(function() {
        var selection;

        barchartSpy = sinon.spy(barchart);
        barchart.width(300);
        barchart.height(200);
        barchart.margin({
          top: 20,
          right: 250,
          bottom: 30,
          left: 30
        });
        barchart.events([]);
        selection = d3.select("#chart");
        selection.data(data);
        return selection.call(barchart);
      });
      it("data should be an array of length 1", function() {
        var l;

        l = data.length;
        return l.should.equal(1);
      });
      it("should have been called once", function() {
        return barchartSpy.should.have.been.calledOnce;
      });
      return describe("internals.extractBarNames", function() {
        var extractBarNames, names;

        names = null;
        extractBarNames = barchart.internals.extractBarNames;
        before(function() {
          return names = extractBarNames(data[0]);
        });
        it("should return an array", function() {
          return _.isArray(names).should.equal(true);
        });
        return it("should return an array of strings", function() {
          var noString;

          noString = false;
          _.each(names, function(name) {
            if (_.isString(name) === false) {
              return noString = true;
            }
          });
          return noString.should.equal(false);
        });
      });
    });
  });

}).call(this);
