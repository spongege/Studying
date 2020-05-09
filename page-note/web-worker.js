// 通过绑定message方法可以在e.data获取主线程发送过来的信息，self代表子线程自身，即子线程的全局对象，也可以使用this
self.addEventListener(
  'message',
  e => {
    // 通过 postMessage 向主线程传信息
    switch (e.data) {
      case false:
        self.postMessage(`我收到关闭请求了`)
        self.close() // self.close()用于在 Worker 内部关闭自身。
        break
      case true:
      default:
        self.postMessage(`你给我传了${e.data}`)
        break
    }
  },
  false
)

console.log('web worker')

// 主线程可以监听 Worker 是否发生错误。如果发生错误，Worker 会触发主线程的error事件
self.addEventListener('error', () => {})

// Worker 内部如果要加载其他脚本，有一个专门的方法importScripts()。
// 该方法可以同时加载多个脚本。
// importScripts('script1.js', 'script2.js');

/* Web Worker 的作用，就是为 JavaScript 创造多线程环境，允许主线程创建 Worker 线程，将一些任务分配给后者运行。在主线程运行的同时，Worker 线程在后台运行，两者互不干扰。等到 Worker 线程完成计算任务，再把结果返回给主线程。这样的好处是，一些计算密集型或高延迟的任务，被 Worker 线程负担了，主线程（通常负责 UI 交互）就会很流畅，不会被阻塞或拖慢。

Worker 线程一旦新建成功，就会始终运行，不会被主线程上的活动（比如用户点击按钮、提交表单）打断。这样有利于随时响应主线程的通信。但是，这也造成了 Worker 比较耗费资源，不应该过度使用，而且一旦使用完毕，就应该关闭。

Web Worker 有以下几个使用注意点。

（1）同源限制

分配给 Worker 线程运行的脚本文件，必须与主线程的脚本文件同源。

（2）DOM 限制

Worker 线程所在的全局对象，与主线程不一样，无法读取主线程所在网页的 DOM 对象，也无法使用document、window、parent这些对象。但是，Worker 线程可以navigator对象和location对象。

（3）通信联系

Worker 线程和主线程不在同一个上下文环境，它们不能直接通信，必须通过消息完成。

（4）脚本限制

Worker 线程不能执行alert()方法和confirm()方法，但可以使用 XMLHttpRequest 对象发出 AJAX 请求。

（5）文件限制

Worker 线程无法读取本地文件，即不能打开本机的文件系统（file://），它所加载的脚本，必须来自网络。 */
