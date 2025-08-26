import { getCookie } from '@/utils';

export default {
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    options: {
      type: Array,
      default: () => [],
    },
    parent: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      lan: getCookie('lan'),
      showFlag: false,
      style: {},
      hover: false,
      optionHover: null,
    };
  },
  watch: {
    show(v) {
      if (v) {
        this.setPosition();
      }
      this.showFlag = v;
    },
  },
  methods: {
    // 设置定位
    setPosition() {
      if (this.parent) {
        const { scrollLeft } = document.documentElement;
        const bodyWidth = document.documentElement.clientWidth; // body 可视区域高度
        const { top, right } = document.querySelector(this.parent).getBoundingClientRect();
        this.style.top = `${top + 40}px`;
        this.style.right = `${bodyWidth - right - scrollLeft}px`;
      }
    },
    select(item) {
      this.$emit('select', item);
    },
    isShowOPtions(item) {
      let bol = false;
      if (item.type === 'editPwd' || item.type === 'editEmail') {
        bol = !!(item.loginType);
      } else {
        bol = true;
      }
      return bol;
    },
  },
};
