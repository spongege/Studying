<template>
  <!-- <h2>Pure Css Wave</h2> -->
  <div class="container">
    <div class="wave"></div>
  </div>
</template>

<script>
export default {}
</script>

<style lang="less">
// .container {
//   height: 300px;
//   box-sizing: border-box;
//   border-radius: 15px 15px 5px 5px;
//   filter: drop-shadow(0 1px 3px rgba(0, 0, 0, 0.22));
//   background: rgb(118, 218, 255);
//   z-index: 1;
//   width: 150px;
//   margin: 100px auto;
//   position: relative;
//   overflow: hidden;
//   &::before,
//   &::after {
//     content: '';
//     width: 400px;
//     height: 400px;
//     background: #eee;
//     border-radius: 45%;
//     position: absolute;
//     left: 50%;
//     animation: rotate 10s ease infinite;
//     bottom: 30px;
//   }
//   &::after {
//     bottom: 25px;
//     animation-delay: 0.5s;
//     border-radius: 47%;
//     opacity: 0.5;
//   }
// }
// @keyframes rotate {
//   0% {
//     transform: translate(-50%, 0) rotateZ(0deg);
//   }
//   50% {
//     transform: translate(-50%, -2%) rotateZ(180deg);
//   }
//   100% {
//     transform: translate(-50%, 0%) rotateZ(360deg);
//   }
// }
.container {
  position: absolute;
  width: 200px;
  height: 200px;
  padding: 5px;
  border: 5px solid rgb(118, 218, 255);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  overflow: hidden;
}
.wave {
  position: relative;
  width: 200px;
  height: 200px;
  background-color: rgb(118, 218, 255);
  border-radius: 50%;

  &::before,
  &::after {
    content: '';
    position: absolute;
    width: 400px;
    height: 400px;
    top: 0;
    left: 50%;
    background-color: rgba(255, 255, 255, 0.4);
    border-radius: 45%;
    transform: translate(-50%, -70%) rotate(0);
    animation: rotate 6s linear infinite;
    z-index: 10;
  }

  &::after {
    border-radius: 47%;
    background-color: rgba(255, 255, 255, 0.9);
    transform: translate(-50%, -70%) rotate(0);
    animation: rotate 10s linear -5s infinite;
    z-index: 20;
  }
}

@keyframes rotate {
  50% {
    transform: translate(-50%, -73%) rotate(180deg);
  }
  100% {
    transform: translate(-50%, -70%) rotate(360deg);
  }
}
</style>
