import { mapState } from 'vuex';
import worker from '@/utils/webWorker';
import futureWorker from '@/utils/futureWorker';
import {
  myStorage, getCookie, getIconPath, colorMap, nul, fixD, division,
} from '@/utils';

export default {
  data() {
    return {
      colorMap,
      getIconPath,
      // 市场数据
      marketData: null,
      // MywebSocketco
      MywebSocketCo: null,
      // 当前市场
      marketCurrentCo: 'all',
      // 当前市场选项
      marketOption: myStorage.get('homeMarkOption') || 'co',
      // 当前币对
      symbolCurrent: myStorage.get('sSymbolName'),
      // 24小时行情WS数据
      marketDataObjCo: [],
      marketDataListCo: [],
      // 自选币对
      mySymbolListCo: myStorage.get('mySymbolCo') || [],
      setMyMarketSwitchCo: true,
      contractOptionalList: [], // 登录后合约自选列表
      //  =======
      // 市场数据
      marketDataEx: null,
      // MywebSocket
      MywebSocketEx: null,
      // 当前市场
      marketCurrentEx: myStorage.get('homeMarkSelect') || 'all',
      // 24小时行情WS数据
      marketDataObjEx: [],
      // =======
    };
  },
  computed: {
    functionSwitch() {
      return this.$store.state.baseData.functionSwitch;
    },
    isSaleBol() {
      let bol = false;
      if (this.functionSwitch && this.functionSwitch.jpSpotSwitch === 1) {
        bol = true;
      }
      return bol;
    },
    // WS URL
    wsUrl() {
      if (this.$store.state.future) {
        return this.$store.state.future.wsUrl || null;
      }
      return null;
    },
    ...mapState({
      baseInfo({ baseData }) {
        this.marketDataEx = baseData.market;
        // 获取当前币对
        this.symbolCurrent = myStorage.get('sSymbolName');
        return baseData;
      },
    }),
    // 合约币对列表
    contractSymbolList() {
      if (this.$store.state.future) {
        return this.$store.state.future.contractSymbolList;
      }
      return null;
    },
    // 合约列表
    contractList() {
      if (this.$store.state.future) {
        return this.$store.state.future.contractList;
      }
      return [];
    },
    // WS worker
    futureWorker() {
      return futureWorker();
    },
    // 全部 货币对
    symbolAll() {
      return this.$store.state.baseData.symbolAll;
    },
    // 当前币对列表
    symbolList() {
      return null;
    },
    // 汇率单位
    rateData() {
      return this.$store.state.baseData.rate;
    },
    isLogin() {
      return this.$store.state.baseData.isLogin;
    },
    userCurrency() {
      return getCookie('user_Currency') || 'USD';
    },
    lan() {
      return this.$store.state.baseData.lan;
    },
    // 当前合约保证金币种精度
    marginCoinFix() {
      if (this.contractInfo && this.contractInfo.coinResultVo) {
        return this.contractInfo.coinResultVo.marginCoinPrecision;
      }
      return 4;
    },
    // 合约币对价格精度
    pricefix() {
      if (this.$store.state.future) {
        return this.$store.state.future.pricefix;
      }
      return 4;
    },
    // =========
    // WS worker
    worker() {
      return worker();
    },
    // 当前市场列表
    currentMarketList() {
      return this.marketDataEx ? this.marketDataEx.market : null;
    },
    // 当前币对列表
    symbolListEx() {
      const { currentMarketList } = this;
      // 如果 当前市场 是 自选市场
      if (this.marketOption === 'optional') {
        let allSymbol = {};
        const resultSymbol = {};
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
      if (currentMarketList && this.marketCurrentEx === 'all') {
        let symbolMap = {};
        Object.values(currentMarketList).forEach((item) => {
          symbolMap = { ...symbolMap, ...item };
        });
        return symbolMap;
      }
      if (currentMarketList && this.marketCurrentEx) {
        return currentMarketList[this.marketCurrentEx];
      }
      return null;
    },
    // =========
  },
  watch: {
    // wsUrl
    wsUrl(val, old) {
      if (val && !old) {
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
          this.futureWorker.postMessage({
            type: 'CREAT_WEBSOCKET',
            data: {
              wsUrl: val,
              lan: bol ? 'ja_JP' : this.$store.state.baseData.lan,
              rate: '',
              symbolAll: {},
            },
          });
        }).catch(() => {
          // 创建WS
          this.futureWorker.postMessage({
            type: 'CREAT_WEBSOCKET',
            data: {
              wsUrl: val,
              lan: this.$store.state.baseData.lan,
              rate: '',
              symbolAll: {},
            },
          });
        });
      }
    },
    // 监听 是否登录
    isLogin(val) {
      if (val) {
        this.getCoOptionalList(); // 获取合约登录自选
      }
    },
    // 监听 webSocket 创建成功
    MywebSocketCo(val) {
      if (val) {
        // 发送 24小时行情历史数据 Send
        this.webSocketSend('Review');
        // 发送 24小时行情实时数据 Send
        this.webSocketSend('Market', 'sub', this.symbolCurrent, this.contractSymbolList);
      }
    },
    // =========
    // 监听获取到 market 接口的数据
    marketDataEx(val) {
      if (val.wsUrl) {
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
      }
    },
    // 监听 webSocket 创建成功
    MywebSocketEx(val) {
      if (val) {
        // 发送 24小时行情历史数据 Send
        this.webSocketSendEx('Review', null, this.symbolCurrent, this.symbolAll);
        // 发送 24小时行情实时数据 Send
        this.webSocketSendEx('Market', 'sub', this.symbolCurrent, this.symbolListEx);
      }
    },
    // =========
  },
  beforeDestroy() {
    this.webSocketSend('Market', 'unsub', this.symbolCurrent, this.contractSymbolList);
    this.webSocketSendEx('Market', 'unsub', this.symbolCurrent, this.symbolListEx);
    window.onscroll = null;
  },
  methods: {
    init() {
      if (myStorage.get('homeMarkSelectCo') === 0) {
        // 币本位合约
        this.marketCurrentCo = 0;
      } else {
        this.marketCurrentCo = myStorage.get('homeMarkSelectCo') || 'all';
      }
      this.onmessageWorkerEx();
      if (this.wsUrl) {
        this.futureWorker.postMessage({
          type: 'CREAT_WEBSOCKET',
          data: {
            wsUrl: this.wsUrl,
            lan: this.$store.state.baseData.lan,
            rate: '',
            symbolAll: {},
          },
        });
      }
      this.onmessageWorkerCo();

      if (this.isLogin) {
        this.getCoOptionalList(); // 获取合约登录自选
      }
      // 监听 usdt合约切换
      this.$bus.$on('SWITCH-MARKET-CO', (data) => {
        this.marketCurrentCo = data;
        this.setMarketDataCo();
      });
      // this.$bus.$on('SWITCH-STORE-CONTRACT', (data, id) => {
      //     this.setMyMarketCo(data, id);
      //     this.setMarketDataCo();
      // });
      this.$bus.$on('SWITCH-OPTION', (type) => {
        // 监听 自选现货合约tab
        this.marketOption = type;
        this.$nextTick(() => {
          this.setMarketDataCo();
        });
      });
    },
    // 获取点击自选,数据
    getOptionalDataCo(symbol, id) {
      this.setMyMarketCo(symbol, id);
      this.setMarketDataCo();
    },
    onmessageWorkerCo() {
      this.futureWorker.onmessage = (event) => {
        const { data } = event;
        // 监听 WebSocket 链接成功
        if (data.type === 'WEBSOCKET_ON_OPEN') {
          this.MywebSocketCo = data.data.type;
        }
        // 监听 WS 数据
        if (data.type === 'WEBSOCKET_DATA') {
          this.listenWSDataCo(data.data);
        }
      };
    },
    // 监听 WS 返回的数据
    listenWSDataCo(data) {
      const { type, WsData } = data;
      // 合约24小时行情数据
      if (type === 'FUTURE_MARKET_DATA') {
        this.marketDataObjCo = JSON.parse(WsData);
        this.setMarketDataCo();
      }
    },
    // 发送 Send
    webSocketSend(type, sendType, symbolData, symbolList) {
      this.futureWorker.postMessage({
        type: 'WEBSOCKET_SEND',
        data: {
          type,
          sendType,
          symbolData,
          symbolList,
          depthValue: 0,
        },
      });
    },
    thousands(num) {
      if (num) {
        const str = num.toString();
        const reg = str.indexOf('.') > -1 ? /(\d)(?=(\d{3})+\.)/g : /(\d)(?=(?:\d{3})+$)/g;
        return str.replace(reg, '$1,');
      }
      return num;
    },
    // 格式化合约24小时行情数据
    setMarketDataCo() {
      const data = [];
      let text = '';
      let contractList = [];
      if (this.marketCurrentCo === 'all') {
        contractList = this.contractList;
      }
      if (this.marketCurrentCo === 0) {
        // 币本位合约
        this.contractList.forEach((item) => {
          if (item.classification === 2) {
            contractList.push(item);
          }
        });
      }
      if (this.marketCurrentCo === 1) {
        // usdt合约
        this.contractList.forEach((item) => {
          if (item.classification === 1) {
            contractList.push(item);
          }
        });
      }
      if (this.marketCurrentCo === 3) {
        // 模拟合约
        this.contractList.forEach((item) => {
          if (item.classification === 4) {
            contractList.push(item);
          }
        });
      }
      if (this.marketCurrentCo === 2) {
        // 混合合约
        this.contractList.forEach((item) => {
          if (item.classification !== 1 && item.classification !== 2 && item.classification !== 4) {
            contractList.push(item);
          }
        });
      }
      // 自选
      if (this.marketOption === 'optional' && !this.isLogin) {
        contractList = [];
        this.contractList.forEach((item) => {
          // 混合合约 || 模拟合约
          if (item.contractType !== 'E') {
            text = `-${item.marginCoin}`;
          } else {
            text = '';
          }
          const symbolName = item.symbol.replace('-', '');

          if (this.mySymbolListCo.indexOf(`${symbolName}${text}`) > -1) {
            contractList.push(item);
          }
        });
      }
      //   登录自选
      if (this.marketOption === 'optional' && this.isLogin) {
        contractList = [];
        if (this.contractList && this.contractList.length) {
          this.contractList.forEach((item) => {
            if (this.contractOptionalList.indexOf(item.id.toString()) > -1) {
              contractList.push(item);
            }
          });
        }
      }

      if (contractList && contractList.length) {
        contractList.forEach((item) => {
          // 混合合约 || 模拟合约
          if (item.contractType !== 'E') {
            text = `-${item.marginCoin}`;
          } else {
            text = '';
          }
          const symbolName = item.symbol.replace('-', '');
          const itemWsData = this.marketDataObjCo[item.wsDatakey];
          data.push({
            id: item.id,
            type: this.filterContractType(item),
            key: item.wsDatakey,
            symbol: `${symbolName}${text}`,
            contractOtherName: item.contractOtherName, // 合约新名称
            contractName: item.contractName,
            sort: item.sort,
            close: itemWsData
              ? this.fixPrice(itemWsData.close, item.priceFix)
              : '--',
            closeSort: itemWsData ? itemWsData.close : '-1',
            rose: itemWsData
              ? this.thousands(itemWsData.rose)
              : '--',
            roseSort: itemWsData ? itemWsData.rose : '-1',
            priceFix: item.priceFix,
            vol: itemWsData ? itemWsData.vol : '--',
            high: itemWsData ? this.fixPrice(itemWsData.high, item.priceFix) : '--',
            highSort: itemWsData ? itemWsData.high : '-1',
            low: itemWsData ? this.fixPrice(itemWsData.low, item.priceFix) : '--',
            lowSort: itemWsData ? itemWsData.low : '-1',
            amount: itemWsData ? this.getVolume(itemWsData, item.multiplier, item.quote) : '--',
            amountSort: itemWsData ? this.getVolumeSort(itemWsData, item.multiplier) : '-1',
            closeRate: itemWsData ? this.thousands(this.getRate(itemWsData.close, item.quote)) : '--',
            multiplier: item.multiplier,
            iconSvg: this.isLogin ? this.myMarketIconCo(item.id) : this.myMarketIconCo(`${symbolName}${text}`),
          });
        });
      }
      this.marketDataListCo = data.sort((a, b) => a.sort - b.sort);
    },
    // 新价精度
    fixPrice(value, priceFix) {
      if (value) {
        return this.thousands(fixD(value, priceFix));
      }
      return '--';
    },
    // 折合法币价格
    getRate(close, symbol) {
      return this.fixRate(close, this.rateData, symbol, this.isSaleBol ? 'ja_JP' : this.lan);
    },
    // 获取24h成交额
    getVolume(data, multiplier, symbol) {
      const lan = this.isSaleBol ? 'ja_JP' : this.lan;
      let dealVol = nul(data.amount, multiplier);// 24H成交额
      let langLogo = ''; // 法币logo
      if (this.rateData) {
        const curRateData = this.rateData[lan];
        langLogo = curRateData ? curRateData.lang_logo : '';
      }
      dealVol = this.fixRate(dealVol, this.rateData, symbol, lan);
      if (dealVol !== '--') {
        dealVol = dealVol.replace(langLogo, '');
      }
      let dealVolUnit; // 24H成交额 数量单位
      if (lan === 'zh_CN') {
        if (dealVol >= 0 && dealVol < 10000) {
          dealVol = fixD(dealVol, 2);
        } else if (dealVol >= 10000 && dealVol < 100000000) {
          dealVol = fixD(division(dealVol, 10000), 2); // 22.1万
          dealVolUnit = this.$t('futures.currentSymbol.unitM');
        } else if (dealVol >= 100000000) {
          dealVol = fixD(division(dealVol, 100000000), 2); // 22.亿
          dealVolUnit = this.$t('futures.currentSymbol.unitB');
        }
      } else if (dealVol >= 0 && dealVol < 1000) {
        dealVol = fixD(dealVol, 2);
      } else if (dealVol >= 1000 && dealVol < 1000000) {
        dealVol = fixD(division(dealVol, 1000), 2); // 22.1k
        dealVolUnit = this.$t('futuresMarket.unitK');
      } else if (dealVol >= 1000000 && dealVol < 1000000000) {
        dealVol = fixD(division(dealVol, 1000000), 2); // 22.1M
        dealVolUnit = this.$t('futures.currentSymbol.unitM');
      } else if (dealVol >= 1000000000) {
        dealVol = fixD(division(dealVol, 1000000000), 2); // 22.亿
        dealVolUnit = this.$t('futures.currentSymbol.unitB');
      }
      if (dealVolUnit) {
        return langLogo + dealVol + dealVolUnit; //
      }
      return langLogo + dealVol;
    },
    // 获取24h成交额排序
    getVolumeSort(data, multiplier) {
      return nul(data.amount, multiplier);// 24H成交额
    },
    // 筛选合约币对列表
    filterContractType(data) {
      // USDT 合约
      if (data.classification === 1) {
        return 1;
      }
      // 币本位合约
      if (data.classification === 2) {
        return 0;
      }
      // 模拟合约
      if (data.classification === 4) {
        return 3;
      }
      // 混合合约
      return 2;
    },
    // 设置币对是否收藏的ICON
    myMarketIconCo(symbol) {
      if (this.mySymbolListCo.indexOf(symbol) === -1 && !this.isLogin) {
        return `<svg class="icon icon-16" viewBox="0 0 1024 1024" width="200" height="200">${getIconPath('coin_collection', 'text-3-cl')}</svg>`;
      }
      if (this.contractOptionalList.indexOf(symbol.toString()) === -1 && this.isLogin) {
        // 未选中
        return `<svg class="icon icon-16" viewBox="0 0 1024 1024" width="200" height="200">${getIconPath('coin_collection', 'text-3-cl')}</svg>`;
      }
      // 选中
      return `<svg class="icon icon-16" viewBox="0 0 1024 1024" width="200" height="200">${getIconPath('coin_collection', 'main-1-cl')}</svg>`;
    },
    // 设置 自选币对
    setMyMarketCo(symbol, contractId) {
      // 防止重复点击
      if (!this.setMyMarketSwitchCo) return;
      this.setMyMarketSwitchCo = false;
      const url = this.$store.state.url.futures.contractOptionaSet;
      if (this.isLogin) {
        // 登录
        if (this.contractOptionalList.length && this.contractOptionalList.indexOf(contractId.toString()) > -1) {
          this.contractOptionalList = this.contractOptionalList.filter((item) => item !== contractId.toString());
          // 设置自选币对删除
        } else {
          this.contractOptionalList.push(contractId);
          // 设置自选币对添加
        }
        // 去重
        if (this.contractOptionalList) {
          this.contractOptionalList = Array.from(new Set(this.contractOptionalList));
        }
        this.axios({
          url,
          headers: {},
          params: {
            contractOptionalList: this.contractOptionalList ? this.contractOptionalList.join(',') : '', // 合约id自选列表，1,2,3,4
          },
          hostType: 'co',
          method: 'post',
        }).then((data) => {
          if (data.code === '0') {
            this.setMyMarketSwitchCo = true;
            this.getCoOptionalList();
          } else {
            this.$bus.$emit('tip', { text: data.msg, type: 'error' });
          }
        });
      } else {
        // 未登录
        let mySymbolCo = myStorage.get('mySymbolCo') || [];
        if (mySymbolCo.length && mySymbolCo.indexOf(symbol) > -1) {
          mySymbolCo = mySymbolCo.filter((item) => item !== symbol); //   删除自选
        } else {
          mySymbolCo.push(symbol); // 添加自选
        }
        this.setMyMarketSwitchCo = true;
        this.mySymbolListCo = mySymbolCo;
        myStorage.set('mySymbolCo', mySymbolCo);
      }
    },
    // 获取登录合约自选列表数据
    getCoOptionalList() {
      const url = this.$store.state.url.futures.contractOptionalList;
      if (this.isLogin) {
        this.axios({
          url,
          headers: {},
          method: 'post',
          hostType: 'co',
        }).then((data) => {
          if (data.code === '0') {
            let coOptionalStr = data ? data.data : '';
            if (coOptionalStr) {
              coOptionalStr = coOptionalStr.split(',');
            }
            this.contractOptionalList = coOptionalStr || [];
            this.setMarketDataCo();
          } else {
            this.$bus.$emit('tip', { text: data.msg, type: 'error' });
          }
        });
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
    fixRate(price, exrate, market, language) {
      const lang = language || 'en_US';
      // if (lang === 'el_GR') { lang = 'zh_CN' }
      if (!exrate) {
        return '--';
      }
      const larate = exrate[lang] || exrate.en_US;
      const pric = larate[market] * price;
      if (`${parseFloat(pric)}` !== 'NaN') {
        return larate.lang_logo + pric.toFixed(2);
      }
      return '--';
    },
    // ========
    onmessageWorkerEx() {
      this.worker.onmessage = (event) => {
        const { data } = event;
        // 监听 WebSocket 链接成功
        if (data.type === 'WEBSOCKET_ON_OPEN') {
          this.MywebSocketEx = data.data.type;
        }
        // 监听 WS 数据
        if (data.type === 'WEBSOCKET_DATA') {
          this.listenWSDataEx(data.data);
        }
      };
    },
    // 监听 WS 返回的数据
    listenWSDataEx(data) {
      const { type, WsData } = data;
      // 24小时行情数据
      if (type === 'MARKET_DATA') {
        this.marketDataObjEx = WsData;
        this.setRecommendData();
      }
    },
    // 发送 Send
    webSocketSendEx(type, sendType, symbolData, symbolList) {
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
      this.$bus.$emit('RECOMMEEND_DATA', this.marketDataObjEx);
    },
    // ========
  },
};
