import Watcher, { nextTick } from './observe/watcher'
import { createTextVNode, createElementVnode } from './vdom'

function createElm(vnode) {
  let { tag, data, children, text } = vnode
  let elm

  if (typeof tag === 'string') {
    // dom 元素
    elm = document.createElement(tag)

    // 更新属性
    patchProps(elm, data)

    // 如果有儿子节点 递归生成真实 DOM
    if (children && children.length > 0) {
      children.forEach(child => elm.appendChild(createElm(child)))
    }
  } else if (typeof tag === 'undefined') {
    // 文本元素
    elm = document.createTextNode(text)
  }

  vnode.el = elm
  return elm
}
// 跟新元素上的属性
function patchProps(elm, data) {
  if (data) {
    Reflect.ownKeys(data).forEach(key => {
      let value
      if (key === 'style') {
        // {color: red, background: blue} ==> color: red; background: blue;
        value = Reflect.ownKeys(data[key]).reduce((a, c) => `${a}${c}:${data[key][c]};`, '')
      } else {
        value = data[key]
      }
      elm.setAttribute(key, value)
    })
  }
}
function patch(oldVnode, vnode) {
  const isRealElement = oldVnode.nodeType
  if (isRealElement) {
    // 是真实的dom元素
    const elm = oldVnode
    const parentElement = elm.parentElement

    // 根据 vnode 创建真实 DOM
    let newElm = createElm(vnode)
    // 在老节点之后插入 根据 vnode 生成的真实 DOM，然后再把老节点删除
    parentElement.insertBefore(newElm, oldVnode)
    parentElement.removeChild(oldVnode)

    return newElm
  } else {
    // 是之前的老的虚拟 dom，需要更新 涉及到核心
    // TODO diff 算法
  }
}

export default function initLifecycle(Vue) {
  Vue.prototype._update = function (vnode) {
    // return
    // 将 vnode 转换成真实的 DOM
    const vm = this
    const el = vm.$el

    // patch 既有初始化的功能也有更新的功能
    vm.$el = patch(el, vnode)
  }

  // _c('div', {}, ....)
  Vue.prototype._c = function () {
    return createElementVnode(this, ...arguments)
  }

  // _v('text')
  Vue.prototype._v = function () {
    return createTextVNode(this, ...arguments)
  }
  Vue.prototype._s = function (value) {
    if (typeof value !== 'object') return value
    return JSON.stringify(value)
  }

  // _s(dataProp)
  Vue.prototype._render = function () {
    // 当执行的时候去 vue 的实例上取值，这样视图和属性就绑在一起了
    return this.$options.render.call(this)
  }

  Vue.prototype.$nextTick = nextTick
}

export function mountComponent(vm, el) {
  vm.$el = el
  const updateComponent = () => {
    // 调用render方法产生虚拟节点 虚拟 DOM
    vm._update(vm._render()) // vm._render ===> vm.$options.render
  }
  new Watcher(vm, updateComponent, true) // 用 true 标识是一个渲染过程
}


// 调用钩子函数 生命周期函数
export function callHook(vm, hook) {
  let hooks = vm.$options[hook]
  if (hooks) {
    hooks.forEach(h => h.call(vm))
  }
}
