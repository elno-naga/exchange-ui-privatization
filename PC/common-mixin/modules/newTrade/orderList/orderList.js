import {
  fixD,
  formatTime,
  getCoinShowName,
  myStorage,
  imgMap,
  colorMap,
  fixRate,
  nul,
  division,
  getIconPath,
} from '@/utils';

export default {
  name: 'orderList',
  data() {
    return {
      imgMap,
      colorMap,
      getIconPath,
      orderType: 1, // 订单类型 1: 当前委托 2:历史委托
      pagination: { // 翻页数据
        count: 0, // 总数量
        pageSize: 10, // 每页显示条数
        page: 1, // 当前页数
      },
      subTableDataId: null,
      subTableDataIds: null,
      // 当前货币对
      symbolCurrent: myStorage.get('sSymbolName'),
      // 撤销订单 防止重复点击
      cancelFla: true,
      getDataInter: null,
      getOrderInter: null,
      subTableData: [],
      subLoading: false,
      tableLoading: true,
      cancelOrderId: null,
      timer: 15000,
      currentTimer: 15000,
      cellHeight: 56,
      tabLineStyle: {},
      isShowGrid: false,
      tabIndex: 0,
      isHideMinAssets: true,
      isShowCurSymbol: true,
      startTime: '',
      endTime: '',
      isHover: false,
      dateSelectIndex: '',
      dateHoverIndex: '',
      paginationObj: {
        total: 0, // 数据总条数
        display: 10, // 每页显示条数
        currentPage: 1, // 当前页码
      },
      totalBalanceSymbol: '', // 总资产折合单位
      totalBalance: '',
      assetDataList: [],
      exchangeData: {},
      searchListResult: [],
      search: true,
      hoverType: null, // 划过的tab
      currentOrderNum: 0,
      revokeFlag: false,
      historyList: [],
      historyDataArr: [],
      gridType: 0, // 网格类型 0: 网格详情； 1: 正在执行(20)； 2: 已完成
      gridDoliog: false, // 网格弹窗
      gridItemId: null, // list单个的数据
      gridCancelDoliog: false,
      filterGridStatus: 1, // 策略状态 0:启动中  1:正在执行   2:停止中   3:已关闭
      historyStatus: null,
      leverFilterDataList: [],
      leverDataList: [],
      // 当前委托列表
      currentOrderList: [],
      isSymbolHover: false,
    };
  },
  props: {
    moduleType: {
      type: String,
      default: 'ex',
    },
    proTrade: {
      type: Boolean,
      default: false,
    },
  },
  watch: {
    isLogin(val) {
      if (val) {
        this.getData();
      }
    },
    orderData(val) {
      if (val) {
        if (val.count > 0) {
          this.timer = 2000;
        } else {
          this.timer = 15000;
        }
        // 轮训请求数据
        this.intervalGet();
        this.tableLoading = false;
        this.pagination.count = val.count;
        // if (this.orderType === 1) {
        //   this.currentOrderNum = val.count;
        // }
      }
    },
    currentOrderNum(val) {
      if (val > 0) {
        this.currentTimer = 2000;
      } else {
        this.currentTimer = 15000;
      }
      this.intervalCurrentOrder();
    },

    subData(val) {
      if (val) {
        this.subLoading = false;
        if (val.id === this.subTableDataId) {
          this.subTableData = this.setSubTableData(val.trade_list);
        }
      }
    },
    filterGridStatus(v) {
      if (!v) {
        clearInterval(this.getDataInter);
        this.getDataInter = null;
      } else {
        this.intervalGet();
      }
    },
    // tabIndex() {
    //   this.setTabLineStyle();
    // },
    C_firData: {
      immediate: true,
      handler(v) {
        this.paginationObj.total = v.length;
      },
    },
  },
  computed: {
    bodyHeight() {
      return this.proTrade ? '330' : '';
    },
    coinSymbols() {
      if (this.symbolCurrent) {
        return this.symbolCurrent.replace('/', ',');
      }
      return '';
    },
    // 全部币种列表
    coinList() {
      if (this.$store.state.baseData && this.$store.state.baseData.market) {
        return this.$store.state.baseData.market.coinList;
      }
      return null;
    },
    titleBlockClass() {
      if (this.$store.state.baseData.templateLayoutType === '2') {
        return 'fill-2-bg';
      }
      return 'fill-1-bg';
    },
    // 是否Login
    isLogin() {
      return this.$store.state.baseData.isLogin;
    },
    openOrderCollect() {
      if (this.$store.state.baseData.publicInfo) {
        return this.$store.state.baseData.publicInfo.open_order_collect;
      }
      return null;
    },
    subData() {
      return this.$store.state.tradeOrderList.subTableData;
    },
    // tab 项
    tabTypeItem() {
      let tabs = [
        {
          title: this.$t('trade.activeOrder'), // 当前委托
          value: 1,
        },
        {
          title: this.$t('trade.historyOrder'), // 历史委托
          value: 2,
        },
        {
          title: this.$t('trade5.orderList.tradeHistory'), // 历史成交
          value: 5,
        },
        {
          title: this.$t('trade5.orderList.funds'), // 资产管理
          value: 6,
        },
      ];
      if (this.isLogin) {
        tabs[0].title = `${this.$t('trade.activeOrder')}(${this.currentOrderNum})`;
      }
      if (this.isShowGrid) {
        this.isShowCurSymbol = true;
        tabs = [
          {
            title: this.$t('gridTrade.orderType1'), // 正在进行
            value: 3,
          },
          {
            title: this.$t('personal.state.closed'), // 已完成
            value: 4,
          },
        ];
      }
      return tabs;
    },
    // 表头
    columns() {
      if (this.orderType === 2) {
        return [
          {
            key: 'time',
            title: this.$t('trade.time'), // '时间',
            width: '150px',
          },
          {
            title: this.$t('trade.transaction'), // '交易对'
            key: 'symbolLink',
          },
          {
            title: this.$t('trade5.orderList.column1'), // '类型'
            key: 'type',
          },
          {
            title: this.$t('trade5.direction'), // '方向'
            key: 'side',
          },
          {
            title: this.$t('trade5.orderList.column4'), // '均价'
            key: 'avgPrice',
          },
          {
            title: this.$t('trade.price'), // 价格
            key: 'price',
          },
          {
            title: this.$t('trade5.orderList.column5'), // 成交数量
            key: 'dealVolume',
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
      }
      if (this.orderType === 3 || this.orderType === 4) {
        return [{
          title: this.$t('trade.time'), // '时间',
          width: '150px',
          key: 'time',
        },
        {
          title: this.$t('trade.transaction'), // '交易对'
          key: 'symbol',
        },
        {
          title: this.$t('gridTrade.clounms1'), // '总投入',
          key: 'totalQuoteAmount',
        },
        {
          title: this.$t('gridTrade.clounms2'), // 已产生利润
          key: 'totalProfit',
        },
        {
          title: this.$t('gridTrade.clounms3'), // 持仓盈亏
          key: 'positionProfit',
        },
        {
          title: this.$t('gridTrade.clounms4'), // '年化收益率'
          key: 'annualizedYield',
        },
        {
          title: this.$t('gridTrade.clounms5'), // '运行时长'
          key: 'runTime',
        },
        {
          title: this.$t('trade.opera'), // '操作'
          minWidth: '90px',
          key: 'operation',
          align: 'right',
        },
        ];
      }
      if (this.orderType === 6) {
        if (this.moduleType === 'lever') {
          return [
            {
              title: this.$t('assets.exchangeAccount.coin'),
              key: 'lever_coin',
            },
            {
              title: this.$t('assets.exchangeAccount.lumpSum'),
              key: 'lever_lumpSum',
            },
            {
              title: this.$t('trade5.orderList.column7'),
              key: 'lever_baseNormalBalance',
            },
            {
              title: this.$t('trade5.orderList.column8'),
              key: 'lever_baseLockBalance',
            },
            {
              title: this.$t('trade5.orderList.column9'),
              key: 'lever_quoteBorrowBalance',
            },
            {
              title: this.$t('trade5.orderList.column10'),
              key: 'lever_baseNetBalance',
            },
          ];
        }
        return [
          // 币种
          {
            title: this.$t('assets.exchangeAccount.coin'),
            key: 'symbol',
          },
          // 总额
          {
            title: this.$t('assets.exchangeAccount.lumpSum'),
            key: 'lumpSum',
          },
          // 可用
          {
            title: this.$t('trade5.orderList.column7'),
            key: 'baseNormalBalance',
          },
          // 冻结
          {
            title: this.$t('trade5.orderList.column8'),
            key: 'baseLockBalance',
          },
          {
            title: `${this.$t('assets.exchangeAccount.AssetFolding')}(${this.showTotalBalanceSymbol
            })`,
            key: 'assetFolding',
          },
        ];
      }
      if (this.orderType === 5) {
        return [
          {
            title: this.$t('trade.time'), // '时间',
            width: '150px',
            key: 'time',
          },
          {
            title: this.$t('trade.transaction'), // '交易对'
            key: 'symbolLink',
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
            title: this.$t('trade.serviceCharge'), // 手续费
            key: 'fee',
          },
          {
            title: this.$t('trade.turnover'), // 成交额
            key: 'dealPrice',
          },
        ];
      }
      return [
        {
          title: this.$t('trade.time'), // '时间',
          width: '150px',
          key: 'time',
        },
        {
          title: this.$t('trade.transaction'), // '交易对',
          key: 'symbolLink',
        },
        {
          title: this.$t('trade5.orderList.column1'), // '类型'
          key: 'type',
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
          title: this.$t('trade5.orderList.column2'), // 完成度
          key: 'degree',
        },
        {
          title: this.$t('trade5.orderList.column3'), // 金额
          key: 'amount',
        },
        {
          title: this.$t('trade5.orderList.column6'), // '操作'
          width: '80px',
          key: 'operation',
          classes: 'opera main-1-cl',
        },
      ];
    },
    subColumns() {
      return [
        this.$t('trade.time'),
        this.$t('trade.price'),
        this.$t('trade.number'),
        this.$t('trade.turnover'),
        this.$t('trade.serviceCharge'),
      ];
    },
    // 全部币对列表
    symbolAll() {
      return this.$store.state.baseData.symbolAll;
    },
    // 当前币对精度计算的值
    fixValue() {
      if (this.symbolAll && this.symbolCurrent) {
        const symbol = this.symbolAll[this.symbolCurrent];
        if (symbol) {
          return {
            priceFix: symbol.price,
            volumeFix: symbol.volume,
          };
        }
      }
      return {
        priceFix: 2,
        volumeFix: 8,
      };
    },
    orderData() {
      if (this.$store.state.tradeOrderList) {
        return this.$store.state.tradeOrderList.nowOrderData;
      }
      return null;
    },
    dataList() {
      if (this.orderType === 6) {
        if (this.moduleType === 'lever') {
          return this.leverFilterDataList;
        }
        return this.C_data;
      }
      if (this.orderType === 5) {
        return this.historyList;
      }
      if (this.orderType === 1) {
        return this.formData(this.currentOrderList, this.cancelOrderId);
      }
      if (this.orderData && this.orderData.orderType === this.orderType) {
        if (this.orderType === 3 || this.orderType === 4) {
          return this.formGridData(this.orderData.strategyVoList);
        }
        return this.formHistoryData(this.orderData.orderList);
      }
      return [];
    },
    //  是否开启了 网格
    gridTradeFlag() {
      const { publicInfo } = this.$store.state.baseData;
      let str = 1;
      if (publicInfo && publicInfo.switch && publicInfo.switch.grid_trade_switch) {
        str = Number(publicInfo.switch.grid_trade_switch);
      }
      return str;
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
    startTimeNum() {
      return (new Date(this.startTime.replace(/-/g, '/')).getTime() / 1000).toString();
    },
    endTimeNum() {
      return (new Date(this.endTime.replace(/-/g, '/')).getTime() / 1000).toString();
    },
    dateList() {
      return [
        {
          value: '1d',
          label: this.$t('trade5.orderList.oneDay'),
        },
        {
          value: '1w',
          label: this.$t('trade5.orderList.oneWeek'),
        },
        {
          value: '1m',
          label: this.$t('trade5.orderList.oneMonth'),
        },
        {
          value: '3m',
          label: this.$t('trade5.orderList.threeMonths'),
        },
      ];
    },
    market() {
      return this.$store.state.baseData.market;
    },
    C_firData() {
      const datas = this.search ? this.searchListResult : this.assetDataList;
      return datas;
    },
    C_data() {
      let arr = [];
      const num = this.paginationObj.currentPage * this.paginationObj.display;
      const datas = JSON.parse(JSON.stringify(this.C_firData));
      arr = datas.slice((this.paginationObj.currentPage - 1) * this.paginationObj.display, num);
      return arr;
    },
    showTotalBalanceSymbol() {
      let str = this.totalBalanceSymbol;
      if (
        this.market
        && this.market.coinList
        && this.market.coinList[this.totalBalanceSymbol]
      ) {
        str = getCoinShowName(this.totalBalanceSymbol, this.market.coinList);
      }
      return str;
    },
    statusOptions() {
      return [
        {
          value: this.$t('trade5.orderList.All'),
          code: '',
        },
        {
          value: this.$t('trade5.orderList.Filled'),
          code: 2,
        },
        {
          value: this.$t('trade5.orderList.Canceled'),
          code: 4,
        },
      ];
    },
  },
  beforeDestroy() {
    clearInterval(this.getOrderInter);
  },
  methods: {
    init() {
      this.$nextTick(() => {
        // setTimeout(() => {
        //   this.setTabLineStyle();
        // }, 1000);
      });
      // 获取 当前选中的货币对
      this.symbolCurrent = myStorage.get('sSymbolName');
      if (this.moduleType === 'lever') {
        this.symbolCurrent = myStorage.get('leverSymbolName');
      }
      if (this.isLogin) {
        this.getData();
        // 轮训请求数据
        this.intervalGet();
        // 轮训当前委托
        this.intervalCurrentOrder();
      }
      this.$bus.$on('SYMBOL_CURRENT', (val) => {
        this.symbolCurrent = val;
        if (this.isLogin) {
          this.pagination.page = 1;
          this.subTableDataId = null;
          this.tableLoading = true;
          this.getData();
        }
      });
      // 监听下单成功
      this.$bus.$on('ORDER_CREATE', () => {
        this.pagination.page = 1;
        // this.switchType(this.orderType, this.tabIndex);
        this.switchType(this.orderType);
        this.getData();
        this.getCurrentOrderData(); // 获取当前委托数量
      });
      // 切换到网格交易
      this.$bus.$on('tradePageChange', (val) => {
        // this.tabIndex = 0;
        if (val === '3') {
          this.isShowGrid = true;
          this.switchType(3, 0);
        } else {
          this.isShowGrid = false;
          this.switchType(1, 0);
        }
      });
    },
    // 获取当前委托数量
    getCurrentOrderData() {
      let url = this.$store.state.url.ordercenter.currentNew; // 币币当前委托当前币对
      if (this.isShowCurSymbol) { // 当前币对
        if (this.moduleType === 'lever') {
          url = this.$store.state.url.lever.new; // 杠杆当前委托当前币对
        }
      } else { // 全部
        url = 'order/list/new/all'; // 币币当前
        if (this.moduleType === 'lever') {
          url = 'lever/order/list/new/all'; // 杠杆当前
        }
      }
      let symbol = '';
      if (this.symbolCurrent) {
        const symbolArr = this.symbolCurrent.split('/');
        symbol = symbolArr[0].toLowerCase() + symbolArr[1].toLowerCase();
      }
      this.axios({
        url,
        method: 'post',
        params: {
          page: this.pagination.page,
          pageSize: this.pagination.pageSize,
          symbol: this.isShowCurSymbol ? symbol : '',
        },
      }).then((res) => {
        if (res.code.toString() === '0') {
          this.currentOrderList = res.data.orderList;
          this.currentOrderNum = res.data.count ? res.data.count : 0;
          if (this.orderType === 1) {
            this.pagination.count = this.currentOrderNum;
          }
          if (!res.data.orderList || !res.data.orderList.length) {
            this.tableLoading = false;
          }
        } else {
          this.tableLoading = false;
          this.$bus.$emit('tip', {
            text: res.msg,
            type: 'error',
          });
        }
      });
    },

    // 查看全部订单
    goOrderPage() {
      // this.$router.push({path: '/order/exchangeOrder', query: {nowType: this.orderType}});
      if (this.moduleType === 'lever') {
        window.location.href = `/order/leverageOrder?nowType=${this.orderType}`;
      } else {
        window.location.href = `/order/exchangeOrder?nowType=${this.orderType}`;
      }
    },
    getTradeTypeText(type) {
      let typeText = '';
      switch (type) {
        case 1:
          typeText = this.$t('trade.limitPriceTrade');
          break;
        case 2:
          typeText = this.$t('trade.marketPriceTrade');
          break;
        case 3:
          typeText = this.$t('trade.unlockTrade');
          break;
        case 4:
          typeText = this.$t('gridTrade.title');
          break;
        default:
          break;
      }
      return typeText;
    },
    getFix(market, coin) {
      // 例如 btc/usdt
      let marketFix = 0; // 市场精度 usdt
      let coinFix = 0; // 交易币种精度 btc
      const symbol = `${coin}/${market}`;
      if (this.symbolAll[symbol]) {
        const {
          price,
          volume,
        } = this.symbolAll[symbol];
        marketFix = price;
        coinFix = volume;
      }
      return {
        marketFix,
        coinFix,
      };
    },
    // 完成度
    makeRate(dealVolume, volume) {
      if (dealVolume && volume) {
        // 已完成数量 / 委托数量
        const value = nul(division(dealVolume, volume), 100);
        if (value > 100) {
          return fixD(100, 2);
        }
        return fixD(value, 2);
      }
      return 0.0;
    },
    // 格式化数据
    formData(data, cancelOrderId) {
      const dataArray = data || [];
      const newData = [];
      if (dataArray.length) {
        const {
          coinList,
        } = this.market || {};
        dataArray.forEach((item) => {
          if (cancelOrderId !== item.id) {
            let showClose = true;
            if (item.type === 2
              || (item.isCloseCancelOrder && item.isCloseCancelOrder.toString() === '1')) {
              showClose = false;
            }
            const quoteCoin = item.quoteCoin || item.countCoin;
            const {
              marketFix,
              coinFix,
            } = this.getFix(quoteCoin, item.baseCoin);
            let complete = item.deal_volume / item.volume; // 完成度
            if (complete) {
              complete = complete > 1 ? 100 : complete;
            } else {
              complete = 0;
            }
            const tableData = {
              data: item,
              id: item.id,
              time: formatTime(item.time_long),
              symbolLink: {
                text: `${getCoinShowName(item.baseCoin, coinList)}/${getCoinShowName(quoteCoin, coinList)}`,
                type: 'html',
                eventType: 'symbolClick',
              },
              type: this.getTradeTypeText(item.type),
              side: {
                text: item.side_text,
                classes: item.side === 'BUY' ? 'rise-1-cl' : 'fall-1-cl',
              },
              price: item.type.toString() === '1'
                ? `${fixD(item.price, marketFix)} ${getCoinShowName(quoteCoin, coinList)}` // 价格
                : this.$t('order.exchangeOrder.marketPrice'),
              volume: `${fixD(item.volume, coinFix)} ${getCoinShowName(item.baseCoin, coinList)}`,
              // `${complete.toFixed(2)}%`,
              degree: `${this.makeRate(item.deal_volume, item.volume)}%`, // 完成度
              amount: `${fixD(item.total_price, marketFix)} ${getCoinShowName(quoteCoin, coinList)}`,
              operation: [
                {
                  type: 'button',
                  text: this.$t('trade.cancelOrder'), // 撤单
                  eventType: 'cancel',
                  classes: !showClose ? 'marketPriceOrder' : '',
                },
              ],
            };
            newData.push(tableData);
          }
        });
        this.tableLoading = false;
        return newData;
      }
      return [];
    },
    // 历史委托数据格式化
    formHistoryData(data) {
      const dataArray = data || [];
      const newData = [];
      const idArr = [];
      if (dataArray.length) {
        const { coinList } = this.market;
        dataArray.forEach((item) => {
          const quoteCoin = item.quoteCoin || item.countCoin;
          const { marketFix, coinFix } = this.getFix(quoteCoin, item.baseCoin);
          idArr.push(item.id);
          const tableData = {
            data: item,
            id: item.id,
            time: formatTime(item.time_long),
            symbolLink: {
              text: `${getCoinShowName(item.baseCoin, coinList)}/${getCoinShowName(quoteCoin, coinList)}`,
              type: 'html',
              eventType: 'symbolClick',
            },
            type: this.getTradeTypeText(item.type),
            side: {
              text: item.side_text,
              classes: item.side === 'BUY' ? 'rise-1-cl' : 'fall-1-cl',
            },
            avgPrice: `${fixD(item.avg_price, marketFix)} ${getCoinShowName(quoteCoin, coinList)}`,
            price: item.type.toString() === '1'
              ? `${fixD(item.price, marketFix)} ${getCoinShowName(quoteCoin, coinList)}` // 价格
              : this.$t('order.exchangeOrder.marketPrice'),
            dealVolume: `${fixD(item.deal_volume, coinFix)} ${getCoinShowName(item.baseCoin, coinList)}`,
            volume: `${fixD(item.volume, coinFix)} ${getCoinShowName(item.baseCoin, coinList)}`,
            dealPrice: `${fixD(item.deal_money, 8)} ${getCoinShowName(quoteCoin, coinList)}`, // marketFix
            status: item.status_text,
          };
          newData.push(tableData);
        });
        // this.tableLoading = false;
        return newData;
      }
      // this.tableLoading = false;
      return newData;
    },
    // 切换币对
    changeSymbol(item) {
      const quoteCoin = item.quoteCoin || item.countCoin;
      const symbol = `${item.baseCoin}/${quoteCoin}`;
      this.$bus.$emit('order_switchSymbol', symbol);
    },
    // sub table Data 格式化
    setSubTableData(data) {
      const arr = [];
      if (data.length) {
        data.forEach((item) => {
          const {
            ctime,
            price,
            volume,
            fee,
            feeCoin,
          } = item;
          const dealPrice = item.deal_price;
          arr.push({
            ctime,
            price: fixD(price, this.fixValue.priceFix),
            volume: fixD(volume, this.fixValue.volumeFix),
            dealPrice: fixD(dealPrice, this.fixValue.priceFix),
            fee: `${fee} ${getCoinShowName(feeCoin, this.coinList)}`,

          });
        });
        return arr;
      }
      return [];
    },
    // 历史成交记录
    getDealHistory() {
      let symbol = '';
      let url = 'trade/new';
      if (this.moduleType === 'lever') {
        url = 'lever/trade/new';
      }
      if (this.symbolCurrent) {
        const symbolArr = this.symbolCurrent.split('/');
        symbol = symbolArr[0].toLowerCase() + symbolArr[1].toLowerCase();
      }
      this.axios({
        url,
        method: 'post',
        params: {
          page: this.pagination.page,
          pageSize: this.pagination.pageSize,
          symbol: this.isShowCurSymbol ? symbol : '',
        },
      }).then((res) => {
        if (res.code.toString() === '0') {
          this.pagination.count = res.data.count;
          const list = res.data.orderList.map((item, index) => {
            const { marketFix, coinFix } = this.getFix(item.quoteCoin, item.baseCoin);
            const symbolShow = `${getCoinShowName(item.baseCoin, this.coinList)}/${getCoinShowName(item.quoteCoin, this.coinList)}`;
            const compensateAmountfree = item.compensateAmount ? `${fixD(item.compensateAmount, 8)} ${getCoinShowName(item.compensateCoin, this.coinList)}` : null;
            const free = item.trendSide === 'BUY'
              ? `${fixD(item.buyFee, 8)} ${getCoinShowName(item.buyFeeCoin, this.coinList)}` // coinFix
              : `${fixD(item.sellFee, 8)} ${getCoinShowName(item.sellFeeCoin, this.coinList)}`; // marketFix
            return {
              // 时间
              id: index,
              data: item,
              time: formatTime(item.ctime),
              // 交易对
              symbolLink: {
                text: symbolShow,
                type: 'html',
                eventType: 'symbolClick',
              },
              // 方向
              side: {
                text: item.trendSide === 'BUY' ? this.$t('trade.buy') : this.$t('trade.sell'),
                classes: item.trendSide === 'BUY' ? 'rise-1-cl' : 'fall-1-cl',
              },
              // 价格
              price: `${fixD(item.price, marketFix)} ${getCoinShowName(item.quoteCoin, this.coinList)}`,
              // 数量
              volume: `${fixD(item.volume, coinFix)} ${getCoinShowName(item.baseCoin, this.coinList)}`,
              // 手续费
              fee: item.compensateAmount ? compensateAmountfree : free,
              // 成交额
              dealPrice: `${fixD(item.price * item.volume, 8)} ${getCoinShowName(item.quoteCoin, this.coinList)}`, // marketFix
            };
          });
          this.historyList = list;
          this.historyDataArr = res.data;
          this.tableLoading = false;
        } else {
          this.tableLoading = false;
          this.$bus.$emit('tip', {
            text: res.msg,
            type: 'error',
          });
        }
      });
    },
    // 切换订单类型
    switchType(obj) {
      const index = typeof obj === 'object' ? obj.value : obj;
      this.orderType = index;
      // this.tabIndex = tabIndex;
      if (this.isLogin) {
        this.tableLoading = true;
        this.subTableDataId = null;
        this.pagination.page = 1;
        this.subTableData = [];
        if (index === 3) {
          this.filterGridStatus = 1;
        }
        if (index === 4) {
          this.filterGridStatus = 0;
        }
        if (index === 5) {
          this.getDealHistory();
          return;
        }
        if (index === 6) {
          this.paginationObj.currentPage = 1;
          this.getAssets();
          return;
        }
        if (index === 2) {
          this.historyStatus = {
            value: this.$t('trade.status'),
            code: null,
          };
        }
        this.getData();
      }
    },
    // setTabLineStyle() {
    //   const $tabList = document.querySelectorAll('.newTrade-order .tab-item');
    //   const { offsetLeft, offsetWidth } = $tabList[this.tabIndex];
    //   if (!offsetWidth) return;
    //   this.tabLineStyle = {
    //     left: `${offsetLeft + (offsetWidth - 40) / 2}px`,
    //   };
    // },
    // 查看详情
    getSubTableData(data) {
      if (data.open) {
        this.subTableData = [];
        this.subLoading = true;
        this.subTableDataId = data.id;
        const symbolArr = this.symbolCurrent.split('/');
        const symbol = symbolArr[0].toLowerCase() + symbolArr[1].toLowerCase();
        let url = this.$store.state.url.ordercenter.orderDetail;
        if (this.moduleType === 'lever') {
          url = this.$store.state.url.lever.list_by_order;
        }
        const params = {
          url,
          params: {
            symbol,
            order_id: data.id,
            pageSize: this.pagination.pageSize,
          },
        };
        this.$store.dispatch('getSubTableData', params);
      }
    },
    // 撤单
    cancelOrderEvent(line) {
      if (this.cancelFla) {
        this.cancelFla = false;
        const symbol = `${line.baseCoin}${line.countCoin || line.quoteCoin}`;
        const data = {
          orderId: line.id,
          symbol: symbol.toLocaleLowerCase(),
        };
        let url = this.$store.state.url.ordercenter.cancelorder;
        if (this.moduleType === 'lever') {
          url = this.$store.state.url.lever.cancel;
        }
        this.axios({
          url,
          method: 'post',
          params: data,
        }).then((rep) => {
          if (rep.code === '0') {
            this.getCurrentOrderData();
            this.getData();
            this.cancelOrderId = line.id;
            if (this.moduleType === 'lever') {
              this.$bus.$emit('lever_getAssets', '');
            } else {
              // 重新请求资产
              setTimeout(() => {
                this.$store.dispatch('assetsExchangeData', {
                  auto: false,
                  coinSymbols: this.coinSymbols,
                });
              }, 1000);
            }
            // 撤单成功 提示
            this.$bus.$emit('tip', { text: this.$t('trade.cancelled'), type: 'success' });
            this.cancelFla = true;
          } else {
            this.$bus.$emit('tip', { text: rep.msg, type: 'error' });
            this.cancelFla = true;
          }
        });
      }
    },
    // 请求订单数据
    getData(auto) {
      if (this.isLogin) {
        let url = this.$store.state.url.ordercenter.currentNew; // 币币当前委托当前币对
        if (this.isShowCurSymbol) { // 当前币对
          if (this.moduleType === 'lever') {
            url = this.$store.state.url.lever.new; // 杠杆当前委托当前币对
          }
        } else { // 全部
          url = 'order/list/new/all'; // 币币当前
          if (this.moduleType === 'lever') {
            url = 'lever/order/list/new/all'; // 杠杆当前
          }
        }
        if (this.orderType === 2) {
          url = 'order/entrust_history/new'; // 历史委托
          if (this.moduleType === 'lever') {
            url = 'lever/order/history/new';
          }
        }
        if (this.orderType === 3 || this.orderType === 4) { // 如果是网格直接请求网格接口
          url = 'quant/getStrategyList';
        }
        let symbol = '';
        if (this.symbolCurrent) {
          const symbolArr = this.symbolCurrent.split('/');
          symbol = symbolArr[0].toLowerCase() + symbolArr[1].toLowerCase();
        }
        const data = {
          url,
          orderType: this.orderType,
          params: {
            symbol: this.isShowCurSymbol ? symbol : null,
            pageSize: this.pagination.pageSize,
            page: this.pagination.page,
          },
        };
        if (this.orderType === 2) {
          data.params.status = this.historyStatus.code;
        }
        if (this.orderType === 3 || this.orderType === 4) {
          data.hostType = 'quant';
          data.params.symbol = this.symbolCurrent;
          data.params.status = this.filterGridStatus;
        }
        if (auto) {
          data.auto = true;
        }
        if (this.orderType === 1) {
          this.getCurrentOrderData();
        }
        this.$store.dispatch('getOrderListData', data);
      }
    },
    // 翻页事件
    pagechange(num) {
      this.pagination.page = num;
      this.subTableData = null;
      this.subTableDataId = null;
      if (this.orderType === 5) {
        this.getDealHistory();
      } else if (this.orderType === 6) {
        this.getAssets();
      } else {
        this.getData();
      }
    },
    revokeAll() {
      if (this.dataList.length > 0) {
        this.revokeFlag = true;
      }
    },
    cancelRevoke() {
      this.revokeFlag = false;
    },
    confirmRevoke() {
      let symbol = '';
      if (this.isShowCurSymbol) {
        const symbolArr = this.symbolCurrent.split('/');
        symbol = symbolArr[0].toLowerCase() + symbolArr[1].toLowerCase();
      }
      let url = 'order/cancel/all';
      if (this.moduleType === 'lever') {
        url = 'lever/order/cancel/all';
      }
      this.axios({
        url,
        params: {
          symbol,
        },
      }).then((res) => {
        this.revokeFlag = false;
        if (res.code === '0') {
          this.getData();
          // 重新请求资产
          if (this.moduleType === 'lever') {
            this.$bus.$emit('lever_getAssets', '');
          } else {
            setTimeout(() => {
              this.$store.dispatch('assetsExchangeData', {
                auto: false,
                coinSymbols: this.coinSymbols,
              });
            }, 1000);
          }
          // 撤单成功 提示
          this.$bus.$emit('tip', { text: this.$t('trade.cancelled'), type: 'success' });
        } else {
          this.$bus.$emit('tip', { text: res.msg, type: 'error' });
          this.cancelFla = true;
        }
      });
    },
    toLogin(type) {
      if (type === 'login') {
        this.$router.push('/login');
      } else {
        this.$router.push('/register');
      }
    },
    hideMinAssets() {
      this.isHideMinAssets = !this.isHideMinAssets;
      this.findChanges();
    },
    showCurSymbol() {
      this.isShowCurSymbol = !this.isShowCurSymbol;
      // this.switchType(this.orderType, this.tabIndex);
      this.switchType(this.orderType);
    },
    setStartTime(time) {
      this.startTime = time;
    },
    setEndTime(time) {
      this.endTime = time;
    },
    getNowTime(time = '') {
      const date = new Date(time);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();

      return `${year}-${month}-${day}`;
    },
    selectDate(item, index) {
      this.dateSelectIndex = index;
      const now = new Date();
      this.endTime = this.getNowTime(now);
      const year = now.getFullYear();
      const month = now.getMonth();
      const day = now.getDate();
      switch (item.value) {
        case '1d':
          this.startTime = this.getNowTime(new Date(year, month, day - 1));
          break;
        case '1w':
          this.startTime = this.getNowTime(new Date(year, month, day - 7));
          break;
        case '1m':
          this.startTime = this.getNowTime(new Date(year, month - 1, day));
          break;
        case '3m':
          this.startTime = this.getNowTime(new Date(year, month - 3, day));
          break;
        default:
          break;
      }
    },
    // 查询历史成交
    searchData() {
      this.getDealHistory();
    },
    getAssets() {
      let url = 'finance/v5/account_balance';
      if (this.moduleType === 'lever') {
        url = 'lever/finance/balance';
      }
      this.axios({
        url,
        params: {
          coinSymbols: '',
        },
      }).then((data) => {
        if (data.code.toString() === '0') {
          this.exchangeData = data.data;
          if (this.moduleType === 'lever') {
            this.setLeverData();
          } else {
            this.setData();
          }
        }
      });
    },
    setLeverData() {
      const {
        totalBalance,
        totalBalanceSymbol,
        leverMap,
      } = this.exchangeData;
      this.tabelLoading = false;
      const {
        coinList,
        market,
        rate,
      } = this.market;
      this.totalBalance = fixD(totalBalance, 8); // 折合资产
      this.totalBalanceSymbol = totalBalanceSymbol; // 折合币种
      const list = [];
      Object.keys(leverMap).forEach((v) => {
        const item = leverMap[v];
        const obj = market[item.quoteCoin][item.name];
        let showSymbol = item.name;
        if (obj) {
          showSymbol = obj.showName || obj.name;
        }
        // getCoinShowName
        const showBaseCoin = getCoinShowName(item.baseCoin, coinList);
        const showQuoteFix = getCoinShowName(item.quoteCoin, coinList);
        const baseNetBalance = item.baseTotalBalance - item.baseBorrowBalance;
        const quoteNetBalance = item.quoteTotalBalance - item.quoteBorrowBalance;
        const baseNetFix = fixRate(baseNetBalance, rate, item.baseCoin);
        const quoteNetFix = fixRate(quoteNetBalance, rate, item.quoteCoin);
        list.push({
          id: JSON.stringify(item),
          lever_coin: {
            text: showSymbol.split('/')[0],
            subContent: showSymbol.split('/')[1],
          },
          // 总资产
          lever_lumpSum: {
            text: `${fixD(item.baseTotalBalance, 8)} ${showBaseCoin}`,
            subContent: `${fixD(item.quoteTotalBalance, 8)} ${showQuoteFix}`,
          },
          // 可用
          lever_baseNormalBalance: {
            text: `${fixD(item.baseNormalBalance, 8)} ${showBaseCoin}`,
            subContent: `${fixD(item.quoteNormalBalance, 8)} ${showQuoteFix}`,
          },
          // 冻结
          lever_baseLockBalance: {
            text: `${fixD(item.baseLockBalance, 8)} ${showBaseCoin}`,
            subContent: `${fixD(item.quoteLockBalance, 8)} ${showQuoteFix}`,
          },
          // 已借
          lever_quoteBorrowBalance: {
            text: `${fixD(item.baseBorrowBalance, 8)} ${showBaseCoin}`,
            subContent: `${fixD(item.quoteBorrowBalance, 8)} ${showQuoteFix}`,
          },
          lever_baseNetBalance: {
            text: baseNetFix,
            subContent: quoteNetFix,
          },
        });
      });
      this.leverDataList = [...list];
      this.findChanges();
    },
    setData() {
      const {
        totalBalance,
        totalBalanceSymbol,
        allCoinMap,
      } = this.exchangeData;
      const { coinList } = this.market;
      const fix = (coinList[totalBalanceSymbol]
        && coinList[totalBalanceSymbol].showPrecision)
        || 8;
      this.totalBalance = fixD(totalBalance, fix); // 折合资产
      this.totalBalanceSymbol = totalBalanceSymbol; // 折合币种
      this.setDataList(allCoinMap, totalBalance);
    },
    setDataList(data) {
      const list = [];
      Object.keys(data).forEach((item) => {
        if (data[item].isFiat) {
          return;
        }
        // 该币种精度
        const { coinList, market } = this.market;
        const fix = this.proTrade ? 8 : (coinList[item] && coinList[item].showPrecision) || 0;
        // 资产折合精度
        const totle = this.totalBalanceSymbol;
        const btcFix = (coinList[totle] && coinList[totle].showPrecision) || 0;
        // 逻辑 1 如果 优先找出交易币种为当前货币的
        //     2 如果 1条件未筛选出，则去看当前货币是否为计价货币 把以该货币为计价货币的币对都加进去
        let selectOption = [];
        const by = [];
        Object.keys(market).forEach((v) => {
          Object.keys(market[v]).forEach((cv) => {
            const showSymbol = market[v][cv].showName || market[v][cv].name;
            if (cv.split('/')[0] === item) {
              selectOption.push({
                value: showSymbol,
                code: market[v][cv].name,
              });
            }
            if (v === item) {
              by.push({ value: showSymbol, code: market[v][cv].name });
            }
          });
        });
        if (selectOption.length === 0) {
          selectOption = by;
        }

        const coinName = getCoinShowName(item, coinList);
        let showUnlockSell = false;
        if (
          coinList[item]
          && coinList[item].isOvercharge
          && coinList[item].isOvercharge.toString() === '1'
        ) {
          showUnlockSell = true;
        }
        const btcValuation = fixD(data[item].allBtcValuatin, btcFix);
        list.push({
          // id: data[item].sort,
          id: item,
          btcValuation,
          classes: btcValuation >= 0.0001 ? '' : 'smail-account',
          symbol: coinName,
          lumpSum: fixD(data[item].total_balance, fix),
          baseNormalBalance: showUnlockSell
            ? {
              text: fixD(data[item].normal_balance, fix),
              subText: `${fixD(data[item].overcharge_balance || 0, fix)} (${this.$t('assets.exchangeAccount.limit')})`,
              classes: 'showUnlockSell',
            } : {
              text: fixD(data[item].normal_balance, fix),
            },

          baseLockBalance: fixD(data[item].lock_balance, fix),
          assetFolding: fixD(data[item].allBtcValuatin, btcFix),
        });
      });
      this.assetDataList = list.sort((a, b) => a.id - b.id);
      this.tableLoading = false;
      this.findChanges();
    },
    assetsPagechange(v) {
      this.paginationObj.currentPage = v;
    },
    findChanges() {
      if (this.isHideMinAssets) {
        if (this.moduleType === 'lever') {
          this.leverFilterDataList = this.leverDataList.filter((item) => {
            const { subContent, text } = item.lever_lumpSum;
            return parseFloat(text) || parseFloat(subContent.text);
          });
          this.tableLoading = false;
        } else {
          const result = this.assetDataList.filter((item) => {
            const isSamll = !this.isHideMinAssets || (this.isHideMinAssets && item.classes !== 'smail-account');
            const isSearch = isSamll;
            return isSearch;
          });
          this.searchListResult = result;
          this.search = true;
          this.paginationObj.currentPage = 1;
        }
      } else {
        if (this.moduleType === 'lever') {
          this.leverFilterDataList = [...this.leverDataList];
        }
        this.search = false;
        this.tableLoading = false;
      }
    },
    gridClose() {
      this.gridDoliog = false;
    },
    // 轮训请求数据
    intervalGet() {
      if (this.filterGridStatus && this.orderType === 3) {
        clearInterval(this.getDataInter);
        this.getDataInter = setInterval(() => {
          this.getData(true);
        }, this.timer);
      } else {
        clearInterval(this.getDataInter);
        this.getDataInter = null;
      }
    },
    intervalCurrentOrder() {
      clearInterval(this.getOrderInter);
      this.getOrderInter = setInterval(() => {
        if (this.isLogin) {
          this.getCurrentOrderData();
        } else {
          clearInterval(this.getOrderInter);
        }
      }, this.currentTimer);
    },
    // 网格交易数据格式化
    formGridData(data) {
      const dataArray = data || [];
      const newData = [];
      if (dataArray.length) {
        dataArray.forEach((item) => {
          let tableData = null;
          const symbolArr = item.symbol.split('/');
          const { marketFix, coinFix } = this.getFix(symbolArr[1], symbolArr[0]);
          // 网格状态 0:启动中 1:正在执行 2:停止中 3:已关闭
          if (this.filterGridStatus.toString() === '0') {
            tableData = {
              data: item,
              id: item.id,
              // 时间
              time: formatTime(item.ctime),
              // 交易对
              symbol: `${getCoinShowName(symbolArr[0], this.coinList)}/${getCoinShowName(symbolArr[1], this.coinList)}`,
              // 总投入
              totalQuoteAmount: `${fixD(item.configParamMap.totalQuoteAmount, marketFix)}
                    ${getCoinShowName(symbolArr[1], this.coinList)} + ${fixD(item.configParamMap.totalBaseAmount, coinFix)}
                    ${getCoinShowName(symbolArr[0], this.coinList)}`,
              // 已产生利润
              totalProfit: `${fixD(item.totalProfit, 6)}
                    ${getCoinShowName(symbolArr[1], this.coinList)}(${fixD(item.totalProfitRate, 2)}%)`,
              // 持仓盈亏
              positionProfit: `${fixD(item.positionProfit, 6)}
                    ${getCoinShowName(symbolArr[1], this.coinList)}`,
              // 年华收益率
              annualizedYield: `${fixD(item.annualizedYield, 2)}%`,
              // 运行时长
              runTime: this.setTime(item.startTime, item.endTime),
              operation: [
                {
                  type: 'link',
                  text: this.$t('trade.view'), // 详情
                  eventType: 'gridDetail',
                },
              ],
            };
          } else if (this.filterGridStatus.toString() === '1') {
            tableData = {
              data: item,
              id: item.id,
              time: formatTime(item.ctime),
              symbol: `${getCoinShowName(symbolArr[0], this.coinList)}/${getCoinShowName(symbolArr[1], this.coinList)}`,
              // 总投入
              totalQuoteAmount: `${fixD(item.configParamMap.totalQuoteAmount, marketFix)}
                    ${getCoinShowName(symbolArr[1], this.coinList)} + ${fixD(item.configParamMap.totalBaseAmount, coinFix)}
                    ${getCoinShowName(symbolArr[0], this.coinList)}`,
              // 已产生利润
              totalProfit: `${fixD(item.totalProfit, 6)}
                    ${getCoinShowName(symbolArr[1], this.coinList)}(${fixD(item.totalProfitRate, 2)}%)`,
              // 持仓盈亏
              positionProfit: `${fixD(item.positionProfit, 6)}
                    ${getCoinShowName(symbolArr[1], this.coinList)}`,
              // 年华收益率
              annualizedYield: `${fixD(item.annualizedYield, 2)}%`,
              // 运行时长
              runTime: this.setTime(item.startTime),
              operation: [{
                type: 'link',
                text: this.$t('trade.view'), // 详情
                eventType: 'gridDetail',
              },
              {
                type: 'link',
                text: this.$t('gridTrade.close'), // 终止网格
                eventType: 'gridCancel',
                classes: 'grid_btn',
              }],
            };
          }
          if (tableData) {
            newData.push(tableData);
          }
        });
        this.tableLoading = false;
        return newData;
      }
      this.tableLoading = false;
      return [];
    },
    setTime(startTime, endTime) {
      if (!Number(startTime)) {
        return `0${this.$t('gridTrade.d')}0${this.$t('gridTrade.h')}0${this.$t('gridTrade.m')}`;
      }
      let dateEnd = new Date().getTime();
      if (endTime) {
        dateEnd = endTime;
      }
      const dateDiff = dateEnd - startTime; // 时间差的毫秒数
      const day = Math.floor(dateDiff / (24 * 3600 * 1000)); // 计算出相差天数\
      const leave1 = dateDiff % (24 * 3600 * 1000); // 计算天数后剩余的毫秒数
      const hours = Math.floor(leave1 / (3600 * 1000)); // 计算出小时数
      // 计算相差分钟数
      const leave2 = leave1 % (3600 * 1000); // 计算小时数后剩余的毫秒数
      const minutes = Math.floor(leave2 / (60 * 1000)); // 计算相差分钟数
      function s(t) {
        return t < 10 && t > 0 ? `0${t}` : t;
      }
      return `${s(day)}${this.$t('gridTrade.d')}${s(hours)}${this.$t('gridTrade.h')}${s(minutes)}${this.$t('gridTrade.m')}`;
    },
    elementClick(type, data) {
      if (type === 'cancel') {
        const line = this.currentOrderList.find((item) => item.id === data.id);
        if (line) {
          this.cancelOrderEvent(line);
        }
      } else if (type === 'gridDetail') {
        this.gridItemId = data.id;
        this.gridDoliog = true;
      } else if (type === 'gridCancel') {
        this.gridItemId = data.id;
        this.gridCancelDoliog = true;
      } else if (type === 'symbolClick') {
        let line = this.orderData.orderList.find((item) => item.id === data);
        if (this.orderType === 5) {
          line = this.historyDataArr.orderList.find((item) => item.id === data);
        }
        this.changeSymbol(line);
      } else if (type === 'select' && data) {
        this.historyStatus = data.id;
        this.getData();
      }
    },
    // 终止网格
    gridCancelEvent() {
      this.axios({
        url: 'quant/stopStrategy',
        hostType: 'quant',
        method: 'post',
        params: {
          strategyId: this.gridItemId,
        },
      }).then((rep) => {
        if (rep.code.toString() === '0') {
          this.getData();
          // 重新请求资产
          this.$store.dispatch('assetsExchangeData');
          // 撤单成功 提示
          this.$bus.$emit('tip', {
            text: rep.msg,
            type: 'success',
          });
        } else {
          this.$bus.$emit('tip', {
            text: rep.msg,
            type: 'error',
          });
        }
        this.gridCancelDoliog = false;
      });
    },
  },
};
