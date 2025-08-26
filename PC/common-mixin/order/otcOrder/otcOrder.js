import {
  imgMap, colorMap, fixD, getCoinShowName, getIconPath,
} from '@/utils';

export default {
  name: 'page-otcOrder',
  data() {
    return {
      imgMap,
      colorMap,
      getIconPath,
      switchFlag: false,
      tabelLoading: true,
      tabelList: [],
      nowType: 1, // 1为当前委托 2为历史委托
      symbol: 'all', // 当前币种
      symbolList: [], // 币种选择列表
      side: 'all', // 方向
      paginationObj: {
        total: 0, // 数据总条数
        display: 10, // 每页显示条数
        currentPage: 1, // 当前页码
      },
      orderDetail: {
        detailMsg: {},
      },
      showOrderDetail: false,
    };
  },
  watch: {
    market(v) { if (v) { this.initSymbolList(); } },
  },
  computed: {
    linkurl() {
      if (this.$store.state.baseData.publicInfo) {
        return this.$store.state.baseData.publicInfo.url;
      }
      return {};
    },
    navTab() {
      return [
        // 当前委托
        { name: this.$t('order.otcOrder.nowOrder'), index: 1 },
        // 历史委托
        { name: this.$t('order.otcOrder.hisOrder'), index: 2 },
      ];
    },
    sideList() {
      return [ // 方向选择列表
        // 全部
        { code: 'all', value: this.$t('order.otcOrder.all') },
        // 买入
        { code: 'buy', value: this.$t('order.otcOrder.buy') },
        // 卖出
        { code: 'sell', value: this.$t('order.otcOrder.sell') },
      ];
    },
    market() { return this.$store.state.baseData.market; },
    axiosSide() {
      if (this.side === 'all') {
        return '';
      }
      return this.side;
    },
    axiosSymbol() {
      if (this.symbol === 'all') {
        return undefined;
      }
      return this.symbol;
    },
    // 表格title
    columns() {
      return [
        {
          title: this.$t('order.otcOrder.nowOrderId'),
          key: 'orderId',
        }, // 订单号
        {
          title: this.$t('order.otcOrder.nowOrderType'),
          key: 'type',
        }, // 类别
        {
          title: this.$t('order.otcOrder.nowOrderCoin'),
          key: 'coin',
        }, // 币种
        {
          title: this.$t('order.otcOrder.nowOrderPirce'),
          key: 'price',
        }, // 价格
        {
          title: this.$t('order.otcOrder.nowOrderVolume'),
          key: 'volume',
        }, // 数量
        {
          title: this.$t('order.otcOrder.nowOrderTotol'),
          key: 'amount',
        }, // 交易额
        {
          title: this.$t('order.otcOrder.nowOrderStatus'),
          key: 'status',
        }, // 状态
        {
          title: this.$t('order.otcOrder.nowOrderUser'),
          key: 'realName',
        }, // 交易方
      ];
    },
    baseData() { return this.$store.state.baseData; },
    otcLinkUrl() {
      const obj = {
        url: '',
        type: '', // 1为push 2为herf
      };
      // 开发
      if (process.env.NODE_ENV === 'development') {
        obj.url = '';
        obj.type = '1';
        // 线上
      } else if (window.HOSTAPI === 'otc') {
        obj.url = '';
        obj.type = '1';
      } else if (this.baseData.publicInfo) {
        obj.url = this.$store.state.baseData.publicInfo.url.otcUrl;
        obj.type = '2';
      }
      return obj;
    },
  },
  methods: {
    getFix(coin) {
      return this.market.coinList[coin.toLocaleUpperCase()].showPrecision;
    },
    currentCoinPriceFix(price, coin, payCoin, hasUnit = true) {
      let fix = this.$store.state.baseData.defaultFiatPrecision;
      if (payCoin
          && this.market
          && this.market.coinList[coin]
          && this.market.coinList[coin].fiatPrecision
          && this.market.coinList[coin].fiatPrecision[payCoin.toLowerCase()]) {
        fix = this.market.coinList[coin].fiatPrecision[payCoin.toLowerCase()];
        return hasUnit ? `${fixD(price, fix)} ${payCoin}` : fixD(price, fix);
      }
      return hasUnit ? `${fixD(price, 4)} ${payCoin}` : fixD(price, 4);
    },
    init() {
      if (this.market) { this.initSymbolList(); }
    },
    switchChange() {
      this.switchFlag = !this.switchFlag;
      this.getData();
    },
    initSymbolList() {
      const { coinList } = this.market;
      const list = [{
        code: 'all',
        value: this.$t('order.otcOrder.allCoin'),
      }];
      Object.keys(coinList).forEach((item) => {
        if (coinList[item].otcOpen) {
          list.push({ code: item, value: getCoinShowName(item, coinList) });
        }
      });
      this.symbol = 'all';
      this.symbolList = list;
      // if (list.length) { this.symbol = list[0].code; }
      this.getData();
    },
    getData() {
      if (this.nowType === 1) {
        this.getNowData();
      } else if (this.nowType === 2) {
        this.getHisData();
      }
    },
    // 获取当前
    getNowData() {
      const url = '/order/otc/unfinished';
      this.axios({
        url,
        method: 'post',
        params: {
          // side: this.axiosSide,
          pageSize: this.paginationObj.display, // 每页条数
          page: this.paginationObj.currentPage, // 页码
          coinSymbol: this.axiosSymbol,
        },
      }).then((data) => {
        if (this.nowType !== 1) return;
        this.tabelLoading = false;
        if (data.code.toString() === '0') {
          const list = [];
          data.data.orderList.forEach((item) => {
            let Aurl = '';
            if (process.env.NODE_ENV === 'development') {
              Aurl = `/otcDetailOrder?orderId=${item.sequence}`;
            } else {
              Aurl = `/otcDetailOrder?orderId=${item.sequence}`;
            }

            if (item.orderType) {
              Aurl = item.url;
            }
            let listSide = {};
            if (item.side === 'BUY') {
              listSide = {
                coin: getCoinShowName(item.coinSymbol, this.market.coinList), // 币种
                price: this.currentCoinPriceFix(item.price, item.coinSymbol, item.payCoin), // 价格
                amount: fixD(item.volume, this.getFix(item.coinSymbol)), // 数量
                volume: this.currentCoinPriceFix(item.totalPrice, item.coinSymbol, item.payCoin), // 交易额
              };
            } else {
              listSide = {
                coin: item.payCoin,
                price: `${fixD(item.price, this.getFix(item.coinSymbol))} ${item.coinSymbol}`,
                amount: this.currentCoinPriceFix(item.totalPrice, item.coinSymbol, item.payCoin, false), // 价格
                volume: `${fixD(item.volume, this.getFix(item.coinSymbol))} ${item.coinSymbol}`,
              };
            }
            list.push({
              id: JSON.stringify({
                ...item,
                detailLink: Aurl,
                detailMsg: {
                  price: listSide[1],
                  num: listSide[2],
                  numUnit: listSide[0],
                  otherUnit: item.side === 'BUY' ? item.payCoin : item.coinSymbol,
                },
              }),
              orderId: item.sequence, // 订单号
              type: item.type,
              typeClasses: item.side === 'BUY' ? 'rise-1-cl' : 'fall-1-cl',
              ...listSide,
              status: item.status_text, // 状态
              realName: item.realName,
              nickName: item.nickName,
              orderType: item.orderType,

            });
          });
          this.tabelList = list;
          this.paginationObj.total = data.data.count;
        }
      });
    },
    // 获取历史订单
    getHisData() {
      const url = '/order/otc/complete';
      this.axios({
        url,
        method: 'post',
        params: {
          // side: this.axiosSide,
          isShowCanceled: this.switchFlag ? 1 : 0,
          pageSize: this.paginationObj.display, // 每页条数
          page: this.paginationObj.currentPage, // 页码
          coinSymbol: this.axiosSymbol,
        },
      }).then((data) => {
        if (this.nowType !== 2) return;
        this.tabelLoading = false;
        if (data.code.toString() === '0') {
          const list = [];
          data.data.orderList.forEach((item) => {
            let Aurl = '';
            if (process.env.NODE_ENV === 'development') {
              Aurl = `/otcDetailOrder?orderId=${item.sequence}`;
            } else {
              Aurl = `/otcDetailOrder?orderId=${item.sequence}`;
            }
            if (item.orderType) {
              Aurl = item.url;
            }

            let listSide = {};
            if (item.side === 'BUY') {
              listSide = {
                coin: getCoinShowName(item.coinSymbol, this.market.coinList), // 币种
                price: this.currentCoinPriceFix(item.price, item.coinSymbol, item.payCoin), // 价格
                amount: fixD(item.volume, this.getFix(item.coinSymbol)), // 数量
                volume: this.currentCoinPriceFix(item.totalPrice, item.coinSymbol, item.payCoin), // 交易额
              };
            } else {
              listSide = {
                coin: item.payCoin,
                price: `${fixD(item.price, this.getFix(item.coinSymbol))} ${item.coinSymbol}`,
                amount: this.currentCoinPriceFix(item.totalPrice, item.coinSymbol, item.payCoin, false), // 价格
                volume: `${fixD(item.volume, this.getFix(item.coinSymbol))} ${item.coinSymbol}`,
              };
            }
            list.push({
              id: JSON.stringify({
                ...item,
                detailLink: Aurl,
                detailMsg: {
                  price: listSide[1],
                  num: listSide[2],
                  numUnit: listSide[0],
                  otherUnit: item.side === 'BUY' ? item.payCoin : item.coinSymbol,
                },
              }),

              orderId: item.sequence, // 订单号
              type: item.type,
              typeClasses: item.side === 'BUY' ? 'rise-1-cl' : 'fall-1-cl',
              ...listSide,
              status: item.status_text, // 状态
              statusTip: !!(item.status === 2 || item.status === 3),
              realName: item.realName,
              nickName: item.nickName,
              orderType: item.orderType,
            });
          });
          this.tabelList = list;
          this.paginationObj.total = data.data.count;
        }
      });
    },
    // 切换委托
    currentType(item) {
      if (this.nowType === item.index) { return; }
      this.nowType = item.index;
      this.paginationObj.currentPage = 1; // 页码
      this.paginationObj.total = 0; // 总条数
      this.tabelList = [];
      this.tabelLoading = true;
      this.getData();
    },
    // 切换币种
    symbolChange(item) {
      if (this.symbol === item.code) { return; }
      this.symbol = item.code;
      this.paginationObj.currentPage = 1; // 页码
      this.paginationObj.total = 0; // 总条数
      this.tabelList = [];
      this.tabelLoading = true;
      this.getData();
    },
    // 切换方向
    sideChange(item) {
      if (this.side === item.code) { return; }
      this.side = item.code;
      this.paginationObj.currentPage = 1; // 页码
      this.paginationObj.total = 0; // 总条数
      this.tabelList = [];
      this.tabelLoading = true;
      this.getData();
    },
    tableClick(type, v) {
      const data = JSON.parse(v);
      if (type === 'orderId') {
        const { orderType, detailLink } = data;
        if (orderType === 2) {
          this.orderDetail = data;
          this.showOrderDetail = true;
        } else if (this.otcLinkUrl.type === '1') {
          this.$router.push(detailLink);
        } else if (this.otcLinkUrl.type === '2') {
          window.location.href = this.otcLinkUrl.url + detailLink;
        }
      } else if (type === 'userName') {
        let id = '';
        if (data.side === 'BUY') {
          id = data.sellerId;
        } else if (data.side === 'SELL') {
          id = data.buyerId;
        }
        if (this.otcLinkUrl.type === '1') {
          this.$router.push(`${this.otcLinkUrl.url}/stranger?uid=${id}`);
        } else if (this.otcLinkUrl.type === '2') {
          window.location.href = `${this.otcLinkUrl.url}/stranger?uid=${id}`;
        }
      }
    },
    pagechange(v) {
      this.paginationObj.currentPage = v;
      this.getData();
    },
    jump() {
      if (this.orderDetail.url) {
        window.open(this.orderDetail.url);
      }
    },
  },
  mounted() {
    // 三方买卖成功后，提示弹窗-仅展示一次
    const { transId } = this.$route.query;
    const cacheId = window.sessionStorage.getItem(`trans_${transId}`);
    if (cacheId && cacheId === transId) {
      setTimeout(() => {
        this.$bus.$emit('messageBox', 'success', {
          title: this.$t('creditCardPurchase.transSuccess'),
          message: this.$t('creditCardPurchase.successTip'),
          confirmBtnText: this.$t('creditCardPurchase.continue'),
          callback: () => {},
        });
        window.sessionStorage.removeItem(`trans_${transId}`);
      }, 2000);
    }
  },
};
