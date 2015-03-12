/// <reference path="../node_modules/grunt-tsc/bin/latest/typescript_internal.d.ts" />

module compiler {

    export class System implements ts.System {

        private files: any = {};

        private directories: any = {};

        public args: string[] = [];

        public newLine: string = "\n";

        public useCaseSensitiveFileNames: boolean = true;

        public write(s: string): void {
            console.log("write:", s);
        }

        public readFile(fileName: string, encoding?: string): string {
            console.log("readFile:", fileName);
            var temp: string = this.resolvePath(fileName);
            if (!temp) {
                return undefined;
            }
            if (typeof this.files[temp] !== "undefined") {
                if (typeof this.files[temp] !== "string") {
                    return this.files[temp];
                }
                return undefined;
            }

            return null;
        }

        public writeFile(fileName: string, data: string, writeByteOrderMark?: boolean): void {
            console.log("writeFile:", fileName);
            // todo: adjust it
        }

        public watchFile (fileName: string, callback: (fileName: string) => void): ts.FileWatcher {
            return null;
        }

        public resolvePath(path: string): string {
            console.log("resolvePath:", path);
            // todo: adjust it
            return null;
        }

        public fileExists(path: string): boolean {
            console.log("fileExists:", path);
            // todo: adjust it
            return null;
        }

        public directoryExists(path: string): boolean {
            console.log("directoryExists:", path);
            // todo: adjust it
            return null;
        }

        public createDirectory(directoryName: string): void {
            console.log("createDirectory:", directoryName);
            // todo: adjust it
            return null;
        }

        public getExecutingFilePath(): string {
            console.log("getExecutingFilePath:");
            // todo: adjust it
            return null;
        }

        public getCurrentDirectory(): string {
            console.log("getCurrentDirectory:");
            // todo: adjust it
            return null;
        }

        public readDirectory(path: string, extension?: string): string[] {
            console.log("getCurrentDirectory:");
            // todo: adjust it
            return null;
        }

        public getMemoryUsage (): number {
            return 0;
        }

        public exit(exitCode?: number): void {
            // todo: adjust it
            return null;
        }

    }

}