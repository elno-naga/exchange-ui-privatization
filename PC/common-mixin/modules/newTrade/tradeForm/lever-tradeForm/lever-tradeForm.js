import {
  myStorage, getCoinShowName, nul, fixRate, fixD, fixInput, imgMap, colorMap, getCookie, getIconPath,
} from '@/utils';

export default {
  name: 'tableList',
  filters: {
    rateFix(v) {
      const data = v || 0;
      return `${fixD(data * 100, 2)}%`;
    },
  },
  data() {
    return {
      getIconPath,
      formData_1: {
        title: '',
        units: myStorage.get('leverSymbolName') ? myStorage.get('leverSymbolName').split('/')[1] : 'USDT',
        subText: '',
        errorText: '',
        isError: false,
        disabled: false,
        disabledText: '',
        value: '',
      },
      formData_2: {
        title: '',
        units: myStorage.get('leverSymbolName') ? myStorage.get('leverSymbolName').split('/')[0] : 'USDT',
        subText: '',
        errorText: '',
        isError: false,
        disabled: false,
        disabledText: '',
        value: null,
      },
      formData_3: {
        title: '',
        units: myStorage.get('leverSymbolName') ? myStorage.get('leverSymbolName').split('/')[1] : 'USDT',
        subText: '',
        errorText: '',
        isError: false,
        disabled: false,
        disabledText: '',
        value: null,
      },
      formData_4: {
        title: '',
        units: myStorage.get('leverSymbolName') ? myStorage.get('leverSymbolName').split('/')[0] : 'USDT',
        subText: '',
        errorText: '',
        isError: false,
        disabled: false,
        disabledText: '',
        value: null,
      },
      imgMap,
      colorMap,
      // 交易类型 1限价 2 市价
      transactionType: 1,
      // 当前切换的货币对
      symbolCurrent: myStorage.get('leverSymbolName'),
      // 百分比
      perArr: [25, 50, 75, 100],
      perBuy: null,
      perSell: null,
      // 防止多次提交
      fal: true,
      assetsInter: null,
      totalBalancesHide: false,
      // 资产数据
      financeData: null,
      // 借贷弹框
      isShowDialog: false,
      confirmFormTitle: this.$t('lever.leverjd'), // '借贷',
      borrowType: 'Base',
      // 借贷数量
      borrowValue: '',
      borrowPromptText: this.$t('lever.leverJdNumber'), // '借贷数量',
      borrowErrorText: null,
      borrowErrorFlag: false,
      borrowCoin: null,
      confirmLoading: false,
      // 提水框
      alertFlag: false,
      tradeSide: null,
      notAuthShowDialog: false,
      tsTexttype: 1,
      leverStep: null,
      tradePage: '2',
      tradePageHover: null,
      showRiskTip: false,
      tabLineStyle: {},
      loanTab: 1,
      loanTabHover: null,
      isDeleteHover: false,
      perSelect: null,
      perHover: null,
      orderType: 'buy',
      tradeTypeHover: null,
      timer: null, // 轮训请求资产接口
    };
  },
  props: {
    proTrade: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    tabNav() {
      const list = [
        {
          text: this.$t('trade5.limitPrice'),
          index: 1,
        },
        {
          text: this.$t('trade5.marketPrice'),
          index: 2,
        },
      ];
      return list;
    },
    localText() {
      return {
        title1: this.$t('trade.price'), // 价格
        title2: this.$t('trade.number'), // '数量',
        title3: this.$t('trade.price'), // '价格',
        title4: this.$t('trade.number'), // '数量',
      };
    },
    coinSymbols() {
      if (this.symbolCurrent) {
        return this.symbolCurrent.replace('/', ',');
      }
      return '';
    },
    // 全部币种列表
    coinList() {
      if (this.$store.state.baseData && this.$store.state.baseData.market) {
        return this.$store.state.baseData.market.coinList;
      }
      return null;
    },
    isLogin() {
      if (this.$store.state.baseData.isLogin) {
        return this.$store.state.baseData.isLogin;
      }
      return false;
    },
    // 按钮信息
    buttosContent() {
      return {
        buyButton: {

          text: this.isLogin
            ? `${this.$t('lever.buy')} ${getCoinShowName(this.symbolUnit.symbol, this.coinList)}`
            : this.$t('trade.loginReg'), // '登录/注册',
          class: this.isLogin ? 'rise-1-bg buyBtn buttonStyleColor' : 'main-1-bg buyBtn text-4-cl',
        },
        sellButton: {
          text: this.isLogin
            ? `${this.$t('lever.sell')} ${getCoinShowName(this.symbolUnit.symbol, this.coinList)}`
            : this.$t('trade.loginReg'), // '登录/注册',
          class: this.isLogin ? 'fall-1-bg sellBtn buttonStyleColor' : 'main-1-bg sellBtn text-4-cl',
        },
      };
    },
    // 账户资产
    accountBalance() {
      if (this.$store.state.assets) {
        return this.$store.state.assets.assetsCoinData;
      }
      return null;
    },
    // 当前币对的资产
    currenTaccount() {
      if (this.financeData) {
        return {
          symbolAccoubt: this.financeData.baseNormalBalance,
          unitsAccoubt: this.financeData.quoteNormalBalance,
        };
      }
      return {
        symbolAccoubt: '0',
        unitsAccoubt: '0',
      };
    },
    // 折合总资产
    totalBalances() {
      if (this.accountBalance) {
        const { totalBalance, totalBalanceSymbol } = this.accountBalance;
        return {
          totalBalance,
          totalBalanceSymbol,
          totalRater: fixRate(totalBalance, this.rateData, totalBalanceSymbol),
        };
      }
      return {
        totalBalance: '0.0000',
        totalBalanceSymbol: 'BTC',
        totalRater: '0.00',
      };
    },
    // 当前币对
    symbolUnit() {
      if (this.symbolCurrent) {
        return {
          symbol: this.symbolCurrent.split('/')[0],
          units: this.symbolCurrent.split('/')[1],
        };
      }
      return {
        symbol: '',
        units: '',
      };
    },
    // 汇率单位4
    rateData() {
      return this.$store.state.baseData.rate;
    },
    // 全部币对列表
    symbolAll() {
      return this.$store.state.baseData.symbolAll;
    },
    // 当前币对精度计算的值
    fixValue() {
      if (this.symbolAll && this.symbolCurrent) {
        const symbol = this.symbolAll[this.symbolCurrent];
        return {
          priceFix: symbol.price,
          volumeFix: symbol.volume,
        };
      }
      return {
        priceFix: 2,
        volumeFix: 8,
      };
    },
    formData2Fix() {
      if (this.transactionType === 2) {
        return this.fixValue.priceFix;
      }
      return this.fixValue.volumeFix;
    },
    // 买入交易额
    tradeVolumeBuy() {
      const count = nul(fixD(this.formData_1.value, this.fixValue.priceFix),
        fixD(this.formData_2.value, this.fixValue.volumeFix));

      return fixD(
        count,
        this.fixValue.priceFix,
      );
    },
    tradeVolumeSell() {
      const count = nul(fixD(this.formData_3.value, this.fixValue.priceFix),
        fixD(this.formData_4.value, this.fixValue.volumeFix));

      return fixD(
        count,
        this.fixValue.priceFix,
      );
    },
    // 修改保证金是否可以提交
    confirmDisabled() {
      if (this.confirmLoading) {
        return false;
      }
      if (this.borrowValue && this.borrowValue > 0) {
        return false;
      }
      return true;
    },
    baseData() {
      return this.$store.state.baseData.publicInfo;
    },
    // 交易是否开启了必须实名认证
    leverTradeKycOpen() {
      let isOpen = 0;
      if (this.baseData && this.baseData.kycLimitConfig) {
        isOpen = this.baseData.kycLimitConfig.lever_trade_kyc_open;
      }
      return Number(isOpen);
    },
    // 用户信息
    userInfo() {
      return this.$store.state.baseData.userInfo;
    },
    // 认证信息
    idAuth() {
      let idAuth = 0;
      if (this.userInfo) {
        idAuth = Number(this.userInfo.authLevel);
      }
      return idAuth;
    },
    loanOptions() {
      if (this.financeData) {
        return [
          {
            value: getCoinShowName(this.financeData.baseCoin, this.coinList),
            code: 'Base',
          },
          {
            value: getCoinShowName(this.financeData.quoteCoin, this.coinList),
            code: 'Quote',
          },
        ];
      }
      return [];
    },
    loanSymbol() {
      if (this.financeData) {
        return `${getCoinShowName(this.financeData.baseCoin, this.coinList)}/${getCoinShowName(this.financeData.quoteCoin, this.coinList)}`;
      }
      return '';
    },
    loanSymbolOption() {
      return [
        {
          value: this.loanSymbol,
          code: this.loanSymbol,
        },
      ];
    },
    // 买入卖出按钮样式
    transactionButtons() {
      const style = {
        buyButton: {
          hoverClass: 'rise-1-bg buttonStyleColor',
          activeClass: 'rise-1-bg buttonStyleColor',
        },
        sellButton: {
          hoverClass: 'fall-1-bg buttonStyleColor',
          activeClass: 'fall-1-bg buttonStyleColor',
        },
      };
      if (this.orderType === 'sell') {
        style.buyButton.defaultClass = 'fill-3-bg text-1-cl';
        style.sellButton.defaultClass = 'fall-1-bg buttonStyleColor';
      } else {
        style.sellButton.defaultClass = 'fill-3-bg text-1-cl';
        style.buyButton.defaultClass = 'rise-1-bg buttonStyleColor';
      }
      return style;
    },
    symbolItem() {
      let symbol = {};
      if (this.symbolAll && this.symbolCurrent) {
        symbol = this.symbolAll[this.symbolCurrent];
      }
      return symbol;
    },
    baseBalance() {
      return fixD(this.financeData.baseTotalBalance - this.financeData.baseBorrowBalance, 8);
    },
    quoteBalance() {
      return fixD(this.financeData.quoteTotalBalance - this.financeData.quoteBorrowBalance, 8);
    },
    //  是否开启了 网格
    gridTradeFlag() {
      const { publicInfo } = this.$store.state.baseData;
      let str = 0;
      if (publicInfo && publicInfo.switch && publicInfo.switch.grid_trade_switch) {
        str = Number(publicInfo.switch.grid_trade_switch);
      }
      return str;
    },
    // 该币对是否开启网格
    showGridFlag() {
      let flag = false;
      if (this.symbolAll && this.symbolCurrent) {
        const symbol = this.symbolAll[this.symbolCurrent];

        if (symbol && symbol.is_grid_open) {
          flag = true;
        }
      }
      return flag;
    },
    // 风险率指针图片
    riskRateImg() {
      let img = 'https://bigcustom-oss.oss-cn-hongkong.aliyuncs.com/upload/20220414165649800.png';
      if (this.financeData) {
        if (this.financeData.riskRate >= 200) {
          img = 'https://bigcustom-oss.oss-cn-hongkong.aliyuncs.com/upload/20220414165649800.png';
        } else if (this.financeData.riskRate >= 150 && this.financeData.riskRate < 200) {
          img = 'https://bigcustom-oss.oss-cn-hongkong.aliyuncs.com/upload/20220414165725815.png';
        } else if (this.financeData.riskRate >= 120 && this.financeData.riskRate < 150) {
          img = 'https://bigcustom-oss.oss-cn-hongkong.aliyuncs.com/upload/20220414165739696.png';
        } else {
          img = 'https://bigcustom-oss.oss-cn-hongkong.aliyuncs.com/upload/20220414165755266.png';
        }
      }
      return img;
    },
    // 风险率颜色
    riskRateColor() {
      let color = colorMap['text-2-cl'];
      if (this.financeData) {
        if (this.financeData.riskRate >= 200) {
          color = '#13B887';
        } else if (this.financeData.riskRate >= 150 && this.financeData.riskRate < 200) {
          color = '#FBCD70';
        } else if (this.financeData.riskRate >= 120 && this.financeData.riskRate < 150) {
          color = '#F28716';
        } else if (this.financeData.riskRate) {
          color = '#EB4D5C';
        }
      }
      return color;
    },
    tradeTypeList() {
      const list = [
        { name: this.$t('trade5.tradeType2'), index: '2' },
      ];
      return list;
    },
  },
  watch: {
    localText(localText) {
      this.formData_1.title = localText.title1;
      this.formData_2.title = localText.title2;
      this.formData_3.title = localText.title3;
      this.formData_4.title = localText.title4;
    },
    isLogin(val) {
      if (val) {
        this.$store.dispatch('assetsExchangeData', {
          auto: false,
          coinSymbols: this.coinSymbols,
        });
        this.getLeverageFinance();
        this.interValGetAssets();

        clearInterval(this.assetsInter);
        this.assetsInter = setInterval(() => {
          this.getLeverageFinance();
        }, 3000);
      }
    },
    // 切换 限价交易 和 市价交易
    transactionType(val) {
      // 2 市价交易
      if (val === 2) {
        this.formData_1.disabled = true;
        this.formData_1.disabledText = this.$t('trade.mPriceBuy'); // 以市场最优价买入
        this.formData_2.title = this.$t('trade.dealMoney'); // '交易额';
        this.formData_2.units = this.symbolUnit.units;
        this.formData_3.disabled = true;
        this.formData_3.disabledText = this.$t('trade.mPriceSell'); // 以市场最优价卖出
      } else {
        this.formData_1.disabled = false;
        this.formData_1.disabledText = '';
        this.formData_2.title = this.$t('trade.number'); // '数量';
        this.formData_2.units = this.symbolUnit.symbol;
        this.formData_3.disabled = false;
        this.formData_3.disabledText = '';
      }
    },
    // 各个输入框的 单位
    symbolUnit(val) {
      this.formData_1.units = val.units;
      // this.formData_2.units = val.symbol;
      if (this.transactionType === 2) {
        this.formData_2.units = val.units;
      } else if (this.transactionType === 1) {
        this.formData_2.units = val.symbol;
      }
      this.formData_3.units = val.units;
      this.formData_4.units = val.symbol;
    },
    borrowValue(v) {
      // this.borrowValue = fixInput(v, this.valuePrecision(this.borrowCoin));
      this.borrowValue = fixInput(v, 8);
    },
  },
  methods: {
    init() {
      this.symbolCurrent = myStorage.get('leverSymbolName');
      // 监听 当前货币对切换
      this.$bus.$on('SYMBOL_CURRENT', (val) => {
        this.clearValue();
        this.symbolCurrent = val;
        this.getLeverageFinance();
      });
      if (this.isLogin) {
        this.$store.dispatch('assetsExchangeData', {
          auto: false,
          coinSymbols: this.coinSymbols,
        });
        this.$bus.$on('getLeverBalance', () => {
          this.getLeverageFinance();
        });
        this.getLeverageFinance();
        this.interValGetAssets();
        clearInterval(this.assetsInter);
        this.assetsInter = setInterval(() => {
          this.getLeverageFinance();
        }, 3000);
      }
      // 监听 价格点击
      this.$bus.$on('HANDEL_PRICE', (data) => {
        if (data) {
          const arr = ['formData_1', 'formData_3'];
          arr.forEach((item) => {
            this.onChaneForm({ name: item, value: data });
          });
        }
      });
      // 撤单更新杠杆资产
      this.$bus.$on('lever_getAssets', () => {
        setTimeout(() => {
          this.getLeverageFinance();
        }, 1000);
      });
      // this.$bus.$on('changeTradePage', (type) => {
      //   this.changeTradePage(type);
      // });
      this.setTabLineStyle(this.transactionType);
    },
    setFex(val) {
      return fixInput(val, 8);
    },
    // 获取币种精度
    valuePrecision(sy) {
      if (this.coinList) {
        return this.coinList[sy].showPrecision;
      }
      return 4;
    },
    // 切换 限价交易 和 市价交易
    switchTradeType(type) {
      this.setTabLineStyle(type.index);
      this.clearValue();
      this.transactionType = type.index;
    },
    // 显示隐藏折合资产
    handelTotal() {
      this.totalBalancesHide = !this.totalBalancesHide;
    },
    // input 框 输入事件
    onChaneForm(data) {
      this[data.name].value = data.value;
      if (data.value) {
        this[data.name].isError = false;
      }
      if (data.name === 'formData_3' || data.name === 'formData_1') {
        this[data.name].subText = fixRate(
          parseFloat(data.value),
          this.rateData,
          this.symbolUnit.units,
        );
      }
      if (data.name === 'formData_2' || data.name === 'formData_1') {
        const V1 = this.formData_1.value;
        const V2 = this.formData_2.value;
        const UA = this.currenTaccount.unitsAccoubt;
        if (this.transactionType === 2) {
          this.perBuy = (V2 / UA) * 100;
        } else {
          this.perBuy = ((V1 * V2) / UA) * 100;
        }
      }
      if (data.name === 'formData_4' || data.name === 'formData_3') {
        // const V3 = parseFloat(this.formData_3.value);
        const V4 = parseFloat(this.formData_4.value);
        const SA = this.currenTaccount.symbolAccoubt;
        this.perSell = (V4 / SA) * 100;
      }
      if (!data.value) {
        this[data.name].subText = null;
      }
    },
    // 点击百分之 事件
    setPerNumber(type, num) {
      if (!this.isLogin) {
        // 请先登录账号
        this.$bus.$emit('tip', { text: this.$t('trade.pleaseLogin'), type: 'error' });
      } else if (type === 'buy') {
        if (!this.formData_1.value && this.transactionType === 1) {
          // 请输入价格
          this.perBuy = num;
          this.formData_1.errorText = this.$t('trade.pleasePrice');
          this.formData_1.isError = true;
        } else if (this.transactionType === 1) {
          this.perBuy = num;
          const data = (this.currenTaccount.unitsAccoubt / this.formData_1.value) * (num / 100);
          this.formData_2.value = fixD(data, this.fixValue.volumeFix);
        } else {
          this.perBuy = num;
          const data = this.currenTaccount.unitsAccoubt * (num / 100);
          this.formData_2.value = fixD(data, this.fixValue.priceFix);
        }
      } else if (type === 'sell') {
        this.perSell = num;
        const data = this.currenTaccount.symbolAccoubt * (num / 100);
        this.formData_4.value = fixD(data, this.fixValue.volumeFix);
      }
    },
    // 百分比按钮class
    perSellClass(num) {
      if (this.perSell === num) {
        return ['main-1-bd', 'main-1-cl'];
      }
      return 'fill-6-bd';
    },
    perBuyClass(num) {
      if (this.perBuy === num) {
        return ['main-1-bd', 'main-1-cl'];
      }
      return 'fill-6-bd';
    },
    // 交易额 文字颜色Class
    volumeTradeClass(num, total) {
      if (parseFloat(num) > parseFloat(total)) {
        return 'fall-1-cl';
      }
      return 'text-1-cl';
    },
    submitFormKey(type) {
      let formKey = [];
      let price = null;
      let volume = null;
      if (this.transactionType === 1) {
        if (type === 'BUY') {
          formKey = ['formData_1', 'formData_2'];
          price = fixD(this.formData_1.value, this.fixValue.priceFix);
          volume = fixD(this.formData_2.value, this.fixValue.volumeFix);
        } else {
          formKey = ['formData_3', 'formData_4'];
          price = fixD(this.formData_3.value, this.fixValue.priceFix);
          volume = fixD(this.formData_4.value, this.fixValue.volumeFix);
        }
      } else if (type === 'BUY') {
        formKey = ['formData_2'];
        volume = fixD(this.formData_2.value, this.fixValue.priceFix);
      } else {
        formKey = ['formData_4'];
        volume = fixD(this.formData_4.value, this.fixValue.volumeFix);
      }
      return { formKey, price, volume };
    },
    // 清空 表单数据
    clearValue() {
      const formKey = ['formData_1', 'formData_2', 'formData_3', 'formData_4'];
      formKey.forEach((item) => {
        this[item].value = '';
        this[item].isError = false;
        this[item].subText = null;
      });
      this.perSell = 0;
      this.perBuy = 0;
    },
    submit(side) {
      if (!this.isLogin) {
        this.$router.push('/login');
      } else if (this.leverTradeKycOpen && this.idAuth !== 1) {
        this.tsTexttype = 1;
        this.notAuthShowDialog = true;
      } else {
        const { formKey, price, volume } = this.submitFormKey(side);
        let fal = true;
        if (formKey.length) {
          formKey.forEach((item) => {
            let { value } = this[item];
            value = value.replace(/\s/g, '');
            if (!value || Number.isNaN(Number(value))) {
              this[item].errorText = `${this.$t('trade.pleaseInput')}${this[item].title}`;
              this[item].isError = true;
              fal = false;
            }
            if (parseFloat(value) <= 0) {
              this[item].errorText = `${this[item].title}${this.$t('trade.inputError')}`; // 输入有误
              this[item].isError = true;
              fal = false;
            }
          });
          if (this.fal && fal) {
            const symbolArr = this.symbolCurrent.split('/');
            const symbol = symbolArr[0].toLowerCase() + symbolArr[1].toLowerCase();
            this.fal = false;
            const submitData = {
              side,
              price,
              volume,
              symbol,
              type: this.transactionType,
            };
            this.tradeSide = side;
            this.axios({
              url: this.$store.state.url.lever.create,
              headers: {},
              params: submitData,
              method: 'post',
            }).then((data) => {
              if (data.code === '0') {
                // 清空表单
                this.clearValue();
                // 重新请求资产
                this.getLeverageFinance();
                this.$store.dispatch('assetsExchangeData', {
                  auto: false,
                  coinSymbols: this.coinSymbols,
                });
                // 发送下单成功的事件
                this.$bus.$emit('ORDER_CREATE', { type: 'success' });
                // 提示成功 下单成功
                this.$bus.$emit('tip', { text: this.$t('trade.dealCussess'), type: 'success' });
                this.fal = true;
              } else {
                this.clearValue();
                this.$bus.$emit('tip', { text: data.msg, type: 'error' });
                // if (data.code === '10036') {
                //   this.alertFlag = true;
                // } else {
                // }
                this.fal = true;
              }
            });
          }
        }
      }
    },
    // 请求资产数据
    getLeverageFinance() {
      if (this.isLogin && this.symbolCurrent) {
        const symbolArr = this.symbolCurrent.split('/');
        const symbol = symbolArr[0] + symbolArr[1];
        this.axios({
          url: 'lever/finance/symbol/balance',
          headers: {},
          params: {
            symbol,
          },
          method: 'post',
        }).then((data) => {
          if (data.code === '0') {
            const ndata = data.data;
            // const basePrecision = this.valuePrecision(ndata.baseCoin);
            let quotePrecision = this.valuePrecision(ndata.quoteCoin);
            if (this.symbolAll) {
              quotePrecision = this.symbolAll[ndata.name] ? this.symbolAll[ndata.name].price : 8;
            }
            if (!this.isShowDialog) {
              this.borrowCoin = ndata.baseCoin;
              this.borrowType = 'Base';
            }
            this.financeData = ndata;
            // 可用
            this.financeData.baseNormalBalance = fixD(ndata.baseNormalBalance, 8);
            this.financeData.quoteNormalBalance = fixD(ndata.quoteNormalBalance, 8);
            // 可借
            this.financeData.baseCanBorrow = fixD(ndata.baseCanBorrow, 8);
            this.financeData.quoteCanBorrow = fixD(ndata.quoteCanBorrow, 8);
            // 已借
            this.financeData.baseBorrowBalance = fixD(ndata.baseBorrowBalance, 8);
            this.financeData.quoteBorrowBalance = fixD(ndata.quoteBorrowBalance, 8);
            // 总额度
            this.financeData.baseTotalBorrow = fixD(ndata.baseTotalBorrow, 8);
            this.financeData.quoteTotalBorrow = fixD(ndata.quoteTotalBorrow, 8);
            // 爆仓价
            this.financeData.burstPrice = fixD(ndata.burstPrice, quotePrecision);
          }
        });
      }
    },
    // 划转 借贷 借贷数量全部 按钮点击事件
    buttonsEvent(type, side) {
      if (!this.isLogin) {
        this.$router.push('/login');
      }
      if (type === 'All') {
        if (this.borrowType === 'Base') {
          this.borrowValue = this.financeData.baseCanBorrow;
        } else {
          this.borrowValue = this.financeData.quoteCanBorrow;
        }
      }
      if (type === '1' && this.isLogin) {
        if (this.symbolCurrent) {
          const arr = this.symbolCurrent.split('/');
          const symbol = (arr[0] + arr[1]).toLowerCase();
          const currentSymbil = side === 'BUY' ? arr[1] : arr[0];
          this.$bus.$emit('coTransfer', symbol, currentSymbil);
        }
      }
      if (type === '2') {
        this.isShowDialog = true;
      }
      if (type === '3') {
        const symbolArr = this.symbolCurrent.split('/');
        const symbol = symbolArr[0] + symbolArr[1];
        const { href } = window.location;
        const lan = getCookie('lan');
        window.location.href = `${href.split(lan)[0] + lan}/assets/leverageToLoan?symbol=${symbol.toLowerCase()}`;
      }
    },
    // 确认借贷
    dialogConfirm() {
      this.confirmLoading = true;
      if (this.isLogin && this.symbolCurrent) {
        const symbolArr = this.symbolCurrent.split('/');
        const symbol = symbolArr[0] + symbolArr[1];
        this.axios({
          url: 'lever/finance/borrow',
          headers: {},
          params: {
            symbol,
            coin: this.borrowCoin,
            amount: this.borrowValue,
          },
          method: 'post',
        }).then((data) => {
          this.confirmLoading = false;
          if (data.code === '0') {
            this.getLeverageFinance();
            // 借贷成功
            this.$bus.$emit('tip', { text: this.$t('lever.leverJdcc'), type: 'success' });
            this.isShowDialog = false;
            this.borrowValue = '';
          } else {
            this.$bus.$emit('tip', { text: data.msg, type: 'error' });
          }
        });
      }
    },
    // 切换 借贷币对
    setReviseType(type, data) {
      this.borrowValue = '';
      this.borrowType = type;
      this.borrowCoin = data;
    },
    // 借贷输入框 输入事件
    inputChanges(value, name) {
      this[name] = value;
    },
    // 弹框取消
    dialogClose() {
      this.notAuthShowDialog = false;
      this.isShowDialog = false;
      this.borrowValue = '';
      this.confirmLoading = false;
    },
    // 划转回调方法
    transferSuccess() {
      this.getLeverageFinance();
    },
    confirmFun() {
      this.buttonsEvent('1', this.tradeSide);
      this.alertClone();
    },
    alertClone() { this.alertFlag = false; },
    // 去认证
    gotoAuth() {
      this.$router.push('/personal/identityAuthen');
    },
    changeTradePage({ index }) {
      const { path } = this.$route;
      let pathStr = 'Margin';
      if (this.proTrade) {
        pathStr = 'TradeMargin';
      }
      if (index !== '2') {
        this.$router.push({
          path: path.replace(pathStr, 'Trade'),
          query: {
            tradePage: index,
          },
        });
      }
    },
    setTabLineStyle(index) {
      const left = this.proTrade ? 16 : 32;
      this.tabLineStyle = {
        left: `${(index - 1) * 94 + left}px`,
      };
    },
    toLogin(type) {
      if (type === 'login') {
        this.$router.push('/login');
      } else {
        this.$router.push('/register');
      }
    },
    loanTabChange(num) {
      this.loanTab = num;
      if (num === 2) {
        this.getRepayData();
      }
    },
    loanCoinChange(item) {
      if (item.code === 'Base') {
        this.setReviseType(item.code, this.financeData.baseCoin);
      } else {
        this.setReviseType(item.code, this.financeData.quoteCoin);
      }
    },
    clear() {
      this.borrowValue = '';
    },
    selectPercent(per) {
      this.perSelect = per;
      if (this.borrowType === 'Base') {
        if (this.loanTab === 1) {
          this.borrowValue = ((per / 100) * this.setFex(this.financeData.baseCanBorrow)).toString() || '';
        }
      } else if (this.borrowType === 'Quote') {
        if (this.loanTab === 1) {
          this.borrowValue = ((per / 100) * this.setFex(this.financeData.quoteCanBorrow)).toString() || '';
        }
      }
    },
    setOrderType(type) {
      this.orderType = type;
    },
    // 轮训请求资产接口
    interValGetAssets() {
      clearInterval(this.timer);
      this.timer = setInterval(() => {
        // 重新请求资产
        this.$store.dispatch('assetsExchangeData', {
          auto: false,
          coinSymbols: this.coinSymbols,
        });
      }, 3000);
    },
  },
  destroyed() {
    clearInterval(this.timer);
    clearInterval(this.assetsInter);
  },
};
