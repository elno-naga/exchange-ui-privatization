<template>
  <section class="common-checkout" @click="handClick">
    <div class="checkout-content">
      <!-- 未选中状态 -->
      <svg
          v-if="!value"
          class="icon"
          :class="[iconFontSize, { 'checkbox-disabled': disabled }]"
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          v-html="noneHtml">
      </svg>

      <!-- 全选状态 -->
      <svg
          v-else-if="type === 'all'"
          class="icon"
          :class="[iconFontSize, { 'checkbox-disabled': disabled }]"
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          v-html="selectedHtml">
      </svg>
      <!-- 半选状态 -->
      <svg
          v-else-if="type === 'part'"
          class="icon"
          :class="[iconFontSize, { 'checkbox-disabled': disabled }]"
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          v-html="partSelectedHtml">
      </svg>
      <slot></slot>
    </div>
  </section>
</template>

<script>
import { colorMap, getIconPath } from '@/utils';

export default {
  name: 'c-checkBox',
  data() {
    return {
      colorMap,
    };
  },
  props: {
    value: { default: false, type: Boolean },
    iconFontSize: { default: 'icon-14', type: String },
    // 是否可点击
    disabled: { default: false, type: Boolean },
    // part：部分  all： 是否可全选
    type: { default: 'all', type: String },
  },
  computed: {
    // 未选中
    noneHtml() {
      if (this.disabled) {
        return this.getIconPath('checkbox_none_disabled', ['fill-6-cl', 'special-4-cl']);
      }
      return this.getIconPath('checkbox_none', 'special-4-cl');
    },
    // 选中
    selectedHtml() {
      if (this.disabled) {
        return this.getIconPath('checkbox_selected_disabled', ['fill-6-cl', 'special-4-cl', 'text-3-cl']);
      }
      return this.getIconPath('checkbox_selected', ['main-1-cl', '#fff']);
    },
    // 半选中
    partSelectedHtml() {
      if (this.disabled) {
        return this.getIconPath('checkbox_part_disabled', ['fill-6-cl', 'special-4-cl', 'text-3-cl']);
      }
      return this.getIconPath('checkbox_part', ['main-1-cl', '#fff']);
    },
  },
  methods: {
    getIconPath,
    handClick() {
      if (this.disabled) return;
      this.$emit('click', !this.value);
    },
  },
};
</script>
<style lang='stylus'>
.common-checkout {
  display: inline-block;
  cursor: pointer;
  vertical-align:middle;
  .checkout-content {
    display: flex;
    line-height: 1;
  }
  .icon {
    vertical-align: middle;
    margin-right: 3px;
    flex-shrink: 0;
    fill: none;
  }

  .checkbox-disabled {
    cursor: not-allowed;
  }
}
</style>
