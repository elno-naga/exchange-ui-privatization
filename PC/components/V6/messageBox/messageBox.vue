<template>
  <section class='message-box-container'>
    <div class="box-shadow fill-8-bg" v-if="show">
      <div class="message-box fill-2-bg">
        <div class="box-close" @click="show = false">
          <svg class="icon icon-20 hoverHide"
               v-html="getIconPath('dialog_close', 'special-4-cl')"
               viewBox="0 0 1024 1024"/>
        </div>
        <div class="box-icon" v-if="showIcon">
          <img :src="showIconImg" alt="">
        </div>
        <div class="box-title text-1-cl">{{title}}</div>
        <div class="box-tip text-2-cl">{{tip}}</div>
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
  name: 'messageBox',
  data() {
    return {
      getIconPath,
      show: false,
      type: null,
      cancelBtnText: null,
      confirmBtnText: null,
      title: '',
      tip: '',
      callback: null,
    };
  },
  mounted() {
    this.$bus.$on('messageBox', (type, {
      title, message, cancelBtnText, confirmBtnText, callback,
    }) => {
      this.type = type;
      this.title = title;
      this.tip = message;
      this.cancelBtnText = cancelBtnText;
      this.confirmBtnText = confirmBtnText;
      this.show = true;
      this.callback = callback;
    });
  },
  computed: {
    showIcon() {
      return ['success', 'fail'].includes(this.type);
    },
    showIconImg() {
      const obj = {
        success: 'https://s3.ap-northeast-1.amazonaws.com/chainup-test/img_status_success.png',
        fail: 'https://s3.ap-northeast-1.amazonaws.com/chainup-test/img_status_warning.png',
      };
      return obj[this.type];
    },
  },
  methods: {
    btnCallback(type) {
      if (this.callback) {
        const result = this.callback(type);
        const resultType = Object.prototype.toString.call(result).slice(8, -1);
        if (resultType === 'Bollean' && result) {
          this.show = false;
        } else if (resultType === 'Promise') {
          result.then(() => {
            this.show = false;
          });
        } else {
          this.show = false;
        }
      } else {
        this.show = false;
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
.message-box{
  padding:$padding;
  display:flex;
  flex-direction:column;
  align-items:center;
  min-width :312px;
  max-width :360px;
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
  .box-icon{
    margin-bottom :$margin;
    img{
      width:80px;
      height:80px;
    }
  }
  .box-title{
    font-size :18px;
  }
  .box-tip{
    margin-top :$margin;
    font-size :12px;
    line-height :20px;
    word-break: break-word;
  }
  .box-btn{
    margin-top :$margin;
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
