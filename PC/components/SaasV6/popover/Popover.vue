<template>
  <section>
    <div
        class="common-popover"
        ref="popover"
        @mouseover="hover = true"
        @mouseleave="hover = false">
      <transition name="scale-fade">
        <div
            v-show="showFlag || hover"
            class="c-popover_content box-shadow text-1-cl special-6-bg"
            ref="popoverContent"
            :style="style"
            :class="className"
        >
          <slot name="domcontent"></slot>
          <div v-if="!$slots.domcontent" v-html="content"></div>
          <div
              class="triangle-content"
              :class="{ 'top-triangle': pos === 'bottom', 'bottom-triangle': pos === 'top' }">
            <svg
                class="triangle"
                :style="triangleStyle"
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="7"
                viewBox="0 0 12 7"
                fill="none"
                v-html="getIconPath('popover_triangle', 'special-6-cl')"
            ></svg>
          </div>
        </div>
      </transition>
    </div>
    <div v-if="$slots.domcontent" :id="eleId" class="mirror" :class="className" :style="mirrorStyle">
      <slot name="domcontent"></slot>
    </div>
    <div v-else :id="eleId" class="mirror" :class="className" v-html="content" :style="mirrorStyle">
    </div>
  </section>
</template>
<script>
import { getIconPath, colorMap } from '@/utils';

export default {
  name: 'c-saasV6-popover',
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
    // class
    className: {
      type: String,
      default: '',
    },
    // popover ID 要确保唯一
    id: {
      type: String,
      default: 'popover1',
    },
    width: {
      type: String,
      default: null,
    },
    maxWidth: {
      type: String,
      default: null,
    },
    content: {
      type: String,
      default: '',
    },
    /**
     * popover位置
     * top-left top-right bottom-left bottom-right top bottom
     */
    position: {
      type: String,
      default: 'top',
    },
    // 是否开启自定义内容区域自定义颜色 开启以后内容区域的背景颜色会用className里面设置的
    isCustome: {
      type: Boolean,
      default: false,
    },
    // 内容区域三角形自定义颜色色值 根据主题色传类名，比如fill-1-bg 需要开启isCustome
    customeColor: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      colorMap,
      contentStyle: {},
      positionStyle: {},
      triangleStyle: {},
      transformStyle: {},
      hover: false,
      pos: 'top',
      eleId: '',
      showFlag: false,
    };
  },
  computed: {
    mirrorStyle() {
      const style = {};
      if (this.width) {
        style.width = this.width;
      }
      if (this.maxWidth) {
        style.maxWidth = this.maxWidth;
      }
      return style;
    },
    popoverDom() {
      return this.$refs.popover;
    },
    style() {
      return { ...this.contentStyle, ...this.positionStyle, ...this.transformStyle };
    },
  },
  watch: {
    show(v) {
      if (v) {
        this.positionStyle.left = 'auto';
        this.positionStyle.top = 'auto';
        this.$nextTick(() => {
          this.setPosition();
          this.showFlag = v;
        });
      } else {
        setTimeout(() => {
          this.showFlag = v;
        }, 100);
      }
    },
    width(v) {
      if (v) {
        this.contentStyle.width = v;
      }
    },
    maxWidth(v) {
      if (v) {
        this.contentStyle.maxWidth = v;
      }
    },
  },
  mounted() {
    this.setId();
    if (this.width) {
      this.contentStyle.width = this.width;
    }
    if (this.maxWidth) {
      this.contentStyle.maxWidth = this.maxWidth;
    }
    this.$nextTick(() => {
      const body = document.querySelector('body');
      // 将匹配DOM添加到body中
      if (this.popoverDom) {
        if (body.append) { // 在IE11中 document.appendChild会报错
          body.append(this.popoverDom);
        } else {
          body.appendChild(this.popoverDom);
        }
      }
    });
    window.addEventListener('scroll', this.setPosition);
  },
  destroyed() {
    this.showFlag = false;
    window.removeEventListener('scroll', this.setPosition);
    document.body.removeChild(this.popoverDom);
  },
  methods: {
    getIconPath,
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
      const positionStyle = {};
      const triangleStyle = {};
      let transformOriginX = '50%';
      let transformOriginY = '100%';
      if (this.parent) {
        const {
          left, right, top, bottom, width, height, parentWith, parentHeight,
        } = this.getRect();
        // 获取水平和垂直位置
        const posList = this.position.split('-');
        [this.pos] = posList;
        // 设置垂直位置
        if (posList[0] === 'top') {
          positionStyle.top = `${top - height - 9}px`;
        } else {
          positionStyle.top = `${top + parentHeight + 9}px`;
        }
        // 设置水平位置
        const start = document.dir === 'rtl' ? 'right' : 'left';
        if (posList[1]) {
          if (posList[1] === start) {
            positionStyle.left = `${left}px`;
            triangleStyle.left = `${parentWith / 2}px`;
            transformOriginX = '0%';
          } else {
            positionStyle.right = `${right}px`;
            triangleStyle.right = `${parentWith / 2}px`;
            transformOriginX = '100%';
          }
        } else {
          positionStyle.left = `${left - width / 2 + parentWith / 2}px`;
          triangleStyle.left = `${(width / 2 - 6).toFixed(0)}`;
        }
        if (top < (height + 10)) {
          positionStyle.top = `${top + parentHeight + 9}px`;
          this.pos = 'bottom';
        } else if (bottom < (height + 10)) {
          positionStyle.top = `${top - height - 9}px`;
          this.pos = 'top';
        }
      }
      if (this.pos === 'top') {
        transformOriginY = '100%';
      } else {
        transformOriginY = '0%';
      }
      this.positionStyle = { ...positionStyle };
      this.triangleStyle = { ...triangleStyle };
      this.transformStyle.transformOrigin = `${transformOriginX} ${transformOriginY}`;
    },
    // 获取视图范围
    getRect() {
      const parent = document.querySelector(this.parent);
      const rect = parent.getBoundingClientRect();
      const popover = document.querySelector(`#${this.eleId}`);
      const { clientWidth, clientHeight } = document.documentElement;
      return {
        left: rect.left,
        right: clientWidth - rect.right,
        top: rect.top,
        bottom: clientHeight - rect.bottom,
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
.common-popover {
  .scale-fade-enter-active {
    transition: all .5s;
  }
  .scale-fade-leave-active {
    transition: all .3s;
  }
  .scale-fade-enter, .scale-fade-leave-to {
    transform: scale(0);
    opacity: 0;
  }
  .defaultBg{
    background: #7B828E;
  }
  .c-popover_content {
    position: fixed;
    padding: 8px 12px;
    max-width: 340px;
    box-sizing :border-box;
    border-radius: 4px;
    font-size 12px
    letter-spacing 0
    line-height 20px
    z-index 1100
    transform-origin: 50% 100%;
    .triangle-content {
      position: absolute;
      width: 100%;
      height: 7px;
      left: 0;

      &.top-triangle {
        top: -6px;

        .triangle {
          transform: rotate(180deg);
        }
      }
      &.bottom-triangle {
        bottom: -6px;
      }

      .triangle {
        position: absolute;
        top: 0;
      }
    }
  }
}
.mirror {
  position: fixed;
  max-width 340px
  padding 8px 12px
  box-sizing: border-box;
  border-radius: 4px;
  font-size 12px
  letter-spacing 0
  line-height 20px;
  left: -99999px;
  top: -99999px;
  opacity 0
}
</style>
