// myStorage
import {
  fixD, myStorage, getIconPath, imgMap,
} from '@/utils';
import futureWorker from '@/utils/futureWorker';

// mapState\

export default {
  name: 'market',
  components: {},
  props: {
    close: {
      default() {},
      type: Function,
    },
    isShow: {
      default: false,
      type: Boolean,
    },
  },
  data() {
    return {
      imgMap,
      getIconPath,
      // 币对列表
      // marketData: null,
      // 当前市场
      marketCurrent: null,

      // 行情数据
      WsData: {},
      // 当前合约市场
      currentTypeTab: 1,
      // 合约方向类型
      contractSide: 1,
      // 筛选
      listfilterVal: null,
      // 排序类别
      sortName: null,
      // 排序方向
      sortType: '',
      showTypeTabList0: false,
      showTypeTabList1: false,
      showTypeTabList2: false,
      showTypeTabList3: false,
      underlineStyle: {},
      MywebSocket: null,
      tableLoading: true,
    };
  },
  computed: {
    linkurl() {
      if (this.$store.state.baseData.publicInfo) {
        return this.$store.state.baseData.publicInfo.url;
      }
      return {};
    },
    worker() {
      return futureWorker();
    },
    // 是否登录
    isLogin() {
      return this.$store.state.baseData.isLogin;
    },
    // 类型列表 USDT合约/币本位合约
    typeTabList() {
      const arr = [];
      if (this.showTypeTabList0) {
        arr.push({
          id: 0,
          text: this.$t('futures.market.text5'), // '币本位合约',
          isShow: this.showTypeTabList0,
          classes: this.contractSide === 0 ? 'main-1-cl' : 'text-1-cl',
        });
      }
      if (this.showTypeTabList1) {
        arr.push({
          id: 1,
          text: this.$t('futures.market.text4'), // 'USDT合约',
          isShow: this.showTypeTabList1,
          classes: this.contractSide === 1 ? 'main-1-cl' : 'text-1-cl',
        });
      }
      if (this.showTypeTabList2) {
        arr.push({
          id: 2,
          text: this.$t('futures.market.text6'), // '混合合约',
          isShow: this.showTypeTabList2,
          classes: this.contractSide === 2 ? 'main-1-cl' : 'text-1-cl',
        });
      }
      if (this.showTypeTabList3) {
        arr.push({
          id: 3,
          text: this.$t('futures.market.text7'), // '模拟合约',
          isShow: this.showTypeTabList3,
          classes: this.contractSide === 3 ? 'main-1-cl' : 'text-1-cl',
        });
      }
      return arr;
      // return [
      //   {
      //     id: 1,
      //     text: this.$t("futures.market.text4"), // 'USDT合约',
      //     isShow: this.showTypeTabList1,
      //     classes: this.contractSide === 1 ? " text-1-cl" : "text-2-cl",
      //   },
      //   {
      //     id: 0,
      //     text: this.$t("futures.market.text5"), // '币本位合约',
      //     isShow: this.showTypeTabList0,
      //     classes: this.contractSide === 0 ? " text-1-cl" : "text-2-cl",
      //   },
      //   {
      //     id: 2,
      //     text: this.$t("futures.market.text6"), // '混合合约',
      //     isShow: this.showTypeTabList2,
      //     classes: this.contractSide === 2 ? " text-1-cl" : "text-2-cl",
      //   },
      //   {
      //     id: 3,
      //     text: this.$t("futures.market.text7"), // '模拟合约',
      //     isShow: this.showTypeTabList3,
      //     classes: this.contractSide === 3 ? " text-1-cl" : "text-2-cl",
      //   },
      // ];
    },
    // 合约列表
    contractList() {
      if (this.$store.state.future) {
        return this.$store.state.future.contractList;
      }
      return null;
    },
    // 当前合约名称
    contractName() {
      return this.$store.state.future.contractName;
    },
    // 当前合约信息
    contractInfo() {
      return this.$store.state.future.contractInfo;
    },
    // 合约币对价格精度
    pricefix() {
      return this.$store.state.future.pricefix;
    },
    // 合约类型列表
    contractTypeText() {
      return this.$store.state.future.contractTypeText;
    },
    // 币对列表
    marketList() {
      let data = [];
      let text = '';
      if (this.contractList && this.contractList.length) {
        this.contractList.forEach((item) => {
          // 混合合约 || 模拟合约
          if (item.contractType !== 'E') {
            text = `-${item.marginCoin}`;
          } else {
            text = '';
          }
          const symbolName = item.symbol.replace('-', '');
          const itemWsData = this.WsData[item.wsDatakey];
          data.push({
            type: this.filterType(item),
            key: item.wsDatakey,
            symbol: `${symbolName}${text}`,
            contractName: item.contractName,
            sort: item.sort,
            close: itemWsData
              ? itemWsData.close
              : '--',
            rose: itemWsData
              ? itemWsData.rose
              : '--',
            priceFix: item.priceFix,
            vol: itemWsData ? itemWsData.vol : '--',
            high: itemWsData ? itemWsData.high : '--',
            low: itemWsData ? itemWsData.low : '--',
          });
        });
      }
      // 搜索
      if (this.listfilterVal) {
        const reg = new RegExp(this.listfilterVal, 'gim');
        data = data.filter((item) => item.symbol.match(reg));
      }
      // 排序
      if (this.sortType === 'down') {
        data.sort(
          (a, b) => parseFloat(b[this.sortName]) - parseFloat(a[this.sortName]),
        );
      }
      if (this.sortType === 'up') {
        data.sort(
          (a, b) => parseFloat(a[this.sortName]) - parseFloat(b[this.sortName]),
        );
      }
      if (!this.sortType) {
        data.sort((a, b) => parseFloat(a.sort) - parseFloat(b.sort));
      }

      return data;
    },
    // 用户配置信息
    userConfig() {
      return this.$store.state.future.futureUserConfig;
    },
    // 合约币对列表
    contractSymbolList() {
      return this.$store.state.future.contractSymbolList;
    },
    dataLength() {
      let len = 0;
      this.marketList.forEach((item) => {
        if (this.marketList.length > 1) {
          len += 1;
        }
        item.data.forEach(() => {
          len += 1;
        });
      });
      return len;
    },
    tableHeight() {
      let h = 300;
      const spk = 14; // 条数
      if (this.dataLength > 5 && this.dataLength < spk) {
        h = 58 * this.dataLength;
      } else if (this.dataLength >= spk) {
        h = 58 * spk;
      }
      return h;
    },
  },
  watch: {
    marketList(val) {
      if (val) {
        this.tableLoading = false;
      }
    },
    isShow(val) {
      this.listfilterVal = null;
      if (val) {
        setTimeout(() => {
          let tabIndex;
          this.typeTabList.forEach((item, index) => {
            if (item.classes === 'main-1-cl') {
              tabIndex = index + 1;
            }
          });
          this.setTabStyle(tabIndex);
        }, 300);
      }
    },
    contractInfo(val, old) {
      if (val && !old) {
        this.contractSide = this.filterType(val);
      }
    },

    contractSymbolList(list) {
      if (list && list.length && this.MywebSocket) {
        list.forEach((item) => {
          this.$bus.$emit('WEBSOCKET_KLINE_SEND', {
            type: 'req',
            symbol: item,
            lastTimeS: '1min',
            lTime: null,
            number: 10,
            isNotActive: true,
          });
          this.$bus.$emit('WEBSOCKET_KLINE_SEND', {
            type: 'sub',
            symbol: item,
            lastTimeS: '1min',
            isNotActive: true,
          });
        });
      }
    },
    MywebSocket(value) {
      if (value && this.contractSymbolList && this.contractSymbolList.length) {
        this.contractSymbolList.forEach((item) => {
          this.$bus.$emit('WEBSOCKET_KLINE_SEND', {
            type: 'req',
            symbol: item,
            lastTimeS: '1min',
            lTime: null,
            number: 10,
            isNotActive: true,
          });
          this.$bus.$emit('WEBSOCKET_KLINE_SEND', {
            type: 'sub',
            symbol: item,
            lastTimeS: '1min',
            isNotActive: true,
          });
        });
      }
    },
  },
  filters: {
    // 涨跌幅处理
    fixdRose(value) {
      if (value && value !== '--') {
        let slie = '';
        const val = parseFloat(value, 0);
        if (val > 0) {
          slie = '+';
        }
        if (val < 0) {
          slie = '-';
        }
        const num = Math.abs((value * 10000) / 100);
        return `${slie}${Number(num.toString().match(/^\d+(?:\.\d{0,2})?/))}`;
      }
      return value;
    },
  },
  methods: {
    // 筛选币对列表
    filterType(data) {
      // USDT 合约
      if (data.contractType === 'E' && data.contractSide === 1) {
        this.showTypeTabList1 = true;
        return 1;
      }
      // 币本位合约
      if (data.contractType === 'E' && data.contractSide === 0) {
        this.showTypeTabList0 = true;
        return 0;
      }
      // 模拟合约
      if (data.contractType === 'S') {
        this.showTypeTabList3 = true;
        return 3;
      }
      // 混合合约
      this.showTypeTabList2 = true;
      return 2;
    },
    // 最新价 精度处理
    fixPrice(value, fix) {
      return fixD(value, fix);
    },
    // 市场切换下划线
    setTabStyle(index) {
      this.$nextTick(() => {
        const tab = this.$refs[`tab-${index}`];
        const { offsetLeft, offsetWidth } = Array.isArray(tab)
          ? this.$refs[`tab-${index}`][0]
          : tab;
        const left = offsetLeft + offsetWidth / 2;
        this.underlineStyle = {
          left: `${left - 20}px`,
        };
      });
    },
    // 切换合约类型
    changeTypeTab(type, index) {
      this.setTabStyle(index);
      this.contractSide = type;
      this.getReceiveCoupon();
    },
    // 搜索事件
    inputchanges(v) {
      this.listfilterVal = v;
    },
    // 币对排序
    sorteEvent(key) {
      this.$nextTick(() => {
        if (!this.sortName) {
          this.sortName = key;
          this.sortType = 'down';
        } else if (this.sortType === 'down') {
          this.sortName = key;
          this.sortType = 'up';
        } else if (this.sortType === 'up') {
          this.sortName = null;
          this.sortType = null;
        }
      });
    },
    // 切换币对
    switchSymbol(data) {
      let contractId;
      if (this.contractList && this.contractList.length) {
        this.contractList.forEach((item) => {
          if (data === item.contractName) {
            contractId = item.id;
          }
        });
      }
      myStorage.set('contractId', contractId);
      myStorage.set('contractName', data);
      myStorage.set('futuresMarketCurrent', this.contractSide);
      this.$bus.$emit('futuresMarketCurrent', this.contractSide);
      let coUrl = this.linkurl.coUrl ? `${this.linkurl.coUrl}/trade/${data}` : '';
      if (process.env.NODE_ENV === 'development') {
        coUrl = `/co/zh_CN/trade/${data}`;
      }
      window.location.href = coUrl;
      this.close();
    },
    // 涨跌幅 颜色 class
    roseClasses(data) {
      if (data && data !== '--') {
        const val = parseFloat(data, 0);
        if (val === 0) {
          return '';
        }
        return val > 0 ? 'rise-1-cl' : 'fall-1-cl';
      }
      return '';
    },
    roseClassesbg(data) {
      if (data && data !== '--') {
        const val = parseFloat(data, 0);
        if (val === 0) {
          return '';
        }
        return val > 0 ? 'rise-4-bg' : 'fall-4-bg';
      }
      return '';
    },
    init() {
      // 接收24小时行情数据
      this.$bus.$on('FUTURE_MARKET_DATA', (data) => {
        this.WsData = JSON.parse(data);
      });
      if (this.contractInfo) {
        this.contractSide = this.filterType(this.contractInfo);
      }
      this.$bus.$on('WEBSOCKET_ON_OPEN', (data) => {
        this.MywebSocket = data;
      });
      this.getReceiveCoupon();
    },

    sendLkine() {

      // this.$bus.$emit('WEBSOCKET_KLINE_SEND', {
      //   type: 'req',
      //   symbol: self.symbolCurrent,
      //   lastTimeS,
      //   lTime: self.lTime,
      //   number: 50,
      // });

    },
    // 获去赠金
    getReceiveCoupon() {
      if (
        this.isLogin
        && this.userConfig
        && this.contractSide === 3
        && this.userConfig.openContract === 1
        && this.userConfig.couponTag === 0
      ) {
        this.$store.dispatch('getReceiveCoupon');
      }
    },
  },
};
