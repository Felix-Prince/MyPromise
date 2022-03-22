const STATE_MAP = {
    PENDING: "pending",
    FULFILLED: "fulfilled",
    REJECTED: "rejected",
};

const resolvePromise = (promise, value, resolve, reject) => {
    if (promise === value) {
        return reject(new TypeError("不能循环引用"));
    }

    // 如果 value 是一个 promise
    // 或者是一个 thenable 的对象,一个有 then 方法的对象 { then : (value) => { console.log(value) } }
    if (
        value !== null &&
        (typeof value === "object" || typeof value === "function")
    ) {
        let called = false;
        try {
            let then = value.then;
            if (typeof then === "function") {
                then.call(
                    value,
                    (val) => {
                        if (called) return;
                        called = true;
                        resolvePromise(value, val, resolve, reject);
                    },
                    (reason) => {
                        if (called) return;
                        called = true;
                        reject(reason);
                    }
                );
            } else {
                resolve(value);
            }
        } catch (error) {
            if (called) return;
            called = true;
            reject(error);
        }
    } else {
        resolve(value);
    }
};

class MyPromise {
    constructor(callback) {
        this.state = STATE_MAP.PENDING; // 当前状体
        this.value = null; // 完成时的返回值
        this.reason = null; // 失败的原因
        this.resolveArr = []; // 记录所有的 resolve 方法再状态变为 fulfilled 后遍历这些方法
        this.rejectArr = []; // 再状态变为 rejected 后执行
        callback(this.resolve, this.reject);
    }

    resolve = (value) => {
        // 只有从 pending 到 fulfilled
        if (this.state === STATE_MAP.PENDING) {
            this.state = STATE_MAP.FULFILLED; // pending -> fulfilled
            this.value = value;

            // 循环执行 then 已插入的 resolve 方法
            this.resolveArr.forEach((fn) => fn(value));
        }
    };
    reject = (reason) => {
        if (this.state === STATE_MAP.PENDING) {
            this.state = STATE_MAP.REJECTED; // pending -> rejected
            this.reason = reason;

            this.rejectArr.forEach((fn) => fn(reason));
        }
    };

    then = (onFulfilled, onRejected) => {
        // 判断 onFulfilled / onRejected 是否是函数
        // onFulfilled and onRejected must be called as functions
        // If onFulfilled is not a function and promise1 is fulfilled, promise2 must be fulfilled with the same value as promise1.
        onFulfilled =
            typeof onFulfilled === "function" ? onFulfilled : (value) => value;
        onRejected =
            typeof onRejected === "function" ? onRejected : (reason) => reason;

        // In practice, this requirement ensures that onFulfilled and onRejected execute asynchronously,
        const promiseX = new MyPromise((resolve, reject) => {
            // 当还是 pending  的时候
            if (this.state === STATE_MAP.PENDING) {
                this.resolveArr.push((value) => {
                    setTimeout(() => {
                        try {
                            const result = onFulfilled(value);
                            resolvePromise(promiseX, result, resolve, reject);
                        } catch (error) {
                            reject(error);
                        }
                    }, 0);
                });

                this.rejectArr.push((reason) => {
                    setTimeout(() => {
                        try {
                            const result = onRejected(reason);
                            resolvePromise(promiseX, result, resolve, reject);
                        } catch (error) {
                            reject(error);
                        }
                    }, 0);
                });
            }

            // it must be called after promise is fulfilled,
            if (this.state === STATE_MAP.FULFILLED) {
                // 当前状态时 fulfilled 的时候
                setTimeout(() => {
                    try {
                        //  with promise’s value as its first argument.
                        const result = onFulfilled(this.value);
                        // onFulfilled 或者 onRejected 会返回一个值 x（x 可能是普通值，也可能是一个 Promise），x 会被递归处理，如果是普通值则直接 resolve，如果是 Promise 则会调用 then 方法进行处理。取值的过程中如果出错，需要进行 reject 处理。
                        resolvePromise(promiseX, result, resolve, reject);
                    } catch (error) {
                        reject(error);
                    }
                }, 0);
            }

            if (this.state === STATE_MAP.REJECTED) {
                // 当前状态时 rejected 的时候
                setTimeout(() => {
                    try {
                        const result = onRejected(this.reason);
                        resolvePromise(promiseX, result, resolve, reject);
                    } catch (error) {
                        reject(error);
                    }
                }, 0);
            }
        });

        return promiseX;
    };
}

const promise1 = new MyPromise((resolve) => {
    console.log("---1----");
    resolve("123");
});

// const promise1 = new MyPromise((resolve, reject) => {
//     resolve("123");
//     reject(456);
// });

// 注意：此时还不是异步的，所以打印输出的结果是先 then 里的，再打印 promise1
const promise2 = promise1.then(
    (value) => {
        console.log("---3---", value);
    },
    (reason) => {
        console.log("reason", reason);
    }
);

console.log("---2----");
