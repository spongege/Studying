<template>
  <div class="mini-table" :style="{ height: height + 'px' }">
    <div class="header" ref="header">
      <table>
        <colgroup>
          <col
            v-for="(col, index) in columns"
            :key="index"
            :width="col.width || ''"
          />
        </colgroup>
        <thead>
          <tr>
            <th v-for="col in columns" :key="col.key">
              <div>1</div>
              <div>
                <template v-if="col.type === 'selection'">
                  <input
                    ref="allCheckbox"
                    type="checkbox"
                    :checked="isSelectAll"
                    @change="selectAll"
                  />
                </template>
                <template v-else-if="col.type === 'expand'"></template>
                <template v-else>
                  <span>{{ col.title }}</span>
                  <span v-if="col.sort">
                    <i @click="sort(col.key, '正序')">⬆️</i>
                    <i @click="sort(col.key, '倒顺')">⬇️</i>
                  </span>
                </template>
              </div>
            </th>
          </tr>
        </thead>
      </table>
    </div>
    <div class="body" ref="body">
      <table>
        <colgroup>
          <col
            v-for="(col, index) in columns"
            :key="index"
            :width="col.width || ''"
          />
        </colgroup>
        <tbody>
          <template v-for="(row, index) in data">
            <tr :key="row.id">
              <td v-for="col in columns" :key="col.key">
                <div>
                  <template v-if="col.slot">
                    <slot
                      :name="col.slot"
                      :row="row"
                      :col="col"
                      :index="index"
                    ></slot>
                  </template>
                  <template v-else-if="col.type === 'selection'">
                    <input
                      type="checkbox"
                      :checked="formateStatus(row)"
                      @change="selectOne($event, row)"
                    />
                  </template>
                  <template v-else-if="col.type === 'expand'">
                    <span @click="handleExpand(row.id)">{{
                      checkIsExpand(row.id) ? '收起' : '展开'
                    }}</span>
                  </template>
                  <template v-else>
                    <span>{{ row[col.key] }}</span>
                  </template>
                </div>
              </td>
            </tr>
            <tr :key="`expand-${row.id}`" v-if="checkIsExpand(row.id)">
              <!-- 展开的内容是需要横跨所有行的，所以我们得把 colspan 的值设置成 columns.length -->
              <td :colspan="columns.length">{{ row.desc }}</td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MiniTable',
  props: {
    columns: {
      type: Array,
      default: () => []
    },
    data: {
      type: Array,
      default: () => []
    },
    height: {
      type: [String, Number],
      default: -1
    }
  },
  data() {
    return {
      selectedArr: [],
      expandArr: []
    }
  },
  mounted() {
    this.init()
  },
  watch: {
    // 根据传过来的数据，判断是否有默认选中的项
    data: {
      immediate: true,
      handler(newVal) {
        this.selectedArr = newVal.filter(ele => ele.checked)
      }
    }
  },
  computed: {
    // 表头全选的勾选状态应该根据当前已选的来计算，最好不要直接比较数组长度是否相等，而是应该在比较长度的基础上比较每一项的 id 是否一样，虽然目前看起来这个步骤很多余
    isSelectAll() {
      let all = this.data.map(item => item.id).sort()
      let selected = this.selectedArr.map(item => item.id).sort()
      let isSelectAll = true
      if (all.length === selected.length) {
        for (let i = 0, len = all.length; i < len; i++) {
          if (all[i] !== selected[i]) {
            isSelectAll = false
            break
          }
        }
      } else {
        isSelectAll = false
      }
      this.$nextTick(() => {
        // 防止在计算属性中产生副作用的代码，所以通过方法来调用
        // this.$refs['allCheckbox'][0].indeterminate = selected.length && !isSelectAll
        this.changeIndeterminate(selected, isSelectAll)
      })
      return isSelectAll
    }
  },
  methods: {
    init() {
      let { header, body } = this.$refs
      let headerHeight = parseInt(window.getComputedStyle(header).height)
      let bodyHeight = this.height - headerHeight
      body.style.height = `${bodyHeight}px`
    },
    // 确定表头多选框的不确定性 indeterminate
    changeIndeterminate(selected, isSelectAll) {
      this.$refs.allCheckbox[0].indeterminate = selected.length && !isSelectAll
    },
    // 单击表头的多选框并向外触发事件
    selectAll(e) {
      let checked = e.target.checked
      this.selectedArr = checked ? JSON.parse(JSON.stringify(this.data)) : []
      this.$emit('on-selection-change', this.selectedArr)
    },
    // 单击表体的多选框并向外触发事件
    selectOne(e, row) {
      let checked = e.target.checked
      if (checked) {
        this.selectedArr.push(row)
      } else {
        let index = this.selectedArr.findIndex(item => item.id === row.id)
        this.selectedArr.splice(index, 1)
      }
      this.$emit(
        'on-selection-change',
        JSON.parse(JSON.stringify(this.selectedArr))
      )
    },
    // 判断表体的每个多选框是否被勾选
    formateStatus(row) {
      return this.selectedArr.findIndex(item => item.id === row.id) >= 0
    },
    // 排序
    sort(key, type) {
      this.$emit('on-sort', { key, type })
    },
    handleExpand(id) {
      let index = this.expandArr.indexOf(id)
      if (index > -1) {
        this.expandArr.splice(index, 1)
      } else {
        this.expandArr.push(id)
      }
    },
    checkIsExpand(id) {
      return this.expandArr.includes(id)
    }
  }
}
</script>

<style lang="less">
.mini-table {
  overflow: hidden;
  table {
    width: 100%;
    border-collapse: collapse;
    border-spacing: 0;
    empty-cells: show;
    border: 1px solid #e9e9e9;
  }
  table th {
    background: #f7f7f7;
    color: #5c6b77;
    font-weight: 600;
    white-space: nowrap;
  }
  table td,
  table th {
    padding: 8px 16px;
    border: 1px solid #e9e9e9;
    text-align: left;
  }
  .header {
    overflow: hidden;
  }
  .body {
    overflow: auto;
  }
}
</style>
