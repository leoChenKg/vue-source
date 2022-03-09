const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`
const qnameCapture = `((?:${ncname}\\:)?${ncname})`

const startTagOpen = new RegExp(`^<${qnameCapture}`) // 匹配标签名称

const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`) // 匹配结束标签名 </xxxx>

const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/ // 匹配属性的 匹配到的是 分组一key 分组二= 分组三属性值
const startTagClose = /^\s*(\/?)>/ // 标签开是的结束部分
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g // {{ xxx }} 匹配到的就是表达式变量

// 对模板进行编译处理
export function parseHTML(html) {
  const ELEMENT_TYPE = 1
  const TEXT_TYPE = 3
  const stack = []
  let currentParent // 指向栈的最后一个
  let root // ast 的根

  while (html) {
    // debugger
    // 如果 textEnd 是0 那么开始位置为标签，如果不为 0 那么开始位置为标签内容
    let textEnd = html.indexOf('<') // <tag>    text <tag>    </ xxx>
    // 开始标签的匹配结果
    if (textEnd === 0) {
      const startTagMatch = parseStartTag()
      if (startTagMatch) {
        start(startTagMatch.tagName, startTagMatch.attrs)
        continue
      }

      // 如果不是开始标签，就是结束标签
      let endTagMatch = html.match(endTag)
      if (endTagMatch) {
        advance(endTagMatch[0].length)
        end(endTagMatch[1]) // 传入结束标签名
        continue
      }
    }

    // 匹配内容标签内的
    if (textEnd >= 0) {
      // 截取标签内的内容
      let text = html.substring(0, textEnd)
      // 如果有text就截取掉
      if (text) {
        advance(text.length)
        chars(text)
        continue
      }
    }
  }
  // 匹配开始标签的名称
  function parseStartTag() {
    let start = html.match(startTagOpen)
    if (start) {
      const match = {
        tagName: start[1], // 标签名称
        attrs: [] // 标签属性
      }
      advance(start[0].length)

      let attr, end
      // 循环匹配标签的属性，在遇到 > 或者 /> 时停止匹配
      while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
        advance(attr[0].length)
        match.attrs.push({ name: attr[1], value: attr[3] || attr[4] || attr[5] })
      }

      // 匹配到开始标签结束符
      if (end) {
        advance(end[0].length)
      }
      return match
    }
    return false // 不是开始标签
  }
  // 截取 html
  function advance(n) {
    html = html.substring(n)
  }

  function createASTElement(tag, attrs) {
    return {
      tag,
      type: ELEMENT_TYPE,
      children: [],
      attrs,
      parent: null
    }
  }
  function start(tagName, attrs) {
    let node = createASTElement(tagName, attrs)
    if (!root) {
      root = node
    } else {
      currentParent.children.push(node)
      node.parent = currentParent
    }
    stack.push(node)
    currentParent = node
  }
  function chars(text) {
    if (text.trim() === '') return
    currentParent.children.push({
      type: TEXT_TYPE,
      text,
      parent: currentParent
    })
  }
  function end(tag) {
    stack.pop()
    currentParent = stack[stack.length - 1]
  }

  return root
}
