import {
  myStorage, getCookie, fixD, getIconPath, imgMap,
} from '@/utils';
// 按钮
export default {
  name: 'currentSymbol',
  data() {
    return {
      imgMap,
      getIconPath,
      symbolCurrent: this.$route.name === 'trade' ? myStorage.get('sSymbolName') : myStorage.get('leverSymbolName'),
      dataList: [],
      symbolsData_bf: {},
      currencyModalState: false,
      isMobile: window.isMobile,
      showMarket: false,
      depthValue: 0,
      tradePage: window.sessionStorage.getItem('exTrade_page') || '1',
      tradePageHover: null,
      showEtfSby: false,
      slideSide: '',
      slideStyle: {},
      slideNum: 0,
      calDone: false,
    };
  },
  props: {
    etfUrl: {
      type: String,
      default: '',
    },
    fundRate: {
      type: String,
      default: '',
    },
    etfPrice: {
      type: String,
      default: '',
    },
    marketShrink: {
      type: Boolean,
      default: false,
    },
    moduleType: {
      type: String,
      default: 'ex',
    },
  },
  filters: {
    formatNumber(val) {
      if (val && val !== '--') {
        const value = val.toString();
        const reg = value.indexOf('.') > -1 ? /(\d)(?=(\d{3})+\.)/g : /(\d)(?=(?:\d{3})+$)/g;
        return value.replace(reg, '$1,');
      }
      return val;
    },
  },
  watch: {
    documentTitle(val) {
      document.title = val;
    },
  },
  computed: {
    infoItemTitleClass() {
      const { activeName } = this.$route.meta;
      if (activeName.indexOf('proTrade') > -1) {
        return 'text-2-cl';
      }
      return 'text-2-cl';
    },
    infoItemValClass() {
      const { activeName } = this.$route.meta;
      if (activeName.indexOf('proTrade') > -1) {
        return 'text-2-cl';
      }
      return 'text-1-cl';
    },

    coinTagLangs() {
      return this.$store.state.baseData.coinTagLangs;
    },
    coinTagOpen() {
      return this.$store.state.baseData.coin_tag_open;
    },
    currentCoinLabel() {
      if (this.coinList) {
        const item = this.coinList[this.symbolCurrentCoinName.toUpperCase()];
        if (item) {
          const { coinTag = '' } = item;

          return coinTag ? this.coinTagLangs[coinTag] : '';
        }
      }
      return '';
    },
    symbolCurrentCoinName() {
      return this.symbolCurrent ? this.symbolCurrent.split('/')[0] : '';
    },
    symbol_profile() {
      return this.$store.state.baseData.symbol_profile;
    },
    publicInfo() {
      return this.$store.state.baseData.publicInfo;
    },
    // 全部币种列表
    coinList() {
      if (this.$store.state.baseData && this.$store.state.baseData.market) {
        return this.$store.state.baseData.market.coinList;
      }
      return null;
    },
    // 全部币对列表
    symbolAll() {
      return this.$store.state.baseData.symbolAll;
    },
    documentTitle() {
      const lang = getCookie('lan');
      let str = '';
      if (this.publicInfo && this.symbolAll) {
        const { indexHeaderTitle, seo } = this.publicInfo;
        let title = '';
        if (indexHeaderTitle) {
          if (lang) {
            title = seo.title || indexHeaderTitle[lang];
          } else {
            const lan = this.publicInfo.lan.defLan;
            title = seo.title || indexHeaderTitle[lan];
          }
        }
        const pageName = this.$route.name;
        let titleName = this.$t('pageTitle.trade');
        if (pageName === 'margin') {
          titleName = this.$t('header.lever');
        }
        const symbolCur = this.symbolAll[this.symbolCurrent]
          ? this.symbolAll[this.symbolCurrent].showName
          : this.symbolCurrent;
        str = `${this.symbolsData.close.data} ${symbolCur} ${titleName}-${title}`;
      }
      return str;
    },
    symbolsData() {
      const symbolData = this.dataList[this.symbolCurrent];
      if (symbolData) {
        const { rose, close } = symbolData;
        const price = Number(close.data) - close.data / (parseFloat(rose.data) / 100 + 1);
        symbolData.rose.price = fixD(price, this.depthValue);
        return this.dataList[this.symbolCurrent];
      }
      return {
        name: '--',
        symbol: {
          symbol: '--',
          unit: '--',
        },
        high: '--',
        low: '--',
        close: {
          class: '',
          data: '--',
          price: '--',
        },
        vol: '--',
        amount: '--',
        rose: {
          price: '',
          class: '',
          data: '--',
        },
      };
    },
    coinSymbolIntroduce() {
      let currentCoinInfo = {};
      const { coinSymbolIntroduce } = this.$store.state.baseData;
      coinSymbolIntroduce.forEach((el) => {
        if (el.coinSymbol.toUpperCase() === this.symbolCurrentCoinName.toUpperCase()) {
          currentCoinInfo = el;
        }
      });

      return currentCoinInfo;
    },
    // 专业版
    isPro() {
      const { path } = this.$route;
      return path.toLowerCase().indexOf('pro') > -1;
    },
    // 当前交易页面 1 现货 2 杠杆
    tradeType() {
      const { path } = this.$route;
      return path.indexOf('margin') > -1 ? '2' : '1';
    },
    // 该币对是否开启网格
    showGridFlag() {
      let flag = false;
      if (this.symbolAll && this.symbolCurrent) {
        const symbol = this.symbolAll[this.symbolCurrent];

        if (symbol && symbol.is_grid_open) {
          flag = true;
        }
      }
      return flag;
    },
    //  是否开启了 网格
    gridTradeFlag() {
      const { publicInfo } = this.$store.state.baseData;
      let str = 0;
      if (publicInfo && publicInfo.switch && publicInfo.switch.grid_trade_switch) {
        str = Number(publicInfo.switch.grid_trade_switch);
      }
      return str;
    },
    upAndDown() {
      return this.symbolsData.rose.price > 0 ? '+' : '';
    },
    symbolItem() {
      let symbol = {};
      if (this.symbolAll && this.symbolCurrent) {
        symbol = this.symbolAll[this.symbolCurrent];
      }
      return symbol;
    },
  },
  created() {
    // 解决第一次进来获取不到值问题
    this.$bus.$on('DEPTH_VALUE', (data) => {
      this.depthValue = data;
    });
  },
  methods: {
    init() {
      const screenWidth = document.body.clientWidth;
      if (screenWidth < 961) {
        this.isMobile = true;
      }
      // 这里有问题, $emit 只发送一次,这个模板会根据判断销毁再重新生成一次,再次生成时错过了 $emit 的时机,导致默认取值错误;
      this.$bus.$on('SYMBOL_CURRENT', (val) => {
        this.symbolCurrent = val;
      });
      this.$bus.$on('MARKET_DATA', (data) => {
        this.dataList = JSON.parse(JSON.stringify(data));
        this.getSlideShow();
      });
      this.$bus.$on('isMobile', (data) => {
        this.isMobile = data;
      });
      // 监听 深度级别的值
      this.$bus.$on('DEPTH_VALUE', (data) => {
        this.depthValue = data;
      });
      this.$bus.$on('tradePageChange', (val) => {
        this.tradePage = val;
      });
      if (this.moduleType === 'lever') {
        this.tradePage = '2';
      }
      this.$bus.$on('WINFOW_ON_RESIIZE', () => {
        this.calDone = false;
        this.getSlideShow();
      });
    },
    getSlideShow() {
      this.$nextTick(() => {
        if (this.calDone) return;
        if (this.$refs.curSumbolDetail) {
          this.slideNum = this.$refs.curSumbolDetail.offsetWidth
            - this.$refs.curSymbolContainer.offsetWidth + 25;
          if (this.slideNum > 0 && !this.slideSide) {
            this.slideSide = 'left';
            this.slideStyle = {
              left: '25px',
            };
          } else if (this.slideNum <= 0) {
            this.slideSide = '';
            this.slideStyle = {
              left: 0,
            };
          }
          this.calDone = true;
        }
      });
    },
    getShowEtf(v) {
      let flag = false;
      const symbol = v;
      if (this.symbolAll
        && this.symbolAll[symbol]
        && this.symbolAll[symbol].etfOpen) {
        flag = true;
      }
      return flag;
    },
    showCurrencyModal() {
      if (!this.isMobile) {
        this.currencyModalState = true;
      }
    },
    hideCurrencyModal() {
      this.currencyModalState = false;
    },
    showLeftMarket() {
      this.$bus.$emit('showLeftMarket');
    },
    openSetting() {
      this.$bus.$emit('openSetting', true);
    },
    changeTradeType(type) {
      this.tradePage = type;
      if (type !== '2') {
        window.sessionStorage.setItem('exTrade_page', type);
      }
      if (type === '1') {
        this.$router.push('/proTrade');
      } else if (type === '2') {
        this.$router.push('/proTradeMargin');
      }
      this.$bus.$emit('changeTradePage', type);
    },
    handleMouseHover(event, type) {
      const targetELe = event.target;
      if (type === this.tradeType) return;
      targetELe.classList.add('main-1-cl', 'main-4-bg');
    },
    handleMouseLeave(event, type) {
      const targetELe = event.target;
      if (type === this.tradeType) return;
      targetELe.classList.remove('main-1-cl', 'main-4-bg');
    },
    handleMouseOver() {
      if (!this.isPro) return;
      this.showMarket = true;
    },
    handleMouseOut() {
      if (!this.isPro) return;
      this.showMarket = false;
    },
    slideSymbolInfo(side) {
      if (side === 'left') {
        this.slideStyle = {
          left: `-${this.slideNum + 20}px`,
        };
        this.slideSide = 'right';
      } else {
        this.slideStyle = {
          left: '25px',
        };
        this.slideSide = 'left';
      }
    },
  },
};
