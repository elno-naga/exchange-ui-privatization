<template>
  <section class='v6-common-dialog' :class="[dialogClass, sizeClass]">
    <!-- 背景遮罩层 -->
    <div class='dialog-markAll fill-8-bg' v-if='showFlag'></div>
    <!-- 弹出框 -->
    <transition name='drop'>
      <div class='dialog-frame fill-2-bg' v-if='showFlag' ref='dialog'>
        <div v-if="haveHead" class='dialog-frame-head' :style="headStyle">
          <span class='dialog-frame-head-text text-1-cl' v-if="!headShowImgFlg">{{ titleText }}</span>
          <span class='dialog-frame-head-close' :style="{top:paddingTop}" v-if='closeFlag' @click='close'>
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
        <div class="dialog-frame-image" v-if="headShowImgFlg">
          <svg
              class="icon alertError-icon"
              viewBox="0 0 1024 1024"
              v-html="getIconPath('brl_alert', 'warning-1-cl')"
              style="font-size:70px"
          >
          </svg>
        </div>
        <div class="dialog-frame-title" v-if="headShowImgFlg&&titleText">
          <span class="dialog-frame-head-text text-1-cl">{{titleText}}</span>
        </div>
        <div class='dialog-frame-body' ref="dialogBody" :style="{...autoBodyStyle,...bodyStyle}">
          <vue-scroll :ops="ops">
            <div class='dialog-frame-body-center' :style='bodyCenterStyle' ref="bodyContent">
              <slot />
            </div>
          </vue-scroll>
        </div>
        <div class='dialog-frame-bottom' v-if='haveOption'>
          <slot name="dialog-footer">
            <div class='dialog-frame-options'>
              <div v-if="showCancel" class="dialog-button cancel-button">
                <c-v6-button
                    type="solid"
                    width="100%"
                    :height="confirmBtnHeight"
                    defaultColorClass="text-1-cl fill-3-bg"
                    hoverColorClass="text-1-cl fill-3-bg"
                    activeColorClass="text-1-cl fill-3-bg"
                    @click="cancel">
                  {{ closeTextProps }}
                </c-v6-button>
              </div>
              <div v-if="showConfirm" class="dialog-button confirm-button">
                <c-v6-button
                    type="solid"
                    width="100%"
                    :height="confirmBtnHeight"
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
import { getIconPath, colorMap } from '@/utils';
// 按钮
export default {
  name: 'c-v6-dialog',
  data() {
    return {
      getIconPath,
      colorMap,
      dialogBody: {},
      autoBodyStyle: {},
      // 滚动条配置
      ops: {
        scrollPanel: {
          scrollingX: false,
        },
        rail: {
          opacity: '0',
        },
        bar: {
          background: colorMap['fill-6-bg'],
          keepShow: true,
          size: '4px',
          minSize: 0.2,
        },
      },
    };
  },
  props: {
    // 展示变量
    showFlag: { default: false, type: Boolean },
    // header显示
    haveHead: { default: true, type: Boolean },
    headShowImgFlg: { default: false, type: Boolean },
    headStyle: { type: [Object, String], default: '' },
    // 弹窗大小 large medium sm
    size: { default: 'medium', type: String },
    // 弹窗class
    dialogClass: { default: '', type: String },
    // 上边距
    paddingTop: { default: '', type: String },
    // 下边距
    paddingBottom: { default: '', type: String },
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
    // 确认按钮的高度
    confirmBtnHeight: { default: '40px', type: String },
    bodyStyle: { type: [Object, String], default: '' },
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
    bodyCenterStyle() {
      const style = {};
      if (this.paddingTop) {
        style.paddingTop = this.paddingTop;
      } else if (!this.haveHead) {
        style.paddingTop = '24px';
      } else {
        style.paddingTop = '8px';
      }
      let paddingBottom = '32px';
      if (this.paddingBottom) {
        paddingBottom = this.paddingBottom;
      } else if (this.haveOption) {
        paddingBottom = '8px';
      } else {
        paddingBottom = '24px';
      }
      style.paddingBottom = paddingBottom;
      return style;
    },
    sizeClass() {
      return `common-${this.size}-dialog`;
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
          this.autoBodyStyle = { ...style };
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
.v6-common-dialog {
  font-family: HarmonyOS-Medium;
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
    transform: translate3d(-50%, -50%, 0);
    border-radius: 12px;
  }
  .dialog-frame-head {
    display:flex;
    width: 100%;
    height: auto;
    line-height:normal;
    padding: 24px 24px;
    box-sizing: border-box;
    border-radius: 4px 4px 0px 0px;
    position:relative;
  }
  .dialog-frame-head-text {
    font-size: 20px;
  }
  .dialog-frame-head-close {
    position:absolute;
    right:24px;
    //float: right;
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
  .dialog-frame-image{
    width:100%;
    display:flex;
    justify-content:center;
    padding-top:5px;
    & > img{
      width:80px;
      height:80px;
    }
  }
  .dialog-frame-title{
    width:100%;
    height:auto;
    padding:25px 24px 0;
    display:flex;
    justify-content:center;
    box-sizing:border-box;
  }
  .dialog-frame-body {
    width: 100%;
    margin: 0;
    max-height: calc(80vh - 50px) ;
    scrollbar-color: rgba(0, 0, 0, 0) rgba(0, 0, 0, 0);
    overflow:hidden;
    padding:0 !important;
    ::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0);
    }

    ::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0);
    }
  }
  .dialog-frame-body-center{
    width: 100%;
    box-sizing: border-box;
    padding: 8px 24px;
  }
  .closeBtnClass {
    font-size: 14px;
    margin-right: 10px;
  }
  .dialog-frame-bottom {
    padding: 24px;
    margin: 0;
    .dialog-frame-options {
      width: 100%;
      align-items: center;
      display: flex;

      .dialog-button {
        flex: 1;
      }
    }
    .cancel-button {
      margin-right: 12px;
    }
  }
  &.common-large-dialog {
    .dialog-frame,.dialog-frame-body-center {
      width: 508px;
    }
    .dialog-frame-bottom {
      padding: 24px;
    }
  }
  &.common-medium-dialog {
    .dialog-frame,.dialog-frame-body-center {
      width: 428px;
    }
  }
  &.common-sm-dialog {
    .dialog-frame,.dialog-frame-body-center {
      width: 360px;
    }
  }
}
@media (max-width: 600px) {
  .v6-common-dialog {
    .dialog-frame {
      width: 90%!important;
    }
    .dialog-frame-head {
      padding: 24px 24px 0 !important;
    }
    .dialog-frame-body-center {
      margin-left: 24px!important;
      margin-right: 24px!important;
      width: auto!important;
    }
    .dialog-frame-bottom {
      .dialog-frame-options {
        right: 20px!important;
      }
    }
  }
}
</style>
