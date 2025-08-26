import {
  fixD, fixInput, formatTime, getCoinShowName, colorMap, imgMap, myStorage, getIconPath,
} from '@/utils';

export default {
  name: 'page-withdraw',
  data() {
    return {
      getIconPath,
      tabelLoading: true,
      imgMap,
      colorMap,
      tabelList: [],
      paginationObj: {
        total: 0, // 数据总条数
        display: 10, // 每页显示条数
        currentPage: 1, // 当前页码
      },
      messData: {}, // 当前币对信息
      broCoin: '', // 当前借贷的币种
      broNum: '', // 借贷数量
      btnLoading: false, // loading
      dataList: {},
      coinHover: null,
      iconHover: false,
      loading: false,
      leverMap: {},
      subContent: [], // 展开的数据
      subContentId: null, // 展开的id
    };
  },
  filters: {
    fixDFn(v, that, type) {
      return fixD(v, that.coinFix[type]);
    },
    fixDFnTwo(v, type) {
      return fixD(v, type);
    },
    rateFix(v) {
      const data = v || 0;
      return `${fixD(data * 100, 2)}%`;
    },
    getCoinShowName(v, coinList) {
      return getCoinShowName(v, coinList);
    },
  },
  watch: {
    messData(v) {
      if (Object.keys(v).length) {
        const broCoin = myStorage.get('broCoin');
        if (broCoin) {
          this.broCoin = broCoin;
        } else {
          this.broCoin = v.baseCoin;
        }

        if (Object.keys(this.market).length) {
          this.getTableList();
        }
      }
    },
    market(v) {
      if (Object.keys(v).length && Object.keys(this.messData).length) {
        this.getTableList();
      }
    },
    broNum(v) {
      // const type = this.broCoin === this.messData.baseCoin ? 'base' : 'quote';
      // this.broNum = fixInput(v, this.coinFix[type]);
      this.broNum = fixInput(v, 8);
    },
  },
  computed: {
    btnDisabled() {
      let flag = true;
      if (this.broErrorObj.flag || this.btnLoading) {
        flag = false;
      }
      return flag;
    },
    // 借贷币种的信息
    broMessage() {
      const obj = {
        total: '0', // 总额度
        can: '0', // 可借
        borrowed: '0', // 已借
        type: 'base',
        min: '0', // 最小借贷量
      };
      const {
        baseCoin,
        baseTotalBorrow,
        baseCanBorrow,
        baseBorrowBalance,
        baseMinBorrow,
        quoteCoin,
        quoteTotalBorrow,
        quoteCanBorrow,
        quoteBorrowBalance,
        quoteMinBorrow,
      } = this.messData;
      if (this.broCoin === baseCoin) {
        obj.total = baseTotalBorrow || 0;
        obj.can = baseCanBorrow || 0;
        obj.borrowed = baseBorrowBalance || 0;
        obj.type = 'base';
        obj.min = baseMinBorrow || 0;
      } else if (this.broCoin === quoteCoin) {
        obj.total = quoteTotalBorrow || 0;
        obj.can = quoteCanBorrow || 0;
        obj.borrowed = quoteBorrowBalance || 0;
        obj.type = 'quote';
        obj.min = quoteMinBorrow || 0;
      }
      return obj;
    },
    // market 接口
    market() { return this.$store.state.baseData.market || {}; },
    coinList() {
      return this.market && this.market.coinList;
    },
    // 表格title
    columns() {
      return [
        { key: 'coin', title: this.$t('assets.leverageToLoan.list3'), width: '15%' }, // 币种
        { key: 'account', title: this.$t('assets.leverageToLoan.list2'), width: '13%' }, // 杠杆账户
        { key: 'time', title: this.$t('assets.leverageToLoan.list1'), width: '13%' }, // 申请时间
        { key: 'amount', title: this.$t('assets.leverageToLoan.list4'), width: '13%' }, // 数量
        { key: 'rate', title: this.$t('assets.leverageToLoan.list5'), width: '10%' }, // 利率
        { key: 'interest', title: this.$t('assets.leverageToLoan.list6'), width: '13%' }, // 未还利息
        { key: 'oweAmount', title: this.$t('assets.leverageToLoan.list7'), width: '10%' }, // 未还数量
        { key: 'operation', title: this.$t('assets.leverageToLoan.list8'), width: '13%' }, // 操作
      ];
    },
    subColumns() {
      return [
        { key: 'coin', title: this.$t('assets.leverageToLoan.list3') }, // 币种
        { key: 'time', title: this.$t('order.exchangeOrder.detailsTime') }, // 时间
        { key: 'volume', title: this.$t('order.exchangeOrder.detailsVolume') }, // 数量
        { key: 'type', title: this.$t('assets.flowingWater.type') }, // 类型
      ];
    },
    coinFix() {
      const { coinList } = this.market;
      const obj = {
        base: 0,
        quote: 0,
      };
      if (coinList && Object.keys(this.messData).length) {
        const { baseCoin, quoteCoin } = this.messData;
        if (coinList[baseCoin]) {
          obj.base = coinList[baseCoin].showPrecision;
        }
        if (coinList[quoteCoin]) {
          obj.quote = coinList[quoteCoin].showPrecision;
        }
      }
      return obj;
    },
    broWarningText() {
      const { can } = this.broMessage;
      // const type = this.broCoin === this.messData.baseCoin ? 'base' : 'quote';
      // const num = fixD(can, this.coinFix[type]);
      const num = fixD(can, 8);
      // const num = fixD(can, 3);
      return `${this.$t('assets.leverageToLoan.canToLoan')} ${num}
        ${this.getShowCoin(this.broCoin)}`;
    },
    broErrorObj() {
      const obj = {
        flag: false, // 是否通过验证
        text: '', // 错误文案
        showError: false, // 是否提示错误
      };
      if (Number(this.broNum) === 0) {
        obj.flag = false;
        obj.text = '';
        obj.showError = false;
      } else if (Number(this.broNum) > Number(this.broMessage.can)) {
        obj.flag = false;
        // 借贷数量不得大于可借贷数量
        obj.text = this.$t('assets.leverageToLoan.inputError1');
        obj.showError = true;
      } else if (Number(this.broNum) < Number(this.broMessage.min)) {
        obj.flag = false;
        const { min, type } = this.broMessage;
        const num = fixD(min, this.coinFix[type]);
        // 借贷数量不得小于
        const str = this.$t('assets.leverageToLoan.inputError2');
        obj.text = `${str} ${num} ${this.broCoin}`;
        obj.showError = true;
      } else {
        obj.flag = true;
        obj.text = '';
        obj.showError = false;
      }
      return obj;
    },
  },
  methods: {
    init() {
      // 如果不存在币种跳走
      if (this.$route.query.symbol) {
        this.symbol = this.$route.query.symbol.toUpperCase();
      } else {
        this.$router.push('/assets/leverageAccount');
        return;
      }
      myStorage.remove('broCoin');
      this.getData();
      if (Object.keys(this.market).length && Object.keys(this.messData).length) {
        this.getTableList();
      }
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
        this.$router.back();
      }
    },
    getShowSymbol(v) {
      if (!this.market) return v;
      const { market } = this.market;
      let showSymbol = v;
      if (this.market && market) {
        const obj = market[this.messData.quoteCoin][this.messData.name];
        showSymbol = obj.showName || obj.name;
      }
      return showSymbol;
    },
    getShowCoin(v) {
      if (!this.market) return v;
      const { coinList } = this.market;
      let str = v;
      if (this.market && coinList) {
        str = getCoinShowName(v, coinList);
      }
      return str;
    },
    rateFixFn(v) {
      return `${fixD(v * 100, 2)}%`;
    },
    // 全部借贷
    allBro() {
      this.broNum = this.broMessage.can;
    },
    transferSuccess() {
      this.getData();
    },
    repaymentSuccess() {
      this.getData();
      this.getTableList();
    },
    lookAll() {
      this.$router.push('/assets/lerverageFlowingWater');
    },
    getData() {
      const params = {
        symbol: this.symbol,
      };
      this.axios({
        url: 'lever/finance/symbol/balance',
        params,
      }).then((data) => {
        if (data.code.toString() === '0') {
          this.messData = data.data;
        }
      });
    },
    // 分页器
    pagechange(v) {
      this.paginationObj.currentPage = v;
      this.getTableList();
    },
    showLoading(flag) {
      this.loading = flag;
    },
    // 获取杠杆账户币种
    getLeverMap(callback) {
      this.loading = true;
      this.axios({
        url: 'lever/finance/balance',
      }).then((data) => {
        this.loading = false;
        if (data.code.toString() === '0') {
          const { leverMap } = data.data;
          this.leverMap = leverMap;
          if (callback) {
            callback();
          }
        }
      });
    },
    // 划转
    transfer(coin) {
      this.getLeverMap(() => {
        this.$bus.$emit('openTransfer', this.messData.name, coin, this.messData.symbol);
      });
    },
    // 修改借贷币种
    setBroCoin(v) {
      if (this.broCoin === v) return;
      this.broCoin = v;
      this.broNum = '';
    },
    inputChange(v, name) {
      this[name] = v;
    },
    // 借贷点击
    broClick() {
      this.btnLoading = true;
      this.axios({
        url: 'lever/finance/borrow',
        params: {
          symbol: this.symbol,
          coin: this.broCoin,
          amount: this.broNum,
        },
      }).then((data) => {
        this.btnLoading = false;
        if (data.code.toString() === '0') {
          myStorage.set('broCoin', this.broCoin);
          this.getData();
          this.getTableList();
          this.$bus.$emit('tip', { text: data.msg, type: 'success' });
          this.broNum = '';
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
    tableClick(type, data) {
      if (type === 'repayment') {
        const Did = data.split('_')[1];
        const obj = this.dataList[Did];
        this.$bus.$emit('openRepayment', obj);
      } else if (type === 'detail') {
        this.getSubTableData(data);
      }
    },
    // 查看详情
    getSubTableData(v) {
      if (this.subContentId === v) {
        this.subContentId = null;
      } else {
        const sp = v.split('_');
        const vID = Number(sp[1]);
        this.loading = true;
        this.subContent = [];
        this.axios({
          url: 'lever/return/info',
          method: 'post',
          params: {
            id: vID.toString(),
            pageSize: 10000,
          },
        }).then((data) => {
          this.loading = false;
          if (data.code.toString() === '0') {
            const list = [];
            data.data.financeList.forEach((item) => {
              const returnFix = 8;
              list.push({
                time: formatTime(Number(item.repaymentTime)),
                coin: this.getShowCoin(item.coin),
                volume: fixD(item.returnMoney, returnFix),
                type: this.typeText(item.type.toString()),
              });
            });
            this.subContentId = v;
            this.subContent = list;
          } else {
            this.$bus.$emit('tip', { text: data.msg, type: 'error' });
          }
        });
      }
    },
    typeText(v) {
      let str = '';
      switch (v) {
        case '1':
          str = this.$t('assets.leverageToLoan.typeText1');
          break;
        case '2':
          str = this.$t('assets.leverageToLoan.typeText2');
          break;
        default:
          str = this.$t('assets.leverageToLoan.typeText3');
      }
      return str;
    },
    // 千分符
    thousands(num) {
      if (num) {
        const str = num.toString();
        const reg = str.indexOf('.') > -1 ? /(\d)(?=(\d{3})+\.)/g : /(\d)(?=(?:\d{3})+$)/g;
        return str.replace(reg, '$1,');
      }
      return num;
    },
    getTableList() {
      this.axios({
        url: 'lever/borrow/new',
        params: {
          pageSize: this.paginationObj.display, // 每页条数
          page: this.paginationObj.currentPage, // 页码
          symbol: this.symbol,
        },
      }).then((data) => {
        if (data.code.toString() === '0') {
          this.tabelLoading = false;
          const { count, financeList } = data.data;
          const list = [];
          financeList.forEach((item) => {
            const fix = 8;
            const returnFix = 8;
            this.dataList[item.id] = item;
            list.push({
              symbol: item.symbol,
              id: `${item.symbol}_${item.id}`,
              coin: item.coin.toUpperCase(),
              account: item.showName || item.symbol.toUpperCase(),
              time: formatTime(Number(item.ctime)),
              amount: this.thousands(fixD(item.borrowMoney, fix)),
              rate: `${item.interestRate}%`,
              interest: this.thousands(fixD(item.oweInterest, returnFix)),
              oweAmount: this.thousands(fixD(item.oweAmount, returnFix)),
              operation: [
                {
                  type: 'detail',
                  text: this.$t('order.exchangeOrder.details'), // 详情
                },
                {
                  type: 'repayment',
                  text: this.$t('assets.lerverageFlowingWater.repayment'), // 归还
                },
              ],
            });
          });
          this.tabelList = list;
          this.paginationObj.total = count > 30 ? 30 : count;
        }
      });
    },
  },
};
