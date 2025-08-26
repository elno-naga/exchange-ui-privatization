// Created by 任泽阳 on 18/12/17. // 复选框组件
<template>
  <section class='common-redio' @click='handClick'>
    <div
        v-if="type === 'option'"
        class="redio-option-content fill-3-bg"
        :class="{'fill-3-bd': !value, 'main-1-bd': value}">
      <slot></slot>
      <div v-show="value" class="option-active">
        <svg
            class="icon icon-24"
            viewBox="0 0 1024 1024"
            v-html="getIconPath('selected_subscript', 'main-1-cl')">
        </svg>
      </div>
    </div>
    <div v-else class="redio-content">
      <!-- 未选中 -->
      <svg
          v-if="!value"
          class="icon"
          :class="[fontClass, { 'redio-disabled': disabled }]"
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          v-html="noneHtml">
      </svg>
      <!-- 选中 -->
      <svg
          v-else
          class="icon"
          :class="[fontClass, { 'redio-disabled': disabled }]"
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          v-html="checkedHtml">
      </svg>
      <slot></slot>
    </div>
  </section>
</template>

<script>
import { colorMap, getIconPath } from '../../../../utils';

export default {
  name: 'c-redio',
  props: {
    type: { default: '', type: String }, // option为带边框
    value: { default: false, type: Boolean },
    name: { default: '', type: String },
    fontClass: { default: 'icon-14', type: String },
    disabled: { default: false, type: Boolean }, // 是否可点击
  },
  data() {
    return {
      colorMap,
      getIconPath,
    };
  },
  computed: {
    noneHtml() {
      if (this.disabled) {
        return getIconPath('radio_none_disabled', ['fill-6-cl', 'special-4-cl']);
      }
      return getIconPath('radio_none', 'special-4-cl');
    },
    // 选中
    checkedHtml() {
      if (this.disabled) {
        return getIconPath('radio_checked_disabled', ['fill-6-cl', 'special-4-cl', 'text-3-cl']);
      }
      return getIconPath('radio_checked', ['main-1-cl', 'text-4-cl']);
    },
  },
  methods: {
    handClick() {
      if (this.disabled) return;
      this.$emit('click', this.name);
    },
  },
};
</script>
<style lang='stylus'>
.common-redio {
  display: inline-block;
  cursor: pointer;
  vertical-align:middle;

  .redio-content {
    display: flex;
    line-height: 1;
  }

  .redio-list-content {
    padding: 14px 16px;
    border-radius: 4px;
    border-width: 1.5px;
    border-style: solid;
    position: relative;

    .option-active {
      position: absolute;
      top: -1px;
      right: -1px;
    }
  }

  .icon {
    flex-shrink: 0;
    fill: none;
  }

  .redio-disabled {
    cursor: not-allowed;
  }
}
</style>
