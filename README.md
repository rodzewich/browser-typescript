# browser-typescript

Compile and run TypeScript files in browser. The project is created to simplify
the development of projects on TypeScript, and intended to create development
only of the browser.

**WARNING:**

This tool only for developments, don't use it for production. Because tool used
sync ajax queries for downloads TypeScript files, and is hard to download, and
also do compile runtime in browser.

**EXAMPLE:**

```html
<html>
<head>
    <!-- include library -->
    <script src="dest/tsc.min.js"></script>
    <!-- set compiler settings -->
    <script type="text/javascript">
        tsc.configure({
            version: "1.5",    // allow: "1.1", "1.3", "1.4", "1.5", "default"(1.3), "latest"(1.5)
            encoding: "utf-8", // source file encoding, not used
            base: "/src/",     // source file based, not used
            debug: true        // enable debug mode
        });
    </script>
    <!-- include TypeScript file, enable source mapping -->
    <script src="example/app.ts" type="text/typescript"></script>
    <!-- runtime used, enable source mapping in future -->
    <script type="text/typescript">
        /// <reference path="IApplication.ts" />
        var app: IApplication = new Application(); // <-- use class from prev downloads
        app.start();
    </script>
</head>
<body>
</body>
</html>
```