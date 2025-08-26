import { directive as clickOutside } from 'v-click-outside-x';
import {
  imgMap, getIconPath,
} from '@/utils';

export default {
  name: 'ccp-inputSelect',
  directives: { clickOutside },
  data() {
    return {
      imgMap,
      getIconPath,
      isFocus: false, // 是否获取焦点
      isHover: false, // 是否划过
      inputWidth: 0, // input宽度
      slotWidth: 0,
      focusTime: null,
      nowType: 'text',
      visible: false, // 控制下拉框是都可见
      overInx: null,
      selectIcon: '',
      query: '', // 检索关键字,
      activeItem: {},
    };
  },
  props: {
    maxLength: { default: '100000', type: String }, // 最大长度
    name: { default: '', type: String }, // 名称标识
    className: { default: '', type: String }, // class根容器
    inputValue: { default: '', type: String }, // 外部传入的输入框的植
    selectDefaultValue: { default: '', type: String }, // 外部传入的select的植
    width: { default: '100%', type: String }, // 该容器根容器 width属性 (***务必加单位***)
    marginTop: { default: '0px', type: String }, // 该组件根容器 margin-top属性 (***务必加单位***)
    inputType: { default: 'text', type: String }, // input框 type属性
    promptText: { default: '', type: String }, // 提示文案
    disabled: { default: false, type: Boolean }, // 是否为只读
    errorHave: { default: false, type: Boolean }, // 是否有错误文案
    errorText: { default: '错误提示', type: String }, // 错误文案
    errorFlag: { default: false, type: Boolean }, // 错误文案是否显示
    warningText: { default: '', type: String }, // 是否有警示文案
    hasSpaces: { default: false, type: Boolean }, // 是否允许空格
    isLogin: { default: false, type: Boolean },
    activeHideTitle: { default: false, type: Boolean }, // 选中时 是否展示title
    options: { type: Array, default: () => [] },
    // 下拉框右侧展开 ICON 默认 三角形icon
    appendIcon: { default: 'icon-triangle-down', type: String },
    // 下拉框显示多少条，默认显示5条 多出显示滚动条
    optionNumber: { default: 5, type: Number },
    // 选项列表 行高 默认40px
    optionHeight: { default: 40, type: Number },
    // 是否开启 清空选项的功能
    clearable: { default: false, type: Boolean },
    placeholder: { default: '', type: String },
  },
  created() {},
  watch: {
    //  有了选项列表 在读取默认值
    options(newVal) {
      if (newVal.length) {
        this.activeItem = {
          ...this.activeItem,
          ...this.getInitialValue(this.selectDefaultValue),
        };
      }
    },
  },
  computed: {
    classWarp() {
      return [
        this.className,
        {
          'select-visible': this.visible,
        },
      ];
    },
    activeHideTitleFitler() {
      let flag = true;
      if (this.activeHideTitle) {
        if (this.isFocus || this.curValue.length) {
          flag = false;
        }
      }
      return flag;
    },
    curValue: {
      get() {
        return this.inputValue;
      },
      set(v) {
        let value = v;
        // 限制空格
        if (this.hasSpaces) {
          if (value.indexOf(' ') !== -1) {
            const arr = value.split(' ');
            let str = '';
            arr.forEach((item) => {
              str += item;
            });
            value = str;
            this.$forceUpdate();
          }
        }
        this.$emit('onchanges', value, this.name);
      },
    },
    warningFlag() {
      let flag = false;
      if (this.warningText.length) {
        if (!(this.errorFlag && !this.isFocus)) {
          flag = true;
        }
      }
      return flag;
    },
    // 根容器 行内样式
    contentStyle() {
      return {
        width: this.width,
        marginTop: this.marginTop,
      };
    },
    // 基础占位容器 class
    baseStanceClass() {
      // 禁止时
      if (this.disabled) {
        return 'input-line-baseStance-disabled';
      }
      // 错误时
      if (this.errorHave && this.errorFlag && !this.isFocus) {
        return 'input-line-baseStance-error';
      }
      return '';
    },
    // 提示文案 class
    promptClass() {
      let className = '';
      let color = 'text-2-cl';
      if (this.isFocus || this.inputValue.length) {
        className += 'input-line-prompt-active';
      }
      if (this.errorHave && this.errorFlag && !this.isFocus) {
        color = 'fall-1-cl';
      }
      return `${className} ${color}`;
    },
    // 下横线 class
    activeLineClass() {
      let className = 'main-1-bg';
      if (this.errorHave && this.errorFlag && !this.isFocus) {
        className = 'fall-1-bg';
      }
      return className;
    },
    // 下横线 行内样式
    activeLineStyle() {
      let width = 0;
      // 下拉菜单展示 / input划过 / input聚焦 / 错误文案显示 时 下划线展示
      if (this.visible || this.isHover || this.isFocus || (this.errorHave && this.errorFlag)) {
        width = '100%';
      }
      if (this.disabled) {
        width = 0;
      }
      return {
        width,
      };
    },

    // select 开始
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
    setBoxHeight() {
      if (this.selectOption.length <= this.optionNumber) {
        return false;
      }
      return { height: `${this.optionNumber * this.optionHeight}px` };
    },
    optionStyle() {
      const styles = {
        height: `${parseFloat(this.optionHeight)}px`,
        'line-height': `${parseFloat(this.optionHeight)}px`,
      };
      return styles;
    },
  },
  methods: {
    init() {
      this.$bus.$off('inputLine-focus');
      this.$bus.$on('inputLine-focus', (name) => {
        if (name === this.name) {
          this.$refs.inputLine.focus();
        }
      });
      if (this.isLogin) {
        this.nowType = this.inputType;
      }
    },
    promptClick() {
      if (this.focusTime) {
        const nowTime = new Date().getTime();
        if (nowTime - this.focusTime > 200) {
          this.$refs.inputLine.focus();
          this.focusTime = null;
        }
      } else {
        this.$refs.inputLine.focus();
      }
    },
    // input 鼠标划入
    handMouseenter() {
      this.isHover = true;
    },
    // input 鼠标划出
    handMouseleave() {
      this.isHover = false;
    },
    // input 获取焦点
    handFocus() {
      this.nowType = this.inputType;
      this.$emit('focus', this.name);
      this.isFocus = true;
      this.visible = false;
    },
    // input 失去焦点
    handBlur() {
      this.focusTime = new Date().getTime();
      this.$emit('blur', this.name);
      this.isFocus = false;
    },
    keyup(event) {
      this.$emit('keyup', this.name);
      this.inputValue = event.target.value;
    },
    // 下拉框 显示&隐藏
    toggleMenu() {
      // if (!this.isFocus) {
      this.visible = !this.visible;
      // } else {
      //   this.isFocus = false;
      // }
    },
    mouseOver(inx) {
      this.overInx = inx;
    },
    mouseOut() {
      this.overInx = null;
    },
    // 点击 select 以外 隐藏下拉框
    onClickOutside() {
      this.visible = false;
    },
    // 点击 选项
    onOptionClick(item) {
      this.query = '';
      // // this.visible = false;
      this.isError = false;
      this.activeItem = { ...this.activeItem, ...item };
      this.$emit('onChangeSelect', item, this.name);
    },
    // 设置 显示的Value;
    getInitialValue(value) {
      // 如果是 true  表示 value  是搜索是输入的值
      let text;
      if (this.options.length) {
        this.options.forEach((item) => {
          if (item.code === value) {
            text = item;
          }
        });
      }
      if (text) {
        this.$emit('onChangeSelect', text, this.name);
      }
      return text;
    },
    // 清除选项
    resetOptionData() {
      this.values = '';
      this.query = '';
      this.$emit('onClear', true, this.name);
    },
    // 搜索框 输入事件
    handleSearch(event) {
      this.query = event.target.value;
    },
    searchFoucus() {
      this.visible = true;
    },
  },
};
