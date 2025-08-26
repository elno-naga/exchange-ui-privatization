<template>
  <section
      class="address-select"
  >
    <c-v6-input
        :value="nowValue"
        @onChanges="inputChange"
        :readonly="readonly"
        @focus="inputFocus = true"
        @blur="inputFocus = false"
        :width="width"
        :type="type"
        :className="className"
        :disabled="disabled"
        :showPrompt="false"
        :promptText="promptText"
        :promptClass="promptClass"
        :bdClass="bdClass"
        :bgClass="bgClass"
        :placeholder="placeholder"
        :errorStyle:="errorStyle"
        :errorFlag:="errorFlag"
        :errorText:="errorText"
        :warningText:="warningText"
        :clearable:="clearable"
        :noSpace:="noSpace"
        :maxLength:="maxLength"
        :width:="width"
        :size:="size"
        :styles:="styles"
        :inputHeight:="inputHeight"
    />
    <transition name="slide-fade">
      <ul v-show="inputFocus" class="select-option special-1-bg fill-3-bd">
        <li
            v-for="(item, index) in autoList"
            :key="index"
            class="option"
            :class="{'special-2-bg': optionHover === item.code || value === item.code }"
            @mouseover="optionHover = item.code"
            @mouseout="optionHover = null"
            @click="itemClick(item)">
          <div class="text text-1-cl">{{item.value}}<span v-if="item.trustType" class="label-address-type main-4-bg main-1-cl">
                {{$t('modifySetting.trustTag')}}
            </span></div>
          <div class="subText text-2-cl">{{item.label}}</div>
        </li>
        <li class="addNew main-1-cl fill-6-bd" @click="addClick">
          <svg class="icon icon-12" aria-hidden="true">
            <use xlink:href="#icon-assets_10"></use>
          </svg>{{$t('assets.addressMent.addAddress')}}
        </li>
      </ul>
    </transition>
  </section>
</template>
<script>
import { colorMap, getIconPath } from '../../../../utils';

export default {
  name: 'c-v6-autocomplete',
  props: {
    list: {
      default: null,
      type: Array,
    },
    labelKey: {
      default: 'value',
      type: String,
    }, // select 对比字段
    valueKey: {
      default: 'value',
      type: String,
    }, // 输入框显示文案对应的key
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
    clearable: { type: Boolean, default: false }, // 是否开启 清空选项的功能
    noSpace: { type: Boolean, default: false }, // 限制空格
    maxLength: { type: [Number, String], default: null },
    width: { type: [String], default: '100%' }, // 宽度 （字符串 后面加单位 px %）
    size: { type: [String], default: 'lg' }, // 框的size
    styles: { type: [Object, String], default: '' }, // 样式
    inputHeight: { type: String, default: '' }, // input height
  },
  data() {
    return {
      colorMap,
      inputType: 'text',
      nowValue: '', // 内部双向数据绑定
      inputFocus: false,
      autoList: [],
      optionHover: false,
      optionSelect: null,
    };
  },
  computed: {
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
  },
  watch: {
    list(val) {
      this.autoList = val;
    },
    value(val) {
      this.inputValChangeFn(val);
    },
  },
  created() {
    this.inputValChangeFn(this.value);
  },
  methods: {
    getIconPath,
    inputValChangeFn(val) {
      let inputVal = val;
      if (val && this.list) {
        // eslint-disable-next-line array-callback-return
        this.list.map((item) => {
          if (item[this.valueKey] === val) {
            inputVal = item[this.labelKey];
          }
        });
      }
      this.nowValue = inputVal;
    },
    inputChange(val) {
      this.nowValue = val;
      this.$emit('onChanges', { value: val });
    },
    addClick() {
      this.$emit('addClick');
    },
    itemClick(val) {
      this.nowValue = val[this.labelKey];
      this.$emit('onChanges', val);
    },
  },
};
</script>
<style lang="stylus" scoped>
.address-select {
  width: 100%;
  position: relative;
  .input-content {
    width: 100%;
    height: 40px;
    box-sizing: border-box;
    border-radius: 4px;
    border-style: solid;
    border-width: 1px;
    font-size: 14px;
    padding: 0 12px;
    display: flex;
    align-items: center;
    transition: 0.3s;
    input {
      width: 0;
      flex: 1;
      font-family: HarmonyOS-Medium;
    }
    .clear {
      margin-left: 12px;
      cursor: pointer;
      height: 12px;
      .icon {
        vertical-align: 0;
      }
    }
  }
  .select-option {
    width: 100%;
    position: absolute;
    top: 48px;
    left: 0;
    padding-top: 12px;
    border-radius: 4px;
    border-style: solid;
    border-width: 1px;
    box-shadow: 0px 3px 4px 1px rgba(0, 0, 0, 0.10);
    box-sizing: border-box;
    max-height: 400px;
    overflow: auto;
    z-index: 2;
    cursor: pointer;
    .option {
      padding: 12px 16px;
      .text {
        font-size: 14px;
        line-height: 18px;
        margin-bottom: 3px;
        word-break: break-all;
      }
      .subText {
        font-size: 12px;
        line-height: 17px;
        word-break: break-all;
      }
    }
    .addNew {
      height: 50px;
      line-height: 50px;
      text-align: center;
      border-top-style: solid;
      border-top-width: 1px;
      margin-top: 16px;
      cursor: pointer;
      .icon {
        margin-right: 8px;
        vertical-align: 0;
      }
    }
  }
}
</style>
