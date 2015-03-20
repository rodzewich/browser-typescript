module foo {

    export class User {

        private id: number = null;

        constructor(id: number) {
            this.setId(id);
        }

        public getId(): number {
            return this.id;
        }

        public setId(id: number): void {
            this.id = id;
        }

    }

}