import { parseHTML } from './parse'

function genProps(attrs) {
  let str = ''
  for (let i = 0; i < attrs.length; i++) {
    let attr = attrs[i]
    if (attr.value === undefined) attr.value = true
    if (attr.name === 'style') {
      let obj = {}
      attr.value.split(';').forEach(i => {
        if (!i) return
        let [key, value] = i.split(':')
        obj[key.trim()] = value.trim()
      })
      attr.value = obj
    }
    str += `${attr.name}:${JSON.stringify(attr.value)}, `
  }

  return `{${str.slice(0, -2)}}`
}
function genChildren(children) {
  return children.reduce((a, c) => `${a}${codegen(c)},`, '').slice(0, -1)
}
function codegen(ast) {
  if (ast.type === 3) {
    // 文本情况  把 {{age}} ==> _s(age)     把 {{name}} hello ==> _v(_s(name)+ " hello")
    // 把 xxx ==> _v("xxx")
    ast.text = ast.text.replaceAll(/\{\{((?:.|\r?\n)+?)\}\}/g, (...args) => `" + _s(${args[1]}) + "`)
    if (ast.text.startsWith('" +')) {
      ast.text = ast.text.slice(3)
    } else {
      ast.text = '"' + ast.text
    }
    if (ast.text.endsWith('+ "')) {
      ast.text = ast.text.slice(0, -3)
    } else {
      ast.text += '"'
    }
    return `_v(${ast.text})`
  }
  let code = `_c('${ast.tag}', ${ast.attrs && ast.attrs.length > 0 ? genProps(ast.attrs) : 'null'}, ${
    ast.children && ast.children.length > 0 ? genChildren(ast.children) : 'null'
  })`
  return code
}

export function compileToFucntion(template) {
  // 1. 将 template 转换成 ast 语法树
  let ast = parseHTML(template)
  // 2. 生成 render 方法 （render 方法的执行结果就是 虚拟 DOM）
  /**
   * <div id="app" name="leo" disable style="color: red; background: green">
   *   <div>ax  hello {{name}} xxx {{text}} 信息   </div>
   *   <span>{{age}}</span>
   *   <span>  {{xx}}  </span>
   *   <span>  xxcxcx  </span>
   * </div>
   *
   * 得到语法树 ast
   *
   * 把语法树 ast 变成下面的形式
   *
   * _c('div', {id:"app", name:"leo", disable:true, style:{"color":"red","background":"green"}}, _c('div', null, _v("ax  hello " + _s(name) + " xxx " + _s(text) + " 信息   ")),_c('span', null, _v( _s(age) )),_c('span', null, _v("  " + _s(xx) + "  ")),_c('span', null, _v("  xxcxcx  ")))
   */
  let code = codegen(ast)
  // with(ctx) { ...code } ctx 作为以下代码的上下文执行环境 code 中取的变量都是从 ctx 中取
  code = `with(this){ return ${code}}`
  let render = new Function(code)
  return render
}
