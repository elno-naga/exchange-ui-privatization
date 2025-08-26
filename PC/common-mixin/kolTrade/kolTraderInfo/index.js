import {
  imgMap, colorMap, fixD, getCoinShowName, getIconPath,
} from '@/utils';

export default {
  name: 'kolTrade',
  data() {
    return {
      imgMap,
      colorMap,
      getIconPath,
      kolTraderInfoFlag: false, // 带单人详情
      currentInfoTab: 1, // 带单人详情-带单概况: 1 带单人详情-历史带单: 2
    };
  },
  props: {
    follow_status: {
      default: 0,
      type: Number,
    },
    img_url: {
      default: '',
      type: String,
    },
    user_name: {
      default: '',
      type: String,
    },
    position_status: {
      default: '',
      type: String,
    },
    label: {
      default: '',
      type: String,
    },
    date_diff: {
      default: '',
      type: String,
    },
    rate: {
      default: '',
      type: String,
    },
    uid: {
      default: '',
      type: String,
    },
    profit_rate: {
      default: '',
      type: String,
    },
  },

  computed: {
    isLogin() {
      return this.$store.state.baseData.isLogin;
    },
    // 带单人详情 带单概况，历史带单
    navTab() {
      const arr = [
        { name: this.$t('kol.kolTradePc.text68'), index: 1 },
        { name: this.$t('kol.kolTradePc.text69'), index: 2 },
      ];
      return arr;
    },

  },
  filters: {
    // 百分号格式化
    rateFiter(v) {
      let str = '';
      if (Number(v) >= 0) {
        str = `+${v}`;
      } else {
        str = v;
      }
      return `${str}%`;
    },
  },

  methods: {
    init() {

    },

    // 打开  带单人详情
    showInfo(uid) {
      if (!this.isLogin) {
        this.$router.push('/login');
        return;
      }
      this.kolTraderInfoFlag = true;
      this.uid = uid;
      this.getDteData(uid);
    },
    // 关闭  带单人详情
    closeInfo() {
      this.kolTraderInfoFlag = false;
      this.uid = '';
      this.currentInfoTab = 1;
    },
    // 跟单人信息
    getDteData(uid) {
      this.axios({
        url: 'v2/kol/info',
        hostType: 'coFollow',
        params: {
          uid,
        },
        method: 'post',
      }).then((data) => {
        if (data.code.toString() === '0') {
          const { info } = data.data;
          this.minAmount = info.single_min_amount;
          this.maxAmount = info.single_max_amount;
          this.user_name = info.user_name;
          this.date_diff = info.date_diff; // 入住天数
          this.rate = info.rate; // 盈利分成
          this.profit_rate = info.profit_rate; // 累计收益率
          this.win_rate_week = info.win_rate_week; // 近两周交易胜率
          this.profit_amount = info.profit_amount; // 总收益
          this.win_rate = info.win_rate; // 交易胜率
          this.order_number = info.order_number; // 交易笔数
          this.total_number = info.total_number; // 跟单人数
          this.order_frequency = info.order_frequency; // 交易频次
          this.follow_status = info.follow_status; // 是否对次跟单
          this.position_status = info.position_status; // 持仓状态
          this.label = info.label; // 签名
          this.is_share = info.is_share; // 是否开启分享
          this.img_url = info.imgUrl;
          this.loadingFlag = false;
        } else {
          this.$bus.$emit('tip', {
            text: data.msg, type: 'error', backgroundColor: '#F6F8FF', textColor: '#16181d',
          });
        }
      });
    },
    // 立即跟单
    confirmFollowKolTrader() {
      this.kolTraderInfoFlag = false;
      this.followSetFlag = true;
      this.getDteData(this.uid);
      this.getSymbolList(this.uid);
    },
    // 获取合约列表
    getSymbolList(uid) {
      this.axios({
        url: 'v2/kol/symbol_info',
        hostType: 'coFollow',
        params: {
          uid,
        },
        method: 'post',
      }).then((data) => {
        if (data.code === '0' || data.code === 0) {
          // data.data.coinList = [
          //   { coin: "BTC", type: 1, amount: 100 },
          //   { coin: "EXUSD", type: 1, amount: 0 },
          //   { coin: "ETH", type: 0, amount: 500 }
          // ];
          // data.data.symbolList = [
          //   { symbol: "BTCUSD[BTC]", instrumentId: 6, marginCoin: "BTC" },
          //   { symbol: "BTCAAA[BTC]", instrumentId: 8, marginCoin: "BTC" },
          //   { symbol: "BTCABC[BTC]", instrumentId: 9, marginCoin: "BTC" },
          //   { symbol: "ETHUSD[ETH]", instrumentId: 7, marginCoin: "ETH" },
          //   { symbol: "BTCEXUSD", instrumentId: 22, marginCoin: "EXUSD" }
          // ];
          const symbolObj = {};
          const { coinList } = this.market;
          data.data.symbolList.forEach((item) => {
            const [base, quote] = item.symbol.split('-');
            const citem = { ...item };
            citem.symbol = `${getCoinShowName(base, coinList)}-${getCoinShowName(quote, coinList)}`;
            if (!symbolObj[item.marginCoin]) {
              symbolObj[item.marginCoin] = {};
            }
            symbolObj[item.marginCoin][item.symbol] = citem;
          });
          this.symbolObj = symbolObj;
          const coinSelectList = [];
          const coinListObj = [];
          // let have;
          data.data.coinList.forEach((item) => {
            let active = false;
            if (item.coin === 'USDT') {
              active = true;
            } else if (item.coin === `USDT${this.companyId}`) {
              active = true;
            }
            // eslint-disable-next-line no-param-reassign
            item.showCoin = getCoinShowName(item.coin, this.market.coinList);
            // active = index === 0 ? true : false;
            // console.log(item)
            let str = '';
            if (item.type === 1) {
              str = ` (${this.$t('kol.kolTradersSet.t22')})`;
            }
            coinSelectList.push({
              key: getCoinShowName(item.coin, this.market.coinList) + str,
              value: item.coin,
              active,
            });
            coinListObj[item.coin] = item;
          });
          this.coinSelectList = coinSelectList;
          this.coinListObj = coinListObj;
          this.upDataSymbolList();
        } else {
          this.$bus.$emit('tip', {
            text: data.msg, type: 'error', backgroundColor: '#F6F8FF', textColor: '#16181d',
          });
        }
      });
    },

    tabChange(item) {
      this.currentInfoTab = item.index;
      if (item.index === 2) {
        this.getHistory();
      }
    },
    getHistory() {
      this.axios({
        url: 'v2/kol/history_order',
        hostType: 'coFollow',
        params: {
          page: 1,
          pageSize: 50,
          uid: this.uid,
        },
        method: 'post',
      }).then((data) => {
        if (data.code === '0' || data.code === 0) {
          // this.loadingFlag = false;
          // this.pagination.count = data.data.count;
          const { coinList } = this.market;
          // if (
          //   Math.ceil(
          //     parseFloat(data.data.count) / parseFloat(this.pagination.pageSize),
          //   ) > this.pagination.page
          // ) {
          //   this.pullUpState = 0;
          // } else {
          //   this.pullUpState = 3;
          // }
          data.data.list.forEach((item) => {
            const [base, quote] = item.symbol.split('-');
            // eslint-disable-next-line no-param-reassign
            item.changeSymbol = `${getCoinShowName(base, coinList)}/${getCoinShowName(quote, coinList)}`;
          });
          this.hisData = data.data.list;
        } else {
          this.$bus.$emit('tip', {
            text: data.msg, type: 'error', backgroundColor: '#F6F8FF', textColor: '#16181d',
          });
        }
      });
    },
    // 红色|绿色 样式
    rateClass(v) {
      let str = 'fall-1-cl';
      if (Number(v) >= 0) {
        str = 'rise-1-cl';
      }
      return str;
    },
    // 精度处理
    fixNumber(val, fix) {
      // const showPrecision = this.coinList[fix] ? this.coinList[fix].showPrecision : 8;
      return fixD(val, fix);
    },
  },
};
