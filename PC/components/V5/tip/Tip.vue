// Created by 任泽阳 on 18/12/06. // 提示框
<template>
  <section class='common-tip'>
    <ul>
      <transition-group name='tip'>
        <li
          v-for='item in domList'
          :key='item.time'
          :style="bgstyle(item)"
          class='common-tip-even fill-3-bg text-1-cl'
          :class='item.color'
        >
          <span class='icon'></span>
<!--          <svg-->
<!--            viewBox="0 0 16 16"-->
<!--            v-if='item.type === "info"'-->
<!--            class='icon icon-16'-->
<!--            aria-hidden='true'-->
<!--            v-html="getIconPath('brl_alert', 'special-4-cl')"-->
<!--          ></svg>-->
          <svg
            viewBox="0 0 16 16"
            v-if='item.type === "error"'
            class='icon icon-16'
            v-html="getIconPath('tips_error', '#D1425E')"
            aria-hidden='true'
          ></svg>
          <svg
            viewBox="0 0 16 16"
            v-if='item.type === "success"'
            class='icon icon-16'
            v-html="getIconPath('tips_success', '#00B595')"
            aria-hidden='true'
          ></svg>
          <svg
            viewBox="0 0 16 16"
            v-if='item.type === "warning"'
            class='icon icon-16'
            v-html="getIconPath('tips_warning', '#E9A92A')"
            aria-hidden='true'
          ></svg>
          <div class='text'>{{ item.text }}</div>
        </li>
      </transition-group>
    </ul>
  </section>
</template>
<script>
import { getIconPath } from '@/utils';

export default {
  name: 'c-tip',
  data() {
    return {
      list: [
        // { text: 'error', time: 3000, type: 'error' },
        // { text: 'success', time: 3000, type: 'success' },
        // { text: 'info', time: 3000, type: 'info' },
        // { text: 'warning', time: 3000, type: 'warning' }
      ],
      getIconPath,
    };
  },
  computed: {
    domList() {
      const list = [];
      this.list.forEach((item) => {
        let color = '';
        switch (item.type) {
          case 'error':
            color = 'fall-1-bd';
            break;
          case 'success':
            color = 'rise-1-bd';
            break;
          case 'info':
            color = 'main-1-bd';
            break;
          case 'warning':
            color = 'warning-1-bd';
            break;
          default:
            color = 'main-1-bd';
        }
        list.push({ ...item, ...{ color } });
      });
      return list;
    },
  },
  mounted() {
    this.$bus.$on('tip', ({
      text, type = 'info', backgroundColor, textColor,
    }) => {
      const time = new Date().getTime();
      this.list.unshift({
        text,
        type,
        time,
        backgroundColor,
        textColor,
      });
      setTimeout(() => {
        let id = -1;
        this.list.forEach((item, index) => {
          if (item.time === time) id = index;
        });
        this.list.splice(id, 1);
      }, 3000);
    });
  },
  methods: {
    bgstyle(data) {
      const obj = {};
      if (data && data.backgroundColor) {
        obj.backgroundColor = `${data.backgroundColor}!important`;
      }
      if (data && data.textColor) {
        obj.color = `${data.textColor}!important`;
      }
      return obj;
    },
  },
};
</script>
<style lang='stylus'>
.tip-item-move {
  display: inline-block;
  margin-right: 10px;
}
.tip-enter-active, .tip-leave-active {
  transition: all 0.3s;
}
.tip-enter, .tip-leave-to
/* .list-leave-active for below version 2.1.8 */ {
  opacity: 0;
  transform: translateX(30%);
}

.common-tip {
  position: fixed;
  right: 20px;
  top: 83px;
  z-index: 9999;
  //.info {
  //  border-left-width: 3px;
  //  border-left-style: solid;
  //}
  .common-tip-even {
    //box-shadow: 0px 2px 10px rgba(0,0,0,0.15);
    width: 280px;
    min-height: 40px;
    border-radius: 4px;
    margin-bottom: 26px;
    //border-left-width: 3px;
    //border-left-style: solid;
    box-sizing: border-box;
    transition: all 0.3s;
    padding: 12px 16px 12px 40px;
    position: relative;
    .icon {
      position: absolute;
      width: 16px;
      height: 16px;
      top: 13px;
      left: 16px;
      border-radius: 50%;
    }
    .text{
      font-family: HarmonyOS-Medium;
      font-size: 14px;
      letter-spacing: 0;
      text-align: left;
      line-height: 20px;
    }
  }
}
</style>
