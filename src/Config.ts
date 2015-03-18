declare var compilers: any;

module compiler {

    export enum OutputType {
        STDOUT, STDERR, BUFFER
    }

    export class Config {

        private outputType: OutputType = OutputType.STDOUT;

        private encoding: string = "utf-8";

        private version: string = "default";

        private base: string = "";

        private debug: boolean = false;

        private implicitAny: boolean = true;

        public getImplicitAny(): boolean {
            return !!this.implicitAny;
        }

        public isImplicitAny(): boolean {
            return this.getImplicitAny();
        }

        public setImplicitAny(value: boolean): void {
            this.implicitAny = !!value;
        }

        public getDebug(): boolean {
            return !!this.debug;
        }

        public isDebug(): boolean {
            return this.getDebug();
        }

        public getOutputType(): OutputType {
            return this.outputType;
        }

        public getEncoding(): string {
            return this.encoding;
        }

        public getVersion(): string {
            return this.version;
        }

        public getBase(): string {
            return this.base;
        }

        public setDebug(value: boolean): void {
            this.debug = !!value;
        }

        public setOutputType(value: OutputType): void {
            this.outputType = value;
        }

        public setEncoding(value: string): void {
            // todo: adjust it
            this.encoding = value;
        }

        public setVersion(value: string): void {
            var temp: string = String(value || "");
            if (typeof compilers[temp] === "undefined") {
                throw new Error("Version don't exists");
            }
            this.version = value;
        }

        public setBase(value: string): void {
            // todo: adjust it
            this.base = value;
        }

    }

}