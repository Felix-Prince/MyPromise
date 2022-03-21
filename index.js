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
}

const promise = new MyPromise((resolve, reject) => {
    resolve("123");
    reject(456);
});

console.log(promise);
