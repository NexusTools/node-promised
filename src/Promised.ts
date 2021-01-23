interface Executor<V> {
  (this: Promised<V>, resolve: Resolve<V>, reject: Reject, finished: () => boolean): void;
}

interface Reject {
  /**
   * Reject and optionally specify why.
   *
   * @param reason the reason for the rejection
   * @returns true if a reject can still be done (!this.finished), nothing (false) otherwise.
   */
  (reason?: any): true | void;
}

interface Resolve<V> {
  /**
   * Resolves a value, or another promise to continue.
   *
   * @param value the resolved value
   * @returns true if resolved (!this.finished), undefined otherwise.
   */
  (value: V | PromiseLike<V> | Executor<V>): true | void;
}

interface Dispose<V> {
  /**
   * Disposes of a value, safely.
   *
   * @param value the value to dispose
   */
  (value: V): void;
}

interface ResolveRejectStorage {
  resolve: (value: any) => void;
  reject: (reason: any) => void;
}

export class Promised<V> extends Promise<V> {
  /**
   * Whether or not this Promised has finished (resolved or rejected).
  **/
  readonly finished: boolean;

  /**
   * Constructs a new Promised<V>.
   *
   * @param executor the executor to use, optional.
   * @param dispose the disposal method for unused resolved values, optional.
   */
  constructor(executor?: PromiseLike<V> | Executor<V>, dispose?: Dispose<V>, s?: ResolveRejectStorage) {
    super((resolve, reject) => (s = { resolve, reject }));

    this.dispose = dispose;
    const fin = () => {
      const dispose = this.dispose;
      const resolve = this.resolve = dispose && ((value) => {
        if(typeof value === "function") return; // Ignore new executors
        if((value as PromiseLike<V>).then) // If PromiseLike, resolve the value and dispose if and handle any errors with a noop.
          (value as PromiseLike<V>).then(resolve as any, Promised.NOOP);
        else dispose(value as any);
      }) || Promised.NOOP;
      (this as any).finished = true;
      this.reject = Promised.NOOP;
    }

    const { resolve, reject } = s;
    const rej = this.reject = (reason?: any) => {
      if(this.finished) return;

      reject(reason);
      fin();

      return true;
    };
    const res = this.resolve = (value: V | PromiseLike<V> | Executor<V>): void | true => {
      if(this.finished) {
        if(this.dispose && typeof value !== "function") {
          if((value as PromiseLike<V>).then)
            (value as PromiseLike<V>).then(val => this.dispose(val));
          else
            this.dispose(value as V);
        }
        return;
      }

      if(typeof value === "function")
        try {
          (value as Executor<V>).call(this, res, rej, () => this.finished);
        } catch(err) {
          rej(err);
        }
      else if((value as PromiseLike<V>).then)
        (value as PromiseLike<V>).then(res, rej);
      else {
        resolve(value);
        fin();
      }

      return true;
    };

    executor && res(executor);
  }


  then<TResult1 = V, TResult2 = never>(onfulfilled?: (value: V) => TResult1 | PromiseLike<TResult1>, onrejected?: (reason: any) => TResult2 | PromiseLike<TResult2>): Promised<TResult1 | TResult2>{
    delete this.then;
    return void 0;
  }
  catch<TResult = never>(onrejected?: (reason: any) => TResult | PromiseLike<TResult>): Promised<V | TResult>{
    delete this.catch;
    return void 0;
  }
  finally(onfinally?: () => void): Promised<V>{
    delete this.finally;
    return void 0;
  }

  static get [Symbol.species]() {
    return Promise;
  }

  /**
   * Optional method used to dispose of unused resolved values.
   **/
  dispose?: Dispose<V>;

  /**
   * Resolves a value, or another promise to continue.
   *
   * @param value the resolved value
   * @returns true if resolved (!this.finished), undefined otherwise.
   */
  resolve: Resolve<V>;

  /**
   * Reject and optionally specify why.
   *
   * @param reason the reason for the rejection
   * @returns true if a reject can still be done (!this.finished), nothing (false) otherwise.
   */
  reject: Reject;

  static readonly NOOP = () => {};
}

// Hacky way to get the types to work
const PromisedPrototype = Promised.prototype;
PromisedPrototype.finally();
PromisedPrototype.catch();
PromisedPrototype.then();
