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
