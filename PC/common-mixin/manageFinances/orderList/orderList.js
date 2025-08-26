import {
  fixD, formatTime, getCoinShowName, colorMap, imgMap,
} from '@/utils';

const bannerImgUrl = imgMap.jjrNeaderBg;
export default {
  name: 'orderList',
  data() {
    return {
      bannerImg: bannerImgUrl,
      tabelLoading: true,
      imgMap,
      colorMap,
      symbol: '', // 当前币种
      tabelList: [], // table数据列表
      financeListData: [],
      subTableDataId: '',
      subTableDataOpen: 0,
      subTableData: [],
      subContentId: null,
      symbolList: [], // 币种选择列表
      otherType: '', // type
      otherTypeList: [], // type选择列表
      paginationObj: {
        total: 0, // 数据总条数
        display: 10, // 每页显示条数
        currentPage: 1, // 当前页码
      },
    };
  },
  computed: {
    bannerTitle() { return this.$t('manageFinances.manage_finances'); }, // '理财宝',

    coinList() {
      if (this.$store.state.baseData.market) {
        return this.$store.state.baseData.market.coinList;
      }
      return null;
    },
    // market 接口
    market() { return this.$store.state.baseData.market; },
    // 表格title
    columns() {
      const list = [
        { title: this.$t('manageFinances.buyTime'), key: 'time' }, // 购买时间
        { title: this.$t('manageFinances.name'), key: 'name' }, // 项目名称
        { title: this.$t('manageFinances.orderNumber'), key: 'orderId' }, // 订单号
        { title: this.$t('manageFinances.coin'), key: 'coin' }, // 币种
        { title: this.$t('manageFinances.number'), key: 'volume' }, // 数量
        { title: this.$t('manageFinances.tablerate'), key: 'rate' }, // 利率
        { title: this.$t('manageFinances.status'), key: 'status' }, // 状态
        { title: this.$t('manageFinances.operating'), key: 'operating' }, // 操作
      ];
      return list;
    },
    subColumns() {
      return {
        time: this.$t('manageFinances.transferTime'), // 转出时间
        coin: this.$t('manageFinances.returnCoin'), // 返还币种
        number: this.$t('manageFinances.returnNumber'), // 返还数量
        detailtype: this.$t('manageFinances.type'), // 类型
      };
    },
    // 用于axios的symbol
    axiosSymbol() {
      if (this.symbol === 'all') {
        return null;
      }
      return this.symbol;
    },
    // 用于axios的symbol
    axiostype() {
      if (this.otherType === 'all') {
        return null;
      }
      return this.otherType;
    },
  },
  watch: {
    market(v) { if (v) { this.setData(); } },
  },
  methods: {
    init() {
      if (this.market) { this.setData(); }
    },
    // 获取个人理财记录
    getDataList() {
      this.axios({
        url: this.$store.state.url.common.financingList,
        params: {
          pageSize: this.paginationObj.display, // 每页条数
          page: this.paginationObj.currentPage, // 页码
          coinSymbol: this.axiosSymbol,
          status: this.axiostype,
        },
        hostType: 'financing',
      }).then((data) => {
        if (data.code.toString() === '0') {
          const list = [];
          data.data.order_list.forEach((item) => {
            const { coinList } = this.market;
            const fix = (coinList[item.symbol] && coinList[item.symbol].showPrecision) || 0;
            list.push({
              id: item.order_id,
              time: formatTime(item.ctime), // 时间
              name: item.name, // 项目名称
              orderId: item.order_id, // 订单号
              coin: getCoinShowName(item.symbol, this.coinList), // 币种
              volume: fixD(item.number, fix), // 数量
              rate: item.rate, // 利率
              status: item.status_txt, // 状态
              operating: this.$t('trade.view'), // 详情 //  this.handleButton(item.order_id),
            });
          });
          this.tabelLoading = false;
          this.tabelList = list;
          this.paginationObj.total = data.data.count;
        }
      });
    },
    symbolChange(item) {
      // this.subTableDataOpen = 0
      this.symbol = item.code;
      this.paginationObj.currentPage = 1; // 页码
      this.paginationObj.total = 0; // 总条数
      this.tabelList = [];
      this.tabelLoading = true;
      // this.subTableDataOpen = 0
      this.getDataList();
    },
    otherTypeChange(item) {
      // this.subTableDataOpen = 0
      this.otherType = item.code;
      this.paginationObj.currentPage = 1; // 页码
      this.paginationObj.total = 0; // 总条数
      this.tabelList = [];
      this.tabelLoading = true;
      this.getDataList();
    },
    setData() {
      const list = [{ code: 'all', value: this.$t('assets.flowingWater.allCoin') }];
      Object.keys(this.market.coinList).forEach((item) => {
        if (this.market.coinList[item].isFiat) {
          return;
        }
        list.push({ code: item, value: getCoinShowName(item, this.coinList) });
      });
      this.symbolList = list;
      // console.log(this.symbolList);
      this.symbol = 'all';
      const otherlist = [
        { code: 'all', value: this.$t('manageFinances.allType') },
        { code: '1', value: this.$t('manageFinances.subscribed') },
        { code: '2', value: this.$t('manageFinances.interested') },
        { code: '3', value: this.$t('manageFinances.completed') },
      ];
      this.otherTypeList = otherlist;
      this.otherType = this.otherTypeList[0].code;
      this.getDataList();
    },
    pagechange(v) {
      this.paginationObj.currentPage = v;
      this.getDataList();
    },
    // 详情列表
    tableClick(id) {
      if (this.subTableDataId === id) {
        this.subTableDataId = null;
        this.subTableData = [];
      } else {
        this.subTableDataId = id;
        this.subTableData = [];
        this.axios({
          url: this.$store.state.url.common.financingListDet,
          headers: {},
          params: {
            order_id: id,
          },
          method: 'post',
          hostType: 'financing',
        }).then((data) => {
          if (data.code.toString() === '0') {
            data.data.return_list.forEach((item) => {
              const { coinList } = this.market;
              const fix = (coinList[item.symbol] && coinList[item.symbol].showPrecision) || 0;
              let detailtype = null;
              if (item.type === 0) {
                detailtype = this.$t('manageFinances.interest');
              } else {
                detailtype = this.$t('manageFinances.principal');
              }
              // console.log(type)
              this.subTableData.push({
                time: formatTime(item.return_time), // 地址
                coin: item.symbol,
                number: fixD(item.number, fix),
                detailtype,
              });
            });
          }
        });
      }
    },
    handleButton(item) {
      const arr = [];
      arr.push({
        type: 'subTable',
        text: this.$t('trade.view'), // 详情
        eventType: item,
        // orderId: item,
      });
      return arr;
    },
  },
};
