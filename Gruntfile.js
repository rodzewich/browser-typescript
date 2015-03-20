/*jslint */
/*global module, require, process */

var fs      = require("fs"),
    path    = require("path"),
    spawn   = require("child_process").spawn,
    rows    = process.stdout.rows,
    columns = process.stdout.columns,
    cwd     = process.cwd();

/**
 * @param {*} value
 * @return {string}
 */
function typeOf(value) {
    "use strict";
    var type  = String(Object.prototype.toString.call(value) || '').slice(8, -1) || 'Object',
        types = ['Arguments', 'Array', 'Boolean', 'Date', 'Error', 'Function', 'Null', 'Number', 'Object', 'String', 'Undefined'];
    if (types.indexOf(type) !== -1) {
        type = type.toLowerCase();
    }
    return type;
}

/**
 * @param {function[]} actions
 * @return {void}
 */
function deferred(actions) {
    "use strict";
    function iterate() {
        setTimeout(function () {
            var action = actions.shift();
            if (typeOf(action) === "function") {
                action(iterate);
            }
        }, 0);
    }
    iterate();
}

/**
 * @param {string} dir
 * @param {function} callback
 * @return {void}
 */
function mkdir(dir, callback) {
    "use strict";
    deferred([
        function (iterate) {
            fs.exists(dir, function (exists) {
                if (exists) {
                    callback(null);
                } else {
                    iterate();
                }
            });
        },
        function () {
            mkdir(path.dirname(dir), function (error) {
                if (error) {
                    callback(error);
                } else {
                    fs.mkdir(dir, function (error) {
                        callback(error || null);
                    });
                }
            });
        }
    ]);
}

/**
 * @param {string} path1
 * @param {string} path2
 * @param {function} callback
 * @return {void}
 */
function copy(path1, path2, callback) {
    "use strict";
    var content;
    deferred([
        function (next) {
            mkdir(path.join(cwd, path.dirname(path2)), function (error) {
                if (error) {
                    callback(error);
                } else {
                    next();
                }
            });
        },
        function (next) {
            fs.readFile(path1, function (error, data) {
                if (error) {
                    callback(error);
                } else {
                    content = data;
                    next();
                }
            });
        },
        function (next) {
            fs.writeFile(path2, content, function (error) {
                if (error) {
                    callback(error);
                } else {
                    next();
                }
            });
        },
        function () {
            callback(null);
        }
    ]);
}

module.exports = function (grunt) {
    "use strict";

    /**
     * @param {string} property
     * @param {string} value
     * @return {void}
     */
    function displayProperty(property, value) {
        var array = new Array(10 - property.length);
        grunt.log.writeln(array.join(" ") + property.green + " " + value);
    }

    /**
     * @param {Error} error
     * @return {void}
     */
    function displayError(error) {
        grunt.log.write(">>".red + " " + String(error.name).red + " " + error.message);
    }

    /**
     * @param {string} content
     * @return {void}
     */
    function displayContent(content) {
        content.split(/(?:\n|\r)+/).forEach(function (item) {
            item = item.replace(/\s+$/, "");
            item = item.replace(/\s+/, " ");
            if (item) {
                while (item) {
                    item = item.replace(/^\s+/, "");
                    grunt.log.write(">>".red + " ");
                    grunt.log.writeln(item.substr(0, columns - 3));
                    item = item.substr(columns - 3);
                }
            }
        });
    }
    

    grunt.loadNpmTasks("grunt-tsc");
    grunt.loadNpmTasks("grunt-wrap");
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-contrib-concat");
    grunt.loadNpmTasks('grunt-closure-compiler');

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

        concat: {
            options: {
                //banner: grunt.file.read("src/banner.txt")
            },
            compile: {
                files: [
                    {
                        expand : false,
                        dest   : "temp/tsc.js",
                        src    : [
                            "temp/Config.js",
                            "temp/System.js",
                            "src/Runner.js",
                            "temp/bin/*.js",
                            "!temp/bin/v1_0.js"
                        ]
                    }
                ]
            }
        },

        wrap: {
            options: {
                wrapper: [
                    "(function(){",
                    ";window.tsc={configure:configure,version:function(){return config.getVersion()}," +
                    "base:function(){return config.getBase()},encoding:function(){return config.getEncoding()}};}());"
                ]
            },
            core: {
                src: "temp/tsc.js",
                dest: "dest/tsc.js"
            }
        },

        // todo: change to google closure compiler
        uglify: {
            options: {
            },
            core: {
                files: [
                    {
                        expand : false,
                        dest   : "dest/tsc.js",
                        src    : "dest/tsc.js"
                    }
                ]
            }
        },

        'closure-compiler': {
            frontend: {
                closurePath: '.',
                js: 'dest/tsc.js',
                jsOutputFile: 'dest/tsc.min.js',
                maxBuffer: 50000,
                options: {
                    compilation_level: 'SIMPLE_OPTIMIZATIONS',
                    //language_in: 'ECMASCRIPT5_STRICT'
                }
            }
        }

    });

    grunt.registerTask("download", "Download libraries.", function () {
        var done            = this.async(),
            project         = "https://github.com/Microsoft/TypeScript.git",
            versions        = {},
            tempExists      = false,
            tempIsFile      = false,
            tempIsDirectory = false,
            binExists       = false,
            binIsFile       = false,
            binIsDirectory  = false,
            additionalVersion;

        var PATH_COMPILER = "temp/compiler";
        var PATH_BINARY = "temp/bin";

        deferred([
            function (next) {
                fs.exists(PATH_COMPILER, function (exists) {
                    binExists = exists;
                    next();
                });
            },
            function (next) {
                if (binExists) {
                    fs.stat(PATH_COMPILER, function (error, stats) {
                        if (error) {
                            displayError(error);
                            done(false);
                        } else {
                            binIsDirectory = stats.isDirectory();
                            binIsFile = !stats.isDirectory();
                            next();
                        }
                    });
                } else {
                    next();
                }
            },
            function (next) {
                var remove,
                    errors = [];
                if (binIsFile) {
                    fs.unlink(PATH_COMPILER, function (error) {
                        if (error) {
                            displayError(error);
                            done(false);
                        } else {
                            next();
                        }
                    });
                } else if (binIsDirectory) {
                    remove = spawn("rm", ["-rf", PATH_COMPILER]);
                    remove.stdout.on("data", function (data) {
                        errors.push(data.toString("utf8"));
                    });
                    remove.stderr.on("data", function (data) {
                        errors.push(data.toString("utf8"));
                    });
                    remove.on("close", function (code) {
                        if (code !== 0) {
                            displayContent(errors.join(""));
                            done(true);
                        } else {
                            next();
                        }
                    });
                } else {
                    next();
                }
            },
            function (next) {
                mkdir(PATH_COMPILER, function (error) {
                    if (error) {
                        displayError(error);
                        done(false);
                    } else {
                        displayProperty("create", path.join(cwd, PATH_COMPILER));
                        next();
                    }
                });
            },
            function (next) {
                fs.exists(PATH_BINARY, function (exists) {
                    tempExists = exists;
                    next();
                });
            },
            function (next) {
                if (tempExists) {
                    fs.stat(PATH_BINARY, function (error, stats) {
                        if (error) {
                            displayError(error);
                            done(false);
                        } else {
                            tempIsDirectory = stats.isDirectory();
                            tempIsFile = !stats.isDirectory();
                            next();
                        }
                    });
                } else {
                    next();
                }
            },
            function (next) {
                var remove,
                    errors = [];
                if (tempIsFile) {
                    fs.unlink(PATH_BINARY, function (error) {
                        if (error) {
                            displayError(error);
                            done(false);
                        } else {
                            next();
                        }
                    });
                } else if (tempIsDirectory) {
                    remove = spawn("rm", ["-rf", PATH_BINARY]);
                    remove.stdout.on("data", function (data) {
                        errors.push(data.toString("utf8"));
                    });
                    remove.stderr.on("data", function (data) {
                        errors.push(data.toString("utf8"));
                    });
                    remove.on("close", function (code) {
                        if (code !== 0) {
                            displayContent(errors.join(""));
                            done(false);
                        } else {
                            next();
                        }
                    });
                } else {
                    next();
                }
            },
            function (next) {
                mkdir(PATH_BINARY, function (error) {
                    if (error) {
                        displayError(error);
                        done(false);
                    } else {
                        displayProperty("create", path.join(cwd, PATH_BINARY));
                        next();
                    }
                });
            },
            function (next) {
                var errors = [],
                    process = spawn("/usr/bin/env", ["git", "clone", project, PATH_COMPILER]);
                process.stdout.on("data", function (data) {
                    errors.push(data.toString("utf8"));
                });
                process.stderr.on("data", function (data) {
                    errors.push(data.toString("utf8"));
                });
                process.on("close", function (code) {
                    if (code !== 0) {
                        displayContent(errors.join(""));
                        done(false);
                    } else {
                        displayProperty("checkout", project);
                        next();
                    }
                });
            },
            function (next) {
                var errors  = [],
                    process = spawn("/usr/bin/env", ["git", "checkout", "master"], {cwd: PATH_COMPILER});
                process.stdout.on("data", function (data) {
                    errors.push(data.toString("utf8"));
                });
                process.stderr.on("data", function (data) {
                    errors.push(data.toString("utf8"));
                });
                process.on("close", function (code) {
                    if (code !== 0) {
                        displayContent(errors.join(""));
                        done(false);
                    } else {
                        next();
                    }
                });
            },
            function (next) {
                var process = spawn("/usr/bin/env", ["git", "pull"], {cwd: PATH_COMPILER}),
                    errors  = [];
                process.stdout.on("data", function (data) {
                    errors.push(data.toString("utf8"));
                });
                process.stderr.on("data", function (data) {
                    errors.push(data.toString("utf8"));
                });
                process.on("close", function (code) {
                    if (code !== 0) {
                        displayContent(errors.join(""));
                        done(false);
                    } else {
                        next();
                    }
                });
            },




            function (next) {
                var content = "",
                    process = spawn("/usr/bin/env", ["git", "branch", "-a", "--no-color"], {cwd: PATH_COMPILER}),
                    errors  = [];
                process.stdout.on("data", function (data) {
                    content += data.toString("utf8");
                    errors.push(data.toString("utf8"));
                });
                process.stderr.on("data", function (data) {
                    errors.push(data.toString("utf8"));
                });
                process.on("close", function (code) {
                    var temp = [];
                    if (code !== 0) {
                        displayContent(errors.join(""));
                        done(false);
                    } else {
                        content.split("\n").forEach(function (version) {
                            if (/^\s+\S+\/release-\d+\.\d+(?:\.\d+)?$/.test(version)) {
                                temp.push(version.replace(/^\s+\S+\/release-(\d+\.\d+(?:\.\d+)?)$/, "$1"));
                            }
                        });
                        temp.sort();
                        temp.forEach(function (version) {
                            versions[version.replace(/^(\d+\.\d+)(?:\.\d+)?$/, "$1")] = version;
                        });
                        versions.latest = "master";
                        versions.default = temp[temp.length - 2];
                        next();
                    }
                });
            },
            function (next) {
                var actions = [];
                Object.keys(versions).forEach(function (version) {
                    var branch = versions[version],
                        target = path.join(PATH_BINARY, "v" + version.replace(/\./g, "_") + ".js");
                    if (branch !== "master") {
                        branch = "release-" + branch;
                    }
                    if (["default", "latest"].indexOf(version) !== -1) {
                        target = path.join(PATH_BINARY, version + ".js");
                    }
                    actions.push(function (next) {
                        var errors = [],
                            process;
                        process = spawn("/usr/bin/env", ["git", "checkout", branch], {cwd: PATH_COMPILER});
                        process.stdout.on("data", function (data) {
                            errors.push(data.toString("utf8"));
                        });
                        process.stderr.on("data", function (data) {
                            errors.push(data.toString("utf8"));
                        });
                        process.on("close", function (code) {
                            if (code !== 0) {
                                displayContent(errors.join(""));
                                done(false);
                            } else {
                                next();
                            }
                        });
                    });
                    actions.push(function (next) {
                        var errors = [],
                            process;
                        process = spawn(
                            "/usr/bin/env",
                            [
                                "node",
                                path.join(PATH_COMPILER, "bin/tsc.js"),
                                path.join(PATH_COMPILER, "src/compiler/tsc.ts"),
                                path.join(PATH_COMPILER, "bin/lib.d.ts"),
                                "--target", "ES3",
                                "--out",
                                path.join(target)
                            ]
                        );
                        process.stdout.on("data", function (data) {
                            errors.push(data.toString("utf8"));
                        });
                        process.stderr.on("data", function (data) {
                            errors.push(data.toString("utf8"));
                        });
                        process.on("close", function (code) {
                            if (code !== 0) {
                                displayContent(errors.join(""));
                                done(false);
                            } else {
                                next();
                            }
                        });
                    });
                    actions.push(function (next) {
                        var contentWithLib = [];
                        fs.readFile(target, function (err1, targetContent) {
                            if (err1) {
                                displayError(err1);
                                done(false);
                            } else {
                                contentWithLib.push(targetContent.toString("utf8"));
                                fs.readFile(path.join(PATH_COMPILER, "bin/lib.d.ts"), function (err2, libContent) {
                                    if (err2) {
                                        displayError(err2);
                                        done(false);
                                    } else {
                                        contentWithLib.push("system.writeFile(\"lib.d.ts\", " + JSON.stringify(libContent.toString("utf8").split("\r\n")) + ".join(\"\\n\"));");
                                        fs.writeFile(target, contentWithLib.join("\n"), function (err3) {
                                            if (err3) {
                                                displayError(err3);
                                                done(false);
                                            } else {
                                                next();
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    });
                });
                actions.push(function () {
                    next();
                });
                deferred(actions);
            },
            function (next) {
                var content = "",
                    errors  = [],
                    args    = ["temp/bin/latest.js"],
                    command;
                args.push("--version");
                command = spawn(process.execPath, args);
                command.stderr.on("data", function (data) {
                    errors.push(String(data || ""));
                });
                command.stdout.on("data", function (data) {
                    content += data.toString();
                    errors.push(String(data || ""));
                });
                command.on("close", function (code) {
                    if (code !== 0) {
                        displayContent(errors.join("\n"));
                    } else {
                        if (/^.*version\s+(\S+).*$/im.test(content)) {
                            additionalVersion = content.replace(/^.*version\s+(\S+).*$/im, "$1").split("\r").join("").split("\n").join("").split(".").slice(0, 2).join(".");
                        }
                        next();
                    }
                });
            },
            function (next) {
                if (typeOf(versions[additionalVersion]) === "undefined") {
                    copy(
                        "temp/bin/latest.js",
                        "temp/bin/v" + additionalVersion.replace(/\./g, "_") + ".js",
                        function (error) {
                            if (error) {
                                displayError(error);
                                done(false);
                            } else {
                                versions[additionalVersion] = "master";
                                next();
                            }
                        }
                    );
                } else {
                    next();
                }
            },
            function (next) {
                Object.keys(versions).forEach(function (version) {
                    var content,
                        filename = "v" + version.replace(/\./g, "_") + ".js";
                    if (["latest", "default"].indexOf(version) !== -1) {
                        filename = version + ".js";
                    }
                    deferred([
                        function (next) {
                            fs.readFile("temp/bin/" + filename, function (error, data) {
                                if (error) {
                                    displayError(error);
                                    done(false);
                                } else {
                                    content = String(data);
                                    next();
                                }
                            });
                        },
                        function (next) {
                            var ns = "ts";
                            if (content.indexOf("var TypeScript;") !== -1) {
                                ns = "TypeScript";
                            }
                            if (/ts\.executeCommandLine\(([^\)]*)\);/.test(content)) {
                                content = content.replace(/ts\.executeCommandLine\(([^\)]*)\);/g, function (content, arg) {
                                    if (arg.indexOf(".sys") !== -1) {
                                        return "ts.sys = system;";
                                    }
                                    return "sys = system;";
                                });
                            } else {
                                content = [
                                    content,
                                    "TypeScript.Environment = system;"
                                ].join("\n");
                            }
                            content = [
                                "var compilers;",
                                "if(typeof compilers===\"undefined\"){compilers = {};}",
                                "compilers[" + JSON.stringify(version) + "]=function(){",
                                content,
                                "return " + ns + ";",
                                "};"
                            ].join("\n");
                            fs.writeFile("temp/bin/" + filename, content, function (error) {
                                if (error) {
                                    displayError(error);
                                    done(false);
                                } else {
                                    next();
                                }
                            });
                        },
                        function () {
                            next();
                        }
                    ]);
                });
            },
            function () {
                console.log("-------------");
            },
            /*function (next) {
                var versionKeys = Object.keys(versions).sort();
                fs.writeFile("bin/versions.js", "*//* Allow TypeScript versions *//*\nmodule.exports = [" + versionKeys.map(function (version) { return JSON.stringify(version); }).join(", ") + "];", {encoding: "utf8"}, function (error) {
                    if (error) {
                        displayError(error);
                        done(false);
                    } else {
                        next();
                    }
                });
            },
            // clean
            function (next) {
                var remove = spawn("rm", ["-rf", "temp"]),
                    errors = [];
                remove.stdout.on("data", function (data) {
                    errors.push(data.toString("utf8"));
                });
                remove.stderr.on("data", function (data) {
                    errors.push(data.toString("utf8"));
                });
                remove.on("close", function (code) {
                    if (code !== 0) {
                        displayContent(errors.join(""));
                        done(false);
                    } else {
                        displayProperty("clean", path.join(cwd, "temp"));
                        next();
                    }
                });

            },*/
            // finish
            function () {
                done(true);
            }
        ]);
    });

    grunt.registerTask("compile", "Compile project", ["tsc:core", "concat", "wrap"]);

    grunt.registerTask("default", "Build project.", ["tsc:core", "concat", "wrap", "uglify:core", "closure-compiler"]);

};