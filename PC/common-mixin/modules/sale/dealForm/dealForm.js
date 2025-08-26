import {
  fixD,
  getIconPath,
  nul,
  division,
} from '@/utils';

export default {
  name: 'dealForm',
  data() {
    return {
      getIconPath,
      currentFormType: 'buy',
      formData_1: {
        value: '',
        priceFix: 8,
        errorText: '',
        isError: false,
        disabled: false,
        disabledText: '',
        style: 'width: 63%',
        errorHeight: '-30px',
        imgSrc: 'https://s3.ap-northeast-1.amazonaws.com/chainup-test/exchange_jpy.png',
        units: 'JPY',
        isAll: true,
      },
      formData_2: {
        value: '',
        priceFix: 8,
        errorText: '',
        isError: false,
        disabled: false,
        disabledText: '',
        style: 'width: 63%',
        errorHeight: '-30px',
        imgSrc: 'https://saas2-s3-public-01.s3.ap-northeast-1.amazonaws.com/1317/upload/20220414171408884.png',
        units: 'BTC',
        isAll: false,
      },
      timer: null, // 资产轮询
      timerGetPrices: null, // 档位轮询
      prices: [], // 档位 list
      isFormSumbit: true,
      currentInput: 'formData_1', // formData_2 输入数量  formData_1 输入价格

    };
  },
  props: {
    dataCoinList: {
      type: Array,
      default: null,
    },
    symbolCurrent: {
      type: Object,
      default: null,
    },
  },
  computed: {
    // 是否Login
    isLogin() {
      return this.$store.state.baseData.isLogin;
    },
    // 认证信息
    idAuth() {
      let idAuth = 0;
      if (this.userInfo) {
        idAuth = Number(this.userInfo.authLevel);
      }
      return idAuth;
    },
    // 买入卖出按钮样式
    transactionButtons() {
      const style = {
        buyButton: {
          hoverClass: 'rise-1-bg buttonStyleColor text-4-cl',
          activeClass: 'rise-1-bg buttonStyleColor text-4-cl',
        },
        sellButton: {
          hoverClass: 'fall-1-bg buttonStyleColor text-4-cl',
          activeClass: 'fall-1-bg buttonStyleColor text-4-cl',
        },
      };
      if (this.currentFormType === 'sell') {
        style.buyButton.defaultClass = 'fill-3-bg text-2-cl';
        style.sellButton.defaultClass = 'fall-1-bg buttonStyleColor text-4-cl';
      } else {
        style.sellButton.defaultClass = 'fill-3-bg text-2-cl';
        style.buyButton.defaultClass = 'rise-1-bg buttonStyleColor text-4-cl';
      }
      return style;
    },
    // 按钮信息
    buttosContent() {
      return {
        buyButton: {
          text: this.isLogin
            ? this.$t('h5Add.confirm')
            : this.$t('trade.loginReg'), // '登录/注册',
          // eslint-disable-next-line no-nested-ternary
          class: this.isLogin ? (this.isFormSumbit ? 'fill-7-bg text-2-cl' : 'rise-1-bg buyBtn buttonStyleColor text-6-cl') : 'fill-3-bg buyBtn text-1-cl',
        },
        sellButton: {
          text: this.isLogin
            ? this.$t('h5Add.confirm')
            : this.$t('trade.loginReg'), // '登录/注册',
          // eslint-disable-next-line no-nested-ternary
          class: this.isLogin ? (this.isFormSumbit ? 'fill-7-bg text-2-cl' : 'fall-1-bg sellBtn buttonStyleColor text-6-cl') : 'fill-3-bg sellBtn text-1-cl',
        },
        unlockSellButton: {
          text: this.isLogin ? '一键解锁卖出' : this.$t('trade.loginReg'), // '登录/注册',
          class: this.isLogin ? 'fall-1-bg sellBtn buttonStyleColor' : 'fill-3-bg sellBtn text-1-cl',
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
      if (this.accountBalance && this.symbolCurrent) {
        const { allCoinMap } = this.accountBalance;
        const { coin } = this.symbolCurrent;
        return {
          symbolAccoubt: allCoinMap[coin] ? fixD(allCoinMap[coin].normal_balance, 8) : '--',
          symbolAccoubtJPY: allCoinMap.JPY ? fixD(allCoinMap.JPY.normal_balance, 8) : '--',
        };
      }
      return {
        symbolAccoubt: '--',
        symbolAccoubtJPY: '--',
      };
    },
    // 交易是否开启了必须实名认证
    exchangeTradeKycOpen() {
      let isOpen = 0;
      if (this.baseData && this.baseData.kycLimitConfig) {
        isOpen = this.baseData.kycLimitConfig.exchange_trade_kyc_open;
      }
      return Number(isOpen);
    },
    watchObj() {
      return {
        symbolCurrent: this.symbolCurrent,
        isLogin: this.isLogin,
      };
    },
  },
  watch: {
    watchObj: {
      deep: true,
      handler(v, oldval) {
        if (v) {
          if (oldval && oldval.symbolCurrent.coin && oldval.symbolCurrent.coin === v.symbolCurrent.coin && v.isLogin === oldval.isLogin) {
            return;
          }
          this.clearValue();
          if (v.isLogin && v.isLogin !== oldval.isLogin) {
            this.$store.dispatch('assetsExchangeData', {
              auto: false,
              coinSymbols: this.symbolCurrent.coin,
            });
            this.interValGetAssets();
          }
          if (!v.symbolCurrent.coin) {
            return;
          }
          // 获取价格挡位
          this.getPricesList();
          this.interValGetPricesList();
          this.formData_2.imgSrc = this.symbolCurrent.img;
          this.formData_2.units = this.symbolCurrent.showName ? this.symbolCurrent.showName : this.symbolCurrent.coin;
          this.formData_1.priceFix = this.symbolCurrent.priceScale;
          this.formData_2.priceFix = this.symbolCurrent.volumeScale;
        }
      },
    },
    // 监听当前挡位 如果发生变化 则 刷新当前输入的值
    prices: {
      deep: true,
      handler(newVal, oldVal) {
        if (newVal && newVal.length) {
          if ((!oldVal || !oldVal.length) || (JSON.stringify(newVal) === JSON.stringify(oldVal))) {
            return;
          }
          if (newVal[0].currentFormType !== oldVal[0].currentFormType) {
            return;
          }
          if (!this.formData_1.value && !this.formData_2.value) {
            return;
          }
          // 买入
          if (this.currentInput === 'formData_1' && this[this.currentInput].value) {
            this.setCorrelationVal('formData_2', this[this.currentInput].value);
          }
          if (this.currentInput === 'formData_2' && this[this.currentInput].value) {
            this.setCorrelationVal('formData_1', this[this.currentInput].value);
          }
          this.verifyInput();
        }
      },
    },
  },
  methods: {
    init() {
      this.copyFormData_1 = this.formData_1;
      this.copyFormData_2 = this.formData_2;
    },
    setOrderType(type) {
      if (type === 'sell') {
        this.formData_1.isAll = false;
        this.formData_2.isAll = true;
      } else {
        this.formData_1.isAll = true;
        this.formData_2.isAll = false;
      }
      this.currentFormType = type;
      this.clearValue();
    },
    confirmSubmit(side) {
      if (!this.isLogin) {
        this.$router.push('/login');
      }
      this.submit(side);
    },
    submit(side) {
      if (!this.isLogin) {
        this.$router.push('/login');
      } else {
        const params = {
          side,
          coin: this.symbolCurrent.coin,
        };
        if (side === 'BUY') {
          params.volume = this.formData_1.value;
          params.price = this.getCurrentLevel(this.formData_1.value, 'level', 'jpy');
        } else {
          params.volume = this.formData_2.value;
          params.price = this.getCurrentLevel(this.formData_2.value, 'base', 'jpy');
        }
        this.axios({
          url: 'jp/order/create',
          params,
        }).then((data) => {
          if (data.code.toString() === '0') {
            this.clearValue();
            this.$emit('refresh');
            // 重新请求资产
            this.$store.dispatch('assetsExchangeData', {
              auto: false,
              coinSymbols: this.coinSymbols,
            });
            // 提示成功 下单成功
            this.$bus.$emit('tip', { text: this.$t('creditCardPurchase.transSuccess'), type: 'success' });
          } else {
            this.$bus.$emit('tip', { text: data.msg, type: 'error' });
          }
        });
      }
    },
    // 清空 表单数据
    clearValue() {
      const formKey = ['formData_1', 'formData_2'];
      formKey.forEach((item) => {
        this[item].value = '';
        this[item].isError = false;
        this[item].subText = null;
      });
      this.isFormSumbit = true;
      this.currentInput = 'formData_1';
    },
    // 轮训请求资产接口
    interValGetAssets() {
      clearInterval(this.timer);
      this.timer = setInterval(() => {
        // 重新请求资产
        this.$store.dispatch('assetsExchangeData', {
          auto: false,
          coinSymbols: this.symbolCurrent.coin,
        });
        if (!this.isLogin) {
          clearInterval(this.timer);
        }
      }, 3000);
    },
    // 档位 接口轮询
    interValGetPricesList() {
      clearInterval(this.timerGetPrices);
      this.timerGetPrices = setInterval(() => {
        // 重新请求资产
        this.getPricesList();
      }, 3000);
    },
    // 挡位接口获取
    getPricesList() {
      this.axios({
        url: 'jp/public/prices',
        headers: {},
        params: {
          coin: this.symbolCurrent.coin,
          side: this.currentFormType,
        },
        method: 'post',
      }).then((data) => {
        if (data.code === '0') {
          const arr = [];
          // eslint-disable-next-line no-unused-expressions,array-callback-return
          data.data && data.data.map((item) => {
            arr.push({ ...item, currentFormType: this.currentFormType });
          });
          this.prices = arr;
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
    // JPY 输入
    onChaneFormJPY(val) {
      this.currentInput = 'formData_1';
      this.formData_1.value = val.value;
      this.setCorrelationVal('formData_2', val.value);
      if (!val || !this.formData_2.value) {
        this.isFormSumbit = true;
      } else {
        this.isFormSumbit = false;
      }
      // 开始验证前清空上一个输入框的状态
      this.formData_2.isError = false;
      this.formData_2.errorText = '';
      this.verifyInput();
    },
    // coin 输入
    // eslint-disable-next-line array-callback-return
    onChaneFormCoin(val) {
      this.currentInput = 'formData_2';
      this.formData_2.value = val.value;
      this.setCorrelationVal('formData_1', val.value);
      if (!val || !this.formData_1.value) {
        this.isFormSumbit = true;
      } else {
        this.isFormSumbit = false;
      }
      // 开始验证前清空上一个输入框的状态
      this.formData_1.isError = false;
      this.formData_1.errorText = '';
      this.verifyInput();
    },
    // 校验 输入内容
    // eslint-disable-next-line consistent-return
    verifyInput() {
      if (!this.isLogin) {
        this.isFormSumbit = true;
        return false;
      }
      this.verifyInputFn(this.currentInput);
      if (!this[this.currentInput].isError) {
        this.verifyInputFn(this.currentInput === 'formData_1' ? 'formData_2' : 'formData_1');
      }
    },
    // eslint-disable-next-line consistent-return
    verifyInputFn(type) {
      const {
        priceMin, priceMax, volumeMin, volumeMax, showName,
      } = this.symbolCurrent;
      const val = this[type].value;
      const min = type === 'formData_1' ? priceMin : volumeMin;
      const max = type === 'formData_1' ? priceMax : volumeMax;
      const unit = type === 'formData_1' ? 'JPY' : showName;
      const remainingSum = type === 'formData_1' ? this.currenTaccount.symbolAccoubtJPY : this.currenTaccount.symbolAccoubt;
      let isNeedSum = false;
      if (type === 'formData_1' && this.currentFormType === 'buy') {
        isNeedSum = true;
      }
      if (type === 'formData_2' && this.currentFormType === 'sell') {
        isNeedSum = true;
      }
      // 判断 输入小于最小值
      if (this.transType(val) < this.transType(min)) {
        this[type].isError = true;
        this[type].errorText = type === 'formData_1' ? this.$t('sale.texta4', { count: min }) : this.$t('sale.texta3', { count: min, coin: unit });
        this.isFormSumbit = true;
        return false;
      }
      // 判断 输入大于余额
      if (isNeedSum && (remainingSum === '--' || this.transType(val) > this.transType(remainingSum))) {
        this[type].isError = true;
        this[type].errorText = this.$t('sale.texta7');
        this.isFormSumbit = true;
        return false;
      }
      // 判断 输入大于最大值
      if (this.transType(val) > this.transType(max)) {
        this[type].isError = true;
        this[type].errorText = type === 'formData_1' ? this.$t('sale.texta6', { count: max }) : this.$t('sale.texta5', { count: max, coin: unit });
        this.isFormSumbit = true;
        return false;
      }
      this[type].isError = false;
      this[type].errorText = '';
    },
    // 赋值 input Chaneg
    setCorrelationVal(type, val) {
      const diffKey = type === 'formData_2' ? 'level' : 'base';
      const computeKey = 'jpy';
      const num = this.getCurrentLevel(val, diffKey, computeKey);
      this[type].value = type === 'formData_2'
        ? fixD(division(this.transType(val), this.transType(num)), this.symbolCurrent.volumeScale)
        : fixD(nul(this.transType(val), this.transType(num)), this.symbolCurrent.priceScale);
    },
    // 当前 档位
    getCurrentLevel(val, diffKey, computeKey) {
      const list = this.prices;
      let num = 0;
      if (list && list.length) {
        list.forEach((item) => {
          if (num === 0 && this.transType(val) <= this.transType(item[diffKey])) {
            num = item[computeKey];
          }
        });
        if (num === 0 && this.transType(val) >= this.transType(list[list.length - 1][diffKey])) {
          num = list[list.length - 1][computeKey];
        }
      }
      return num;
    },

    // 监测参数是否为 字符串
    transType(val) {
      if (typeof val === 'string') {
        return Number(val);
      }
      return val;
    },
    toLogin(type) {
      if (type === 'login') {
        this.$router.push('/login');
      } else {
        this.$router.push('/register');
      }
    },
    clickAllTrade() {
      if (this.currentFormType === 'buy' && this.currenTaccount.symbolAccoubtJPY && this.currenTaccount.symbolAccoubtJPY !== '--') {
        this.formData_1.value = fixD(this.currenTaccount.symbolAccoubtJPY, this.symbolCurrent.priceScale);
        this.setCorrelationVal('formData_2', this.currenTaccount.symbolAccoubtJPY);
        if (!this.currenTaccount.symbolAccoubtJPY || !this.formData_2.value) {
          this.isFormSumbit = true;
        } else {
          this.isFormSumbit = false;
        }
        this.verifyInput();
      } else if (this.currentFormType === 'sell' && this.currenTaccount.symbolAccoubt && this.currenTaccount.symbolAccoubt !== '--') {
        this.formData_2.value = fixD(this.currenTaccount.symbolAccoubt, this.symbolCurrent.volumeScale);
        this.setCorrelationVal('formData_1', this.currenTaccount.symbolAccoubt);
        if (!this.currenTaccount.symbolAccoubt || !this.formData_1.value) {
          this.isFormSumbit = true;
        } else {
          this.isFormSumbit = false;
        }
        this.verifyInput();
      }
    },
  },
  destroyed() {
    clearInterval(this.timer);
    clearInterval(this.timerGetPrices);
  },
};
