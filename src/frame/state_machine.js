// From http://lamehacks.net/blog/implementing-a-state-machine-in-javascript/

define(function(require) {

  // **frame.state_machine module**

  function StateMachine (states) {
    this.states = states;
    this.indexes = {};
    for( var i = 0; i < this.states.length; i++) {
      this.indexes[this.states[i].name] = i;
      if (this.states[i].initial){
        this.currentState = this.states[i];
      }
    }
  }

  StateMachine.prototype.consumeEvent = function (e) {
    if(this.currentState.events[e]){
      this.currentState = this.states[this.indexes[this.currentState.events[e]]];
    }
  }

  StateMachine.prototype.getStatus = function () {
    return this.currentState.name;
  }

  // getLastEvent();

  return StateMachine;

});

