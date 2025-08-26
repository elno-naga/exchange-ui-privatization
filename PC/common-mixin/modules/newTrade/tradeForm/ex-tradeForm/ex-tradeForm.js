import {
  myStorage, nul, getCoinShowName, fixRate,
  fixD, imgMap, division, cut, colorMap, getIconPath,
} from '@/utils';

export default {
  name: 'tableList',
  data() {
    return {
      getIconPath,
      formData_1: {
        title: '',
        units: myStorage.get('sSymbolName') ? myStorage.get('sSymbolName').split('/')[1] : 'USDT',
        subText: '',
        errorText: '',
        isError: false,
        disabled: false,
        disabledText: '',
        value: '',
      },
      formData_2: {
        title: '',
        units: myStorage.get('sSymbolName') ? myStorage.get('sSymbolName').split('/')[0] : 'USDT',
        subText: '',
        errorText: '',
        isError: false,
        disabled: false,
        disabledText: '',
        value: null,
      },
      formData_3: {
        title: '',
        units: myStorage.get('sSymbolName') ? myStorage.get('sSymbolName').split('/')[1] : 'USDT',
        subText: '',
        errorText: '',
        isError: false,
        disabled: false,
        disabledText: '',
        value: null,
      },
      formData_4: {
        title: '',
        units: myStorage.get('sSymbolName') ? myStorage.get('sSymbolName').split('/')[0] : 'USDT',
        subText: '',
        errorText: '',
        isError: false,
        disabled: false,
        disabledText: '',
        value: null,
      },
      formData_5: {
        title: '',
        units: myStorage.get('sSymbolName') ? myStorage.get('sSymbolName').split('/')[0] : 'USDT',
        subText: '',
        errorText: '',
        isError: false,
        disabled: true,
        disabledText: '',
        isShowUnit: true,
        value: null,
      },
      formData_6: {
        title: '',
        units: myStorage.get('sSymbolName') ? myStorage.get('sSymbolName').split('/')[0] : 'USDT',
        subText: '',
        errorText: '',
        isError: false,
        disabled: true,
        disabledText: '',
        isShowUnit: true,
        value: null,
      },
      // 交易类型 1限价 2 市价
      transactionType: 1,
      // 当前切换的货币对
      symbolCurrent: myStorage.get('sSymbolName'),
      // 百分比
      perArr: [25, 50, 75, 100],
      perBuy: null,
      perSell: null,
      // 防止多次提交
      fal: true,
      assetsInter: null,
      totalBalancesHide: false,
      unlockSellFlag: true, // 解锁卖出
      isShowDialog: false,
      imgMap,
      colorMap,
      tsTexttype: 1,
      marketData: [],
      gridType: 1, // 专业版选择自定义或者ai
      setType: 1, // 类型1等差2 等比
      setTypeHover: null,
      gridSetFormFlag: false,
      gridAiFormFlag: false,
      minimumOrderQuantity: 0, // 最小下单金额
      // 七日年化收益率
      sevenDay: '--',
      gridAiMin: '--', // 最大利润率
      gridAiMax: '--', // 最小利润率
      gridAiMinPrice: '--', // Ai 最小值
      gridAiMaxPrice: '--', // Ai 最大值
      fee: null, // 手续费
      // set代表自定义
      gridSetMin: {
        title: this.$t('trade5.gridTrade.setText1'),
        units: myStorage.get('sSymbolName') ? myStorage.get('sSymbolName').split('/')[1] : 'USDT',
        errorText: '',
        isError: false,
        disabled: false,
        disabledText: '',
        errorHeight: '-30px',
        value: '',
      },
      gridSetMax: {
        title: this.$t('trade5.gridTrade.setText2'),
        units: myStorage.get('sSymbolName') ? myStorage.get('sSymbolName').split('/')[1] : 'USDT',
        errorText: '',
        isError: false,
        disabled: false,
        disabledText: '',
        errorHeight: '-30px',
        value: '',
      },
      // 数量
      gridSetNum: {
        title: this.$t('gridTrade.setText5'),
        units: '',
        errorText: '',
        isError: false,
        disabled: false,
        disabledText: '',
        errorHeight: '-30px',
        value: '',
      },
      // 资产
      gridSetAccount: {
        title: this.$t('gridTrade.setText10'),
        units: myStorage.get('sSymbolName') ? myStorage.get('sSymbolName').split('/')[1] : 'USDT',
        errorText: '',
        isError: false,
        disabled: false,
        disabledText: '',
        style: 'width: 63%',
        errorHeight: '-30px',
        value: '',
      },
      // 止盈价格
      gridSetMaxBalance: {
        title: this.$t('gridTrade.setText11'),
        units: myStorage.get('sSymbolName') ? myStorage.get('sSymbolName').split('/')[1] : 'USDT',
        errorText: '',
        isError: false,
        disabled: false,
        disabledText: '',
        style: 'width: 63%',
        errorHeight: '-30px',
        value: '',
      },
      // 止损价格
      gridSetMinBalance: {
        title: this.$t('gridTrade.setText12'),
        units: myStorage.get('sSymbolName') ? myStorage.get('sSymbolName').split('/')[1] : 'USDT',
        errorText: '',
        isError: false,
        disabled: false,
        disabledText: '',
        style: 'width: 63%',
        errorHeight: '-30px',
        value: '',
      },
      gridAiBlance: {
        title: this.$t('gridTrade.setText2'),
        units: myStorage.get('sSymbolName') ? myStorage.get('sSymbolName').split('/')[1] : 'USDT',
        errorText: '',
        isError: false,
        disabled: true,
        disabledText: '',
        errorHeight: '-30px',
        value: '',
      },
      gridAiNum: {
        title: this.$t('gridTrade.setText5'),
        units: myStorage.get('sSymbolName') ? myStorage.get('sSymbolName').split('/')[1] : 'USDT',
        errorText: '',
        isError: false,
        disabled: true,
        disabledText: '',
        errorHeight: '-30px',
        value: '',
      },
      gridAiAccount: {
        title: this.$t('gridTrade.setText10'),
        units: myStorage.get('sSymbolName') ? myStorage.get('sSymbolName').split('/')[1] : 'USDT',
        errorText: '',
        isError: false,
        disabled: false,
        disabledText: '',
        style: 'width: 63%',
        errorHeight: '-30px',
        value: '',
      },
      gridAiMaxBalance: {
        title: this.$t('gridTrade.setText11'),
        units: myStorage.get('sSymbolName') ? myStorage.get('sSymbolName').split('/')[1] : 'USDT',
        errorText: '',
        isError: false,
        disabled: false,
        disabledText: '',
        style: 'width: 63%',
        errorHeight: '-30px',
        value: '',
      },
      gridAiMinBalance: {
        title: this.$t('gridTrade.setText12'),
        units: myStorage.get('sSymbolName') ? myStorage.get('sSymbolName').split('/')[1] : 'USDT',
        errorText: '',
        isError: false,
        disabled: false,
        disabledText: '',
        style: 'width: 63%',
        errorHeight: '-30px',
        value: '',
      },
      etfFlag: false,
      etfUrl: '',
      etfDisclosure: {}, // etf披露信息
      etfAdjustRecord: [], // etf调仓记录
      paginationObj: {
        total: 0, // 数据总条数
        display: 10, // 每页显示条数
        currentPage: 1, // 当前页码
      },
      isShowEtfKnowledgeDialog: false, // 显示etf知识测评弹窗
      etfKnowledgeAnswer: [0, 1, 1, 0, 2], // 知识测评答案序号
      questionIndex: 0, // 题号
      confirmNextText: this.$t('etfKnowledgeTest.nextButton'), // 知识测评弹窗下一题
      nextDisabled: true, // 下一题按钮禁用
      answerSelect: null, // 选择的答案
      tradePage: '1', // 交易页面 1 现货 2 杠杆 3 网格
      tradePageHover: null,
      tabLineStyle: {},
      tradeTypeHover: null,
      priceFixFlag: false,
      aiPriceFixFlag: false,
      orderType: 'buy',
      leverStep: null,
      hoverType: null,
      gridHoverType: null,
      timer: null, // 轮训请求资产接口
    };
  },
  props: {
    proTrade: {
      default: false,
      tyoe: Boolean,
    },
    fundRate: {
      type: String,
      default: '',
    },
    moduleType: {
      type: String,
      default: '',
    },
  },
  computed: {
    lan() {
      if (this.$store.state.baseData) {
        return this.$store.state.baseData.lan;
      }
      return null;
    },
    linkurl() {
      if (this.$store.state.baseData.publicInfo) {
        return this.$store.state.baseData.publicInfo.url;
      }
      return {};
    },
    localText() {
      return {
        title1: this.$t('trade.price'), // 价格
        title2: this.$t('trade.number'), // '数量',
        title3: this.$t('trade.price'), // '价格',
        title4: this.$t('trade.number'), // '数量',
        title5: this.$t('trade.noUnlock'), // '充值未解锁',
        title6: this.$t('trade.ySellVol'), // '可卖出数量',
        title7: this.$t('trade5.gridTrade.setText1'), // '区间最低价',
        title8: this.$t('trade5.gridTrade.setText2'), // '区间最高价',
        title9: this.$t('gridTrade.setText10'), // '资产',
        title10: this.$t('gridTrade.setText11'), // '止盈价格',
        title11: this.$t('gridTrade.setText12'), // '止损价格',
        title12: this.$t('gridTrade.setText5'), // '网格数量',
        title13: this.$t('gridTrade.setText2'), // '价格区间',
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
    overchargeMsg() {
      const symbolInfo = this.coinList[this.symbolUnit.symbol];
      return symbolInfo ? symbolInfo.isOverchargeMsg : '';
    },
    // 是否展示解锁卖出
    showUnlockSell() {
      const { symbol } = this.symbolUnit;
      const { publicInfo } = this.$store.state.baseData;
      let flag = false;
      if (publicInfo && symbol && this.isLogin && publicInfo.market) {
        const { coinList } = publicInfo.market;
        if (coinList[symbol]
          && coinList[symbol].isOvercharge
          && coinList[symbol].isOvercharge.toString() === '1') {
          flag = true;
        }
      }
      return flag;
    },
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
      if (this.showUnlockSell) {
        list.push({
          text: this.$t('trade.unlockTrade'),
          index: 3,
        });
      }
      return list;
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
            ? `${this.$t('trade.buy')} ${getCoinShowName(this.symbolUnit.symbol, this.coinList)}`
            : this.$t('trade.loginReg'), // '登录/注册',
          class: this.isLogin ? 'rise-1-bg buyBtn buttonStyleColor' : 'main-1-bg buyBtn text-4-cl',
        },
        sellButton: {
          text: this.isLogin
            ? `${this.$t('trade.sell')} ${getCoinShowName(this.symbolUnit.symbol, this.coinList)}`
            : this.$t('trade.loginReg'), // '登录/注册',
          class: this.isLogin ? 'fall-1-bg sellBtn buttonStyleColor' : 'main-1-bg sellBtn text-4-cl',
        },
        unlockSellButton: {
          text: this.isLogin ? '一键解锁卖出' : this.$t('trade.loginReg'), // '登录/注册',
          class: this.isLogin ? 'fall-1-bg sellBtn buttonStyleColor' : 'main-1-bg sellBtn text-4-cl',
        },
      };
    },
    // 网格按钮样式
    gridTypeButtons() {
      const style = {
        setButton: {
          hoverClass: 'rise-1-bg text-4-cl',
          activeClass: 'rise-1-bg text-4-cl',
        },
        aiButton: {
          hoverClass: 'rise-1-bg text-4-cl',
          activeClass: 'rise-1-bg text-4-cl',
        },
      };
      if (this.gridType === 2) {
        style.setButton.defaultClass = 'fill-3-bg text-1-cl';
        style.aiButton.defaultClass = 'rise-1-bg text-4-cl';
      } else {
        style.aiButton.defaultClass = 'fill-3-bg text-1-cl';
        style.setButton.defaultClass = 'rise-1-bg text-4-cl';
      }
      return style;
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
    // 账户资产
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
        //           symbolAccoubt: allCoinMap[symbol] ? fixD(allCoinMap[symbol].normal_balance, this.fixValue.volumeFix) : '--',
        //           unitsAccoubt: allCoinMap[units] ? fixD(allCoinMap[units].normal_balance, this.fixValue.priceFix) : '--',
        return {
          symbolAccoubt: allCoinMap[symbol] ? fixD(allCoinMap[symbol].normal_balance, 8) : '--',
          unitsAccoubt: allCoinMap[units] ? fixD(allCoinMap[units].normal_balance, 8) : '--',
          symbolOpen: allCoinMap[symbol] ? allCoinMap[symbol].depositOpen : '0',
          unitsOpen: allCoinMap[units] ? allCoinMap[units].depositOpen : '0',
          // 可卖出数量
          overcharge: allCoinMap[symbol] ? fixD(allCoinMap[symbol].overcharge_balance, this.fixValue.volumeFix) : '0',
          // 充值未解锁
          lockPositionV2Amount: allCoinMap[symbol] ? fixD(allCoinMap[symbol].lock_position_v2_amount, this.fixValue.volumeFix) : '0',
        };
      }
      return {
        symbolAccoubt: '--',
        unitsAccoubt: '--',
        symbolOpen: '0',
        unitsOpen: '0',
        overcharge: '0',
        lockPositionV2Amount: '0',
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
        try {
          const { publicInfo } = this.$store.state.baseData;
          const [symbol, units] = this.symbolCurrent.split('/');
          const showPrecision = publicInfo && publicInfo.market
            ? publicInfo.market.coinList[units].showPrecision : 0;
          return {
            symbol,
            units,
            showPrecision,
          };
        } catch (e) {
          return {};
        }
      }
      return {};
    },
    // 汇率单位
    rateData() {
      return this.$store.state.baseData.rate;
    },
    // 全部币对列表
    symbolAll() {
      return this.$store.state.baseData.symbolAll;
    },
    // 当前币对精度计算的值
    fixValue() {
      if (this.symbolAll && this.symbolCurrent && this.symbolAll[this.symbolCurrent]) {
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
        this.symbolUnit.showPrecision,
      );
    },
    tradeVolumeSell() {
      const count = nul(fixD(this.formData_3.value, this.fixValue.priceFix),
        fixD(this.formData_4.value, this.fixValue.volumeFix));

      return fixD(
        count,
        this.symbolUnit.showPrecision,
      );
    },
    baseData() {
      return this.$store.state.baseData.publicInfo;
    },
    // 交易是否开启了必须实名认证
    exchangeTradeKycOpen() {
      let isOpen = 0;
      if (this.baseData && this.baseData.kycLimitConfig) {
        isOpen = this.baseData.kycLimitConfig.exchange_trade_kyc_open;
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
    // 按钮信息
    gridbuttosContent() {
      return {
        gridButton: {
          // 开启网格交易
          text: this.isLogin
            ? this.$t('gridTrade.btn1')
            : this.$t('trade.loginReg'), // '登录/注册',
          class: this.isLogin ? 'rise-1-bg buyBtn text-1-cl' : 'main-1-bg buyBtn text-4-cl',
        },
        // 开启AI网格策略
        gridAiButton: {
          text: this.isLogin
            ? this.$t('gridTrade.btn2')
            : this.$t('trade.loginReg'), // '登录/注册',
          class: this.isLogin ? 'rise-1-bg buyBtn text-1-cl' : 'main-1-bg buyBtn text-4-cl',
        },
      };
    },
    // 等差网格（动态利润）： min ~ max

    // max =（（最高价-最低价）/ （网格数量 - 1）/ 最低价）  - 买入手续费率 - 卖出手续费率

    // min =（ (最高价-最低价）/ （网格数量 - 1））/ （最高价 - （ (最高价-最低价）/ （网格数量 - 1）））  - 买入手续费率 - 卖出手续费率

    // 最低利润
    gridSetMinProfits() {
      // 1: 等差 2 等比
      let val = null;
      if (this.gridSetMax.value
        && this.gridSetMin.value
        && this.gridSetNum.value
        && this.fee) {
        if (this.setType === 1) {
          const card = division(
            cut(this.gridSetMax.value, this.gridSetMin.value),
            (this.gridSetNum.value - 1),
          );
          val = nul(cut(
            cut(
              division(
                card,
                cut(
                  this.gridSetMax.value,
                  card,
                ),
              ),
              this.fee,
            ),
            this.fee,
          ), 100);
        }
      }
      if (val === Infinity || val === -Infinity) {
        val = null;
      }
      return fixD(val, 2) || '--';
    },
    // 最高利润
    gridSetMaxProfits() {
      // 1: 等差 2 等比
      let val = null;
      if (this.gridSetMax.value
        && this.gridSetMin.value
        && this.gridSetNum.value
        && this.fee) {
        if (this.setType === 1) {
          val = nul(cut(
            cut(
              division(
                division(
                  cut(this.gridSetMax.value, this.gridSetMin.value),
                  (this.gridSetNum.value - 1),
                ), this.gridSetMin.value,
              ),
              this.fee,
            ),
            this.fee,
          ), 100);
          // 等比网格（固定利润）=（（最高价/最低价）开（网格数量-1）次方） - 手续费率*2-1
        } else if (this.setType === 2) {
          val = nul(cut(
            cut(
              division(
                this.gridSetMax.value,
                this.gridSetMin.value,
              )
                ** (1 / (this.gridSetNum.value - 1)),
              nul(this.fee, 2),
            ),
            1,
          ), 100);
        }
      }
      if (val === Infinity || val === -Infinity) {
        val = null;
      }
      return fixD(val, 2) || '--';
    },
    setNumVal() {
      return this.gridSetNum.value;
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
          data: 0,
          price: '--',
        },
        amount: '--',
        rose: {
          class: '',
          data: '--',
        },
      };
    },
    isEtf() {
      return this.symbolAll
        && this.symbolAll[this.symbolCurrent]
        && this.symbolAll[this.symbolCurrent].etfOpen === 1;
    },
    columns() {
      return [
        {
          title: this.$t('etfAdd.adjustRecordTable.time'),
          width: '20%',
        },
        {
          title: this.$t('etfAdd.adjustRecordTable.type'),
          width: '20%',
        },
        {
          title: this.$t('etfAdd.adjustRecordTable.netValue'),
          width: '20%',
        },
        {
          title: this.$t('etfAdd.adjustRecordTable.beforeLever'),
          width: '20%',
        },
        {
          title: this.$t('etfAdd.adjustRecordTable.afterLever'),
          width: '20%',
        },
      ];
    },
    // 知识测评问题
    questions() {
      const questions = this.$t('etfKnowledgeTest.questions');
      return questions;
    },
    etfKnowledgeTitle() {
      return `${this.$t('etfKnowledgeTest.title')} (${this.questionIndex + 1}/5)`;
    },
    showTradeBuy() {
      if (this.proTrade) {
        if (this.orderType === 'buy') {
          return true;
        }
        return false;
      }
      return true;
    },
    showTradeSell() {
      if (this.proTrade) {
        if (this.orderType === 'sell') {
          return true;
        }
        return false;
      }
      return true;
    },
    isStaticLever() {
      if (this.moduleType === 'lever' && !this.proTrade) {
        return true;
      }
      return false;
    },
    // 兼容网格样式
    gridFix() {
      // return !this.proTrade && (this.priceFixFlag || this.aiPriceFixFlag);
      return false;
    },
    setTypeOptions() {
      return [
        {
          value: 1,
          label: this.$t('gridTrade.setText6'),
        },
        {
          value: 2,
          label: this.$t('gridTrade.setText7'),
        },
      ];
    },
    // 场外开关-默认开启
    fe_otc_open() {
      const { publicInfo } = this.$store.state.baseData;
      let str = 1;
      if (publicInfo && publicInfo.switch && publicInfo.switch.fe_otc_open) {
        str = Number(publicInfo.switch.fe_otc_open);
      }
      return str;
    },
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
    tradeTypeList() {
      const list = [
        { name: this.isSaleBol ? this.$t('sale.texta32') : this.$t('trade5.tradeType1'), index: '1' },
      ];
      if (this.gridTradeFlag && this.showGridFlag) {
        list.push({ name: this.$t('trade5.tradeType3'), index: '3' });
      }
      return list;
    },
  },
  watch: {
    localText(localText) {
      const {
        title1,
        title2,
        title3,
        title4,
        title5,
        title6,
        title7,
        title8,
        title9,
        title10,
        title11,
        title12,
        title13,
      } = localText;
      this.formData_1.title = title1;
      this.formData_2.title = title2;
      this.formData_3.title = title3;
      this.formData_4.title = title4;
      this.formData_5.title = title5;
      this.formData_6.title = title6;
      this.gridSetMin.title = title7;
      this.gridSetMax.title = title8;
      this.gridSetAccount.title = title9;
      this.gridSetMaxBalance.title = title10;
      this.gridSetMinBalance.title = title11;
      this.gridSetNum.title = title12;
      this.gridAiAccount.title = title9;
      this.gridAiMaxBalance.title = title10;
      this.gridAiMinBalance.title = title11;
      this.gridAiNum.title = title12;
      this.gridAiBlance.title = title13;
    },
    currenTaccount(value) {
      if (value) {
        this.formData_5.disabledText = value.lockPositionV2Amount;
        this.formData_6.disabledText = value.overcharge;
      }
    },
    isLogin(val) {
      if (val) {
        this.$store.dispatch('assetsExchangeData', {
          auto: false,
          coinSymbols: this.coinSymbols,
        });
        this.interValGetAssets();
        // clearInterval(this.assetsInter);
        // this.assetsInter = setInterval(() => {
        //   this.$store.dispatch('assetsExchangeData', {
        //     auto: true,
        //     coinSymbols: this.symbolUnit.symbol,
        //   });
        // }, 10000);
      }
    },
    // 切换自定义和ai
    gridType() {
      this.clearGridValue();
      this.getAiData();
    },
    // 切换 限价交易 和 市价交易
    transactionType(val) {
      if (val !== 4) {
        this.setTabLineStyle(val);
      }
      // 2 市价交易
      this.$bus.$emit('tradeType', false);
      if (val === 2) {
        this.formData_1.disabled = true;
        this.formData_1.disabledText = this.$t('trade.mPriceBuy'); // 以市场最优价买入
        this.formData_2.title = this.$t('trade.dealMoney'); // '交易额';
        this.formData_2.units = this.symbolUnit.units;
        this.formData_3.disabled = true;
        this.formData_3.disabledText = this.$t('trade.mPriceSell'); // 以市场最优价卖出
      } else if (val === 1) {
        this.formData_1.disabled = false;
        this.formData_1.disabledText = '';
        this.formData_2.title = this.$t('trade.number'); // '数量';
        this.formData_2.units = this.symbolUnit.symbol;
        this.formData_3.disabled = false;
        this.formData_3.disabledText = '';
      } else if (val === 4) {
        this.tradePage = '3';
        this.clearGridValue();
        this.getAiData();
        // 改变父组件样式
        this.$bus.$emit('tradeType', 'grid');
      }
    },
    setNumVal(v) {
      if (v) {
        this.$nextTick(() => {
          this.gridSetNum.value = fixD(v, 0);
        });
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
      this.formData_5.units = val.symbol;
      this.formData_6.units = val.symbol;
      this.gridSetMin.units = val.units;
      this.gridSetMax.units = val.units;
      this.gridSetAccount.units = val.units;
      this.gridSetMaxBalance.units = val.units;
      this.gridSetMinBalance.units = val.units;
      this.gridAiAccount.units = val.units;
      this.gridAiMaxBalance.units = val.units;
      this.gridAiMinBalance.units = val.units;
    },
    tradePage(val) {
      this.$bus.$emit('tradePageChange', val);
      window.sessionStorage.setItem('exTrade_page', val);
    },
    gridFix(val) {
      this.$bus.$emit('trade_grid_fix', val);
    },
  },
  methods: {
    init() {
      // 两秒让报错消失
      this.$bus.$on('errorMsg', () => {
        const formKey = [
          'gridAiAccount',
          'gridAiMaxBalance',
          'gridAiMinBalance',
          'gridAiNum',
          'gridSetMin',
          'gridSetMax',
          'gridSetNum',
          'gridSetAccount',
          'gridSetMaxBalance',
          'gridSetMinBalance',
        ];
        formKey.forEach((item) => {
          this[item].isError = false;
        });
      });
      // 监听 当前货币对切换
      this.$bus.$on('SYMBOL_CURRENT', (val) => {
        this.clearValue();
        this.clearGridValue();
        this.symbolCurrent = val;
        if (this.transactionType === 3) {
          this.transactionType = 1;
        }
        if (this.transactionType === 4 && this.showGridFlag && this.gridTradeFlag) {
          this.getAiData();
        } else if (this.transactionType === 4 && (!this.showGridFlag || !this.gridTradeFlag)) {
          this.transactionType = 1;
          this.tradePage = '1';
        }
        if (val && this.symbolAll[val] && this.symbolAll[val].etfOpen === 1) {
          this.getNetValue();
          this.clearPagenation();
          this.getEtfAdjustRecord();
        }
      });
      if (this.isLogin) {
        this.$store.dispatch('assetsExchangeData', {
          auto: false,
          coinSymbols: this.coinSymbols,
        });
        this.interValGetAssets();
        // clearInterval(this.assetsInter);
        // this.assetsInter = setInterval(() => {
        //   this.$store.dispatch('assetsExchangeData', {
        //     auto: true,
        //     coinSymbols: this.symbolUnit.symbol,
        //   });
        // }, 10000);
      }
      // 监听 市场（最新价格） 数据
      this.$bus.$on('MARKET_DATA', (data) => {
        this.marketData = JSON.parse(JSON.stringify(data));
      });
      // 监听 价格点击
      this.$bus.$on('HANDEL_PRICE', (data) => {
        if (data) {
        // const obj = {name: 'formData_1', data };
          const arr = ['formData_1', 'formData_3'];
          arr.forEach((item) => {
            this.onChaneForm({ name: item, value: data });
          });
        // onChaneForm
        // this.formData_1.value = data;
        // this.formData_3.value = data;
        }
      });
      this.setTabLineStyle(this.transactionType);
      this.$bus.$on('changeTradePage', (type) => {
        this.tradePage = type;
        if (type !== '2') {
          this.changeTradePage({ index: type });
        }
      });
      const tradePage = window.sessionStorage.getItem('exTrade_page');
      if (tradePage) {
        this.changeTradePage({ index: tradePage });
      }
    },
    // 分页器
    pagechange(v) {
      this.paginationObj.currentPage = v;
      this.getEtfAdjustRecord();
    },
    // 获取调仓记录
    getEtfAdjustRecord() {
      // 废弃接口
      // this.axios({
      //   url: '/etfAct/positionRecordList',
      //   params: {
      //     symbol: this.symbolAll[this.symbolCurrent].symbol,
      //     page: this.paginationObj.currentPage,
      //     pageSize: this.paginationObj.display,
      //   },
      // }).then((data) => {
      //   if (data.code.toString() === '0') {
      //     this.etfAdjustRecord = data.data.etfPositionRecordList.map(((item) => {
      //       const time = formatTime(item.adjustTime);
      //       const type = item.type === 0
      //         ? this.$t('etfAdd.adjustRecordTable.irregularText') : this.$t('etfAdd.adjustRecordTable.timingText');
      //       return {
      //         data: [time, type, `${item.netValue} ${item.quote}`, item.beforeLever, item.afterLever],
      //       };
      //     }));
      //     this.paginationObj.total = data.data.count;
      //   }
      // });
    },
    // 重置分页
    clearPagenation() {
      this.paginationObj.currentPage = 1; // 页码
      this.paginationObj.total = 0; // 总条数
    },
    // 关闭知识测评弹窗
    closeKnowledgeDialog() {
      this.questionIndex = 0;
      this.nextDisabled = true;
      this.answerSelect = null;
      this.isShowEtfKnowledgeDialog = false;
    },
    // 下一题
    confirmNext() {
      if ((this.questionIndex + 1) < this.questions.length) {
        this.questionIndex += 1;
        if ((this.questionIndex + 1) === this.questions.length) {
          this.confirmNextText = this.$t('etfKnowledgeTest.completeButton');
        }
        this.answerSelect = null;
        this.nextDisabled = true;
      } else {
        // 答题完成
        this.axios({
          url: 'etfAct/readStatusEtfWarn',
          headers: {},
          params: {},
          method: 'post',
        }).then((data) => {
          if (data.code.toString() === '0') {
            this.isShowEtfKnowledgeDialog = false;
          } else {
            this.$bus.$emit('tip', { text: data.msg, type: 'error' });
          }
        });
      }
    },
    selectAnswer(index) {
      this.answerSelect = index;
      const answer = this.etfKnowledgeAnswer[this.questionIndex];
      if (answer === index) {
        this.answerClass = ['rise-1-bd', 'rise-1-cl'];
        this.nextDisabled = false;
        if ((this.questionIndex + 1) === this.questions.length) {
          this.confirmNextText = this.$t('etfKnowledgeTest.completeButton');
        } else {
          this.confirmNextText = this.$t('etfKnowledgeTest.nextButton');
        }
      } else {
        this.answerClass = ['fall-1-bd', 'fall-1-cl'];
        this.nextDisabled = true;
        this.confirmNextText = this.$t('etfKnowledgeTest.errorButton');
      }
    },
    unlockSell() {
      if (!this.unlockSellFlag) return;
      this.unlockSellFlag = false;
      if (this.exchangeTradeKycOpen && this.idAuth !== 1) {
        this.isShowDialog = true;
      } else {
        this.axios({
          url: 'order/create_overcharge_onekey',
          headers: {},
          params: { symbol: this.symbolCurrent },
          method: 'post',
        }).then((data) => {
          this.unlockSellFlag = true;
          if (data.code === '0') {
            // 重新请求资产
            this.$store.dispatch('assetsExchangeData', {
              auto: false,
              coinSymbols: this.coinSymbols,
            });
            // 提示成功 下单成功
            this.$bus.$emit('tip', { text: this.$t('trade.dealCussess'), type: 'success' });
          } else {
            this.$bus.$emit('tip', { text: data.msg, type: 'error' });
          }
        });
      }
    },
    goCz(v) {
      if (this.exchangeTradeKycOpen && this.idAuth !== 1) {
        this.tsTexttype = 2;
        this.isShowDialog = true;
      } else if (v) {
        if (process.env.NODE_ENV === 'development') {
          window.location.href = `assets/recharge?symbol=${v}`;
        } else {
          const host = window.location.origin;
          if (host.indexOf('bitwind') !== -1) {
            const url = `${host}/${this.lan}/assets/recharge?symbol=${v}`;
            window.location.href = url;
          } else {
            window.location.href = `/assets/recharge?symbol=${v}`;
          }
        }
      }
    },
    setTabLineStyle(index) {
      const left = this.proTrade ? 16 : 32;
      this.tabLineStyle = {
        left: `${(index - 1) * 94 + left}px`,
      };
    },
    // 切换 限价交易 和 市价交易
    switchTradeType(type) {
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
        this[data.name].subText = fixRate(fixD(data.value,
          this.fixValue.priceFix), this.rateData, this.symbolUnit.units);
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
      if (type === 'buy') {
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
    createdInit() {
      this.axios({
        url: 'etfAct/faqInfo',
        // method: 'get',
      }).then((data) => {
        if (data.code === '0') {
          this.etfUrl = data.data.faqUrl;
          window.localStorage.etfUrl = data.data.faqUrl;
          this.etfName = data.data.domainName;
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
    // 关闭弹窗
    localDialogCancel() {
      this.etfFlag = false;
    },
    // 确认并关闭
    localDialogConfirm() {
      this.etfFlag = false;
      this.isShowEtfKnowledgeDialog = true;
    },
    confirmSubmit(side) {
      if (!this.isLogin) {
        this.$router.push('/login');
      }
      if (this.symbolAll[this.symbolCurrent] && this.symbolAll[this.symbolCurrent].etfOpen) {
        // this.etfSubmit(side);
        this.submit(side);
      } else {
        this.submit(side);
      }
    },
    // 用户状态
    etfSubmit(side) {
      this.axios({
        url: 'etfAct/checkEtfTrade',
        headers: {},
        params: {},
        method: 'post',
      }).then((data) => {
        if (data.code.toString() === '0') {
          if (this.userInfo.useEtf === '1') {
            this.submit(side);
            return;
          }
          if (data.data.status === 0 && this.userInfo.useEtf === '0') {
            this.etfFlag = true;
          } else if (data.data.status === 1) {
            this.$bus.$emit('tip', { text: this.$t('etfAdd.checking'), type: 'success' });
          } else if (data.data.status === 2) {
            this.$bus.$emit('tip', { text: this.$t('ipfs.kycAuth'), type: 'error' });
            this.$router.push('/personal/userManagement');
          } else if (data.data.status === 3) {
            this.$bus.$emit('tip', { text: this.$t('etfAdd.noEtf'), type: 'error' });
          } else if (data.data.status === 4) {
            this.submit(side);
          }
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
    submit(side) {
      if (!this.isLogin) {
        this.$router.push('/login');
      } else if (this.exchangeTradeKycOpen && this.idAuth !== 1) {
        this.tsTexttype = 1;
        this.isShowDialog = true;
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
              this[item].errorHeight = '-30px';
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
            this.axios({
              url: this.$store.state.url.cointran.order_create,
              headers: {},
              params: submitData,
              method: 'post',
            }).then((data) => {
              if (data.code === '0') {
                // 清空表单
                this.clearValue();
                // 重新请求资产
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
                this.$bus.$emit('tip', { text: data.msg, type: 'error' });
                this.fal = true;
              }
            });
          }
        }
      }
    },
    switchGrid() {
      this.clearValue();
      this.transactionType = 4;
    },
    gradSub(type) {
      if (!this.isLogin) {
        this.$router.push('/login');
      } else {
        const {
          formKey,
          lowestPrice,
          highestPrice,
          gridNumber,
          totalQuoteAmount,
          stopHighPrice,
          stopLowPrice,
          quantType,
          flag,
          useOwnBase,
          totalBaseAmount,
          gridLineType,
        } = this.submitGridFormKey(type);
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
              this[item].errorHeight = '-30px';
              this[item].errorText = `${this.$t('trade.inputError')}`; // 输入有误
              this[item].isError = true;
              fal = false;
            }
          });
          if (this.fal && fal && flag) {
            // 单格利润过小，请重新设置ai
            if (type !== 'gradTrad') {
              // 判断投入资金是否有足够余额，如无，则提示：USDT余额不足
              if (Number(totalQuoteAmount) > Number(this.currenTaccount.unitsAccoubt)) {
                this.$bus.$emit('tip', { text: `${getCoinShowName(this.symbolUnit.units, this.coinList)} ${this.$t('gridTrade.error3')}` });
                fal = false;
                return;
              } if (// 总投入资金/网格数量，不能小于当前币对的最小下单金额
                division(Number(totalQuoteAmount), gridNumber) < Number(this.minimumOrderQuantity)
              ) {
                this.$bus.$emit('tip', { text: this.$t('gridTrade.error4') });
                fal = false;
                return;
              } if (this.gridAiMax === '--' || this.gridAiMax <= 0 || this.gridAiMin === '--' || this.gridAiMin <= 0) {
                fal = false;
                this.$bus.$emit('tip', { text: this.$t('gridTrade.error9') });
                return;
              }
            } else if (type === 'gradTrad') { // 单格利润过小，请重新设置自定义
              // 判断投入资金是否有足够余额，如无，则提示：USDT余额不足
              if (Number(totalQuoteAmount) > Number(this.currenTaccount.unitsAccoubt)) {
                this.$bus.$emit('tip', { text: `${getCoinShowName(this.symbolUnit.units, this.coinList)} ${this.$t('gridTrade.error3')}` });
                fal = false;
                return;
                // 总投入资金/网格数量，不能小于当前币对的最小下单金额
              } if (division(Number(totalQuoteAmount), gridNumber)
              < Number(this.minimumOrderQuantity)) {
                this.$bus.$emit('tip', { text: this.$t('gridTrade.error4') });
                // 每格投入资金小于当前币对的最小下单金额
                fal = false;
                return;
              } if (gridLineType === 1) { // 等差
                if (this.gridSetMinProfits === '--' || this.gridSetMinProfits <= 0 || this.gridSetMaxProfits === '--' || this.gridSetMaxProfits <= 0) {
                  this.$bus.$emit('tip', { text: this.$t('gridTrade.error9') });
                  fal = false;
                  return;
                }
              } else if (gridLineType === 2) { // 等比只校验最大
                if (this.gridSetMaxProfits === '--' || this.gridSetMaxProfits <= 0) {
                  this.$bus.$emit('tip', { text: this.$t('gridTrade.error9') });
                  fal = false;
                  return;
                }
              }
            }
            if (Number(stopHighPrice) && Number(stopHighPrice) <= Number(highestPrice)) {
              // 止盈价格必须高于网格最高价
              this.$bus.$emit('tip', { text: this.$t('gridTrade.error5') });
              fal = false;
            } else if (Number(stopHighPrice)
              && Number(stopHighPrice) <= Number(this.symbolsData.close.data)) {
              this.$bus.$emit('tip', { text: this.$t('gridTrade.error7') });
              fal = false;
            } else if (Number(stopLowPrice)
              && Number(stopLowPrice) >= Number(lowestPrice)) {
              // 止损价格必须低于网格最低价
              this.$bus.$emit('tip', { text: this.$t('gridTrade.error6') });
              fal = false;
            } else if (Number(stopLowPrice)
              && Number(stopLowPrice) >= Number(this.symbolsData.close.data)) {
              this.$bus.$emit('tip', { text: this.$t('gridTrade.error8') });
              fal = false;
            }
          }
          if (this.fal && fal && flag) {
            this.fal = false;
            const submitData = {
              symbol: this.symbolCurrent,
              lowestPrice,
              highestPrice,
              gridNumber,
              totalQuoteAmount,
              stopHighPrice,
              stopLowPrice,
              quantType,
              useOwnBase,
              totalBaseAmount,
              gridLineType, // 网格类型 1:等差 2:等比
              fee: this.fee,
            };
            if (useOwnBase) {
              submitData.currentPrice = this.symbolsData.close.data;
              if (submitData.currentPrice) {
                this.gridCancelEvent(submitData);
              }
            } else {
              this.gridSubData(submitData);
            }
          }
        }
      }
    },
    submitGridFormKey(type) {
      let formKey = [];
      let lowestPrice = null;
      let highestPrice = null;
      let gridNumber = null;
      let totalQuoteAmount = null;
      let stopHighPrice = null;
      let stopLowPrice = null;
      let quantType = null;
      let flag = true;
      let gridLineType = 1;
      let useOwnBase = 0;
      const BoxHeight = document.body.clientWidth;
      if (type === 'gradTrad') {
        this.gridSetAccount.errorHeight = '-30px';
        formKey = ['gridSetMin', 'gridSetMax', 'gridSetNum', 'gridSetAccount'];
        lowestPrice = fixD(this.gridSetMin.value, this.fixValue.priceFix);
        highestPrice = fixD(this.gridSetMax.value, this.fixValue.priceFix);
        gridNumber = fixD(this.gridSetNum.value, this.fixValue.volumeFix);
        totalQuoteAmount = fixD(this.gridSetAccount.value, this.fixValue.priceFix);
        stopHighPrice = this.gridSetMaxBalance.value
          ? fixD(this.gridSetMaxBalance.value, this.fixValue.priceFix) : 0;
        stopLowPrice = this.gridSetMinBalance.value
          ? fixD(this.gridSetMinBalance.value, this.fixValue.priceFix) : 0;
        quantType = 1; // 网格
        gridLineType = this.setType;
        useOwnBase = this.gridSetFormFlag ? 1 : 0;
        const closePrice = Number(this.symbolsData.close.data);
        const minPrice = fixD(nul(closePrice, 0.32), this.fixValue.priceFix);
        const maxPrice = fixD(nul(closePrice, 4.3), this.fixValue.priceFix);
        // 最高价应大于当前价
        if (Number(highestPrice) <= closePrice) {
          this.gridSetMax.isError = true;
          this.gridSetMax.errorText = this.$t('gridTrade.error16');
          flag = false;
        } else if (Number(lowestPrice) >= closePrice) {
          // 最低价应小于当前价
          this.gridSetMin.isError = true;
          this.gridSetMin.errorText = this.$t('gridTrade.error15');
          flag = false;
        } else if (Number(highestPrice) > Number(maxPrice)) {
          // 最高价不能高于当前价的 430%
          this.gridSetMax.isError = true;
          this.gridSetMax.errorText = this.$t('gridTrade.error11', { price: maxPrice });
          flag = false;
        } else if (Number(lowestPrice) < Number(minPrice)) {
          // 最低价不能低于当前价的 32%
          this.gridSetMin.isError = true;
          this.gridSetMin.errorText = this.$t('gridTrade.error12', { price: minPrice });
          flag = false;
        } else if ((Number(highestPrice) < Number(lowestPrice)) || (Number(highestPrice) === Number(lowestPrice))) {
          // 判断如果区间最高价 ≤ 区间最低价，则提示：区间最高价必须大于区间最低价
          this.gridSetMax.isError = true;
          // 区间最高价必须大于区间最低价
          if (BoxHeight < 1325) {
            this.gridSetMax.errorHeight = '-40px';
          }
          this.gridSetMax.errorText = this.$t('gridTrade.error10');
          flag = false;
        } else if (Number(highestPrice) < nul(lowestPrice, 1.02)) {
          this.gridSetMax.isError = true;
          // 价格区间过小，请重新设置
          if (BoxHeight < 1325 && !this.proTrade) {
            this.gridSetMax.errorHeight = '-40px';
          }
          this.gridSetMax.errorText = this.$t('gridTrade.error1');
          flag = false;
        }
        if (Number(gridNumber) < 2 || Number(gridNumber) > 100) {
          this.gridSetNum.isError = true;
          // 数量区间为：2-100
          this.gridSetNum.errorText = this.$t('gridTrade.error2');
          flag = false;
        }
      } else {
        this.gridAiAccount.errorHeight = '-30px';
        formKey = ['gridAiAccount'];
        lowestPrice = this.gridAiMinPrice;
        highestPrice = this.gridAiMaxPrice;
        gridNumber = this.gridAiNum.value;
        totalQuoteAmount = fixD(this.gridAiAccount.value, this.fixValue.priceFix);
        stopHighPrice = this.gridAiMaxBalance.value
          ? fixD(this.gridAiMaxBalance.value, this.fixValue.priceFix) : 0;
        stopLowPrice = this.gridAiMinBalance.value
          ? fixD(this.gridAiMinBalance.value, this.fixValue.priceFix) : 0;
        quantType = 1; // 网格
        gridLineType = 1;
        useOwnBase = this.gridAiFormFlag ? 1 : 0; // 是否使用Base资产 0:不使用 1:使用

        // 判断如果区间最高价 ≤ 区间最低价，则提示：区间最高价必须大于区间最低价
        if ((Number(highestPrice) < Number(lowestPrice)) || (Number(highestPrice) === Number(lowestPrice))) {
          this.gridSetMax.isError = true;
          // 区间最高价必须大于区间最低价
          if (BoxHeight < 1325) {
            this.gridSetMax.errorHeight = '-40px';
          }
          this.gridSetMax.errorText = this.$t('gridTrade.error10');
          flag = false;
        } else if (Number(highestPrice) < nul(lowestPrice, 1.02)) {
          // 单格利润过小，请重新设置
          // 判断最高价不能低于最低价的1.02倍。如低于，则提示：价格区间过小，请重新设置
          this.gridAiMaxPrice.isError = true;
          if (BoxHeight < 1325) {
            this.gridAiMaxPrice.errorHeight = '-40px';
          }
          // 价格区间过小，请重新设置
          this.gridAiMaxPrice.errorText = this.$t('gridTrade.error1');
          flag = false;
        }

        if (Number(gridNumber) < 2 || Number(gridNumber) > 100) {
          this.gridAiNum.isError = true;
          this.gridAiNum.errorText = this.$t('gridTrade.error2');
          flag = false;
        }
      }
      return {
        formKey,
        lowestPrice,
        highestPrice,
        gridNumber,
        totalQuoteAmount,
        stopHighPrice,
        stopLowPrice,
        quantType,
        flag,
        useOwnBase,
        totalBaseAmount: useOwnBase ? this.currenTaccount.symbolAccoubt : 0,
        gridLineType,
      };
    },
    // 清空 表单数据
    clearGridValue() {
      const formKey = [
        'gridAiAccount',
        'gridAiMaxBalance',
        'gridAiMinBalance',
        'gridAiNum',
        'gridSetMin',
        'gridSetMax',
        'gridSetNum',
        'gridSetAccount',
        'gridSetMaxBalance',
        'gridSetMinBalance',
      ];
      formKey.forEach((item) => {
        this[item].value = '';
        this[item].isError = false;
        this[item].subText = null;
      });
    },
    // 请求ai数据
    getAiData() {
      this.axios({
        url: 'noToken/quant/getAIStrategyInfo',
        hostType: 'quant',
        params: {
          symbol: this.symbolCurrent,
        },
        method: 'post',
      }).then((data) => {
        if (data.code.toString() === '0') {
          if (data.data && data.data.configParamMap) {
            this.gridAiMinPrice = fixD(
              data.data.configParamMap.lowestPrice, this.fixValue.priceFix,
            );
            this.gridAiMaxPrice = fixD(
              data.data.configParamMap.highestPrice, this.fixValue.priceFix,
            );
            this.gridAiBlance.disabledText = `${this.gridAiMinPrice} ~ ${this.gridAiMaxPrice}`;
            this.gridAiNum.disabledText = fixD(data.data.configParamMap.gridNumber, 0);
            this.gridAiNum.value = fixD(data.data.configParamMap.gridNumber, 0);
            this.gridAiMin = fixD(data.data.everyProfitMin, 2);
            this.gridAiMax = fixD(data.data.everyProfitMax, 2);
            this.fee = data.data.makerFee;
            // 最小下单数量
            this.minimumOrderQuantity = data.data.minimumOrderQuantity;
            this.sevenDay = fixD(data.data.sevenAnnualizedYield, 2); // 7日年华收益
          }
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
    // 给服务端传参数和当前行情用于判断是否够每格消耗
    gridCancelEvent(params) {
      this.axios({
        url: 'quant/calBaseAmount',
        hostType: 'quant',
        method: 'post',
        params,
      }).then((req) => {
        if (req.code.toString() === '0' && req.data) {
          if (Number(req.data.baseAmount) > Number(this.currenTaccount.symbolAccoubt)) {
            this.$bus.$emit('tip', {
              text: `${this.$t('gridTrade.least')}${req.data.baseAmount}
            ${getCoinShowName(this.symbolUnit.symbol, this.coinList)}`,
              type: 'error',
            });
            this.fal = true;
          } else {
            const obj = { ...params, totalBaseAmount: Number(req.data.baseAmount) };
            this.gridSubData(obj);
          }
        } else {
          this.$bus.$emit('tip', { text: req.msg, type: 'error' });
          this.fal = true;
        }
      });
    },
    gridSubData(params) {
      this.axios({
        url: 'quant/saveStrategy',
        hostType: 'quant',
        params,
        method: 'post',
      }).then((data) => {
        if (data.code.toString() === '0') {
          // 清空表单
          this.clearGridValue();
          // 重新请求资产
          this.$store.dispatch('assetsExchangeData', {
            auto: false,
            coinSymbols: this.coinSymbols,
          });
          this.getAiData();
          // 发送下单成功的事件
          this.$bus.$emit('ORDER_CREATE', { type: 'success' });
          // 提示成功 下单成功
          this.$bus.$emit('tip', { text: this.$t('trade.dealCussess'), type: 'success' });
          this.fal = true;
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
          this.fal = true;
        }
      }).catch(() => {
        this.fal = true;
      });
    },
    dialogClose() {
      this.isShowDialog = false;
    },
    // 去认证
    gotoAuth() {
      this.$router.push('/personal/identityAuthen');
    },
    etfInfoSwitch(type) {
      this.transactionType = type;
      if (!this.etfDisclosure.marketName) {
        this.getNetValue();
      }
      if (this.etfAdjustRecord.length < 1) {
        this.getEtfAdjustRecord();
      }
    },
    // 获取etf币对净值
    getNetValue() {
      const { symbol, units } = this.symbolUnit;
      this.axios({
        url: 'etfAct/netValue',
        params: {
          base: symbol,
          quote: units,
        },
      }).then((data) => {
        if (data.code.toString() === '0') {
          this.etfDisclosure = data.data || {};
        }
      });
    },
    changeTradePage({ index }) {
      this.tradePage = index;
      // const { path } = this.$route;
      if (index === '3') {
        this.switchGrid();
        // this.$router.push({
        //   path,
        //   query: {
        //     tradePage: index,
        //   },
        // });
      } else if (index === '2') {
        if (this.proTrade) {
          this.$router.push('/proTradeMargin');
        } else {
          this.$router.push('/margin');
        }
      } else {
        // this.$router.push({
        //   path,
        //   query: {
        //     tradePage: index,
        //   },
        // });
        this.switchTradeType({ index: 1 });
      }
    },
    handleMouseHover(index) {
      this.tradePageHover = index;
    },
    handleMouseLeave() {
      this.tradePageHover = null;
    },
    buyCoin() {
      window.location.href = this.linkurl.otcUrl;
    },
    setOrderType(type) {
      this.orderType = type;
    },
    recharge() {
      const { symbol } = this.symbolUnit;
      this.$router.push(`/assets/recharge?symbol=${symbol}`);
    },
    withdraw() {
      const { symbol } = this.symbolUnit;
      this.$router.push(`/assets/withdraw?symbol=${symbol}`);
    },
    toLogin(type) {
      if (type === 'login') {
        this.$router.push('/login');
      } else {
        this.$router.push('/register');
      }
    },
    setTypeChange(item) {
      this.setType = item.value;
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
  },
};
