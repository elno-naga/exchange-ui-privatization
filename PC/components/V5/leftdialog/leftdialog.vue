// Created by 任泽阳 on 18/12/07. // 对话框
<template>
  <section class='common-left-dialog'>
    <!-- 背景遮罩层 -->
    <div class='dialog-markAll fill-8-bg' v-if='showFlag'></div>
    <!-- 弹出框 -->
    <transition name='dropLeft'>
      <div class='dialog-left-frame fill-2-bg' v-if='showFlag' ref='dialog'>
        <div class='dialog-frame-head' :class="headIsBorder ? 'dialog-frame-head-bd fill-6-bd ' : ''">
          <span class='dialog-frame-head-text text-1-cl'>{{ titleText }}</span>
          <span class='dialog-frame-head-close'>
            <c-iconButton @click='close'>
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
            </c-iconButton>
          </span>
        </div>
        <div class='dialog-left-body' :style='bodyStyle'>
          <slot />
        </div>
        <div class='dialog-frame-bottom' v-if='haveOption'>
          <div class='dialog-frame-options'>
            <c-v6-button
              type='solid'
              name='dialogConfirm'
              paddingW='31px'
              width= '360px'
              height='40px'
              @click='confirm'
              :loading='confirmLoading'
              :disabled='confirmDisabled'
              >{{ confirmTextProps }}</c-v6-button
            >
          </div>
        </div>
      </div>
    </transition>
  </section>
</template>
<script>
import { getIconPath } from '@/utils';
// 按钮
export default {
  name: 'c-leftdialog',
  data() {
    return {
      getIconPath,
    };
  },
  props: {
    // 展示变量
    showFlag: { default: false, type: Boolean },
    // 上边距  有警告文字时为20px
    paddingTop: { default: '0px', type: String },
    // 下边距
    paddingBottom: { default: '20px', type: String },
    // 提示文案
    titleText: { default: '', type: String },
    // 确认按钮的文案
    confirmText: { default: '', type: String },
    // 取消按钮的文案
    closeText: { default: '', type: String },
    // 确认按钮的loading
    confirmLoading: { default: false, type: Boolean },
    // 确认按钮的disabled
    confirmDisabled: { default: false, type: Boolean },
    // 是否有下面option区域
    haveOption: { default: true, type: Boolean },
    headIsBorder: { default: false, type: Boolean },
  },
  watch: {
    showFlag(v) {
      if (v) {
        this.$nextTick(() => {
          if (this.$refs.dialog.offsetHeight % 2 !== 0) {
            const str = `${this.$refs.dialog.offsetHeight + 1}px`;
            this.$refs.dialog.style.height = str;
          }
        });
      }
    },
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
    bodyStyle() {
      return {
        paddingTop: this.paddingTop,
        paddingBottom: this.paddingBottom,
      };
    },
  },
  methods: {
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
.dropLeft-enter-active {
  animation: dropLeft-in .5s;
}
.dropLeft-leave-active {
  animation: dropLeft-in .5s reverse;
}
@keyframes dropLeft-in {
  0% {
    // transform: translateY(-100%);
    right: -100%;
    opacity: 0.7
  }
  100% {
    /* margin-top: 10px; */
    // transform: translateY(-50%);
    right: 0;
    opacity: 1;
  }
}
.common-left-dialog {
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
  .dialog-left-frame {
    transform: 0.3s transition;
    position fixed;
    z-index: 1000;
    right: 0;
    top: 0;
    bottom: 0;
    width: 400px;
  }
  .dialog-frame-head {
    box-sizing: border-box;
    height: 60px;
    width: 100%;
    padding: 0 20px;
    line-height: 60px;
  }
  .dialog-frame-head-bd {
    border-bottom-width: 1px;
    border-bottom-style: solid;
    margin-bottom: 10px;
  }
  .dialog-frame-head-text {
    font-size: 16px;
  }
  .dialog-frame-head-close {
    float: right;
    cursor: pointer;
    font-size: 20px;
    margin-top: 12px;
    .hoverShow {
      display: none;
    }
    &:hover {
      .hoverShow {
        display: inline-block;
      }
      .hoverHide {
        display: none;
      }
    }
  }
  .dialog-left-body {
    width: 360px;
    margin-left: 20px;
  }
  .closeBtnClass {
    font-size: 14px;
    margin-right: 10px;
  }
  .dialog-frame-bottom {
    height: 40px;
    position: absolute;
    right: 0;
    bottom: 40px;
    .dialog-frame-options {
      position: absolute;
      right: 20px;
    }
  }
}
</style>
