var SRC_PATH  = './src/',
    COFFEE_PATH = SRC_PATH + 'coffee/',
    JS_PATH = SRC_PATH + 'js/',
    SASS_PATH = SRC_PATH + 'sass/',
    DIST_PATH = './dist/',
    TEST_PATH = './tests/',
    HTTP_PORT = '3333',
    LIVERELOAD_PORT = 32717;

module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        autoprefixer: {
            options: {
                browsers: ['> 5%']
            },
            debug: {
                options: {map: true},
                src: DIST_PATH + 'tagla.debug.css',
                dest: DIST_PATH + 'tagla.debug.css'
            },
            build: {
                options: {map: false},
                src: DIST_PATH + 'tagla.css',
                dest: DIST_PATH + 'tagla.css'
            }
        },
        coffee: {
            debug: {
                options: {sourceMap: true},
                src: COFFEE_PATH + 'tagla.coffee',
                dest: JS_PATH + 'tagla.debug.js'
            },
            build: {
                options: {sourceMap: false},
                src: COFFEE_PATH + 'tagla.coffee',
                dest: JS_PATH + 'tagla.js'
            }
        },
        concat: {
            debug: {
                options: {sourceMap: true},
                src: [JS_PATH + 'base.js', JS_PATH + 'image.js', JS_PATH + 'tagla.debug.js'],
                dest: DIST_PATH + 'tagla.debug.js'
            },
            build: {
                options: {sourceMap: false},
                src: [JS_PATH + 'base.js', JS_PATH + 'image.js', JS_PATH + 'tagla.js'],
                dest: DIST_PATH + 'tagla.js'
            }
        },
        connect: {
            options: {
                base: [__dirname],
                livereload: LIVERELOAD_PORT,
                port: HTTP_PORT,
            },
            server: {
                options: {
                    open: {
                        target: 'http://localhost:' + HTTP_PORT + '/tests/manual/development.html'
                    }
                }
            }
        },
        cssmin: {
            build: {
                src: DIST_PATH + 'tagla.css',
                dest: DIST_PATH + 'tagla.min.css'
            }
        },
        sass: {
            debug: {
                options: {sourceMap: true},
                src: SASS_PATH + 'tagla.sass',
                dest: DIST_PATH + 'tagla.debug.css'
            },
            build: {
                options: {sourceMap: false},
                src: SASS_PATH + 'tagla.sass',
                dest: DIST_PATH + 'tagla.css'
            }
        },
        uglify: {
            build: {
                src: DIST_PATH + 'tagla.js',
                dest: DIST_PATH + 'tagla.min.js'
            }
        },
        watch: {
            options: {
                livereload: 32717
            },
            html: {
                files: [TEST_PATH + '**/*.html']
            },
            coffee: {
                files: [COFFEE_PATH + '*.coffee'],
                tasks: ['coffee:debug', 'concat:debug']
            },
            sass: {
                files: [SASS_PATH + '*.sass'],
                tasks: ['sass:debug', 'autoprefixer:debug']
            },
            css: {
                files: [DIST_PATH + 'tagla.debug.css']
            },
            js: {
                files: [DIST_PATH + 'tagla.debug.js']
            }
        }
    });

    // Packages
    grunt.loadNpmTasks('grunt-autoprefixer');
    grunt.loadNpmTasks('grunt-contrib-coffee');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-sass');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');

    // Tasks
    grunt.registerTask('build', [
        'coffee:build',
        'concat:build',
        'uglify:build',
        'sass:build',
        'autoprefixer:build',
        'cssmin:build'
    ]);
    grunt.registerTask('build:debug', [
        'coffee:debug',
        'concat:debug',
        'sass:debug',
        'autoprefixer:debug'
    ]);
    grunt.registerTask('default', ['build', 'connect', 'watch']);

};
