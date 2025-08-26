import { fixD, fixInput, getIconPath } from '@/utils';

export default {
  name: 'forced-reminder',
  data() {
    return {
      getIconPath,
      // 是否可以提交
      dialogConfirmLoading: false,
      // 是否禁止提交
      // 当前币种
      axiosSymbol: '',
      // 当前币种真实名称
      axiosOriginalCoin: '',
      // 划转方向  true 币币-合约  false 合约-币币
      // direction: true,
      transferSide: '1',
      // 划转数量
      // value: '',
      transferValue: '',
      // 当前币种数据
      detailsData: {},
      // 币币可转
      exchangeAmount: null,
      // 合约可转
      contractAmount: null,
      // 体验金
      bounsAmount: null,
      // 币种列表
      // symbolList: [],
      selectSymbol: null,
    };
  },
  props: {
    isShow: {
      default: false,
      type: Boolean,
    },
    finish: {
      default: false,
      type: Boolean,
    },
    close: {
      default() {},
      type: Function,
    },
    symbol: {
      default: '',
      type: String,
    },
  },

  computed: {
    // 币种信息
    marginCoinInfor() {
      if (this.$store.state.future.marginCoinInfor) {
        return this.$store.state.future.marginCoinInfor;
      }
      return {};
    },
    // 保证金币种列表
    marginCoinList() {
      if (this.$store.state.future.marginCoinList) {
        return this.$store.state.future.marginCoinList;
      }
      return [];
    },

    symbolList() {
      if (this.accountBalanceMap) {
        const arr = [];
        const keyArr = Object.keys(this.accountBalanceMap);
        keyArr.forEach((item) => {
          const dataItem = this.accountBalanceMap[item];
          if (this.exSymbolList[dataItem.originalCoin]
            && this.exSymbolList[dataItem.originalCoin].isFiat
            && this.exSymbolList[dataItem.originalCoin].symbolType === 0) {
            console.log('');
          } else if (this.exSymbolList[dataItem.originalCoin]) {
            arr.push({ value: dataItem.symbol, code: dataItem.originalCoin });
          }
        });
        return arr;
      }
      return [];
    },
    // 用户合约资产
    accountBalanceMap() {
      if (this.$store.state && this.$store.state.future && this.$store.state.future.futureAccountBalance) {
        return this.$store.state.future.futureAccountBalance;
      }
      return {};
    },
    // 币币资产
    exchangeData() {
      if (this.$store.state.assets.exchangeData) {
        return this.$store.state.assets.exchangeData;
      }
      return null;
    },
    exSymbolList() {
      if (this.exchangeData && this.exchangeData.allCoinMap) {
        return this.exchangeData.allCoinMap;
      }
      return {};
    },
    // 币种精度
    showPrecision() {
      if (this.marginCoinInfor && this.axiosSymbol) {
        return this.marginCoinInfor[this.axiosSymbol].marginCoinPrecision;
      }
      return 4;
    },
    // 限制转入
    fundsInStatus() {
      if (this.marginCoinInfor && this.axiosSymbol) {
        return this.marginCoinInfor[this.axiosSymbol].fundsInStatus;
      }
      return false;
    },
    // 限制转出
    fundsOutStatus() {
      if (this.marginCoinInfor && this.axiosSymbol) {
        return this.marginCoinInfor[this.axiosSymbol].fundsOutStatus;
      }
      return false;
    },
    // 弹窗是否可点击
    dialogConfirmDisabled() {
      if (this.dialogConfirmLoading) { return false; }
      let flag = true;
      if (parseFloat(this.transferValue) > 0 && !this.transferError) {
        flag = false;
      }
      if (this.marginCoinInfor && this.axiosSymbol) {
        if (this.transferSide === '1') {
          if (this.axiosSymbol && !this.fundsInStatus) {
            flag = true;
          }
        } else if (this.transferSide === '2') {
          if (this.axiosSymbol && !this.fundsOutStatus) {
            flag = true;
          }
        }
      }

      return flag;
    },
    // 错误提示
    transferError() {
      let flag = false;
      // 限制最大数量\
      if (this.transferSide === '1') {
        if (parseFloat(this.transferValue) > parseFloat(this.exchangeAmount)) {
          flag = true;
        }
      } else if (this.transferSide === '2') {
        if (parseFloat(this.transferValue) > parseFloat(this.canTransferNum)) {
          flag = true;
        }
      }
      return flag;
    },
    // 划转input框可用文案
    // transferWarningText() {
    //   let text = this.$t('futures.transfer.canTransfer'); // 可转
    //   let num = null;
    //   if (this.marginCoinInfor && this.axiosSymbol) {
    //     text = this.$t('futures.transfer.canTransfer'); // 可转
    //     num = this.transferSide === '1'
    //       ? fixD(this.exchangeAmount, this.showPrecision)
    //       : fixD(this.contractAmount, this.showPrecision);
    //     return `${text} ${num} ${this.axiosSymbol}`;
    //   }
    //   return `${text} ${num} ${this.axiosSymbol}`;
    // },
    // 可划转
    canTransferNum() {
      if (this.marginCoinInfor && this.axiosSymbol) {
        if (this.transferSide === '1') {
          return fixD(this.exchangeAmount, this.showPrecision);
        }
        if (Number(this.bounsAmount) && this.contractAmount > Number(this.bounsAmount)) {
          return fixD(this.contractAmount - Number(this.bounsAmount), this.showPrecision);
        }
        return fixD(this.contractAmount, this.showPrecision);
      }
      return '--';
    },
    canTransferNumber() {
      let ex = '0.00';
      let co = '0.00';
      if (this.marginCoinInfor && this.axiosSymbol) {
        if (this.exchangeAmount) {
          ex = fixD(this.exchangeAmount, this.showPrecision);
        }
        if (Number(this.bounsAmount) && this.contractAmount > Number(this.bounsAmount)) {
          co = fixD(this.contractAmount - Number(this.bounsAmount), this.showPrecision);
        } else {
          co = fixD(this.contractAmount, this.showPrecision);
        }
      }
      return {
        ex,
        co,
      };
    },
    // 是否显示保证金
    showBouns() {
      if (Number(this.bounsAmount) !== 0) {
        return true;
      }
      return false;
    },
    // 限制划转
    confirmText() {
      let text = this.$t('futures.transfer.confirm'); // 确定
      if (this.marginCoinInfor && this.axiosSymbol) {
        if (this.transferSide === '1' && this.axiosSymbol && !this.fundsInStatus) {
          text = this.$t('futures.transfer.cantIn'); // 限制转入
        }
        if (this.transferSide === '2' && this.axiosSymbol && !this.fundsOutStatus) {
          text = this.$t('futures.transfer.cantOut'); // 限制转出
        }
      }
      return text;
    },
    // 方向
    side() {
      const ex = this.$t('futures.transfer.exchangeAccount');
      const co = this.$t('futures.transfer.coAccount');
      let from = '';
      let to = '';
      if (this.transferSide === '1') {
        from = ex;
        to = co;
      } else {
        from = co;
        to = ex;
      }
      return {
        from,
        to,
      };
    },
  },
  watch: {
    isShow(v) {
      if (v) {
        if (this.symbol && this.symbolList.length) {
          this.axiosSymbol = this.symbol;
        }
        this.getData();
      } else {
        this.axiosSymbol = '';
      }
    },
    symbolList(val, old) {
      if (!this.axiosSymbol) {
        if (val.length && !old.length) {
          if (this.selectSymbol) {
            this.axiosSymbol = this.selectSymbol;
          } else {
            this.axiosSymbol = val[0].value;
          }
        }
      }
    },
    axiosSymbol(v) {
      if (v && this.accountBalanceMap && this.accountBalanceMap[v]) {
        this.axiosOriginalCoin = this.accountBalanceMap[v].originalCoin;
        const { canUseAmount } = this.accountBalanceMap[v];
        this.contractAmount = Number(canUseAmount);
      }
    },
    // 币币余额
    exchangeData(v) {
      if (v && this.axiosOriginalCoin) {
        if (v.allCoinMap[this.axiosOriginalCoin] !== undefined) {
          const balance = v.allCoinMap[this.axiosOriginalCoin].normal_balance;
          const bounsBalnace = v.allCoinMap[this.axiosOriginalCoin].coupon_balance;
          this.exchangeAmount = fixD(balance, this.showPrecision);
          this.bounsAmount = fixD(bounsBalnace, this.showPrecision);
        } else {
          this.exchangeAmount = fixD(0, this.showPrecision);
          this.bounsAmount = fixD(0, this.showPrecision);
        }
      }
    },
    // 合约余额
    accountBalanceMap(v) {
      if (v && this.axiosSymbol) {
        const { canUseAmount } = v[this.axiosSymbol];
        this.contractAmount = Number(canUseAmount);
      }
    },
    // 切换币种
    selectSymbol(v) {
      if (v && this.isShow) {
        this.axiosSymbol = v;
        this.getData();
      }
    },
    transferValue(v) {
      if (v && this.showPrecision) {
        this.transferValue = fixInput(v, this.showPrecision);
      }
    },
  },
  methods: {
    init() {
      this.selectSymbol = this.symbol;
    },
    getData() {
      // 请求合约余额
      this.$store.dispatch('getPositionList');
      // 请求币币余额
      this.$store.dispatch('assetsExchangeData');
      // 重置
      this.transferValue = '';
    },
    symbolChange(item) {
      this.axiosSymbol = item.value;
      this.axiosOriginalCoin = item.code;
      this.getData();
    },
    inputLineChange(value, name) {
      this[name] = value;
    },
    dialogConfirm() {
      this.dialogConfirmLoading = true;
      // const { contractAccountType, walletAccountType } = this.detailsData;
      // if (this.transferSide === '1') {
      //   this.toContract();
      // } else {
      //   this.toExchange();
      // }
      this.toCoTransfer();
    },
    toCoTransfer() {
      this.axios({
        url: 'contract/co_transfer',
        hostType: 'ex',
        params: {
          // wallet_to_contract:币币划转至合约  contract_to_wallet:合约划转至币币
          transferType: this.transferSide === '1' ? 'wallet_to_contract' : 'contract_to_wallet',
          amount: Number(this.transferValue),
          coinSymbol: this.axiosOriginalCoin,
        },
        method: 'post',
      }).then((data) => {
        this.dialogConfirmLoading = false;
        if (data.code.toString() === '0') {
          this.close(true);
          this.$bus.$emit('tip', { text: data.msg, type: 'success' });
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
    // 从合约划转到币币
    toExchange() {
      this.axios({
        url: 'assets/saas_trans/co_to_ex',
        hostType: 'co',
        params: {
          amount: Number(this.transferValue),
          coinSymbol: this.axiosOriginalCoin,
        },
        method: 'post',
      }).then((data) => {
        this.dialogConfirmLoading = false;
        if (data.code.toString() === '0') {
          this.close(true);
          this.$bus.$emit('tip', { text: data.msg, type: 'success' });
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
    // 从币币到合约
    toContract() {
      this.axios({
        url: 'web/futures_transfer',
        hostType: 'ex',
        params: {
          amount: Number(this.transferValue),
          coinSymbol: this.axiosOriginalCoin,
        },
        method: 'post',
      }).then((data) => {
        this.dialogConfirmLoading = false;
        if (data.code.toString() === '0') {
          this.close(true);
          this.$bus.$emit('tip', { text: data.msg, type: 'success' });
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
    // 修改划转方向
    setTransferSide() {
      if (this.transferSide === '1') { this.transferSide = '2'; } else if (this.transferSide === '2') { this.transferSide = '1'; }
      this.transferValue = ''; // 重置划转数量
    },
    //  全部划转
    allTransfer() {
      if (this.transferSide === '1') {
        if (this.exchangeAmount === null) { return; }
        this.transferValue = this.exchangeAmount.toString();
      } else if (this.transferSide === '2') {
        if (!this.canTransferNum) { return; }
        this.transferValue = this.canTransferNum.toString();
      }
    },
  },
};
