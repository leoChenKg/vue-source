import Dep from './dep'

let id = 0 // watcher 的 id

// 创建渲染 watcher 时，会把当前的渲染 watcher 放到 Dep.target 上，
// 接下来执行 _render 函数生成虚拟 dom 在解析成真实dom 的过程中，数据属性被获取将触发 getter 时，把此 watcher 放入 dep 的 watcher 对列中，
// 当该属性设置值的时候就 把 dep 中的watcher拿出来查重新执行渲染函数，让页面更新
class Watcher {
  constructor(vm, fn, options) {
    // 传入 vm ，代表该 watcher 管理 此 vm
    // fn 为渲染函数
    this.id = id++
    this.renderWatcher = options // 标识是不是一个 渲染 watcher
    this.getter = fn // getter 调用会发生取值操作 fn 是 ()=> {vm._update(vm._render)}
    this.deps = [] // 记录 dep 的目的 比如说：组件卸载时，让 dep 不再收集 watcher，计算属性时可能需要
    this.depsIds = new Set() // set 去重
    this.get()
  }
  addDep(dep) {
    // 一个 watcher 对应多个属性，属性也不要重复
    let id = dep.id
    if (!this.depsIds.has(id)) {
      this.deps.push(dep)
      this.depsIds.add(id)
      dep.addSub(this)
    }
  }
  get() {
    console.log('更新！！！！')
    Dep.target = this // 当前的渲染 watcher 放到全局 Dep 上
    this.getter() // 会执行 render 函数 去 vm 上取值。然后再更新界面
    Dep.target = null // 渲染完毕后清空
  }

  update() {
    // this.get()
    queueWather(this) // 把当前的 watcher 传入存起来，异步更新
  }
}

// 异步更新 方案一
let queue = []
let has = {}
let padding = false
function queueWather(watcher) {
  let id = watcher.id
  if (has[id] === undefined) {
    queue.push(watcher)
    has[id] = watcher.id

    if (!padding) {
      padding = true
      Promise.resolve().then(() => queue.forEach(watcher => watcher.get()))
    }
  }
}

// 异步更新 方案二
// function queueWather(watcher) {
//   if (!watcher.isUpdate) {
//     watcher.isUpdate = true
//     Promise.resolve().then(() => {
//       watcher.get()
//       watcher.isUpdate = false
//     })
//   }
// }

// 需要给每个属性增加一个 dep，收集 watcher
// 一个组件中有n个属性--》 n个dep对应一个 watcher 一个组件一个 watcher
// 一个属性可以对用多个组件  ---> 1 个 dep 可以对应多个 watcher
// dep 和 watcher 是多对多的关系 ，一个 dep 可以对应多个watcher；一个 watcher 中又对应着多个 dep
export default Watcher
