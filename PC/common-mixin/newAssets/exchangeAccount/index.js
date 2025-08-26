import {
  myStorage, fixD, fixRate, getCoinShowName, colorMap, imgMap, getCookie, fixInput, getIconPath,
} from '@/utils';

export default {
  name: 'page-exchangeAccount',
  props: {
    navList: Array,
  },
  data() {
    return {
      isHide: myStorage.get('assets_hide') || false, // 隐藏资产
      tabelLoading: true,
      exchangeHeader: `background: url(${imgMap.zc_ex})`,
      tabelLength: 20,
      imgMap,
      getIconPath,
      colorMap,
      switchFlag: false, // 是否隐藏零资产
      findValue: '', // 搜索框内容
      dataList: [],
      totalBalance: '--', // 总资产折合
      totalRate: '--', // 折合法币
      totalBalanceSymbol: '', // 总资产折合单位
      havePosition: false, // 平台锁仓
      positionV2: false, // 代币锁仓
      positionV3: false, // 理财锁仓
      searchTimer: null,
      searchListResult: [],
      search: false,
      isShowDialog: false,
      lan: getCookie('lan'),
      transferLoading: false,
      showTransfer: false, // 划转弹窗
      transferAccount: '', // 划转账户
      transferSide: 1, // 划转方向 1 币币-其他账户 2 其他账户-币币
      transferSymbol: '', // 划转币对
      otcCoinList: [], // Otc币种列表
      leverCoinList: [], // 杠杆币种列表
      coCoinList: [], // 合约币种列表
      coinDetail: [], // 币种详情
      transferCoin: '', // 划转币种
      transferNum: '', // 划转数量
      symbolList: [], // 币对
      leverMap: {}, // 杠杆币对
      otcMap: {}, // otc币对
      coMap: {}, // co币对
      tradeSelectShow: null,
      tradeItemHover: null,
      leverSymbol: '', // 杠杆币对
      leverSymbolBalance: {},
      // 币币可转
      exchangeAmount: null,
      // 合约可转
      contractAmount: null,
      marginCoinInfor: {}, // 币种信息
      marginCoinList: [], // 保证金币种列表
    };
  },
  computed: {
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
    // 按钮颜色
    colorList_1() {
      return ['main-1-bd main-1-cl', 'main-1-bg main-1-bd text-4-cl', 'main-1-bg main-1-bd text-4-cl'];
    },
    C_data() {
      const datas = this.search ? this.searchListResult : this.dataList;
      let dataList = [];
      if (this.switchFlag) {
        dataList = datas.filter((item) => item.btcValuation >= 0.0001);
      } else {
        dataList = [...datas];
      }
      return dataList;
    },
    publicInfo() {
      return this.$store.state.baseData.publicInfo;
    },
    creditCardOpen() {
      let flag = false;
      if (this.publicInfo && this.publicInfo.switch
        && this.publicInfo.switch.credit_crad_switch
        && this.publicInfo.switch.credit_crad_switch.toString() === '1') {
        flag = true;
      }
      return flag;
    },
    baseData() {
      return this.$store.state.baseData.publicInfo;
    },
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
    // 提现是否开启了必须实名认证
    withdrawKycOpen() {
      let isOpen = 0;
      if (this.baseData && this.baseData.kycLimitConfig) {
        isOpen = this.baseData.kycLimitConfig.withdraw_kyc_open;
      }
      return Number(isOpen);
    },
    // 充值是否开启了必须实名认证
    depositeKycOpen() {
      let isOpen = 0;
      if (this.baseData && this.baseData.kycLimitConfig) {
        isOpen = this.baseData.kycLimitConfig.deposite_kyc_open;
      }
      return Number(isOpen);
    },
    // 用户信息
    userInfo() {
      return this.$store.state.baseData.userInfo;
    },
    isShowWithdraw() {
      let bol = true;
      if (this.userInfo && this.userInfo.isSub) {
        bol = false;
      }
      return bol;
    },
    // 认证信息
    idAuth() {
      let idAuth = 0;
      if (this.userInfo) {
        idAuth = Number(this.userInfo.authLevel);
      }
      return idAuth;
    },
    linkurl() {
      if (this.$store.state.baseData.publicInfo) {
        return this.$store.state.baseData.publicInfo.url;
      }
      return {};
    },
    tradeLinkUrl() {
      if (process.env.NODE_ENV === 'development') {
        return this.isCoOpen ? '/co/trade' : '/ex/trade';
      }
      if (this.$store.state.baseData && this.$store.state.baseData.publicInfo) {
        return this.isCoOpen ? `${this.linkurl.coUrl}/trade` : `${this.linkurl.exUrl}/trade`;
      }
      return '';
    },
    // market 接口
    market() {
      return this.$store.state.baseData.market;
    },
    coinList() {
      return this.market && this.market.coinList;
    },
    rate() {
      return (this.market && this.market.rate)
        ? this.market.rate : {};
    },
    // 表格title
    columns() {
      let arr = [];
      if (this.havePosition || this.positionV2 || this.positionV3) {
        arr = [{ key: 'lock', title: this.$t('assets.exchangeAccount.position') }];
      }
      return [
        { key: 'coin', title: this.$t('assets.exchangeAccount.coin') }, // 币种
        { key: 'total', title: this.$t('assets.exchangeAccount.lumpSum'), sortable: true }, // 总额
        { key: 'normal', title: this.$t('assets.exchangeAccount.Available'), sortable: true }, // 可用
        { key: 'freeze', title: this.$t('assets.exchangeAccount.freeze') }, // 冻结
        ...arr,
        {
          key: 'fold',
          title: `${this.$t('assets.exchangeAccount.AssetFolding')}(${this.showTotalBalanceSymbol
          })`,
        }, // 资产折合
        { key: 'operation', title: this.$t('assets.exchangeAccount.options'), width: '200px' }, // 操作
      ];
    },
    // finance/account_balance 接口返回成功的数据
    exchangeData() {
      return this.$store.state.assets.exchangeData;
    },
    showTotalBalanceSymbol() {
      let str = this.totalBalanceSymbol;
      if (
        this.market
        && this.market.coinList
        && this.market.coinList[this.totalBalanceSymbol]
      ) {
        str = getCoinShowName(this.totalBalanceSymbol, this.market.coinList);
      }
      return str;
    },
    // 开了C2C
    otcOpen() {
      return this.linkurl.otcUrl || this.saasOtcFlowConfig;
    },
    // 可划转账户
    transferList() {
      const arr = [];
      if (this.otcOpen) {
        arr.push({
          value: this.$t('assets.index.otcAccount'),
          code: 'c2c',
        });
      }
      if (this.leverOpen === 1) {
        arr.push({
          value: this.$t('assets.index.leverage'),
          code: 'lever',
        });
      }
      if (this.linkurl.coUrl) {
        arr.push({
          value: this.$t('assets.index.coAccount'),
          code: 'co',
        });
      }
      return arr;
    },
    // 币种列表
    transferCoinList() {
      if (this.transferAccount === 'c2c') {
        return this.otcCoinList;
      }
      if (this.transferAccount === 'lever') {
        return this.leverCoinList;
      }
      if (this.transferAccount === 'co') {
        return this.coCoinList;
      }
      return [];
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
    transferDisabled() {
      if (this.transferAccount === 'co') {
        return this.dialogConfirmDisabled;
      }
      return !Number(this.transferNum) || !this.transferCoin || this.transferError;
    },
    leverOpen() {
      return this.$store.state.baseData.lever_open;
    },
    saasOtcFlowConfig() {
      let flag = false;
      if (this.publicInfo && this.publicInfo.switch
        && this.publicInfo.switch.saas_otc_flow_config
        && this.publicInfo.switch.saas_otc_flow_config.toString() === '1') {
        flag = true;
      }
      return flag;
    },
    transferBalance() {
      if (this.transferCoin && this.market.coinList[this.transferCoin]) {
        const fix = this.market.coinList[this.transferCoin].showPrecision;
        if (this.transferAccount === 'c2c') {
          const exchange = this.otcMap.find((item) => item.coinSymbol === this.transferCoin);
          const otherAvailable = this.otcMap.find((item) => item.coinSymbol === this.transferCoin);
          return {
            exchangeAvailable: fixD(exchange.exchangeNormal, fix),
            otherAvailable: fixD(otherAvailable.normal, fix),
          };
        }
        if (this.transferAccount === 'lever') {
          const symbolItem = this.leverSymbolBalance;
          if (this.transferCoin === symbolItem.baseCoin) {
            return {
              exchangeAvailable: fixD(symbolItem.baseExNormalBalance, fix),
              otherAvailable: fixD(symbolItem.baseCanTransfer, fix),
            };
          }
          return {
            exchangeAvailable: fixD(symbolItem.quoteEXNormalBalance, fix),
            otherAvailable: fixD(symbolItem.quoteCanTransfer, fix),
          };
        }
        if (this.transferAccount === 'co') {
          return {
            exchangeAvailable: this.canTransferNumber.ex,
            otherAvailable: this.canTransferNumber.co,
          };
        }
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
    // 其他账户资产
    otherAvailable() {
      return this.transferBalance.otherAvailable;
    },
    userCurrency() {
      const lan = this.isSaleBol ? 'ja_JP' : this.lan;
      if (this.rate && this.rate[lan]) {
        return this.rate[lan].lang_coin;
      }
      return this.rate && this.rate.en_US && this.rate.en_US.lang_coin;
    },
    // 合约币种精度
    showPrecision() {
      if (this.marginCoinInfor && this.transferCoin && this.transferAccount === 'co') {
        return this.marginCoinInfor[this.transferCoin].marginCoinPrecision;
      }
      return 4;
    },
    // 限制转入
    fundsInStatus() {
      if (this.marginCoinInfor && this.transferCoin) {
        return this.marginCoinInfor[this.transferCoin].fundsInStatus;
      }
      return false;
    },
    // 限制转出
    fundsOutStatus() {
      if (this.marginCoinInfor && this.transferCoin) {
        return this.marginCoinInfor[this.transferCoin].fundsOutStatus;
      }
      return false;
    },
    // 弹窗是否可点击
    dialogConfirmDisabled() {
      if (this.transferLoading) { return false; }
      let flag = true;
      if (parseFloat(this.transferNum) > 0 && !this.transferError) {
        flag = false;
      }
      if (this.marginCoinInfor && this.transferCoin) {
        if (this.transferSide === 1) {
          if (this.transferCoin && !this.fundsInStatus) {
            flag = true;
          }
        } else if (this.transferSide === 2) {
          if (this.transferCoin && !this.fundsOutStatus) {
            flag = true;
          }
        }
      }
      return flag;
    },
    // 限制划转
    confirmText() {
      let text = this.$t('futures.transfer.confirm'); // 确定
      if (this.marginCoinInfor && this.transferCoin) {
        if (this.transferSide === 1 && this.transferCoin && !this.fundsInStatus) {
          text = this.$t('futures.transfer.cantIn'); // 限制转入
        }
        if (this.transferSide === 2 && this.transferCoin && !this.fundsOutStatus) {
          text = this.$t('futures.transfer.cantOut'); // 限制转出
        }
      }
      return text;
    },
    // 合约可划转
    canTransferNum() {
      if (this.marginCoinInfor && this.transferCoin) {
        if (this.transferSide === 1) {
          return fixD(this.exchangeAmount, this.showPrecision);
        }
        return fixD(this.contractAmount, this.showPrecision);
      }
      return '--';
    },
    // 合约和币币可划转
    canTransferNumber() {
      let ex = '0.00';
      let co = '0.00';
      if (this.marginCoinInfor && this.transferCoin) {
        if (this.exchangeAmount) {
          ex = fixD(this.exchangeAmount, this.showPrecision);
        }
        co = fixD(this.contractAmount, this.showPrecision);
      }
      return {
        ex,
        co,
      };
    },
  },
  watch: {
    exchangeData(v) {
      if (v && this.market) {
        this.setData();
      }
    },
    market(v) {
      if (v && this.exchangeData) {
        this.setData();
      }
    },
    // 划账账户改变
    transferAccount(val, oldVal) {
      if (val !== oldVal) {
        this.transferCoin = '';
        this.transferNum = '';
        this.transferSymbol = '';
      }
      if (val === 'lever') {
        this.transferSymbol = this.symbolList[0].code;
        this.leverSymbol = this.symbolList[0].symbol;
      }
    },
    // 划转币对改变
    transferSymbol(val) {
      if (val) {
        const symbolItem = this.leverMap[val];
        const { baseCoin, quoteCoin } = symbolItem;
        const { coinList } = this.market;
        this.leverCoinList = [
          {
            img: coinList[baseCoin].icon,
            code: baseCoin,
            value: getCoinShowName(baseCoin, coinList),
          },
          {
            img: coinList[quoteCoin].icon,
            code: quoteCoin,
            value: getCoinShowName(quoteCoin, coinList),
          },
        ];
      } else {
        this.leverCoinList = [];
      }
    },
    transferCoin(v, oldV) {
      if (v !== oldV) {
        this.transferNum = '';
      }
      if (this.transferAccount === 'co' && v) {
        this.getCoAccount();
      }
    },
    // 币种数量精度处理
    transferNum(v) {
      if (v) {
        const { coinList } = this.market;
        const { transferCoin } = this;
        const fix = (coinList[transferCoin] && coinList[transferCoin].showPrecision) || 0;
        // 限制精度和不非数字字符
        this.transferNum = fixInput(v, fix);
      }
    },
    leverSymbol(v) {
      if (v) {
        this.getLeverBalance();
      }
    },
    transferCoinList: {
      handler(v) {
        if (v && v.length) {
          this.transferCoin = v[0].code;
        } else {
          this.transferCoin = '';
        }
      },
      deep: true,
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
    init() {
      if (myStorage.get('assetsSwitch')) {
        this.switchFlag = myStorage.get('assetsSwitch');
      }
      this.$store.dispatch('assetsExchangeData');
      if (this.exchangeData && this.market) {
        this.setData();
      }
    },
    fixRate(balance) {
      const fold = fixRate(balance, this.rate, 'USDT');
      if (fold !== '--') {
        return fold.slice(1);
      }
      return fold;
    },
    showLoading(flag) {
      this.transferLoading = flag;
    },
    getShowCoin(v) {
      let str = v;
      if (this.market && this.market.coinList) {
        str = getCoinShowName(v, this.market.coinList);
      }
      return str;
    },
    // 操作
    operation(operationType) {
      // 提现
      if (operationType === 'withdraw') {
        // 如果开启了必须认证 并且 未认证成功 禁止提现
        if (this.withdrawKycOpen && this.idAuth !== 1) {
          this.isShowDialog = true;
        } else {
          this.$router.push('/assets/withdraw');
        }
      } else if (operationType === 'recharge') { // 充值
        if (this.depositeKycOpen && this.idAuth !== 1) {
          this.isShowDialog = true;
        } else {
          this.$router.push('/assets/recharge');
        }
      } else if (operationType === 'transfer') {
        if (this.otcOpen) {
          this.transferAccount = 'c2c';
        } else if (this.leverOpen) {
          this.transferAccount = 'lever';
        } else if (this.linkurl.coUrl) {
          this.transferAccount = 'co';
        }
        this.showTransfer = true;
      } else if (operationType === 'flowWater') {
        this.$router.push('/assets/flowingWater');
      }
    },
    // 信用卡买币
    toCreditCard() {
      if (process.env.NODE_ENV === 'development') {
        this.$router.push('/ex/zh_CN/creditCardPurchase');
      } else {
        window.location.href = `${this.linkurl.exUrl}/creditCardPurchase`;
      }
    },
    // 获取OTC币种列表
    getOtcCoin() {
      this.transferLoading = true;
      this.axios({
        url: 'finance/v4/otc_account_list',
      }).then((data) => {
        this.transferLoading = false;
        if (data.code.toString() === '0') {
          this.otcMap = data.data.allCoinMap;
          this.setOtcData(data.data);
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
    // 处理OTC币种数据
    setOtcData(data) {
      const { coinList } = this.market;
      const { allCoinMap } = data;
      const list = [];
      allCoinMap.forEach((item) => {
        list.push({
          img: coinList[item.coinSymbol].icon,
          code: item.coinSymbol,
          value: getCoinShowName(item.coinSymbol, coinList),
        });
      });
      this.otcCoinList = [...list];
    },
    // 获取杠杆币对数据
    getLeverData() {
      this.transferLoading = true;
      this.axios({
        url: 'lever/finance/balance',
      }).then((data) => {
        this.transferLoading = false;
        if (data.code.toString() === '0') {
          this.leverMap = data.data.leverMap;
          this.setLeverData(data.data);
        }
      });
    },
    // 处理杠杆 币对数据
    setLeverData(data) {
      const { coinList } = this.market;
      const { leverMap } = data;
      const list = [];
      Object.keys(leverMap).forEach((item) => {
        list.push({
          symbol: leverMap[item].symbol,
          code: leverMap[item].name,
          value: `${getCoinShowName(leverMap[item].baseCoin, coinList)}/${getCoinShowName(leverMap[item].quoteCoin, coinList)}`,
        });
      });
      this.symbolList = [...list];
    },
    // 杠杆币对资产
    getLeverBalance() {
      this.axios({
        url: 'lever/finance/symbol/balance',
        params: {
          symbol: this.leverSymbol,
        },
      }).then((data) => {
        if (data.code.toString() === '0') {
          this.leverSymbolBalance = data.data;
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
    // 获取合约资产
    getCoAccount() {
      this.axios({
        url: `${this.linkurl.coUrl}/fe-co-api/position/get_assets_list`,
        hostType: 'def',
        params: {
          marginCoin: this.transferCoin,
        },
      }).then(({ code, data, msg }) => {
        if (code.toString() === '0') {
          [this.coMap] = data.accountList;
          if (this.coMap && this.transferCoin) { // 合约余额
            const { canUseAmount } = this.coMap;
            this.contractAmount = Number(canUseAmount);
          }
        } else {
          this.$bus.$emit('tip', { text: msg, type: 'error' });
        }
        if (this.exchangeData && this.transferCoin) { // 币币余额
          if (this.exchangeData.allCoinMap[this.transferCoin] !== undefined) {
            const balance = this.exchangeData.allCoinMap[this.transferCoin].normal_balance;
            this.exchangeAmount = fixD(balance, this.showPrecision);
          } else {
            this.exchangeAmount = fixD(0, this.showPrecision);
          }
        }
      });
    },
    // 获取合约公共信息
    getCoPublicInfo() {
      let requestDomain = '';
      if (process.env.NODE_ENV === 'development') {
        requestDomain = '';
      } else {
        requestDomain = this.linkurl.coUrl;
      }
      this.axios({
        url: `${requestDomain}/fe-co-api/common/public_info`,
        hostType: 'def',
      }).then(({ code, data, msg }) => {
        if (code.toString() === '0') {
          const { contractList, marginCoinList } = data;
          const { coinList } = this.market;
          this.marginCoinList = marginCoinList;
          // 保证金币种在 market中没有就不显示
          this.coCoinList = marginCoinList.filter((item) => coinList[item])
            .map((item) => ({
              img: coinList[item] ? coinList[item].icon : '',
              code: item,
              value: getCoinShowName(item, coinList),
            }));
          if (contractList && contractList.length) {
            contractList.forEach((item) => {
              // 抽取保证金币种信息
              this.marginCoinInfor[item.marginCoin] = {
                // 保证金币种
                marginCoin: item.marginCoin,
                // 保证金币种精度
                marginCoinPrecision: item.coinResultVo.marginCoinPrecision,
                // 限制转入
                fundsInStatus: item.coinResultVo.fundsInStatus,
                // 限制转出
                fundsOutStatus: item.coinResultVo.fundsOutStatus,
              };
            });
          }
        } else {
          this.$bus.$emit('tip', { text: msg, type: 'error' });
        }
      });
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
      this.transferAccount = '';
    },
    // 全部
    transferAll() {
      if (this.transferSide === 1) {
        this.transferNum = this.exchangeAvailable;
      } else {
        this.transferNum = this.otherAvailable;
      }
    },
    // 修改
    selectChange(item, name) {
      this[name] = item.code;
      if (name === 'transferSymbol' && item.symbol) {
        this.leverSymbol = item.symbol;
      }
    },
    inputChange(value, name) {
      this[name] = value;
    },
    // 确认划转
    confirmTransfer() {
      this.transferLoading = true;
      if (this.transferAccount === 'c2c') {
        this.otcTransfer();
      } else if (this.transferAccount === 'lever') {
        this.leverTransfer();
      } else if (this.transferAccount === 'co') {
        this.toCoTransfer();
      }
    },
    // 划转OTC
    otcTransfer() {
      this.axios({
        url: 'finance/otc_transfer',
        params: {
          fromAccount: this.transferSide === 1 ? '1' : '2',
          toAccount: this.transferSide === 1 ? '2' : '1',
          amount: this.transferNum,
          coinSymbol: this.transferCoin,
        },
      }).then((data) => {
        this.showTransfer = false;
        this.transferLoading = false;
        if (data.code.toString() === '0') {
          this.$bus.$emit('tip', { text: data.msg, type: 'success' });
          this.$store.dispatch('assetsExchangeData');
          this.clearTransfer();
          this.getOtcCoin();
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
    // 划转杠杆
    leverTransfer() {
      this.transferLoading = true;
      this.axios({
        url: 'lever/finance/transfer',
        params: {
          fromAccount: this.transferSide === 1 ? '1' : '2',
          toAccount: this.transferSide === 1 ? '2' : '1',
          amount: this.transferNum,
          coinSymbol: this.transferCoin,
          symbol: this.leverSymbol,
        },
      }).then((data) => {
        this.showTransfer = false;
        this.transferLoading = false;
        if (data.code.toString() === '0') {
          this.$store.dispatch('assetsExchangeData');
          this.$bus.$emit('tip', { text: data.msg, type: 'success' });
          this.clearTransfer();
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
    // 划转合约
    toCoTransfer() {
      this.axios({
        url: 'contract/co_transfer',
        params: {
          // wallet_to_contract:币币划转至合约  contract_to_wallet:合约划转至币币
          transferType: this.transferSide === 1 ? 'wallet_to_contract' : 'contract_to_wallet',
          amount: Number(this.transferNum),
          coinSymbol: this.transferCoin,
        },
        method: 'post',
      }).then((data) => {
        this.showTransfer = false;
        this.transferLoading = false;
        if (data.code.toString() === '0') {
          this.clearTransfer();
          this.$store.dispatch('assetsExchangeData');
          this.$bus.$emit('tip', { text: data.msg, type: 'success' });
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
    // 清空划转
    clearTransfer() {
      this.transferAccount = '';
      this.transferSide = 1;
      this.transferCoin = '';
      this.transferSymbol = '';
      this.leverSymbol = '';
    },
    setData() {
      const {
        totalBalance,
        totalBalanceSymbol,
        platformCoin,
        allCoinMap,
      } = this.exchangeData;

      this.positionV3 = Object.keys(allCoinMap).some(
        (key) => Number(allCoinMap[key].lock_increment_amount) > 0,
      );
      const { coinList, rate } = this.market;
      const fix = (coinList[totalBalanceSymbol]
        && coinList[totalBalanceSymbol].showPrecision)
        || 8;
      this.totalBalance = fixD(totalBalance, fix); // 折合资产
      this.totalBalanceSymbol = totalBalanceSymbol; // 折合币种
      this.totalRate = fixRate(totalBalance, rate, totalBalanceSymbol); // 折合法币
      if (platformCoin && platformCoin.length) {
        const obj = allCoinMap[platformCoin];
        if (obj && Number(obj.lock_position_balance)) {
          this.havePosition = true;
        }
      }
      if (
        this.baseData.switch.lock_position_v2_status
        && this.baseData.switch.lock_position_v2_status.toString() === '1'
      ) {
        this.positionV2 = true;
      }
      this.setDataList(allCoinMap, totalBalance);
      if (this.leverOpen) {
        this.getLeverData();
      }
      if (this.otcOpen) {
        this.getOtcCoin();
      }
      if (this.linkurl.coUrl) {
        this.getCoPublicInfo();
      }
    },
    compare(property) {
      return function fn(a, b) {
        const value1 = a[property];
        const value2 = b[property];
        return value2 - value1;
      };
    },
    switchChange() {
      this.switchFlag = !this.switchFlag;
      myStorage.set('assetsSwitch', this.switchFlag);
      this.findChanges(this.findValue);
    },
    findChanges(v) {
      this.findValue = v;
      if (this.searchTimer) clearTimeout(this.searchTimer);
      if (v !== '' || this.switchFlag) {
        const result = this.dataList.filter((item) => {
          const isSearch = item.coinShowName.toUpperCase().indexOf(v.toUpperCase()) !== -1;
          return isSearch;
        });
        this.searchListResult = result;
        this.search = true;
      } else {
        this.search = false;
      }
    },
    tableClick(item) {
      const { type, symbol } = item;
      // 提现
      if (type === 'withdraw') {
        // 如果开启了必须认证 并且 未认证成功 禁止提现
        if (this.withdrawKycOpen && this.idAuth !== 1) {
          this.isShowDialog = true;
        } else {
          this.$router.push(`withdraw?symbol=${symbol}`);
        }
      }
      // 充值
      if (type === 'recharge') {
        if (this.depositeKycOpen && this.idAuth !== 1) {
          this.isShowDialog = true;
        } else {
          this.$router.push(`recharge?symbol=${symbol}`);
        }
      }
      // 理财
      if (type === 'manageFinances') {
        this.$router.push('/manageFinances');
      }
      // 交易只有一个币对
      if (type === 'trade') {
        if (item && item.selectList.length === 1) {
          this.toTrade(item.selectList[0]);
        }
      }
    },
    // 去交易
    toTrade(item) {
      const mSymbol = item.code;
      if (mSymbol.toString().indexOf('/') === -1) {
        return;
      }
      myStorage.set('markTitle', mSymbol.split('/')[1]);
      myStorage.set('sSymbolName', mSymbol);
      const [base, quote] = mSymbol.split('/');
      const baseShow = getCoinShowName(base, this.market.coinList);
      const quoteShow = getCoinShowName(quote, this.market.coinList);
      window.location.href = `${this.tradeLinkUrl}/${baseShow}_${quoteShow}`;
    },
    // 弹框取消
    dialogClose() {
      this.isShowDialog = false;
    },
    // 去认证
    gotoAuth() {
      this.$router.push('/personal/identityAuthen');
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
    setDataList(data) {
      const list = [];
      Object.keys(data).forEach((item) => {
        if (data[item].isFiat) {
          return;
        }
        // 该币种精度
        const { coinList, market } = this.market;
        const fix = (coinList[item] && coinList[item].showPrecision) || 0;
        // 资产折合精度
        const totle = this.totalBalanceSymbol;
        const btcFix = (coinList[totle] && coinList[totle].showPrecision) || 0;
        // 逻辑 1 如果 优先找出交易币种为当前货币的
        //     2 如果 1条件未筛选出，则去看当前货币是否为计价货币 把以该货币为计价货币的币对都加进去
        let selectOption = [];
        const by = [];
        Object.keys(market).forEach((v) => {
          Object.keys(market[v]).forEach((cv) => {
            const showSymbol = market[v][cv].showName || market[v][cv].name;
            if (cv.split('/')[0] === item) {
              selectOption.push({
                value: showSymbol,
                code: market[v][cv].name,
              });
            }
            if (v === item) {
              by.push({ value: showSymbol, code: market[v][cv].name });
            }
          });
        });
        if (selectOption.length === 0) {
          selectOption = by;
        }
        let arr = [];

        // 平台币锁仓数量
        const lockPositionBalance = data[item].lock_position_balance || '0';
        // 代币锁仓数量
        const lockPositionV2Amount = data[item].lock_position_v2_amount || '0';
        // 理财锁仓数量
        const lockIncrementAmount = data[item].lock_increment_amount || '0';
        // 判断当前锁仓类型大于一个的时候
        if (this.havePosition || this.positionV2 || this.positionV3) {
          const num = Number(lockPositionBalance)
            + Number(lockPositionV2Amount)
            + Number(lockIncrementAmount);

          const selectList = [];
          if (Number(lockPositionBalance)) {
            selectList.push(
              `${this.$t('assets.exchangeAccount.positionBalance')}：
                    ${this.thousands(fixD(lockPositionBalance, fix))}`,
            );
          }
          if (Number(lockPositionV2Amount)) {
            selectList.push(
              `${this.$t('assets.exchangeAccount.positionV2Amount')}：
                  ${this.thousands(fixD(lockPositionV2Amount, fix))}`,
            );
          }
          if (Number(lockIncrementAmount)) {
            selectList.push(
              `${this.$t('assets.exchangeAccount.incomeLock')}：${this.thousands(fixD(lockIncrementAmount, fix))}`,
            );
          }
          arr = num ? selectList : [this.thousands(fixD(num, fix))];
        }
        let showUnlockSell = false;
        if (
          coinList[item]
          && coinList[item].isOvercharge
          && coinList[item].isOvercharge.toString() === '1'
        ) {
          showUnlockSell = true;
        }
        const btcValuation = fixD(data[item].allBtcValuatin, btcFix);
        // 功能按钮列表
        const funBtnList = [];
        if (data[item].depositOpen) {
          funBtnList.push({
            text: this.$t('assets.exchangeAccount.Recharge'),
            type: 'recharge',
            symbol: item,
          });
        }
        if (data[item].withdrawOpen && this.isShowWithdraw) {
          funBtnList.push({
            text: this.$t('assets.exchangeAccount.withdraw'),
            type: 'withdraw',
            symbol: item,
          });
        }
        if (selectOption.length) {
          funBtnList.push(
            {
              text: this.$t('assets.exchangeAccount.trade'),
              type: 'trade',
              selectList: selectOption,
              id: item,
            },
          );
        }
        const coinShowName = getCoinShowName(item, coinList);
        list.push({
          id: item,
          coin: item,
          coinShowName,
          total: fixD(data[item].total_balance, fix),
          normal: fixD(data[item].normal_balance, fix),
          showUnlockSell,
          overcharge: `${this.thousands(fixD(
            data[item].overcharge_balance || 0,
            fix,
          ))} (${this.$t('assets.exchangeAccount.limit')})`,
          freeze: this.thousands(fixD(data[item].lock_balance, fix)),
          lock: arr,
          fold: this.thousands(btcValuation),
          operation: funBtnList,
          btcValuation,
        });
      });
      this.tabelLoading = false;
      this.tabelLength = list.length;
      this.dataList = list.sort((a, b) => a.id - b.id);
      this.findChanges(this.findValue);
    },
  },
};
