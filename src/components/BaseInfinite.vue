<template>
  <div
    class="infiniteWrapper"
    :style="{
      height: wrapperHeight,
      overflow: hideTips && !isIos ? 'hidden' : 'visible',
      transform: `translate3d(0, ${translateY}px, 0)`
    }"
  >
    <div
      v-if="downRefresh"
      class="tips"
      :style="{
        height: `${topTipsHeight}px`,
        marginTop: `-${topTipsHeight}px`
      }"
    >
      <slot name="topTips">
        <p :class="{ defaultText: true, customText }">{{ topText }}</p>
      </slot>
    </div>
    <div
      class="infiniteContainer"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
      ref="infiniteContainer"
    >
      <slot name="content"></slot>
      <p class="endTips" v-if="noData">没有更多内容...</p>
    </div>
    <div
      v-if="upLoading"
      class="tips"
      :style="{
        height: `${bottomTipsHeight}px`,
        marginBottom: `-${bottomTipsHeight}px`
      }"
    >
      <slot name="bottomTips">
        <p :class="{ defaultText: true, customText }">{{ bottomText }}</p>
      </slot>
    </div>
  </div>
</template>

<script>
/*
 * @Author: feng.zhonghui
 * @Date: 2018-12-03 10:58:30
 * @Last Modified by: feng.zhonghui
 * @Last Modified time: 2019-12-03 16:47:10
 * @des: vue上拉加载下拉刷新组件。
 * @eg: <infinite-box :downRefresh="refresh"
                      :upLoading="refresh">
          <ul slot='content'>
            <li v-for="item in dataList">{{ item }}</li>
          </ul>
        </infinite-box>
    methods: {
      refresh(resolve) {  // 不论成功失败都要调用resolve()方法，否则会显示一直加载中
        setTimeout(() => {
          if (this.dataList.length >= 15) {
            this.noData = true;
            resolve('end');  //'end'代表到底了
          } else {
            this.dataList.push(this.dataList[this.dataList.length - 1] + 1);
            resolve('success'); //"success"或者resolve()表示成功，其他的表示失败
          }
        }, 600);
      },
    }
 */

// 顶部和底部的默认配置
const TOP_CONFIG = {
  pullText: '下拉刷新', // 下拉时显示的文字
  releaseText: '释放更新', // 下拉到触发距离时显示的文字
  loadingText: '刷新中...', // 加载中的文字
  successText: '刷新完成', // 加载完成的文字
  failText: '刷新失败', // 加载失败的文字
  loadedStayTime: 400, // 加载完后停留的时间ms
  stayDistance: 50, // 触发刷新后停留的距离
  releaseDistance: 60 // 下拉刷新触发的距离
}

const BOTTOM_CONFIG = {
  pullText: '上拉加载',
  releaseText: '释放加载',
  loadingText: '加载中...',
  successText: '加载完成',
  endText: '没有符合条件数据',
  failText: '加载失败',
  loadedStayTime: 400,
  stayDistance: 50,
  releaseDistance: 60
}
export default {
  name: 'infinite-box',
  props: {
    downRefresh: {
      // 下拉刷新方法,接收resolve参数，外部必须调用，resolve('success')或者resolve()代表成功，其他的代表失败，不调用参数方法会一直加载
      type: Function
    },
    upLoading: {
      // 上拉加载方法,接收resolve参数，外部必须调用，resolve('success')或者resolve()代表成功，其他的代表失败，不调用参数方法会一直加载，上拉加载多接受一个resolve('end')代表没有数据了
      type: Function
    },
    bottomReachedMethod: {
      // 滚动触底时触发
      type: Function
    },
    pullSpeed: {
      // 控制滑动的速度
      type: Number,
      default: 2
    },
    topTipsHeight: {
      // 顶部加载文字块的高度
      type: Number,
      default: 50
    },
    bottomTipsHeight: {
      // 底部加载文字块的高度
      type: Number,
      default: 50
    },
    wrapperHeight: {
      // 滚动容器的高度
      type: String,
      default: '100%'
    },
    topConfig: {
      // 顶部配置
      type: Object,
      default() {
        return {}
      }
    },
    bottomConfig: {
      // 底部配置
      type: Object,
      default() {
        return {}
      }
    },
    customText: {
      // 上下块文字样式的配置
      type: Object,
      default() {
        return {}
      }
    },
    noData: {
      // 是否没有数据
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      scrollDom: null,
      startY: 0,
      currentY: 0,
      startScrollTop: 0,
      distance: 0,
      slideDirection: '',
      translateY: 0,
      topText: TOP_CONFIG.pullText,
      bottomText: BOTTOM_CONFIG.pullText,
      state: '', // 存储整个过程的变化状态
      downPullFunc: null, // 存储到顶时下拉事件
      upPullFunc: null, // 存储到底时上拉事件
      toTheBottom: false,
      finalTopConfig: {},
      finalBottomConfig: {},
      hideTips: true, // 父级设置overflow显隐提示块
      end: this.noData, // 是否到底
      canRefresh: true, // 能否下拉刷新
      isIos: false
    }
  },
  watch: {
    state(newVal) {
      console.log(newVal)
      if (this.slideDirection === 'down') {
        this.$emit('topChange', newVal) // 顶部文本变化触发
      } else {
        this.$emit('bottomChange', newVal) // 底部文本变化触发
      }
    },
    noData(newVal) {
      this.end = newVal
    }
  },
  mounted() {
    this.init()
  },
  updated() {
    // this.canRefresh = this.$el.offsetTop < 10 ;  // 视图变化可能导致下拉刷新状态变化，后续有需求解除注释。
  },
  methods: {
    throttle(method, delay, mustRunDelay) {
      // 节流
      let timer = null,
        args = arguments
      let start = 0,
        now = 0
      return function() {
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
    },
    init() {
      this.isIos = !!navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/) // 做一下安卓和ios对于底部margin-bottom负数的兼容
      this.canRefresh = this.$el.offsetTop < 10 // 判断是否下拉刷新
      this.scrollDom = this.$refs.infiniteContainer
      this.finalTopConfig = Object.assign({}, TOP_CONFIG, this.topConfig)
      this.finalBottomConfig = Object.assign(
        {},
        BOTTOM_CONFIG,
        this.bottomConfig
      )
      this.downPullFunc = this.throttle(
        // 下拉事件
        () => {
          // console.log("下拉");
        },
        200,
        200
      )
      this.upPullFunc = this.throttle(
        // 上拉事件
        () => {
          // console.log("上拉");
        },
        200,
        200
      )
      this.scrollDom.addEventListener(
        // 滚动事件节流
        'scroll',
        this.throttle(this.handleScroll, 200, 200),
        false
      )
      this.scrollDom.addEventListener(
        // 滚动触底事件节流
        'scroll',
        this.throttle(this.handleScrollEnd, 200),
        false
      )
    },
    handleTouchStart(e) {
      this.startY = e.touches[0].clientY
      this.startScrollTop = this.scrollDom.scrollTop
      this.toTheBottom =
        this.scrollDom.scrollTop + this.scrollDom.offsetHeight + 1 >=
        this.scrollDom.scrollHeight
    },
    handleTouchMove(e) {
      this.currentY = e.touches[0].clientY
      this.distance = (this.currentY - this.startY) / this.pullSpeed //控制加载刷新的滑动速度
      this.slideDirection = this.distance >= 0 ? 'down' : 'up'
      if (this.startScrollTop === 0 && this.slideDirection === 'down') {
        if (!this.canRefresh) return // 阻止下拉
        e.preventDefault() // 触底和触顶时阻止微信的默认事件
        e.stopPropagation()
        this.translateY = this.distance
        typeof this.downPullFunc === 'function' && this.downPullFunc()
        if (typeof this.downRefresh !== 'function') return
        this.hideTips = false // 取消拉动会把hideTips设置为true，则最好在拉动过程中把hideTips设置为true
        if (
          this.distance < this.finalTopConfig.releaseDistance &&
          this.state !== 'pull' &&
          this.state !== 'loading'
        ) {
          this.pull()
        } else if (
          this.distance >= this.finalTopConfig.releaseDistance &&
          this.state !== 'release' &&
          this.state !== 'loading'
        ) {
          this.release()
        }
      } else if (this.toTheBottom && this.slideDirection === 'up') {
        if (this.end) {
          this.hideTips = true
          return
        }
        e.preventDefault()
        e.stopPropagation()
        this.translateY = this.distance
        typeof this.upPullFunc === 'function' && this.upPullFunc()
        if (typeof this.upLoading !== 'function') return
        this.hideTips = false
        if (
          Math.abs(this.distance) < this.finalBottomConfig.releaseDistance &&
          this.state !== 'pull' &&
          this.state !== 'loading'
        ) {
          this.pull()
        } else if (
          Math.abs(this.distance) >= this.finalBottomConfig.releaseDistance &&
          this.state !== 'release' &&
          this.state !== 'loading'
        ) {
          this.release()
        }
      }
    },
    handleTouchEnd() {
      if (this.translateY !== 0) {
        if (this.state === 'release') {
          this.loading()
          return
        }
        // 取消pull拉动
        this.scrollTo(0)
        this.hideTips = true // 取消拉动的时候也要把hideTips设置为true
      }
    },
    handleScroll() {
      // 触发的滚动事件
      this.$emit('scrolling')
    },
    handleScrollEnd() {
      // 触发的触底事件
      if (
        this.scrollDom.scrollTop + this.scrollDom.offsetHeight + 1 >=
        this.scrollDom.scrollHeight
      ) {
        this.bottomReachedMethod && this.bottomReachedMethod()
      }
    },
    pull() {
      this.state = 'pull'
      this.slideDirection === 'down'
        ? (this.topText = this.finalTopConfig.pullText)
        : (this.bottomText = this.finalBottomConfig.pullText)
      this.hideTips = false
    },
    release() {
      this.state = 'release'
      this.slideDirection === 'down'
        ? (this.topText = this.finalTopConfig.releaseText)
        : (this.bottomText = this.finalBottomConfig.releaseText)
      this.hideTips = false
    },
    loading() {
      this.state = 'loading'
      if (this.slideDirection === 'down') {
        this.topText = this.finalTopConfig.loadingText
        this.downRefresh && this.downRefresh(this.loadFunc)
        // this.$emit('downRefresh', this.loadFunc);  // 可以通过@downRefresh调用的写法
        this.scrollTo(this.finalTopConfig.stayDistance)
      } else {
        this.bottomText = this.finalBottomConfig.loadingText
        this.upLoading && this.upLoading(this.loadFunc)
        // this.$emit('upLoading', this.loadFunc);
        this.scrollTo(-this.finalBottomConfig.stayDistance)
      }
    },
    loadFunc(loadState = 'success') {
      this.state = loadState
      let loadedStayTime = 0
      if (this.slideDirection === 'down') {
        this.topText =
          loadState === 'success'
            ? this.finalTopConfig.successText
            : this.finalTopConfig.failText
        loadedStayTime = this.finalTopConfig.loadedStayTime
      } else {
        this.bottomText =
          loadState === 'success'
            ? this.finalBottomConfig.successText
            : loadState === 'end'
            ? this.finalBottomConfig.endText
            : this.finalBottomConfig.failText
        loadedStayTime = this.finalBottomConfig.loadedStayTime
      }
      setTimeout(() => {
        this.scrollTo(0)
        setTimeout(() => {
          this.state = '' // 滚动到0以后重置state
        }, 200)
        this.hideTips = true
      }, loadedStayTime)
    },
    scrollTo(to, duration = 200) {
      this.$el.style.transition = `${duration}ms`
      this.translateY = to
      setTimeout(() => {
        this.$el.style.transition = ''
      }, duration)
    }
  }
}
</script>

<style scoped>
.infiniteWrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.infiniteContainer {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}
.infiniteContainer .endTips {
  text-align: center;
  font-size: 14px;
  line-height: 50px;
  background: #eee;
  height: 50px;
}
.infiniteWrapper .tips {
  position: relative;
  font-size: 16px;
  width: 100%;
}
.defaultText {
  text-align: center;
  font-size: 16px;
  line-height: 50px;
  height: 100%;
}
</style>
