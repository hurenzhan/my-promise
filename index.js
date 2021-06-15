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
    onRejected = typeof onRejected === 'function' ? onRejected : e => { throw e };

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
    })
  }
}

/**
 *
 * @description 我们还需要考虑 fulfillResult 可能是别人家的promise
 * @param {*} fulfillResult
 * @param {Promise} newPromise
 * @param {Function} resolve
 * @param {Function} reject
 */
function resolvePromise(fulfillResult, newPromise, resolve, reject) {

  if (fulfillResult === newPromise) return reject(new TypeError('循环引用'))

  // 继续判断 fulfillResult 是不是一个promise  promsise需要有then方法，别人写的 promise 可能是个函数
  if ((typeof x === 'object' && x !== null) || (typeof x === 'function')) {
    //继续判断 fulfillResult 是否有 then
    let called = false;

    try {
      const then = fulfillResult.then; // 尝试取then方法 
    } catch (e) {
      // 如果是函数，认为他是promise
      if (typeof then === 'function') {

      }

    }
  }
}