<template>
  <section
    class="common-input-content"
    :class="[statusClass, className, sizeClass]"
    :style="stylees"
    @mouseenter="handMouseenter"
    @mouseleave="handMouseleave"
  >
    <!-- 提示信息 -->
    <div v-if="showPrompt" class="input_line_prompt" :class="promptClass">
      <slot name="promptExtend">{{ promptText }}</slot>
    </div>
    <div
      class="content"
      :class='contentClass'
      :style="{height: inputHeight}">
      <!-- 显示在输入框左侧（输入框里面） -->
      <c-v6-tooltip
          :content="prependTip"
          trigger="hover"
          :disabled="!(prependTip)"
          maxWidth="200"
          :toolTipClass="toolTipClass"
          :styles="toolTipStyle"
      >
        <div v-if="prependTitle&&prependTitle!==' '"
             class="contentTitle" :class="prependTitleClass">
          {{prependTitle}}
        </div>
      </c-v6-tooltip>
      <input
         v-if="!disabledText"
        :type="inputType"
        v-model="curValue"
        :disabled="disabled"
        :readonly="readonly"
        :maxlength="maxLength"
        ref="v5Input"
        :autocomplete="autocomplete"
        class="input_line"
        :class="[valueClass,enterDirection,typeClass]"
        :placeholder="placeholder || promptText"
        @focus="handFocus"
        @blur="handBlur"
      />
      <span class="clear" @click="clear" @mousedown.prevent v-show="showClear">
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
      <span
        class="password-toggle-icon"
        @click="togglePasswordShow"
        @mousedown.prevent
        v-show="type === 'password'"
      >
        <template v-if="inputType !== 'password'">
          <svg
            v-html="getIconPath('eyeOpen', 'special-4-cl')"
            class="hoverHide icon icon-14"
            viewBox="0 0 1024 1024"
          ></svg>
          <svg
            v-html="getIconPath('eyeOpen', 'special-5-cl')"
            class="hoverShow icon icon-14"
            viewBox="0 0 1024 1024"
          ></svg>
        </template>
        <template v-else>
          <svg
            v-html="getIconPath('eyeClose', 'special-4-cl')"
            class="hoverHide icon icon-14"
            viewBox="0 0 1024 1024"
          ></svg>
          <svg
            v-html="getIconPath('eyeClose', 'special-5-cl')"
            class="hoverShow icon icon-14"
            viewBox="0 0 1024 1024"
          ></svg>
        </template>
      </span>
      <p v-if="disabledText&&clickClearDisabled" @click="clearPercentage" :class="disabledClass">{{disabledText}}</p>
      <p v-if="disabledText&&!clickClearDisabled" :class="disabledClass">{{disabledText}}</p>
      <span style="margin-right:12px;display: flex;">
        <slot class="suffix" name="append"></slot>
      </span>
    </div>
    <div class="input-line-errorStence" :class="errorClass" v-if="errorHave">
      <!-- 错误信息容器 -->
      <p class="input-line-error fall-1-cl" v-if="isError">
        {{ errorText }}
      </p>
      <!-- 警示文案 -->
      <p class="input-line-warning" :style="warningStyle" v-else-if="warningFlag">
        {{ warningText }}
      </p>
    </div>
  </section>
</template>
<script>
import { colorMap, getIconPath, fixInput } from '@/utils';

export default {
  name: 'c-v6-input',
  props: {
    name: { default: '', type: String }, // 名称标识
    type: { default: 'text', type: String }, // 输入框类型
    className: { default: '', type: String }, // class根容器
    disabled: { default: false, type: Boolean }, // 是否为禁用
    readonly: { default: false, type: Boolean }, // 是否为只读
    showPrompt: { type: Boolean, default: true }, // 显示标题
    promptText: { default: '', type: String }, // 标题文案
    promptClass: { default: 'text-2-cl', type: String }, // 标题样式
    bdClass: { default: '', type: String }, // border class
    bgClass: { default: '', type: String }, // background class
    placeholder: { default: '', type: String }, // 提示文案
    value: { default: '', type: [String, Number] }, // 外部 v-model 传入的植
    errorStyle: { type: String, default: 'position' }, // 错误提示样式 position-定位 block-占位
    errorFlag: { default: false, type: Boolean }, // 错误文案是否显示
    errorText: { default: '', type: String }, // 错误提示
    warningText: { default: '', type: String }, // 是否有警示文案
    // eslint-disable-next-line vue/require-valid-default-prop
    warningStyle: { default: () => {}, type: Object },
    clearable: { type: Boolean, default: false }, // 是否开启 清空选项的功能
    noSpace: { type: Boolean, default: false }, // 限制空格
    maxLength: { type: [Number, String], default: null },
    width: { type: [String], default: '100%' }, // 宽度 （字符串 后面加单位 px %）
    size: { type: [String], default: 'lg' }, // 框的size
    styles: { type: [Object, String], default: '' }, // 样式
    inputHeight: { type: String, default: '' }, // input height
    rows: {
      type: Number,
      default: 3,
    },
    fixValue: {
      type: Number,
      default: null,
    }, // 处理显示精度
    format: {
      type: Function,
      default: null,
    }, // 格式化
    keypress: {
      type: Function,
      default: null,
    },
    autocomplete: {
      type: Boolean,
      default: false,
    },
    // 输入框的输入方向 *支持 左/右
    enterDir: {
      type: String,
      default: 'left',
    },
    // 输入框左侧提示内容 *显示在输入框里面
    prependTitle: {
      type: String,
      default: '',
    },
    // 输入框左侧提示内容 *显示在输入框里面 class
    prependTitleClass: {
      type: String,
      default: '',
    },
    // 输入框左侧提示内容 tips 提示
    prependTip: {
      type: String,
      default: '',
    },
    toolTipClass: {
      type: String,
      default: 'fill-5-bg text-1-cl',
    },
    toolTipStyle: { type: [Object, String], default: '' },
    // 输入框禁用后显示的文案
    disabledText: {
      type: String,
      default: '',
    },
    disabledTextClass: {
      type: String,
      default: '',
    },
    // 是否开启点击显示输入框
    clickClearDisabled: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      colorMap,
      isHover: false,
      isFocus: false,
      inputType: 'text',
      nowValue: '', // 内部双向数据绑定
      isShowPrependTip: false,
    };
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
        if (this.noSpace) {
          nowValue = value.replace(/\s+/g, '');
        }
        // 处理数字
        if (this.fixValue !== null) {
          nowValue = fixInput(value, this.fixValue);
          this.$forceUpdate();
        }
        // 有格式化
        if (this.format) {
          nowValue = this.format(value);
          this.$forceUpdate();
        }
        this.$emit('onChanges', nowValue, this.name);
      },
    },
    // 提示文案
    warningFlag() {
      let flag = false;
      if (this.warningText.length) {
        if (!(this.errorFlag && !this.isFocus)) {
          flag = true;
        }
      }
      return flag;
    },
    errorHave() {
      return this.isError || this.warningFlag;
    },
    isError() {
      return this.errorFlag && !this.isFocus;
    },
    statusClass() {
      if (this.disabled) {
        return 'input-disabled';
      }
      return '';
    },
    contentClass() {
      let bdClass = this.bdClass || 'fill-3-bd';
      let bgClass = this.bgClass || 'fill-3-bg';
      if (this.disabled) {
        bdClass = 'fill-7-bd';
        bgClass = 'fill-7-bg';
      } else if (this.isError) {
        bdClass = 'fall-1-bd';
      } else if (this.isHover || this.isFocus) {
        bdClass = 'main-1-bd';
      }
      return `${bgClass} ${bdClass}`;
    },
    valueClass() {
      if (this.disabled) {
        return 'text-2-cl';
      }
      return 'text-1-cl';
    },
    enterDirection() {
      if (this.enterDir) {
        return `text-dir-${this.enterDir}`;
      }
      return 'text-dir-left';
    },
    typeClass() {
      if (this.inputType === 'password') {
        return 'passwordInput';
      }
      return '';
    },
    stylees() {
      const styles = this.styles || {};
      if (this.width) styles.width = this.width;
      return styles;
    },
    showClear() {
      return this.curValue && this.clearable && this.isFocus && this.type !== 'textarea';
    },
    errorClass() {
      return `input-error-${this.errorStyle}`;
    },
    sizeClass() {
      return `common-${this.size}-input`;
    },
    disabledClass() {
      if (this.disabledTextClass) {
        return `disabledText ${this.disabledTextClass}`;
      }
      return 'disabledText text-3-cl';
    },
  },
  watch: {
    type(v) {
      this.inputType = v;
    },
  },
  created() {
    this.$bus.$off('v5Input-focus');
    this.$bus.$on('v5Input-focus', (name) => {
      if (name === this.name) {
        this.focusFn();
      }
    });
    this.inputType = this.type;
  },
  methods: {
    getIconPath,
    focusFn() {
      this.$nextTick(() => {
        this.$refs.v5Input.focus();
      });
    },
    clear() {
      this.$emit('onChanges', '', this.name);
    },
    togglePasswordShow() {
      this.inputType = this.inputType === 'password' ? 'text' : 'password';
    },
    // input 鼠标划入
    handMouseenter() {
      if (this.disabled || this.readonly) return;
      this.isHover = true;
    },
    // input 鼠标划出
    handMouseleave() {
      if (this.disabled || this.readonly) return;
      this.isHover = false;
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
    clearPercentage() {
      this.$emit('clearPercentage');
      setTimeout(() => {
        this.$refs.v5Input.focus();
      });
    },
  },
};
</script>
<style lang="stylus" scoped>
.common-input-content {
  box-sizing: border-box;
  transition: all 0.3s;
  display: inline-block;
  position: relative;
  font-family: HarmonyOS-Medium;
  font-weight: 500;
  font-size: 14px;

  &.common-lg-input {
    .content {
      height: 44px;
      .contentTitle{
        font-size:14px;
      }
    }
  }

  &.common-md-input {
    .content {
      height: 40px;
      .contentTitle{
        font-size:14px;
      }
    }
  }

  &.common-sm-input {
    .content {
      height: 32px;
      .contentTitle{
        font-size:12px;
      }
    }
  }
  // 提示文案容器
  .input_line_prompt {
    line-height: 16px;
    font-size: 14px;
    user-select: none;
    margin-bottom: 8px;
  }
  .content {
    width: 100%;
    display: flex;
    align-items: center;
    border-radius: 4px;
    border-width: 1px;
    border-style: solid;
    box-sizing: border-box;
    position: relative;
    -webkit-transition: 0.3s;
    transition: 0.3s;
    .contentTitle{
      padding-left:12px;
      font-family: HarmonyOS-Medium;
      font-weight: 500;
    }
    .disabledText {
      font-size: 14px;
      flex: 1;
      text-align: right;
      padding-right: 0;
      box-sizing: border-box;
    }
    input {
      width: 0;
      height: 100%;
      flex: 1;
      padding: 0 12px;
      outline: none;
      font-family: HarmonyOS-Medium;
      font-size: 14px;

      &.passwordInput {
        font-family: HarmonyOS-Medium;
      }
    }
    input.text-dir-left{
      text-align:left;
    }
    input.text-dir-right{
      text-align:right;
    }
    input::-webkit-inner-spin-button {
      -webkit-appearance: none;
    }
    input::-webkit-outer-spin-button {
      -webkit-appearance: none;
    }
    input:-webkit-autofill,
    input:-webkit-autofill:hover,
    input:-webkit-autofill:focus,
    input:-webkit-autofill:active {
      & + * {
        cursor: auto;
        transform: translate3d(0, 0, 0);
        transform-origin: top left;
      }
    }
  }
  .clear {
    margin-right: 12px;
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
  .password-toggle-icon {
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
  // 禁用
  &.input-disabled {
    .input_line {
      cursor: no-drop;
    }
  }
  // 错误信息占位容器
  .input-line-errorStence {
    width: 100%;
    &.input-error-position {
      position: relative;
      // 错误文案容器
      .input-line-error {
        position: absolute;
        top: 4px;
        line-height: 16px;
        user-select: none;
      }
      // 警示框
      .input-line-warning {
        position: absolute;
        top: 4px;
        line-height: 16px;
        user-select: none;
      }
    }
    &.input-error-block {
      margin-top: 4px;
      position: static;

      // 错误文案容器
      .input-line-error {
        position: static;
        user-select: none;
        line-height: 16px;
      }
      // 警示框
      .input-line-warning {
        position: static;
        user-select: none;
      }
    }
  }
  .tip-shows2-enter-active {
    transition: all 0.2s 0.5s ease;
  }

  .tip-shows2-leave-active {
    transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1);
  }

  .tip-shows2-enter, .tip-shows2-leave-to {
    transform: translateY(10px);
    opacity: 0;
  }
}
</style>
