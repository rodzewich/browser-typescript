/// <reference path="../User.ts" />

module foo.bar {

    export class MyScript {

        userId: number = null;

        constructor(userId: number) {
            console.log("create instance");
            this.userId = userId;
        }

        public getUser(): foo.User {
            return new foo.User(this.userId);
        }

        public static createInstance(userId: number): MyScript {
            return new MyScript(userId);
        }

    }

}