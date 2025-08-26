<template>
  <section class='dialog-box-container'>
    <div class="box-shadow fill-8-bg" v-if="dialogShow">
      <div class="dialog-box fill-2-bg">
        <div class="box-close" @click="btnCallback('cancel')">
          <svg class="icon icon-20 hoverHide"
               v-html="getIconPath('dialog_close', 'special-4-cl')"
               viewBox="0 0 1024 1024"/>
        </div>
        <div class="box-title text-1-cl">{{title}}</div>
        <div class="box-content fill-3-bg">
          <slot></slot>
        </div>
        <div class="box-btn" v-if="cancelBtnText || confirmBtnText">
          <div class="btn-item fill-3-bg text-1-cl" v-if="cancelBtnText" @click="btnCallback('cancel')">{{cancelBtnText}}</div>
          <div class="btn-item main-1-bg text-4-cl" v-if="confirmBtnText" @click="btnCallback('confirm')">{{confirmBtnText}}</div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>

import { getIconPath } from '@/utils';

export default {
  name: 'c-dialog-v6',
  props: {
    dialogShow: Boolean,
    title: String,
    cancelBtnText: String,
    confirmBtnText: String,
    callback: Function,
  },
  data() {
    return {
      getIconPath,
    };
  },
  methods: {
    btnCallback(type) {
      if (this.callback) {
        this.callback(type);
      }
    },
  },
};
</script>

<style scoped lang="stylus">
$padding = 24px;
$margin = 16px;
.box-shadow{
  width:100%;
  height:100%;
  position:fixed;
  top:0;
  left:0;
  bottom:0;
  right:0;
  z-index:201;
}
.dialog-box{
  padding:$padding;
  display:flex;
  flex-direction:column;
  align-items:center;
  min-width :300px;
  box-sizing:content-box;
  position :fixed;
  top:50%;
  left:50%;
  transform:translate(-50%,-50%);
  z-index:1;
  border-radius: 12px;
  .box-close{
    position:absolute;
    cursor :pointer;
    top:$padding;
    right:$padding;
    z-index:1;
  }
  .box-title{
    width:100%;
    font-size :18px;
  }
  .box-content{
    width:100%;
    padding:20px;
    box-sizing: border-box;
    margin-top : $padding;
    border-radius: 8px;
  }
  .box-btn{
    margin-top :32px;
    width:100%;
    display :flex;
    flex-direction :row;
    gap:16px;
    .btn-item{
      cursor :pointer;
      height:44px;
      line-height :44px;
      border-radius: 4px;
      text-align:center;
      flex:1;
      font-size :16px;
    }
}
}

</style>
