[![Package Version](https://img.shields.io/npm/v/@nexustools/promised.svg)](https://www.npmjs.org/package/@nexustools/promised) [![Build Status](https://travis-ci.org/NexusTools/node-promised.svg)](https://travis-ci.org/NexusTools/node-promised) [![Coverage Status](https://img.shields.io/coveralls/NexusTools/node-promised.svg)](https://coveralls.io/r/NexusTools/node-promised?branch=master) [![Apache License 2.0](http://img.shields.io/hexpm/l/plug.svg)](http://www.apache.org/licenses/LICENSE-2.0.html)

@nexustools/promised
--------------------
An extension to Promise that removes the executor requirement, is much more versatile, and adds .reject and .accept methods.

Install
-------
```bash
npm install @nexustools/promised
```

API
---
```typescript
export = class Promised<V> extends Promise<V> {
  constructor(executor?: PromiseLike<V> | ((this: Promised<V>, resolve: Promised.Resolve<V>, reject: Promised.Reject, finished: () => boolean) => void), dispose?: (value: V) => void): Promised<V>;

  /**
   * Method used to dispose of unused resolved values.
   **/
  dispose: (value: V) => void;

  /**
   * Whether or not this Promised has finished (resolved or rejected).
  **/
  readonly finished: boolean;

  /**
   * Resolves a value, or another promise to continue.
   *
   * @returns true if resolved (!this.finished), undefined otherwise.
   */
  resolve(value: V | PromiseLike<V> | ((this: Promised<V>, resolve: Promised.Resolve<V>, reject: Promised.Reject, finished: () => boolean) => void)): void | true;

  /**
   * Reject and optionally specify why.
   *
   * @returns true if a reject can still be done (!this.finished), nothing (false) otherwise.
   */
  reject(reason?: any): void | true;
}
```

Usage
-----
```typescript
import Promised = require("@nexustools/promised");

let promised = new Promised(/* Optionally specify an executor, or another promise here */);

promised.despite = (value) => {
  // Handle values which resolve, after finish
};

promised.resolve(value); // Resolve
promised.reject(reason); // Reject

promised.then((val) => {
  // Handle resolve
}).catch((reason) => {
  // Handle reject
}).finally(() => {
  // Handle either
});
```

license
-------
Licensed under [Apache License 2.0](LICENSE.md)
