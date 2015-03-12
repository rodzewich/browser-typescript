/*jslint */
/*global module */

module.exports = function (grunt) {
    "use strict";

    grunt.loadNpmTasks("grunt-tsc");
    grunt.loadNpmTasks("grunt-wrap");
    grunt.loadNpmTasks("grunt-contrib-uglify");

    grunt.initConfig({

        pkg: grunt.file.readJSON("package.json"),
        tsc: {
            options: {
                version: "latest"
            },
            core: {
                options: {},
                files: [
                    {
                        ext: ".js",
                        expand: true,
                        dest: "temp",
                        cwd: "src",
                        src: [
                            "*.ts",
                            "**/*.ts"
                        ]
                    }
                ]
            }
        },

        uglify: {
            options: {
                //banner: grunt.file.read("src/banner.txt")
            },
            compile: {
                files: [
                    {
                        expand : false,
                        dest   : "temp/browser-typescript.js",
                        src    : [
                            "temp/*.js",
                            "node_modules/grunt-tsc/bin/latest/tsc.js",
                            "src/Runner.js",
                            "!temp/browser-typescript.js"
                        ]
                    }
                ]
            }
        },

        wrap: {
            options: {
                wrapper: ["(function () {\"use strict\"", ";window.compiler={configure:configure,version:function(){return config.getVersion()},base:function(){return config.getBase()},encoding:function(){return config.getEncoding()}};}())"]
            },
            core: {
                src: "temp/browser-typescript.js",
                dest: "dest/browser-typescript.js"
            }
        }

    });

    grunt.registerTask("default", "Build project.", ["tsc", "uglify", "wrap"]);

};