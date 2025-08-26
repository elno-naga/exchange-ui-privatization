// 信用卡入金
import {
  getIconPath, imgMap, fixD, getCookie,
} from '@/utils';
import applepay from '@/views/creditCardPurchase/img/applepay.png';
import mastercard from '@/views/creditCardPurchase/img/mastercard.png';
import visa from '@/views/creditCardPurchase/img/visa.png';

export default {
  name: 'creditCardPurchase',
  data() {
    const defaultMin = 1;
    const defaultMax = 1000;
    return {
      imgMap,
      getIconPath,
      coinList: [], // 虚拟币集合
      coin: '', // 虚拟币别名
      coinName: '', // 虚拟币别名
      coinVal: '', // 虚拟币
      coinNumber: '', // 国家的货币个数
      numberRange: ['', ''], // 国家的货币范围[min-max]
      defaultMin,
      defaultMax,
      fiatList: [], // 国家的货币集合
      fiat: '', // 国家的货币
      rateList: [], // 支持当前兑换的第三方集合
      activeRate: {}, // 选中的支付方式
      countDown: 30, //  倒计时
      timer: null,
      timeout: null, // 延迟执行，避免连续输入
      agreeProtocol: false, // 是否同意协议
      confirmLoading: false, // 继续按钮加载中
      paymentDetails: {}, // 付款详情
      paymentSubmitInfo: {}, // 即将跳转的信息
      tradeDirection: 'buy',
      hoverItem: null,
      amountList: {},
      loadingRate: false,
      loadingOrderDetail: false,
      threeFlag: false,
    };
  },
  created() {
  },
  computed: {
    themeDark() {
      const theme = getCookie('cusSkin') || getCookie('defSkin') || '1';
      return theme.toString() === '1';
    },
    currentLan() {
      if (this.$store.state.baseData) {
        return this.$store.state.baseData.lan;
      }
      return null;
    },
    // market 接口
    market() {
      return this.$store.state.baseData.market;
    },
    userAmount() {
      const current = this.amountList[this.coinName];
      if (current) {
        const { coinList } = this.market;
        const fix = coinList[this.coinName].showPrecision || 0;
        return {
          count: fixD(current.normal_balance, fix),
          unit: current.coinName,
        };
      }
      return null;
    },
    isBuy() {
      return this.tradeDirection === 'buy';
    },
    // 输入框的错误
    digitalCashObj() {
      let obj = {
        errorFlag: false,
        errorText: '',
      };
      const numMin = Number(this.numberRange[0]);
      const numMax = Number(this.numberRange[1]);
      if (numMin && numMax) {
        // 不在国家的货币范围,提示单笔限额
        if (this.coinNumber && (numMin > this.coinNumber || this.coinNumber > numMax)) {
          // 最大最小判断
          obj = {
            errorFlag: true,
            errorType: 'limit',
            errorText: this.errorTip(this.numberRange),
          };
        } else if (!this.isBuy && this.coinNumber && this.coinNumber > (this.userAmount ? Number(this.userAmount.count) : 0)) {
          obj = {
            errorFlag: true,
            errorType: 'limitAmount',
            errorText: this.errorTipSell,
          };
        }
      }
      return obj;
    },
    // 错误提示文字
    errorTip() {
      return (range) => `${this.$t('creditCardPurchase.singleLimit')}
        ${range[0]}-${range[1]} ${this.isBuy ? this.fiat : this.coin}`;
    },
    errorTipSell() {
      if (this.userAmount) {
        const { count, unit } = this.userAmount;
        return `${this.$t('creditCardPurchase.useAmount')}：${count}${unit}`;
      }
      return '';
    },
    isInputValue() {
      // 输入框有值，并且不等于0
      return this.coinNumber !== '' && this.coinNumber !== '0';
    },
    // 按钮是否可以点击
    confirmDisabled() {
      const flag = true;
      // 输入框不为空 this.isInputValue
      // 输入框不报错 !digitalCashObj.errorFlag
      // 同意协议 this.agreeProtocol
      // 付款信息数据全部获取成功 Object.keys(this.paymentDetails).length > 0
      if (
        this.isInputValue
        && !this.digitalCashObj.errorFlag
        && this.agreeProtocol
        && Object.keys(this.paymentDetails).length > 0
      ) {
        return false;
      }
      return flag;
    },
    isLogin() {
      if (this.$store.state.baseData.isLogin) {
        return this.$store.state.baseData.isLogin;
      }
      return false;
    },
  },
  watch: {
    coinList(newVal) {
      const currentHas = newVal.filter((item) => (item.code === this.coinVal)).length > 0;
      if (currentHas) {
        return;
      }
      const showItem = newVal[0];
      if (!showItem) {
        return;
      }
      this.coin = showItem.alias ? showItem.alias : showItem.name;
      this.coinName = showItem.mainChainSymbol;
      this.coinVal = showItem.code;
    },
    fiatList(newVal) {
      const currentHas = newVal.filter((item) => (item.name === this.fiat)).length > 0;
      if (!currentHas) {
        const defaultVal = newVal.find((item) => item.name === 'USD');
        const showItem = defaultVal || newVal[0];
        if (!showItem) {
          return;
        }
        this.fiat = showItem.name;
      }
      if (this.fiat && this.coin) {
        this.getPaycardRateList();
      }
    },
    activeRate: {
      handler() {
        this.agreeProtocol = false;
      },
      deep: true,
    },
  },
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  },
  methods: {
    getCoinAmount() {
      this.axios({
        url: 'finance/v4/account_balance',
        params: {},
      })
        .then((res) => {
          this.amountList = res.data.allCoinMap || {};
        });
    },
    init() {
      this.getThirdSupportFiat();
      this.getCoinAmount();
    },
    changeDirection() {
      const direction = this.isBuy ? 2 : 1;
      this.getThirdSupportFiat(direction, (canChange) => {
        if (canChange) {
          const currentDirection = this.tradeDirection;
          this.tradeDirection = currentDirection === 'buy' ? 'sell' : 'buy';
          this.coinNumber = '';
          this.activeRate = {};
        }
      });
    },
    gotuRecord() {
      this.$router.push({
        path: '/order/otcOrder',
      });
    },
    // 触发国家的货币的改变
    handleChangeSelect(row) {
      const currentKey = this.isBuy ? 'fiat' : 'coin';
      if (this[currentKey] !== row.value) {
        this.coinNumber = '';
        this[currentKey] = row.value;
        this[`${currentKey}Val`] = row.code;
        this.handleChangeInfo();
        if (currentKey === 'coin') {
          this.coinName = row.mainChainSymbol;
        }
      }
    },
    // input rule
    inputRuleFn(val) {
      if (!val) return val;
      let value = '';
      if (this.isBuy) {
        value = val.replace(/[^\d]/g, '').replace(/^0[0-9]*/g, '');
      } else {
        const a = val.match(/\d+\.?\d{0,}/g, '');
        value = a ? a[0].replace(/^0[0-9]*/g, '0') : '';
      }
      return value;
    },
    // 触发购买数量的改变
    handleChangeInput(v, name) {
      if (this.isBuy) {
        this[name] = Number(v) === 0 ? '' : v;
      } else {
        this[name] = v;
      }
      if (this.timeout) {
        clearInterval(this.timeout);
      }
      this.timeout = setTimeout(() => {
        this.getPaycardRateList();
        // 获取第三方
      }, 500);
    },
    // 触发虚拟币改变值
    handleChangeConvertible(row) {
      const currentKey = this.isBuy ? 'coin' : 'fiat';
      if (this[currentKey] !== row.value) {
        this.coinNumber = '';
        this[currentKey] = row.value;
        this[`${currentKey}Val`] = row.code;
        this.handleChangeInfo();
        if (currentKey === 'coin') {
          this.coinName = row.mainChainSymbol;
        }
      }
    },
    handleChangeInfo() {
      if (this.fiat && this.coin) {
        this.getPaycardRateList();
      }
    },
    // 触发支付方式改变值
    handleChangePayment(row) {
      if (this.coinNumber) {
        if (this.digitalCashObj.errorFlag) {
          switch (this.digitalCashObj.errorType) {
            case 'limitAmount': this.$bus.$emit('tip', { text: this.$t('creditCardPurchase.overflowAmountTip'), type: 'error' }); break;
            default: this.$bus.$emit('tip', { text: this.$t('creditCardPurchase.inputErrorTip'), type: 'error' }); break;
          }
        } else {
          this.activeRate = row;
          this.getPaycardNum(true);
        }
      } else {
        this.$bus.$emit('tip', { text: this.$t('creditCardPurchase.enterAmount'), type: 'error' });
      }
    },
    handleCountDown() {
      const that = this;
      if (this.timer) {
        clearInterval(this.timer);
        // 刷新支持当前兑换的第三方集合
      }
      this.countDown = 30;
      this.timer = setInterval(() => {
        if (that.countDown === 0) {
          that.countDown = 31;
          // 刷新支持当前兑换的第三方集合
          that.getPaycardRateList('time');
        }
        // that.countDown -= 1;
      }, 1000);
    },
    // 获取币种列表
    getThirdSupportFiat(direction, callback) {
      const transferType = direction || (this.isBuy ? 1 : 2);
      this.axios({
        url: this.$store.state.url.creditCardPurchase.get_third_support_fiat,
        method: 'post',
        params: {
          transferType,
        },
      }).then((data) => {
        if (data.code.toString() === '0') {
          if (data.data.status === 0) {
            setTimeout(() => {
              this.$bus.$emit('messageBox', 'fail', {
                title: this.$t(`creditCardPurchase.${transferType === 1 ? 'noBuy' : 'noSell'}`),
                confirmBtnText: this.$t('creditCardPurchase.continue'),
                callback: () => {},
              });
            }, 1000);
          } else {
            this.coinList = data.data.coin_list.map((item) => {
              const obj = { ...item };
              obj.code = item.name;
              obj.value = item.alias ? item.alias : item.name;
              obj.name = item.name;
              return obj;
            });
            this.fiatList = data.data.fiat_list.map((item) => {
              const obj = { ...item };
              obj.code = item.name;
              obj.value = item.name;
              return obj;
            });
          }
          if (callback) {
            callback(data.data.status !== 0);
          }
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
          this.coinList = [];
          this.fiatList = [];
        }
      });
    },
    // 获取第三方列表
    getPaycardRateList(type) {
      if (this.timer) {
        clearInterval(this.timer);
      }
      if (!this.fiat || !this.coin) {
        return;
      }
      if (type !== 'time') {
        this.loadingRate = true;
        this.threeFlag = false;
      }
      this.numberRange = ['', ''];
      this.axios({
        url: this.$store.state.url.creditCardPurchase.get_paycard_rate_list,
        method: 'post',
        params: {
          fiat: this.fiat,
          coin: this.coinVal,
          transferType: this.isBuy ? 1 : 2,
          sourceAmount: this.coinNumber ? Number(this.coinNumber) : '',
        },
      }).then((data) => {
        if (data.code.toString() === '0') {
          const { min, max } = data.data;
          this.numberRange = [min || this.defaultMin, max || this.defaultMax]; // 默认
          this.rateList = data.data.rate_list.map((item) => {
            if (item.name !== 'simplex') {
              return item;
            }
            const picList = item.payment_pic ? item.payment_pic.split(',').map((key) => {
              let picUrl = '';
              switch (key) {
                case 'applepay': picUrl = applepay; break;
                case 'mastercard': picUrl = mastercard; break;
                case 'visa': picUrl = visa; break;
                default: picUrl = '';
              }
              return {
                payment_method_name: key,
                payment_pic: picUrl,
              };
            }) : [];
            return {
              ...item,
              payment_list: item.name !== 'simplex' ? (item.payment_list || []) : picList,
            };
          });
          // 如果默认没有值，或者值不在列表中，则设置第一个选中
          if (data.data.rate_list.length > 0) {
            if (this.activeRate.name && type !== 'time') {
              const currentHas = data.data.rate_list.filter((item) => (item.name === this.activeRate.name));
              if (currentHas.length === 0) {
                this.activeRate = {};
                this.paymentDetails = {};
              } else {
                this.getPaycardNum(type !== 'time');
              }
            }
            this.handleCountDown();
            this.threeFlag = true;
          } else {
            this.activeRate = {};
            this.countDown = 30;
          }
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
          this.rateList = [];
          this.activeRate = {};
          this.countDown = 30;
          this.numberRange = [this.defaultMin, this.defaultMax]; // 默认
        }
        this.loadingRate = false;
      });
    },
    // 获取付款详情
    getPaycardNum(needLoading) {
      if (this.fiat && this.coinNumber && this.coin && this.activeRate.name) {
        if (needLoading) {
          this.loadingOrderDetail = true;
        }
        this.axios({
          url: this.$store.state.url.creditCardPurchase.get_paycard_num,
          method: 'post',
          params: {
            fiat: this.fiat,
            coin: this.coinVal,
            num: this.coinNumber,
            name: this.activeRate.name,
            transferType: this.isBuy ? 1 : 2,
          },
        }).then((res) => {
          if (res.code.toString() === '0') {
            this.paymentDetails = { estimated: '5 ~ 30', ...res.data.data_map };
          } else {
            this.$bus.$emit('tip', { text: res.msg, type: 'error' });
          }
        }).finally(() => {
          this.loadingOrderDetail = false;
        });
      }
    },
    // 获取跳转第三方参数
    paymentSubmit() {
      const platformName = this.activeRate.name;
      const timeUnix = new Date().getTime();
      this.axios({
        url: this.$store.state.url.creditCardPurchase.payment_submit,
        method: 'post',
        params: {
          quote_id: this.paymentDetails.quote_id,
          name: this.activeRate.name,
          coin: this.coinVal,
          fiat: this.fiat,
          num: this.coinNumber,
          base_amount: this.paymentDetails.base_amount,
          total_amount: this.paymentDetails.total_amount,
          amount: this.paymentDetails.amount,
          rate: this.activeRate.rate,
          transferType: this.isBuy ? 1 : 2,
          sourceAmount: this.paymentDetails.source_amount,
          targetAmount: this.paymentDetails.target_amount,
          successUrl: `${window.location.origin}/${this.currentLan}/order/otcOrder?transId=${timeUnix}`,
          failUrl: `${window.location.href}${window.location.href.includes('?') ? '&' : '?'}transId=${timeUnix}`,
        },
      }).then((res) => {
        if (res.code.toString() === '0') {
          this.paymentSubmitInfo = {
            ...res.data.data_map,
            return_url_success: `${window.location.origin}/${this.currentLan}/order/otcOrder?transId=${timeUnix}`,
            return_url_fail: `${window.location.href}${window.location.href.includes('?') ? '&' : '?'}transId=${timeUnix}`,
          };
          window.sessionStorage.setItem(`trans_${timeUnix}`, timeUnix);
          this.handleLink(platformName);
        } else {
          this.$bus.$emit('tip', { text: res.msg, type: 'error' });
        }
      });
    },
    handleConfirm() {
      this.$bus.$emit('messageBox', 'tip', {
        title: this.$t('components.dialog.blackPrompt'),
        message: this.$t('creditCardPurchase.leaveTip', { name: this.activeRate.name }),
        confirmBtnText: this.$t('components.dialog.confirmText'),
        callback: (type) => {
          if (type === 'confirm') {
            this.paymentSubmit();
          }
        },
      });
    },

    handleLink(platformName) {
      if (this.timer) {
        clearInterval(this.timer);
      }
      this.$nextTick(() => {
        if (platformName === 'simplex') {
          this.$refs.paymentForm.submit(); // 仅simplex
        } else {
          window.location.href = this.paymentSubmitInfo.payment_post_url;
        }
      });
    },
  },
  mounted() {
    const { transId } = this.$route.query;
    const cacheId = window.sessionStorage.getItem(`trans_${transId}`);
    if (cacheId && cacheId === transId) {
      this.$nextTick(() => {
        this.$bus.$emit('messageBox', 'fail', {
          title: this.$t('creditCardPurchase.transFail'),
          message: this.$t('creditCardPurchase.failTip'),
          confirmBtnText: this.$t('creditCardPurchase.continue'),
          callback: () => {},
        });
        window.sessionStorage.removeItem(`trans_${transId}`);
      });
    }
  },
};
