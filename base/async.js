function after(callback) {
  let data = {};
  return (flag, value) => {
    data = { ...data, ...value };
    if (flag) return callback(data)
  }
}

const finish = after(data => {
  console.log(data);
})

setTimeout(() => {
  finish(true, { a: 'a' })
}, 1000)

setTimeout(() => {
  finish(true, { b: 'b', c: 'c' })
}, 2000)