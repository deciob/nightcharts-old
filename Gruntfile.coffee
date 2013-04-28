#global module:false
module.exports = (grunt) ->

  grunt.initConfig(

    requirejs:
      options:
        baseUrl: "js"
        mainConfigFile: 'js/run.js'
      compress:
        options:
          optimize: 'uglify2'
          out: "dist/charter.min.js"
      plain:
        options:
          optimize: 'none'
          out: "dist/charter.js"

  )

  grunt.loadNpmTasks('grunt-requirejs')

  #grunt.registerTask "build", "requirejs"