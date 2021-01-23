"use strict";
/// <reference types="mocha" />
Object.defineProperty(exports, "__esModule", { value: true });
try {
    require("source-map-support/register");
}
catch (e) { }
const Promised = require("..");
const util = require("util");
const noreason = {};
const errors = function (r, reason, cb) {
    if ((r instanceof Error ? r.message : r) === (reason === noreason ? undefined : reason))
        return cb();
    cb(new Error("Expected rejection with reason: " + util.inspect(reason) + " but got: " + util.inspect(r)));
};
const rejects = function (p, reason, cb) {
    p.then((val) => {
        cb(new Error("Expected rejection with reason: " + util.inspect(reason) + " but got resolve: " + util.inspect(val)));
    }).catch(r => errors(r, reason, cb));
};
const resolves = function (p, equals, cb) {
    p.then((val) => {
        if (val === equals)
            return cb();
        cb(new Error("Expected resolve with value: " + util.inspect(equals) + " but got: " + util.inspect(val)));
    }).catch((reason) => {
        cb(new Error("Expected resolve with value: " + util.inspect(equals) + " but got rejection: " + util.inspect(reason)));
    });
};
const rejectsIt = (msg, impl, reason = "This is a test") => it(msg, (cb) => rejects(impl(), reason, cb));
const resolvesIt = (msg, impl, equals = 5200) => it(msg, (cb) => resolves(impl(), equals, cb));
describe("class Promised", () => {
    describe("No Executor", () => {
        resolvesIt("Resolve immediately", () => {
            const p = new Promised;
            const r1 = p.resolve;
            const r2 = p.reject;
            p.resolve(5200);
            p.resolve(false);
            p.reject();
            r1(14832);
            r2();
            return p;
        });
        rejectsIt("Reject immediately", () => {
            const p = new Promised;
            const r1 = p.resolve;
            const r2 = p.reject;
            p.reject(new Error("This is a test"));
            p.resolve(false);
            p.reject();
            r1(14832);
            r2();
            return p;
        });
        rejectsIt("Reject immediately (No Reason)", () => {
            const p = new Promised;
            p.reject();
            p.resolve(false);
            p.reject(new Error("This is a test"));
            return p;
        }, noreason);
        resolvesIt("Resolve after 20ms", () => {
            const p = new Promised;
            setTimeout(p.resolve.bind(p, 5200), 20);
            return p;
        });
        rejectsIt("Reject immediately", () => {
            const p = new Promised;
            setTimeout(() => p.reject(new Error("This is a test")), 20);
            return p;
        });
        rejectsIt("Reject immediately (No Reason)", () => {
            const p = new Promised;
            setTimeout(p.reject.bind(p), 20);
            return p;
        }, noreason);
    });
    describe("With Executor", () => {
        rejectsIt("Executor Thrown Error", () => new Promised(() => {
            throw new Error("This is a executor test");
        }), "This is a executor test");
        resolvesIt("Resolve immediately", () => {
            const p = new Promised;
            p.resolve(5200);
            p.resolve(false);
            p.reject();
            return p;
        });
        rejectsIt("Reject immediately", () => {
            const p = new Promised;
            p.reject(new Error("This is a test"));
            p.resolve(false);
            p.reject();
            return p;
        });
        rejectsIt("Reject immediately (No Reason)", () => {
            const p = new Promised;
            p.reject();
            p.resolve(false);
            p.reject(new Error("This is a test"));
            return p;
        }, noreason);
        resolvesIt("Resolve after 20ms", () => {
            const p = new Promised;
            setTimeout(p.resolve.bind(p, 5200), 20);
            return p;
        });
        rejectsIt("Reject immediately", () => {
            const p = new Promised;
            setTimeout(() => p.reject(new Error("This is a test")), 20);
            return p;
        });
        rejectsIt("Reject immediately (No Reason)", () => {
            const p = new Promised;
            setTimeout(p.reject.bind(p), 20);
            return p;
        }, noreason);
        it("Cancel after 10ms, Execute after 20ms", (cb) => {
            let ret;
            let error;
            const p = new Promised((a, r, c) => {
                setTimeout(() => {
                    try {
                        if (c()) {
                            a(7911);
                            r();
                            if (ret) {
                                cb(new Error("Expected rejection with reason: \"Cancelled\" but got resolved: " + util.inspect(ret)));
                                return;
                            }
                            if (error instanceof Error && error.message == "Cancelled")
                                return cb();
                            cb(new Error("Expected rejection with reason: \"Cancelled\" but got: " + util.inspect(error)));
                            return;
                        }
                        cb(new Error("Executor was not cancelled?"));
                    }
                    catch (e) {
                        cb(e);
                    }
                }, 20);
            });
            setTimeout(() => p.reject(new Error("Cancelled")), 10);
            p.then((val) => {
                ret = val;
            }, (e) => {
                error = e;
            });
        });
    });
    describe("With Dispose", () => {
        let undisposed = [];
        class Disposable {
            constructor(key) {
                this.stack = (key ? key + ": " : key) + (new Error).stack;
                undisposed.push(this);
            }
            dispose() {
                const i = undisposed.indexOf(this);
                if (i > -1)
                    undisposed.splice(undisposed.indexOf(this), 1);
                else
                    throw new Error("Overdisposed: " + this.stack);
            }
            static check() {
                const count = undisposed.length;
                if (count)
                    throw new Error("Not disposed enough: " + count + " remain: " + undisposed[0].stack);
            }
        }
        it("Dispose in Constructor", (cb) => {
            const dispose = d => {
                try {
                    d.dispose();
                }
                catch (e) {
                    cb(e);
                }
            };
            let id = 0;
            const executor = a => a(new Disposable(id++));
            const promised = new Promised(executor, dispose);
            const promised2 = new Promised(null, dispose);
            const promised3 = new Promised(new Promise(executor), dispose);
            const promised4 = new Promised(new Promised(executor), dispose);
            const promised5 = new Promised(null, dispose);
            for (let promise of [promised, promised2, promised3, promised4]) {
                promise.then(d => {
                    try {
                        d.dispose();
                    }
                    catch (e) {
                        cb(e);
                    }
                }).catch(cb);
            }
            promised5.then(d => {
                cb(new Error("Value returned, when none should have"));
            }).catch(err => errors(err, "Some reason", cb));
            const promisedresolve = promised.resolve;
            const promised2resolve = promised.resolve;
            const promised3resolve = promised3.resolve;
            const promised4resolve = promised4.resolve;
            const promised5resolve = promised5.resolve;
            promisedresolve.id = 1;
            promised2resolve.id = 2;
            promised3resolve.id = 3;
            promised4resolve.id = 4;
            const reject = promised5.reject;
            reject("Some reason");
            reject();
            setImmediate(() => {
                for (let resolve of [promisedresolve, promised2resolve,
                    promised3resolve, promised4resolve, promised5resolve]) {
                    resolve(executor);
                    resolve(new Disposable("2-" + resolve.id));
                    resolve(new Promise(a => a(new Disposable("3-" + resolve.id))));
                    resolve(new Promised(new Disposable("4-" + resolve.id))); // Undocumented behaviour
                }
            });
            setTimeout(() => {
                try {
                    Disposable.check();
                    cb();
                }
                catch (e) {
                    cb(e);
                }
            }, 50);
        });
    });
});
//# sourceMappingURL=tests.js.map