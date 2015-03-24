```
#####################################################################################

                                  .ed"""" """$$$$be.
                                -"           ^""**$$$e.
                              ."                   '$$$c
                             /                      "4$$b
                            d  3                     $$$$
                            $  *                   .$$$$$$
                           .$  ^c           $$$$$e$$$$$$$$.
                           d$L  4.         4$$$$$$$$$$$$$$b
                           $$$$b ^ceeeee.  4$$ECL.F*$$$$$$$
               e$""=.      $$$$P d$$$$F $ $$$$$$$$$- $$$$$$
              z$$b. ^c     3$$$F "$$$$b   $"$$$$$$$  $$$$*"      .=""$c
             4$$$$L   \     $$P"  "$$b   .$ $$$$$...e$$        .=  e$$$.
             ^*$$$$$c  %..   *c    ..    $$ 3$$$$$$$$$$eF     zP  d$$$$$
               "**$$$ec   "\   %ce""    $$$  $$$$$$$$$$*    .r" =$$$$P""
                     "*$b.  "c  *$e.    *** d$$$$$"L$$    .d"  e$$***"
                       ^*$$c ^$c $$$      4J$$$$$% $$$ .e*".eeP"
                          "$$$$$$"'$=e....$*$$**$cz$$" "..d$*"
                            "*$$$  *=%4.$ L L$ P3$$$F $$$P"
                               "$   "%*ebJLzb$e$$$$$b $P"
                                 %..      4$$$$$$$$$$ "
                                  $$$e   z$$$$$$$$$$%
                                   "*$c  "$$$$$$$P"
                                    ."""*$$$$$$$$bc
                                 .-"    .$***$$$"""*e.
                              .-"    .e$"     "*$c  ^*b.
                       .=*""""    .e$*"          "*bc  "*$e..
                     .$"        .z*"               ^*$e.   "*****e.
                     $$ee$c   .d"                     "*$.        3.
                     ^*$E")$..$"                         *   .ee==d%
                        $.d$$$*                           *  J$$$e*
                         """""                             "$$$"

#####################################################################################
```

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
        /// <reference path="Application.ts" />
        var app: IApplication = new Application(); // <-- use class from prev downloads
        app.start();
    </script>
</head>
<body>
</body>
</html>
```