import {
  fixD, colorMap, imgMap, getCoinShowName, getIconPath,
} from '@/utils';
import { formatTime } from '../../../../utils';

export default {
  name: 'page-flowingWater',
  data() {
    return {
      tabelLoading: true,
      imgMap,
      getIconPath,
      colorMap,
      type: 'all', // 当前类型
      symbol: '', // 当前币种
      tabelList: [], // table数据列表
      symbolList: [], // 币种选择列表
      paginationObj: {
        total: 0, // 数据总条数
        display: 10, // 每页显示条数
        currentPage: 1, // 当前页码
      },
    };
  },
  computed: {
    typeList() {
      return [
        { code: 'all', value: this.$t('assets.otcFlowingWater.all') }, // 全部
        { code: '1', value: this.$t('assets.otcFlowingWater.inOtc') }, // 转入场外
        { code: '2', value: this.$t('assets.otcFlowingWater.outOtc') }, // 转出场外
      ];
    },
    // market 接口
    market() { return this.$store.state.baseData.market; },
    coinList() {
      return this.market && this.market.coinList;
    },
    // 表格title
    columns() {
      const list = [
        { key: 'coin', title: this.$t('assets.otcFlowingWater.listCoin'), width: '30%' }, // 币种
        { key: 'time', title: this.$t('assets.otcFlowingWater.listTime'), width: '30%' }, // 时间
        { key: 'type', title: this.$t('assets.otcFlowingWater.listType'), width: '30%' }, // 类型
        { key: 'amount', title: this.$t('assets.otcFlowingWater.listVolume'), width: '10%' }, // 数量
      ];
      return list;
    },
    // 用于axios的symbol
    axiosSymbol() {
      if (this.symbol === 'all') {
        return null;
      }
      return this.symbol;
    },
    // 用于axios的type
    axiosType() {
      if (this.type === 'all') {
        return null;
      }
      return this.type;
    },
  },
  watch: {
    market(v) { if (v) { this.setData(); } },
  },
  filters: {
    getCoinShowName(v, coinList) {
      if (v) {
        return getCoinShowName(v, coinList);
      }
      return '';
    },
  },
  methods: {
    init() {
      if (this.market) { this.setData(); }
    },
    // 回退
    goBack() {
      this.smartBack();
    },
    smartBack() {
      const from = document.referrer;
      // 如果来自站外（比如 baidu.com 或为空），则跳转到默认页面
      const isFromOutside = from === '' || !from.includes(window.location.host);
      if (isFromOutside) {
        window.location.replace('/');// 或 push
      } else {
        this.$router.push('otcAccount');
      }
    },
    symbolChange(item) {
      this.symbol = item.code;
      this.paginationObj.currentPage = 1; // 页码
      this.paginationObj.total = 0; // 总条数
      this.tabelList = [];
      this.tabelLoading = true;
      this.getData();
    },
    typeChange(item) {
      this.type = item.code;
      this.paginationObj.currentPage = 1; // 页码
      this.paginationObj.total = 0; // 总条数
      this.tabelList = [];
      this.tabelLoading = true;
      this.getData();
    },
    setData() {
      const list = [{ code: 'all', value: this.$t('assets.otcFlowingWater.allCoin') }];
      Object.keys(this.market.coinList).forEach((item) => {
        if (this.market.coinList[item].otcOpen === 1) {
          list.push({
            img: this.market.coinList[item].icon,
            value: getCoinShowName(item, this.market.coinList),
            code: item,
          });
        }
      });
      this.symbolList = list;
      this.symbol = 'all';
      this.getData();
    },
    // 千分符
    thousands(num) {
      if (num && parseFloat(num)) {
        const str = num.toString();
        const reg = str.indexOf('.') > -1 ? /(\d)(?=(\d{3})+\.)/g : /(\d)(?=(?:\d{3})+$)/g;
        return str.replace(reg, '$1,');
      }
      return num;
    },
    getData() {
      this.axios({
        url: '/record/otc_transfer_list',
        params: {
          pageSize: this.paginationObj.display, // 每页条数
          page: this.paginationObj.currentPage, // 页码
          coinSymbol: this.axiosSymbol,
          transactionType: this.axiosType,
        },
      }).then((data) => {
        this.tabelLoading = false;
        if (data.code.toString() === '0') {
          const list = [];
          data.data.financeList.forEach((item, index) => {
            const { coinList } = this.market;
            const fix = (coinList[item.coinSymbol] && coinList[item.coinSymbol].showPrecision) || 0;
            list.push({
              id: index,
              coin: item.coinSymbol,
              time: item.createdAtTime ? formatTime(item.createdAtTime) : '--', // 时间
              type: item.transactionType_text, // 类型
              amount: this.thousands(fixD(item.amount, fix)), // 充值数量
            });
          });
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
  },
};
