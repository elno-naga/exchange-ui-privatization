// Created by 任泽阳 on 18/12/07. // 对话框
<template>
  <section class='common-dialog'>
    <!-- 背景遮罩层 -->
    <div class='dialog-markAll fill-8-bg' v-if='showFlag'></div>
    <!-- 弹出框 -->
    <transition name='drop'>
      <div class='dialog-frame fill-2-bg' v-if='showFlag' ref='dialog'>
        <div class='dialog-frame-head fill-3-bg'>
          <span class='dialog-frame-head-text text-1-cl'>{{ titleText }}</span>
          <span class='dialog-frame-head-close' @click='close'>
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
        </div>
        <div class='dialog-frame-body' :style='bodyStyle'>
          <slot />
        </div>
        <div class='dialog-frame-bottom' v-if='haveOption'>
          <div class='dialog-frame-options'>
            <!-- <c-button
              type='text'
              paddingW='31px'
              height='40px'
              @click='close'
              className='closeBtnClass'
              >{{ closeTextProps }}</c-button> -->
            <c-v6-button
              type='solid'
              name='dialogConfirm'
              paddingW='31px'
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
  name: 'c-dialog',
  data() {
    return {
      getIconPath,
    };
  },
  props: {
    // 展示变量
    showFlag: { default: false, type: Boolean },
    // 上边距  有警告文字时为20px
    paddingTop: { default: '30px', type: String },
    // 下边距
    paddingBottom: { default: '30px', type: String },
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
  },
  watch: {
    showFlag(v) {
      if (v) {
        setTimeout(() => {
          this.$nextTick(() => {
            if (this.$refs.dialog.offsetHeight % 2 !== 0) {
              const str = `${this.$refs.dialog.offsetHeight + 1}px`;
              this.$refs.dialog.style.height = str;
            }
          });
        }, 1000);
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

<style lang='stylus'>
.drop-enter-active {
  animation: drop-in .3s;
}
.drop-leave-active {
  animation: drop-in .3s reverse;
}
@keyframes drop-in {
  0% {
    // transform: translateY(-100%);
    top: 35%;
    opacity: 0.7
  }
  100% {
    /* margin-top: 10px; */
    // transform: translateY(-50%);
    opacity: 1;
  }
}
.common-dialog {
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
    transform: 0.3s transition;
    position fixed;
    z-index: 1000;
    left: 50%;
    top: 50%;
    transform: translate3d(-50%, -50%, 0);
    //width: 520px !important;
    border-radius: 2px;
  }
  .dialog-frame-head {
    box-sizing: border-box;
    //height: 60px;
    width: 100%;
    padding: 0 40px;
    //line-height: 60px;
  }
  .dialog-frame-head-text {
    font-size: 16px;
  }
  .dialog-frame-head-close {
    float: right;
    cursor: pointer;
    font-size: 20px;
    margin-top: 0;
    .hoverShow {
      display: none;
    }
    &:hover {
      .hoverHide {
        display: none;
      }
      .hoverShow {
        display: inline;
      }
    }
  }
  .dialog-frame-body {
    // width: 440px;
    margin: 0 40px;
  }
  .closeBtnClass {
    font-size: 14px;
    margin-right: 10px;
  }
  .dialog-frame-bottom {
    margin-bottom: 40px;
    height: 40px;
    position: relative;
    .dialog-frame-options {
      position: absolute;
      right: 40px;
    }
  }
}
</style>
