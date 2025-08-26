<template>
  <div class="v6-card" :class="className" @click="onclick">
      <div class="card-header">
        <span class="icon-name text-1-cl">
          <c-skeleton width="70px" height="20px" v-if="isLoding"></c-skeleton>
          <template v-else-if="!isLoding&&title">{{title}}</template>
          <slot v-else-if="!isLoding&&!title" name="title"></slot>
        </span>
        <span class="change">
          <c-skeleton width="40px" height="20px" v-if="isLoding"></c-skeleton>
          <template v-else-if="!isLoding&&extra">{{extra}}</template>
          <slot v-else-if="!isLoding&&!extra" name="extra"></slot>
        </span>
      </div>
      <div class="card-center">
        <c-skeleton width="160px" height="20px" v-if="isLoding"></c-skeleton>
        <slot v-else></slot>
      </div>
      <div class="card-footer">
        <c-skeleton width="100px" height="16px" v-if="isLoding"></c-skeleton>
        <slot v-else name="footer"></slot>
      </div>
  </div>
</template>
<script>
import { getIconPath } from '@/utils';

export default {
  name: 'c-card',
  data() {
    return {
      getIconPath,
    };
  },
  props: {
    title: {
      type: [String, undefined],
      default: undefined,
    },
    extra: {
      type: [String, undefined],
      default: undefined,
    },
    isLoding: {
      type: Boolean,
      default: true,
    },
    className: {
      type: String,
      default: 'fill-2-bg',
    },
  },
  methods: {
    onclick() {
      this.$emit('onclick');
    },
  },
};

</script>
<style lang='stylus'>
.v6-card {
  font-family: HarmonyOS-Medium;
  font-weight: 500;
  width: 288px;
  height: 123px;
  padding: 16px;
  box-sizing: border-box;
  border-radius: 8px;
  margin-right: 16px;
  cursor: pointer;
    &:hover{
      box-shadow: 0 0 10px rgba(6,15,27,0.1);
    }
    &:last-child {
      margin-right: 0;
    }
    .card-header {
      height: 20px;
      line-height: 20px;
      font-size: 14px;
      margin-bottom: 17px;
      .icon-name {
        float: left;
      }
      .change {
        float: right;
      }
      img {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        vertical-align: middle;
        margin-right: 8px;
      }
    }
    .card-center {
      line-height: 28px;
      margin-bottom: 12px;
      font-family: HarmonyOS-Medium;
    }
    .card-footer {
      font-size: 12px;
      line-height: 16px;
    }
}
</style>
