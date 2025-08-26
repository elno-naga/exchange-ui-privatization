import {
  myStorage, getIconPath, imgMap,
} from '@/utils';

export default {
  name: 'market',
  data() {
    return {
      imgMap,
      getIconPath,
      marketDataList: {},
      dataList: [],
      dataList_bar: [],
      symbolList: [],
      // 当前选中的市场
      marketCurrent: myStorage.get('markTitle'),
      // 排序
      sortName: null,
      sortType: null,
      // 筛选
      listfilterVal: null,
      // 市场横向滚动参数
      slidePosition: 0,
      maxPosition: 0,
      // 是否是移动端
      isMobile: window.isMobile,
      isSearchFocus: false, // 搜索框聚焦
    };
  },
  props: {
    moduleType: {
      type: String,
      default: 'ex',
    },
    typeStr: {
      type: String,
      default: 'ex',
    },
    dataCoinList: {
      type: Array,
      default: null,
    },
    symbolCurrent: {
      type: Object,
      default: null,
    },
  },
  computed: {
    isLogin() {
      return this.$store.state.baseData.isLogin;
    },
  },
  watch: {
    // 搜索
    listfilterVal(val) {
      this.setData();
      if (val) {
        const reg = new RegExp(val, 'gim');
        this.dataList_bar = this.dataCoinList.filter((item) => item.showName.match(reg));
      }
    },
    isLogin(val) {
      if (val) {
        this.mySymbolList = myStorage.get('mySymbol') || [];
      }
    },
    dataCoinList: {
      immediate: true,
      handler(v) {
        if (v) {
          this.setData();
        }
      },
    },
  },
  methods: {
    init() {
      const screenWidth = document.body.clientWidth;
      if (screenWidth < 961) {
        this.isMobile = true;
      }
    },

    setData() {
      let dataList = this.dataCoinList ? JSON.parse(JSON.stringify(this.dataCoinList)) : [];
      if (this.sortType === 'down') {
        if (this.sortName === 'showName') {
          dataList.sort((a, b) => {
            if (a[this.sortName] < b[this.sortName]) {
              return -1;
            }
            if (a[this.sortName] > b[this.sortName]) {
              return 1;
            }
            return 0;
          });
        } else {
          dataList.sort((a, b) => parseFloat(b[this.sortName]) - parseFloat(a[this.sortName]));
        }
      }
      if (this.sortType === 'up') {
        if (this.sortName === 'showName') {
          dataList.sort((a, b) => {
            if (a[this.sortName] < b[this.sortName]) {
              return -1;
            }
            if (a[this.sortName] > b[this.sortName]) {
              return 1;
            }
            return 0;
          }).reverse();
        } else {
          dataList.sort((a, b) => parseFloat(a[this.sortName]) - parseFloat(b[this.sortName]));
        }
      }
      if (!this.sortType) {
        dataList.sort((a, b) => a.sort - b.sort);
      }
      if (this.listfilterVal) {
        const reg = new RegExp(this.listfilterVal, 'gim');
        dataList = this.dataCoinList.filter((item) => item.showName.match(reg));
      }
      this.dataList_bar = dataList;
    },
    shrinkBlock() {
      this.$emit('shrinkBlock');
      this.$bus.$emit('shrinkBlock');
    },
    serachShrinkBlock() {
      // this.$refs.serachInp.focus();
      this.$emit('serachShrinkBlock');
      this.$refs.tradeFind.focusFn();
    },
    inputchanges(v) {
      this.listfilterVal = v;
    },
    // 切换币对
    switchSymbol(data) {
      // 判断 tradingview 已经初始化完成
      // if (window.tvWidget) {
      this.$emit('changeCurrent', data);
      if (this.isMobile) {
        this.shrinkBlock();
      }
      // }
    },
    // 币种排序
    sorteEvent(key) {
      this.$nextTick(() => {
        if (!this.sortName) {
          this.sortName = key;
          this.sortType = 'down';
          this.setData();
        } else if (this.sortName !== key) {
          this.sortName = key;
          this.sortType = 'down';
          this.setData();
        } else if (this.sortType === 'down') {
          this.sortName = key;
          this.sortType = 'up';
          this.setData();
        } else if (this.sortType === 'up') {
          this.sortName = null;
          this.sortType = null;
          this.setData();
        }
      });
    },
    getFocus() {
      this.$bus.$emit('inputFind-focus', 'marketSearch');
    },
  },
};
