import {
  myStorage, getCoinShowName, imgMap, colorMap, getIconPath,
} from '@/utils';

export default {
  name: 'Market',
  data() {
    return {
      imgMap,
      colorMap,
      getIconPath,
      // 滚动条配置
      ops: {
        rail: {
          gutterOfSide: '0px',
        },
      },
      // 筛选 货币对
      listfilter: null,
      // 表格加载LOADING
      tableLoading: true,
      klineDataList: {},
      marketDataObj: [],
      marketDataList: [],
      marketDataList_bar: [],
      sortValue: '', // 排序类型
      sortFlag: false, // 排序方向 true-正序 false-倒序
      hoverOption: null, // 划过市场
      activeOption: 'spot', // 选中市场类型
      marketHover: null, // 划过市场tab
      marketSelect: 'all', // 选中市场tab
      tableData: [], // 市场表格数据
      symbolHover: null, // 划过行
      isSearchFocus: false, // 输入框聚焦
      marketSelectOpt: 'spot', // 自选默认现货
      marketHoverOpt: null, // 自选划过
      pagination: {
        page: 1,
        pageSize: 15,
        total: 0,
      },
    };
  },
  props: {
    dataList: {
      type: Array,
      default: () => [],
    },
  },
  computed: {
    templateLayoutType() {
      return this.$store.state.baseData.templateLayoutType;
    },
    // 表头
    columns() {
      return [
        {
          title: this.$t('home.market'), // 市场
          key: 'sort',
          sortable: true,
          isDefalutSort: false,
          width: '15%',
        },
        {
          title: this.$t('home.close'), // 最新价
          key: 'closes',
          sortable: true,
          isDefalutSort: false,
          width: '20%',
        },
        {
          title: this.$t('home.applies'), // 涨跌幅
          key: 'roses',
          sortable: true,
          isDefalutSort: false,
          width: '10%',
        },
        {
          title: this.$t('home.height'), // 最高价
          key: 'highest',
          sortable: true,
          isDefalutSort: false,
          width: '15%',
        },
        {
          title: this.$t('home.low'), // 最低价
          key: 'lowest',
          sortable: true,
          isDefalutSort: false,
          width: '15%',
        },
        {
          title: this.$t('home.H_turnover'), // 24H成交额
          key: 'volume',
          width: '15%',
        },
        {
          title: this.$t('trade.opera'), // 操作
          key: 'operation',
          width: '10%',
        },
      ];
    },
    // 全部市场
    marketAllList() {
      if (this.$store.state.baseData.market) {
        return this.$store.state.baseData.market.marketSort;
      }
      return [];
    },
    // market
    market() {
      if (this.$store.state.baseData.market) {
        return this.$store.state.baseData.market.market;
      }
      return {};
    },
    // 全部币对列表
    symbolAll() {
      return this.$store.state.baseData.symbolAll;
    },
    // 全部币种列表
    coinList() {
      if (this.$store.state.baseData && this.$store.state.baseData.market) {
        return this.$store.state.baseData.market.coinList;
      }
      return null;
    },
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
    // 自选/现货
    marketOptions() {
      const arr = [
        {
          name: this.$t('home.marketSet'),
          index: 'optional',
          icon: `<svg class="icon icon-16" viewBox="0 0 1024 1024" width="200" height="200">${getIconPath('coin_collection', 'text-3-cl')}</svg>`,
          activeIcon: `<svg class="icon icon-16" viewBox="0 0 1024 1024" width="200" height="200">${getIconPath('coin_collection', 'main-1-cl')}</svg>`,
        },
        { name: this.isSaleBol ? this.$t('sale.texta32') : `${this.$t('trade5.tradeType1')}`, index: 'spot' },
      ];
      if (this.linkurl.coUrl) {
        arr.push({ name: this.$t('home.text4'), index: 'co' });
      }
      return arr;
    },
    linkurl() {
      if (this.$store.state.baseData.publicInfo) {
        return this.$store.state.baseData.publicInfo.url;
      }
      return {};
    },
    tradeJumpType() {
      if (this.$store.state.baseData.publicInfo) {
        return this.$store.state.baseData.publicInfo.switch.marketJumpType;
      }
      return '0';
    },
    // 分页数据
    tablePageData() {
      const { page, pageSize } = this.pagination;
      return this.tableData.slice((page - 1) * pageSize, page * pageSize);
    },
  },
  watch: {
    listfilter(val) {
      let data = this.marketDataList_bar;
      if (val) {
        data = this.marketDataList_bar.filter((item) => item.showName.toLowerCase().indexOf(val.toLowerCase()) > -1);
      }
      this.setData(data, true);
    },
    dataList(val) {
      this.tableLoading = false;
      this.marketDataList_bar = val;
      let data = val;
      if (this.listfilter) {
        data = this.marketDataList_bar.filter((item) => item.showName.toLowerCase().indexOf(this.listfilter.toLowerCase()) > -1);
      }
      this.setData(data);
    },
  },
  beforeDestroy() {
    clearInterval(this.timer);
  },
  methods: {
    init() {
      this.marketSelect = myStorage.get('homeMarkSelect') || 'all';
      this.activeOption = myStorage.get('homeMarkOption') || 'spot';
      // 自选
      this.marketSelectOpt = myStorage.get('marketSelectOpt') || 'spot';
    },
    pagechange(page) {
      this.pagination.page = page;
    },
    // 划过市场选项
    handleOptionEnter(type) {
      this.hoverOption = type;
    },
    // 划出市场选项
    handleOptionLeave() {
      this.hoverOption = null;
    },
    // 点击市场选项
    handleClickOption({ index }) {
      myStorage.set('homeMarkOption', index);
      this.activeOption = index;
      this.$bus.$emit('SWITCH-OPTION', index);
      window.gtag('event', 'market_click_tab', {
        ver: '6.0', source: 'pc', type: index,
      });
      this.pagination.page = 1;
    },
    // 市场tab
    handleMarketTabEnter(coin) {
      this.marketHover = coin;
    },
    handleMarketTabLeave() {
      this.marketHover = null;
    },

    // 自选tab
    handleMarketTabEnterOpt(coin) {
      this.marketHoverOpt = coin;
    },
    handleMarketTabLeaveOpt() {
      this.marketHoverOpt = null;
    },
    searchChange(value, name) {
      this[name] = value;
      this.pagination.page = 1;
      window.gtag('event', 'market_search_symbol', {
        ver: '6.0', source: 'pc', symbol: value,
      });
    },
    dataSort(v) {
      if (this.sortValue.length) {
        return v.sort((a, b) => {
          let first = a;
          let end = b;
          if (!this.sortFlag) {
            first = b;
            end = a;
          }
          switch (this.sortValue) {
            case 'roses':
              return (parseFloat(first.increaseSort) || 0)
                - (parseFloat(end.increaseSort) || 0);
            case 'closes':
              return (parseFloat(first.latestPriceSort) || 0)
                - (parseFloat(end.latestPriceSort) || 0);
            case 'highest':
              return (parseFloat(first.highestPriceSort) || 0)
                - (parseFloat(end.highestPriceSort) || 0);
            case 'lowest':
              return (parseFloat(first.lowestPriceSort) || 0)
                - (parseFloat(end.lowestPriceSort) || 0);
            default:
              return (parseFloat(first.sort) || 0)
                - (parseFloat(end.sort) || 0);
          }
        });
      }
      return v;
    },
    sort(v) {
      if (this.tableLoading) return;
      this.tableLoading = true;
      if (this.sortValue !== v.originKey) {
        this.sortValue = v.originKey;
        this.sortFlag = true;
      } else if (this.sortFlag === false) {
        this.sortValue = '';
      } else {
        this.sortFlag = !this.sortFlag;
      }
    },
    setData(val) {
      const tableData = val.map((item) => {
        const i = item;
        i.etfOpen = this.symbolAll[i.id].etfOpen;
        return i;
      });
      this.tableData = this.dataSort(tableData);
      this.pagination.total = this.tableData.length;
    },
    marketClick(symbol) {
      // this.$bus.$emit('SWITCH-STORE', symbol);
      this.$emit('change', symbol);
    },
    // 切换市场
    switchMarket(data) {
      if (this.tableLoading) return;
      this.tableLoading = true;
      const symbol = myStorage.get('homeMarkSelect');
      if (symbol === data) return;
      this.listfilter = null;
      this.marketSelect = data;
      myStorage.set('homeMarkSelect', data);
      this.$bus.$emit('SWITCH-MARKET', data);
      this.pagination.page = 1;
    },
    // 切换自选市场
    switchMarketOpt(data) {
      if (this.tableLoading) return;
      this.tableLoading = true;
      const symbol = myStorage.get('marketSelectOpt');
      if (symbol === data) return;
      this.listfilter = null;
      this.marketSelectOpt = data;
      myStorage.set('marketSelectOpt', data);
      this.$bus.$emit('SWITCH-MARKET-OPT', data);
      this.pagination.page = 1;
    },
    bandLink(data) {
      const baseCoin = data.split('/')[0];
      const quoteCoin = data.split('/')[1];
      const baseCoinShow = getCoinShowName(baseCoin, this.coinList);
      const quoteCoinShow = getCoinShowName(quoteCoin, this.coinList);
      const tradePage = this.tradeJumpType === '1' ? 'proTrade' : 'trade';
      this.$router.push(`/${tradePage}/${baseCoinShow}_${quoteCoinShow}?type=spot`);
      window.gtag('event', 'market_goTrade', {
        ver: '6.0', source: 'pc', symbol: data,
      });
    },
  },
};
