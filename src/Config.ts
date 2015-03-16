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