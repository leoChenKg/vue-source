import { newArrayProto } from './array'
class Observer {
  constructor(data) {
    // 给数据加了一个标识，表示被劫持过了，并搞成不可枚举的，防止 walk  执行时死循环
    Object.defineProperty(data, '__ob__', { enumerable: false, value: this })
    if (Array.isArray(data)) {
      // 如果数据是数组
      this.observeArray(data)
      // 处理数组的劫持问题，重写部分方法
      Object.setPrototypeOf(data, newArrayProto)
    } else {
      // Object.defineProperty 只能劫持对象中已经存在的属性
      this.walk(data)
    }
  }

  // 循环对象，对属性依次劫持
  walk(data) {
    Object.keys(data).forEach(key => defineReactive(data, key, data[key]))
  }

  observeArray(data) {
    // 递归劫持数组中的项，只劫持对象，数组单独处理
    data.forEach(item => observe(item))
  }
}

// 数据劫持功能的函数
export function defineReactive(target, key, value) {
  // 如果当前值是对象则 继续递归劫持其属性
  observe(value)
  // 劫持数据
  Object.defineProperty(target, key, {
    get() {
      console.log('获取值')
      return value
    },
    set(newVal) {
      if (newVal === value) return
      console.log('数据改变了，去更新页面！')
      observe(newVal)
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
  if (data.__ob__ instanceof Observer) {
    // 数据已经被代理过了
    return data.__ob__
  }
  return new Observer(data)
}
