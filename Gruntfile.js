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
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks('grunt-closure-compiler');

    var ENVIRONMENT = "/usr/bin/env",
        TEMP        = path.join(cwd,  "temp"),
        TARGET      = path.join(TEMP, "target"),
        DOWNLOAD    = path.join(TEMP, "download"),
        COMPILER    = path.join(TEMP, "compiler"),
        VERSIONS    = path.join(TEMP, "versions.json"),
        RESULT      = path.join(TEMP, "result.js"),
        REPOSITORY  = "https://github.com/Microsoft/TypeScript.git";

    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        tsc: {
            options: {
                version: "latest"
            },
            all: {
                options: {},
                files: [
                    {
                        expand: false,
                        dest: "temp/typescript.js",
                        cwd: "src",
                        src: [ "*.ts", "**/*.ts" ]
                    }
                ]
            }
        },
        uglify: {
            options: {
            },
            all: {
                files: [
                    {
                        expand : false,
                        dest   : "temp/temp.js",
                        src    : [
                            "temp/typescript.js",
                            "src/Runner.js"
                        ]
                    }
                ]
            },
            result: {
                files: [
                    {
                        expand : false,
                        dest   : "temp/result.js",
                        src    : "temp/result.js"
                    }
                ]
            }
        },
        'closure-compiler': {
            result: {
                closurePath: '.',
                js: 'temp/result.js',
                jsOutputFile: 'dest/tsc.min.js',
                maxBuffer: 50000,
                options: {
                    compilation_level: 'SIMPLE_OPTIMIZATIONS',
                    language_in: 'ECMASCRIPT5_STRICT'
                }
            }
        }
    });

    grunt.registerTask("download", function () {
        var done = this.async(),
            versions = {},
            directoryExists = false,
            additionalVersion = false;
        deferred([
            function (next) {
                fs.exists(DOWNLOAD, function (exists) {
                    directoryExists = !!exists;
                    next();
                });
            },
            function (next) {
                var remove,
                    errors = [];
                if (directoryExists) {
                    remove = spawn("rm", ["-rf", DOWNLOAD]);
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
                            displayProperty("remove", DOWNLOAD);
                            next();
                        }
                    });
                } else {
                    next();
                }
            },
            function (next) {
                mkdir(DOWNLOAD, function (error) {
                    if (error) {
                        displayError(error);
                        done(false);
                    } else {
                        displayProperty("mkdir", DOWNLOAD);
                        next();
                    }
                });
            },
            function (next) {
                fs.exists(COMPILER, function (exists) {
                    directoryExists = !!exists;
                    next();
                });
            },
            function (next) {
                var remove,
                    errors = [];
                if (directoryExists) {
                    remove = spawn("rm", ["-rf", COMPILER]);
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
                            displayProperty("remove", COMPILER);
                            next();
                        }
                    });
                } else {
                    next();
                }
            },
            function (next) {
                mkdir(COMPILER, function (error) {
                    if (error) {
                        displayError(error);
                        done(false);
                    } else {
                        displayProperty("mkdir", COMPILER);
                        next();
                    }
                });
            },
            function (next) {
                var errors = [],
                    process = spawn(ENVIRONMENT, ["git", "clone", REPOSITORY, COMPILER]);
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
                        displayProperty("checkout", REPOSITORY);
                        next();
                    }
                });
            },
            function (next) {
                var errors  = [],
                    process = spawn(ENVIRONMENT, ["git", "checkout", "master"], {cwd: COMPILER});
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
                        displayProperty("switch", "master");
                        next();
                    }
                });
            },
            function (next) {
                var process = spawn(ENVIRONMENT, ["git", "pull"], {cwd: COMPILER}),
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
                        displayProperty("update", "head");
                        next();
                    }
                });
            },
            function (next) {
                var content = "",
                    process = spawn(ENVIRONMENT, ["git", "branch", "-a", "--no-color"], {cwd: COMPILER}),
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
                            if (Number(version) >= 1.1) {
                                versions[version.replace(/^(\d+\.\d+)(?:\.\d+)?$/, "$1")] = version;
                            }
                        });
                        versions.latest = "master";
                        versions.default = temp[temp.length - 2];
                        displayProperty("branches", REPOSITORY);
                        next();
                    }
                });
            },
            function (next) {
                var actions = [];
                Object.keys(versions).forEach(function (version) {
                    var branch = versions[version],
                        target = path.join(DOWNLOAD, "v" + version);
                    if (branch !== "master") {
                        branch = "release-" + branch;
                    }
                    if (["latest", "default"].indexOf(version) !== -1) {
                        target = path.join(DOWNLOAD, version);
                    }
                    actions.push(function (next) {
                        var errors = [],
                            process;
                        process = spawn(ENVIRONMENT, ["git", "checkout", branch], {cwd: COMPILER});
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
                                displayProperty("switch", branch);
                                next();
                            }
                        });
                    });
                    actions.push(function (next) {
                        var errors = [],
                            sources = path.join(COMPILER, "bin");
                        var command = spawn(ENVIRONMENT, ["cp", "-rf", sources, target]);
                        command.stdout.on("data", function (data) {
                            errors.push(data.toString("utf8"));
                        });
                        command.stderr.on("data", function (data) {
                            errors.push(data.toString("utf8"));
                        });
                        command.on("close", function (code) {
                            if (code !== 0) {
                                displayContent(errors.join(""));
                                done(false);
                            } else {
                                displayProperty("copy", target);
                                next();
                            }
                        });
                    });
                });
                actions.push(function (next) {
                    var errors = [],
                        command = spawn(ENVIRONMENT, ["rm", "-rf", COMPILER]);
                    command.stdout.on("data", function (data) {
                        errors.push(data.toString("utf8"));
                    });
                    command.stderr.on("data", function (data) {
                        errors.push(data.toString("utf8"));
                    });
                    command.on("close", function (code) {
                        if (code !== 0) {
                            displayContent(errors.join(""));
                            done(false);
                        } else {
                            next();
                        }
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
                    args    = [path.join(DOWNLOAD, "latest/tsc.js")],
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
                var command,
                    errors = [];
                if (typeOf(versions[additionalVersion]) === "undefined") {
                    command = spawn(ENVIRONMENT, ["cp", "-rf",
                        path.join(DOWNLOAD, "latest"),
                        path.join(DOWNLOAD, "v" + additionalVersion)]);
                    command.stdout.on("data", function (data) {
                        errors.push(data.toString("utf8"));
                    });
                    command.stderr.on("data", function (data) {
                        errors.push(data.toString("utf8"));
                    });
                    command.on("close", function (code) {
                        if (code !== 0) {
                            displayContent(errors.join(""));
                            done(false);
                        } else {
                            versions[additionalVersion] = "master";
                            next();
                        }
                    });
                } else {
                    next();
                }
            },
            function (next) {
                fs.writeFile(VERSIONS, JSON.stringify(versions), function (error) {
                    if (error) {
                        displayError(error);
                        done(false);
                    } else {
                        displayProperty("write", VERSIONS);
                        next();
                    }
                });
            },
            function () {
                done();
            }
        ]);
    });

    grunt.registerTask("build", function () {
        var done     = this.async(),
            versions = {};
        deferred([
            function (next) {
                fs.readFile(VERSIONS, function (error, content) {
                    if (error) {
                        displayError(error);
                        done(false);
                    } else {
                        displayProperty("read", VERSIONS);
                        versions = JSON.parse(content.toString("utf8"));
                        next();
                    }
                });
            },
            function (next) {
                var namespace,
                    actions = [],
                    result = [
                        "(function(){",
                        "var compilers=[];"
                    ];
                Object.keys(versions).forEach(function (version) {
                    var content,
                        source = path.join(DOWNLOAD, "v" + version, "tsc.js"),
                        lib = path.join(DOWNLOAD, "v" + version, "lib.d.ts");
                    if (["latest", "default"].indexOf(version) !== -1) {
                        source = path.join(DOWNLOAD, version, "tsc.js");
                        lib = path.join(DOWNLOAD, version, "lib.d.ts");
                    }
                    actions.push(function (next) {
                        fs.readFile(source, function (error, data) {
                            if (error) {
                                displayError(error);
                                done(false);
                            } else {
                                content = data.toString("utf8");
                                next();
                            }
                        });
                    });
                    actions.push(function (next) {
                        namespace = "ts";
                        if (content.indexOf("var TypeScript;") !== -1) {
                            namespace = "TypeScript";
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
                        next();
                    });
                    actions.push(function (next) {
                        fs.readFile(lib, function (error, libContent) {
                            if (error) {
                                displayError(error);
                                done(false);
                            } else {
                                content += "system.writeFile(\"lib.d.ts\", " + JSON.stringify(libContent.toString("utf8").split("\r\n")) + ".join(\"\\n\"));";
                                content = "compilers[" + JSON.stringify(version) +
                                    "]=function(){" + content + ";return " + namespace + ";};";
                                result.push(content);
                                next();
                            }
                        });
                    });
                });
                actions.push(function (next) {
                    var temp = path.join(TEMP, "temp.js");
                    fs.readFile(temp, function (error, content) {
                        if (error) {
                            displayError(error);
                            done(false);
                        } else {
                            displayProperty("read", temp);
                            result.push(content.toString("utf8"));
                            next();
                        }
                    });
                });
                actions.push(function (next) {
                    result.push(";window.tsc={configure:configure,version:function(){return config.getVersion()},",
                        "base:function(){return config.getBase()},encoding:function(){return config.getEncoding()}};}());");
                    fs.writeFile(RESULT, result.join("\n"), function (error) {
                        if (error) {
                            displayError(error);
                            done(false);
                        } else {
                            displayProperty("result", RESULT);
                            next();
                        }
                    });
                });
                actions.push(function () {
                    next();
                });
                deferred(actions);
            },
            function () {
                done();
            }
        ]);
    });

    grunt.registerTask("compile", ["tsc:all", "uglify:all", "build", "compress"]);

    grunt.registerTask("default", ["download", "compile"]);

    grunt.registerTask("compress", ["uglify:result", "closure-compiler:result"]);

};