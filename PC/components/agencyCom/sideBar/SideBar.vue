<template>
  <div class="common-sideBar">
    <div v-show="showFlag" class="sideBar-mark fill-8-bg" @click="close"></div>
    <transition name="sideBar-expand">
      <div v-show="showFlag" class="sideBar-wrap fill-2-bg">
        <div class="sideBar-close" @click="close">
          <svg
            class="icon icon-20 hoverHide"
            v-html="getIconPath('dialog_close', 'special-4-cl')"
            viewBox="0 0 1024 1024">
          </svg>
          <svg
            class="icon icon-20 hoverShow"
            v-html="getIconPath('dialog_close', 'special-5-cl')"
            viewBox="0 0 1024 1024">
          </svg>
        </div>
        <slot></slot>
      </div>
    </transition>
  </div>
</template>
<script>
import { getIconPath } from '../../../../utils';

export default {
  name: 'c-sideBar',
  props: {
    // 展示变量
    showFlag: { default: false, type: Boolean },
  },
  data() {
    return {
      getIconPath,
    };
  },
  watch: {
    showFlag(v) {
      if (v) {
        this.setBodyScroll(false);
      } else {
        this.setBodyScroll(true);
      }
    },
  },
  mounted() {
    if (this.showFlag) {
      this.setBodyScroll(false);
    }
  },
  destroyed() {
    this.setBodyScroll(true);
  },
  methods: {
    close() {
      this.$emit('close');
    },
    setBodyScroll(flag) {
      if (flag) {
        document.body.style.overflow = 'auto';
      } else {
        document.body.style.overflow = 'hidden';
      }
    },
  },
};
</script>
<style lang="stylus">
.common-sideBar {

  @keyframes sideBar-expand {
    from {
      transform: translate(100%, 0);
    }
    to {
      transform: translate(0, 0);
    }
  }

  .sideBar-expand-enter-active {
    animation: sideBar-expand .5s;
  }
  .sideBar-expand-leave-active {
    animation: sideBar-expand .5s reverse;
  }

  .sideBar-mark {
    position: fixed;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
    z-index: 1001;
  }

  .sideBar-wrap {
    position: fixed;
    width: 424px;
    height: 100%;
    right: 0;
    top: 0;
    z-index: 1002;
  }

  .sideBar-close {
    position: absolute;
    top: 24px;
    right: 24px;
    cursor: pointer;

    .hoverShow {
      display: none;
    }

    &:hover {
      .hoverHide {
        display: none;
      }
      .hoverShow {
        display: block;
      }
    }
  }
}
</style>
