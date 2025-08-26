<template>
  <section class="v5-input-formulate" :class="[className]" :style="stylees">
    <!-- 提示信息 -->
    <div class="input_line_prompt" :class="promptClass">
      {{ promptText }}
      <span class="clear main-1-cl" @click="clear" v-if="clearable">{{
        $t("login.clear")
      }}</span>
    </div>
    <div
      class="input-warp"
      @input="inputEvent"
      @keydown="keydown"
      @paste="paste"
    >
      <template v-for="item in inputMaxNum">
        <div
          :key="item"
          class="content"
          :class="[
            isHoverObj[`isHover${item}`] || isFocusObj[`isFocus${item}`]
              ? 'main-1-bd'
              : 'fill-3-bd',
            isError ? 'fall-1-bd' : '',
            defaultbg
          ]"
          :style="[inputStyles, inputWidthStyles]"
          @mouseenter="handMouseenter(item)"
          @mouseleave="handMouseleave(item)"
        >
          <input
            type="text"
            v-model="inputValObj[`inputVal${item}`]"
            :name="`v5Input${item}`"
            :ref="`v5Input${item}`"
            autocomplete="off"
            :data-index="item"
            class="text-1-cl input_line"
            :style="{ height: inputWidth }"
            @focus="handFocus(item)"
            @blur="handBlur(item)"
          />
        </div>
      </template>
    </div>

    <div>
      <div class="input-errorStence">
        <!-- 错误信息容器 -->
        <p class="input-line-error fall-1-cl" v-if="isError">
          {{ currentErrorText }}
        </p>
      </div>
      <div class="slot-class">
        <slot />
      </div>
    </div>
  </section>
</template>
<script>
export default {
  name: 'c-v5-inputFormulate',
  data() {
    return {
      // value: "",
      currentVal: '',
      currentErrorFlag: '',
      currentErrorText: '',
      isHoverObj: {},
      isFocusObj: {},
      inputValObj: {},
      nowValue: '', // 内部双向数据绑定
    };
  },
  props: {
    name: { default: '', type: String }, // 名称标识
    className: { default: '', type: String }, // class根容器
    promptText: { default: '', type: String }, // 提示文案
    promptClass: { default: 'text-2-cl', type: String }, // 提示文案样式
    // 是否开启 清空选项的功能
    clearable: { type: Boolean, default: false },
    // 限制空格
    noSpace: { type: Boolean, default: false },
    errorFlag: { default: false, type: Boolean }, // 错误文案是否显示
    errorText: { default: '', type: String }, // 错误提示
    // 宽度 （字符串 后面加单位 px %）
    width: { type: [String], default: '100%' },
    inputWidth: { type: [String], default: '48px' },
    // 样式
    value: { default: '', type: String }, // 外部 v-model 传入的植
    styles: { type: [Object, String], default: '' },
    inputStyle: { type: [Object, String], default: '' },
    inputMaxNum: { type: Number, default: 6 },
    defaultbg: { type: String, default: 'fill-3-bg' },
  },
  created() {
    this.$bus.$off('v5Input-focus');
    this.$bus.$on('v5Input-focus', (name) => {
      if (name === this.name) {
        this.focusFn();
      }
    });
    for (let i = 1; i <= this.inputMaxNum; i += 1) {
      this.isHoverObj[`isHover${i}`] = false;
      this.isFocusObj[`isFocus${i}`] = false;

      this.inputValObj[`inputVal${i}`] = '';
    }
    this.currentErrorFlag = this.errorFlag;
    this.currentErrorText = this.errorText;
  },
  mounted() {
    if (this.value) {
      const nowValue = this.noSpace
        ? this.value.replace(/\s+/g, '')
        : this.value;
      this.splitFn(nowValue);
    }
    this.$nextTick(() => {
      if (this.$refs.v5Input1) {
        this.$refs.v5Input1[0].focus();
      }
    });
  },
  computed: {
    errorHave() {
      return this.isError;
    },
    isError() {
      return this.currentErrorFlag && !this.isFocus;
    },

    inputWidthStyles() {
      return { width: this.inputWidth, height: this.inputWidth };
    },
    stylees() {
      const styles = this.styles || {};
      if (this.width) styles.width = this.width;
      return styles;
    },
    inputStyles() {
      const styles = this.inputStyle || {};
      return styles;
    },
  },
  watch: {

  },
  methods: {
    failedCallback(msg) {
      // 提交失败的回调
      this.currentErrorFlag = true;
      this.currentErrorText = msg;

      setTimeout(() => {
        this.clearValFn();
      }, 1500);
    },
    splitFn(nowValue) {
      for (let i = 1; i <= nowValue.length; i += 1) {
        this.inputValObj = {
          ...this.inputValObj,
          [`inputVal${i}`]: nowValue[i - 1],
        };
      }
    },
    clear() {
      this.clearValFn();
      // 第一个输入框获取焦点
      this.$nextTick(() => {
        if (this.$refs.v5Input1) {
          this.$refs.v5Input1[0].focus();
        }
      });
    },
    // input 鼠标划入
    handMouseenter(index) {
      this.isHoverObj = { ...this.isHoverObj, [`isHover${index}`]: true };
    },
    // input 鼠标划出
    handMouseleave(index) {
      this.isHoverObj = { ...this.isHoverObj, [`isHover${index}`]: false };
    },
    // input 获取焦点
    handFocus(index) {
      // this.$emit("focus");
      this.isFocusObj = { ...this.isFocusObj, [`isFocus${index}`]: true };
    },
    // input 失去焦点
    handBlur(index) {
      // this.$emit("blur");
      this.isFocusObj = { ...this.isFocusObj, [`isFocus${index}`]: false };
    },
    keydown(e) {
      const { index } = e.target.dataset;

      if (e.key === 'Home') {
        this.$nextTick(() => {
          if (this.$refs.v5Input1) {
            this.$refs.v5Input1[0].focus();
          }
        });
      }
      if (e.key === 'End') {
        this.$nextTick(() => {
          if (this.$refs[`v5Input${this.inputMaxNum}`]) {
            this.$refs[`v5Input${this.inputMaxNum}`][0].focus();
          }
        });
      }
      if (e.key === 'ArrowLeft') {
        this.$nextTick(() => {
          if (this.$refs[`v5Input${+index - 1}`]) {
            this.$refs[`v5Input${+index - 1}`][0].focus();
          }
        });
      }
      if (e.key === 'ArrowRight') {
        this.$nextTick(() => {
          if (this.$refs[`v5Input${+index + 1}`]) {
            this.$refs[`v5Input${+index + 1}`][0].focus();
          }
        });
      }
      if (e.key === 'Backspace') {
        this.$nextTick(() => {
          if (
            this.inputValObj[`inputVal${+index}`] === ''
            && this.$refs[`v5Input${+index - 1}`]
          ) {
            this.$refs[`v5Input${+index - 1}`][0].focus();
          }
          this.inputValObj = { ...this.inputValObj, [`inputVal${+index}`]: '' };
        });
      }
      if (e.key === 'Delete') {
        this.clear();
      }
    },
    inputEvent(e) {
      this.currentErrorFlag = false;
      const { index } = e.target.dataset;
      // 如果输入框的值有不是数字
      if (!/^[0-9]{1,}$/.test(e.target.value)) {
        // \S匹配任何可见字符   Backspace不会报错
        if (/^\S{1,}$/.test(e.target.value)) {
          this.currentErrorFlag = true;
          setTimeout(() => {
            this.clearValFn();
          }, 1500);
        } else {
          this.currentErrorFlag = false;
        }

        // 清空输入框
        e.target.value = '';
        this.inputValObj = {
          ...this.inputValObj,
          [`inputVal${+index}`]: '',
        };
        return;
      }

      // 只能输入一个，用新输入的值替换旧的
      if (e.target.value.length >= 1) {
        if (e.data) {
          e.target.value = e.data;
        }
        this.inputValObj = {
          ...this.inputValObj,
          [`inputVal${+index}`]: e.target.value,
        };
      }

      // 获取现在输入了多少个验证码，没有全部输入则继续，如果全部输入就提交
      const allval = Object.values(this.inputValObj).filter((item) => item);
      if (allval.length < this.inputMaxNum) {
        this.$nextTick(() => {
          if (this.$refs[`v5Input${+index + 1}`]) {
            this.$refs[`v5Input${+index + 1}`][0].focus();
          }
        });
      } else {
        document.activeElement.blur();
        this.joinValFn();
      }
    },

    paste(e) {
      // 当进行粘贴时
      e.clipboardData.items[0].getAsString((str) => {
        console.log(str);
        const newStr = str.replace(/\s+/g, '');
        if (newStr.toString().length === this.inputMaxNum) {
          document.activeElement.blur();
          if (/^\d{0,}$/.test(newStr)) {
            this.splitFn(newStr);
            this.joinValFn();
          } else {
            // 如果粘贴内容不合规，清除所有内容
            this.currentErrorFlag = true;
            this.clearValFn();
          }
        } else {
          // 如果粘贴内容不合规，清除所有内容
          this.currentErrorFlag = true;
          this.clearValFn();
        }
      });
    },
    clearValFn() {
      this.currentErrorFlag = false;
      for (let i = 1; i <= this.inputMaxNum; i += 1) {
        this.inputValObj = {
          ...this.inputValObj,
          [`inputVal${i}`]: '',
        };
      }
    },
    // 合并输入框的值，并触发onChanges
    joinValFn() {
      const vals = Object.values(this.inputValObj);
      if (vals) {
        this.currentVal = Object.values(this.inputValObj).join('');
        this.$emit('onChanges', this.currentVal, this.name);
      }
    },
  },
};
</script>
<style lang='stylus'>
.v5-input-formulate {
  box-sizing: border-box;
  transition: all 0.3s;
  display: inline-block;
  position: relative;
  font-family: HarmonyOS-Medium;

  .input-warp {
    display: flex;
    justify-content: space-between;
  }

  // 提示文案容器
  .input_line_prompt {
    line-height: 16px;
    font-size: 14px;
    user-select: none;
    margin-bottom: 16px;
  }

  .content {
    align-items: center;
    border-radius: 4px;
    border-width: 1px;
    border-style: solid;
    box-sizing: border-box;
    position: relative;
    -webkit-transition: 0.3s;
    transition: 0.3s;

    input {
      width: 0;
      flex: 1;
      padding: 0 12px;
      outline: none;
      font-family: HarmonyOS-Medium;
      width: 100%;
      box-sizing: border-box;
      text-align: center;
      caret-color: transparent;
      font-size:16px;
    }

    .input-line-slot {
      position: absolute;
      right: 0;
      bottom: 50%;
      transform: translate(0, 50%);
    }

    input::-webkit-inner-spin-button {
      -webkit-appearance: none;
    }

    input::-webkit-outer-spin-button {
      -webkit-appearance: none;
    }
  }

  .clear {
    float: right;
    cursor: pointer;
  }

  // 错误信息占位容器
  .input-errorStence {
    height: 30px;
    line-height: 30px;
    float: left;
    font-size: 12px;

    // 错误文案容器
    .input-line-error {
      // position: absolute;
      // top: 8px;
      // margin: 0;
      // font-size: 12px;
      // user-select: none;
    }

    // 警示框
    .input-line-warning {
      position: absolute;
      top: 8px;
      margin: 0;
      font-size: 12px;
      user-select: none;
    }
  }

  // 插槽样式
  .slot-class {
    float: right;

    .common-getCode {
      .common-button {
        padding: 0 !important;
        background: transparent  !important
        &:hover{
          background: transparent  !important
        }
      }
    }
  }
}
</style>
