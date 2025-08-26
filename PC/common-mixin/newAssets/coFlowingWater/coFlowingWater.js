import {
  fixD, colorMap, imgMap,
  formatTime,
  getIconPath,
} from '@/utils';

export default {
  name: 'page-flowingWater',
  data() {
    return {
      getIconPath,
      tabelLoading: true,
      imgMap,
      colorMap,
      tabelList: [], // table数据列表
      paginationObj: {
        total: 0, // 数据总条数
        display: 10, // 每页显示条数
        currentPage: 1, // 当前页码
      },
      startTime: '',
      endTime: '',
      type: 'all',
      symbol: '',
      defaultIcon: 'https://bigcustom-oss.oss-cn-hongkong.aliyuncs.com/upload/ieotitleIcon.png',
      // symbolList: [],
    };
  },
  computed: {
    tradeLinkUrl() {
      if (process.env.NODE_ENV === 'development') {
        return '/co/trade';
      }
      if (this.$store.state.baseData && this.$store.state.baseData.publicInfo) {
        return `${this.linkurl.coUrl}/trade`;
      }
      return '';
    },
    marginCoinList() {
      if (this.$store.state.future.marginCoinList) {
        return this.$store.state.future.marginCoinList;
      }
      return [];
    },
    // 币种信息
    marginCoinInfor() {
      if (this.$store.state.future.marginCoinInfor) {
        return this.$store.state.future.marginCoinInfor;
      }
      return {};
    },
    symbolList() {
      const arr = [];
      if (this.marginCoinList.length !== 0) {
        const { coinList } = this.market ? this.market : {};
        this.marginCoinList.forEach((item) => {
          const { icon } = coinList[item] ? coinList[item] : {};
          const symbolLogoUrl = icon || this.defaultIcon;
          arr.push({ value: item, code: item, img: symbolLogoUrl });
        });
        this.symbol = arr[0].code;
      }
      return arr;
    },
    typeList() {
      return [
        { code: 'all', value: this.$t('futures.coFlowingWater.all') }, // 全部
        { code: '1', value: this.$t('futures.coFlowingWater.transferIn') }, // 转入
        { code: '2', value: this.$t('futures.coFlowingWater.transferOut') }, // 转出
        // { code: '3', value: '结算多仓' }, // 结算多仓
        // { code: '4', value: '结算空仓' }, // 结算空仓
        { code: '5', value: this.$t('futures.coFlowingWater.fee') }, // 资金费用
        { code: '6', value: this.$t('futures.coFlowingWater.typeList5') }, // 开仓手续费
        { code: '7', value: this.$t('futures.coFlowingWater.typeList4') }, // 平仓手续费
        { code: '8', value: this.$t('futures.coFlowingWater.loss') }, // 分摊
        { code: '9', value: this.$t('futures.coFlowingWater.typeList1') }, // 手续费分成
        // { code: '10', value: this.$t('futures.coFlowingWater.typeList2') }, // 增金发放
        // { code: '11', value: this.$t('futures.coFlowingWater.typeList3') }, // 赠金回收

      ];
    },
    axiosType() {
      if (this.type === 'all') {
        return '';
      }
      return this.type;
    },
    // market 接口
    market() { return this.$store.state.baseData.market; },
    // 表格title
    columns() {
      const list = [
        { title: this.$t('futures.coFlowingWater.coin'), key: 'coin' }, // 币种
        // { title: this.$t('futures.order.contract'), key: '25%' }, // 合约
        { title: this.$t('futures.coFlowingWater.time'), key: 'time' }, // 时间
        { title: this.$t('futures.coFlowingWater.type'), key: 'type' }, // 类型
        { title: this.$t('futures.coFlowingWater.amount'), key: 'amount' }, // 金额

      ];
      return list;
    },
    minStatrDate() {
      return 0;
    },
    maxStatrDate() {
      if (this.endTime) {
        return new Date(this.endTime).getTime() / 1000;
      }
      return 0;
    },
    minEndDate() {
      if (this.startTime) {
        return new Date(this.startTime).getTime() / 1000;
      }
      return 0;
    },
    maxEndDate() {
      return new Date();
    },
  },
  watch: {
    typeList(data) {
      if (data) {
        this.type = 'all';
      }
    },
    symbol(v) {
      if (v) {
        this.getData();
      }
    },
  },
  methods: {
    init() {
      this.resetTime();
      setTimeout(() => {
        this.type = 'all';
      });
      // this.getSymbolList();
    },
    // getSymbolList() {
    //   const arr = [];
    //   const list = this.marginCoinList;
    //   if (list) {
    //     list.forEach((item) => {
    //       arr.push({ value: item, code: item });
    //     });
    //     this.symbol = arr[0].code;
    //     this.symbolList = arr;
    //   }
    // },
    // 重置时间
    resetTime() {
      const timestamp = new Date().getTime();
      const t = 60 * 60 * 24 * 1000 * 14;
      this.startTime = this.getNowTime(timestamp - t);
      this.endTime = this.getNowTime(timestamp);
      this.start = `${this.startTime} 00:00:00`;
      this.end = `${this.endTime} 23:59:59`;
    },
    getNowTime(time = '') {
      const date = new Date(time);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      return `${year}-${month}-${day}`;
    },
    disabledDate(time) {
      return new Date(time) > new Date();
    },

    timeSelect(time = []) {
      this.startTime = time.length ? this.getNowTime(time[0]) : '';
      this.endTime = time.length ? this.getNowTime(time[1]) : '';
      if (this.startTime && this.endTime) {
        this.paginationObj.currentPage = 1; // 页码
        this.paginationObj.total = 0; // 总条数
        this.tabelList = [];
        this.tabelLoading = true;
        this.getData();
      }
    },
    symbolChange(item) {
      this.symbol = item.code;
      this.paginationObj.currentPage = 1; // 页码
      this.paginationObj.total = 0; // 总条数
      this.tabelList = [];
      this.tabelLoading = true;
    },
    typeChange(item) {
      this.type = item.code;
      this.paginationObj.currentPage = 1; // 页码
      this.paginationObj.total = 0; // 总条数
      this.tabelList = [];
      this.tabelLoading = true;
      this.getData();
    },
    getData() {
      if (!this.symbol) return;
      this.axios({
        url: 'record/get_transaction_list',
        hostType: 'co',
        params: {
          limit: this.paginationObj.display, // 每页条数
          page: this.paginationObj.currentPage, // 页码
          beginTime: new Date(this.start).getTime(),
          endTime: new Date(this.end).getTime(),
          type: this.axiosType,
          symbol: this.symbol,
        },
      }).then((data) => {
        this.tabelLoading = false;
        if (data.code.toString() === '0') {
          const list = [];
          const { coinList } = this.market ? this.market : {};
          const { icon, longName } = coinList[this.symbol] ? coinList[this.symbol] : {};
          const longTitle = longName || this.symbol;
          const symbolLogoUrl = icon || this.defaultIcon;
          if (data.data.transList && data.data.transList.length !== 0) {
            data.data.transList.forEach((item, index) => {
              list.push({
                id: index,
                coin: {
                  symbolLogoUrl,
                  longTitle,
                },
                // item.contractOtherName, // 合约新名称####
                time: item.ctimeMillis ? formatTime(item.ctimeMillis) : '', // 时间
                type: item.type, // 类型
                amount: fixD(item.amount, this.marginCoinInfor[this.symbol].marginCoinPrecision), // 金额
                // item.contractName, // 合约
              });
            });
          }
          this.tabelList = list;
          this.paginationObj.total = data.data.count;
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
    pagechange(v) {
      this.paginationObj.currentPage = v;
      this.getData();
    },
    // 跳转到合约账户页面
    gocoAccount() {
      this.$router.push('coAccount');
    },
  },
};
