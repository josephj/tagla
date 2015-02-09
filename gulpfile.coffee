# Constants
CSS_PATH        = './src/*.css'
JS_PATH         = './src/*.js'
SASS_PATH       = './src/*.scss'
OUTPUT_PATH     = './src/'
HTML_PATH       = './tests/manual/*.html'
HTTP_PORT       = 3333
LIVERELOAD_PORT = 32717

# Gulp plugins
gulp    = require 'gulp'
connect = require 'gulp-connect'
sass    = require 'gulp-sass'
watch   = require 'gulp-watch'
open    = require 'gulp-open'

# Task - connect
gulp.task 'connect', ->
    connect.server
      root: ['.']
      port: HTTP_PORT
      livereload:
        port: LIVERELOAD_PORT

gulp.task 'open', ->
    gulp.src './tests/manual/demo.html'
        .pipe open('', url: "http://localhost:#{HTTP_PORT}/tests/manual/demo.html")

# Task - watch
gulp.task 'watch', ->
  gulp.src SASS_PATH
    .pipe watch(SASS_PATH)
    .pipe sass
       errLogToConsole: true
       sourceComments : 'normal'
    .pipe gulp.dest(OUTPUT_PATH)
  gulp.src [HTML_PATH, CSS_PATH, JS_PATH]
    .pipe watch([HTML_PATH, CSS_PATH, JS_PATH])
    .pipe connect.reload()

gulp.task 'default', ['connect', 'open', 'watch']


