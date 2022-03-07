// 重写数组部分方法
let oldArrayProto = Array.prototype

export let newArrayProto = Object.create(oldArrayProto)

// 这7 个方法可以改变原来的数组
let methods = ['push', 'pop', 'shift', 'unshift', 'splice', 'reverse', 'sort']

methods.forEach(m => {
  // 函数劫持 切片编程
  newArrayProto[m] = function (...args) {
    let result = oldArrayProto[m].apply(this, args)
    let insertedArr
    let ob = this.__ob__

    switch (m) {
      case 'push':
      case 'unsift':
        insertedArr = args
        break
      case 'splice':
        insertedArr = args.slice(2)
        break
    }

    if (insertedArr) {
      ob.observeArray(insertedArr)
      console.log('数组改变，视图更新')
    }
    return result
  }
})
