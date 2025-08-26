import {
  myStorage, fixD, fixRate, fixInput, colorMap, imgMap, getCookie,
  getCoinShowName, getIconPath,
} from '@/utils';

export default {
  name: 'page-otcAccount',
  data() {
    return {
      isHide: myStorage.get('assets_hide') || false, // 隐藏资产
      imgMap,
      colorMap,
      getIconPath,
      tabelLoading: true, // 表格 loading
      dataList: [], // 表格 数据
      totalBalance: '--', // 资产折合
      totalBalanceSymbol: '', // 资产折合币种
      totalRate: '--', // 资产折合汇率
      switchFlag: false, // 是否隐藏零资产
      findValue: '', // 搜索币种
      colors: [
        'rgba(255, 255, 255, 1)',
        'rgba(255, 255, 255, 0.8)',
        'rgba(255, 255, 255, 0.6)',
        'rgba(255, 255, 255, 0.4)',
        'rgba(255, 255, 255, 0.25)',
        'rgba(255, 255, 255, 0.1)',
      ],
      transferLoading: false,
      showTransfer: false, // 划转弹窗
      transferSide: 1, // 划转方向 1 币币-其他账户 2 其他账户-币币
      otcCoinList: [], // Otc币种列表
      transferCoin: '', // 划转币种
      transferNum: '', // 划转数量
      otcMap: {}, // otc币对
      lan: getCookie('lan'),
    };
  },
  computed: {
    isCoOpen() {
      const base = this.$store.state.baseData.publicInfo;
      if (base && base.switch && base.switch.indep_co_switch === '1') {
        return true;
      }
      return false;
    },
    mainAccountName() {
      const ex = this.isCoOpen ? this.$t('assets.index.coExchangeAccount') : this.$t('assets.index.exchangeAccount');
      return ex;
    },
    // 按钮颜色
    colorList_1() {
      return ['main-1-bd main-1-cl', 'main-1-bg main-1-bd text-4-cl', 'main-1-bg main-1-bd text-4-cl'];
    },
    // input框警示文案
    transferWarningText() {
      const text = this.$t('assets.otcAccount.can'); // 可转
      const num = this.transferSide === 1 ? this.exchangeAvailable : this.otherAvailable;
      return `${text}${num} ${this.getShowCoin(this.transferCoin)}`;
    },
    transferError() {
      let flag = false;
      // 限制最大数量
      if (this.transferSide === 1) {
        if (parseFloat(this.transferNum) > parseFloat(this.exchangeAvailable)) {
          flag = true;
        }
      } else if (this.transferSide === 2) {
        if (parseFloat(this.transferNum) > parseFloat(this.otherAvailable)) {
          flag = true;
        }
      }
      return flag;
    },
    // 表格title
    columns() {
      return [
        { key: 'coin', title: this.$t('assets.otcAccount.coin'), width: '28%' }, // 币种
        {
          key: 'normal', title: this.$t('assets.otcAccount.Available'), width: '28%', sortable: true,
        }, // 可用
        { key: 'freeze', title: this.$t('assets.otcAccount.freeze'), width: '28%' }, // 冻结
        { key: 'operation', title: this.$t('assets.otcAccount.options'), width: '16%' }, // 操作
      ];
    },
    market() { return this.$store.state.baseData.market; },
    coinList() {
      return this.market && this.market.coinList;
    },
    // 资金列表展示到页面数据
    dataListFilter() {
      // 隐藏零资产功能过滤数据
      let list = [];
      if (this.switchFlag) {
        this.dataList.forEach((item) => {
          if (parseFloat(item.btcValuation) >= 0.0001) {
            list.push(item);
          }
        });
      } else {
        list = this.dataList;
      }
      // 搜索框功能过滤数据
      const newList = [];
      list.forEach((item) => {
        if (item.coinShowName.toUpperCase().indexOf(this.findValue.toUpperCase()) !== -1) {
          newList.push(item);
        }
      });
      return newList;
    },
    transferDisabled() {
      return !Number(this.transferNum) || !this.transferCoin || this.transferError;
    },
    linkurl() {
      if (this.$store.state.baseData.publicInfo) {
        return this.$store.state.baseData.publicInfo.url;
      }
      return {};
    },
    transferBalance() {
      if (this.transferCoin) {
        const fix = this.market.coinList[this.transferCoin].showPrecision;
        const exchange = this.otcMap.find((item) => item.coinSymbol === this.transferCoin);
        const otherAvailable = this.otcMap.find((item) => item.coinSymbol === this.transferCoin);
        return {
          exchangeAvailable: fixD(exchange.exchangeNormal, fix),
          otherAvailable: fixD(otherAvailable.normal, fix),
        };
      }
      return {
        exchangeAvailable: '--',
        otherAvailable: '--',
      };
    },
    // 现货账户可用
    exchangeAvailable() {
      return this.transferBalance.exchangeAvailable;
    },
    // 其他账户可用
    otherAvailable() {
      return this.transferBalance.otherAvailable;
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
  watch: {
    market(v) { if (v) { this.sendOtcAxios(); } },
    transferNum(v) {
      if (v) {
        const { coinList } = this.market;
        const fix = (coinList[this.transferCoin] && coinList[this.transferCoin].showPrecision) || 0;
        // 限制精度和不非数字字符
        this.transferNum = fixInput(v, fix);
      }
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
    // 隐藏显示资产
    hideAssets() {
      this.isHide = !this.isHide;
      myStorage.set('assets_hide', this.isHide);
    },
    getShowCoin(v) {
      let str = v;
      if (this.market && this.market.coinList) {
        str = getCoinShowName(v, this.market.coinList);
      }
      return str;
    },
    init() {
      if (myStorage.get('assetsSwitch')) {
        this.switchFlag = myStorage.get('assetsSwitch');
      }
      if (this.market) { this.sendOtcAxios(); }
    },
    // 操作
    operation(operationType) {
      if (operationType === 'transfer') {
        this.showTransfer = true;
        if (!this.transferCoin) {
          this.transferCoin = this.otcCoinList[0].code;
        }
      } else if (operationType === 'buy' || operationType === 'sell') {
        window.location.href = `${this.linkurl.otcUrl}/${this.lan}?side=${operationType.toUpperCase()}`;
      } else if (operationType === 'flowWater') {
        this.$router.push('/assets/otcFlowingWater');
      }
    },
    // 调整划转方向
    changeTransferSide() {
      this.transferNum = '';
      if (this.transferSide === 1) {
        this.transferSide = 2;
      } else {
        this.transferSide = 1;
      }
    },
    // 关闭划转弹窗
    closeTransfer() {
      this.showTransfer = false;
      this.transferNum = '';
      this.transferSide = 1;
    },
    // 全部
    transferAll() {
      if (this.transferSide === 1) {
        this.transferNum = this.exchangeAvailable;
      } else {
        this.transferNum = this.otherAvailable;
      }
    },
    inputLineChange(value, name) {
      this[name] = value;
    },
    confirmTransfer() {
      this.transferLoading = true;
      this.axios({
        url: 'finance/otc_transfer',
        params: {
          fromAccount: this.transferSide === 1 ? '1' : '2',
          toAccount: this.transferSide === 1 ? '2' : '1',
          amount: this.transferNum,
          coinSymbol: this.transferCoin,
        },
        method: 'post',
      }).then((data) => {
        this.transferLoading = false;
        if (data.code.toString() === '0') {
          this.$bus.$emit('tip', { text: data.msg, type: 'success' });
          this.transferNum = '';
          this.transferSide = 1;
          this.showTransfer = false;
          this.sendOtcAxios(); // 重新获取数据
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
    // 获取列表
    sendOtcAxios() {
      this.axios({
        url: 'finance/v4/otc_account_list',
      }).then((data) => {
        this.tabelLoading = false;
        if (data.code.toString() === '0') {
          this.setData(data.data);
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
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
    setData({ totalBalance, totalBalanceSymbol, allCoinMap }) {
      const { coinList, rate } = this.market;
      const FFix = (coinList[totalBalanceSymbol]
        && coinList[totalBalanceSymbol].showPrecision) || 0;
      this.totalBalance = fixD(totalBalance, FFix); // 折合资产
      this.totalBalanceSymbol = totalBalanceSymbol; // 折合币种
      this.totalRate = fixRate(totalBalance, rate, totalBalanceSymbol); // 折合法币
      const btcFix = (coinList[totalBalanceSymbol]
        && coinList[totalBalanceSymbol].showPrecision) || 0;
      const list = [];
      const otcCoinList = [];
      allCoinMap.forEach((item) => {
        const fix = (coinList[item.coinSymbol] && coinList[item.coinSymbol].showPrecision) || 0;
        list.push({
          id: JSON.stringify(item),
          btcValuation: fixD(item.btcValuation, btcFix),
          coin: item.coinSymbol,
          coinShowName: getCoinShowName(item.coinSymbol, coinList),
          normal: fixD(item.normal, fix),
          freeze: this.thousands(fixD(item.lock, fix)),
          operation: this.$t('assets.otcAccount.optionCapitalTransfer'),
        });
        // 处理OTC币种数据
        otcCoinList.push({
          img: coinList[item.coinSymbol].icon,
          code: item.coinSymbol,
          value: getCoinShowName(item.coinSymbol, coinList),
        });
      });
      this.otcMap = allCoinMap;
      this.dataList = list;
      this.otcCoinList = otcCoinList;
    },
    // 修改
    selectChange(item, name) {
      this[name] = item.code;
    },
    inputChange(value, name) {
      this[name] = value;
    },
    // 隐藏零资产
    findChanges(v) {
      this.findValue = v;
    },
    switchChange() {
      this.switchFlag = !this.switchFlag;
      myStorage.set('assetsSwitch', this.switchFlag);
    },
    tableClick(item) {
      this.transferCoin = item.coin;
      this.showTransfer = true;
    },
  },
};
