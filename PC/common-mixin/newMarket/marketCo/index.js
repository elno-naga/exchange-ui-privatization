import {
  myStorage, imgMap, colorMap, getIconPath,
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
      listfilterCo: null,
      // 表格加载LOADING
      tableLoadingCo: true,
      marketDataList: [],
      marketDataList_bar: [],
      sortValueCo: 'amount', // 排序类型
      sortFlagCo: false, // 排序方向 true-正序 false-倒序
      hoverOption: null, // 划过市场
      activeOptionCo: 'co', // 选中市场类型
      marketHoverCo: null, // 划过市场tab
      marketSelectCo: 'all', // 选中市场tab
      tableDataCo: [], // 市场表格数据
      symbolHover: null, // 划过行
      isSearchFocus: false, // 输入框聚焦
      tableHeight: null,
      // 合约方向类型
      contractSide: 1,
      showTypeTabList0: false,
      showTypeTabList1: false,
      showTypeTabList2: false,
      showTypeTabList3: false,
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
    // 类型列表 USDT合约/币本位合约
    contractTabList() {
      const arr = [];
      if (this.showTypeTabList1) {
        arr.push({
          id: 1,
          text: this.$t('futuresMarket.USDTM'), // 'USDT合约',
          isShow: this.showTypeTabList1,
          classes: this.contractSide === 1 ? 'text-1-cl' : 'text-2-cl',
        });
      }
      if (this.showTypeTabList0) {
        arr.push({
          id: 0,
          text: this.$t('futuresMarket.coinM'), // '币本位合约',
          isShow: this.showTypeTabList0,
          classes: this.contractSide === 0 ? 'text-1-cl' : 'text-2-cl',
        });
      }

      if (this.showTypeTabList2) {
        arr.push({
          id: 2,
          text: this.$t('futuresMarket.mix'), // '混合合约',
          isShow: this.showTypeTabList2,
          classes: this.contractSide === 2 ? 'text-1-cl' : 'text-2-cl',
        });
      }
      if (this.showTypeTabList3) {
        arr.push({
          id: 3,
          text: this.$t('futuresMarket.mock'), // '模拟合约',
          isShow: this.showTypeTabList3,
          classes: this.contractSide === 3 ? 'text-1-cl' : 'text-2-cl',
        });
      }
      return arr;
    },
    // 合约列表
    contractList() {
      if (this.$store.state.future) {
        return this.$store.state.future.contractList;
      }
      return null;
    },
    dataLength() {
      return this.tableData.length;
    },
    templateLayoutType() {
      return this.$store.state.baseData.templateLayoutType;
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
    // 表头
    columnsCo() {
      return [
        {
          title: this.$t('home.market'), // 市场
          key: 'contractOtherName',
          sortable: true,
          isDefalutSort: false,
          width: '15%',
        },
        {
          title: this.$t('home.close'), // 最新价
          key: 'close',
          sortable: true,
          isDefalutSort: false,
          width: '20%',
        },
        {
          title: this.$t('home.applies'), // 涨跌幅
          key: 'rose',
          sortable: true,
          isDefalutSort: false,
          width: '10%',
        },
        {
          title: this.$t('home.H_height'), // 24最高价
          key: 'high',
          sortable: true,
          isDefalutSort: false,
          width: '15%',
        },
        {
          title: this.$t('home.H_low'), // 24最低价
          key: 'low',
          sortable: true,
          isDefalutSort: false,
          width: '15%',
        },
        {
          title: this.$t('home.H_turnover'), // 24H成交额
          key: 'amount',
          width: '15%',
          sortable: true,
          isDefalutSort: false,
        },
        {
          title: this.$t('trade.opera'), // 操作
          key: 'operation',
          width: '10%',
        },
      ];
    },
    // 自选/现货
    marketOptions() {
      return [
        {
          name: this.$t('home.marketSet'),
          index: 'optional',
          icon: `<svg class="icon icon-16" viewBox="0 0 1024 1024" width="200" height="200">${getIconPath('coin_collection', 'text-3-cl')}</svg>`,
          activeIcon: `<svg class="icon icon-16" viewBox="0 0 1024 1024" width="200" height="200">${getIconPath('coin_collection', 'main-1-cl')}</svg>`,
        },
        { name: this.isSaleBol ? this.$t('sale.texta32') : `${this.$t('trade5.tradeType1')}`, index: 'spot' },
        { name: this.$t('home.text4'), index: 'co' },
      ];
    },
    lan() {
      return this.$store.state.baseData.lan;
    },
    // 分页数据
    tablePageDataCo() {
      const { page, pageSize } = this.pagination;
      return this.tableDataCo.slice((page - 1) * pageSize, page * pageSize);
    },
  },
  watch: {
    listfilterCo(val) {
      let data = this.marketDataList_bar;
      if (val) {
        const reg = new RegExp(val, 'gim');
        data = this.marketDataList_bar.filter((item) => item.contractOtherName.match(reg));
      }
      this.setData(data, true);
    },
    dataList(val) {
      this.tableLoadingCo = false;
      this.marketDataList_bar = val;
      let data = val;
      if (this.listfilterCo) {
        const reg = new RegExp(this.listfilterCo, 'gim');
        data = this.marketDataList_bar.filter((item) => item.contractOtherName.match(reg));
      }
      this.setData(data);
    },
    contractList(val) {
      if (val) {
        this.contractList.forEach((item) => {
          this.contractSide = this.filterContractType(item);
        });
      }
    },
  },
  beforeDestroy() {
    clearInterval(this.timer);
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
    init() {
      setTimeout(() => {
        if (this.contractList && this.contractList.length > 0) {
          this.contractList.forEach((item) => {
            this.contractSide = this.filterContractType(item);
          });
        }
      }, 500);
      if (myStorage.get('homeMarkSelectCo') === 0) {
        // 币本位合约
        this.marketSelectCo = 0;
      } else {
        this.marketSelectCo = myStorage.get('homeMarkSelectCo') || 'all';
      }
      this.activeOptionCo = myStorage.get('homeMarkOption') || 'co';
      // 自选
      this.marketSelectOpt = myStorage.get('marketSelectOpt') || 'co';
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
    pagechange(page) {
      this.pagination.page = page;
    },
    // 筛选合约类型
    filterContractType(data) {
      // USDT 合约
      if (data.classification === 1) {
        this.showTypeTabList1 = true;
        return 1;
      }
      // 币本位合约
      if (data.classification === 2) {
        this.showTypeTabList0 = true;
        return 0;
      }
      // 模拟合约
      if (data.classification === 4) {
        this.showTypeTabList3 = true;
        return 3;
      }
      // 混合合约
      this.showTypeTabList2 = true;
      return 2;
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
    handleClickOptionCo({ index }) {
      myStorage.set('homeMarkOption', index);
      this.activeOptionCo = index;
      this.$bus.$emit('SWITCH-OPTION', index);
      this.pagination.page = 1;
    },
    // 市场tab
    handleMarketTabEnterCo(coin) {
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
    searchChangeCo(value, name) {
      this[name] = value;
      this.pagination.page = 1;
    },
    dataSort(v) {
      if (this.sortValueCo.length) {
        return v.sort((a, b) => {
          let first = a;
          let end = b;
          if (!this.sortFlagCo) {
            first = b;
            end = a;
          }
          if (this.sortValueCo === 'contractOtherName') {
            // 正序
            if (first.contractOtherName < end.contractOtherName) {
              return -1;
            }
            if (first.contractOtherName > end.contractOtherName) {
              return 1;
            }
            return 0;
          }

          switch (this.sortValueCo) {
            case 'close':
              return (parseFloat(first.closeSort) || 0)
                - (parseFloat(end.closeSort) || 0);
            case 'rose':
              return (parseFloat(first.roseSort) || 0)
                - (parseFloat(end.roseSort) || 0);
            case 'high':
              return (parseFloat(first.highSort) || 0)
                - (parseFloat(end.highSort) || 0);
            case 'low':
              return (parseFloat(first.lowSort) || 0)
                - (parseFloat(end.lowSort) || 0);
            case 'amount':
              return (parseFloat(first.amountSort) || 0)
                - (parseFloat(end.amountSort) || 0);
            default:
              return (parseFloat(first.sort) || 0)
                - (parseFloat(end.sort) || 0);
          }
        });
      }
      return v;
    },
    sort(v) {
      if (this.tableLoadingCo) return;
      this.tableLoadingCo = true;
      if (this.sortValueCo !== v.originKey) {
        this.sortValueCo = v.originKey;
        this.sortFlagCo = true;
      } else if (this.sortFlagCo === false) {
        // 默认按24小时成交额倒序
        if (v.key === 'amount' && v.type === 'up' && v.originKey === 'amount') {
          this.sortValueCo = 'amount';
          this.sortFlagCo = true;
        } else {
          this.sortValueCo = 'amount';
        }
      } else {
        this.sortFlagCo = !this.sortFlagCo;
      }
    },
    setData(val) {
      const tableData = val.map((item) => {
        const i = item;
        return i;
      });
      this.tableDataCo = this.dataSort(tableData);
      this.pagination.total = this.tableDataCo.length;
    },
    // 点击合约自选
    marketClickCo(symbol, id) {
      // this.$bus.$emit('SWITCH-STORE-CONTRACT', symbol, id);
      this.$emit('change', symbol, id);
    },
    // 切换市场
    switchMarketCo(data) {
      if (this.tableLoadingCo) return;
      this.tableLoadingCo = true;
      const symbol = myStorage.get('homeMarkSelectCo');
      if (symbol === data) return;
      this.listfilterCo = null;
      if (data === 'all') {
        this.marketSelectCo = data;
        myStorage.set('homeMarkSelectCo', data);
        this.$bus.$emit('SWITCH-MARKET-CO', data);
      } else {
        this.marketSelectCo = data.id;
        myStorage.set('homeMarkSelectCo', data.id);
        this.$bus.$emit('SWITCH-MARKET-CO', data.id);
      }
      this.pagination.page = 1;
    },
    // 切换自选市场
    switchMarketOpt(data) {
      if (this.tableLoadingCo) return;
      this.tableLoadingCo = true;
      const symbol = myStorage.get('marketSelectOpt');
      if (symbol === data) return;
      this.listfilterCo = null;
      this.marketSelectOpt = data;
      myStorage.set('marketSelectOpt', data);
      this.$bus.$emit('SWITCH-MARKET-OPT', data);
      this.pagination.page = 1;
    },
    bandLink(data) {
      const { publicInfo } = this.$store.state.baseData;
      if (publicInfo && publicInfo.url) {
        window.location.href = `${publicInfo.url.coUrl}/${this.lan}/trade/${data.contractName}`;
      }
    },
  },
};
