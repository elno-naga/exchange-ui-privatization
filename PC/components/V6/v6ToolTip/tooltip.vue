<template>
  <div class="tooltip-container" ref="trigger" :class="classes">
    <span><slot></slot></span>
      <transition name="tip-fade">
        <div class="tooltip" style="pointer-events:none;" :class="toolTipClass" :style="{...styles}"
             v-show="show"
             ref="popover"
             role="tooltip">
          <div class="tooltip-arrow" :style="placement!=='top'&&placement!=='bottom'?{...styles,display:'none'}:{...styles}" :class="toolTipClass"></div>
          <div class="tooltip-inner" :class="toolTipClass" :style="{...styles,...innerStyles}"><slot name="content">{{ content }}</slot></div>
        </div>
      </transition>
  </div>
</template>
<script>
import EventListener from '../../../../utils/EventListener.js';

export default {
  name: 'c-v6-tooltip',
  props: {
    // 需要监听的事件
    trigger: {
      type: String,
      default: 'hover',
    },
    effect: {
      type: String,
      default: 'fadein',
    },
    title: {
      type: String,
    },
    // toolTip消息提示
    content: {
      type: String,
    },
    header: {
      type: Boolean,
      default: true,
    },
    placement: {
      type: String,
      default: 'top',
    },
    toolTipClass: {
      type: String,
      default: 'fill-5-bg',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    maxWidth: {
      type: [String, Number],
    },
    styles: { type: [Object, String], default: '' }, // 样式
    positionTop: {
      type: String,
      default: '',
    },
    positionLeft: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      // 通过计算所得 气泡位置
      position: {
        top: 0,
        left: 0,
      },
      show: false,
    };
  },
  computed: {
    innerStyles() {
      const styles = {};
      if (this.maxWidth) styles['max-width'] = `${this.maxWidth}px`;
      return styles;
    },
    classes() {
      return [`position-${this.placement}`, { visible: this.show === true }];
    },
  },
  watch: {
    show(val) {
      if (val) {
        const { popover } = this.$refs;
        const triger = this.$refs.trigger.children[0];
        setTimeout(() => {
          // 通过placement计算出位子
          switch (this.placement) {
            case 'top':
              this.position.left = triger.offsetLeft
                  - popover.offsetWidth / 2 + triger.offsetWidth / 2;
              this.position.top = triger.offsetTop
                  - popover.offsetHeight - 5;
              break;
            case 'left':
              this.position.left = triger.offsetLeft
                  - popover.offsetWidth;
              this.position.top = triger.offsetTop
                  + triger.offsetHeight / 2 - popover.offsetHeight / 2;
              break;
            case 'right':
              this.position.left = triger.offsetLeft
                  + triger.offsetWidth;
              this.position.top = triger.offsetTop
                  + triger.offsetHeight / 2 - popover.offsetHeight / 2;
              break;
            case 'bottom':
              this.position.left = triger.offsetLeft
                  - popover.offsetWidth / 2 + triger.offsetWidth / 2;
              this.position.top = triger.offsetTop
                  + triger.offsetHeight + 5;
              break;
            default:
              this.position.left = triger.offsetLeft
                  - popover.offsetWidth / 2 + triger.offsetWidth / 2;
              this.position.top = triger.offsetTop
                  - popover.offsetHeight - 5;
          }
          popover.style.top = this.positionTop ? this.positionTop : `${this.position.top}px`;
          popover.style.left = this.positionLeft ? this.positionLeft : `${this.position.left}px`;
        });
      }
    },
  },
  methods: {
    toggle() {
      if (this.disabled) {
        this.show = false;
      } else {
        this.show = !this.show;
      }
    },
  },
  mounted() {
    if (!this.$refs.popover) return;
    // 获取监听对象
    const triger = this.$refs.trigger.children[0];
    // 根据trigger监听特定事件
    if (this.trigger === 'hover') {
      this.mouseenterEvent = EventListener.listen(triger, 'mouseenter', () => {
        if (this.disabled) {
          this.show = false;
        } else {
          this.show = true;
        }
      });
      this.mouseleaveEvent = EventListener.listen(triger, 'mouseleave', () => {
        this.show = false;
      });
    } else if (this.trigger === 'focus') {
      this.focusEvent = EventListener.listen(triger, 'focus', () => {
        if (this.disabled) {
          this.show = false;
        } else {
          this.show = true;
        }
      });
      this.blurEvent = EventListener.listen(triger, 'blur', () => {
        this.show = false;
      });
    } else {
      this.clickEvent = EventListener.listen(triger, 'click', this.toggle);
    }
    // this.show = !this.show;
  },
  // 在组件销毁前移除监听，释放内存
  beforeDestroy() {
    if (this.blurEvent) {
      this.blurEvent.remove();
      this.focusEvent.remove();
    }
    if (this.mouseenterEvent) {
      this.mouseenterEvent.remove();
      this.mouseleaveEvent.remove();
    }
    if (this.clickEvent) this.clickEvent.remove();
  },
};
</script>
<style lang='stylus' >
.tooltip-container {
  display: inline-block;
  position:relative;
  cursor pointer;
  .tooltip {
    position absolute
    padding 8px 12px;
    border-radius 4px
    width: max-content;
    z-index:1000;
  }
  span {
    position:relative;
    z-index 8
  }
  .tooltip-arrow {
    width 8px;
    height 8px;
    position absolute;
    left: 50%;
    margin-left: -4px;
    transform:rotate(45deg);
  }
  .tooltip-inner{
    font-size:12px;
    font-weight:500;
    line-height:18px;
  }
}
.position-top .tooltip-arrow {
  bottom -4px;
}
.position-bottom .tooltip-arrow {
  top: -4px;
}

.tip-fade-enter-active {
  transition: all .2s .5s ease;
}
.tip-fade-leave-active {
  transition: all .2s cubic-bezier(1.0, 0.5, 0.8, 1.0);
}
.position-top .tip-fade-enter, .position-top .tip-fade-leave-to {
  transform: translateY(10px);
  opacity: 0;
}
.position-bottom .tip-fade-enter, .position-bottom .tip-fade-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}
</style>
