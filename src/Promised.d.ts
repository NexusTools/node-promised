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
export declare class Promised<V> extends Promise<V> {
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
    constructor(executor?: PromiseLike<V> | Executor<V>, dispose?: Dispose<V>, s?: ResolveRejectStorage);
    then<TResult1 = V, TResult2 = never>(onfulfilled?: (value: V) => TResult1 | PromiseLike<TResult1>, onrejected?: (reason: any) => TResult2 | PromiseLike<TResult2>): Promised<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: (reason: any) => TResult | PromiseLike<TResult>): Promised<V | TResult>;
    finally(onfinally?: () => void): Promised<V>;
    static get [Symbol.species](): PromiseConstructor;
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
    static readonly NOOP: () => void;
}
export {};
