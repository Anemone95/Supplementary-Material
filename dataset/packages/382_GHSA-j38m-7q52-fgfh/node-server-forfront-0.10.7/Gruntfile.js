module.exports = function (grunt) {
  // 项目配置
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: {
        separator: ';'
      },
      dist: {
        src: ['D:\\project\\mobile_story\\css\\atlas.css', 'D:\\project\\mobile_story\\css\\theme.css'],
        dest: 'D:\\project\\mobile_story\\css\\atlass.css'
      }
    },
    uglify: {
      build: {
        src: 'D:\\project\\mobile_story\\css\\atlass.css',
        dest: 'D:\\project\\mobile_story\\css\\atlass.min.css'
      }
    },
    less: {  
      development: {
                files: [{
                    expand: true,
                    cwd: 'demo/css',
                    src: '**/***/*.less',
                    dest: 'demo/css',
                    ext: '.css'
                }]
            }
    }
  });
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-less');
  // 默认任务
  grunt.registerTask('default', ['concat', 'uglify','less']);
}