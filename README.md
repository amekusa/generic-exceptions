[![Build Status](https://travis-ci.org/amekusa/generic-exceptions.svg?branch=master)](https://travis-ci.org/amekusa/generic-exceptions) [![codecov](https://codecov.io/gh/amekusa/generic-exceptions/branch/master/graph/badge.svg)](https://codecov.io/gh/amekusa/generic-exceptions)

**generic-exceptions** provides some generic exception classes and useful methods to check and handle some typical programming errors.

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

##### constructor ( msg[, info] )

Set any type of value to `info` and you can access it as `.info` property.

```js
// Example
try {
  throw new Exception('error', { reason: 'unknown' });
} catch(e) {
  console.error(e.info.reason); // 'unknown'
}
```

##### .trigger ( )

Throws the instance if `handler` option ( explained later ) is not set.

##### static .option ( name[, value] )

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

##### static .reset ( )

Resets all the options to the initial states.

##### static .check ( value[, expected] )

Checks if the `value` is **truthy**. If it's not, **triggers** an `Exception` instance.
If `expected` is provided, checks if `value === expected`, and triggers an `Exception` instance if the condition is false. Otherwise, `value` is returned.

The returned exception holds `value` and `expected` as `.info.checked` and `.info.expected` for convenience.

```js
// Example
try {
  Exception.check(1);      // OK
  Exception.check(1, '1'); // Failed
} catch(e) {
  console.error(e.info); // { checked: 1, expected: '1' }
}
```


---

&copy; 2020 [Satoshi Soma](https://amekusa.com)

