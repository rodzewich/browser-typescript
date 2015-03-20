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
    <script src="dest/tsc.min.js"></script>
    <script type="text/javascript">
        tsc.configure({
            version: "1.5",
            encoding: "utf-8",
            base: "/src/",
            debug: true
        });
        console.log("version", tsc.version());
        console.log("encoding", tsc.encoding());
        console.log("base", tsc.base());
    </script>
    <script src="test.ts" type="text/typescript"></script>
    <script src="test/src/temp/MyScript.ts" type="text/typescript"></script>
    <script type="text/typescript">
        module ns {
            export class User {
                private id: number;
                public getId(): number {
                    return this.id || 0;
                }
                public setId(id: number): void {
                    this.id = id;
                }
                constructor(id: number) {
                    this.setId(id);
                }
            }
        }
        var element: HTMLDivElement = document.createElement("div"),
            user = new ns.User(123);
    </script>
    <script type="text/javascript">
        setTimeout(function () {
            var app = new Application();
            app.getStorage();
            console.log("app", app);
        }, 0);
    </script>
</head>
<body>

</body>
</html>
```