const stateArr = ["pending", "fulfilled", "rejected"];

class MyPromise {
    constructor(callback) {
        this.state = stateArr[0]; // 当前状体
        this.value = null; // 完成时的返回值
        this.reason = null; // 失败的原因
        callback(this.resolve, this.reject);
    }

    resolve = (value) => {
        // 只有从 pending 到 fulfilled
        if (this.state === stateArr[0]) {
            this.state = stateArr[1]; // pending -> fulfilled
            this.value = value;
        }
    };
    reject = (reason) => {
        if (this.state === stateArr[0]) {
            this.state = stateArr[2]; // pending -> rejected
            this.reason = reason;
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

        // it must be called after promise is fulfilled,
        if (this.state === stateArr[1]) {
            // 当前状态时 fulfilled 的时候
            return new MyPromise((resolve, reject) => {
                try {
                    //  with promise’s value as its first argument.
                    const result = onFulfilled(this.value);
                    // onFulfilled 或者 onRejected 会返回一个值 x（x 可能是普通值，也可能是一个 Promise），x 会被递归处理，如果是普通值则直接 resolve，如果是 Promise 则会调用 then 方法进行处理。取值的过程中如果出错，需要进行 reject 处理。
                    // ------ Note: 这里并没有实现递归的处理 x 这个值 ------
                    // ------ Note: 这里并没有实现递归的处理 x 这个值 ------
                    // ------ Note: 这里并没有实现递归的处理 x 这个值 ------
                    if (result instanceof MyPromise) {
                        result.then(resolve, reject);
                    } else {
                        resolve(result);
                    }
                } catch (error) {
                    reject(error);
                }
            });
        }

        if (this.state === stateArr[2]) {
            // 当前状态时 rejected 的时候
            return new MyPromise((resolve, reject) => {
                try {
                    const result = onRejected(this.reason);
                    if (result instanceof MyPromise) {
                        result.then(resolve, reject);
                    } else {
                        resolve(result);
                    }
                } catch (error) {
                    reject(error);
                }
            });
        }

        return new MyPromise();
    };
}

const promise1 = new MyPromise((resolve, reject) => {
    resolve("123");
    reject(456);
});

// 注意：此时还不是异步的，所以打印输出的结果是先 then 里的，再打印 promise1
const promise2 = promise1.then(
    (value) => {
        console.log("then", value);
    },
    (reason) => {
        console.log("reason", reason);
    }
);

console.log(promise1);
