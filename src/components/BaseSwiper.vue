<template>
  <section class="content">
    <div
      :class="className"
      class="swiper"
      @touchstart="touchStart"
      @touchmove="touchMove"
      @touchend="touchEnd"
    >
      <div
        class="slide"
        @click="clickSlide"
        v-for="(item, index) in list"
        :key="index"
      >
        <img :src="item.img" />
      </div>
    </div>

    <div v-if="showPagination" class="pagination">
      <div
        v-for="(tag, $index) in slidesLength"
        v-bind:class="{ show_bgcolor: index - 1 == $index }"
        class="pagination_item"
        :key="$index"
      ></div>
    </div>
    <div v-if="showButton">
      <div class="left fy" @click="prevSlide">&lt;</div>
      <div class="right fy" @click="nextSlide">&gt;</div>
    </div>
  </section>
</template>

<script>
export default {
  data() {
    return {
      slidesLength: 1,
      theWidth: 0,
      auto: true,
      slideing: true,
      timer: '',
      className: '',
      dom: {},
      slide: {
        wl: 0, //左边距
        s: 0, //滑动开始时的x坐标
        m: 0, //滑动的距离
        e: 0 //滑动结束时的x坐标
      },
      index: 1
    }
  },
  props: {
    //轮播图数据
    list: {
      default: []
    },
    //是否自动轮播
    autoPlay: {
      default: true
    },
    //切换过度时间
    duration: {
      default: 500
    },
    //轮播速度
    speed: {
      default: 1000
    },
    //是否展示翻页器
    showPagination: {
      default: true
    },
    // 是否展示上下翻页按钮
    showButton: {
      default: true
    }
  },
  mounted() {
    this.className = `swiper_${Math.random().toFixed(3) * 1000}`
    setTimeout(() => {
      this.starDom()
      this.dom.transform = `translate3d(${this.theWidth * -1}px, 0px, 0px)`
      if (this.autoPlay) {
        this.setTime()
      }
    }, 50)
  },
  methods: {
    touchStart(ev) {
      if (this.slideing) {
        this.clearTimeOut()
        this.slide.wl = this.getTransform()
        this.slide.s = ev.touches[ev.touches.length - 1].clientX
      }
    },
    touchMove(ev) {
      if (this.slideing && this.slide.s != -1) {
        this.clearTimeOut()
        this.slide.m = ev.touches[ev.touches.length - 1].clientX - this.slide.s
        this.setTransform(this.slide.m + this.slide.wl)
      }
    },
    touchEnd() {
      if (this.slideing && this.slide.s != -1) {
        this.clearTimeOut()
        this.setTransform(this.slide.m + this.slide.wl)
        var x = this.getTransform()
        x += this.slide.m > 0 ? this.theWidth * 0.3 : this.theWidth * -0.3
        this.index = Math.round(x / this.theWidth) * -1
        this.wh('touch')
      }
    },
    //点击当前banner
    clickSlide() {
      this.$emit('clickMe', this.index)
    },
    // 设置坐标
    setTransform(num) {
      this.dom.transform = `translate3d(${num}px, 0px, 0px)`
    },
    //获取坐标
    getTransform() {
      var x = this.dom.transform
      x = x.substring(12)
      x = x.match(/(\S*)px/)[1]
      return Number(x)
    },
    //上一页
    prevSlide() {
      this.clearTimeOut()
      this.index--
      this.wh()
    },
    // 下一页
    nextSlide() {
      this.clearTimeOut()
      this.index++
      this.wh()
    },
    slideTo(index) {
      this.clearTimeOut()
      this.index = index + 1
      this.wh()
    },
    wh(type) {
      this.slideing = false
      this.dom.transition = type == 'touch' ? '250ms' : this.duration + 'ms'
      this.setTransform(this.index * -1 * this.theWidth)
      this.slide.m = 0
      this.slide.s = -1 //保证下次重新赋值
      if (this.autoPlay) {
        this.setTime()
      }
      var timeDuration = type == 'touch' ? '250' : this.duration
      setTimeout(() => {
        this.dom.transition = '0s'
        if (this.index >= this.slidesLength + 1) {
          this.index = 1
          this.setTransform(this.index * -1 * this.theWidth)
        }
        if (this.index <= 0) {
          this.index = this.slidesLength
          this.setTransform(this.index * -1 * this.theWidth)
        }
        this.$emit('transtionend', this.index - 1)
        this.auto = true
        this.slideing = true
      }, timeDuration)
    },
    setTime() {
      this.timer = window.setTimeout(() => {
        if (this.auto) {
          this.index++
          this.wh()
        } else {
          window.clearTimeout(this.timer)
        }
      }, this.speed)
    },
    starDom() {
      var SlideDom = document
        .querySelector('.' + this.className)
        .getElementsByClassName('slide')
      this.slidesLength = SlideDom.length
      if (this.slidesLength > 1) {
        var cloneDom1 = SlideDom[0].cloneNode(true) //向最后append
        var cloneDom2 = SlideDom[this.slidesLength - 1].cloneNode(true) //向最前append
        document
          .querySelector('.' + this.className)
          .insertBefore(cloneDom2, SlideDom[0])
        document.querySelector('.' + this.className).appendChild(cloneDom1)
        this.theWidth = document.querySelector('.' + this.className).offsetWidth
        this.dom = document.querySelector('.' + this.className).style
      }
    },
    clearTimeOut() {
      this.auto = false
      window.clearTimeout(this.timer)
    }
  }
}
</script>

<style>
.content {
  position: relative;
  z-index: 1;
  overflow: hidden;
  width: 100%;
}
.swiper {
  width: 100%;
  display: -webkit-box;
  display: -moz-box;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -moz-transition-duration: 0s linear;
  -webkit-transition-duration: 0s linear;
  -o-transition-duration: 0s linear;
  transition-duration: 0s linear;
}
.slide {
  width: 100%;
  -ms-flex-negative: 0;
  flex-shrink: 0;
  z-index: 10;
  min-height: 100px;
}
.slide img {
  display: block;
}
.fy {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 100;
  font-size: 20px;
  width: 20px;
  height: 20px;
  background: white;
  opacity: 0.2;
  text-align: center;
}
.left {
  left: 20px;
}
.right {
  right: 20px;
}
.pagination {
  position: absolute;
  bottom: 8px;
  width: 100%;
  text-align: center;
  background: 0 0;
}
.pagination_item {
  display: inline-block;
  width: 8px;
  height: 8px;
  margin: 1px 7px;
  cursor: pointer;
  border-radius: 100%;
  background: #aaa;
}
.show_bgcolor {
  background: #0fc37c;
  width: 18px;
}
</style>
