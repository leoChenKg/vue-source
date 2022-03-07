import { initState } from './state'
import { compileToFucntion } from './compiler'

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

    // 模板解析
    if (options.el) {
      vm.$mount(options.el)
    }
  }

  Vue.prototype.$mount = function (el) {
    const vm = this
    el = document.querySelector(el)
    let opts = vm.$options
    // 如果没有 render 函数
    if (!opts.render) {
      let template
      if (!opts.template && el) {
        // 如果没有 template 属性 但是有 el 属性，就应该用 el 的区域作为模板
        template = el.outerHTML
      } else {
        if (el) {
          template = opts.template
        }
      }
      // 写了 template 就用写了 tempalte
      if (template) {
        // 对模板进行编译
        const render = compileToFucntion(template)
        opts.render = render
      }
    }
  }
}

export default initMixin
