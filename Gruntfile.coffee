#global module:false
module.exports = (grunt) ->

  grunt.initConfig(

    requirejs:
      options:
        baseUrl: "js"
      #compress:
      #  options:
      #    optimize: 'uglify2'
      #    out: "dist/charter.min.js"
      #    mainConfigFile: 'js/run.js'
      plain:
        options:
          optimize: 'none'
          out: "dist/charter.js"
          mainConfigFile: 'js/run.js'
      css:
        options:
          optimizeCss: "standard"
          cssIn: "style/main.css"
          out: "dist/main.css"

  )

  grunt.loadNpmTasks('grunt-requirejs')

  #grunt.registerTask "build", "requirejs"