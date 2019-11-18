<template>
  <div id="app">
    <span>test is {{ test }}</span
    ><br />
    <span>cptTest is {{ cptTest }}</span
    ><br />
    <span>count is {{ count }}</span
    ><br />
    <span>cptCount is {{ cptCount }}</span
    ><br />
    <span>data1 is {{ data1 }}</span
    ><br />
    <span>cptData1 is {{ cptData1 }}</span
    ><br />
    <button @click="increment">click</button><br />
    <input type="text" v-model="keywords" />
    <h3 ref="h3Ref">TemplateRefOne</h3>
    <base-input></base-input>
    <base-Button></base-Button>
    <base-click></base-click>
    <base-svg :iconName="'qq'" :color="'#939'"></base-svg>
    <base-svg :iconName="'wx'"></base-svg>
  </div>
</template>

<script>
/* ref是响应式包装一个单独数据，reactive是响应式包装一整个对象。但是在具体的用法上，通过 reactive() 包装的对象会有一个坑。如果想要保持对象内容的响应式能力，在 return 的时候必须把整个 reactive() 对象返回出去，同时在引用的时候也必须对整个对象进行引用而无法解构，否则这个对象内容的响应式能力将会丢失，只有使用 toRefs() 把 reactive() 对象包装一下，就能够通过解构单独使用它里面的内容了，而此时的内容也依然维持着响应式的特性  */
import {
  ref,
  // isRef, // 判断是否为由 ref() 创建出来的对象
  toRefs,
  reactive,
  computed,
  watch,
  onMounted
} from '@vue/composition-api'
export default {
  name: 'app',
  /* setup 是在组件实例被创建时， 初始化了 props 之后调用，处于 beforeCreate 后，created 前，所以可以接收到初始 props 作为参数。setup() 和 data() 很像，都可以返回一个对象，而这个对象上的属性则会直接暴露给模板渲染上下文  */
  setup(props, ctx) {
    console.log(ctx) // 第二个参数为上下文对象，attrs、slots、parent、root、emit、refs之类的都能获取
    console.log(props) // 获取传过来的 props
    // ---------------------------------------------
    // ref state
    const count = ref(0)
    const test = ref(0)
    // 通过 ref() 还可以引用页面上的元素或组件
    // 创建一个 DOM 引用
    const h3Ref = ref(null)
    // 在 DOM 首次加载完毕之后，才能获取到元素的引用
    onMounted(() => {
      // 为 dom 元素设置字体颜色
      // h3Ref.value 是原生DOM对象
      console.log(h3Ref.value) // 可以直接获取到DOM，h3Ref.value 相当于2.x的 this.$refs.h3Ref
    })
    // ---------------------------------------------
    // reactive state
    const data = reactive({
      data1: 'data1',
      data2: 'data2',
      // 创建可读写的 computed
      cptData1: computed({
        get() {
          return data.data1 + 'cpt'
        },
        set(value) {
          console.log(value)
        }
      })
    })
    // ---------------------------------------------
    // computed state
    const cptCount = computed(() => count.value * 1)
    const cptTest = computed(() => test.value * 2)
    // ---------------------------------------------
    // method
    const increment = () => {
      count.value++
      test.value--
      data.data1 += 1
    }
    // ---------------------------------------------
    // watch 监听reactive数据源，数据源需要是函数的返回值
    watch(
      () => data.data1,
      (cur, pre) => {
        console.log(cur, pre)
      }
    )
    // watch 监听ref数据源
    watch(count, (cur, pre) => {
      console.log(cur, pre)
    })
    // watch 同时监听多个数据源，第一个参数为数组表示数据源
    watch(
      [() => data.data1, count],
      ([curData1, curCount], [preData1, preCount]) => {
        console.log(curData1, preData1)
        console.log(curCount, preCount)
      },
      {
        lazy: true // 在 watch 被创建的时候，不执行回调函数中的代码
      }
    )
    // !!!在 setup() 函数内创建的 watch 监视，会在当前组件被销毁的时候自动停止。如果想要明确地停止某个监视，可以调用 watch() 函数的返回值即可
    // 创建监视，并得到 停止函数
    const stop = watch(() => {})
    // 调用停止函数，清除对应的监视
    stop()
    // ---------------------------------------------
    //  !!!在 watch 中清除无效的异步任务
    //有时候，当被 watch 监视的值发生变化时，或 watch 本身被 stop 之后，我们期望能够清除那些无效的异步任务，此时，watch 回调函数中提供了一个 cleanup registrator function 来执行清除的工作。这个清除函数会在如下情况下被调用：1、watch 被重复执行了,2、watch 被强制 stop 了
    // 定义响应式数据 keywords
    const keywords = ref('')
    // 异步任务：打印用户输入的关键词
    const asyncPrint = val => {
      // 延时 1 秒后打印
      return setTimeout(() => {
        console.log(val)
      }, 1000)
    }
    // 定义 watch 监听
    watch(
      keywords,
      (keywords, prevKeywords, onCleanup) => {
        // 执行异步任务，并得到关闭异步任务的 timerId
        const timerId = asyncPrint(keywords)
        // 如果 watch 监听被重复执行了，则会先清除上次未完成的异步任务
        onCleanup(() => clearTimeout(timerId))
      },
      // watch 刚被创建的时候不执行
      { lazy: true }
    )
    // ---------------------------------------------
    // lifecycle，vue 2.x 的生命周期函数与新版 Composition API 之间的映射关系：
    /* 
      beforeCreate -> use setup()
      created -> use setup()
      beforeMount -> onBeforeMount
      mounted -> onMounted
      beforeUpdate -> onBeforeUpdate
      updated -> onUpdated
      beforeDestroy -> onBeforeUnmount
      destroyed -> onUnmounted
      errorCaptured -> onErrorCaptured
    */

    onMounted(() => {})
    // expose bindings on render context
    return {
      // ...data, // 直接不包装到导出去不具备响应式，试图不会跟随变化
      ...toRefs(data),
      test,
      cptTest,
      h3Ref, // 把创建的DOM引用 return 出去
      count,
      cptCount,
      increment,
      keywords
    }
  }
}
</script>

<style>
.test {
  fill: #eee;
}
</style>
