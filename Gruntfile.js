var SRC_PATH  = './src/',
    COFFEE_PATH = SRC_PATH + 'coffee/',
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
        browserify: {
            options: {
                transform: ['coffeeify'],
                banner: "// DON'T MODIFY THIS FILE!\n// MODIFY ITS SOURCE FILE!"
            },
            debug: {
                options: {
                    browserifyOptions: {debug: true}
                },
                src: COFFEE_PATH + 'tagla.coffee',
                dest: DIST_PATH + 'tagla.debug.js'
            },
            build: {
                options: {
                     browserifyOptions: {standalone: 'Tagla'}
                },
                src: COFFEE_PATH + 'tagla.coffee',
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
                tasks: ['browserify:debug']
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
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-coffee');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-sass');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');

    // Tasks
    grunt.registerTask('build', [
        'browserify:build',
        'uglify:build',
        'sass:build',
        'autoprefixer:build',
        'cssmin:build'
    ]);
    grunt.registerTask('build:debug', [
        'browserify:debug',
        'sass:debug',
        'autoprefixer:debug'
    ]);
    grunt.registerTask('default', ['build', 'connect', 'watch']);

};
