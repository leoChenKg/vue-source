(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

  function _typeof(obj) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
      return typeof obj;
    } : function (obj) {
      return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    }, _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
  }

  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
  }

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArrayLimit(arr, i) {
    var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];

    if (_i == null) return;
    var _arr = [];
    var _n = true;
    var _d = false;

    var _s, _e;

    try {
      for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }

  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

    return arr2;
  }

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  // 重写数组部分方法
  var oldArrayProto = Array.prototype;
  var newArrayProto = Object.create(oldArrayProto); // 这7 个方法可以改变原来的数组

  var methods = ['push', 'pop', 'shift', 'unshift', 'splice', 'reverse', 'sort'];
  methods.forEach(function (m) {
    // 函数劫持 切片编程
    newArrayProto[m] = function () {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      var result = oldArrayProto[m].apply(this, args);
      var insertedArr;
      var ob = this.__ob__;

      switch (m) {
        case 'push':
        case 'unsift':
          insertedArr = args;
          break;

        case 'splice':
          insertedArr = args.slice(2);
          break;
      }

      if (insertedArr) {
        ob.observeArray(insertedArr);
        console.log('数组改变，视图更新');
      }

      return result;
    };
  });

  var id$1 = 0;

  var Dep = /*#__PURE__*/function () {
    function Dep() {
      _classCallCheck(this, Dep);

      this.id = id$1++; // 属性的dep要收集 watcher

      this.subs = []; // 存放当前属性对应得watcher
    }

    _createClass(Dep, [{
      key: "depend",
      value: function depend() {
        // 不希望重复收集 watcher
        Dep.target.addDep(this); // 让 watcher 也记住 dep， 他们之间的关系就是多对多
      }
    }, {
      key: "addSub",
      value: function addSub(watcher) {
        this.subs.push(watcher);
      }
    }, {
      key: "notify",
      value: function notify() {
        this.subs.forEach(function (watcher) {
          return watcher.update();
        });
      }
    }]);

    return Dep;
  }();

  Dep.target = null;

  var Observer = /*#__PURE__*/function () {
    function Observer(data) {
      _classCallCheck(this, Observer);

      // 给数据加了一个标识，表示被劫持过了，并搞成不可枚举的，防止 walk  执行时死循环
      Object.defineProperty(data, '__ob__', {
        enumerable: false,
        value: this
      });

      if (Array.isArray(data)) {
        // 如果数据是数组
        this.observeArray(data); // 处理数组的劫持问题，重写部分方法

        Object.setPrototypeOf(data, newArrayProto);
      } else {
        // Object.defineProperty 只能劫持对象中已经存在的属性
        this.walk(data);
      }
    } // 循环对象，对属性依次劫持


    _createClass(Observer, [{
      key: "walk",
      value: function walk(data) {
        Object.keys(data).forEach(function (key) {
          return defineReactive(data, key, data[key]);
        });
      }
    }, {
      key: "observeArray",
      value: function observeArray(data) {
        // 递归劫持数组中的项，只劫持对象，数组单独处理
        data.forEach(function (item) {
          return observe(item);
        });
      }
    }]);

    return Observer;
  }(); // 数据劫持功能的函数


  function defineReactive(target, key, value) {
    // 如果当前值是对象则 继续递归劫持其属性
    var dep = new Dep(); // 每一个属性都有一个 dep 实例

    observe(value); // 劫持数据

    Object.defineProperty(target, key, {
      get: function get() {
        console.log('获取值');

        if (Dep.target) {
          dep.depend(); // 让收集器记住当前的watcher
        }

        return value;
      },
      set: function set(newVal) {
        if (newVal === value) return;
        console.log('数据改变了，去更新页面！');
        observe(newVal);
        value = newVal;
        dep.notify();
      }
    });
  }
  function observe(data) {
    // 数据劫持
    if (_typeof(data) !== 'object' || data == null) {
      return; // 不是对象并进行数据劫持
    } // 一个对象只需要劫持一次，判断对象是否被劫持过，可以添加一个实例，用实例来判断是否被劫持过


    if (data.__ob__ instanceof Observer) {
      // 数据已经被代理过了
      return data.__ob__;
    }

    return new Observer(data);
  }

  function initState(vm) {
    var opts = vm.$options;

    if (opts.data) {
      initData(vm);
    }
  } // 处理 options 上的 data

  function initData(vm) {
    var data = vm.$options.data; // data 可能是函数也可能是对象

    data = typeof data === 'function' ? data.call(this) : data; // 在 Vue 实实力上加入 _data 属性其值就是 data

    vm._data = data; // 把 vm._data.xxx  代理成 vm.xxx

    proxy(vm, vm._data); // 劫持数据

    observe(data);
  } // 把 vm._data.xxx  代理成 vm.xxx


  function proxy(from, target) {
    Object.keys(target).forEach(function (key) {
      Object.defineProperty(from, key, {
        get: function get() {
          return target[key];
        },
        set: function set(newVal) {
          target[key] = newVal;
        }
      });
    });
  }

  var ncname = "[a-zA-Z_][\\-\\.0-9_a-zA-Z]*";
  var qnameCapture = "((?:".concat(ncname, "\\:)?").concat(ncname, ")");
  var startTagOpen = new RegExp("^<".concat(qnameCapture)); // 匹配标签名称

  var endTag = new RegExp("^<\\/".concat(qnameCapture, "[^>]*>")); // 匹配结束标签名 </xxxx>

  var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // 匹配属性的 匹配到的是 分组一key 分组二= 分组三属性值

  var startTagClose = /^\s*(\/?)>/; // 标签开是的结束部分
  // 对模板进行编译处理

  function parseHTML(html) {
    var ELEMENT_TYPE = 1;
    var TEXT_TYPE = 3;
    var stack = [];
    var currentParent; // 指向栈的最后一个

    var root; // ast 的根

    while (html) {
      // debugger
      // 如果 textEnd 是0 那么开始位置为标签，如果不为 0 那么开始位置为标签内容
      var textEnd = html.indexOf('<'); // <tag>    text <tag>    </ xxx>
      // 开始标签的匹配结果

      if (textEnd === 0) {
        var startTagMatch = parseStartTag();

        if (startTagMatch) {
          start(startTagMatch.tagName, startTagMatch.attrs);
          continue;
        } // 如果不是开始标签，就是结束标签


        var endTagMatch = html.match(endTag);

        if (endTagMatch) {
          advance(endTagMatch[0].length);
          end(endTagMatch[1]); // 传入结束标签名

          continue;
        }
      } // 匹配内容标签内的


      if (textEnd >= 0) {
        // 截取标签内的内容
        var text = html.substring(0, textEnd); // 如果有text就截取掉

        if (text) {
          advance(text.length);
          chars(text);
          continue;
        }
      }
    } // 匹配开始标签的名称


    function parseStartTag() {
      var start = html.match(startTagOpen);

      if (start) {
        var match = {
          tagName: start[1],
          // 标签名称
          attrs: [] // 标签属性

        };
        advance(start[0].length);

        var attr, _end; // 循环匹配标签的属性，在遇到 > 或者 /> 时停止匹配


        while (!(_end = html.match(startTagClose)) && (attr = html.match(attribute))) {
          advance(attr[0].length);
          match.attrs.push({
            name: attr[1],
            value: attr[3] || attr[4] || attr[5]
          });
        } // 匹配到开始标签结束符


        if (_end) {
          advance(_end[0].length);
        }

        return match;
      }

      return false; // 不是开始标签
    } // 截取 html


    function advance(n) {
      html = html.substring(n);
    }

    function createASTElement(tag, attrs) {
      return {
        tag: tag,
        type: ELEMENT_TYPE,
        children: [],
        attrs: attrs,
        parent: null
      };
    }

    function start(tagName, attrs) {
      var node = createASTElement(tagName, attrs);

      if (!root) {
        root = node;
      } else {
        currentParent.children.push(node);
        node.parent = currentParent;
      }

      stack.push(node);
      currentParent = node;
    }

    function chars(text) {
      if (text.trim() === '') return;
      currentParent.children.push({
        type: TEXT_TYPE,
        text: text,
        parent: currentParent
      });
    }

    function end(tag) {
      stack.pop();
      currentParent = stack[stack.length - 1];
    }

    return root;
  }

  function genProps(attrs) {
    var str = '';

    for (var i = 0; i < attrs.length; i++) {
      var attr = attrs[i];
      if (attr.value === undefined) attr.value = true;

      if (attr.name === 'style') {
        (function () {
          var obj = {};
          attr.value.split(';').forEach(function (i) {
            if (!i) return;

            var _i$split = i.split(':'),
                _i$split2 = _slicedToArray(_i$split, 2),
                key = _i$split2[0],
                value = _i$split2[1];

            obj[key.trim()] = value.trim();
          });
          attr.value = obj;
        })();
      }

      str += "".concat(attr.name, ":").concat(JSON.stringify(attr.value), ", ");
    }

    return "{".concat(str.slice(0, -2), "}");
  }

  function genChildren(children) {
    return children.reduce(function (a, c) {
      return "".concat(a).concat(codegen(c), ",");
    }, '').slice(0, -1);
  }

  function codegen(ast) {
    if (ast.type === 3) {
      // 文本情况  把 {{age}} ==> _s(age)     把 {{name}} hello ==> _v(_s(name)+ " hello")
      // 把 xxx ==> _v("xxx")
      ast.text = ast.text.replaceAll(/\{\{((?:.|\r?\n)+?)\}\}/g, function () {
        return "` + _s(" + (arguments.length <= 1 ? undefined : arguments[1]) + ") + `";
      });

      if (ast.text.startsWith('` +')) {
        ast.text = ast.text.slice(3);
      } else {
        ast.text = '`' + ast.text;
      }

      if (ast.text.endsWith('+ `')) {
        ast.text = ast.text.slice(0, -3);
      } else {
        ast.text += '`';
      }

      return "_v(".concat(ast.text, ")");
    }

    var code = "_c('".concat(ast.tag, "', ").concat(ast.attrs && ast.attrs.length > 0 ? genProps(ast.attrs) : 'null', ", ").concat(ast.children && ast.children.length > 0 ? genChildren(ast.children) : 'null', ")");
    return code;
  }

  function compileToFucntion(template) {
    // 1. 将 template 转换成 ast 语法树
    var ast = parseHTML(template); // 2. 生成 render 方法 （render 方法的执行结果就是 虚拟 DOM）

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

    var code = codegen(ast); // with(ctx) { ...code } ctx 作为以下代码的上下文执行环境 code 中取的变量都是从 ctx 中取

    code = "with(this){ return ".concat(code, "}");
    return new Function(code); // render 函数
  }

  var id = 0; // watcher 的 id
  // 创建渲染 watcher 时，会把当前的渲染 watcher 放到 Dep.target 上，
  // 接下来执行 _render 函数生成虚拟 dom 在解析成真实dom 的过程中，数据属性被获取将触发 getter 时，把此 watcher 放入 dep 的 watcher 对列中，
  // 当该属性设置值的时候就 把 dep 中的watcher拿出来查重新执行渲染函数，让页面更新

  var Watcher = /*#__PURE__*/function () {
    function Watcher(vm, fn, options) {
      _classCallCheck(this, Watcher);

      // 传入 vm ，代表该 watcher 管理 此 vm
      // fn 为渲染函数
      this.id = id++;
      this.renderWatcher = options; // 标识是不是一个 渲染 watcher

      this.getter = fn; // getter 调用会发生取值操作 fn 是 ()=> {vm._update(vm._render)}

      this.deps = []; // 记录 dep 的目的 比如说：组件卸载时，让 dep 不再收集 watcher，计算属性时可能需要

      this.depsIds = new Set(); // set 去重

      this.get();
    }

    _createClass(Watcher, [{
      key: "addDep",
      value: function addDep(dep) {
        // 一个 watcher 对应多个属性，属性也不要重复
        var id = dep.id;

        if (!this.depsIds.has(id)) {
          this.deps.push(dep);
          this.depsIds.add(id);
          dep.addSub(this);
        }
      }
    }, {
      key: "get",
      value: function get() {
        Dep.target = this; // 当前的渲染 watcher 放到全局 Dep 上

        this.getter(); // 会执行 render 函数 去 vm 上取值。然后再更新界面

        Dep.target = null; // 渲染完毕后清空
      }
    }, {
      key: "update",
      value: function update() {
        // this.get()
        queueWather(this); // 把当前的 watcher 传入存起来，异步更新
      }
    }, {
      key: "run",
      value: function run() {
        console.log('更新！！！！');
        this.get();
      }
    }]);

    return Watcher;
  }();

  var queue = [];
  var has = {};
  var padding = false;

  function flushQueues() {
    var flushQueue = queue.slice(0);
    padding = false;
    has = {};
    queue = [];
    flushQueue.forEach(function (watcher) {
      return watcher.run();
    });
  }

  function queueWather(watcher) {
    var id = watcher.id;

    if (has[id] === undefined) {
      queue.push(watcher);
      has[id] = watcher.id;

      if (!padding) {
        padding = true;
        nextTick(flushQueues);
      }
    }
  }

  var callbacks = [];
  var waiting = false;

  function flushCallbacks() {
    var cbs = callbacks.slice(0);
    callbacks = [];
    waiting = false;
    cbs.forEach(function (cb) {
      return cb();
    });
  } // 源码中 nextTick 采用降级方案  Promise => MutationObserve setImmediate（ie） => setTimeout
  // let timerFun
  // if (Promise) {
  //   timerFun = () => {
  //     Promise.resolve().then(flushCallbacks)
  //   }
  // } else if (MutationObserver) {
  //   let observer = new MutationObserver(flushCallbacks) // 异步回调
  //   let textNode = document.createTextNode(1)
  //   observer.observe(textNode, {
  //     // 监控文本节点的值是否变化，变化就执行构造函数传入的回调
  //     characterData: true
  //   })
  //   timerFun = () => {
  //     textNode.textContent = 2
  //   }
  // } else if (setImmediate) {
  //   timerFun = () => {
  //     setImmediate(flushCallbacks)
  //   }
  // } else {
  //   timerFun = () => {
  //     setTimeout(flushCallbacks)
  //   }
  // }


  function nextTick(cb) {
    callbacks.push(cb);

    if (!waiting) {
      waiting = true; // timerFun()

      Promise.resolve().then(flushCallbacks);
    }
  } // 需要给每个属性增加一个 dep，收集 watcher

  // _c()
  function createElementVnode(vm, tag, data) {
    if (data == null) {
      data = {};
    }

    var key = data.key;
    delete data.key;

    for (var _len = arguments.length, children = new Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
      children[_key - 3] = arguments[_key];
    }

    return vnode(vm, tag, key, data, children);
  } // _v()

  function createTextVNode(vm, text) {
    return vnode(vm, undefined, undefined, undefined, undefined, text);
  } // ast 是做语法转换的 将 HTML --> ast
  // 虚拟 DOM 是描述 DOM 的，是 DOM 的抽象

  function vnode(vm, tag, key, data, children, text) {
    return {
      vm: vm,
      tag: tag,
      key: key,
      data: data,
      children: children,
      text: text
    };
  }

  function createElm(vnode) {
    var tag = vnode.tag,
        data = vnode.data,
        children = vnode.children,
        text = vnode.text;
    var elm;

    if (typeof tag === 'string') {
      // dom 元素
      elm = document.createElement(tag); // 更新属性

      patchProps(elm, data); // 如果有儿子节点 递归生成真实 DOM

      if (children && children.length > 0) {
        children.forEach(function (child) {
          return elm.appendChild(createElm(child));
        });
      }
    } else if (typeof tag === 'undefined') {
      // 文本元素
      elm = document.createTextNode(text);
    }

    vnode.el = elm;
    return elm;
  } // 跟新元素上的属性


  function patchProps(elm, data) {
    if (data) {
      Reflect.ownKeys(data).forEach(function (key) {
        var value;

        if (key === 'style') {
          // {color: red, background: blue} ==> color: red; background: blue;
          value = Reflect.ownKeys(data[key]).reduce(function (a, c) {
            return "".concat(a).concat(c, ":").concat(data[key][c], ";");
          }, '');
        } else {
          value = data[key];
        }

        elm.setAttribute(key, value);
      });
    }
  }

  function patch(oldVnode, vnode) {
    var isRealElement = oldVnode.nodeType;

    if (isRealElement) {
      // 是真实的dom元素
      var elm = oldVnode;
      var parentElement = elm.parentElement; // 根据 vnode 创建真实 DOM

      var newElm = createElm(vnode); // 在老节点之后插入 根据 vnode 生成的真实 DOM，然后再把老节点删除

      parentElement.insertBefore(newElm, oldVnode);
      parentElement.removeChild(oldVnode);
      return newElm;
    }
  }

  function initLifecycle(Vue) {
    Vue.prototype._update = function (vnode) {
      // return
      // 将 vnode 转换成真实的 DOM
      var vm = this;
      var el = vm.$el; // patch 既有初始化的功能也有更新的功能

      vm.$el = patch(el, vnode);
    }; // _c('div', {}, ....)


    Vue.prototype._c = function () {
      return createElementVnode.apply(void 0, [this].concat(Array.prototype.slice.call(arguments)));
    }; // _v('text')


    Vue.prototype._v = function () {
      return createTextVNode.apply(void 0, [this].concat(Array.prototype.slice.call(arguments)));
    };

    Vue.prototype._s = function (value) {
      if (_typeof(value) !== 'object') return value;
      return JSON.stringify(value);
    }; // _s(dataProp)


    Vue.prototype._render = function () {
      // 当执行的时候去 vue 的实例上取值，这样视图和属性就绑在一起了
      return this.$options.render.call(this);
    };

    Vue.prototype.$nextTick = nextTick;
  }
  function mountComponent(vm, el) {
    vm.$el = el;

    var updateComponent = function updateComponent() {
      // 调用render方法产生虚拟节点 虚拟 DOM
      vm._update(vm._render()); // vm._render ===> vm.$options.render

    };

    new Watcher(vm, updateComponent, true); // 用 true 标识是一个渲染过程
  } // 调用钩子函数 生命周期函数

  function callHook(vm, hook) {
    var hooks = vm.$options[hook];

    if (hooks) {
      hooks.forEach(function (h) {
        return h.call(vm);
      });
    }
  }

  // 静态方法
  var strats = {};
  var LIFECYCLE = ['beforeCreate', 'created'];
  LIFECYCLE.forEach(function (hook) {
    strats[hook] = function (p, c) {
      if (c) {
        if (p) {
          return p.concat(c);
        } else {
          return [c];
        }
      } else {
        return p;
      }
    };
  });
  function mergeOptions(parent, child) {
    var options = {};

    for (var key in parent) {
      mergeField(key);
    }

    for (var _key in child) {
      if (!parent.hasOwnProperty(_key)) {
        // parent 没有 key 属性 child 有
        mergeField(_key);
      }
    }

    function mergeField(key) {
      if (strats[key]) {
        options[key] = strats[key](parent[key], child[key]);
      } else {
        options[key] = child[key] || parent[key];
      }
    }

    return options;
  }

  function initMixin(Vue) {
    // 用于初始化操作
    Vue.prototype._init = function (options) {
      var vm = this; // vue 实例的方法或属性前面有 $
      // 代表用户传过来的配置选项，把它放在全局上，
      // 这样其他实例方法都能访问
      // 定义到全局的指令等等，都可以在实例上访问到

      this.$options = mergeOptions(this.constructor.options, options);
      callHook(vm, 'beforeCreate'); // 初始化状态

      initState(vm);
      callHook(vm, 'created'); // 模板解析

      if (options.el) {
        vm.$mount(options.el);
      }
    };

    Vue.prototype.$mount = function (el) {
      var vm = this;
      el = document.querySelector(el);
      var opts = vm.$options; // 如果没有 render 函数

      if (!opts.render) {
        var template;

        if (!opts.template && el) {
          // 如果没有 template 属性 但是有 el 属性，就应该用 el 的区域作为模板
          template = el.outerHTML;
        } else {
          if (el) {
            // 如果有 el 和 template ，那么tempalte 为模板 el 为挂载的容器元素
            template = opts.template;
          }
        } // 写了 template 就用写了 tempalte


        if (template) {
          // 对模板进行编译
          var render = compileToFucntion(template);
          opts.render = render;
        }
      } // 组建的挂载


      mountComponent(vm, el);
    };
  }

  function initGlobalApi(Vue) {
    Vue.options = {};

    Vue.mixin = function (mixin) {
      this.options = mergeOptions(this.options, mixin);
      console.log(this.options);
      return this;
    };
  }

  function Vue(options) {
    // debugger
    this._init(options);
  }

  initMixin(Vue); // 扩展了 init 方法

  initLifecycle(Vue);
  initGlobalApi(Vue);

  return Vue;

}));
//# sourceMappingURL=vue.js.map
