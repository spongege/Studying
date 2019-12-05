<template>
  <div id="table">
    <base-table
      :columns="columns"
      :data="data"
      :height="200"
      @on-selection-change="onSelectionChange"
      @on-sort="onSort"
    >
      <!-- 过期语法 -->
      <!-- <div slot="age" slot-scope="{ row }">{{ row.age + '岁' }}</div> -->
      <!-- 默认解构出传递的props -->
      <!-- <template v-slot:age="{ row, col, index }">{{ row.age + '岁' }}</template> -->
      <template v-slot:age="slotProps">{{ slotProps.row.age + '岁' }}</template>
      <!-- 具名插槽的缩写#，该缩写只在其有参数的时候才可用，可以 #default="{ user }"，不能 #="{ user }" -->
      <template #action="{ row, col, index }">
        <button>edit</button>
        <button>delete</button>
      </template></base-table
    >
  </div>
</template>
<script>
export default {
  data() {
    return {
      columns: [
        {
          type: 'expand',
          width: 200
        },
        {
          type: 'selection',
          width: 200
        },
        {
          title: '姓名',
          key: 'name',
          sort: true,
          width: 200
        },
        {
          title: '年龄',
          key: 'age',
          slot: 'age',
          width: 200
        },
        {
          title: '职位',
          key: 'job'
        },
        {
          title: '操作',
          slot: 'action',
          width: 200
        }
      ],
      data: [
        {
          id: 1,
          name: 'a',
          age: 18,
          job: '产品',
          desc: '这是展开的描述啊1'
        },
        {
          id: 2,
          name: 'b',
          age: 19,
          job: '设计',
          desc: '这是展开的描述啊2',
          checked: true
        },
        {
          id: 3,
          name: 'c',
          age: 20,
          job: '前端',
          desc: '这是展开的描述啊3'
        },
        {
          id: 4,
          name: 'd',
          age: 21,
          job: '后端',
          desc: '这是展开的描述啊4'
        },
        {
          id: 5,
          name: 'e',
          age: 22,
          job: '测试',
          desc: '这是展开的描述啊5'
        }
      ],
      selectedRows: [] // 当前已选中的行
    }
  },
  methods: {
    onSelectionChange(selectArr) {
      console.log(selectArr)
    },
    onSort(sort) {
      console.log(sort)
    }
  }
}
</script>
<style lang="less"></style>
