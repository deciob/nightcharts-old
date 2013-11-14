chart.utils = (function () {

  function extend(o, p) {
      for(prop in p) {
          o[prop] = p[prop];
      }
      return o;
  }

  return {
    extend: extend;
  };

})();