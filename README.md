# commmit 1

## 初始化项目 & 简单完成状态的转换

# commit 2

## 简单实现了 promise 的 then

遗留 TODO 项

-   递归处理 onFulfilled 和 onRejected 的返回的 x
-   onFulfilled 和 onRejected 是一个异步的操作

# commit 3

## 处理 resolve 中异步的情况

```js
const promise1 = new MyPromise((resolve, reject) => {
    setTimeout(() => {
        console.log("---setTimeout--");
        resolve("123");
    }, 2000);
});
```

如果像上面这样处理后，resolve 是一个 异步的操作，导致再执行到 then 的时候，我们的状态还是 pending 的，也就不会执行到对应的 then 判断里，一次我们还需要处理一下异步的情况
