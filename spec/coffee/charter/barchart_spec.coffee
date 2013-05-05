define [
  "mocha"
  "sinon"
  "chai"
  "sinonChai"
  "lodash"
  "d3"
  "charter"
  "data"
], (mocha, sinon, chai, sinonChai, _, d3, charter, data) ->
  'use strict'

  should = chai.should()
  #expect = chai.expect()
  barchart = barchartSpy = null

  describe "barchart", ->

    barchart = charter.barchart {expose: yes}

    before ->

      
      barchartSpy = sinon.spy barchart

      barchart.width 300
      barchart.height 200
      barchart.margin
       top: 20
       right: 250
       bottom: 30
       left: 30
      barchart.events []

      # Draw the chart:
      # A selection is an array of groups, 
      # and each group is an array of elements.
      selection = d3.select("#chart")
      selection.data data
      selection.call barchart

    
    it "data should be an array of length 1", ->
      l = data.length
      l.should.equal(1)

    it "should have been called once", ->
      barchartSpy.should.have.been.calledOnce

    describe "internals.extractBarNames", ->
      names = null
      extractBarNames = barchart.internals.extractBarNames

      before ->
        names = extractBarNames data[0]
      
      it "should return an array", ->
        _.isArray(names).should.equal(yes)

      it "should return an array of strings", ->
        noString = no
        _.each names, (name) ->  
          if _.isString(name) == no then noString = yes
        noString.should.equal(no)










      
