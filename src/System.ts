/// <reference path="./Config.ts" />

declare var config: compiler.Config;

module compiler {

    function xhr(path: string): string {
        var request: XMLHttpRequest = new XMLHttpRequest();
        request.open('GET', path, false);
        request.send(null);
        if (request.status === 200) {
            return String(request.responseText || "");
        }
        return null;
    }

    export class System {

        private buffer: string[] = [];

        private files: any = {};

        private directories: string[] = [];

        public args: string[] = [];

        public newLine: string = "\n";

        public useCaseSensitiveFileNames: boolean = true;

        public write(content: string): void {
            if (config.getOutputType() === OutputType.BUFFER) {
                this.buffer.push(content);
            } else if (config.getOutputType() === OutputType.STDOUT) {
                console.log('%s', content);
            } else if (config.getOutputType() === OutputType.STDERR) {
                console.log('%c %s', 'color: red', content);
            }
        }

        public getBuffer(): string[] {
            var buffer: string[] = this.buffer;
            this.buffer = [];
            return buffer;
        }

        public readFile(filename: string, encoding?: string): string {
            var temp: string = this.resolvePath(filename),
                content: string;
            if (typeof this.files[temp] === "string") {
                return this.files[temp];
            }
            if (this.files[temp] === false) {
                return undefined;
            }
            content = xhr(temp);
            if (content === null) {
                this.files[temp] = false;
                return undefined;
            }
            this.files[temp] = content;
            return content;
        }

        public writeFile(filename: string, data: string): void {
            this.files[String(filename || "")] = String(data || "");
        }

        public watchFile (filename: string, callback: (fileName: string) => void): ts.FileWatcher {
            return null;
        }

        public resolvePath(path: string): string {
            console.log("resolvePath:", path);
            // todo: adjust it
            return String(path || "");
        }

        public fileExists(path: string): boolean {
            return this.readFile(path) !== undefined;
        }

        public directoryExists(path: string): boolean {
            return this.directories.indexOf(path) !== -1;
        }

        public createDirectory(path: string): void {
            var temp: string = String(path || "");
            if (!this.directoryExists(temp)) {
                this.directories.push(temp);
            }
        }

        public getExecutingFilePath(): string {
            return "tsc.js";
        }

        public getCurrentDirectory(): string {
            var currentLocation: string = window.location.pathname.split("/").slice(0, -1).join("/"),
                baseLocation: string = config.getBase();
            // todo: adjust it
            return currentLocation;
        }

        public readDirectory(path: string, extension?: string): string[] {
            var result: string[] = [],
                temp: string = this.resolvePath(String(path || "")),
                index: number,
                length = this.directories.length,
                filename: string;
            if (temp.slice(-1) !== "/") {
                temp = temp + "/";
            }
            for (filename in this.files) {
                if (!this.files.hasOwnProperty(filename)) {
                    continue;
                }
                if (this.files[filename].indexOf(path) === 0) {
                    if (typeof extension === "string" && extension) {
                        if (filename.substr(filename.length - extension.length, extension.length) === extension) {
                            result.push(filename);
                        }
                    } else {
                        result.push(filename);
                    }
                }
            }
            for (index = 0; index < length; index++) {
                if (this.directories[index].indexOf(temp) === 0) {
                    result.push(this.directories[index]);
                }
            }
            return result;
        }

        public getMemoryUsage (): number { return 0; }

        public exit(code?: number): void {}

    }

}