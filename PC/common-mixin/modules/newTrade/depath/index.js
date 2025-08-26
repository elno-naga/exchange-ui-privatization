import {
  fixRate, myStorage, getCoinShowName, fixD, getIconPath,
} from '@/utils';

export default {
  name: 'market',
  data() {
    return {
      getIconPath,
      dataList: {
        asksData: [],
        buyData: [],
        depthMaxNumber: null,
      },
      cellWidth: [100, 90, 95],
      // 收起状态 盘口 和 实时成交显示哪个 ？
      shrinksDdpthNewShow: 'D',
      // 卖盘 高度
      sellHeight: 356,
      // 买盘 高度
      buyHeight: 356,
      // 显示条数
      sellLineNumber: 22,
      buyLineNumber: 22,
      // 当前选中的深度级别
      currentdepthClass: 0,
      // 当前选中的货币对
      symbolCurrent: myStorage.get('sSymbolName'),
      // 市场数据
      marketData: [],
      symbolsData_bf: {},
      maxHeeight: 712,
      minHeight: 356,
      totalBalancesHide: false,
      depthType: '',
      // 是否是移动端
      isMobile: window.isMobile,
      isShowJzIntroduce: true, // 净值说明
      timer: null,
      hoverType: null,
      showEtfText: false,
      gridFix: false,
    };
  },
  props: {
    moduleType: {
      type: String,
      default: 'ex',
    },
    etfPrice: {
      type: String,
      default: '',
    },
  },
  computed: {
    depthClass() {
      if (this.moduleType === 'lever') {
        return 'lever-depth-block';
      }
      return '';
    },
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
    rateData() {
      return this.$store.state.baseData.rate;
    },
    accountBalance() {
      if (this.$store.state.assets) {
        return this.$store.state.assets.assetsCoinData;
      }
      return null;
    },
    // 当前币对的资产
    currenTaccount() {
      if (this.accountBalance && this.symbolUnit && this.fixValue) {
        const { allCoinMap } = this.accountBalance;
        const { symbol, units } = this.symbolUnit;
        return {
          symbolAccoubt: allCoinMap[symbol]
            ? fixD(allCoinMap[symbol].normal_balance, this.fixValue.volumeFix)
            : '0',
          unitsAccoubt: allCoinMap[units]
            ? fixD(allCoinMap[units].normal_balance, this.fixValue.priceFix)
            : '0',
          symbolOpen: allCoinMap[symbol] ? allCoinMap[symbol].depositOpen : '0',
          unitsOpen: allCoinMap[units] ? allCoinMap[units].depositOpen : '0',
        };
      }
      return {
        symbolAccoubt: '0',
        unitsAccoubt: '0',
        symbolOpen: '0',
        unitsOpen: '0',
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
      return {};
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
    templateLayoutType() {
      const { activeName } = this.$route.meta;
      // 判断 如果是专业版交易页面 并且不是在手机端 则使用国际版的样式
      if (activeName && activeName.indexOf('proTrade') > -1 && !this.isMobile) {
        return '2';
      }
      return this.$store.state.baseData.templateLayoutType;
    },
    symbolAll() {
      return this.$store.state.baseData.symbolAll;
    },
    // 全部币种列表
    coinList() {
      if (this.$store.state.baseData && this.$store.state.baseData.market) {
        return this.$store.state.baseData.market.coinList;
      }
      return null;
    },
    theadList() {
      if (this.symbolCurrent) {
        const symbolCurrent = getCoinShowName(this.symbolCurrent, this.symbolAll).split('/');
        // 价格 数量 累计
        return [
          `${this.$t('trade.price')}(${symbolCurrent[1]})`,
          `${this.$t('trade.number')}(${symbolCurrent[0]})`,
          `${this.$t('trade.total')}(${symbolCurrent[0]})`,
        ];
      }
      return [
        `${this.$t('trade.price')}()`,
        `${this.$t('trade.number')}()`,
        `${this.$t('trade.total')}()`,
      ];
    },
    symbolsData() {
      if (this.marketData[this.symbolCurrent]) {
        return this.marketData[this.symbolCurrent];
      }
      return {
        name: '--',
        symbol: {
          symbol: '--',
          unit: '--',
        },
        close: {
          class: '',
          data: '--',
          price: '--',
        },
        amount: '--',
        rose: {
          class: '',
          data: '--',
        },
      };
    },
    // 深度选项
    depthOption() {
      // console.log('-------------->', this.symbolCurrent, this.symbolAll);
      if (this.symbolAll && this.symbolCurrent && this.symbolAll[this.symbolCurrent]) {
        const option = [];
        const arr = this.symbolAll[this.symbolCurrent].depth.split(',');
        [...new Set(arr)].forEach((item) => {
          const opt = item.split('.')[1] ? item.split('.')[1].length : '0';
          option.push(opt);
        });
        return option;
      }
      return [];
    },
    deptValue() {
      if (this.depthOption) {
        const val = this.depthOption[this.currentdepthClass];
        this.$bus.$emit('DEPTH_VALUE', val);
        return val;
      }
      return null;
    },
    depthOptions() {
      const options = [];
      this.depthOption.forEach((item) => {
        const temp = '0.';
        let str = temp.padEnd(item + 1, '0');
        str += '1';
        if (item.toString() === '0') {
          str = '1';
        }
        options.push({
          value: item,
          label: str,
        });
      });
      return options;
    },
    accuracyWidth() {
      const max = Math.max.apply(null, this.depthOption);
      if ((max * 12 + 20) < 40) {
        return '40px';
      }
      return `${max * 12 + 20}px`;
    },
  },
  watch: {
    deptValue(val) {
      if (val) {
        this.$bus.$emit('DEPTH_VALUE', val);
      }
    },
    minHeight(val) {
      if (this.sellHeight > 1 && this.buyHeight > 1 && this.templateLayoutType === '2') {
        const number = Math.floor(val / 16);
        this.sellLineNumber = number;
        this.buyLineNumber = number;
      }
    },
    symbolCurrent(val) {
      if (val && this.symbolAll[val] && this.symbolAll[val].etfOpen === 1) {
        this.isShowJzIntroduce = true;
      } else {
        this.isShowJzIntroduce = false;
      }
    },
  },
  beforeDestroy() {
    clearTimeout(this.timer);
  },
  methods: {
    getShowEtf(v) {
      let flag = false;
      const symbol = v;
      if (this.symbolAll
        && this.symbolAll[symbol]
        && this.symbolAll[symbol].etfOpen) {
        flag = true;
      }
      return flag;
    },
    init() {
      if (document.body.clientWidth < 961) {
        this.sellHeight = 100;
        // 买盘 高度
        this.buyHeight = 100;
        // 显示条数
        this.sellLineNumber = 5;
        this.buyLineNumber = 5;
      } else if (this.moduleType === 'lever') {
        // 卖盘 高度
        this.sellHeight = 356;
        // 买盘 高度
        this.buyHeight = 356;
        // 显示条数
        this.sellLineNumber = 22;
        this.buyLineNumber = 22;
        this.maxHeeight = 712;
        // 当前选中的货币对
        this.symbolCurrent = myStorage.get('leverSymbolName');
      }

      this.setBoxHeight();
      // 监听 深度数据
      this.$bus.$on('DEPTH_DATA', (data) => {
        if (data && this.symbolCurrent === data.symbol) {
          this.dataList = JSON.parse(JSON.stringify(data));
        } else {
          this.dataList = {
            asksData: [],
            buyData: [],
            depthMaxNumber: null,
          };
        }
      });
      // 监听 市场（最新价格） 数据
      this.$bus.$on('MARKET_DATA', (data) => {
        this.marketData = JSON.parse(JSON.stringify(data));
      });
      // 获取 当前选中的货币对
      this.$bus.$on('SYMBOL_CURRENT', (val) => {
        this.dataList = {
          asksData: [],
          buyData: [],
          depthMaxNumber: null,
        };
        this.symbolCurrent = val;
        this.currentdepthClass = 0;
      });
      // 监听 浏览器窗口大小改变
      // this.$bus.$on('WINFOW_ON_RESIIZE', () => {
      //   // 设置国际版TV的高度
      //   if (document.body.clientWidth < 961) {
      //     this.sellHeight = 100;
      //     this.buyHeight = 100;
      //     this.sellLineNumber = 5;
      //     this.buyLineNumber = 5;
      //   } else if (this.moduleType === 'lever') {
      //     this.sellHeight = 356;
      //     this.buyHeight = 356;
      //     this.sellLineNumber = 22;
      //     this.buyLineNumber = 22;
      //   } else {
      //     this.sellHeight = 356;
      //     this.buyHeight = 356;
      //     this.sellLineNumber = 22;
      //     this.buyLineNumber = 22;
      //   }
      //   if (this.proTrade) {
      //     this.sellHeight = 160;
      //     this.buyHeight = 160;
      //     this.sellLineNumber = 10;
      //     this.buyLineNumber = 10;
      //   }
      //   this.setBoxHeight(false);
      // });
    },
    handelTotal() {
      this.totalBalancesHide = !this.totalBalancesHide;
    },
    setBoxHeight(change = true) {
      if (this.templateLayoutType === '2') {
        // let depthBoxHeight = document.body.clientHeight;
        // if (depthBoxHeight < 800) {
        //   depthBoxHeight = 800;
        // }
        if (this.moduleType === 'lever') {
          this.maxHeeight = 712;
          this.minHeight = 356;
          if (this.proTrade) {
            this.sellHeight = 160;
            this.buyHeight = 160;
            this.sellLineNumber = 10;
            this.buyLineNumber = 10;
          }
          this.switchDepthType('', change);
        } else {
          if (this.proTrade) {
            this.maxHeeight = 320;
            this.sellHeight = 160;
            this.buyHeight = 160;
            this.sellLineNumber = 10;
            this.buyLineNumber = 10;
          } else {
            this.maxHeeight = 712;
            this.minHeight = 356;
          }
          this.switchDepthType('', change);
        }
      }
    },
    // 切换深度
    switchDepth(num) {
      this.currentdepthClass = num;
      this.$bus.$emit('DEPTH_CLASSES', this.currentdepthClass.toString());
    },
    switchBlock(type) {
      this.shrinksDdpthNewShow = type;
    },
    // 盘口 切换 全买盘 或者 全卖盘
    switchDepthType(type, change = true) {
      if (change) this.switchBlock('D');
      switch (type) {
        case 'sell':
          this.sellHeight = this.maxHeeight;
          this.buyHeight = 0;
          this.sellLineNumber = 44;
          this.buyLineNumber = 0;
          this.depthType = 'sell';
          if (this.proTrade) {
            this.sellLineNumber = 20;
          }
          break;
        case 'buy':
          this.sellHeight = 0;
          this.buyHeight = this.maxHeeight;
          this.sellLineNumber = 0;
          this.buyLineNumber = 44;
          this.depthType = 'buy';
          if (this.proTrade) {
            this.buyLineNumber = 20;
          }
          break;
        default:
          this.sellHeight = this.minHeight;
          this.buyHeight = this.minHeight;
          this.depthType = 'center';
          if (this.templateLayoutType === '2') {
            const number = Math.floor(this.minHeight / 16);
            this.sellLineNumber = number;
            this.buyLineNumber = number;
          } else {
            this.sellLineNumber = 22;
            this.buyLineNumber = 22;
          }
          if (this.proTrade) {
            this.sellLineNumber = 10;
            this.buyLineNumber = 10;
          }
      }
    },
    addActive(type) {
      this.timer = setTimeout(() => {
        this.hoverType = type;
      }, 500);
    },
    removeActive() {
      clearTimeout(this.timer);
      this.hoverType = null;
    },
    accuracyChange(item) {
      const num = this.depthOption.indexOf(item.value);
      this.switchDepth(num);
    },
  },
};
