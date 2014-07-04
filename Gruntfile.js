module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    // uglify: {
    //   build: {
    //     files: {
    //         'dist/app.min.js': ['js/raf.js', 'js/Vector.js', 'js/Platform.js', 'js/Player.js', 'js/app.js']
    //     }
    //   }
    // }
    requirejs: {
        compile: {
            options: {
                name: '../node_modules/almond/almond',
                include: 'config.js',
                mainConfigFile: 'js/config.js',
                out: 'dist/follower.min.js',
                optimize: 'uglify'
            }
        }
    }

  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-requirejs');

  // Default task(s).
  grunt.registerTask('default', ['requirejs']);

};
