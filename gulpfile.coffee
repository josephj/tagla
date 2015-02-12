# Constants
CSS_PATH        = './dist/*.css'
JS_PATH         = './dist/*.js'
SASS_PATH       = './src/sass/*.sass'
COFFEE_PATH     = './src/coffee/*.coffee'
OUTPUT_PATH     = './dist/'
HTML_PATH       = './tests/manual/*.html'
HTTP_PORT       = 3333
LIVERELOAD_PORT = 32717

# Gulp plugins
gulp       = require 'gulp'
connect    = require 'gulp-connect'
sass       = require 'gulp-sass'
watch      = require 'gulp-watch'
open       = require 'gulp-open'
coffee     = require 'gulp-coffee'
sourcemaps = require 'gulp-sourcemaps'

# Task - connect
gulp.task 'connect', ->
  connect.server
    root: ['.']
    port: HTTP_PORT
    livereload:
      port: LIVERELOAD_PORT

# Task - open
gulp.task 'open', ->
  gulp.src './tests/manual/demo.html'
    .pipe open('', url: "http://localhost:#{HTTP_PORT}/tests/manual/demo.html")

# Task - watch
gulp.task 'watch', ->

  gulp.src SASS_PATH
    .pipe watch(SASS_PATH)
    .pipe sourcemaps.init()
    .pipe sass
      indentedSyntax: true
    .pipe sourcemaps.write()
    .pipe gulp.dest(OUTPUT_PATH)

  gulp.src COFFEE_PATH
    .pipe watch(COFFEE_PATH)
    .pipe sourcemaps.init()
    .pipe coffee().on('error', (err) ->)
    .pipe sourcemaps.write()
    .pipe gulp.dest(OUTPUT_PATH)

  gulp.src [HTML_PATH, CSS_PATH, JS_PATH]
    .pipe watch([HTML_PATH, CSS_PATH, JS_PATH])
    .pipe connect.reload()

gulp.task 'default', ['connect', 'open', 'watch']


