<template>
  <div v-if="isNotPublicMark" div class="NotPublicMark">
    非公式-おもいきり真似っこ（notFormal-inFormal by one programmer）
    <a href="https://fukushima-covid19.web.app/" target="_blank" rel="noopener">
      公式サイトへ
    </a>
  </div>
</template>

<style lang="scss">
.NotPublicMark {
  position: fixed;
  bottom: 0;
  left: 0;
  font-size: 12px;
  z-index: 1000;
  width: 100%;
  height: 20px;
  text-align: center;
  background-color: #ffe200;
  color: #4d4d4d;
  line-height: 20px;
  opacity: 0.9;

  // mobile view
  @include lessThan($small) {
    height: 40px;
    a {
      display: block;
    }
  }
}
</style>

<script>
export default {
  name: 'NotPublicMark',
  props: {
    value: {
      type: String,
      required: false,
      default: ''
    }
  },
  computed: {
    isNotPublicMark: () => {
      return true
    }
  }
}
</script>
