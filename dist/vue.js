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
    observe(value); // 劫持数据

    Object.defineProperty(target, key, {
      get: function get() {
        console.log('获取值');
        return value;
      },
      set: function set(newVal) {
        if (newVal === value) return;
        console.log('数据改变了，去更新页面！');
        observe(newVal);
        value = newVal;
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

  function compileToFucntion(template) {
    console.log(template); // 1. 将 template 转换成 ast 语法树
    // 2. 生成 render 方法 （render 方法的执行结果就是 虚拟 DOM）
  }

  function initMixin(Vue) {
    // 用于初始化操作
    Vue.prototype._init = function (options) {
      var vm = this; // vue 实例的方法或属性前面有 $
      // 代表用户传过来的配置选项，把它放在全局上，
      // 这样其他实例方法都能访问

      this.$options = options; // 初始化状态

      initState(vm); // 模板解析

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
            template = opts.template;
          }
        } // 写了 template 就用写了 tempalte


        if (template) {
          // 对模板进行编译
          var render = compileToFucntion(template);
          opts.render = render;
        }
      }
    };
  }

  function Vue(options) {
    debugger;

    this._init(options);
  }

  initMixin(Vue); // 扩展了 init 方法

  return Vue;

}));
//# sourceMappingURL=vue.js.map
