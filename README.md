## pattern-match

A pattern matching DSL for JavaScript. The module is a function that
takes an arbitrary JavaScript value and tests it against a
*pattern*. If the match succeeds, the result is a *sub-match object*,
which consists of the sub-components of the value that matched named
sub-patterns (using the `var` pattern). If the match fails, a
`MatchError` is thrown.

## Usage

Here's a simple example of using pattern matching to analyze an AST
for a hypothetical language:

```javascript
var match = require('pattern-match');

match(ast, function(when) {
    when({
        type: 'FunctionCall',
        callee: match.var('callee'),
        args: match.var('args')
    }, function(vars) {
        this.analyzeFunctionCall(vars.callee, vars.args);
    }, this);

    when({
        type: 'Assignment',
        lhs: match.var('lhs'),
        rhs: match.var('rhs')
    }, function(vars) {
        this.analyzeAssignment(vars.lhs, vars.rhs);
    }, this);

    when({
        type: 'Return',
        arg: match.var('arg')
    }, function(vars) {
        this.analyzeReturn(vars.arg);
    }, this);
}, this);
```

This will get sweeter in ES6 with destructuring:

```javascript
var match = require('pattern-match');

match(ast, function(when) {
    when({
        type: 'FunctionCall',
        callee: match.var('callee'),
        args: match.var('args')
    }, function({ callee, args }) {
        this.analyzeFunctionCall(callee, args);
    }, this);

    when({
        type: 'Assignment',
        lhs: match.var('lhs'),
        rhs: match.var('rhs')
    }, function({ lhs, rhs }) {
        this.analyzeAssignment(lhs, rhs);
    }, this);

    when({
        type: 'Return',
        arg: match.var('arg')
    }, function({ arg }) {
        this.analyzeReturn(arg);
    }, this);
}, this);
```

And sweeter still with ES6 arrow-functions:

```javascript
var match = require('pattern-match');

match(ast, (when) => {
    when({
        type: 'FunctionCall',
        callee: match.var('callee'),
        args: match.var('args')
    }, ({ callee, args }) => {
        this.analyzeFunctionCall(callee, args);
    });

    when({
        type: 'Assignment',
        lhs: match.var('lhs'),
        rhs: match.var('rhs')
    }, ({ lhs, rhs }) => {
        this.analyzeAssignment(lhs, rhs);
    });

    when({
        type: 'Return',
        arg: match.var('arg')
    }, ({ arg }) => {
        this.analyzeReturn(arg);
    });
});
```


## API

### Entry points

  * **match(x, body[, thisArg])**

Match `x` against a sequence of patterns, returning the result of the
first successful match. The cases are provided by the `body` function:

  * **body.call(thisArg, when)**

Provides the cases by calling `when` in the order the cases should be
tried. The library calls `body` with the `thisArg` provided to `match`
as the binding of `this`.

  * **when(pattern[, template[, thisArg]])**

Provides the next case, consisting of a pattern an optional
template. If matching the pattern succeeds, the result is passed to
`template` with `thisArg` bound to `this` (defaults to the global
object). If `template` is not provided, this case produces the
sub-match object.

  * **match(x).when(pattern[, template[, thisArg]])**

Match `x` against a single pattern. Returns the result of calling
`template` on the sub-match object with `thisArg` (or the global
object by default) as the binding of `this`. If `template` is not
provided, returns the sub-match object.


### Patterns

  * **match.any** - matches any value.
  * **match.primitive** - matches any primitive (non-object) value.
  * **match.object** - matches any non-null object.
  * **match.array** - matches anything `Array.isArray` matches.
  * **match.function** - assumes the pattern is a boolean-valued function and matches any value for which the function returns true.
  * **match.null** - matches the `null` value.
  * **match.undefined** - matches the `undefined` value.
  * **match.boolean** - matches any boolean value.
  * **match.number** - matches any number value.
  * **match.int32** - matches any integral number value in the range [-2^31, 2^31).
  * **match.uint32** - matches any integral number value in the range [0, 2^32).
  * **match.integer** - matches any integral number value, including -Infinity and Infinity.
  * **match.finite** - matches any number value other than NaN, -Infinity, and Infinity.
  * **match.infinite** - matches -Infinity and Infinity.
  * **match.negative** - matches any number less than 0.
  * **match.positive** - matches any number greater than 0.
  * **match.nonnegative** - matches any number greater than or equal to 0 (including -0, which most of the time should just be considered 0).
  * **match.plusZero** - matches only +0 (and not -0). *If you don't know if you need this, don't use it.*
  * **match.minusZero** - matches only -0 (and not +0). *If you don't know if you need this, don't use it.*
  * **match.range(low, high)** - matches any number value in the half-open range [`low`, `high`).
  * **match.string** - matches any string value.
  * **match.var(name[, pattern])** - matches the `pattern` (defaults to `any`) and saves the value in the sub-match object with property name `name`.
  * **match.all(pattern, ...)** - matches if every `pattern` matches.
  * **match.some(pattern, ...)** - matches if one `pattern` matches.
  * **pred(testValue)** - matches any value for which `pred` returns a truthy value.
  * **{ x1: pattern1, ..., xn: patternn }** - matches any object with property names `x1` to `xn` matching patterns `pattern1` to `patternn`, respectively. Only the own properties of the pattern are used.
  * **[ pattern0, ..., patternn ]** - matches any object with property names 0 to n matching patterns `pattern0` to `patternn`, respectively.

### Custom patterns

You can create custom patterns by extending the root pattern prototype.

  * **match.pattern** - the root pattern prototype.

### Match errors

  * **match.MatchError** - an object extending `Error` that represents a failed pattern-match.
      * **e.expected** - the expected pattern.
      * **e.actual** - the actual value tested.
