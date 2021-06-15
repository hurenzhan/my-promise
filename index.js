const PENDING = 'PENDING'; // 默认等待态
const FULFILLED = 'FULFILLED'; // 成功态 
const REJECTED = 'REJECTED'; // 失败态

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
      if (this.status === PENDING) {
        this.value = value;
        this.status = FULFILLED;
        this.onResolvedCallbacks.forEach(fn => fn())
      }
    }

    // 遍历执行失败列表方法
    const reject = reason => {
      this.reason = reason;
      this.status = FULFILLED;
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
            let fulfillResult = onFulfilled(this.value);
            resolvePromise(fulfillResult, newPromise, resolve, reject);
          } catch (e) {
            reject(e);
          }
        })
      }

      if (this.status === REJECTED) {
        setTimeout(() => {
          try {
            let rejectResult = onRejected(this.reason);
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
              let rejectResult = onRejected(this.reason);
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
}

/**
 *
 * @description 我们还需要考虑 fulfillResult 可能是别人的promise
 * 1.如果 fulfillResult 是一个普通值 则直接调用resolve即可
 * 2.如果 fulfillResult 是一个promise那么应该采用这个promise的状态 决定调用的是 resolve还是reject
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
        then.call(result, nextResult => { // nextFulfillResult 有可能还是一个 promise ，所以要再次进行解析流程
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

module.exports = Promise;