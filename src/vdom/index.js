// _c()
export function createElementVnode(vm, tag, data, ...children) {
  if (data == null) {
    data = {}
  }
  let key = data.key
  delete data.key
  return vnode(vm, tag, key, data, children)
}

// _v()

export function createTextVNode(vm, text) {
  return vnode(vm, undefined, undefined, undefined, undefined, text)
}

// ast 是做语法转换的 将 HTML --> ast
// 虚拟 DOM 是描述 DOM 的，是 DOM 的抽象
function vnode(vm, tag, key, data, children, text) {
  return {
    vm,
    tag,
    key,
    data,
    children,
    text
  }
}
