import {
  fixD, fixInput, getCoinShowName, imgMap, getIconPath,
} from '@/utils';

export default {
  props: {
    // 杠杆账户数据
    leverMap: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      getIconPath,
      imgMap,
      showTransfer: false, // 划转弹窗
      transferAccount: '', // 划转账户
      transferSide: 1, // 划转方向 1 币币-其他账户 2 其他账户-币币
      transferSymbol: '', // 划转币对
      leverCoinList: [], // 杠杆币种列表
      transferCoin: '', // 划转币种
      transferNum: '', // 划转数量
      symbolList: [], // 币对
      symbolName: '',
      leverBalance: {},
    };
  },
  watch: {
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
        if (!this.transferCoin
          || (this.transferCoin !== baseCoin && this.transferCoin !== quoteCoin)) {
          this.transferCoin = this.leverCoinList[0].code;
        }
      } else {
        this.leverCoinList = [];
      }
    },
    transferNum(v) {
      this.transferNum = fixInput(v, this.transferCoinFix);
    },
    symbolName(v) {
      if (v) {
        this.getLeverBalance();
      }
    },
    leverMap: {
      handler(v) {
        if (v) {
          this.setLeverData();
        }
      },
      deep: true,
    },
  },
  computed: {
    market() {
      return this.$store.state.baseData.market;
    },
    transferWarningText() {
      const text = this.$t('assets.otcAccount.can'); // 可转
      let num = fixD(this.transferCanNum, this.transferCoinFix);
      if (this.transferSide === 2) {
        num = fixD(this.transferCanNum, 8);
      }
      return `${text}${num} ${this.getShowCoin(this.transferCoin)}`;
    },
    transferCoinFix() {
      let fix = 0;
      if (this.market && this.market.coinList && this.market.coinList[this.transferCoin]) {
        fix = this.market.coinList[this.transferCoin].showPrecision;
      }
      return Number(fix);
    },
    transferError() {
      let flag = false;
      if (parseFloat(this.transferNum) > parseFloat(this.transferCanNum)) {
        flag = true;
      }
      return flag;
    },
    // 可划转数量
    transferCanNum() {
      let balance = 0;
      if (this.transferSide === 1) {
        balance = this.exchangeAvailable;
      } else {
        balance = this.otherAvailable;
      }
      return Number(balance);
    },
    transferDisabled() {
      return !Number(this.transferNum) || !this.transferCoin || this.transferError;
    },
    transferBalance() {
      if (this.transferCoin && this.leverBalance) {
        const fix = this.market.coinList[this.transferCoin].showPrecision;
        const symbolItem = this.leverBalance;
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
    init() {
      this.$bus.$on('openTransfer', (name, coin, symbol) => {
        if (name) {
          this.transferSymbol = name;
          this.symbolName = symbol;
        }
        if (coin) {
          this.transferCoin = coin;
        }
        this.showTransfer = true;
      });
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
    showLoading(flag) {
      this.$emit('showLoading', flag);
    },
    getLeverBalance() {
      this.showLoading(true);
      this.axios({
        url: 'lever/finance/symbol/balance',
        params: {
          symbol: this.symbolName,
        },
      }).then((data) => {
        this.showLoading(false);
        if (data.code.toString() === '0') {
          this.leverBalance = data.data;
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
    // 处理杠杆 币对数据
    setLeverData() {
      const { coinList } = this.market;
      const list = [];
      const { leverMap } = this;
      Object.keys(leverMap).forEach((item) => {
        list.push({
          symbol: leverMap[item].symbol,
          code: leverMap[item].name,
          value: `${getCoinShowName(leverMap[item].baseCoin, coinList)}/${getCoinShowName(leverMap[item].quoteCoin, coinList)}`,
        });
      });
      this.symbolList = [...list];
      if (!this.transferSymbol) {
        this.transferSymbol = this.symbolList[0].code;
      }
      if (!this.symbolName) {
        this.symbolName = this.symbolList[0].symbol;
      }
      this.showLoading(false);
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
    confirmTransfer() {
      this.showLoading(true);
      const params = {
        fromAccount: this.transferSide === 1 ? '1' : '2',
        toAccount: this.transferSide === 1 ? '2' : '1',
        amount: this.transferNum,
        coinSymbol: this.transferCoin,
        symbol: this.symbolName,
      };
      this.axios({
        url: 'lever/finance/transfer',
        params,
      }).then((data) => {
        this.showLoading(false);
        if (data.code.toString() === '0') {
          this.clearTransfer();
          this.showTransfer = false;
          this.$emit('success');
          this.$bus.$emit('tip', { text: data.msg, type: 'success' });
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
    clearTransfer() {
      this.transferSide = 1;
      this.transferNum = '';
      this.transferSymbol = '';
      this.transferCoin = '';
      this.symbolName = '';
    },
    // 修改
    selectChange(item, name) {
      this[name] = item.code;
      if (item.symbol) {
        this.symbolName = item.symbol;
      }
    },
    inputChange(value, name) {
      this[name] = value;
    },
  },
};
