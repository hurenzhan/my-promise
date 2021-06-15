// 根据参数的个数 转化成n个函数

/**
 * @name 函数柯里化
 * @description 根据参数的个数 转化成n个函数
 * @param {Function} fn
 * @return {Function} 
 */
function curring(fn) {
  const inner = (args = []) => {  // 第一次执行初始化参数存储
    return args.length >= fn.length ?
      fn(...args) : // 参数长度等于目标函数参数长度，直接执行函数
      (...arr) => inner([...args, ...arr])  // 每传一次参数就存储一次
  }
  return inner();
}

function sum(a, b, c, d) {
  return a + b + c + d;
}

// const fn = curring(sum)
// const fn1 = fn(1)
// const fn2 = fn1(2, 3)
// const result = fn2(4);
// console.log(result);

function isType(type, val) {
  return Object.prototype.toString.call(val) === `[object ${type}]`
}

const fn = curring(isType)
const result = fn('String')(1)
console.log(result);