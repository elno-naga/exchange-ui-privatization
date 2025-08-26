/* eslint-disable no-shadow */
import {
  imgMap,
  colorMap,
  getIconPath,
  formatTimeFn,
  fixD,
} from '@/utils';

export default {
  data() {
    return {
      imgMap,
      colorMap,
      getIconPath,
      formatTimeFn,
      nowType: 1, // 2为历史委托
      status: 'all', // 筛选-状态
      symbolCoin: 'all', // 筛选-币种
      side: 'all', // 筛选 - 方向
      tableLoading: true,
      dataCoinList: [], // 贩卖所币种信息
      pagination: {
        total: 0, // 数据总条数
        display: 10, // 每页显示条数
        currentPage: 1, // 当前页码
      },
      tableList: [],
      isShowDownload: false,
      tipContent: '',
      showRateTip: null,
    };
  },
  watch: {
  },
  computed: {
    navTab() {
      return [
        // 历史委托
        { name: this.$t('order.exchangeOrder.hisOrder'), index: 1 },
      ];
    },
    sideList() {
      return [ // 方向选择列表
        // 全部
        { code: 'all', value: this.$t('order.exchangeOrder.all') },
        // 买入
        { code: 'BUY', value: this.$t('order.exchangeOrder.buy') },
        // 卖出
        { code: 'SELL', value: this.$t('order.exchangeOrder.sell') },
      ];
    },
    market() { return this.$store.state.baseData.market; },
    // 表格title
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
    // 全部币种列表
    coinList() {
      if (this.$store.state.baseData && this.$store.state.baseData.market) {
        return this.$store.state.baseData.market.coinList;
      }
      return null;
    },
    orderStatus() {
      return [
        {
          value: this.$t('order.exchangeOrder.all'),
          code: 'all',
        },
        // {
        //   value: this.$t('sale.texta9'),
        //   code: 1,
        //   color: 'special-4-bg',
        // },
        {
          value: this.$t('sale.texta10'),
          code: 2,
          color: 'warning-1-bg',
          message: this.$t('sale.texta14'),
        },
        // {
        //   value: this.$t('sale.texta12'),
        //   code: 3,
        //   color: 'fall-1-bg',
        // },
        {
          value: this.$t('sale.texta11'),
          code: 4,
          color: 'warning-1-bg',
          message: this.$t('sale.texta15'),
        },
        {
          value: this.$t('sale.texta13'),
          code: 5,
          color: 'rise-1-bg',
        },
      ];
    },
    // 是否开启 查询全部币对
    // openOrderCollect() {
    //   if (this.$store.state.baseData.publicInfo) {
    //     return this.$store.state.baseData.publicInfo.open_order_collect;
    //   }
    //   return null;
    // },
  },
  methods: {
    init() {
      this.getOrderList();
      this.getCoinCurrencies();
      this.$bus.$on('openSaleDown', (val) => {
        this.isShowDownload = val;
      });
    },
    // 币种发生改变
    symbolCoinChange(item) {
      if (this.symbolCoin === item.code) { return; }
      this.symbolCoin = item.code;
      this.pagination.currentPage = 1; // 页码
      this.pagination.total = 0; // 总条数
      this.tableList = [];
      this.tableLoading = true;
      this.getData();
    },
    // 状态 select 改变
    statusChange(item) {
      if (this.status === item.code) { return; }
      this.status = item.code;
      this.pagination.currentPage = 1; // 页码
      this.pagination.total = 0; // 总条数
      this.tableList = [];
      this.tableLoading = true;
      this.getData();
    },
    // 方向 select 改变
    sideChange(item) {
      if (this.side === item.code) { return; }
      this.side = item.code;
      this.pagination.currentPage = 1; // 页码
      this.pagination.total = 0; // 总条数
      this.tableList = [];
      this.tableLoading = true;
      this.getData();
    },
    // switchChange() {
    //   this.switchFlag = !this.switchFlag;
    //   this.getData();
    // },
    getData() {
      if (this.nowType === 1) {
        this.getOrderList();
      }
    },
    // 分页器
    pagechange(v) {
      this.pagination.currentPage = v;
      this.getData();
    },
    // 切换委托
    currentType(item) {
      if (this.nowType === item.index) { return; }
      this.nowType = item.index;
      this.pagination.currentPage = 1; // 页码
      this.pagination.total = 0; // 总条数
      this.tabelList = [];
      this.tabelLoading = true;
      this.getData();
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
                const indItem = {
                  code: item.coin,
                  value: item.coin,
                  ...item,
                };
                indItem.icon = null;
                if (this.coinList && this.coinList[item.coin]) {
                  indItem.icon = this.coinList[item.coin].icon;
                  indItem.value = this.coinList[item.coin].showName;
                  indItem.longName = this.coinList[item.coin].longName;
                }
                arr.push(indItem);
              }
            });
          } else {
            this.$bus.$emit('tip', { text: res.msg, type: 'error' });
          }
          arr.unshift({
            code: 'all',
            value: this.$t('order.exchangeOrder.all'),
          });
          this.dataCoinList = arr;
        });
    },
    // 获取 订单历史
    getOrderList() {
      this.tableLoading = true;
      this.axios({
        url: 'jp/order/history',
        method: 'post',
        params: {
          coin: this.symbolCoin === 'all' ? '' : this.symbolCoin,
          page: this.pagination.currentPage,
          side: this.side === 'all' ? '' : this.side,
          pageSize: this.pagination.display,
          status: this.status === 'all' ? 0 : this.status,
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
          this.pagination.total = rs.data.count;
        }
        this.tableList = arr;
      });
    },
    showStatus(val) {
      if (!val) return val;
      const arr = this.orderStatus.filter((item) => item.code.toString() === val.toString());
      if (arr && arr.length) {
        return arr[0];
      }
      return val;
    },
    showCoin(val) {
      if (!val) return {};
      let obj = {};
      if (this.dataCoinList && this.dataCoinList.length && val) {
        const arr = this.dataCoinList.filter((item) => item.coin === val);
        if (arr && arr.length) {
          // eslint-disable-next-line prefer-destructuring
          obj = { ...arr[0] };
        }
      }
      return obj;
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
    //  开启
    showDownloadFn() {
      this.$bus.$emit('openSaleDown', true);
    },
    // 显示
    showTip(val) {
      this.showRateTip = `saleIconPath-${val.ind}`;
    },
    hideTip() {
      this.showRateTip = null;
    },
  },
};
