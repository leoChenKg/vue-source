import initMixin from './init'
function Vue(options) {
    debugger
  this._init(options)
}
initMixin(Vue) // 扩展了 init 方法
export default Vue
