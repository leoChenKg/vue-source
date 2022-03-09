import initMixin from './init'
import initLifecycle from './lifecycle'
function Vue(options) {
  // debugger
  this._init(options)
}
initMixin(Vue) // 扩展了 init 方法
initLifecycle(Vue)
export default Vue
