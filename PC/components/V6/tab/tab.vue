// Created by 任泽阳 on 18/12/17. // 登录/注册/重置密码 手机/邮箱切换
<template>
  <div class="tab-btn-container" :class="type === 'small' ? 'tab-line-small' : 'tab-line'">
    <div
        class="tab-item"
        v-for='(item, index) in list'
        :key='index'
        @click='setNowKey(item.key)'
        :class='nowKey === item.key ? `tab-item-active text-1-cl`:"text-2-cl"'
    >
      {{ item.name }}
      <div v-if="type!=='button'" class="line main-1-bg"/>
    </div>
  </div>
</template>
<script>

export default {
  name: 'c-tab',
  props: {
    type: String,
    className: { default: '', type: String }, // 根节点class
    list: { default: [] }, // [{name: xx, key: xx}]
    nowKey: { default: '', type: String }, // 当前值
    disabled: { default: false, type: Boolean }, // 是否可点击
  },
  computed: {
    // 下划线样式
    barStyle() {
      const area = 100 / this.list.length; // 每份占位宽度
      let ind = 0;
      this.list.forEach((item, i) => {
        if (item.key === this.nowKey) {
          ind = i;
        }
      });
      return {
        width: `${area}%`,
        left: `${ind * area}%`,
      };
    },
    // 每一项样式
    evenStyle() {
      const area = 100 / this.list.length; // 每份占位宽度
      return { width: `${area}%` };
    },
  },
  methods: {
    setNowKey(item) {
      if (this.disabled) {
        return;
      }
      this.$emit('onchenges', item);
    },
  },
};
</script>

<style lang='stylus' scoped>
//@import "@/static/css/color.styl"
  .tab-btn-container{
    display:flex;
    flex-direction :row;
  }
  .tab-line-small{
      .tab-item{
        color: #606266;
        font-size :14px;
        cursor :pointer;
        display :flex;
        flex-direction :column;
        align-items : center;
        padding:0 10px;
        font-weight:bold;
        cursor: pointer;
        .line{
          display :none;
          width:24px;
          height:4px;
          margin-top:10px;
          background :#2B61FF;
        }
      }
    .tab-item:hover , .tab-item-active{
      .line{
        display:block;
      }
    }
  }
  .tab-line{
      .tab-item{
        font-size :40px;
        cursor :pointer;
        display :flex;
        flex-direction :column;
        align-items : center;
        padding:0 10px;
        flex:1;
        font-weight:bold;
        cursor: pointer;
        .line{
          display :none;
          width:78px;
          height:6px;
          margin-top:24px;
          background :#2B61FF;
        }
      }
    .tab-item:hover , .tab-item-active{
      .line{
        display:block;
      }
    }
  }
</style>
