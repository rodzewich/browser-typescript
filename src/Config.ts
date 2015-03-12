module compiler {

    export class Config {

        private encoding: string = "utf-8";

        private version: string = "default";

        private base: string = "";

        public getEncoding(): string {
            return this.encoding;
        }

        public getVersion(): string {
            return this.version;
        }

        public getBase(): string {
            return this.base;
        }

        public setEncoding(value: string): void {
            // todo: adjust it
            this.encoding = value;
        }

        public setVersion(value: string): void {
            // todo: adjust it
            this.version = value;
        }

        public setBase(value: string): void {
            // todo: adjust it
            this.base = value;
        }

    }

}