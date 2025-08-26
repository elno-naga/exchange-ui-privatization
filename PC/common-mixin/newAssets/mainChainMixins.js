export default {
  data() {
    return {
      haveBranch: false, // 是否存在多主链
      branchArr: [],
      activeBranch: '', // 当前选中的子链
      mainChainName: '',
    };
  },
  methods: {
    branchInit(v, flag = '1', type) { // flag : 是否显示usdt 的 mainChainName, 1 显示 0 不显示   type 'withdraw'提现  recharge 充值
      const { coinList, followCoinList } = v;
      this.haveBranch = false;
      this.branchArr = [];
      this.activeBranch = '';
      this.mainChainName = this.symbol && coinList[this.symbol] && coinList[this.symbol].mainChainName;
      if (this.symbol && coinList[this.symbol]
        && coinList[this.symbol].mainChainType === 1) {
        this.haveBranch = true;
        if (followCoinList[this.symbol]) {
          const arr = [];
          const coinKeys = Object.keys(followCoinList[this.symbol]);
          coinKeys.forEach((item) => {
            const even = followCoinList[this.symbol][item];
            if (even.mainChainName === 'OMNI') {
              // flag值不为0 才会把usdt的mainChainName值为OMNI的链加入到数组中，omni只通过usdt_open_omni开关判断显示隐藏，其他链都过withdrawOpen depositOpen
              if (flag !== '0') {
                arr.push({ value: even.mainChainName, code: item });
              }
            } else {
              // withdrawOpen 提现 1显示tab  0不显示
              // depositOpen 充值 1显示tab  0不显示
              if (type === 'withdraw' && even.withdrawOpen === 1) {
                arr.push({ value: even.mainChainName, code: item });
              }
              if (type === 'recharge' && even.depositOpen === 1) {
                arr.push({ value: even.mainChainName, code: item });
              }
            }
          });
          this.branchArr = arr;
          if (coinKeys.indexOf(this.symbol) !== -1) {
            this.activeBranch = this.symbol;
          } else {
            const [activeBranch] = coinKeys;
            this.activeBranch = activeBranch;
          }
          // flag值为0 的时候 默认选中数组第一个
          if (flag === '0') {
            const newCoinKeys = coinKeys.filter((item) => item !== 'USDT');
            [this.activeBranch] = newCoinKeys;
          }
          // 取this.activeBranch对应的链名称赋值给this.mainChainName
          const obj = arr.find((item) => item.code === this.activeBranch) || {};
          this.mainChainName = obj.value;
        }
      }
    },
  },
};
