<template>
  <div class="c-popover text-1-cl">
    <transition name="slide-fade">
      <div
        v-show="show || hover"
        class="c-popover_content fill-3-bg"
        :class="{'light-theme': userSkin === '2'}"
        :style="style"
        @mouseover="hover = true"
        @mouseout="hover = false">
        <div v-html="content"></div>
        <div
            v-if="!hideArrow"
          class="triangle fill-3-bd"
          :class="{ 'top-triangle': pos === 'bottom', 'bottom-triangle': pos === 'top' }"></div>
      </div>
    </transition>
    <div :id="eleId" class="mirror" v-html="content"></div>
  </div>
</template>
<script>
import { getCookie } from '@/utils';

export default {
  name: 'c-popover',
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    // popover 父元素 要确保唯一
    parent: {
      type: String,
      default: '',
    },
    // popover ID 要确保唯一
    id: {
      type: String,
      default: 'popover1',
    },
    content: {
      type: String,
      default: '',
    },
    left: {
      type: String,
      default: '',
    },
    right: {
      type: String,
      default: '',
    },
    top: {
      type: String,
      default: '',
    },
    bottom: {
      type: String,
      default: '',
    },
    // popover位置，暂只支持上下 top  bottom
    position: {
      type: String,
      default: '',
    },
    hideArrow: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      userSkin: getCookie('cusSkin') || getCookie('defSkin'), // 用户选择的skin
      style: {},
      hover: false,
      pos: 'top',
      eleId: '',
    };
  },
  watch: {
    content() {
      this.$nextTick(() => {
        this.setPosition();
      });
    },
  },
  mounted() {
    this.setId();
    this.$nextTick(() => {
      this.setPosition();
    });
    window.addEventListener('scroll', this.setPosition);
  },
  destroyed() {
    window.removeEventListener('scroll', this.setPosition);
  },
  methods: {
    // 再处理ID，确保唯一
    setId() {
      let num = window.sessionStorage.getItem('c-popoverId');
      if (num) {
        num = Number(num) + 1;
      } else {
        num = 1;
      }
      window.sessionStorage.setItem('c-popoverId', num);
      this.eleId = this.id + num;
    },
    // 设置定位
    setPosition() {
      if (this.parent) {
        const {
          left, top, width, height, parentWith, parentHeight,
        } = this.getRect();
        // 有定义显示位置
        if (this.position) {
          this.pos = this.position;
          if (this.position === 'top') {
            this.style.top = `${top - height - 6}px`;
            this.style.left = `${left - width / 2 + parentWith / 2}px`;
          } else if (this.position === 'bottom') {
            this.style.top = `${top + parentHeight + 6}px`;
            this.style.left = `${left - width / 2 + parentWith / 2}px`;
          } else if (this.position === 'bottom-start') {
            this.style.top = `${top + parentHeight + 6}px`;
            this.style.left = `${left}px`;
          }
        } else if (top < (height + 20)) {
          this.style.top = `${top + parentHeight + 6}px`;
          this.pos = 'bottom';
        } else {
          this.style.top = `${top - height - 6}px`;
          this.pos = 'top';
        }
      }
      // 自定义上下左右定位距离
      if (this.left) {
        this.style.left = this.left;
      }
      if (this.top) {
        this.style.top = this.top;
      }
      if (this.right) {
        this.style.right = this.right;
      }
      if (this.bottom) {
        this.style.bottom = this.bottom;
      }
    },
    // 获取视图范围
    getRect() {
      const parent = document.querySelector(this.parent);
      const rect = parent.getBoundingClientRect();
      const popover = document.querySelector(`#${this.eleId}`);
      return {
        left: rect.left,
        top: rect.top,
        parentWith: rect.width,
        parentHeight: rect.height,
        width: popover.offsetWidth,
        height: popover.offsetHeight,
      };
    },
  },
};
</script>
<style scoped lang="stylus">
.c-popover {
  .slide-fade-enter-active {
    transition: all .5s;
  }
  .slide-fade-leave-active {
    transition: all .5s;
  }
  .slide-fade-enter, .slide-fade-leave-to {
    transform: translateY(-5px);
    opacity: 0;
  }
  .c-popover_content {
    position: fixed;
    word-break: break-all
    box-shadow: 0 3px 4px 1px rgba(0,0,0,0.28);
    max-width 340px
    padding 8px 12px
    box-sizing border-box
    border-radius: 4px;
    font-size 12px
    letter-spacing 0
    line-height 20px
    z-index 4
    &.light-theme {
      box-shadow: 0px 1px 4px 1px rgba(0,0,0,0.06);
    }
    .triangle {
      position: absolute;
      left: 50%;
      transform translate(-50%, 0)
      border: 6px solid;
      border-left-color: transparent!important;
      border-right-color: transparent!important;
      &.top-triangle {
        top: -10px;
        border-top-color: transparent!important;
      }
      &.bottom-triangle {
        bottom: -10px;
        border-bottom-color: transparent!important;
      }
    }
  }
  .mirror {
    position: fixed;
    word-break: break-all
    max-width 340px
    padding 8px 12px
    box-sizing border-box
    border-radius: 4px;
    font-size 12px
    letter-spacing 0
    line-height 20px
    left: -99999px;
    top: -99999px;
    opacity 0
  }
}
</style>
