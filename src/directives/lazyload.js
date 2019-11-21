/*
 * @Author: feng.zhonghui
 * @Date: 2018-11-30 10:25:36
 * @Last Modified by: feng.zhonghui
 * @Last Modified time: 2019-11-21 16:26:33
 * @des: 图片懒加载指令
 * <img v-lazy='{imgsrc: 图片资源, width: 图片宽度，默认百分百, height: 图片高度，默认百分百}' /> ,如果是img标签以外的标签使用该指令，则转换成背景图片,同时此处的width和height的设置就会失效
 */
export default Vue => {
  /**
   * 函数节流throttle
   * @param 事件触发的操作
   * @param 延迟执行函数的时间
   * @param 超过多长时间必须执行一次函数
   * @returns {Function}
   */
  const throttle = (method, delay, mustRunDelay) => {
    let timer = null,
      start = 0,
      now = 0
    return function(...args) {
      let context = this
      now = Date.now()
      if (!start) {
        start = now
      }
      if (now - start >= mustRunDelay) {
        method.apply(context, args)
        start = Date.now()
      } else {
        clearTimeout(timer)
        timer = setTimeout(() => {
          method.apply(context, args)
        }, delay)
      }
    }
  }

  /**
   * 图片可否加载函数canLoad
   * @param  {} item
   */
  const canLoad = item => {
    const ele = item.ele
    const src = item.imgsrc

    //图片距离页面顶部的距离
    const top = ele.getBoundingClientRect().top
    const windowHeight =
      window.innerHeight || document.documentElement.clientHeight
    if (top < windowHeight * 1.1) {
      const img = new Image()
      img.onload = () => {
        if (ele.nodeName === 'IMG') ele.src = src
        else ele.style.background = `url(${src}) no-repeat center center`

        didLoadImg.push(src)
        loadImg.indexOf(item) > -1 && loadImg.splice(loadImg.indexOf(item), 1)

        if (!loadImg.length) {
          // 当需加载的图片没有，移除window上的滚动事件
          window.removeEventListener('scroll', scrollFunc, true)
        }
      }
      img.src = src
      return true
    } else {
      return false
    }
  }

  // /**
  //  * 图片是否已被浏览器缓存isCache,做判断就会导致图片加载，不使用
  //  * @param  {} item
  //  */
  // const isCache = item => {
  //   const src = item.imgsrc;
  //   const img = new Image();
  //   img.src = src;
  //   setTimeout(() => {
  //   }, 1000);
  //   // return img.complete;
  // };

  const loadImg = [] // 需加载的图片
  const didLoadImg = [] //已经加载过的图片
  const scrollFunc = throttle(
    // 遍历滚动事件存起来
    () => {
      loadImg.forEach(val => canLoad(val))
    },
    50,
    100
  )

  /**
   * 指令函数 lazyFunc
   * @param  {} ele
   * @param  {} binding
   */
  const lazyFunc = (ele, binding) => {
    const imgsrc = binding.value.imgsrc
    const width = binding.value.width || '100%'
    const height = binding.value.height || '100%'
    const defaultSrc =
      'https://ss1.bdstatic.com/70cFvXSh_Q1YnxGkpoWK1HF6hhy/it/u=1394969417,3934508970&fm=27&gp=0.jpg' // 默认图片地址
    const item = {
      ele,
      imgsrc
    }

    if (didLoadImg.indexOf(imgsrc) > -1) {
      // 如果存在于已加载图片,则直接加载
      if (ele.nodeName === 'IMG') ele.src = imgsrc
      else ele.style.background = `url(${imgsrc}) no-repeat center center`
      return
    }

    if (ele.nodeName === 'IMG') {
      ele.style.width = width
      ele.style.height = height
      ele.src = defaultSrc
    } else {
      ele.style.background = `url(${defaultSrc}) no-repeat center center`
    }

    // 是否达到加载请求
    if (canLoad(item)) {
      return
    }

    loadImg.push(item) //添加到需加载

    window.addEventListener('scroll', scrollFunc, true)
  }

  Vue.directive('lazy', {
    // bind: lazyFunc,
    inserted: lazyFunc,
    update: lazyFunc
  })
}
