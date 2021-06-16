const Promise = require('./index');

const t1 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve(1, 't1');
  }, 1000);
})

t1.then(val => {
  console.log(val);
})

const t2 = function () {
  const deferred = Promise.deferred();
  setTimeout(() => {
    deferred.resolve(2, 't2');
  }, 2000)
  return deferred.promise;
}

t2().then(val => {
  console.log(val);
})

setTimeout(() => {
  Promise.resolve(3).then(val => console.log(val, 'Promise.resolve'))
}, 3000)

setTimeout(() => {
  Promise.reject(4).then().catch(e => console.log(e, 'Promise.reject'))
}, 4000)

