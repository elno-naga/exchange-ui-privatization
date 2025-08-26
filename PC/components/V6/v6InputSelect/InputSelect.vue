<template>
  <div
      :class='classes'
      :style='stylees'
      :id='elementId'
      ref="cSelect"
      v-click-outside.capture='onClickOutside'
      v-click-outside:mousedown.capture='onClickOutside'
  >
    <!-- 提示信息 -->
    <div v-if="showPrompt" class="input_line_prompt" :class="promptTextClass">
      <slot name="promptExtend">
        {{ promptText }}
      </slot>
    </div>
    <!-- 展示容器 -->
    <div
        class='input_line_content'
        :class="contentClass"
        :style="{ height: inputHeight }"
        @mouseover='mouseOverInput'
        @mouseout='mouseOutInput'
    >
      <div class="input-comp">
        <!-- 输入框 -->
        <input
            class='input_line_inp_number'
            :class="selectedClass"
            type='text'
            required
            :disabled="disabled"
            v-model='curValue'
            @blur='blurInput'
            :placeholder="promptText1"
            @input="inputChange"
        />
        <div class='input-line-slot clearfix' ref='slot'>
          <slot />
        </div>
      </div>
      <div class="select-comp" @click="toggleMenu">
        <!-- 下拉框显示 -->
        <img class="select-img" v-if="img && showIcon" :src="img" alt="" />
        <div v-else-if="icon && bg && showIcon" :style="{background: bg}" class="normal-logo colorWhite is-selected">
          {{icon}}
        </div>
        <div v-else-if="showIcon && values" class="normal-logo colorWhite rise-1-bg is-selected">
          {{values.substring(0,1)}}
        </div>
        <label
            class="input_line_inp"
            for="input_line_inp"
            :class="selectedClass">
          {{ values }}
        </label>
        <!-- 三角ICON -->
        <svg
            class="icon icon-10 icon-triangle"
            viewBox="0 0 1024 1024"
            v-html="getIconPath('triangle', 'special-4-cl')">
        </svg>
      </div>
    </div>
    <!-- 错误信息容器 -->
    <div class='input_line_errorStence' v-show='errorHave && isError'>
      <p class='input_line_error fall-1-cl' v-show='isError'>{{ errorText }}</p>
    </div>
    <transition name='slideInDown'>
      <div
          v-show='visible'
          class='select-options-box text-1-cl special-1-bg'
      >
        <div v-if="filterable" class="select-filter">
          <c-v6-search
              :value="searchValue"
              type="dropDown"
              clearable
              @onChanges="search"/>
        </div>
        <div
            v-show='selectOption.length'
            class='select-option-list'
            :style='setBoxHeight'
        >
          <vue-scroll :ops="ops">
            <ul class="select-option">
              <li
                  class='select-option-item'
                  v-for='(item, index) in selectOption'
                  :class='{ "special-2-bg": index === overInx }'
                  :key='index'
                  :style='optionStyle'
                  ref='selectLi'
                  @mouseover='mouseOver(index)'
                  @mouseout='mouseOut(index)'
                  @click='onOptionClick(item)'
              >
                <div class="item-text">
                  <img v-if="item.iconUrl && showIcon" :src="item.iconUrl" alt="" />
                  <div v-else-if="item.icon && item.bg && showIcon" :style="{background: item.bg}"
                       class="normal-logo colorWhite">
                    {{item.icon}}
                  </div>
                  <div v-else-if="showIcon && item.code"  class="normal-logo colorWhite rise-1-bg">
                    {{item.code.substring(0,1)}}
                  </div>
                  <div></div>
                  <span class="text">{{ item.value }}</span>
                  <span v-if="item.subValue" class="subText text-2-cl">{{ item.subValue }}</span>
                </div>
                <span v-if="item.label" class="label">{{ item.label }}</span>
              </li>
            </ul>
          </vue-scroll>
        </div>
        <div class='not_option text-2-cl' v-show='!selectOption.length'>
          <!-- 暂无数据 -->
          <img class="no_data_img" :src="imgMap.search_no_data" alt="">
          {{ $t('components.select.noData') }}
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { directive as clickOutside } from 'v-click-outside-x';
import {
  colorMap, getIconPath,
} from '../../../../utils';
import { imgMap } from '@/utils';

export default {
  name: 'c-v6-input-select',
  directives: { clickOutside },
  props: {
    promptText1: { default: '', type: String }, // 提示文案
    // 初始化默认 选中的值 String：直接显示，Number： 选项索引值
    value: {
      type: [String, Number],
      default: '',
    },
    volumes: {
      type: [String, Number],
      default: '',
    },
    // 选中文字颜色
    selectedClass: {
      type: String,
      default: 'text-1-cl',
    },
    options: {
      type: Array,
      default: () => [],
    },
    name: {
      type: String,
      default: '',
    },
    selectName: {
      type: String,
      default: 'selectName',
    },
    // Title
    showPrompt: {
      type: Boolean,
      default: false,
    },
    promptText: {
      type: String,
      default: '',
    },
    // Title
    promptClass: {
      type: String,
      default: '',
    },
    // 下拉框显示多少条，默认显示5条 多出显示滚动条
    optionNumber: {
      type: Number,
      default: 5,
    },
    // 选项列表 行高 默认40px
    optionHeight: {
      type: Number,
      default: 44,
    },
    // 是否开启搜索功能
    filterable: {
      type: Boolean,
      default: false,
    },
    // 是否关闭
    disabled: {
      type: Boolean,
      default: false,
    },
    // 错误提示语
    errorText: {
      type: String,
      default: '',
    },
    // 将 下拉框设置成错误状态
    errorFlag: {
      type: Boolean,
      default: false,
    },
    // 占位符
    placehoder: {
      type: String,
      default: '',
    },
    // 无数据 提示语
    notFoundText: {
      type: String,
      default: '无匹配数据',
    },
    // 下拉框的宽度 （字符串 后面加单位 px %）
    width: {
      type: [String],
      default: '',
    },
    // 下拉组件的高度
    height: {
      type: [String],
      default: '',
    },
    // 下拉框的高度
    inputHeight: {
      type: [String],
      default: '44px',
    },
    // 样式
    styles: {
      type: [Object, String],
      default: '',
    },
    elementId: {
      type: String,
      default: '',
    },
    // 是否需要验证
    errorHave: {
      type: Boolean,
      default: false,
    },
    // 是否显示 icon
    showIcon: {
      type: Boolean,
      default: false,
    },
    ruleFn: {
      type: Function,
      default: null,
    },
  },
  data() {
    return {
      imgMap,
      colorMap,
      getIconPath,
      // 存储选中的值 和 默认选中的值
      values: '',
      // 控制下拉框是都可见
      visible: false,
      // 选项列表是否有数据
      isNotOption: false,
      // 检索关键字
      searchValue: '',
      // isFocused
      isFocused: false,
      // 是否设置成错误状态
      isError: false,
      overInx: null,
      // 获取焦点开关TAG建
      focusFlang: false,
      inputHover: false, // 划过输入框
      searchFocus: false, // 搜索聚焦
      searchHover: false, // 搜索划过
      optionContentStyle: {},
      // 滚动条配置
      ops: {
        rail: {
          opacity: '0',
        },
        bar: {
          background: 'fill-6-bg',
          keepShow: true,
          size: '4px',
          minSize: 0.2,
        },
      },
      curValue: '',
    };
  },
  mounted() {
    if (this.value !== undefined && this.options.length) {
      this.values = this.getInitialValue(this.value);
    }
  },
  computed: {
    // curValue: {
    //   get() {
    //     return this.volumes;
    //   },
    //   set(v) {
    //     const value = v;
    //     this.$emit('inputchanges', value, this.name);
    //   },
    // },
    selectOption() {
      if (!this.options.length) return [];
      if (!this.options[0].code && this.options[0].code !== 0) {
        // console.error('options数据格式错误', this.options);
        return [];
      }
      if (!this.searchValue) return this.options;
      return this.options.filter((item) => {
        if (item.value.toUpperCase().indexOf(this.searchValue.toUpperCase()) !== -1) {
          return item;
        }
        return false;
      });
    },
    classes() {
      return [
        'common-quick-select',
        {
          'select-visible': this.visible,
          // 'select-disabled': this.disabled,
          'select-value': this.values,
          'select-filterable': this.filterable,
          'select-error': this.isError,
        },
      ];
    },
    stylees() {
      const styles = this.styles || {};
      if (this.width) styles.width = this.width;
      if (this.height) styles.height = this.height;
      return styles;
    },
    optionStyle() {
      const styles = {
        height: `${parseFloat(this.optionHeight)}px`,
        'line-height': `${parseFloat(this.optionHeight)}px`,
      };
      return styles;
    },
    setBoxHeight() {
      if (this.selectOption.length <= this.optionNumber) {
        return false;
      }
      return { height: `${this.optionNumber * this.optionHeight}px` };
    },
    contentClass() {
      let bdClass = 'fill-3-bd';
      let bgClass = 'fill-3-bg';
      if (this.disabled) {
        bdClass = 'fill-7-bd';
        bgClass = 'fill-7-bg';
      } else if (this.isError) {
        bdClass = 'fall-1-bd';
      } else if (this.inputHover || this.isFocused) {
        bdClass = 'main-1-bd';
      }
      return `${bgClass} ${bdClass}`;
    },
    promptTextClass() {
      if (this.isError) {
        return 'fall-1-cl';
      }
      if (this.promptClass) {
        return this.promptClass;
      }
      return 'text-1-cl';
    },
    searchClass() {
      if (this.searchFocus || this.searchHover) {
        return 'main-1-bd';
      }
      return 'fill-5-bd';
    },
    img() {
      if (this.options.length) {
        const val = this.options.find((item) => item.code === this.value);
        return val && val.iconUrl;
      }
      return '';
    },
    bg() {
      if (this.options.length) {
        const val = this.options.find((item) => item.code === this.value);
        return val && val.bg;
      }
      return '';
    },
    icon() {
      if (this.options.length) {
        const val = this.options.find((item) => item.code === this.value);
        return val && val.icon;
      }
      return '';
    },
    optionListStyle() {
      if (this.width) {
        return { width: `${this.width}px` };
      }
      return null;
    },
  },
  watch: {
    value(value) {
      if (value === undefined) this.values = '';
      else {
        this.values = this.getInitialValue(value);
      }
    },
    volumes(val) {
      console.log(this.curValue, 'com--', val);
      // if(this.curValue !== val){
      this.curValue = val;
      // }
    },
    options(list) {
      if (list && list.length && !this.values) {
        this.values = this.getInitialValue(this.value);
      }
    },
    visible(value) {
      if (!value && this.filterable && this.options.length) {
        this.options.forEach((item) => {
          if (item.code === this.value) {
            this.values = item.value;
          }
        });
      }
      this.$emit('opent-chang', value, this.name);
    },
    errorFlag(value) {
      this.isError = value;
    },
  },
  methods: {
    mouseOver(inx) {
      this.overInx = inx;
    },
    mouseOut() {
      this.overInx = null;
    },
    // 下拉框 显示&隐藏
    toggleMenu() {
      // 新增 如果禁用 则不展示下拉选项
      if (!this.focusFlang) {
        this.visible = !this.visible;
      } else {
        this.focusFlang = false;
      }
    },
    // 点击 select 以外 隐藏下拉框
    onClickOutside() {
      this.focusFlang = false;
      this.visible = false;
    },
    // 点击 选项
    onOptionClick(item) {
      this.searchValue = '';
      this.visible = false;
      this.isError = false;
      this.$emit('onChanges', item, this.selectName);
    },
    goUrl(item) {
      this.visible = false;
      this.$emit('onChanges', item, this.selectName);
    },
    // 聚焦
    inputFoucus() {
      this.isFocused = true;
      this.focusFlang = true;
      this.visible = true;
    },
    // 失焦
    blur() {
      this.isFocused = false;
    },
    // input 输入
    inputChange(e) {
      let val = e.target.value;
      if (this.ruleFn) {
        val = this.ruleFn(e.target.value);
      }
      this.curValue = val;
      this.$emit('inputchanges', val, this.name);
    },
    blurInput() {
      this.$emit('blurInput', this.name);
    },
    // 鼠标划过
    mouseOverInput() {
      this.inputHover = true;
    },
    // 划出
    mouseOutInput() {
      this.inputHover = false;
    },
    search(value) {
      this.searchValue = value;
    },
    // 设置 显示的Value;
    getInitialValue(value) {
      // 如果是 true  表示 value  是搜索是输入的值
      let text;
      if (this.isFocused && this.filterable) {
        text = value;
      } else if (this.options.length) {
        this.options.forEach((item) => {
          if (item.code === value) {
            text = item.value;
          }
        });
      }
      return text;
    },
  },
};
</script>

<style scoped lang='stylus'>
.common-quick-select {
  position: relative;
  cursor: pointer;
  display: inline-block;
  font-family: HarmonyOS-Medium;

  .colorWhite {
    color: white;
  }
  // 展示容器
  .input_line_content {
    width: 100%;
    height: 44px;
    padding-left: 12px;
    position: relative;
    border-style solid
    border-width 1px
    border-radius: 4px;
    box-sizing: border-box;
    -webkit-transition: 0.3s;
    transition: 0.3s;
    cursor: pointer;
    display: flex;
    align-items: center;
  }

  .input-comp {
    flex: 1;
    display: flex;
    align-items: center;
    height: 100%;
  }
  .select-comp {
    display: flex;
    align-items: center;
    height: 100%;
  }
  .select-img {
    width: 20px;
    height: 20px;
    border-radius: 100%;
    margin-right: 4px;
  }
  .normal-logo {
    width: 20px;
    height: 20px;
    border-radius: 100%;
    margin-right: 8px;
    text-align: center;
    line-height:20px;
    font-size: 12px;
    overflow:hidden;

    &.is-selected {
      width: 16px;
      height: 16px;
      line-height: 16px;
      margin-right: 4px;
    }
  }
  .input_line_inp_number{
    flex: 1;
  }
  // 输入框容器
  .input_line_inp {
    flex: 1;
    font-size: 14px;
    outline: none;
    font-family: HarmonyOS-Medium;
    line-height: 16px;
    cursor: pointer;
  }
  .input_line_inp_number{
    font-family: HarmonyOS-Medium;
  }
  // 提示文案容器
  .input_line_prompt {
    line-height: 16px;
    font-size: 14px;
    user-select: none;
    margin-bottom: 8px;
  }
  // 错误信息占位容器
  .input_line_errorStence {
    width: 100%;
    position: relative;
    // 错误文案容器
    .input_line_error {
      position: absolute;
      top: 4px;
      line-height: 16px;
      user-select: none;
    }
  }
  // ICON
  .icon-triangle {
    margin-right: 12px;
    margin-left: 8px;
    transition: all .3s ease-in-out;
    .icon {
      vertical-align: 0;
    }
  }
  // 下拉框
  .select-options-box {
    width: 100%;
    position: absolute;
    transform-origin: center top 0px;
    top: 48px;
    left: 0;
    z-index: 9;
    border-radius: 4px;
    padding: 4px 0;
    box-shadow: 0px 4px 10px 0px rgba(0, 0, 0, 0.10);

    .select-filter {
      padding: 8px 16px;
    }
    .select-option-list {
      .select-option {
        box-sizing: border-box;
        overflow: hidden;
      }
      .select-option-item {
        display: flex;
        align-items: center;
        height: 44px;
        cursor: pointer;
        word-break: keep-all;
        white-space: nowrap;
        position: relative;
        line-height: 1;
        padding: 0 16px;
        &:last-child {
          margin-bottom: 0;
        }
        .item-text {
          flex: 1;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          overflow: hidden;
          .subText {
            flex: 1;
            flex-shrink: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            font-size: 12px;
          }
        }
        img {
          border-radius: 100%;
          margin-right: 8px;
          width: 20px;
          height: 20px;
        }
        .subText {
          padding-left: 4px;
        }
        .label {
          font-size: 12px;
          line-height: 18px;
          margin-left: 8px;
        }
      }
    }
    // 没有选项的样式
    .not_option {
      height: 216px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      img {
        margin-bottom: 12px;
      }
    }
  }
  // 禁用
  &.select-disabled {
    .input_line_inp {
      cursor: no-drop;
    }
  }
  // 展开样式
  &.select-visible {
    // 三角旋转180度
    .icon-triangle {
      transform: rotate(180deg);
    }
  }
  // 展开动画
  .slideInDown-enter-active {
    transition: all .3s ease;
  }
  .slideInDown-leave-active {
    transition: all .3s cubic-bezier(1.0, 0.5, 0.8, 1.0);
  }
  .slideInDown-enter, .slideInDown-leave-to {
    transform: translateY(-15px);
    opacity: 0;
  }
  // 错误 label 抖动 动画
  @-webkit-keyframes shake {
    59% {
      margin-left: 0;
    }
    60%, 80% {
      margin-left: 2px;
    }
    70%, 90% {
      margin-left: -2px;
    }
  }
  @keyframes shake {
    59% {
      margin-left: 0;
    }
    60%, 80% {
      margin-left: 2px;
    }
    70%, 90% {
      margin-left: -2px;
    }
  }
}
</style>
