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
        match(42).as(42);
    });
});

exports.testNumberFail = sync(function(test) {
    test.throws(function() {
        match(42).as(43);
    });
});

exports.testCases = sync(function(test) {
    test.equal(match(42).cases(function(when) {
        when(1, function() { return "wrong 1" });
        when(2, function() { return "wrong 2" });
        when(3, function() { return "wrong 3" });
        when(42, function() { return "correct" });
    }), "correct");
});

exports.testFallThrough = sync(function(test) {
    test.throws(function() {
        match(42).cases(function(when) {
            when(1, function() { return "wrong 1" });
            when(2, function() { return "wrong 2" });
            when(3, function() { return "wrong 3" });
        });
    });
});

exports.testSimpleObject = sync(function(test) {
    test.doesNotThrow(function() {
        match({ a: 42, b: "hi", c: true }).as({
            a: match.number,
            b: match.string,
            c: match.boolean
        });
    });
    test.throws(function() {
        match({ a: 42, b: "hi", c: true }).as({
            a: match.number,
            b: match.object,
            c: match.boolean
        });
    });
});

exports.testSimpleArray = sync(function(test) {
    test.doesNotThrow(function() {
        match([100, 200, 300, 400, 500]).as([100]);
        match([100, 200, 300, 400, 500]).as([100, 200]);
        match([100, 200, 300, 400, 500]).as([100, 200, 300]);
        match([100, 200, 300, 400, 500]).as([100, 200, 300, 400]);
        match([100, 200, 300, 400, 500]).as([100, 200, 300, 400, 500]);
    });
    test.throws(function() {
        match([100]).as([100, 200, 300, 400, 500]);
    });
    test.throws(function() {
        match([100, 200, 300, 400]).as([100, 200, 300, 400, 500]);
    });
});

exports.testNaN = sync(function(test) {
    test.doesNotThrow(function() {
        match(NaN).as(NaN);
        match(NaN).as(match.number);
    });
    test.throws(function() {
        match(0).as(NaN);
    });
    test.throws(function() {
        match(Infinity).as(NaN);
    });
    test.throws(function() {
        match("foo").as(NaN);
    });
});

exports.testRegExp = sync(function(test) {
    test.doesNotThrow(function() {
        match("anna").as(/an*a/);
    });
});

exports.testPredicate = sync(function(test) {
    test.doesNotThrow(function() {
        match([]).as(Array.isArray);
    });
    test.throws(function() {
        match("hi").as(Array.isArray);
    });
});

exports.testUndefined = sync(function(test) {
    test.doesNotThrow(function() {
        match(void 0).as(undefined);
        match(undefined).as(undefined);
        match().as(undefined);
    });
    test.throws(function() {
        match(null).as(undefined);
    });
});

exports.testNull = sync(function(test) {
    test.doesNotThrow(function() {
        match(null).as(null);
    });
    test.throws(function() {
        match(undefined).as(null);
    });
});

exports.testAny = sync(function(test) {
    test.doesNotThrow(function() {
        match(undefined).as(match.any);
        match(null).as(match.any);
        match({ foo: 1, bar: 2 }).as(match.any);
        match([ 1, 2, 3 ]).as(match.any);
        match("foo").as(match.any);
        match(true).as(match.any);
        match(false).as(match.any);
        match(1000).as(match.any);
        match(Infinity).as(match.any);
        match(-0).as(match.any);
        match(NaN).as(match.any);
        match(parseInt).as(match.any);
    });
});

exports.testVar = sync(function(test) {
    test.equal("ehrmagehrd! jervehrscrerptz", match({ a: "ehrmagehrd", b: "! ", c: "jervehrscrerptz" }).as({
        a: match.var("a"),
        b: match.var("b"),
        c: match.var("c")
    }, function(vars) {
        return vars.a + vars.b + vars.c;
    }));

    test.equal("snap crackle pop", match({
        foo: {
            bar: "snap",
            baz: "crackle"
        },
        mumble: "pop"
    }).as({
        foo: {
            bar: match.var("bar"),
            baz: match.var("baz")
        },
        mumble: match.var("mumble")
    }, function(vars) {
        return [vars.bar, vars.baz, vars.mumble].join(" ");
    }));

    test.equal(42, match(42).as(match.var("x", match.number),
                                function(vars) { return vars.x }));

    test.throws(function() {
        match(42).as(match.var("x", match.string),
                     function(vars) { return vars.x });
    });
});
