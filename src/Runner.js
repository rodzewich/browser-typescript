/*global window, compiler, ts */

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
    console.log("compile file: ", path);
}

/**
 * @param {string} body
 * @return {string}
 */
function compileBody(body) {
    console.log("compile body: ", body);
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
                eval(compileFile(elements[index].src));
            } else {
                eval(compileBody(elements[index].innerHTML));
            }
        }
    }
}

if (window.addEventListener) {
    window.addEventListener("DOMContentLoaded", apply, false);
} else {
    window.attachEvent("onload", apply);
}

ts.sys = system;