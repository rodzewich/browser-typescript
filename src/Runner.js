/*global window, compiler, compilers, ts */

// todo: rename to *.ts file

var configured = false,
    allowConfigure = true,
    config = new compiler.Config(),
    system = new compiler.System(),
    contentTypes = [
        "text/typescript"
    ];

// todo: delete it
window.system = system;

/**
 * @param {object} options
 * @param {string} options.encoding
 * @param {string} options.version
 * @param {string} options.base
 * @param {string} options.debug
 * @param {string} options.implicitAny
 * @return {void}
 */
function configure(options) {
    if (configured) {
        throw new Error("Environment already configured");
    }
    if (!allowConfigure) {
        throw new Error("Runtime configuration not supported");
    }
    if (options && options.encoding !== undefined) {
        config.setEncoding(options.encoding);
    }
    if (options && options.version !== undefined) {
        config.setVersion(options.version);
    }
    if (options && options.base !== undefined) {
        config.setBase(options.base);
    }
    if (options && options.debug !== undefined) {
        config.setDebug(options.debug);
    }
    if (options && options.implicitAny !== undefined) {
        config.setImplicitAny(options.implicitAny);
    }
    configured = true;
}

/**
 * @param {string} path
 * @return {string}
 */
function compileFile(path) {
    var tsc = compilers[config.getVersion()]();
    var time;
    if (config.isDebug()) {
        time = Number(new Date());
    }
    allowConfigure = false;
    var source = String(path || "").replace(/^https?:\/\/[^\/]+/, ""),
        target = source + ".js";
    var args = [source];

    if (!config.isImplicitAny()) {
        args.push("--noImplicitAny");
    }
    args.push("--sourceMap");
    args.push("--target", "ES3");
    args.push("--out", target);

    config.setOutputType(compiler.OutputType.STDERR);
    tsc.executeCommandLine(args);
    config.setOutputType(compiler.OutputType.STDOUT);

    // todo check errors
    if (system.fileExists(target)) {
        if (system.fileExists(target + ".map")) {
            system.writeFile(target, system.readFile(target).replace(/\n\/\/# sourceMappingURL=.*/, "\n//# sourceMappingURL=data:application/json;base64," + encode64(system.readFile(target + ".map"))));
        }

        eval.call(null, system.readFile(target));
    }
    if (config.isDebug()) {
        console.log("%s", "time: " + String((Number(new Date()) - time) / 1000));
    }
}

/**
 * @param {string} body
 * @return {string}
 */
function compileBody(body) {
    allowConfigure = false;
    var tsc = compilers[config.getVersion()](),
        filename = Number(new Date()).toString(32),
        source = "temp-" + filename + ".ts",
        target = "temp-" + filename + ".js",
        args = [source],
        buffer;
    system.writeFile(source, body);

    if (!config.isImplicitAny()) {
        args.push("--noImplicitAny");
    }
    args.push("--target", "ES3");
    args.push("--out", target);

    config.setOutputType(compiler.OutputType.BUFFER);
    tsc.executeCommandLine(args);
    config.setOutputType(compiler.OutputType.STDOUT);

    buffer = system.getBuffer();
    // todo check errors
    if (system.fileExists(source) && buffer.length === 0) {
        eval.call(null, system.readFile(target));
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

var keyStr = "ABCDEFGHIJKLMNOP" +
    "QRSTUVWXYZabcdef" +
    "ghijklmnopqrstuv" +
    "wxyz0123456789+/" +
    "=";


function encode64(input) {
    //input = escape(input);
    var output = "";
    var chr1, chr2, chr3 = "";
    var enc1, enc2, enc3, enc4 = "";
    var i = 0;

    do {
        chr1 = input.charCodeAt(i++);
        chr2 = input.charCodeAt(i++);
        chr3 = input.charCodeAt(i++);

        enc1 = chr1 >> 2;
        enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
        enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
        enc4 = chr3 & 63;

        if (isNaN(chr2)) {
            enc3 = enc4 = 64;
        } else if (isNaN(chr3)) {
            enc4 = 64;
        }

        output = output +
        keyStr.charAt(enc1) +
        keyStr.charAt(enc2) +
        keyStr.charAt(enc3) +
        keyStr.charAt(enc4);
        chr1 = chr2 = chr3 = "";
        enc1 = enc2 = enc3 = enc4 = "";
    } while (i < input.length);

    return output;
}

if (window.addEventListener) {
    window.addEventListener("DOMContentLoaded", apply, false);
} else {
    window.attachEvent("onload", apply);
}