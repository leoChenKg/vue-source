import observe from './observe/index'
export default function initState(vm) {
  const opts = vm.$options
  if (opts.data) {
    initData(vm)
  }
}
// 处理 options 上的 data
function initData(vm) {
  let data = vm.$options.data // data 可能是函数也可能是对象
  data = typeof data === 'function' ? data.call(this) : data

  // 在 Vue 实实力上加入 _data 属性其值就是 data
  vm._data = data
  // 把 vm._data.xxx  代理成 vm.xxx
  proxy(vm, vm._data)
  // 劫持数据
  observe(data)
}

// 把 vm._data.xxx  代理成 vm.xxx
function proxy(from, target) {
  Object.keys(target).forEach(key => {
    Object.defineProperty(from, key, {
      get() {
        return target[key]
      },
      set(newVal) {
        target[key] = newVal
      }
    })
  })
}
