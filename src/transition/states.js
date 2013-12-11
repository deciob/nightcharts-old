(function(define) {
  return define(function(require) {

    var transition_states = [
      {
        'name': 'in_pause',
        'initial': true,
        'events': {
          'forward': 'in_transition',
          'reverse': 'in_transition_reverse',
          'reset': 'in_reset'
        }
      },
      {
        'name': 'in_transition',
        'events': {
          'stop': 'in_pause',
          'reverse': 'in_transition_reverse'
        }
      },
      {
        'name': 'in_transition_reverse',
        'events': {
          'stop': 'in_pause',
          'forward': 'in_transition_forward'
        }
      },
      {
        'name': 'in_reset',
        'events': {
          'stop': 'in_pause'
        }
      }
    ];

    return { transition_states: transition_states};

  });

})(typeof define === "function" && define.amd ? define : function(factory) {
  return module.exports = factory(require);
});













