/// <reference path="deps1.ts" />
/// <reference path="deps2.ts" />
/// <reference path="deps3.ts" />
/// <reference path="deps4.ts" />

class TestClass {

    constructor (...args: string[]) {
        var elements: number[] = [deps1, deps2, deps3, deps4];
        alert(elements.join(", "));
    }

}

class Application {

    constructor() {
        throw new Error("bla bla bla");
    }

    public getStorage(): any {
        return null;
    }

}
