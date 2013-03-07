var match = require('../lib/match');

function sync(f) {
    return function(test) {
        try {
            f(test);
        } finally {
            test.done();
        }
    };
}

exports.testNumberPass = sync(function(test) {
    test.doesNotThrow(function() {
        match(42).when(42);
    });
});

exports.testNumberFail = sync(function(test) {
    test.throws(function() {
        match(42).when(43);
    });
});

exports.testCases = sync(function(test) {
    test.equal(match(42, function(when) {
        when(1, function() { return "wrong 1" });
        when(2, function() { return "wrong 2" });
        when(3, function() { return "wrong 3" });
        when(42, function() { return "correct" });
    }), "correct");
});

exports.testFallThrough = sync(function(test) {
    test.throws(function() {
        match(42, function(when) {
            when(1, function() { return "wrong 1" });
            when(2, function() { return "wrong 2" });
            when(3, function() { return "wrong 3" });
        });
    });
});

exports.testSimpleObject = sync(function(test) {
    test.doesNotThrow(function() {
        match({ a: 42, b: "hi", c: true })
        .when({ a: match.number, b: match.string, c: match.boolean });
    });
    test.throws(function() {
        match({ a: 42, b: "hi", c: true })
        .when({ a: match.number, b: match.object, c: match.boolean });
    });
});

exports.testSimpleArray = sync(function(test) {
    test.doesNotThrow(function() {
        match([100, 200, 300, 400, 500]).when([100]);
        match([100, 200, 300, 400, 500]).when([100, 200]);
        match([100, 200, 300, 400, 500]).when([100, 200, 300]);
        match([100, 200, 300, 400, 500]).when([100, 200, 300, 400]);
        match([100, 200, 300, 400, 500]).when([100, 200, 300, 400, 500]);
    });
    test.throws(function() {
        match([100]).when([100, 200, 300, 400, 500]);
    });
    test.throws(function() {
        match([100, 200, 300, 400]).when([100, 200, 300, 400, 500]);
    });
});

exports.testNaN = sync(function(test) {
    test.doesNotThrow(function() {
        match(NaN).when(NaN);
        match(NaN).when(match.number);
    });
    test.throws(function() {
        match(0).when(NaN);
    });
    test.throws(function() {
        match(Infinity).when(NaN);
    });
    test.throws(function() {
        match("foo").when(NaN);
    });
});

exports.testRegExp = sync(function(test) {
    test.doesNotThrow(function() {
        match("anna").when(/an*a/);
    });
});

exports.testPredicate = sync(function(test) {
    test.doesNotThrow(function() {
        match([]).when(Array.isArray);
    });
    test.throws(function() {
        match("hi").when(Array.isArray);
    });
});

exports.testUndefined = sync(function(test) {
    test.doesNotThrow(function() {
        match(void 0).when(undefined);
        match(undefined).when(undefined);
        match().when(undefined);
    });
    test.throws(function() {
        match(null).when(undefined);
    });
});

exports.testNull = sync(function(test) {
    test.doesNotThrow(function() {
        match(null).when(null);
    });
    test.throws(function() {
        match(undefined).when(null);
    });
});

exports.testAny = sync(function(test) {
    test.doesNotThrow(function() {
        match(undefined).when(match.any);
        match(null).when(match.any);
        match({ foo: 1, bar: 2 }).when(match.any);
        match([ 1, 2, 3 ]).when(match.any);
        match("foo").when(match.any);
        match(true).when(match.any);
        match(false).when(match.any);
        match(1000).when(match.any);
        match(Infinity).when(match.any);
        match(-0).when(match.any);
        match(NaN).when(match.any);
        match(parseInt).when(match.any);
    });
});

exports.testVar = sync(function(test) {
    test.equal("ehrmagehrd! jervehrscrerptz",
               match({ a: "ehrmagehrd", b: "! ", c: "jervehrscrerptz" })
               .when({
                   a: match.var("a"),
                   b: match.var("b"),
                   c: match.var("c")
               }, function(vars) {
                   return vars.a + vars.b + vars.c;
               }));

    test.equal("snap crackle pop",
               match({
                   foo: {
                       bar: "snap",
                       baz: "crackle"
                   },
                   mumble: "pop"
               })
               .when({
                   foo: {
                       bar: match.var("bar"),
                       baz: match.var("baz")
                   },
                   mumble: match.var("mumble")
               }, function(vars) {
                   return [vars.bar, vars.baz, vars.mumble].join(" ");
               }));

    test.equal(42, match(42).when(match.var("x", match.number)).x);
    test.equal(42, match(42).when(match.var("x", match.number),
                                  function(vars) { return vars.x }));

    test.throws(function() {
        match(42).when(match.var("x", match.string)).x;
    });
});

exports.testRange = sync(function(test) {
    test.doesNotThrow(function() {
        match(3).when(match.range(0, 10));
        match(0).when(match.range(0, 10));
        match(9).when(match.range(0, 10));
    });
    test.throws(function() {
        match(-1).when(match.range(0, 10));
        match(10).when(match.range(0, 10));
        match(99).when(match.range(0, 10));
    });
});

exports.testAll = sync(function(test) {
    test.doesNotThrow(function() {
        match(100).when(match.all(match.number,
                                  match.integer,
                                  match.range(0, 1000),
                                  100));
        match().when(match.all());
    });
    test.throws(function() {
        match(100).when(match.all(match.number,
                                  match.integer,
                                  match.range(0, 1000),
                                  match.string));
    });
});

exports.testSome = sync(function(test) {
    test.doesNotThrow(function() {
        match("hello").when(match.some(match.string,
                                       match.number,
                                       match.boolean));
        match(100).when(match.some(match.string,
                                   match.number,
                                   match.boolean));
        match(true).when(match.some(match.string,
                                    match.number,
                                    match.boolean));
    });
    test.throws(function() {
        match({}).when(match.some(match.string,
                                  match.number,
                                  match.boolean));
        match().when(match.some());
    });
});

var MAX_INTEGER = 9007199254740991;

exports.testInteger = sync(function(test) {
    test.doesNotThrow(function() {
        match(0).when(match.integer);
        match(-0).when(match.integer);
        match(1).when(match.integer);
        match(10).when(match.integer);
        match(100).when(match.integer);
        match(1000).when(match.integer);
        match(1.0).when(match.integer);
        match(-Infinity).when(match.integer);
        match(Infinity).when(match.integer);
        match(MAX_INTEGER).when(match.integer);
        match(MAX_INTEGER + 1).when(match.integer);
        match(MAX_INTEGER + 2).when(match.integer);
        match(-MAX_INTEGER).when(match.integer);
    });
    test.throws(function() {
        match(NaN).when(match.integer);
        match(1.1).when(match.integer);
        match(11.11).when(match.integer);
        match(111.111).when(match.integer);
    });
});

exports.testInt32 = sync(function(test) {
    test.doesNotThrow(function() {
        match(0).when(match.int32);
        match(1).when(match.int32);
        match(10).when(match.int32);
        match(100).when(match.int32);
        match(1000).when(match.int32);
        match(-1).when(match.int32);
        match(-10).when(match.int32);
        match(-100).when(match.int32);
        match(-1000).when(match.int32);
        match(Math.pow(2, 31) - 1).when(match.int32);
        match(-Math.pow(2, 31)).when(match.int32);
    });
    test.throws(function() {
        match(Math.pow(2, 31)).when(match.int32);
        match(-Math.pow(2, 31) - 1).when(match.int32);
    });
});

exports.testUint32 = sync(function(test) {
    test.doesNotThrow(function() {
        match(0).when(match.uint32);
        match(1).when(match.uint32);
        match(10).when(match.uint32);
        match(100).when(match.uint32);
        match(1000).when(match.uint32);
        match(Math.pow(2, 32) - 1).when(match.uint32);
    });
    test.throws(function() {
        match(-1).when(match.uint32);
        match(-10).when(match.uint32);
        match(-100).when(match.uint32);
        match(-1000).when(match.uint32);
        match(Math.pow(2, 32)).when(match.uint32);
        match(-Math.pow(2, 31) - 1).when(match.uint32);
    });
});

exports.testFinite = sync(function(test) {
    test.doesNotThrow(function() {
        match(MAX_INTEGER).when(match.finite);
        match(Number.MAX_VALUE).when(match.finite);
        match(Number.MIN_VALUE).when(match.finite);
        match(0).when(match.finite);
        match(-0).when(match.finite);
        match(-Infinity).when(match.infinite);
        match(Infinity).when(match.infinite);
    });
    test.throws(function() {
        match(-Infinity).when(match.finite);
        match(Infinity).when(match.finite);
        match(NaN).when(match.finite);
        match(NaN).when(match.infinite);
    });
});

exports.testSigns = sync(function(test) {
    test.doesNotThrow(function() {
        match(-0).when(match.nonnegative);
        match(0).when(match.nonnegative);
        match(1).when(match.nonnegative);
        match(-1).when(match.negative);
        match(-Infinity).when(match.negative);
        match(Infinity).when(match.positive);
        match(-0).when(match.minusZero);
        match(0).when(match.plusZero);
    });
    test.throws(function() {
        match(0).when(match.positive);
        match(0).when(match.negative);
        match(-0).when(match.positive);
        match(-0).when(match.negative);
        match(-0).when(match.plusZero);
        match(0).when(match.minusZero);
    });
});

exports.testBodyThisArg = sync(function(test) {
    var obj = {
        xyzzx: "XYZZX"
    };
    test.ok(match("XYZZX", function(when) {
        when(this.xyzzx, function() { return true; });
    }, obj));
});

exports.testBodyDefaultThis = sync(function(test) {
    test.equal(global, match(1, function(when) {
        var self = this;
        when(1, function() { return self });
    }));
});

exports.testTemplateThisArg = sync(function(test) {
    var obj = {
        xyzzx: "XYZZX"
    };
    test.equal("XYZZX", match(1, function(when) {
        when(1, function() { return this.xyzzx; }, obj);
    }, { amITheGlobalObject: false }));
});

exports.testTemplateDefaultThis = sync(function(test) {
    test.equal(global, match(1, function(when) {
        when(1, function() { return this; });
    }, { amITheGlobalObject: false }));
});
