<template>
  <div @click="level++">
    <!-- template里面如果有过多的重复逻辑，可以考虑使用render函数 -->

    <!-- <div v-if="level === 1">div</div>
    <p v-else-if="level === 2">p</p>
    <h1 v-else-if="level === 3">h1</h1>
    <h2 v-else-if="level === 4">h2</h2>
    <strong v-else-if="level === 5">strong</strong>
    <textarea v-else-if="level === 6"> textarea </textarea> -->

    <!-- 上述通过render函数还写成下列方式 -->
    <Tag :level="level"></Tag>
  </div>
</template>

<script>
import Vue from 'vue'

// 利用 render 函数减小了代码重复率
Vue.component('Tag', {
  render: function(createElement, context) {
    const tag = ['div', 'p', 'strong', 'h1', 'h2', 'textarea'][this.level - 1]
    return createElement(tag, tag)
  },
  props: {
    level: {
      type: Number,
      default: 1
    }
  }
})

export default {
  inheritAttrs: false,
  data() {
    return {
      level: 1
    }
  },
  methods: {},
  mounted () {
    console.log(Vue.version) // 可以查看vue的版本号
  }
}
</script>

<style></style>
