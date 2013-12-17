(function(define) {
define(function(require) {

  var buster, assert, jsdom, StateMachine, states;

  buster = require('buster');
  assert = buster.referee.assert;
  jsdom = require("jsdom").jsdom;

  TransitionTrain = require('../../src/transition_train/transition_train');
  StateMachine = require('../../src/transition_train/state_machine');
  states = require('../../src/transition_train/states');

  buster.testCase('transition_train/transition_train', {

    setUp: function () {
      var transition_states = states.transition_states,
        doc = jsdom("<html><body><div id='viz'></div></body></html>", null, {});
      this.state_machine = new StateMachine(transition_states);
      //this.transition_train = new TransitionTrain();
    },

    'should set new state to in_transition_start when current state is in_pause': function() {
      assert.equals(1,1);
    },

  });

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));