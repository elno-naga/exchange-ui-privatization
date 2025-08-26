import {
  myStorage, fixD, fixRate, getCoinShowName, colorMap, imgMap, getCookie, getIconPath,
} from '@/utils';

export default {
  name: 'page-leverAccount',
  data() {
    return {
      isHide: myStorage.get('assets_hide') || false, // 隐藏资产
      tabelLoading: true, // 表格 loading
      imgMap,
      getIconPath,
      colorMap,
      dataList: [], // 表格 数据
      totalBalance: '--', // 资产折合
      totalBalanceSymbol: '', // 资产折合币种
      switchFlag: false, // 是否隐藏零资产
      findValue: '', // 搜索币种
      totalRate: '--', // 折合法币
      loading: false,
      leverMap: {}, // 杠杆账户数据
      lan: getCookie('lan'),
    };
  },
  watch: {
    market(v) {
      if (v) { this.getData(); }
    },
  },
  computed: {
    // 按钮颜色
    colorList_1() {
      return ['main-1-bd main-1-cl', 'main-1-bg main-1-bd text-4-cl', 'main-1-bg main-1-bd text-4-cl'];
    },
    symbolAll() {
      return this.$store.state.baseData.symbolAll;
    },
    showTotalBalanceSymbol() {
      let str = this.totalBalanceSymbol;
      if (this.market && this.market.coinList
        && this.market.coinList[this.totalBalanceSymbol]) {
        str = getCoinShowName(this.totalBalanceSymbol, this.market.coinList);
      }
      return str;
    },
    linkurl() {
      if (this.$store.state.baseData.publicInfo) {
        return this.$store.state.baseData.publicInfo.url;
      }
      return {};
    },
    tradeLinkUrl() {
      if (process.env.NODE_ENV === 'development') {
        return '/ex/margin';
      }
      if (this.$store.state.baseData && this.$store.state.baseData.publicInfo) {
        return `${this.linkurl.exUrl}/${this.lan}/margin`;
      }
      return '';
    },
    // 表格title
    columns() {
      return [
        { key: 'symbol', title: this.$t('assets.leverageAccount.list1'), width: '10%' }, // 杠杆账户
        { key: 'coin', title: this.$t('assets.exchangeAccount.coin'), width: '8%' }, // 币种
        { key: 'total', title: this.$t('assets.leverageAccount.list2'), width: '15%' }, // 总资产
        { key: 'normal', title: this.$t('assets.leverageAccount.list3'), width: '15%' }, // 可用
        // { key: 'freeze', title: this.$t('assets.leverageAccount.list4'), width: '11%' }, // 冻结
        { key: 'borrow', title: this.$t('assets.leverageAccount.list5'), width: '14%' }, // 已借
        { key: 'burstPrice', title: this.$t('assets.leverageAccount.list6'), width: '11%' }, // 爆仓价
        { key: 'risk', title: this.$t('assets.leverageAccount.list7'), width: '6%' }, // 风险率
        { key: 'operation', title: this.$t('assets.leverageAccount.list8'), width: '21%' }, // 操作
      ];
    },
    market() { return this.$store.state.baseData.market; },
    // 资金列表展示到页面数据
    dataListFilter() {
      // 隐藏零资产功能过滤数据
      let list = [];
      if (this.switchFlag) {
        this.dataList.forEach((item) => {
          const { baseTotalBalance, quoteTotalBalance } = item;
          if (parseFloat(baseTotalBalance) || parseFloat(quoteTotalBalance)) {
            list.push(item);
          }
        });
      } else {
        list = this.dataList;
      }
      // 搜索框功能过滤数据
      const newList = [];
      list.forEach((item) => {
        if (item.symbol.indexOf(this.findValue.toUpperCase()) !== -1) {
          newList.push(item);
        }
      });
      return newList;
    },
    // 汇率
    rate() {
      return (this.market && this.market.rate)
        ? this.market.rate : {};
    },
    userCurrency() {
      if (this.rate && this.rate[this.lan]) {
        return this.rate[this.lan].lang_coin;
      }
      return this.rate && this.rate.en_US && this.rate.en_US.lang_coin;
    },
  },
  filters: {
    // 千分符
    thousands(num) {
      if (num) {
        const str = num.toString();
        const reg = str.indexOf('.') > -1 ? /(\d)(?=(\d{3})+\.)/g : /(\d)(?=(?:\d{3})+$)/g;
        return str.replace(reg, '$1,');
      }
      return num;
    },
    getCoinShowName(v, coinList) {
      return getCoinShowName(v, coinList);
    },
  },
  methods: {
    init() {
      if (myStorage.get('assetsSwitch')) {
        this.switchFlag = myStorage.get('assetsSwitch');
      }
      if (this.market) {
        this.getData();
      }
    },
    showLoading(flag) {
      this.loading = flag;
    },
    // 隐藏显示资产
    hideAssets() {
      this.isHide = !this.isHide;
      myStorage.set('assets_hide', this.isHide);
    },
    transferSuccess() {
      this.getData();
    },
    // 操作
    operation(operationType) {
      if (operationType === 'transfer') {
        this.$bus.$emit('openTransfer');
      } else if (operationType === 'flowWater') {
        this.$router.push('/assets/lerverageFlowingWater');
      }
    },
    getData() {
      this.axios({
        url: 'lever/finance/balance',
      }).then((data) => {
        if (data.code.toString() === '0') {
          this.tabelLoading = false;
          const { leverMap } = data.data;
          this.leverMap = leverMap;
          this.setData(data.data);
        }
      });
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
    // 处理列表数据
    setData({ totalBalance, totalBalanceSymbol, leverMap }) {
      this.tabelLoading = false;
      const { coinList, rate, market } = this.market;
      this.totalBalance = fixD(totalBalance, 8); // 折合资产
      this.totalBalanceSymbol = totalBalanceSymbol; // 折合币种
      this.totalRate = fixRate(totalBalance, rate, totalBalanceSymbol); // 折合法币
      const list = [];
      Object.keys(leverMap).forEach((v) => {
        const item = leverMap[v];
        let quoteFix = coinList[item.quoteCoin].showPrecision || 0;
        if (this.symbolAll) {
          quoteFix = this.symbolAll[item.name].price;
        }
        const obj = market[item.quoteCoin][item.name];
        let showSymbol = item.name;
        if (obj) {
          showSymbol = obj.showName || obj.name;
        }
        // getCoinShowName
        const showBaseCoin = getCoinShowName(item.baseCoin, coinList);
        const showQuoteCoin = getCoinShowName(item.quoteCoin, coinList);
        list.push({
          id: item.symbol,
          name: item.name,
          symbol: showSymbol,
          showBaseCoin,
          showQuoteCoin,
          baseTotalBalance: this.thousands(fixD(item.baseTotalBalance, 8)), // 总资产
          quoteTotalBalance: this.thousands(fixD(item.quoteTotalBalance, 8)), // 总资产
          baseNormalBalance: this.thousands(fixD(item.baseNormalBalance, 8)), // 可用
          quoteNormalBalance: this.thousands(fixD(item.quoteNormalBalance, 8)), // 可用
          baseLockBalance: this.thousands(fixD(item.baseLockBalance, 8)), // 冻结
          quoteLockBalance: this.thousands(fixD(item.quoteLockBalance, 8)), // 冻结
          baseBorrowBalance: this.thousands(fixD(item.baseBorrowBalance, 8)), // 已借
          quoteBorrowBalance: this.thousands(fixD(item.quoteBorrowBalance, 8)), // 已借
          burstPrice: Number(item.riskRate) > 999 ? '--' : `${this.thousands(fixD(item.burstPrice, quoteFix))} ${showQuoteCoin}`, // 爆仓价
          risk: item.riskRate ? `${Number(item.riskRate) > 999 ? 999 : item.riskRate}%` : '--', // 风险率
          operation: [
            {
              text: this.$t('assets.leverageAccount.transfer'), // 划转
              type: 'transfer',
            },
            {
              text: this.$t('assets.leverageAccount.ToLoan'), // 借贷
              type: 'toLoan',
            },
            {
              text: this.$t('assets.exchangeAccount.trade'), // 交易
              type: 'trade',
            },
          ],
        });
      });
      this.dataList = list;
    },
    // 隐藏零资产
    findChanges(v) {
      this.findValue = v;
    },
    switchChange() {
      this.switchFlag = !this.switchFlag;
      myStorage.set('assetsSwitch', this.switchFlag);
    },
    tableClick(type, data) {
      const { id, name } = data;
      if (type === 'transfer') {
        this.$bus.$emit('openTransfer', name, name.split('/')[0], id);
      } else if (type === 'toLoan') {
        this.$router.push(`/assets/leverageToLoan?symbol=${id}`);
      } else if (type === 'trade') {
        const symbol = name;
        if (symbol.toString().indexOf('/') === -1) { return; }
        const arr = symbol.split('/');
        window.location.href = `${this.tradeLinkUrl}/${arr[0]}_${arr[1]}`;
      }
    },
  },
};
