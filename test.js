const Promise = require('./index');

const t1 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve(1, 't1');
  }, 1000);
})

// t1.then(val => {
//   console.log(val);
// })

const t2 = function () {
  const deferred = Promise.deferred();
  setTimeout(() => {
    deferred.resolve(2, 't2');
  }, 20)
  return deferred.promise;
}


// t2().finally(() => {
//   console.log(11111);
//   setTimeout(() => {
//     console.log(11111);
//   }, 900)
// }).then(val => {
//   console.log(val, 'val');
// })

// setTimeout(() => {
//   Promise.resolve(3).then(val => console.log(val, 'Promise.resolve'))
// }, 3000)

// setTimeout(() => {
//   Promise.reject(4).then().catch(e => console.log(e, 'Promise.reject'))
// }, 4000)


// Promise.all([t1, t2()]).then(values => {
//   console.log(values, 'values');
// }).catch(e => {
//   console.log(e, 'e')
// })

Promise.race([t1, t2()]).then(values => {
  console.log(values, 'values');
}).catch(e => {
  console.log(e, 'e')
})

