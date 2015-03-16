class TestClass {

    constructor (...args: string[]) {
        alert(args.join(", "));
    }

}

var test = new TestClass("1", "2", "3", "string");