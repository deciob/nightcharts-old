
module.exports = (grunt) ->

  myJs = grunt.file.expand ['js/**/*.js', '!js/vendor/**']

  grunt.initConfig

    complexity:
      generic:
        src: myJs
        options:
          cyclomatic: 5
          halstead: 15
          maintainability: 100
    
    coffeelint:
        app: ['coffee/**/*.coffee']

    coffee:
      src:
        expand: true
        cwd: 'coffee'
        src: '**/*.coffee'
        dest: 'js'
        ext: '.js'
      spec:
        expand: true
        cwd: 'spec/coffee'
        src: '**/*.coffee'
        dest: 'spec/js'
        ext: '.js'

    watch:
      files: ['./coffee/**/*.coffee', './spec/**/*.coffee'],
      tasks: 'coffee'

    # Optimization and build.
    requirejs:
      options:
        baseUrl: "js"
      compress:
        options:
          optimize: 'uglify2'
          out: "dist/charter.min.js"
          mainConfigFile: 'js/run.js'
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


  grunt.loadNpmTasks('grunt-requirejs')
  grunt.loadNpmTasks('grunt-complexity');
  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-coffeelint');

  # the default task can be run just by typing "grunt" on the command line
  grunt.registerTask('default', []);
