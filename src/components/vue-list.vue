<template lang="html">
  <div class="vue-list" @scroll="handleScroll">
    <ul
      :style="{
        paddingTop: lineTopHeight + 'px',
        paddingBottom: lineBottomHeight + 'px'
      }"
    >
      <!--<li class="line-top" :style="{height: lineTopHeight +'px'}"></li>-->
      <li v-for="(item, index) in previewList" :key="index">
        {{ item.title }}
      </li>
      <!--<li class="line-bottom" :style="{height: lineBottomHeight +'px'}"></li>-->
    </ul>
    <div class="load-more-gif">loading...</div>
  </div>
</template>

<script>
export default {
  name: 'vue-list',
  props: {
    list: {
      type: Array,
      required: true,
      default() {
        return []
      },
      twoWays: true
    },
    height: {
      type: Number,
      default: 44
    },
    canScroll: {
      type: Boolean,
      default: true
    },
    dispatchData: {
      type: Function
    }
  },
  data() {
    return {
      lastScrollTop: null,
      distance: 44,
      lineTopHeight: 0,
      lineBottomHeight: 0,
      canLoadmore: true,
      previewList: [],
      displayCount: 0
    }
  },
  mounted() {
    this.initData()
    this.handleScroll()
  },
  methods: {
    initData() {
      this._rowsInWindow = Math.ceil(this.$el.offsetHeight / this.height)
      this._above = this._rowsInWindow * 2
      this._below = this._rowsInWindow
      this._max = this._rowsInWindow * this.height
    },
    handleScroll() {
      let _scrollTop = this.$el.scrollTop,
        _height = this.$el.querySelectorAll('ul')[0].offsetHeight, // ul高度
        _contentHeight = this.$el.offsetHeight // 视口高度
      this.displayCount =
        _scrollTop / this.height - Math.ceil(_scrollTop / this.height) > 0.5
          ? Math.ceil(_scrollTop / this.height)
          : Math.floor(_scrollTop / this.height)
      // 每次滚动距离超过_max，就要重组数据（_max = 视口的items数 * item高度）
      if (
        this.lastScrollTop === null ||
        Math.abs(_scrollTop - this.lastScrollTop) > this._max
      ) {
        this.lastScrollTop = _scrollTop
        let _from = parseInt(_scrollTop / this.height) - this._above
        _from < 0 && (_from = 0)
        let _to = _from + this._rowsInWindow * 4
        _to > this.list.length && (_to = this.list.length)

        this.from = _from
        this.to = _to

        this.lineTopHeight = _from * this.height
        this.lineBottomHeight = (this.list.length - _to) * this.height

        typeof this.dispatchData === 'function' && this.dispatchData(this)

        this.resetPreviewList(_from, _to)
      } else {
        if (
          this.to === this.list.length &&
          _height - _contentHeight - _scrollTop < this.distance
        ) {
          this.canScroll && this.loadmore(this.from, this.to)
        }
      }
    },
    resetPreviewList(from, to) {
      this.previewList = []
      this.previewList = this.list.slice(from, to)
    },
    loadmore(from, to) {
      if (!this.canLoadmore) return
      this.canLoadmore = false

      setTimeout(() => {
        for (var i = 0; i < 200; i++) {
          this.list.push({
            title: 'item ' + COUNT++
          })
        }
        let _from = from,
          _to = to + this._below
        this.resetPreviewList(_from, _to)
        this.lineBottomHeight = (this.list.length - _to) * this.height
        this.handleScroll()

        this.canLoadmore = true
      }, 1000)
    }
  },
  components: {}
}
</script>

<style lang="less">
.vue-list {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  &::scroll-bar {
    width: 0;
  }
  ul {
    margin: 0;
    padding: 0;
    li {
      text-decoration: none;
      height: 44px;
      font-size: 14px;
      line-height: 3;
      text-align: left;
      padding-left: 15px;
      border-bottom: 1px solid #ddd;
      box-sizing: border-box;
      background: #fff;
      &.line-top,
      &.line-bottom {
        border-bottom: 0;
      }
    }
  }
  .load-more-gif {
    width: 100%;
    height: 44px;
    text-align: center;
    line-height: 44px;
    background: #fff;
    border-top: none;
    color: #48b884;
  }
}
</style>
