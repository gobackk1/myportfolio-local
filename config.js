{
  'use strict';
  module.exports = (project) => {
    return {
      path: {
        scss: {
          src: 'src/' + project + '/scss/',
          dest: 'dist/' + project + '/assets/',
          sourcemaps: '/map'
        },
        css: {
          src: 'src/' + project + '/css/',
          dest: 'dist/' + project + '/assets/css/'
        },
        ejs: {
          src: 'src/' + project + '/ejs/',
          dest: 'dist/' + project + '/'
        },
        img: {
          src: 'src/' + project + '/img/',
          dest: 'dist/' + project + '/assets/img/'
        },
        script: {
          src: 'src/' + project + '/js/',
          dest: 'dist/' + project + '/assets/js/'
        },
        root: {
          src: 'src/' + project + '/',
          dest: 'dist/' + project + '/'
        }
      }
    };
  }
}
