export default {
  data() {
    return {
      haveBranch: false, // 是否存在多主链
      showBranch: false,
      branchArr: [],
      activeBranch: '', // 当前选中的子链
      mainChainName: '',
    };
  },
  methods: {
    branchInit(v, type) {
      const { coinList, followCoinList } = v;
      this.haveBranch = false;
      this.branchArr = [];
      this.activeBranch = '';
      if (this.symbol && coinList[this.symbol]) {
        this.showBranch = true;
        const arr = [];
        if (coinList[this.symbol].mainChainType === 1) {
          if (followCoinList[this.symbol]) {
            this.haveBranch = true;
            // const coinKeys = Object.keys(followCoinList[this.symbol]);
            let arrs = followCoinList[this.symbol];
            arrs = Object.values(arrs);
            const arrSort = [...arrs].sort((a, b) => a.sort - b.sort);
            arrSort.forEach((item) => {
              if (type === 'withdraw' && item.followCoinWithdrawOpen) {
                arr.push({ value: item.mainChainName, code: item.name });
              }
              if (type === 'recharge' && item.followCoinDepositOpen) {
                arr.push({ value: item.mainChainName, code: item.name });
              }
              if (type === 'address') {
                arr.push({ value: item.mainChainName, code: item.name });
              }
            });
            // if (coinKeys.indexOf(this.symbol) !== -1) {
            //   this.activeBranch = this.symbol;
            // } else {
            //   const [activeBranch] = coinKeys;
            //   this.activeBranch = activeBranch;
            // }
          } else {
            arr.push({
              value: coinList[this.symbol].mainChainName, code: coinList[this.symbol].name,
            });
          }
        } else {
          arr.push({
            value: coinList[this.symbol].mainChainName, code: coinList[this.symbol].name,
          });
        }
        this.branchArr = arr;
        this.activeBranch = arr[0].code;
        this.mainChainName = arr[0].value;
      }
    },
  },
};
