// Created by 任泽阳 on 18/12/07. // 对话框
<template>
  <section class='common-dialog'>
    <!-- 背景遮罩层 -->
    <div class='dialog-markAll u-7-bg' v-if='showFlag'></div>
    <!-- 弹出框 -->
    <transition name='drop'>
      <div class='dialog-frame' v-if='showFlag' ref='dialog'>
        <c-iconButton @click='close' class="dialog-close">
          <svg class='icon icon-16' aria-hidden='true'>
            <use xlink:href='#icon-c_7'></use>
          </svg>
        </c-iconButton>
        <slot></slot>
      </div>
    </transition>
  </section>
</template>
<script>
// 按钮
export default {
  name: 'c-dialog-container',
  props: {
    // 展示变量
    showFlag: { default: false, type: Boolean },
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
    width: 458px;
    border-radius: 4px;
    background :#FFFFFF;
  }
  .dialog-close{
    position :absolute !important;
    top:8px;
    right:28px;
    cursor:pointer;
    .icon{
      font-size :12px;
    }
  }
}
</style>
