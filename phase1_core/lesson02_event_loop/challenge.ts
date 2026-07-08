console.log("1: 同步开始")

setTimeout(() => {
  console.log("2: setTimeout")
}, 0)

Promise.resolve().then(() => {
  console.log("3: 微任务")
})

process.nextTick(() => {
  console.log("4: nextTick")
})

console.log("5: 同步结束")
