"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Promised = void 0;
class Promised extends Promise {
    /**
     * Constructs a new Promised<V>.
     *
     * @param executor the executor to use, optional.
     * @param dispose the disposal method for unused resolved values, optional.
     */
    constructor(executor, dispose, s) {
        super((resolve, reject) => (s = { resolve, reject }));
        this.dispose = dispose;
        const fin = () => {
            const dispose = this.dispose;
            const resolve = this.resolve = dispose && ((value) => {
                if (typeof value === "function")
                    return; // Ignore new executors
                if (value.then) // If PromiseLike, resolve the value and dispose if and handle any errors with a noop.
                    value.then(resolve, Promised.NOOP);
                else
                    dispose(value);
            }) || Promised.NOOP;
            this.finished = true;
            this.reject = Promised.NOOP;
        };
        const { resolve, reject } = s;
        const rej = this.reject = (reason) => {
            if (this.finished)
                return;
            reject(reason);
            fin();
            return true;
        };
        const res = this.resolve = (value) => {
            if (this.finished) {
                if (this.dispose && typeof value !== "function") {
                    if (value.then)
                        value.then(val => this.dispose(val));
                    else
                        this.dispose(value);
                }
                return;
            }
            if (typeof value === "function")
                try {
                    value.call(this, res, rej, () => this.finished);
                }
                catch (err) {
                    rej(err);
                }
            else if (value.then)
                value.then(res, rej);
            else {
                resolve(value);
                fin();
            }
            return true;
        };
        executor && res(executor);
    }
    then(onfulfilled, onrejected) {
        delete this.then;
        return void 0;
    }
    catch(onrejected) {
        delete this.catch;
        return void 0;
    }
    finally(onfinally) {
        delete this.finally;
        return void 0;
    }
    static get [Symbol.species]() {
        return Promise;
    }
}
exports.Promised = Promised;
Promised.NOOP = () => { };
// Hacky way to get the types to work
const PromisedPrototype = Promised.prototype;
PromisedPrototype.finally();
PromisedPrototype.catch();
PromisedPrototype.then();
//# sourceMappingURL=Promised.js.map