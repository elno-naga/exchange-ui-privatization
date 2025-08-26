import { directive as clickOutside } from 'v-click-outside-x';
import {
  getIconPath,
} from '@/utils';

export default {
  directives: { clickOutside },
  props: {
    // li的展现形式
    type: {
      default: 'info', // info为单行li  double为双行li
      type: String,
    },
    // 初始化默认 选中的值 String：直接显示，Number： 选项索引值
    value: {
      type: [String, Number],
      default: '',
    },
    options: {
      type: Array,
      default: () => [],
    },
    name: {
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
      default: 30,
    },
    // 下拉框右侧展开 ICON 默认 三角形icon
    appendIcon: {
      type: String,
      default: 'icon-triangle-down',
    },
    // 下拉框的宽度 （字符串 后面加单位 px %）
    width: {
      type: [String],
      default: '',
    },
    height: {
      type: [String],
      default: '',
    },
    selectedBg: {
      type: String,
      default: 'fill-3-bg',
    },
  },
  data() {
    return {
      getIconPath,
      overInx: null,
      // 控制下拉框是都可见
      isFocus: false,
      selected: '',
    };
  },
  computed: {
    stylees() {
      const styles = {};
      if (this.width) styles.width = this.width;
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
      if (this.options.length <= this.optionNumber) {
        return false;
      }
      if (this.type === 'double') {
        return { height: `${this.optionNumber * 50}px` };
      }
      return { height: `${this.optionNumber * this.optionHeight}px` };
    },
  },
  watch: {
    value(val) {
      this.setSelected(val);
    },
    isFocus(val) {
      this.$emit('focusChange', val);
    },
  },
  mounted() {
    this.setSelected(this.value);
  },
  methods: {
    setSelected(val) {
      if (val) {
        const select = this.options.find((item) => item.value === val);
        if (select) {
          this.selected = select.label;
        }
      } else {
        this.selected = '';
      }
    },
    handleMouseenter() {
      this.isFocus = true;
    },
    handleMouseleave() {
      this.isFocus = false;
    },
    mouseOver(inx) {
      this.overInx = inx;
      this.isFocus = true;
    },
    mouseOut() {
      this.overInx = null;
    },
    // 点击 select 以外 隐藏下拉框
    onClickOutside() {
      this.isFocus = false;
    },
    // 点击 选项
    onOptionClick(item) {
      this.isFocus = false;
      this.$emit('onChanges', item, this.name);
    },
  },
};
