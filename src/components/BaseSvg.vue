<template>
  <svg
    class="svg-icon"
    :style="{ fill: color, color: color }"
    aria-hidden="true"
    v-on="$listeners"
  >
    <use :xlink:href="'#' + iconName" />
  </svg>
</template>
<script>
export default {
  name: 'SvgIcon',
  props: {
    iconName: {
      type: String,
      required: true
    },
    color: {
      type: String,
      default: 'currentColor'
    }
  }
}
</script>
<style scoped>
.svg-icon {
  width: 1em;
  height: 1em;
  fill: currentColor;
  overflow: hidden;
}
</style>
