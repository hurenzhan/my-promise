const PENDING = 'PENDING'; // 默认等待态
const FULFILLED = 'FULFILLED'; // 成功态 
const REJECTED = 'REJECTED'; // 失败态

/**
 *
 * @description 我们还需要考虑 result 可能是别人的promise
 * 1.如果 result 是一个普通值 则直接调用resolve即可
 * 2.如果 result 是一个promise那么应该采用这个promise的状态 决定调用的是 resolve还是reject
 * @param {*} result
 * @param {Promise} newPromise
 * @param {Function} resolve
 * @param {Function} reject
 */
function resolvePromise(result, newPromise, resolve, reject) {

  if (result === newPromise) return reject(new TypeError('循环引用'))

  // 继续判断 result 是不是一个promise，promise 需要有then方法，别人写的 promise 可能是个函数
  // 需要不停的解析成功的promise中返回的成功值，直到这个值是一个普通值
  if ((typeof result === 'object' && result !== null) || (typeof result === 'function')) {
    // 继续判断 result 是否有 then
    let called = false; // promise 的成功和失败只能调一次
    try {
      const then = result.then; // 尝试取then方法
      // 如果是函数，认为他是promise
      if (typeof then === 'function') {
        then.call(result, nextResult => { // nextResult 有可能还是一个 promise ，所以要再次进行解析流程
          if (called) return;
          called = true;
          resolvePromise(nextResult, newPromise, resolve, reject)
        }, e => {
          if (called) return;
          called = true
          reject(e);
        })
      } else {
        resolve(result);
      }
    } catch (e) { // 取then的时候报错了，直接抛出异常
      if (called) return;
      called = true
      reject(e);
    }
  } else {
    resolve(result) // result 是一个普通值
  }
}

/**
 * @description 符合Promise/A+规范的异步处理方法
 * @class Promise
 */
class Promise {
  constructor(executor) {
    this.status = PENDING;
    this.value = undefined;
    this.reason = undefined;
    // 待执行成功态方法列表
    this.onResolvedCallbacks = [];
    // 待执行失败态方法列表
    this.onRejectedCallbacks = [];

    // 遍历执行成功列表方法
    const resolve = value => {
      if (value instanceof Promise) {
        return value.then(resolve, reject); // === resolvePromise
      }
      if (this.status === PENDING) {
        this.value = value;
        this.status = FULFILLED;
        this.onResolvedCallbacks.forEach(fn => fn())
      }
    }

    // 遍历执行失败列表方法
    const reject = reason => {
      this.reason = reason;
      this.status = REJECTED;
      this.onRejectedCallbacks.forEach(fn => fn())
    }

    try {
      executor(resolve, reject);
    } catch (e) {
      reject(e);
    }
  }

  then(onFulfilled, onRejected) {
    // 如果传入的函数不是一个函数，让它变成一个函数
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : v => v;
    onRejected = typeof onRejected === 'function' ? onRejected : e => {
      throw e
    };

    // 每次调用then方法 都必须返回一个全新的promise
    const newPromise = new Promise((resolve, reject) => {

      if (this.status === FULFILLED) {
        setTimeout(() => {
          try {
            const fulfillResult = onFulfilled(this.value);
            resolvePromise(fulfillResult, newPromise, resolve, reject);
          } catch (e) {
            reject(e);
          }
        })
      }

      if (this.status === REJECTED) {
        setTimeout(() => {
          try {
            const rejectResult = onRejected(this.reason);
            resolvePromise(rejectResult, newPromise, resolve, reject);
          } catch (e) {
            reject(e);
          }
        });
      }

      if (this.status === PENDING) {
        this.onResolvedCallbacks.push(() => {
          setTimeout(() => {
            try {
              const fulfillResult = onFulfilled(this.value);
              resolvePromise(fulfillResult, newPromise, resolve, reject);
            } catch (e) {
              reject(e);
            }
          })
        })

        this.onRejectedCallbacks.push(() => {
          setTimeout(() => {
            try {
              const rejectResult = onRejected(this.reason);
              resolvePromise(rejectResult, newPromise, resolve, reject);
            } catch (e) {
              reject(e);
            }
          }, 0);
        })
      }
    })

    return newPromise;
  }

  catch(fn) {
    return this.then(null, fn);
  }

  finally(cb) {
    // 内部执行then，把结果存起来
    return this.then(prevData =>
      // 新实例化一个promise，执行成功态并在里面执行传入函数，并把存起来的结果执行then返回出去
      Promise.resolve(cb()).then(x => prevData),
      // 失败也直接走成功态然后，抛出异常
      // cb执行一旦报错 就直接跳过后续的then的逻辑，直接将错误向下传递
      e => Promise.resolve(cb()).then(() => { throw e })
    )
  }

  static resolve(value) {
    return new Promise((resolve) => {
      resolve(value);
    })
  }

  static reject(e) {
    return new Promise((resolve, reject) => {
      reject(e);
    })
  }

}

Promise.deferred = function () {
  const dfd = {};
  dfd.promise = new Promise((resolve, reject) => {
    dfd.resolve = resolve;
    dfd.reject = reject;
  })

  return dfd;
}

Promise.all = function (promises) {
  return new Promise((resolve, reject) => {
    const results = []; // 记录所有结果，因为有顺序问题，用数组下标形式
    let index = 0;
    // 拿到所有结果再返回
    const process = (i, data) => {
      results[i] = data;
      if (++index === promises.length) {
        resolve(results);
      }
    }
    // 循环调用所有promise
    promises.forEach((item, i) => {
      if (item && typeof item.then === 'function') {
        item.then(data => {
          process(i, data);
        }, reject)  // 如果有一个失败就直接执行失败逻辑
      } else {
        process(i, item)  // 不是函数当同步直接返回
      }
    })
  })
}

Promise.race = function (promises) {
  return new Promise((resolve, reject) => {
    for (let promise of promises) {
      if (promise && typeof promise.then === 'function') {
        promise.then(resolve, reject);
      } else {
        resolve(promise);
      }
    }
  })
}

module.exports = Promise;