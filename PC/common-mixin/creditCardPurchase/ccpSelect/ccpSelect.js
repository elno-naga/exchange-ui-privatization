import { directive as clickOutside } from 'v-click-outside-x';

export default {
  name: 'ccp-select',
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
    // Title
    promptText: {
      type: String,
      default: '',
    },
    // 设置边框样式. 默认线性样式
    box: {
      type: Boolean,
      default: false,
    },
    // 下拉框显示多少条，默认显示5条 多出显示滚动条
    optionNumber: {
      type: Number,
      default: 5,
    },
    // 选项列表 行高 默认40px
    optionHeight: {
      type: Number,
      default: 40,
    },
    // 下拉框右侧展开 ICON 默认 三角形icon
    appendIcon: {
      type: String,
      default: 'icon-triangle-down',
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
    // 清空选项按钮的Icon, icon的class
    clearableIcon: {
      type: String,
      default: 'icon-clear',
    },
    // 下拉框的宽度 （字符串 后面加单位 px %）
    width: {
      type: [String],
      default: '',
    },
    // 下拉框的高度
    height: {
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
  },
  data() {
    return {
      // 存储选中的值 和 默认选中的值
      activeItem: {},
      // 控制下拉框是都可见
      visible: false,
      // 选项列表是否有数据
      isNotOption: false,
      // 检索关键字
      query: '',
      // isFocused
      isFocused: false,
      // 是否设置成错误状态
      isError: false,
      overInx: null,
      // 获取焦点开关TAG建
      focusFlang: false,
      isHover: false,
    };
  },
  mounted() {},
  computed: {
    selectOption() {
      if (!this.options.length) return [];
      if (!this.options[0].code && this.options[0].code !== 0) {
        return [];
      }
      if (!this.query) return this.options;
      return this.options.filter((item) => {
        if (item.value.toUpperCase().indexOf(this.query.toUpperCase()) !== -1) {
          return item;
        }
        return false;
      });
    },
    classes() {
      return [
        'common-select',
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
      if (this.height) styles.width = this.height;
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
      if (this.type === 'double') {
        return { height: `${this.optionNumber * 50}px` };
      }
      return { height: `${this.optionNumber * this.optionHeight}px` };
    },
  },
  watch: {
    //  有了选项列表 在读取默认值
    options(newVal) {
      if (newVal.length) {
        this.activeItem = {
          ...this.activeItem,
          ...this.getInitialValue(this.value),
        };
      }
    },
    // visible(value) {
    //   if (!value && this.filterable && this.options.length) {
    //     this.options.forEach((item) => {
    //       if (item.code === this.value) {
    //         this.values = item.value;
    //         this.query = '';
    //       }
    //     });
    //   }
    //   this.$emit('opent-chang', value, this.name);
    // },
    errorFlag(value) {
      this.isError = value;
    },
  },
  methods: {
    // input 鼠标划入
    handMouseenter() {
      this.isHover = true;
    },
    // input 鼠标划出
    handMouseleave() {
      this.isHover = false;
    },
    init() {},
    mouseOver(inx) {
      this.overInx = inx;
    },
    mouseOut() {
      this.overInx = null;
    },
    // 下拉框 显示&隐藏
    toggleMenu() {
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
      this.query = '';
      this.visible = false;
      this.isError = false;
      this.activeItem = { ...this.activeItem, ...item };
      this.$emit('onChanges', item, this.name);
    },
    goUrl(item) {
      this.visible = false;
      this.$emit('onChanges', item, this.name);
    },
    // 搜索框 输入事件
    filterableChange(event) {
      this.query = event.target.value;
      if (this.query.length) this.visible = true;
    },
    // 设置 显示的Value;
    getInitialValue(value) {
      // 如果是 true  表示 value  是搜索是输入的值
      let text;
      if (this.options.length) {
        this.options.forEach((item) => {
          if (item.value === value) {
            text = item;
          }
        });
      }
      return text;
    },
    // 清除选项
    resetOptionData() {
      this.values = '';
      this.query = '';
      this.$emit('onClear', true, this.name);
    },
  },
};
