<template>
  <div @click="$emit('modelClick', Date.now())">Click+{{ model }}</div>
</template>

<script>
export default {
  model: {
    prop: 'model',
    event: 'modelClick'
  },
  props: ['model']
}
</script>

<style></style>
