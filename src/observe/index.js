class Observer {
  constructor(data) {
    // Object.defineProperty 只能劫持对象中已经存在的属性
    this.walk(data)
    window.data = data
  }

  // 循环对象，对属性依次劫持
  walk(data) {
    Object.keys(data).forEach(key => defineReactive(data, key, data[key]))
  }
}

// 数据劫持功能的函数
export function defineReactive(target, key, value) {
  // 如果当前值是对象则 继续递归劫持其属性
  observe(value)
  // 劫持数据
  Object.defineProperty(target, key, {
    get() {
      return value
    },
    set(newVal) {
      if (newVal === value) return
      console.log('数据改变了，去更新页面！')
      value = newVal
    }
  })
}

export default function observe(data) {
  // 数据劫持

  if (typeof data !== 'object' || data == null) {
    return // 不是对象并进行数据劫持
  }

  // 一个对象只需要劫持一次，判断对象是否被劫持过，可以添加一个实例，用实例来判断是否被劫持过
  
  return new Observer(data)
}
