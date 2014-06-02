define('frame/defaults', [], function() {
    
  return {

    initial_frame: void 0,
    old_frame: void 0,
    frame_identifier_index: void 0,
    frameIdentifierKeyFunction: void 0,
    frame_identifier: void 0, // deprecated, obsolete, no longer used?
    current_timeout: void 0,
    draw_dispatch: void 0,
    delta: 1,
    step: 500,
    data: {},
    frame_type: 'block', //or 'sequence'
    categoricalValue: function (d) { return d[0]; },
    normalize_data: false
  };

});