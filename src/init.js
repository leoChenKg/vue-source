import initState from './state'
function initMixin(Vue) {
  // 用于初始化操作
  Vue.prototype._init = function (options) {
    const vm = this
    // vue 实例的方法或属性前面有 $
    // 代表用户传过来的配置选项，把它放在全局上，
    // 这样其他实例方法都能访问
    this.$options = options

    // 初始化状态
    initState(vm)
  }
}

export default initMixin
