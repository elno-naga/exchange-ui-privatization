// mapState
import { mapState } from 'vuex';
// 24小时行情
import {
  getIconPath,
  imgMap,
  colorMap,
  formatTimeFn,
  nul,
  fixD,
} from '@/utils';

export default {
  name: 'sale',
  data() {
    return {
      getIconPath,
      imgMap,
      colorMap,
      formatTimeFn,
      routeSymbol: this.$route.params.symbol,
      // 是否是移动端
      isMobile: window.isMobile,
      // 窗口宽度
      screenWidth: null,
      // 宽度分割
      mediaWidth: 1820,
      symbolNameClass: 'saleCurrentCoin',
      routerPathClass: 'trade',
      // shuju
      marketData: null,

      // 轮询 K 线
      pollKline: null,
      // 当前币对
      symbolCurrent: {},
      // tabs K 线
      tabsKline: [
        {
          title: '1H',
          value: '1H',
          labelTimeType: 'HH:MM',
          TimeTypeX: 'HH:MM',
        },
        {
          title: '1D',
          value: '24H',
          labelTimeType: 'HH:MM',
          TimeTypeX: 'HH:MM',
        },
        {
          title: '1W',
          value: '1W',
          labelTimeType: 'MM-DD HH:MM',
          TimeTypeX: 'MM-DD',
        },
        {
          title: '1M',
          value: '1M',
          labelTimeType: 'MM-DD HH:MM',
          TimeTypeX: 'MM-DD',
        },
        {
          title: '1Y',
          value: '1Y',
          labelTimeType: 'MM-DD',
          TimeTypeX: 'MM-DD',
        },
      ],
      currentTabKline: '1H',
      dataCoinList: [], // 贩卖所币种信息
      isLimit: true,

      dateList: [],
      priceList: [],
      soureList: [],
      priceMin: 0,
      priceMax: null,

      isHideMinAssets: true,
      tableList: [],
      tableLoading: true,
      pagination: { // 翻页数据
        count: 0, // 总数量
        pageSize: 10, // 每页显示条数
        page: 1, // 当前页数
      },
      coinMarket: {},
      coinInfoList: [],
      coinMarketTime: null,
      showRateTip: null,
    };
  },
  computed: {
    lan() {
      return this.$store.state.baseData.lan;
    },
    activeName() {
      return this.$route.meta.activeName;
    },
    // market 接口
    market() {
      return this.$store.state.baseData.market;
    },
    ...mapState({
      baseInfo({ baseData }) {
        this.marketData = baseData.market;
        // 获取当前币对
        return baseData;
      },
    }),
    // 全部币种列表
    coinList() {
      if (this.$store.state.baseData && this.$store.state.baseData.market) {
        return this.$store.state.baseData.market.coinList;
      }
      return null;
    },
    symbolAll() {
      return this.$store.state.baseData.symbolAll;
    },
    // 当前币对精度计算的值
    fixValue() {
      if (this.symbolAll && this.symbolCurrent) {
        const symbol = this.symbolAll[this.symbolCurrent];
        return {
          priceFix: symbol.price,
          volumeFix: symbol.volume,
        };
      }
      return {
        priceFix: 2,
        volumeFix: 8,
      };
    },
    // 是否Login
    isLogin() {
      return this.$store.state.baseData.isLogin;
    },
    // Market 数据
    marketList() {
      return this.marketData ? this.marketData.market : null;
    },

    option1() {
      const that = this;
      return {
        tooltip: {
          backgroundColor: that.colorMap['special-6-bg'],
          borderColor: that.colorMap['special-6-bg'],
          textStyle: {
            color: that.colorMap['text-1-cl'],
          },
          trigger: 'axis',
          axisPointer: {
            type: 'line',
            label: {
              formatter: () => {
                const str = '';
                return str;
              },
            },
            lineStyle: {
              type: 'solid',
              color: {
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [{
                  offset: 0, color: '#2B61FF', // 开始颜色
                }, {
                  offset: 1, color: '#1A3A99', // 结束颜色
                }],
              },
            },
          },
          formatter(params) {
            const ind = params[0].dataIndex;
            let str = params[0].name;
            if (ind !== null && ind !== undefined && that.soureList.length) {
              const currentTabs = that.tabsKline.filter((item) => item.value === that.currentTabKline)[0];
              str = formatTimeFn(Number(that.soureList[ind][0]), currentTabs.labelTimeType);
              str = str.indexOf('-') !== -1 ? str.replaceAll('-', '/') : str;
            }
            return `${params[0].value}<br/>${str}`;
          },
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          splitNumber: 5,
          axisTick: {
            show: false,
          },
          axisLine: {
            show: false,
          },
          axislabel: {
            margin: 0,
            hideOverlap: true,
            interval: 5,
            textStyle: {
              // y轴文字颜色
              color: colorMap['text-1-cl'],
            },
          },
          data: this.dateList,
        },
        yAxis: {
          type: 'value',
          show: false,
          splitNumber: 5,
          minInterval: 1,
          boundaryGap: [0, '100%'],
          min: this.priceMin,
          max: this.priceMax,
        },
        series: [
          {
            type: 'line',
            sampling: 'lttb',
            smooth: true,
            showSymbol: false,
            symbol: 'circle', // 标志图形类型为空心圆
            symbolSize: 5,
            itemStyle: {
              color: colorMap['main-1-bg'], // 标志图形颜色
              borderColor: colorMap['text-1-bg'], // 标志图形边框颜色
              borderWidth: 1, // 标志图形边框宽度
            },
            lineStyle: {
              color: 'rgba(43, 97, 255,1)', // 线的颜色
            },
            areaStyle: {
              // eslint-disable-next-line no-undef
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {
                  offset: 0,
                  color: 'rgba(43, 97, 255,0.7)',
                },
                {
                  offset: 1,
                  color: 'rgba(43, 97, 255,0)',
                },
              ]),
            },
            data: this.priceList,
          },
        ],
        grid: {
          top: '16px',
          left: '1px',
          right: '1px',
          bottom: '20px',
        },
      };
    },

    // 历史订单
    // 表头
    columns() {
      return [
        {
          title: this.$t('broker.symbolType'), // '币种'
          key: 'coin',
        },
        {
          key: 'time',
          title: this.$t('order.exchangeOrder.nowOrderTime'), // '时间',
        },
        {
          title: this.$t('trade5.direction'), // '方向'
          key: 'side',
        },
        {
          title: this.$t('trade.price'), // 价格
          key: 'price',
        },
        {
          title: this.$t('trade.number'), // 数量
          key: 'volume',
        },
        {
          title: this.$t('trade.turnover'), // 成交额
          key: 'dealPrice',
        },
        {
          title: this.$t('trade.status'), // '状态'
          key: 'status',
        },
      ];
    },
    orderStatus() {
      return [
        {
          label: this.$t('sale.texta9'),
          value: 1,
          color: 'special-4-bg',
        },
        {
          label: this.$t('sale.texta10'),
          value: 2,
          color: 'warning-1-bg',
          message: this.$t('sale.texta14'),
        },
        {
          label: this.$t('sale.texta12'),
          value: 3,
          color: 'fall-1-bg',
        },
        {
          label: this.$t('sale.texta11'),
          value: 4,
          color: 'warning-1-bg',
          message: this.$t('sale.texta15'),
        },
        {
          label: this.$t('sale.texta13'),
          value: 5,
          color: 'rise-1-bg',
        },
      ];
    },
  },
  watch: {
    market: {
      immediate: true,
      handler(v) {
        if (v) {
          this.init();
        }
      },
    },
    symbolCurrent: {
      deep: true,
      handler(v, oldval) {
        if (v) {
          if (oldval && oldval.coin && oldval.coin === v.coin) {
            return;
          }
          this.$router.push(`/sale/${v.showName}`);
          this.routeSymbol = v.showName;
          this.getPollPublicKline();
          this.tableLoading = true;
          this.pagination.page = 1;
          this.getOrderList();
        }
      },
    },
    coinMarket: {
      deep: true,
      handler() {
        if (this.coinInfoList && this.coinInfoList.length) {
          this.setDataCoinList();
        }
      },
    },
    coinInfoList: {
      deep: true,
      handler(v) {
        if (v && this.coinMarket && Object.keys(this.coinMarket).length) {
          this.setDataCoinList();
        }
      },
    },
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize);
    if (this.$refs.option1) {
      this.$refs.option1.myChart.dispose();
    }
  },
  methods: {
    init() {
      this.getCoinMarketInfoCollect();
      this.screenWidth = document.body.clientWidth;
      if (this.screenWidth < 961) {
        this.isMobile = true;
        this.marketShrink = false;
        const screenHeight = document.documentElement.clientHeight;
        this.mainBlockheight = `${screenHeight - 50}px`;
      }
      if (this.screenWidth <= this.mediaWidth) {
        this.shrink = true;
        this.marketShrink = false;
      }
      window.addEventListener('resize', this.handleResize);
    },

    getCoinMarketInfoCollect() {
      this.getCoinMarketInfoSetInv();
      this.getCoinCurrencies();
    },
    setDataCoinList() {
      const dataCoinList = [];
      if (this.coinMarket
            && this.coinInfoList && this.coinInfoList.length) {
        // eslint-disable-next-line array-callback-return
        this.coinInfoList.map((item) => {
          let indItem = {};
          if (this.coinMarket[item.coin]) {
            indItem = {
              ...item,
              price: this.coinMarket[item.coin].price,
              change: this.coinMarket[item.coin].change ? `${this.addSign(nul(this.coinMarket[item.coin].change, 100))}%` : this.addSign(this.coinMarket[item.coin].change),
              ratio: this.coinMarket[item.coin].change,
              // eslint-disable-next-line no-nested-ternary
              classes: this.coinMarket[item.coin].change > 0 ? 'rise-1-cl' : (this.coinMarket[item.coin].change < 0 ? 'fall-1-cl' : 'text-2-cl'),
            };
          } else {
            indItem = {
              ...item, price: -999999, change: -999999, ratio: 0,
            };
          }
          indItem.img = null;
          if (this.coinList && this.coinList[item.coin]) {
            indItem.img = this.coinList[item.coin].icon;
            indItem.longName = this.coinList[item.coin].longName;
            indItem.showName = this.coinList[item.coin].showName;
          }
          dataCoinList.push(indItem);
        });
      }
      let currentCoin = null;
      if (this.routeSymbol) {
        const arr = dataCoinList.filter((item) => item.showName === this.routeSymbol);
        if (arr && arr.length) {
          // eslint-disable-next-line prefer-destructuring
          currentCoin = arr[0];
        }
      } else {
        // eslint-disable-next-line prefer-destructuring
        currentCoin = dataCoinList[0];
      }
      this.symbolCurrent = currentCoin;
      this.dataCoinList = dataCoinList;
    },
    // 获取贩卖所币种信息
    getCoinCurrencies() {
      this.axios({
        url: 'jp/public/currencies',
        method: 'post',
        params: {},
      })
        .then((res) => {
          const arr = [];
          if (res.code === '0' && res.data) {
            // eslint-disable-next-line array-callback-return
            res.data.allCoinList.map((item) => {
              if (item.open) {
                arr.push({ ...item });
              }
            });
          } else {
            this.$bus.$emit('tip', { text: res.msg, type: 'error' });
          }
          this.coinInfoList = arr;
        });
    },
    // 币种的参考价格和涨跌幅
    getCoinMarketInfo() {
      this.axios({
        url: 'jp/public/market_info',
        method: 'post',
        params: {},
      })
        .then((res) => {
          if (res.code === '0' && res.data) {
            this.coinMarket = res.data;
          } else {
            this.coinMarket = {};
          }
        });
    },

    // 币种涨跌轮询
    getCoinMarketInfoSetInv() {
      clearInterval(this.coinMarketTime);
      this.getCoinMarketInfo();
      this.coinMarketTime = setInterval(() => {
        this.getCoinMarketInfo();
      }, 10000);
    },
    // K线 轮询
    getPollPublicKline() {
      clearInterval(this.pollKline);
      this.getPublicKline();
      this.pollKline = setInterval(() => {
        this.getPublicKline();
      }, 60000);
    },
    // 获取K线数据
    getPublicKline() {
      const params = {
        coin: this.symbolCurrent && this.symbolCurrent.coin ? this.symbolCurrent.coin : '',
        time: this.currentTabKline,
      };
      this.axios({
        url: 'jp/public/kline',
        method: 'post',
        params,
      })
        .then((res) => {
          if (res.code === '0' && res.data) {
            this.soureList = res.data;
            this.initEcharts(res.data);
          } else {
            this.initEcharts([]);
          }
        }).catch(() => {
          this.initEcharts([]);
        });
    },

    shrinkBlock() {
      this.marketShrink = !this.marketShrink;
    },
    serachShrinkBlock() {
      this.marketShrink = false;
    },

    // 处理图表数据
    initEcharts(list) {
      const dateList = [];
      const priceList = [];
      const currentTabs = this.tabsKline.filter((item) => item.value === this.currentTabKline)[0];
      // if (list && list.length) {
      list.forEach((item) => {
        let date = item[0] ? formatTimeFn(Number(item[0]), currentTabs.TimeTypeX) : '';
        date = date.indexOf('-') !== -1 ? date.replaceAll('-', '/') : date;
        // 日期
        dateList.push(date);
        priceList.push(item[1]);
      });
      if (priceList.length) {
        const copyPriceList = JSON.parse(JSON.stringify(priceList));
        const arr = copyPriceList.sort((a, b) => a - b);
        // eslint-disable-next-line prefer-destructuring
        this.priceMin = arr[0];
        this.priceMax = arr[arr.length - 1];
      }
      this.dateList = [...dateList];
      this.priceList = [...priceList];
      this.$refs.option1.setOption(this.option1);
      // }
    },
    handleResize() {
      if (this.$refs.option1) {
        this.$refs.option1.myChart.resize();
      }
    },

    // 切换 时间
    changeTabsKline(obj) {
      this.currentTabKline = obj.value;
      this.getPollPublicKline();
    },
    // order 选项
    hideMinAssets() {
      this.isHideMinAssets = !this.isHideMinAssets;
      this.tableLoading = true;
      this.pagination.page = 1;
      this.getOrderList();
    },
    // 获取 订单历史
    getOrderList() {
      this.axios({
        url: 'jp/order/history',
        method: 'post',
        params: {
          coin: this.isHideMinAssets ? this.symbolCurrent.coin : '',
          page: this.pagination.page,
          pageSize: this.pagination.pageSize,
          status: 0,
        },
      }).then((rs) => {
        this.tableLoading = false;
        const arr = [];
        if (rs.code === '0' && rs.data) {
          // eslint-disable-next-line array-callback-return
          rs.data.orderList.map((item, ind) => {
            arr.push({
              ...item,
              ind,
              sideobj: {
                classes: item.side === 'SELL' ? 'fall-1-cl' : 'rise-1-cl',
                text: item.side === 'SELL' ? 'Sell' : 'Buy',
              },
              dealPrice: item.money,
            });
          });
          this.pagination.count = rs.data.count;
        }
        this.tableList = arr;
      });
    },
    // 翻页事件
    pagechange(num) {
      this.pagination.page = num;
      this.tableLoading = true;
      this.getOrderList();
    },
    refreshFn() {
      this.pagination.page = 1;
      this.tableLoading = true;
      this.getOrderList();
    },
    // show order status
    // eslint-disable-next-line array-callback-return
    showStatus(val) {
      if (!val) return val;
      let obj = {};
      const arr = this.orderStatus.filter((item) => item.value.toString() === val.toString());
      if (arr && arr.length) {
        // eslint-disable-next-line prefer-destructuring
        obj = arr[0];
      }
      return obj;
    },
    // eslint-disable-next-line array-callback-return
    showCoin(val) {
      if (!val) return {};
      let obj = {};
      if (this.dataCoinList && this.dataCoinList.length && val) {
        const arr = this.dataCoinList.filter((item) => item.coin === val);
        if (arr && arr.length) {
          // eslint-disable-next-line prefer-destructuring
          obj = arr[0];
        }
      }
      return obj;
    },
    // 币种切换
    changeCurrent(data) {
      this.symbolCurrent = data;
    },
    addSign(val) {
      let str = val;
      if (val < 0) {
        str = `${val}`;
      }
      if (val > 0) {
        str = `+${val}`;
      }
      return str;
    },
    toLogin(type) {
      if (type === 'login') {
        this.$router.push('/login');
      } else {
        this.$router.push('/register');
      }
    },
    fixDVal(val, coin) {
      let str = val;
      if (this.dataCoinList && this.dataCoinList.length && val && coin) {
        const arr = this.dataCoinList.filter((item) => item.coin === coin);
        if (arr && arr.length) {
          str = fixD(val, arr[0].priceScale);
        }
      }
      return str;
    },
    // 显示
    showTip(val) {
      this.showRateTip = `saleIconPath-${val.ind}`;
    },
    hideTip() {
      this.showRateTip = null;
    },
  },
  destroyed() {
    clearInterval(this.pollKline);
    clearInterval(this.coinMarketTime);
  },
};
