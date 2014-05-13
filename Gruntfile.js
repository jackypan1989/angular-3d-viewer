/* global require, module, process, __dirname */

'use strict';

var path = require('path');

module.exports = function (grunt) {

    require('load-grunt-tasks')(grunt);

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        meta: {
            banner: '/**\n' +
                ' * <%= pkg.description %>\n' +
                ' * @version v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n' +
                ' * @link <%= pkg.homepage %>\n' +
                ' * @author <%= pkg.author %>\n' +
                ' * @license MIT License, http://www.opensource.org/licenses/MIT\n' +
                ' */\n'
        },
        connect: {
            devserver: {
                options: {
                    port: 3000,
                    hostname: 'localhost',
                    base: '.'
                }
            }
        },
        dirs: {
            src: 'src',
            dest: 'dist'
        },
        copy: {

        },
        autoprefixer: {
            source: {
                src: '<%= dirs.dest %>/<%= pkg.name %>.css',
                dest: '<%= dirs.dest %>/<%= pkg.name %>.css'
            }
        },
        concat: {
            options: {
                banner: '<%= meta.banner %>'
            },
            dist: {
                src: ['<%= dirs.src %>/*.js', '<%= dirs.src %>/**/*.js'],
                dest: '<%= dirs.dest %>/<%= pkg.name %>.js'
            }
        },

        cssmin: {
            combine: {
                files: {
                    '<%= dirs.dest %>/<%= pkg.name %>.min.css': ['<%= dirs.dest %>/<%= pkg.name %>.css']
                }
            }
        },

        uglify: {
            options: {
                banner: '<%= meta.banner %>'
            },
            dist: {
                src: ['<%= concat.dist.dest %>'],
                dest: '<%= dirs.dest %>/<%= pkg.name %>.min.js'
            }
        },
        jshint: {
            files: ['Gruntfile.js', '<%= dirs.src %>/*.js', 'test/unit/*.js'],
            options: {
                curly: false,
                browser: true,
                eqeqeq: true,
                immed: true,
                latedef: true,
                newcap: true,
                noarg: true,
                sub: true,
                undef: true,
                boss: true,
                eqnull: true,
                expr: true,
                node: true,
                globals: {
                    exports: true,
                    angular: false,
                    $: false
                }
            }
        },
        changelog: {
            options: {
                dest: 'CHANGELOG.md'
            }
        },
        watch: {
            dev: {
                files: ['<%= dirs.src %>/**'],
                tasks: ['build']
            },
            test: {
                files: ['test/unit/**'],
                tasks: []
            }
        },
        jade: {
            compile: {
                options: {
                    pretty: true,
                    data: {
                        debug: false
                    },
                    livereload: true
                },
                files: [{
                    expand: true,
                    cwd: 'src/',
                    src: ['**/*.jade'],
                    dest: 'public/',
                    ext: '.html'
                }]
            }
        }
    });

    // Build task.
    grunt.registerTask('build', ['jshint', 'concat', 'uglify', 'autoprefixer', 'jade']);

    // Default task.
    grunt.registerTask('default', ['build', 'connect', 'watch']);

};