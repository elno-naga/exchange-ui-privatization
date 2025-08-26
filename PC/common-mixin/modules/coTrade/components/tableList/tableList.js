import {
  thousandsComma, nul, division, getIconPath,
} from '@/utils';

export default {
  name: 'tableList',
  components: {
  },
  data() {
    return {
      getIconPath,
      ops: {
        scrollPanel: {
          scrollingY: true,
          initialScrollY: 0,
        },
      },
    };
  },
  props: {
    type: {
      type: String,
      default: '',
    },
    theadList: {
      type: Array,
      default: () => [],
    },
    dataList: {
      type: Array,
      default: () => [],
    },
    cellWidth: {
      type: Array,
      default: () => [],
    },
    bodyHeight: {
      type: Number,
      default: 0,
    },
    lineNumber: {
      type: Number,
      default: 10,
    },
    maxValue: {
      type: Number,
    },
    pointDeptValue: {
      type: [String, Number],
    },
  },
  computed: {
    // 是否Login
    isLogin() {
      return this.$store.state.baseData.isLogin;
    },
    // 普通委托列表
    currentOrderLis() {
      return this.$store.state.future.currentOrderLis || [];
    },
    // 普通委托价格列表
    currentOrderLisPrices() {
      const arr = [];
      if (this.currentOrderLis && this.currentOrderLis.length) {
        this.currentOrderLis.forEach((item) => {
          arr.push(+item.price);
        });
      }
      return arr;
    },
    isPoint() {
      return (price) => {
        const pow = 10 ** this.pointDeptValue;
        let pricesList = [];
        if (this.isLogin && this.currentOrderLisPrices.length) {
          // buy 向下取深度
          if (this.type === 'buy') {
            pricesList = this.currentOrderLisPrices.map((item) => division(Math.floor(nul(item, pow)), pow));
          }
          // asks 向上取深度
          if (this.type === 'asks') {
            pricesList = this.currentOrderLisPrices.map((item) => division(Math.ceil(nul(item, pow)), pow));
          }
        }
        return pricesList.indexOf(price) > -1;
      };
    },
    tbodyStyle() {
      return {
        height: `${this.bodyHeight}px`,
      };
    },
    priceClass() {
      return this.type === 'buy' ? 'rise-1-cl' : 'fall-1-cl';
    },
    pricePointClass() {
      return this.type === 'buy' ? 'rise-1-bg' : 'fall-1-bg';
    },
    trBgClass_two() {
      return this.type === 'buy' ? 'rise-4-bg' : 'fall-4-bg';
    },
    differNUmber() {
      if (this.lineNumber - this.dataList.length > 0) {
        return this.lineNumber - this.dataList.length;
      }
      return 0;
    },
    flashSwitchs() {
      return this.$store.state.baseData.trade_depth_is_flash;
    },
  },
  watch: {
    theadList(val) {
      this.scrollTo(val);
    },
    bodyHeight(val, oldval) {
      if (oldval && val) {
        if (this.type === 'asks' && val > 500) {
          this.scrollTo();
        }
      }
    },
    dataList(val, oldval) {
      if (this.type === 'asks' && !oldval.length) {
        setTimeout(() => {
          this.scrollTo();
        });
      }
    },
  },
  methods: {
    init() {
      this.scrollTo();
    },
    isShow(i) {
      if (this.type === 'asks') {
        const num = this.dataList.length - this.lineNumber;
        return num <= i;
      }
      return i < this.lineNumber;
    },
    trBgClass(diff) {
      return diff === 1 ? 'rise-4-bg' : 'fall-4-bg';
    },
    handelPrice(price) {
      this.$bus.$emit('HANDEL_PRICE', price);
    },
    scrollTo() {
      if (this.$refs.vs) {
        this.$refs.vs.scrollTo({
          y: 99999,
        }, false);
      }
    },
    handleResize() {
      if (this.type === 'asks') {
        setTimeout(() => {
          this.scrollTo();
        }, 100);
      }
    },
    setWidth(vol) {
      // const length = this.type === 'buy' ? this.dataList.length - 1 : 0;
      // const maxValue = this.dataList[length].total;
      let W = 0;
      if (vol === '--' || this.maxValue === '--') {
        return 0;
      }
      W = (parseFloat(vol) / parseFloat(this.maxValue)) * 100 + 5;
      if (W > 105) {
        W = 105;
      }
      return { width: `${W}%` };
    },
    thousandsComma(num) {
      if (num) {
        return thousandsComma(num);
      }
      return num;
    },
  },
  filters: {
    formatNumUnit(val) {
      const getNum = (num, str, unit) => {
        const int = str.slice(0, 0 - num);
        const inM = str.slice(0 - num);
        const thousandsInt = thousandsComma(int);
        return `${thousandsInt}.${inM.slice(0, 2)}${unit}`;
      };
      if (!Number.isNaN(val)) {
        const valStr = val.toString();
        const integer = valStr.split('.')[0];
        let returnStr = val;
        if (integer.length < 4) {
          returnStr = val;
        } else if (integer.length < 7) {
          returnStr = getNum(3, integer, 'K');
        } else if (integer.length < 10) {
          returnStr = getNum(6, integer, 'M');
        } else {
          returnStr = getNum(9, integer, 'B');
        }
        return returnStr;
      }
      return val;
    },
  },
};
