**generic-exceptions** provides some generic exception classes and useful methods to check and handle some typical programming errors.

[![Build Status](https://travis-ci.org/amekusa/generic-exceptions.svg?branch=master)](https://travis-ci.org/amekusa/generic-exceptions) [![codecov](https://codecov.io/gh/amekusa/generic-exceptions/branch/master/graph/badge.svg)](https://codecov.io/gh/amekusa/generic-exceptions) [![npm](https://img.shields.io/badge/dynamic/json?label=npm%0Apackage&query=%24%5B%27dist-tags%27%5D%5B%27latest%27%5D&url=https%3A%2F%2Fregistry.npmjs.org%2Fgeneric-exceptions%2F)](https://www.npmjs.com/package/generic-exceptions)

[📘 Documentations](https://amekusa.github.io/generic-exceptions/latest/)


| Version | Changes |
|--------:|:--------|
| 3.0.0 | <ul><li>Moved some basic features of `Exception` to the new class: `InvalidValue`</li> <li>New feature: formatting the message</li></ul> |
| 2.0.0 | New exception class: `NoSuchProp` |
| 1.3.0 | Supported multiple expectations for `.check()` |

## Getting Started

Install via NPM:
```sh
npm i generic-exceptions
```

Then, `require()` the exception classes that you want to use:

```js
const { <ExceptionClass>, ... } = require('generic-exceptions');
```

##### Available Exceptions (v3.0.0+):

- `NoSuchProp`
- `InvalidType`
- `InvalidValue`
- `Exception`

## APIs

Here is a small summary of APIs in generic-exceptions.
The full documentations are here: https://amekusa.github.io/generic-exceptions/latest/

---

### class Exception

`Exception` class is the base class of all the other exceptions. That means every exception basically derives the methods and the properties from this class. Also `Exception` is a subclass of [Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error).

#### constructor ( msg[, info] )

Assign any type of value to `info` and you can access it as `.info` property.

```js
try {
  throw new Exception('error', { reason: 'unknown' });
} catch (e) {
  console.error(e.info.reason); // 'unknown'
}
```

---

#### .trigger ( )

Throws the instance if `handler` option ( explained later ) is not set.

---

#### static .option ( name[, value] )

Returns the option value by `name`. If `value` is provided, assigns the value to the option instead of returning it.  
You can customize the default behavior of `Exception` at some level by changing the option values.

##### Available options:

| Name | Type | Description |
|-----:|:-----|:------------|
| `handler` | function | Runs when `trigger()` is called. Receives the triggered exception instance as the argument |

```js
Exception.option('handler', e => {
  console.error(e.message);
});
new Exception('error').trigger(); // This doesn't throw because of the handler
```

---

### class InvalidType

Thrown to indicate that the type of a value isn't expected.

---

#### static .check ( value, expected[, ... ] )

Checks if the type of `value` matches with `expected`. If it doesn't match, triggers an `InvalidType` exception instance. Otherwise, just returns `value`.

The triggered exception holds `value` and `expected` as `.info.checked` and `.info.expected`.
And the actual type is stored in `.info.actual`.

```js
var X = 'ABC';
try {
  InvalidType.check(X, 'string'); // OK
  InvalidType.check(X, 'number'); // Throws
} catch (e) {
  console.error(e.info);
  // { checked:'ABC',  expected:'number',  actual:'string' }
}
```

Multiple expectations are also supported:

```js
var X = 'ABC';
try {
  InvalidType.check(X, 'number', 'string');  // OK    (expects: number OR string)
  InvalidType.check(X, 'boolean', 'object'); // Fails (expects: boolean OR object)
} catch (e) {
  console.error(e.info);
  // { checked:'ABC',  expected:['boolean', 'object'],  actual:'string' }
}
```

`.expects()` method is useful for checking what type is expected for:

```js
var X = 'ABC';
var expectations = ['boolean', 'object'];
try {
  InvalidType.check(X, ...expectations); // Fails
} catch (e) {
  if (e.expects('boolean')) { ... } // true
  if (e.expects('object')) { ... }  // true
  if (e.expects('number')) { ... }  // false
}
```

You can also check an object's class by passing a **class constructor**:

```js
var obj = new String();
InvalidType.check(obj, String); // OK
var arr = [];
InvalidType.check(arr, Array); // OK
```

Additionally, `InvalidType` supports some special type keywords that can be passed to `expected` :

|     Type Keyword | Description                                            |
| ---------------: | :----------------------------------------------------- |
|       `iterable` | Matches for iterable objects like `Array`, `Map`, etc. |
| `int`, `integer` | Matches only for integer numbers.                      |
|           `bool` | Alias of `boolean`                                     |

---

## Author
[Satoshi Soma](https://amekusa.com)
