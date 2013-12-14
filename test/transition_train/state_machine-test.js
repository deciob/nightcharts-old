(function(define) {
define(function(require) {

  var buster, assert, StateMachine, states;

  buster = require('buster');
  assert = buster.referee.assert;
  StateMachine = require('../../src/transition_train/state_machine');
  states = require('../../src/transition_train/states');

  buster.testCase('transition_train/state_machine', {

    setUp: function () {
      var transition_states = states.transition_states;
      this.state_machine = new StateMachine(transition_states);
    },

    'should set new state to in_transition_start when current state is in_pause': function() {
      assert.equals(this.state_machine.getStatus(), 'in_pause');
      this.state_machine.consumeEvent('start');
      assert.equals(this.state_machine.getStatus(), 'in_transition_start');
    },

    'should not change state when current state state is not in_pause': function() {
      this.state_machine.consumeEvent('start');
      this.state_machine.consumeEvent('reset');
      assert.equals(this.state_machine.getStatus(), 'in_transition_start');
    },

    'should change state when current state state not in_pause': function() {
      assert.equals(this.state_machine.getStatus(), 'in_pause');
      this.state_machine.consumeEvent('start');
      assert.equals(this.state_machine.getStatus(), 'in_transition_start');
      this.state_machine.consumeEvent('stop');
      assert.equals(this.state_machine.getStatus(), 'in_pause');
      this.state_machine.consumeEvent('reset');
      assert.equals(this.state_machine.getStatus(), 'in_transition_reset');
      this.state_machine.consumeEvent('stop');
      assert.equals(this.state_machine.getStatus(), 'in_pause');
      this.state_machine.consumeEvent('forward');
      assert.equals(this.state_machine.getStatus(), 'in_transition_forward');
      this.state_machine.consumeEvent('stop');
      assert.equals(this.state_machine.getStatus(), 'in_pause');
      this.state_machine.consumeEvent('reverse');
      assert.equals(this.state_machine.getStatus(), 'in_transition_reverse');
    },

  });

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));