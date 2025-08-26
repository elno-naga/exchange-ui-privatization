import {
  fixD, fixRate, colorMap, imgMap, getCookie, getCoinShowName, fixInput, myStorage, getIconPath,
} from '@/utils';

export default {
  name: 'totalAssets',
  data() {
    return {
      colorMap,
      imgMap,
      getIconPath,
      loading: false,
      isHide: myStorage.get('assets_hide') || false, // 隐藏资产
      totalBalance: 0, // 总资产
      exchangeBalance: 0, // 币币资产
      c2cBalance: 0, // 法币资产
      futuresBalance: 0, // 合约资产
      leverBalance: 0, // 杠杆资产
      totalBalance_folded: 0, // 总资产折合
      exchangeBalance_folded: 0, // 币币资产折合
      c2cBalance_folded: 0, // 法币资产折合
      futuresBalance_folded: 0, // 合约资产折合
      leverBalance_folded: 0, // 杠杆资产折合
      accountHover: null,
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
      leverSymbol: '', // 杠杆币对
      leverSymbolBalance: {},
      banlanceData: [], // 资产
      coinHoverIndex: null, // 资产币种划过
      lan: getCookie('lan'),
      isShowDialog: false,
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
    // 按钮颜色
    colorList_2() {
      return ['fill-5-bd text-1-cl', 'main-1-bd main-1-cl', 'main-1-bd main-1-cl'];
    },
    // market 接口
    market() {
      return this.$store.state.baseData.market;
    },
    // 汇率
    rate() {
      return (this.market && this.market.rate)
        ? this.market.rate : {};
    },
    publicInfo() {
      return this.$store.state.baseData.publicInfo;
    },
    linkurl() {
      if (this.publicInfo) {
        return this.publicInfo.url;
      }
      return {};
    },
    incrementConfigStatus() {
      return this.$store.state.baseData.incrementConfigStatus;
    },
    leverOpen() {
      return this.$store.state.baseData.lever_open;
    },
    // 开了C2C
    otcOpen() {
      return this.linkurl.otcUrl || this.saasOtcFlowConfig;
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
    saasOtcFlowConfig() {
      let flag = false;
      if (this.publicInfo && this.publicInfo.switch
        && this.publicInfo.switch.saas_otc_flow_config
        && this.publicInfo.switch.saas_otc_flow_config.toString() === '1') {
        flag = true;
      }
      return flag;
    },
    // 账户列表
    accountList() {
      const arr = [];
      const exchangeAccount = {
        name: this.isSaleBol ? this.$t('sale.texta33') : this.$t('assets.index.exchangeAccount'),
        type: 'exchange',
        balance: this.exchangeBalance,
        balance_folded: this.exchangeBalance_folded,
        butttonList: [
          {
            text: this.$t('assets.exchangeAccount.Recharge'),
            type: 'recharge', // 充值
          },
        ],
      };
      if (this.isShowWithdraw) {
        exchangeAccount.butttonList.push({
          text: this.$t('assets.exchangeAccount.withdraw'),
          type: 'withdraw', // 提现
        });
      }
      if (this.transferList.length > 0) {
        exchangeAccount.butttonList.push({
          text: this.$t('assets.leverageAccount.transfer'),
          type: 'transfer', // 划转
        });
      }
      arr.push(exchangeAccount);
      // 法币账户
      const otcAccount = {
        name: this.$t('assets.index.otcAccount'),
        type: 'c2c',
        balance: this.c2cBalance,
        balance_folded: this.c2cBalance_folded,
        butttonList: [
          {
            text: this.$t('assets.otcAccount.buy'),
            type: 'buy', // 买币
          },
          {
            text: this.$t('assets.otcAccount.sell'),
            type: 'sell', // 卖币
          },
          {
            text: this.$t('assets.leverageAccount.transfer'),
            type: 'transfer', // 划转
          },
        ],
      };
      if (this.otcOpen) {
        arr.push(otcAccount);
      }
      if (this.linkurl.coUrl) {
        // 合约账户
        arr.push({
          name: this.$t('assets.index.coAccount'),
          type: 'co',
          balance: this.futuresBalance,
          balance_folded: this.futuresBalance_folded,
          butttonList: [
            {
              text: this.$t('assets.leverageAccount.transfer'),
              type: 'transfer', // 划转
            },
          ],
        });
      }
      if (this.leverOpen === 1) {
        // 杠杆账户
        arr.push({
          name: this.$t('assets.index.leverage'),
          type: 'lever',
          balance: this.leverBalance,
          balance_folded: this.leverBalance_folded,
          butttonList: [
            {
              text: this.$t('assets.leverageAccount.transfer'),
              type: 'transfer', // 划转
            },
          ],
        });
      }

      return arr;
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
    coinDataList() {
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
    // 币币资产
    exchangeData() {
      if (this.$store.state.assets.exchangeData) {
        return this.$store.state.assets.exchangeData.allCoinMap;
      }
      return null;
    },
    // 可划转资产
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
      if (this.loading) { return false; }
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
    market: {
      handler(val) {
        if (val) {
          this.getTotalAssets();
          if (this.otcOpen) {
            this.getOtcCoin();
          }
          if (this.leverOpen) {
            this.getLeverData();
          }
          if (this.linkurl.coUrl) {
            this.getCoPublicInfo();
            this.$store.dispatch('assetsExchangeData');
          }
        }
      },
      immediate: true,
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
    // 划转币种列表
    coinDataList: {
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
  },
  methods: {
    init() {},
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
    // 千分符
    thousands(num) {
      if (num && parseFloat(num)) {
        const str = num.toString();
        const reg = str.indexOf('.') > -1 ? /(\d)(?=(\d{3})+\.)/g : /(\d)(?=(?:\d{3})+$)/g;
        return str.replace(reg, '$1,');
      }
      return num;
    },
    showLoading(flag) {
      this.loading = flag;
    },
    coinHover(index, flag) {
      if (flag) {
        this.coinHoverIndex = index;
        this.$refs.echart.dispatchEvent({
          type: 'highlight',
          dataIndex: index,
        });
      } else {
        this.coinHoverIndex = null;
        this.$refs.echart.dispatchEvent({
          type: 'downplay',
          dataIndex: index,
        });
      }
    },
    // 获取总资产
    getTotalAssets() {
      this.loading = true;
      this.axios({
        url: 'finance/total_account_balance',
      }).then(({ code, data, msg }) => {
        this.loading = false;
        if (code.toString() === '0') {
          const {
            totalbalance, balance, c2cBalance, futuresBalance, leverBalance,
          } = data;
          const { coinList } = this.market;
          const fix = coinList.BTC.showPrecision;
          this.totalBalance = this.thousands(fixD(totalbalance, fix));
          this.exchangeBalance = this.thousands(fixD(balance, fix));
          this.c2cBalance = this.thousands(fixD(c2cBalance, fix));
          this.futuresBalance = this.thousands(fixD(futuresBalance, fix));
          this.leverBalance = this.thousands(fixD(leverBalance, fix));
          this.totalBalance_folded = this.thousands(fixRate(totalbalance, this.rate, 'BTC'));
          this.exchangeBalance_folded = this.thousands(fixRate(balance, this.rate, 'BTC'));
          this.c2cBalance_folded = this.thousands(fixRate(c2cBalance, this.rate, 'BTC'));
          this.futuresBalance_folded = this.thousands(fixRate(futuresBalance, this.rate, 'BTC'));
          this.leverBalance_folded = this.thousands(fixRate(leverBalance, this.rate, 'BTC'));
        } else {
          this.$bus.$emit('tip', { text: msg, type: 'error' });
        }
      });
    },
    // 操作
    operation(accountType, operationType) {
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
      } else if (operationType === 'transfer') { // 划转
        if (accountType === 'exchange') {
          if (this.otcOpen) {
            this.transferAccount = 'c2c';
          } else if (this.leverOpen) {
            this.transferAccount = 'lever';
          } else if (this.linkurl.coUrl) {
            this.transferAccount = 'co';
          }
        } else if (accountType === 'c2c') {
          this.transferAccount = 'c2c';
        } else if (accountType === 'lever') {
          this.transferAccount = 'lever';
        } else if (accountType === 'co') {
          this.transferAccount = 'co';
        }
        this.showTransfer = true;
      } else if (operationType === 'buy' || operationType === 'sell') {
        const sideName = operationType === 'buy' ? 'BUY' : 'SELL';
        window.location.href = `${this.linkurl.otcUrl}/${this.lan}?side=${sideName}`;
      }
    },
    // 弹框取消
    dialogClose() {
      this.isShowDialog = false;
    },
    // 去认证
    gotoAuth() {
      this.$router.push('/personal/identityAuthen');
    },
    // 获取OTC币种列表
    getOtcCoin() {
      this.loading = true;
      this.axios({
        url: 'finance/v4/otc_account_list',
      }).then((data) => {
        this.loading = false;
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
      this.loading = true;
      this.axios({
        url: 'lever/finance/balance',
      }).then((data) => {
        this.loading = false;
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
      this.showLoading(true);
      this.axios({
        url: 'lever/finance/symbol/balance',
        params: {
          symbol: this.leverSymbol,
        },
      }).then((data) => {
        this.showLoading(false);
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
          if (this.exchangeData && this.transferCoin) { // 币币余额
            if (this.exchangeData[this.transferCoin] !== undefined) {
              const balance = this.exchangeData[this.transferCoin].normal_balance;
              this.exchangeAmount = fixD(balance, this.showPrecision);
            } else {
              this.exchangeAmount = fixD(0, this.showPrecision);
            }
          }
          if (this.coMap && this.transferCoin) { // 合约余额
            const { canUseAmount } = this.coMap;
            this.contractAmount = Number(canUseAmount);
          }
        } else {
          this.$bus.$emit('tip', { text: msg, type: 'error' });
        }
      });
    },
    // 获取合约公共信息
    getCoPublicInfo() {
      this.axios({
        url: `${this.linkurl.coUrl}/fe-co-api/common/public_info`,
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
      this.loading = true;
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
        this.loading = false;
        if (data.code.toString() === '0') {
          this.$bus.$emit('tip', { text: data.msg, type: 'success' });
          this.clearTransfer();
          this.getTotalAssets();
          this.getOtcCoin();
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
    // 划转杠杆
    leverTransfer() {
      this.loading = true;
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
        this.loading = false;
        if (data.code.toString() === '0') {
          this.$bus.$emit('tip', { text: data.msg, type: 'success' });
          this.clearTransfer();
          this.getTotalAssets();
          this.getLeverData();
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
        this.loading = false;
        if (data.code.toString() === '0') {
          this.clearTransfer();
          this.getTotalAssets();
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
  },
};
