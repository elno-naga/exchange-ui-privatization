<template>
  <!-- 搜索 -->
  <div
      class="common-search"
      :style="contentStyle"
      :class="[contentClass, className, sizeClass]"
      @mouseover="isHover = true"
      @mouseout="isHover = false"
  >
    <svg
        v-if="!iconHide"
        v-html="getIconPath('search', ['text-3-cl'])"
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
    ></svg>
    <input
        v-model="curValue"
        @focus="handFocus"
        @blur="handBlur"
        ref="inputFind"
        placeholder-class="text-3-cl"
        :class="inputClass"
        type="text"
        :placeholder="placeholder"
    />
    <span class="clear" v-show="showClear" @click="clear" @mousedown.prevent>
      <svg
          v-html="getIconPath('clear', 'special-4-cl')"
          class="hoverHide icon icon-20"
          viewBox="0 0 1024 1024"
      ></svg>
      <svg
          v-html="getIconPath('clear', 'special-5-cl')"
          class="hoverShow icon icon-20"
          viewBox="0 0 1024 1024"
      ></svg>
    </span>
  </div>
</template>
<script>
import { colorMap, getIconPath } from '../../../../utils';

export default {
  name: 'c-v6-search',
  data() {
    return {
      colorMap,
      nowValue: '', // 内部双向数据绑定
      isHover: false,
      isFocus: false,
    };
  },
  props: {
    type: {
      validator(val) {
        return ['default', 'dropDown'].indexOf(val) !== -1;
      },
      default: 'default',
    },
    width: { default: '', type: String }, // 该容器根容器 width属性
    height: { default: '', type: String }, // 该容器根容器 height
    size: { default: 'sm', type: String }, // size
    name: { default: '', type: String }, // 名称标识
    className: { default: '', type: String }, // class根容器
    placeholder: { default: '', type: String }, // 提示文案
    value: { default: '', type: String }, // 外部 v-model 传入的植
    lightColour: { default: false, type: Boolean }, // 是否为浅色版
    clearable: { default: true, type: Boolean },
    iconHide: { default: false, type: Boolean },
    inputClass: { default: 'text-1-cl', type: String },
    maxLength: {
      type: [Number, String],
      default: null,
    },
  },
  created() {
    this.$bus.$off('search-focus');
    this.$bus.$on('search-focus', (name) => {
      if (name === this.name) {
        this.focusFn();
      }
    });
  },
  computed: {
    curValue: {
      get() {
        return this.value;
      },
      set(value) {
        let nowValue = value;
        // 限制最长长度
        if (this.maxLength && value.length > this.maxLength) {
          nowValue = value.substring(0, this.maxLength);
        }
        // 限制空格
        if (value.indexOf(' ') !== -1) {
          const arr = nowValue.split(' ');
          let str = '';
          arr.forEach((item) => {
            str += item;
          });
          nowValue = str;
        }
        this.$emit('onChanges', nowValue, this.name);
      },
    },
    contentClass() {
      if (this.type === 'dropDown') {
        if (this.isHover || this.isFocus) {
          return 'main-1-bd special-6-bg';
        }
        return 'special-6-bd special-6-bg';
      }
      if (this.isHover || this.isFocus) {
        return 'main-1-bd fill-3-bg';
      }
      return 'fill-3-bd fill-3-bg';
    },
    contentStyle() {
      const { width, height } = this.$props;
      return {
        width: width || '100%',
        height,
      };
    },
    sizeClass() {
      return `common-${this.size}-search`;
    },
    showClear() {
      return this.curValue && this.clearable && this.isFocus;
    },
  },
  methods: {
    getIconPath,
    focusFn() {
      this.$nextTick(() => {
        this.$refs.inputFind.focus();
      });
    },
    clear() {
      this.$emit('onChanges', '', this.name);
    },
    // input 获取焦点
    handFocus() {
      this.$emit('focus');
      this.isFocus = true;
    },
    // input 失去焦点
    handBlur() {
      this.$emit('blur');
      this.isFocus = false;
    },
  },
};
</script>
<style lang='stylus'>
.common-search {
  position: relative;
  border-radius: 100px;
  overflow: hidden;
  border-width: 1px;
  border-style: solid;
  box-sizing: border-box;
  transition: all 0.3s;
  display: flex;
  padding: 0 16px;
  align-items: center;
  font-family: HarmonyOS-Medium;

  &.common-lg-search {
    height: 44px;
  }

  &.common-md-search {
    height: 40px;
  }

  &.common-sm-search {
    height: 32px;
  }

  input {
    width: 0;
    flex: 1;
    padding-left: 8px;
    height: 100%;
    font-family: HarmonyOS-Medium;
    font-size: 14px;
  }

  .clear {
    cursor: pointer;
    display: flex;

    .icon {
      vertical-align: 0;
    }

    .hoverShow {
      display: none;
    }

    &:hover {
      .hoverHide {
        display: none;
      }

      .hoverShow {
        display: inline-block;
      }
    }
  }
}
</style>
