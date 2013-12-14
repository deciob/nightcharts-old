(function(define) {
  return define(function(require) {

    var transition_states = [
      {
        'name': 'in_pause',
        'initial': true,
        'events': {
          'start': 'in_transition_start',
          'forward': 'in_transition_forward',
          'reverse': 'in_transition_reverse',
          'reset': 'in_transition_reset'
        }
      },
      {
        'name': 'in_transition_start',
        'events': {
          'stop': 'in_pause'
        }
      },
      {
        'name': 'in_transition_forward',
        'events': {
          'stop': 'in_pause'
        }
      },
      {
        'name': 'in_transition_reverse',
        'events': {
          'stop': 'in_pause'
        }
      },
      {
        'name': 'in_transition_reset',
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













