//webpack打包优化
/* 
  1、抽离项目中公共依赖的、不常变动的、体积较大的包；
    抽离依赖的前提：
    1、体积较大；
    2、不常更新；
    3、依赖较多；
    4、是前置依赖；
    方法：
    1、使用cdn引用资源，配置webpack的externals，build的时候不在引入对应的包(存在的问题就是如果代码中出现import引入，则还是会打包到vendor.js)
    2、使用 dll（动态链接库），DLLPlugin 就是将包含大量复用模块且不会频繁更新的库进行编译，只需要编译一次，编译完成后存在指定的文件（这里可以称为动态链接库）中。在之后的构建过程中不会再对这些模块进行编译，而是直接使用 DllReferencePlugin 来引用动态链接库的代码。因此可以大大提高构建速度，只要这些模块不升级更新，这些动态链接库就不需要重新编译。（DLLPlugin 和 DllReferencePlugin）
      DllPlugin插件：用于打包出一个个单独的动态链接库文件  
      DllReferencePlugin插件：用于在主配置文件中去引入 DllPlugin 插件打包好的动态链接库文件
    3、happypack，原理就是开启多个node子进程并行的用各种loader去处理待打包的源文件，换言之即提升单位时间内的打包速度
  2、将一个较大的业务代码文件，拆成多个较小的文件，异步加载（或者优化业务代码）
*/

// 宏任务：(macro)task主要包含：script(整体代码)、setTimeout、setInterval、I/O、UI交互事件、postMessage、MessageChannel、setImmediate(Node.js 环境)
// 微任务：Promise.then、MutaionObserver、process.nextTick(Node.js 环境)

//前端性能检测：WebPageTest、YSlow

/*
 前端微服务：
1、使用 HTTP 服务器的路由来重定向多个应用（也就是链接跳转）
2、在不同的框架之上设计通讯、加载机制，诸如 Mooa 和 Single-SPA
3、iFrame。使用 iFrame 及自定义消息传递机制
4、通过组合多个独立应用、组件来构建一个单体应用
5、使用纯 Web Components 构建应用
6、结合 Web Components 构建 
*/

// 实现一个plugin
// 一个 JavaScript 命名函数。
function MyExampleWebpackPlugin() {}

// 在插件函数的 prototype 上定义一个 `apply` 方法。
MyExampleWebpackPlugin.prototype.apply = function(compiler) {
  // 指定一个挂载到 webpack 自身的事件钩子。
  compiler.plugin('webpacksEventHook', function(
    compilation /* 处理 webpack 内部实例的特定数据。*/,
    callback
  ) {
    console.log('This is an example plugin!!!')

    // 功能完成后调用 webpack 提供的回调。
    callback()
  })
}

// 观察者
var subject = {
  observers: [],
  notify() {
    this.observers.forEach(observer => {
      observer.update()
    })
  },
  attach(observer) {
    this.observers.push(observer)
  }
}
var observer = {
  update() {
    alert('updated')
  }
}
subject.attach(observer)
subject.notify()

// bind的实现
Function.prototype.bind = function(oThis) {
  if (typeof this !== 'function') throw Error('调用者不是一个函数')
  var args = Array.prototype.slice.call(arguments, 1)
  var that = this
  var loop = function() {}
  var fn = function() {
    return that.apply(
      this instanceof fn ? this : oThis,
      args.concat(Array.prototype.slice.call(arguments))
    )
  }
  this.prototype && (loop.prototype = this.prototype)
  fn.prototype = new loop()
  return fn
}

// 手动实现call和apply
Function.prototype.Mycall = function(context) {
  //1、this 参数可以传 null 或者 undefined，此时 this 指向 window 2、this 参数可以传基本类型数据，原生的 call 会自动用 Object() 转换
  context = context ? Object(context) : window
  context.fn = this
  var args = []
  for (var i = 1; i < arguments.length; i++) {
    args.push('arguments[' + i + ']')
  }
  var res = eval('context.fn(' + args + ')')
  delete context.fn
  return res
}
Function.prototype.Myapply = function(context, arr) {
  context = context ? Object(context) : window
  context.fn = this
  if (!arr) return context.fn()
  var args = []
  for (var i = 1; i < arr.length; i++) {
    args.push('arr[' + i + ']')
  }
  var res = eval('context.fn(' + args + ')')
  delete context.fn
  return res
}
// 洗牌算法
function shuffle(arr) {
  let current = arr.length
  while (current > 0) {
    const random = Math.floor(Math.random() * current)
    current--
    ;[arr[current], arr[random]] = [arr[random], arr[current]]
  }
  return arr
}

// 加强节流
function throttle(fn, wait) {
  let previous = 0,
    timer = null
  return function(...args) {
    let now = +new Date()

    if (now - previous < wait) {
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => {
        previous = now
        fn.apply(this, args)
      }, wait)
    } else {
      // 第一次执行
      // 或者时间间隔超出了设定的时间间隔，执行函数 fn
      previous = now
      fn.apply(this, args)
    }
  }
}

// 写一个函数，可以控制最大并发数
class ConcurrentPool {
  constructor(max, taskArr) {
    this.max = max
    this.taskArr = taskArr
    setTimeout(() => {
      this.run()
    }, 0)
  }
  run() {
    if (this.taskArr.length == 0) return
    const min = Math.min(this.max, this.taskArr.length)
    for (let i = 0; i < min; i++) {
      const task = this.taskArr.shift()
      this.max--
      Promise.resolve(task())
        .then(res => {})
        .catch(err => {})
        .finally(() => {
          this.max++
          this.run()
        })
    }
  }
  addTask(task) {
    this.taskArr.push(task)
  }
}

// symbol作为key，不会被遍历到，所以stringify和parse是不行的
// 有环引用，stringify和parse也会报错
// 我们另外用getOwnPropertySymbols可以获取symbol key可以解决问题1，用集合记忆曾经遍历过的对象可以解决问题2
// 不考虑正则、函数等奇怪类型的拷贝
function deepClone(target, map = new Map()) {
  if (target === null || typeof target !== 'object') return target
  //循环引用
  if (map.has(target)) return map.get(target)
  let result = Array.isArray(target) ? [] : {}
  map.set(target, result)
  // 获取对象中所有的属性名（包含Symbol值）
  let keys = Object.keys(target).concat(Object.ownPropertySymbols(target))
  let len = keys.length
  while (len--) {
    result[keys[len]] = deepClone(target[keys[len]], map)
  }
  return result
}

// 实现filter
Array.prototype.filter = function(fn, context) {
  if (typeof fn !== 'function') throw Error('fn')
  const res = []
  let arr = this
  for (let i = 0; i < arr.length; i++) {
    const temp = fn.call(context, arr[i], i, arr)
    temp && res.push(arr[i])
  }
  return res
}

// 函数柯里化
const currying = (fn, ...args) => {
  if (fn.length <= args.length) return fn(...args)
  return (...args1) => {
    return currying(fn, ...args, ...args1)
  }
}

function add(a, b, c) {
  return a + b + c
}
add(1, 2, 3) // 6
const curryingAdd = currying(add)
curryingAdd(1)(2)(3) // 6
