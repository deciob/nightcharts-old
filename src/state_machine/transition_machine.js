chart.transition_machine = (function () {

  var RESTING = 'resting',
    RUNNING = 'running',
    transition_frames = [], _transition_state, _previous_transition_state;

  {

  _transition_state: RESTING //RUNNING
  _previous_transition_state: null

  # Get the current state
  # ---------------------

  syncState: ->
    this._syncState

  isUnsynced: ->
    @_syncState is UNSYNCED

  isSynced: ->
    @_syncState is SYNCED

  isSyncing: ->
    @_syncState is SYNCING

  # Transitions
  # -----------

  start: ->
    if @_syncState in [SYNCING, SYNCED]
      @_previousSync = @_syncState
      @_syncState = UNSYNCED
      @trigger @_syncState, this, @_syncState
      @trigger STATE_CHANGE, this, @_syncState
    # when UNSYNCED do nothing
    return

  }
  
})();

chart.dispatch.start();
chart.dispatch.on('start.bar', function () {
  this.transition_machine.start(callback)
});

  start: function () {
    transition_frames.push(transition_frames.length + 1);
    _transition_state = RUNNING;
    _previous_transition_state = RESTING;
  }

  stop: function () {
    transition_frames.pop();
    _transition_state = RESTING;
    _previous_transition_state = RUNNING;
  }

  next: function () {
    transition_frames.push(transition_frames.length + 1);
    _transition_state = RUNNING;
    _previous_transition_state = RESTING;
  }


// meld.js????