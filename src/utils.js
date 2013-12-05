(function(define) {
  return define(["d3"], function(d3) {

    // Useful functions that can be shared across modules.
    
    function extend (target, source) {
      for(prop in source) {
        target[prop] = source[prop];
      }
      return target;
    }
  
    function getset (obj, state) {
      d3.keys(state).forEach( function(key) {
        obj[key] = function (x) {
          if (!arguments.length) return state[key];
          var old = state[key];
          state[key] = x;
          return obj;
        }
      });
    }
  
    // https://groups.google.com/forum/#!msg/d3-js/WC_7Xi6VV50/j1HK0vIWI-EJ
    function endall (transition, data, callback) {
      // Assumes the data length never changes.
      // Incrementing n (++n) for each transition element does not work if we
      // have exits in the transition, because of a length mismatch between now
      // and the end of the transitions. 
      var n = data.length;
      transition 
        //.each(function() { ++n; }) 
        .each("end", function() { 
          if (!--n) {
            if (callback) {
              callback.apply(this, arguments);
            }
            chart.dispatch.end();
          }
        }); 
    }
  
    return {
      extend: extend,
      getset: getset,
      endall: endall
    };
  
  });

})(typeof define === "function" && define.amd ? define : function(ids, factory) {
  var deps;
  deps = ids.map(function(id) {
    return require(id);
  });
  return module.exports = factory.apply(null, deps);
});