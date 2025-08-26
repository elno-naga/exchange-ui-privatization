import { mapState } from 'vuex';
import worker from '@/utils/webWorker';
import {
  myStorage, getCoinShowName, getCookie, getIconPath, colorMap, formatVolume,
} from '@/utils';

export default {
  data() {
    return {
      colorMap,
      getIconPath,
      // 市场数据
      marketData: null,
      // MywebSocket
      MywebSocket: null,
      // 当前市场
      marketCurrent: myStorage.get('homeMarkSelect') || 'all',
      // 当前市场选项
      marketOption: myStorage.get('homeMarkOption') || 'spot',
      // 当前币对
      symbolCurrent: myStorage.get('sSymbolName'),
      // 当前币对列表
      symbolCurrentList: [],
      // 筛选 货币对
      listfilter: null,
      // 表格加载LOADING
      tableLoading: false,
      // 表格 超过 20条出现滚动条
      lineNumber: 20,
      // 24小时行情WS数据
      marketDataObj: [],
      marketDataList: [],
      // 推荐位数据
      recommendDataList: {},
      klineDataList: {},
      // 自选币对
      mySymbolList: myStorage.get('mySymbol') || [],
      setMyMarketSwitch: true,
      // 是否显示左侧数据栏
      isShowRecommend: true,
      // 5.0行情
      isNew: true,

    };
  },
  computed: {
    ...mapState({
      baseInfo({ baseData }) {
        this.marketData = baseData.market;
        // 获取当前币对
        this.symbolCurrent = myStorage.get('sSymbolName');
        return baseData;
      },
    }),
    coinTagLangs() {
      return this.$store.state.baseData.coinTagLangs;
    },
    coinTagOpen() {
      return this.$store.state.baseData.coin_tag_open;
    },
    // WS worker
    worker() {
      return worker();
    },
    // 全部 货币对
    symbolAll() {
      return this.$store.state.baseData.symbolAll;
    },
    // 当前市场列表
    currentMarketList() {
      return this.marketData ? this.marketData.market : null;
    },
    coinList() {
      if (this.$store.state.baseData.market) {
        return this.$store.state.baseData.market.coinList;
      }
      return null;
    },
    // 当前币对列表
    symbolList() {
      const { currentMarketList } = this;
      // 如果 当前市场 是 自选市场
      if (this.marketOption === 'optional') {
        let allSymbol = {};
        const resultSymbol = {};
        // 注释,默认显示全部自选
        // if (currentMarketList && this.marketCurrent !== 'all') {
        //   allSymbol = currentMarketList[this.marketCurrent];
        // } else
        if (currentMarketList) {
          Object.values(currentMarketList).forEach((item) => {
            allSymbol = { ...allSymbol, ...item };
          });
        }
        Object.keys(allSymbol).forEach((item) => {
          if (this.mySymbolList && this.mySymbolList.indexOf(allSymbol[item].name) > -1) {
            resultSymbol[item] = allSymbol[item];
          }
        });
        return resultSymbol;
      }
      // 非自选市场
      if (currentMarketList && this.marketCurrent === 'all') {
        let symbolMap = {};
        Object.values(currentMarketList).forEach((item) => {
          symbolMap = { ...symbolMap, ...item };
        });
        return symbolMap;
      }
      if (currentMarketList && this.marketCurrent) {
        return currentMarketList[this.marketCurrent];
      }
      return null;
    },
    // 汇率单位
    rateData() {
      return this.$store.state.baseData.rate;
    },
    isLogin() {
      return this.$store.state.baseData.isLogin;
    },
    optionalSymbolServerOpen() {
      return this.$store.state.baseData.optional_symbol_server_open;
    },
    userCurrency() {
      return getCookie('user_Currency') || 'USD';
    },
  },
  watch: {
    symbolList(val, oldVal) {
      if (oldVal) {
        this.webSocketSend('Market', 'unsub', this.symbolCurrent, oldVal);
        this.webSocketSend('Market', 'sub', this.symbolCurrent, val);
      }
    },
    // 监听 是否登录
    isLogin(val) {
      if (val) {
        this.mySymbolList = myStorage.get('mySymbol') || [];
      }
    },
    // 监听获取到 market 接口的数据
    marketData(val) {
      if (val.wsUrl) {
        this.axios({
          url: 'common/switch',
          method: 'GET',
        }).then((data) => {
          let bol = false;
          if (data.code === '0') {
            const { switchVo } = data.data;
            if (switchVo && switchVo.jpSpotSwitch === 1) {
              bol = true;
            }
          } else {
            bol = false;
          }
          // 创建WS
          this.worker.postMessage({
            type: 'CREAT_WEBSOCKET',
            data: {
              wsUrl: val.wsUrl,
              lan: bol ? 'ja_JP' : this.$store.state.baseData.lan,
              rate: this.rateData,
              symbolAll: this.symbolAll,
            },
          });
        }).catch(() => {
          // 创建WS
          this.worker.postMessage({
            type: 'CREAT_WEBSOCKET',
            data: {
              wsUrl: val.wsUrl,
              lan: this.userCurrency,
              rate: this.rateData,
              symbolAll: this.symbolAll,
            },
          });
        });
      }
    },
    // 监听 webSocket 创建成功
    MywebSocket(val) {
      if (val) {
        // 发送 24小时行情历史数据 Send
        this.webSocketSend('Review', null, this.symbolCurrent, this.symbolAll);
        // 发送 24小时行情实时数据 Send
        this.webSocketSend('Market', 'sub', this.symbolCurrent, this.symbolList);
        // 发送 推荐位 kline数据 Send
        if (this.symbolCurrent) {
          this.klneSend();
        }
      }
    },
    symbolCurrent(val, oldVal) {
      if (val && this.MywebSocket) {
        this.isShowRecommend = true;
        this.klneSend(oldVal);
      }
    },
    mySymbolList(val) {
      if (val) {
        this.$bus.$emit('MYSYMBOL-LIST', val);
      }
    },
  },
  beforeDestroy() {
    this.webSocketSend('Market', 'unsub', this.symbolCurrent, this.symbolList);
    window.onscroll = null;
  },
  methods: {
    init() {
      this.onmessageWorker();
      // 监听 市场切换
      this.$bus.$on('SWITCH-MARKET', (data) => {
        this.marketCurrent = data;
        this.setMarketData();
      });
      // this.$bus.$on('SWITCH-STORE', (data) => {
      //   this.setMyMarket(data);
      //   this.setMarketData();
      // });
      this.$bus.$on('SWITCH-SYMBOL', (data) => {
        this.symbolCurrent = data;
        this.setRecommendData();
      });
      this.$bus.$emit('MYSYMBOL-LIST', this.mySymbolList);
      // 监听 窗口的大小改变
      this.$bus.$on('WINFOW_ON_RESIIZE', () => {
        this.isShowRecommend = true;
      });
      this.$bus.$on('SWITCH-OPTION', (type) => {
        this.marketOption = type;
        this.$nextTick(() => {
          this.setMarketData();
        });
      });
    },
    // 获取点击自选,现货数据
    getOptionalDataEx(data) {
      this.setMyMarket(data);
      this.setMarketData();
    },
    klneSend(oldVal) {
      const symbolArr = this.symbolCurrent.toLowerCase().split('/');
      const symbol = symbolArr[0] + symbolArr[1];
      if (oldVal) {
        const oldSymbolArr = oldVal.toLowerCase().split('/');
        const oldSsymbol = oldSymbolArr[0] + oldSymbolArr[1];
        this.worker.postMessage({
          type: 'WEBSOCKET_KLINE_SEND',
          data: {
            symbol: oldSsymbol,
            type: 'unsub',
            lastTimeS: '1min',
          },
        });
      }
      this.worker.postMessage({
        type: 'WEBSOCKET_KLINE_SEND',
        data: {
          symbol,
          type: 'req',
          lastTimeS: '1min',
          lTime: false,
          number: 100,
          symbolCurrent: this.symbolCurrent,
        },
      });
      this.worker.postMessage({
        type: 'WEBSOCKET_KLINE_SEND',
        data: {
          symbol,
          type: 'sub',
          lastTimeS: '1min',
          lTime: false,
          symbolCurrent: this.symbolCurrent,
        },
      });
    },
    onmessageWorker() {
      this.worker.onmessage = (event) => {
        const { data } = event;
        // 监听 WebSocket 链接成功
        if (data.type === 'WEBSOCKET_ON_OPEN') {
          this.MywebSocket = data.data.type;
        }
        // 监听 WS 数据
        if (data.type === 'WEBSOCKET_DATA') {
          this.listenWSData(data.data);
        }
      };
    },
    // 监听 WS 返回的数据
    listenWSData(data) {
      const { type, WsData } = data;
      // 24小时行情数据
      if (type === 'MARKET_DATA') {
        this.marketDataObj = WsData;
        this.setMarketData();
        this.setRecommendData();
      }
      if (type.indexOf('KLINE_DATA') > -1) {
        const [, symbolType] = WsData.channel.split('_');
        const key = this.symbolCurrent;
        const symbolArr = this.symbolCurrent.toLowerCase().split('/');
        const symbol = symbolArr[0] + symbolArr[1];
        if (symbol === symbolType) {
          if (WsData.event_rep === 'rep') {
            const kData = WsData.data;

            this.klineDataList[key] = [];
            const lengthNumber = kData.slice(-20);
            lengthNumber.forEach((item) => {
              this.klineDataList[key].push([
                item.id,
                item.close,
              ]);
            });
          } else {
            const kData = WsData.tick;
            const keyYs = this.klineDataList[key] || [];
            const lengths = keyYs.length;
            if (this.klineDataList[key].length) {
              const lastId = this.klineDataList[key][lengths - 1][0];
              if (lastId === kData.id) {
                this.klineDataList[key].pop();
              }
              if (this.klineDataList[key].length > 20) {
                this.klineDataList[key].shift();
              }
              if (lastId <= kData.id) {
                this.klineDataList[key].push([
                  kData.id,
                  kData.close,
                ]);
              }
            }
          }
        }
        this.$bus.$emit('RECOMMEEND_KLINE_DATA', this.klineDataList);
      }
    },
    // 发送 Send
    webSocketSend(type, sendType, symbolData, symbolList) {
      this.worker.postMessage({
        type: 'WEBSOCKET_SEND',
        data: {
          type,
          sendType,
          symbolData,
          symbolList,
        },
      });
    },
    // 格式化 推荐位的 K线数据
    setRecommendData() {
      this.$bus.$emit('RECOMMEEND_DATA', this.marketDataObj);
    },
    getCoinLabel(name, coinList = {}) {
      if (coinList && coinList[name.toUpperCase()]) {
        const { coinTag = '' } = coinList[name.toUpperCase()];
        return coinTag ? this.coinTagLangs[coinTag] : '';
      }

      return '';
    },
    thousands(num) {
      if (num) {
        const str = num.toString();
        const reg = str.indexOf('.') > -1 ? /(\d)(?=(\d{3})+\.)/g : /(\d)(?=(?:\d{3})+$)/g;
        return str.replace(reg, '$1,');
      }
      return num;
    },

    // 格式化 推荐位的24小时行情数据
    setMarketData() {
      if (!this.symbolList) return;
      const marketDataList = [];
      const keyarr = Object.keys(this.symbolList);
      keyarr.forEach((item) => {
        if (this.symbolList[item].newcoinFlag) {
          this.newcoinFlag = true;
        }
        const itemData = this.marketDataObj[item];
        if (itemData) {
          const showName = getCoinShowName(itemData.name, this.symbolAll);
          const coinLabel = this.getCoinLabel(itemData.symbol.symbol, this.coinList);
          marketDataList.push({
            isShow: this.symbolList[item].isShow,
            id: itemData.name,
            showName,
            coinLabel: coinLabel && this.coinTagOpen ? coinLabel : '',
            iconSvg: this.myMarketIcon(itemData.name),
            sort: itemData.sort,
            latestPrice: this.thousands(itemData.close.data),
            latestPriceSort: itemData.close.data,
            latestSub: this.thousands(itemData.close.price),
            increase: this.thousands(itemData.rose.data),
            increaseSort: itemData.rose.data,
            increaseClass: itemData.rose.class,
            highestPrice: this.thousands(itemData.high),
            lowestPrice: this.thousands(itemData.low),
            highestPriceSort: itemData.high,
            lowestPriceSort: itemData.low,
            volume: this.thousands(formatVolume(itemData.amount, this.rateData, itemData.symbol.unit)),
          });
        }
      });
      this.marketDataList = marketDataList.sort((a, b) => a.sort - b.sort);
    },
    // 设置币对是否收藏的ICON
    myMarketIcon(symbol) {
      if (this.mySymbolList.indexOf(symbol) === -1) {
        return `<svg class="icon icon-16" viewBox="0 0 1024 1024" width="200" height="200">${getIconPath('coin_collection', 'text-3-cl')}</svg>`;
      }
      return `<svg class="icon icon-16" viewBox="0 0 1024 1024" width="200" height="200">${getIconPath('coin_collection', 'main-1-cl')}</svg>`;
    },
    // 设置 自选币对
    setMyMarket(symbol) {
      let url = this.$store.state.url.common.optional_symbol;
      if (this.optionalSymbolServerOpen === 1) {
        url = this.$store.state.url.common.optional_symbols;
      }
      // 防止重复点击
      if (!this.setMyMarketSwitch) return;
      this.setMyMarketSwitch = false;

      let mySymbol = myStorage.get('mySymbol') || [];
      let addOrDelete = true;
      if (mySymbol.length && mySymbol.indexOf(symbol) > -1) {
        mySymbol = mySymbol.filter((item) => item !== symbol);
        addOrDelete = false;
        // 设置自选币对(type:添加,删除，page:市场，交易,symbolName: 币对)
        window.gtag('event', 'collect_symbol', {
          ver: '6.0', source: 'pc', type: '删除自选币种', page: '市场', symbolName: symbol,
        });
      } else {
        mySymbol.push(symbol);
        addOrDelete = true;
        // 设置自选币对(type:添加,删除，page:市场，交易,symbolName: 币对)
        window.gtag('event', 'collect_symbol', {
          ver: '6.0', source: 'pc', type: '添加自选币种', page: '市场', symbolName: symbol,
        });
      }
      if (this.optionalSymbolServerOpen === 1 && this.isLogin) {
        this.axios({
          url,
          headers: {},
          params: {
            operationType: addOrDelete === true ? '1' : '2', // 0批量添加 1单个添加 2单个删除
            symbols: symbol,
          },
          method: 'post',
        }).then((data) => {
          if (data.code === '0') {
            this.setMyMarketSwitch = true;
            this.mySymbolList = mySymbol;
            myStorage.set('mySymbol', mySymbol);
          } else {
            this.$bus.$emit('tip', { text: data.msg, type: 'error' });
          }
        });
      } else {
        this.setMyMarketSwitch = true;
        this.mySymbolList = mySymbol;
        myStorage.set('mySymbol', mySymbol);
      }
    },
    // 24小时行情 涨跌幅 的背景、样色的class
    itemRoseClass(rose) {
      let bgClass = null;
      if (rose.class === 'rise-1-cl') {
        bgClass = 'rose-label rise-4-bg';
      } else if (rose.class === 'fall-1-cl') {
        bgClass = 'rose-label fall-4-bg';
      }
      return [rose.class, bgClass];
    },
    closeRecommend() {
      this.isShowRecommend = false;
    },
  },
};
