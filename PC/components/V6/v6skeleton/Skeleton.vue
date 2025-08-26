<template>
  <div class="common-skeleton" :class="themeClass" :style="style"></div>
</template>
<script>
import { getCookie } from '../../../../utils';

export default {
  name: 'c-skeleton',
  props: {
    width: {
      type: String,
      default: '100%',
    },
    height: {
      type: String,
      default: '14px',
    },
    borderRadius: {
      type: String,
      default: '2px',
    },
  },
  data() {
    return {
      userSkin: getCookie('cusSkin') || getCookie('defSkin') || '1',
    };
  },
  computed: {
    themeClass() {
      const themeTitle = this.userSkin === '1' ? 'dark' : 'light';
      return `skeleton-${themeTitle}`;
    },
    style() {
      return {
        width: this.width,
        height: this.height,
        borderRadius: this.borderRadius,
      };
    },
  },
};
</script>
<style lang="stylus" scoped>
.common-skeleton {
  display: inline-block;
  max-width: 80px;
  background-size: 400% 100%;
  animation loading 1.2s infinite;

  &.skeleton-dark {
    background-image: linear-gradient(94deg, #1D1D1F 25.03%, #353536 50.79%, #1D1D1F 74.51%);
  }

  &.skeleton-light {
    background-image: linear-gradient(90deg, #F7F7F7 18.75%, #ECECEC 48.21%, #F7F7F7 73.44%);
  }

  @keyframes loading {
    0% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0 50%;
    }
  }
}
</style>
