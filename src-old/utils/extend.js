// **Useful functions that can be shared across modules**

define(['utils/mixins'], function(mixins) {

  function extend (target, source, use_clone, not_override) {
    var use_clone = (typeof use_clone === "undefined") ? true : use_clone,
        target_clone = use_clone ? clone(target): target;
    for(prop in source) {
      if (not_override) {
        target_clone[prop] = target_clone[prop] ? target_clone[prop] : source[prop];
      } else {
        target_clone[prop] = source[prop];
      }
    }
    return target_clone;
  }

  mixins.call(extend.prototype);

  return extend;

});