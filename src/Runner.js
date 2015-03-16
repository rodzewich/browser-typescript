/*global window, compiler, compilers, ts */

// todo: rename to *.ts file

var config = new compiler.Config(),
    system = new compiler.System(),
    contentTypes = [
        "text/typescript"
    ];

/**
 * @param {object} options
 * @param {string} options.encoding
 * @param {string} options.version
 * @param {string} options.base
 * @return {void}
 */
function configure(options) {
    if (options && options.encoding !== undefined) {
        config.setEncoding(options.encoding);
    }
    if (options && options.version !== undefined) {
        config.setVersion(options.version);
    }
    if (options && options.base !== undefined) {
        config.setBase(options.base);
    }
}

/**
 * @param {string} path
 * @return {string}
 */
function compileFile(path) {
    var tsc = compilers[config.getVersion()];
    config.setOutputType(compiler.OutputType.STDERR);
    tsc.executeCommandLine([
        String(path || "").replace(/^https?:\/\/[^\/]+/, ""),
        "--out", "output.js"
    ]);
    config.setOutputType(compiler.OutputType.STDOUT);
    // todo check errors
    if (system.fileExists("output.js")) {
        eval(system.readFile("output.js"));
    }
}

/**
 * @param {string} body
 * @return {string}
 */
function compileBody(body) {
    var tsc = compilers[config.getVersion()],
        filename = Number(new Date()).toString(32),
        buffer,
        input = filename + ".ts",
        output = filename + ".js";
    system.writeFile(input, body);
    config.setOutputType(compiler.OutputType.BUFFER);
    tsc.executeCommandLine([
        input,
        "--out", output
    ]);
    config.setOutputType(compiler.OutputType.STDOUT);
    buffer = system.getBuffer();
    // todo check errors
    if (system.fileExists(output) && buffer.length === 0) {
        eval(system.readFile(output));
    } else {
        console.log("%c %s", "color: red", buffer.join("\n"));
    }
}

/**
 * @return {void}
 */
function apply() {
    var index,
        elements = window.document.getElementsByTagName('script'),
        length = elements.length;
    for (index = 0; index < length; index += 1) {
        if (contentTypes.indexOf(elements[index].type) !== -1) {
            if (elements[index].src) {
                compileFile(elements[index].src);
            } else {
                compileBody(elements[index].innerHTML);
            }
        }
    }
}

if (window.addEventListener) {
    window.addEventListener("DOMContentLoaded", apply, false);
} else {
    window.attachEvent("onload", apply);
}