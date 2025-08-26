<template>
  <div
      :class="classes"
      :style="stylees"
      :id="elementId"
      ref="cSelect"
      v-click-outside.capture="onClickOutside"
      v-click-outside:mousedown.capture="onClickOutside"
  >
    <div class="select-center">
      <!-- 提示信息 -->
      <div v-if="showPrompt" class="input_line_prompt" :class="promptTextClass">
        {{ promptText }}
        <span><slot name="promptExtend"></slot></span>
      </div>
      <!-- 展示容器 -->
      <div
          class="input_line_content"
          :class="[bdClass, bgClass]"
          :style="{ height: inputHeight, width: inputW }"
          @mouseover="mouseOverInput"
          @mouseout="mouseOutInput"
          @click="toggleMenu"
      >
        <img class="select-img" v-if="img" :src="img" alt="" />
        <!-- 输入框 -->
        <input
            class="input_line_inp"
            :class="{[selectedClass]:selectedClass,'textEllipsis':ellipsisWidth}"
            :style="ellipsisWidth?{ flex: `0 ${ellipsisWidth}` }:''"
            type="text"
            required
            readonly
            :disabled="disabled"
            v-model="values"
            @focus="inputFoucus"
            @blur="blur"
        />
        <!-- 三角ICON -->
        <i class="icon-triangle">
          <svg
              aria-hidden="true"
              class="icon icon-10"
              width="200"
              height="200"
              viewBox="0 0 1024 1024"
              v-html="getIconPath('triangle', 'special-4-cl')">
          </svg>
        </i>
        <!-- 清空选项ICON -->
        <i
            v-if="values && clearable"
            class="icon-clear-btn"
            @click.stop="resetOptionData"
        >
          <svg class="icon icon-16 hoverHide" v-html="getIconPath('clear', 'special-4-cl')" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
          </svg>
          <svg class="icon icon-16 hoverShow" v-html="getIconPath('clear', 'special-5-cl')" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
          </svg>
        </i>
        <div
            v-if="disabled"
            class="disabled-layout"
            :style="{ height: inputHeight }"
        ></div>
      </div>
      <transition name="slideInDown">
        <div
            v-show="visible"
            class="select-options-box fill-6-bd text-1-cl special-1-bg"
            :class="{ 'light-theme': userSkin === '2' }"
            :style="selectOptionY?{top:selectOptionY}:{}"
        >
          <div v-if="filterable" class="select-filter">
            <c-v6-search
                :value="searchValue"
                type="dropDown"
                clearable
                @onChanges="search"/>
          </div>
          <div
              v-show="selectOption.length"
              class="select-option-list"
              :style="setBoxHeight"
          >
            <vue-scroll :ops="ops" style="border-radius:0px">
              <ul class="select-option" :style="optionBoxStyle">
                <li
                    class="select-option-item"
                    v-for="(item, index) in selectOption"
                    :class="{ 'special-2-bg': value === item.code || index === overInx }"
                    :key="index"
                    :style="optionStyle"
                    ref="selectLi"
                    @mouseover="mouseOver(index)"
                    @mouseout="mouseOut(index)"
                    @click="onOptionClick(item)"
                >
                  <div class="item-text">
                    <!-- 图片加载失败兼容 -->
                    <img
                        v-if="item.img"
                        :src="item.img"
                        onerror="this.src='https://saas2-s3-public-01.s3.ap-northeast-1.amazonaws.com/1317/upload/20220414171408884.png'"
                        alt=""
                    />
                    <span class="text">{{ item.value }}</span>
                    <span v-if="item.subValue" class="subText text-2-cl">{{
                        item.subValue
                      }}</span>
                  </div>
                  <span v-if="item.label" class="label">{{ item.label }}</span>
                </li>
              </ul>
            </vue-scroll>
          </div>
          <div class="not_option text-2-cl" v-show="!selectOption.length">
            <!-- 暂无数据 -->
            <img style="width:60px;height:60px;" :src="imgMap.search_no_data" alt="" />
            {{ $t("components.select.noData") }}
          </div>
        </div>
      </transition>
    </div>
    <!-- 错误信息容器 -->
    <div class="input_line_errorStence" v-show="errorHave && isError">
      <p class="input_line_error fall-1-cl" v-show="isError">{{ errorText }}</p>
    </div>
  </div>
</template>

<script>
import { directive as clickOutside } from 'v-click-outside-x';
import {
  getCookie, getIconPath, imgMap, colorMap,
} from '@/utils';

export default {
  name: 'c-v6-select',
  directives: { clickOutside },
  props: {
    // li的展现形式
    type: {
      default: 'border', // border 无背景 fill 有背景色
      type: String,
    },
    // 初始化默认 选中的值 String：直接显示，Number： 选项索引值
    value: {
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
    // Title
    showPrompt: {
      type: Boolean,
      default: true,
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
    // 选项列表 行高 默认44px
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
    // 是否开启 清空选项的功能
    clearable: {
      type: Boolean,
      default: false,
    },
    // 下拉框的宽度 （字符串 后面加单位 px %）
    width: {
      type: [String],
      default: '',
    },
    inputW: {
      type: [String],
      default: '100%',
    },
    // 输入框中 ... 的宽度  无则不超出隐藏
    ellipsisWidth: {
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
    // 下拉框 TOP高度
    selectOptionY: {
      type: [String],
      default: '',
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
    // 选中项是个对象{code:'',value:'',...},要展示在input上哪一个属性，默认为展示value
    displayOptions: {
      type: String,
      default: 'value',
    },
    defaultbg: { type: String, default: '' },
    defaultbd: { type: String, default: '' },
  },
  data() {
    return {
      getIconPath,
      imgMap,
      colorMap,
      userSkin: getCookie('cusSkin') || getCookie('defSkin'), // 用户选择的skin
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
        scrollPanel: {
          scrollingX: false,
        },
        rail: {
          opacity: '0',
        },
        bar: {
          background: colorMap['fill-6-bg'],
          keepShow: true,
          size: '4px',
          minSize: 0.2,
        },
      },
    };
  },
  mounted() {
    if (this.value !== undefined && this.options.length) {
      this.values = this.getInitialValue(this.value);
    }
  },
  computed: {
    selectOption() {
      if (!this.options.length) return [];
      if (!this.options[0].code && this.options[0].code !== 0) {
        // console.error('options数据格式错误', this.options);
        return [];
      }
      if (!this.searchValue) return this.options;
      return this.options.filter((item) => {
        if (
          item.value.toUpperCase().indexOf(this.searchValue.toUpperCase())
            !== -1
        ) {
          return item;
        }
        return false;
      });
    },
    classes() {
      return [
        'common-v5-select',
        {
          'select-visible': this.visible,
          'select-disabled': this.disabled,
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
    inputWStyle() {
      const styles = {};
      if (this.inputW) styles.inputW = this.inputW;
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
    bdClass() {
      if (this.defaultbd) {
        return this.defaultbd;
      }
      if (this.isFocused || this.inputHover) {
        return 'main-1-bd';
      }
      if (this.isError) {
        return 'fall-1-bd';
      }
      return 'fall-1-bdss';
    },
    bgClass() {
      if (this.defaultbg) {
        return this.defaultbg;
      }
      if (this.disabled) {
        return 'fill-7-bg';
      }
      return 'fill-3-bg';
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
    img() {
      if (this.options.length) {
        const val = this.options.find((item) => item.code === this.value);
        return val && val.img;
      }
      return '';
    },
    optionBoxStyle() {
      if (this.width && this.width.indexOf('px') > -1) {
        return { width: `${parseFloat(this.width) - 2}px` };
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
    options(list) {
      if (list && list.length && !this.values) {
        this.values = this.getInitialValue(this.value);
      }
    },
    visible(value) {
      if (!value && this.filterable && this.options.length) {
        this.options.forEach((item) => {
          if (item.code === this.value) {
            this.values = item[this.displayOptions];
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
      if (this.disabled) {
        return;
      }
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
      this.$emit('onChanges', item, this.name);
    },
    goUrl(item) {
      this.visible = false;
      this.$emit('onChanges', item, this.name);
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
    // 鼠标划过
    mouseOverInput() {
      this.inputHover = true;
    },
    // 划出
    mouseOutInput() {
      this.inputHover = false;
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
            text = item[this.displayOptions];
          }
        });
      }
      return text;
    },
    search(value) {
      this.searchValue = value;
    },
    // 清除选项
    resetOptionData() {
      this.values = '';
      this.searchValue = '';
      this.$emit('onClear', true, this.name);
    },
  },
};
</script>

<style scoped lang='stylus'>
.common-v5-select {
  position: relative;
  cursor: pointer;
  display: inline-block;
  font-family: HarmonyOS-Medium;

  .input_line_content {
    height: 44px;
    padding-left: 12px;
    position: relative;
    //border-style: solid;
    //border-width: 1px;
    border-radius: 4px;
    box-sizing: border-box;
    -webkit-transition: 0.3s;
    transition: 0.3s;
    cursor: pointer;
    display: flex;
    align-items: center;
  }

  .select-img {
    width: 20px;
    height: 20px;
    border-radius: 100%;
    margin-right: 8px;
  }

  // 输入框容器
  .input_line_inp {
    width: 0;
    flex: 1;
    font-size: 14px;
    line-height: 16px;
    margin-top:3px;
    outline: none;
    font-family: HarmonyOS-Medium;
    cursor: pointer;
  }

  .select-center{
    position:relative;
  }
  // 提示文案容器
  .input_line_prompt {
    line-height: 16px;
    font-size: 12px;
    user-select: none;
    margin-bottom: 8px;
  }

  // 错误文案容器
  .input_line_errorStence {
    height: 24px;
    line-height: 24px;
    bottom: -24px;
    left: 0;
    position: absolute;

    // 错误文案容器
    .input_line_error {
      position: absolute;
      bottom: 0;
      margin: 0;
      font-size: 12px;
      user-select: none;
    }
  }

  .disabled-layout {
    position: absolute;
    width: 100%;
    bottom: 0;
    left: 0;
    background: rgba(0, 0, 0, 0.3);
    z-index: 2;
    cursor: no-drop;
  }

  // ICON
  .icon-triangle {
    position: absolute;
    right: 12px;
    transition: all 0.3s ease-in-out;
  }

  // 清除 ICON
  .icon-clear-btn {
    position: absolute;
    right: 0;
    bottom: 0;
    cursor: pointer;
    display: none;

    &:hover {
      .hoverHide {
        display: none;
      }

      .hoverShow {
        display: inline-block;
      }
    }
  }

  // 下拉框
  .select-options-box {
    position: absolute;
    transform-origin: center top 0px;
    top: 100% !important;
    transform:translate(0,4px);
    left: 0;
    right: 0;
    z-index: 15;
    box-shadow: 0px 3px 4px 1px rgba(0, 0, 0, 0.28);
    border-style: solid;
    border-width: 1px;
    border-radius: 4px;
    font-size: 14px;
    padding: 4px 0;

    &.light-theme {
      box-shadow: 0px 1px 4px 1px rgba(0, 0, 0, 0.06);
    }

    .select-filter {
      padding: 8px 16px;
    }

    .search-input {
      display: flex;
      align-items: center;
      height: 32px;
      font-size: 14px;
      margin: 8px 16px;
      padding: 0 12px 0 16px;
      border-radius: 16px;
      border-style: solid;
      border-width: 1px;

      .search-icon {
        margin-right: 8px;
      }

      .search-value {
        width: 0;
        flex: 1;
        height: 100%;
      }

      .search-clear {
        display: none;
      }
    }

    .select-option-list {
      .select-option {
        padding: 0x;
        box-sizing: border-box;
        overflow: hidden;
      }

      .select-option-item {
        font-family: HarmonyOS-Medium;
        display: flex;
        align-items: center;
        height: 44px;
        font-size: 14px;
        padding: 0 16px;
        cursor: pointer;
        word-break: keep-all;
        white-space: nowrap;
        position: relative;

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
          }
        }

        img {
          width: 20px;
          height: 20px;
          border-radius: 100%;
          margin-right: 8px;
        }

        .subText {
          padding-left: 4px;
        }

        .label {
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

  // 错误样式
  &.select-error {
    .input_line_prompt {
      color: #EB4D5C;
      animation: shake 0.6s cubic-bezier(0.25, 0.8, 0.5, 1);
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

  // 有值样式
  &:hover {
    // 清除按钮显示
    .icon-clear-btn {
      display: inline-block;
      z-index: 9;
    }
  }

  // 展开动画
  .slideInDown-enter-active {
    transition: all 0.3s ease;
  }

  .slideInDown-leave-active {
    transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
  }

  .slideInDown-enter, .slideInDown-leave-to {
    transform: translateY(-15px);
    opacity: 0;
  }
  /deep/ .__rail-is-vertical{
    background-color:transparent !important;
    /deep/ .__bar-is-vertical{
      width:4px;
      min-height:20px;
      border-radius:3px;
    }
  }

  // 错误 label 抖动 动画
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
  .textEllipsis{
    text-overflow: ellipsis !important;
  }
}
</style>
