**generic-exceptions** provides some generic exception classes and useful methods to check and handle some typical programming errors.

[![Build Status](https://travis-ci.org/amekusa/generic-exceptions.svg?branch=master)](https://travis-ci.org/amekusa/generic-exceptions) [![codecov](https://codecov.io/gh/amekusa/generic-exceptions/branch/master/graph/badge.svg)](https://codecov.io/gh/amekusa/generic-exceptions) [![npm](https://img.shields.io/badge/dynamic/json?label=npm&query=%24%5B%27dist-tags%27%5D%5B%27latest%27%5D&url=https%3A%2F%2Fregistry.npmjs.org%2Fgeneric-exceptions%2F)](https://www.npmjs.com/package/generic-exceptions)

## Getting Started
Install via NPM:
```sh
npm i generic-exceptions
```

Then, `require()` the exception classes that you want to use:

```js
const { <ExceptionClass>, ... } = require('generic-exceptions');
```

##### Available Exceptions (v1.0.0+):

- `InvalidType`
- `Exception`

## APIs

### Exception

`Exception` class is the base class of all the other exceptions. That means every exception basically derives the methods and the properties from `Exception` class. Also `Exception` is a subclass of [Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error).

#### constructor ( msg[, info] )

Set any type of value to `info` and you can access it as `.info` property.

```js
// Example
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

Returns the option value by `name`. If `value` is provided, sets the value to the option.  
You can customize the default behavior of `Exception` by changing the option values.

Available options:

- `handler` : If you set a function, it will be called when `.trigger()` is called. The argument is the exception instance.

```js
// Excample
Exception.option('handler', e => {
  console.error(e.message);
});
new Exception('error').trigger(); // This doesn't throw because of the handler
```

---

#### static .reset ( )

Resets all the options to the initial states.

---

#### static .check ( value[, expected] )

Checks if the `value` is **truthy**. If it's not, **triggers** an `Exception` instance.
If `expected` is provided, checks if `value === expected`, and triggers an `Exception` instance if the condition is false. Otherwise, returns `value`.

The triggered exception holds `value` and `expected` as `.info.checked` and `.info.expected`.

```js
// Example
try {
  Exception.check(1);      // OK
  Exception.check(1, '1'); // Fails
} catch (e) {
  console.error(e.info); // { checked: 1, expected: '1' }
}
```

---

### InvalidType

`InvalidType` is the exception for type checking.

#### constructor ( [msg[,  info]] )

If you set `null` or `false` to `msg`, the default message will be set.

---

#### static .check ( value, expectedType )

Checks if the type of `value` matches for `expectedType`. If it doesn't match, triggers an `InvalidType` exception instance. Otherwise, returns `value`.

The triggered exception holds `value` and `expectedType` as `.info.checked` and `.info.expectedType`.
And the actual type is stored in `.info.actualType`.

```js
// Example
try {
  InvalidType.check('ABC', 'string'); // OK
  InvalidType.check(42, 'string');    // Fails
} catch (e) {
	console.error(e.info);
  // { checked:42,  expectedType:'string',  actualType:'number' }
}
```

You can also check an object's class by passing a **class constructor**:

```js
var obj = new String();
InvalidType.check(obj, String); // OK
var arr = [];
InvalidType.check(arr, Array); // OK
```

Additionally, `InvalidType` supports some special type keywords that can be used as `expectedType`:

|     type keyword | description                                            |
| ---------------: | :----------------------------------------------------- |
|       `iterable` | Matches for iterable objects like `Array`, `Map`, etc. |
| `int`, `integer` | Matches only for integer numbers.                      |
|           `bool` | Alias of `boolean`                                     |

---

&copy; 2020 [Satoshi Soma](https://amekusa.com)

