// Created by 任泽阳 on 18/12/07. // 对话框
<template>
  <section class='common-dialog' :class="[dialogWrapClass, sizeClass]">
    <!-- 背景遮罩层 -->
    <div class='dialog-markAll fill-8-bg' v-show='showFlag'></div>
    <!-- 弹出框 -->
    <transition name='zoom'>
      <div class='dialog-frame fill-2-bg' v-show='showFlag' ref='dialog' :style="frameStyle">
        <span class='dialog-frame-head-close' v-if='closeFlag' @click='close'>
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
        </span>
        <div v-if="haveHead" ref="dialogHead" class='dialog-frame-head'>
          <slot name="dialog-head">
            <span class='dialog-frame-head-text text-1-cl'>{{ titleText }}</span>
          </slot>
        </div>
        <div
          class='dialog-frame-body'
          ref="dialogBody"
          :style='bodyStyle'>
          <vue-scroll>
            <div ref="bodyContent" class="dialog-frame-body-content" :class="{ 'no-head': !haveHead }">
              <slot />
            </div>
          </vue-scroll>
        </div>
        <div class='dialog-frame-bottom' ref="dialogFooter" v-if='haveOption'>
          <slot name="dialog-footer">
            <div class='dialog-frame-options' :class="{'dialog-frame-options-v': footerType === 'v'}">
              <div v-if="showCancel" class="dialog-button cancel-button">
                <c-v6-button
                  type="solid"
                  width="100%"
                  height="44px"
                  colorType="config"
                  @click="cancel">
                  {{ closeTextProps }}
                </c-v6-button>
              </div>
              <div v-if="showConfirm" class="dialog-button confirm-button">
                <c-v6-button
                  type="solid"
                  width="100%"
                  height="44px"
                  :loading="confirmLoading"
                  :disabled="confirmDisabled"
                  @click="confirm">
                  {{ confirmTextProps }}
                </c-v6-button>
              </div>
            </div>
          </slot>
        </div>
      </div>
    </transition>
  </section>
</template>
<script>

import { colorMap, getIconPath } from '@/utils';
// 按钮
export default {
  name: 'c-saasV6-dialog',
  props: {
    // 展示变量
    showFlag: { default: false, type: Boolean },
    // header显示
    haveHead: { default: true, type: Boolean },
    // 弹窗大小 huge large medium small 自定义：auto需要传width
    size: { default: 'medium', type: String },
    // 弹窗class
    dialogClass: { default: '', type: String },
    // bodyWidth size非auto不可用
    bodyWidth: { default: '', type: String },
    // bodyHeight
    bodyHeight: { default: '', type: String },
    // 提示文案
    titleText: { default: '', type: String },
    // 确认按钮的文案
    confirmText: { default: '', type: String },
    // 显示取消按钮
    showCancel: { default: false, type: Boolean },
    // 显示确认按钮
    showConfirm: { default: true, type: Boolean },
    // 取消按钮的文案
    closeText: { default: '', type: String },
    // 确认按钮的loading
    confirmLoading: { default: false, type: Boolean },
    // 确认按钮的disabled
    confirmDisabled: { default: false, type: Boolean },
    // 是否有下面option区域
    haveOption: { default: true, type: Boolean },
    // 是否显示关闭按钮
    closeFlag: { default: true, type: Boolean },
    // h-按钮横向 v-按钮纵向
    footerType: { default: 'h', type: String },
  },
  data() {
    return {
      colorMap,
      getIconPath,
      maxHeight: '100%',
      bodyStyle: {},
      resizeObserver: null,
    };
  },
  computed: {
    confirmTextProps() {
      if (this.confirmText.length) {
        return this.confirmText;
      }
      // 确定
      return this.$t('components.dialog.confirmText');
    },
    closeTextProps() {
      if (this.closeText.length) {
        return this.closeText;
      }
      // 取消
      return this.$t('components.dialog.closeText');
    },
    dialogWrapClass() {
      let classList = this.dialogClass;
      if (!this.haveOption) {
        classList = `${classList} common-noOption-dialog`;
      }
      return classList;
    },
    sizeClass() {
      return `common-${this.size}-dialog`;
    },
    frameStyle() {
      if (this.size === 'auto') {
        return {
          width: this.bodyWidth,
        };
      }
      return null;
    },
  },
  watch: {
    showFlag(v) {
      if (v) {
        this.$nextTick(() => {
          this.setMaxHeight();
          this.setBodyScroll(false);
          this.resizeObserver.observe(this.$refs.bodyContent);
        });
      } else {
        this.setBodyScroll(true);
        this.resizeObserver.unobserve(this.$refs.bodyContent);
      }
    },
  },
  mounted() {
    window.addEventListener('resize', this.setMaxHeight);
    if (this.showFlag) {
      this.setBodyScroll(false);
    }
    this.$nextTick(() => {
      this.resizeObserver = new ResizeObserver(() => {
        this.setBodyHeight();
      });
    });
  },
  destroyed() {
    this.setBodyScroll(true);
    window.removeEventListener('resize', this.setMaxHeight);
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  },
  methods: {
    setMaxHeight() {
      let headHeight = 0;
      let footerHeight = 0;
      if (this.$refs.dialogHead) {
        headHeight = Math.ceil(this.$refs.dialogHead.offsetHeight);
      }
      if (this.$refs.dialogFooter) {
        footerHeight = Math.ceil(this.$refs.dialogFooter.offsetHeight);
      }
      this.maxHeight = `${document.documentElement.clientHeight - headHeight - footerHeight - 160}px`;
      this.setBodyHeight();
    },
    setBodyHeight() {
      this.$nextTick(() => {
        if (this.$refs.dialogBody) {
          const style = {
            maxHeight: this.maxHeight,
          };
          // dialog body height
          let bodyHeight = this.$refs.bodyContent ? `${this.$refs.bodyContent.offsetHeight}px` : '0px';
          // maxheight
          bodyHeight = parseFloat(bodyHeight) < parseFloat(this.maxHeight) ? bodyHeight : this.maxHeight;
          // customsize height
          if (this.bodyHeight && this.maxHeight) {
            bodyHeight = parseFloat(this.maxHeight) < parseFloat(this.bodyHeight) ? this.maxHeight : this.bodyHeight;
          }
          // set height
          style.height = parseFloat(bodyHeight) ? bodyHeight : 'auto';
          this.bodyStyle = { ...style };
        }
      });
    },
    setBodyScroll(flag) {
      if (flag) {
        document.body.style.overflow = 'auto';
      } else {
        document.body.style.overflow = 'hidden';
      }
    },
    cancel() {
      this.$emit('close', 'cancel');
    },
    close() {
      this.$emit('close');
    },
    confirm() {
      this.$emit('confirm');
    },
  },
};
</script>

<style lang='stylus' scoped>
.common-dialog {
  font-family: HarmonyOS-Medium;
  .zoom-enter-active {
    animation: zoom-in .5s;
  }
  .zoom-leave-active {
    animation: zoom-in .5s reverse;
  }
  @keyframes zoom-in {
    0% {
      opacity: 0.7
      transform: translate3d(-50%, -50%, 0) scale(0);
    }
    100% {
      opacity: 1;
      transform: translate3d(-50%, -50%, 0) scale(1);
    }
  }
  .btnClass {
    margin-right: 10px;
  }
  .dialog-markAll {
    position: fixed;
    width: 100%;
    height: 100%;
    z-index: 999;
    top: 0;
    left: 0;
  }
  .dialog-frame {
    position fixed;
    z-index: 1000;
    left: 50%;
    top: 50%;
    transform: translate3d(-50%, -50%, 0) scale(1);
    border-radius: 12px;
    max-height: 100vh;
    box-sizing: border-box;
  }
  .dialog-frame-head-close {
    position: absolute;
    cursor: pointer;
    right: 24px;
    top: 24px;
    z-index:99;

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
  .dialog-frame-head {
    width: 100%;
    padding: 24px;
    box-sizing: border-box;
    border-radius: 12px 12px 0px 0px;
    text-align: left;
  }
  .dialog-frame-head-text {
    font-size: 18px;
    line-height: 20px;
  }
  .dialog-frame-body-content {
    padding: 8px 24px 12px;

    &.no-head {
      padding-top: 24px;
    }
  }
  .dialog-frame-body {
    width: 100%;
    margin: 0;
    box-sizing: border-box;
    overflow: hidden;
  }
  .dialog-frame-bottom {
    padding: 20px 24px 24px;
    margin: 0;
    .dialog-frame-options {
      width: 100%;
      align-items: center;
      display: flex;
      position relative !important;
      right:0;

      .dialog-button {
        flex: 1;
      }

      .cancel-button {
        margin-right: 16px;
      }

      &.dialog-frame-options-v {
        flex-direction: column-reverse;

        .cancel-button {
          margin-top: 8px;
        }
      }
    }
  }
  &.common-noOption-dialog {
    .dialog-frame-body-content {
      padding-bottom: 24px;
    }
  }
  &.common-huge-dialog {
    .dialog-frame {
      width: 600px;
    }
  }
  &.common-large-dialog {
    .dialog-frame {
      width: 508px;
    }
  }
  &.common-medium-dialog {
    .dialog-frame {
      width: 428px;
    }
  }
  &.common-small-dialog {
    .dialog-frame {
      width: 360px;
    }
  }
  &.common-auto-dialog {
    .dialog-frame-body-content {
      padding-bottom: 16px;
    }
    .dialog-frame-bottom {
      padding-top: 16px;
    }
  }
}
</style>
