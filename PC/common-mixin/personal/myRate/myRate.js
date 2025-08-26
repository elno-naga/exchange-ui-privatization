import {
  imgMap,
  colorMap,
  getIconPath,
  getCookie,
  getCoinShowName,
  nul,
  division,
  fixD,
} from '@/utils';
import countryMinix from '../../countryList/countryList';

export default {
  name: 'myRate',
  mixins: [countryMinix],
  data() {
    return {
      imgMap,
      colorMap,
      getIconPath,
      nul,
      isError: false, //  没有会员等级的情况
      useFeeCoinOpen: false, // 抵扣手续费开关
      getUserFeeDiscountLoading: true,
      levelId: '', // 等级id
      levelName: '', // 等级名称
      currencySpotTaker: '', // 现货当前taker
      originalSpotTaker: '', // 现货原始taker
      currencySpotMaker: '', // 现货当前maker
      originalSpotMaker: '', // 现货原始maker
      currencyFuturesTaker: '', // 合约当前taker
      originalFuturesTaker: '', // 合约原始taker
      currencyFuturesMaker: '', // 合约当前maker
      originalFuturesMaker: '', // 合约原始maker

      leverRateList: [], // 杠杆利率
      leverMap: {}, // 杠杆币对
      symbolList: [], // 格式化后的杠杆币对
      leverSymbol: '', // 逐仓杠杆币对
      leverSymbolRate: '', // 逐仓杠杆币对日利率

      nextLevelUserSatisfyLoading: true,
      nextLevelId: '1', // 下一等级levelId
      nextLevelName: '', // 下一等级名称
      spotProcessList: [{}, {}, {}], // 现货要求
      contractProcessList: [{}, {}, {}], // 合约要求

      currNavTab: 'A', //  手续费率current tab
      currNavTabAssistant: '1', //  手续费率二级 current tab

      // 表格- 交易
      tardingTableLoading: true,
      tardingColumns: [],
      tardingDataList: [], // 表格 数据
      firstKey: '', // 条线一
      secondKey: '', // 条线二
      thirdKey: '', // 条线三
      saveDays: 1, // 等级保留配置
      unit: 'USD',

      // 表格- 利率
      interestRateTableLoading: true,
      // interestRateColumns:[],
      interestRateDataList: [], // 表格 数据
      vipList: [], // vip等级

      // 表格- 充值/提现
      rAndWTableLoading: true,
      rAndWDataList: [], // 表格 数据

      userSkin: getCookie('cusSkin') || getCookie('defSkin') || '1', // 主题

      findValue: '', // 搜索条件

      inviteDialogFlag: false, // 邀请好友弹窗
      newfeeCoinRate: '',
    };
  },
  watch: {
    market: {
      handler(val) {
        if (val) {
          if (this.leverOpen) {
            this.getLeverData();
          }
        }
      },
      immediate: true,
    },
    userInfo: {
      handler(val) {
        if (val) {
          this.handleNextLevelUserSatisfy();
        }
      },
      immediate: true,
    },
    publicInfo: {
      handler(val) {
        if (val) {
          this.newfeeCoinRate = val.fee_coin_rate;
          this.getUserFeeDiscount();
          this.handleGetLeverRateList();
          this.handeleGetCoinWithdrawFeeList();
          this.handleGetLevelFeeConfigList();
        }
      },
      immediate: true,
    },
  },
  computed: {
    userInfo() {
      return this.$store.state.baseData.userInfo;
    },
    publicInfo() {
      return this.$store.state.baseData.publicInfo;
    },

    // market 接口
    market() {
      return this.$store.state.baseData.market;
    },

    linkurl() {
      if (this.publicInfo) {
        return this.$store.state.baseData.publicInfo.url;
      }
      return {};
    },

    // 时区
    timezone() {
      if (this.publicInfo && this.publicInfo.msg && this.publicInfo.msg.timeZone) {
        return this.publicInfo.msg.timeZone || '';
      }

      return false;
    },

    // 杠杆开关
    leverOpen() {
      if (this.publicInfo && this.publicInfo.switch && this.publicInfo.switch.lever_open) {
        return this.publicInfo.switch.lever_open.toString() === '1';
      }

      return false;
    },
    // 杠杆利率折扣开关
    membershipLeverRateSwitch() {
      if (
        this.publicInfo
        && this.publicInfo.switch
        && this.publicInfo.switch.membership_lever_rate_switch
      ) {
        return this.publicInfo.switch.membership_lever_rate_switch.toString() === '1';
      }

      return false;
    },

    // 充值提现tab页显示开关
    membershipDepositWithdrawTabSwitch() {
      if (
        this.publicInfo
        && this.publicInfo.switch
        && this.publicInfo.switch.membership_deposit_withdraw_tab_switch
      ) {
        return this.publicInfo.switch.membership_deposit_withdraw_tab_switch.toString() === '1';
      }

      return false;
    },

    // 24H提现额度开关
    membershipWithdrawAmountSwitch() {
      if (
        this.publicInfo
        && this.publicInfo.switch
        && this.publicInfo.switch.membership_withdraw_amount_switch
      ) {
        return this.publicInfo.switch.membership_withdraw_amount_switch.toString() === '1';
      }

      return false;
    },

    // 会员等级功能开关
    membershipLevelOpen() {
      if (
        this.publicInfo
        && this.publicInfo.switch
        && this.publicInfo.switch.membership_level_open
      ) {
        return this.publicInfo.switch.membership_level_open.toString() === '1';
      }
      return false;
    },

    // 是否开通合约
    openContract() {
      if (
        this.publicInfo
        && this.publicInfo.switch
        && this.publicInfo.switch.membership_futures_switch
      ) {
        return (
          this.publicInfo.switch.membership_futures_switch.toString() === '1' && this.linkurl.coUrl
        );
      }
      return false;
    },

    // 平台币折扣率
    feeCoinRate() {
      if (this.userInfo) {
        return `${this.userInfo.feeCoinRate}%`;
      }
      return false;
    },
    // 平台币
    feeCoin() {
      if (this.userInfo) {
        return this.userInfo.feeCoin;
      }
      return false;
    },
    // 商户开启/关闭平台币
    feeCoinOpen() {
      if (this.publicInfo && this.publicInfo.switch && this.publicInfo.switch.fee_coin_open) {
        return this.publicInfo.switch.fee_coin_open.toString() === '1';
      }
      return false;
    },

    // 商户交易所名字
    companyName() {
      if (this.publicInfo && this.publicInfo.msg) {
        return this.publicInfo.msg.company_name;
      }
      return '';
    },

    columns() {
      return {
        spot_trade: { title: this.$t('myRate.spot_trade', [this.unit]) }, // 30日现货成交量
        spot_average_trade: { title: this.$t('myRate.spot_average_trade', [this.unit]) }, // 30日现货平均成交量
        futures_trade: { title: this.$t('myRate.spot_trade', [this.unit]) }, // 30天合约成交量（USD）
        futures_average_trade: { title: this.$t('myRate.futures_average_trade', [this.unit]) }, // 30日合约平均成交量

        total_asset: { title: this.$t('myRate.total_asset', [this.unit]) }, // 资产量（USD）
        period_average_asset: { title: this.$t('myRate.period_average_asset', [this.unit]) }, // 30天平均持有资产（USD）
        special_coin_asset: { title: this.$t('myRate.special_coin_asset', [this.feeCoin]) }, // 持仓（USD）

        invite: { title: this.$t('myRate.invite') }, // 邀请用户（人）
        period_invite: { title: this.$t('myRate.period_invite') }, // 30日邀请用户数
      };
    },

    upgrade_bg() {
      return this.userSkin === '1'
        ? { backgroundImage: 'linear-gradient(0deg, #1D1D1F 0%, #1B1B1D 100%)' }
        : { backgroundImage: 'linear-gradient(0deg, #F7F7F7 0%, #F9F9F9 100%)' };
    },

    navTab() {
      let arr = [
        // 交易
        { name: this.$t('myRate.rd1a65fa3'), index: 'A' },
        // 利率
        { name: this.$t('myRate.r190c2c60'), index: 'B' },
        // 充值/提现
        { name: this.$t('myRate.r40b7638f'), index: 'C' },
      ];
      // 杠杆开关 && 杠杆利率折扣开关 均为开启
      if (!(this.membershipLeverRateSwitch && this.leverOpen)) {
        arr = arr.filter((item) => item.index !== 'B');
      }

      // 充值提现tab页显示开关为开启
      if (!this.membershipDepositWithdrawTabSwitch) {
        arr = arr.filter((item) => item.index !== 'C');
      }
      return arr;
    },

    navTabAssistant() {
      let arr = [
        // 现货
        { name: this.$t('myRate.rc6cd161f'), index: '1' },
        // 合约
        { name: this.$t('myRate.r8392149c'), index: '2' },
      ];
      // 商户未开通合约  不显示合约相关
      if (!this.openContract) {
        arr = arr.filter((item) => item.index !== '2');
      }
      return arr;
    },

    // 利率表格Columns
    rAndWColumns() {
      const columns = [
        { title: this.$t('myRate.r9020ea69'), key: 'coinSymbol' }, // 币种
        { title: this.$t('myRate.r82853947'), key: 'showName' }, // 全称
        { title: this.$t('myRate.rb5e4f7d0'), key: 'mainChainName' }, // 主链类型
        { title: this.$t('myRate.raf842659'), key: 'withdrawMin' }, // 最小提现数量
        { title: this.$t('myRate.r8a606e31'), key: 'withdrawFee' }, // 提现手续费
        { title: this.$t('myRate.r81dfe139'), key: 'r81dfe139' }, // 充值手续费
      ];
      return columns;
    },
    // 利率表格Columns
    interestRateColumns() {
      const columns = [
        {
          title: '',
          key: 'symbol',
          subTitle: this.$t('myRate.reb23cec8'), // 币对
        },
      ];
      this.vipList.map((item) => {
        columns.push({
          title: item.levelName,
          key: `interestRate${item.levelId}`,
          subTitle: this.$t('myRate.r51f30471'), // 日利率
        });
        return '';
      });
      return columns;
    },
  },
  methods: {
    init() {
    },
    // 查询用户当前手续费率
    getUserFeeDiscount() {
      this.getUserFeeDiscountLoading = true;
      this.axios({
        url: this.$store.state.url.membership.getUserFeeDiscount,
        method: 'post',
        params: {},
      }).then((data) => {
        if (data.code.toString() === '0') {
          this.useFeeCoinOpen = data.data.useFeeCoinOpen.toString() === '1';

          this.levelId = data.data.levelId;
          this.levelName = data.data.levelName;
          this.currencySpotTaker = data.data.currencySpotTaker;
          this.originalSpotTaker = data.data.originalSpotTaker;
          this.currencySpotMaker = data.data.currencySpotMaker;
          this.originalSpotMaker = data.data.originalSpotMaker;
          this.currencyFuturesTaker = data.data.currencyFuturesTaker;
          this.originalFuturesTaker = data.data.originalFuturesTaker;
          this.currencyFuturesMaker = data.data.currencyFuturesMaker;
          this.originalFuturesMaker = data.data.originalFuturesMaker;
          this.getUserFeeDiscountLoading = false;
          if (this.symbolList.length > 0) {
            this.getLeverSymbolRate(this.symbolList[0].symbol);
          }
        }
      });
    },

    // 手续费率-杠杆利率
    handleGetLeverRateList(symbol) {
      this.interestRateTableLoading = true;
      this.axios({
        url: this.$store.state.url.membership.getLeverRateList,
        method: 'post',
        params: { symbol },
      }).then((data) => {
        if (data.code.toString() === '0') {
          if (data.data.list) {
            const arr = [];
            const obj = {};
            data.data.list.forEach((item) => {
              item.rateList.forEach((rate) => {
                obj[`interestRate${rate.levelId}`] = `${fixD(rate.leverRate, 4)}%`;
              });
              arr.push({
                symbol: item.symbol.toUpperCase(),
                ...obj,
              });
            });
            this.interestRateDataList = arr;
            this.leverRateList = data.data.list;
          }
          this.interestRateTableLoading = false;
        }
      });
    },

    // 下一个等级的条件及当前用户完成状态
    handleNextLevelUserSatisfy() {
      this.nextLevelUserSatisfyLoading = true;
      this.spotProcessList = [];
      this.nextLevelName = '';
      this.nextLevelId = '';
      this.axios({
        url: this.$store.state.url.membership.nextLevelUserSatisfy,
        method: 'post',
        params: {},
      }).then((data) => {
        if (data.code.toString() === '0') {
          this.spotProcessList = [];
          this.contractProcessList = [];
          if (data.data.levelName === null && data.data.levelId === null) {
            this.nextLevelUserSatisfyLoading = false;
            return;
          }
          this.nextLevelName = data.data.levelName;
          this.nextLevelId = data.data.levelId;
          let ruleArr = [];
          if (data.data.levelInfo && data.data.levelInfo.length > 0) {
            data.data.levelInfo.forEach((item) => {
              const {
                firstKey,
                secondKey,
                thirdKey,
                firstValue,
                secondValue,
                thirdValue,
                satisfyFirstValue,
                satisfySecondValue,
                satisfyThirdValue,
                secondConditionSymbol,
                thirdConditionSymbol,
                rule,
              } = item;
              const arr = [];
              ruleArr = rule
                .split(',')
                .map((itemRule) => (itemRule === '|' ? this.$t('myRate.rb8185132') : this.$t('myRate.re11e25e3')));

              const [rule1, rule2] = ruleArr;
              const percentage1 = nul(division(+satisfyFirstValue, +firstValue), 100);
              arr.push({
                ...this.columns[firstKey],
                processVal2: fixD(firstValue, 2),
                processVal1: fixD(satisfyFirstValue, 2),
                schedule:
                  firstValue && satisfyFirstValue
                    ? `${percentage1 > 100 ? 100 : percentage1}%`
                    : '0%',
                linkText: item.type.toString() === '1' ? this.$t('myRate.rbbc6a442') : this.$t('myRate.rc6abf6d0'), // 现货交易历史
                link: item.type.toString() === '1' ? '/order/exchangeOrder' : '/order/coOrder',
                rule: secondKey && rule1,
              });
              if (secondKey) {
                const title = secondKey === 'special_coin_asset'
                  ? { title: this.$t('myRate.special_coin_asset', [secondConditionSymbol]) }
                  : this.columns[secondKey];
                const percentage2 = nul(division(+satisfySecondValue, +secondValue), 100);
                arr.push({
                  ...title,
                  processVal2: fixD(secondValue, 2),
                  processVal1: fixD(satisfySecondValue, 2),
                  schedule:
                    secondValue && satisfySecondValue
                      ? `${percentage2 > 100 ? 100 : percentage2}%`
                      : '0%',
                  linkText: this.$t('myRate.r57d78f88'), // 账户余额
                  link: '/assets/totalAssets',
                  // item.type.toString() === '1' ? '/assets/exchangeAccount' : '/assets/coAccount',
                  rule: thirdKey && rule2,
                });
              }
              if (thirdKey) {
                const title = thirdKey === 'special_coin_asset'
                  ? { title: this.$t('myRate.special_coin_asset', [thirdConditionSymbol]) }
                  : this.columns[thirdKey];
                const percentage3 = nul(division(+satisfyThirdValue, +thirdValue), 100);
                arr.push({
                  ...title,
                  processVal2: this.filterInvite(thirdKey) ? thirdValue : fixD(thirdValue, 2),
                  processVal1: this.filterInvite(thirdKey)
                    ? satisfyThirdValue
                    : fixD(satisfyThirdValue, 2),
                  schedule:
                    thirdValue && satisfyThirdValue
                      ? `${percentage3 > 100 ? 100 : percentage3}%`
                      : '0%',
                  linkText: thirdKey === 'special_coin_asset' ? this.$t('myRate.r57d78f88') : this.$t('myRate.r49b03ee5'), // 邀请好友
                  link: thirdKey === 'special_coin_asset' ? '/assets/totalAssets' : 'inviteFriends',
                });
              }
              // type  1:现货 2:合约
              if (item.type.toString() === '1') {
                this.spotProcessList = arr;
              } else {
                this.contractProcessList = arr;
              }
            });
          }
        }
        this.nextLevelUserSatisfyLoading = false;
      });
    },

    // 手续费率- 查询商户配置的会员等级条件+配置（现货/合约)
    handleGetLevelFeeConfigList() {
      this.tardingTableLoading = true;
      this.axios({
        url: this.$store.state.url.membership.getLevelFeeConfigList,
        method: 'post',
        params: {
          type: this.currNavTabAssistant,
        },
      }).then((data) => {
        if (data.code.toString() === '0') {
          this.tardingDataList = [];
          this.tardingColumns = [];
          if (
            data.data.condition === null
            && data.data.list === null
            && this.currNavTabAssistant === '1'
          ) {
            this.tardingTableLoading = false;
            this.isError = true;
            return;
          }
          if (data.data.list.length === 0) {
            this.tardingColumns.push(
              { title: this.$t('myRate.r5b2be317'), key: 'levelName' }, // 等级,
              { title: this.$t('myRate.r1d7b9315'), key: 'rule0' }, // 及/或
              { title: this.$t('myRate.r1d7b9315'), key: 'rule1' }, // 及/或
              { title: this.$t('myRate.r2f441f53'), key: 'r2f441f53', width: '230px' }, // Maker/Taker
            );
            this.tardingTableLoading = false;
            return;
          }

          let ruleArr = [];

          const {
            firstKey,
            secondKey,
            thirdKey,
            rule,
            saveDays,
            secondConditionSymbol,
            thirdConditionSymbol,
          } = data.data.condition;
          ruleArr = rule
            .split(',')
            .map((item) => (item === '|' ? this.$t('myRate.rb8185132') : this.$t('myRate.re11e25e3')));

          this.firstKey = firstKey;
          this.secondKey = secondKey;
          this.thirdKey = thirdKey;
          this.saveDays = saveDays;
          this.tardingColumns.push(
            { title: this.$t('myRate.r5b2be317'), key: 'levelName' }, // 等级,
            firstKey && { ...this.columns[firstKey], key: 'firstValue' },
            secondKey && { title: this.$t('myRate.r1d7b9315'), key: 'rule0' },
            secondKey && secondKey === 'special_coin_asset'
              ? {
                title: this.$t('myRate.special_coin_asset', [secondConditionSymbol]),
                key: 'secondValue',
              }
              : { ...this.columns[secondKey], key: 'secondValue' },
            thirdKey && { title: this.$t('myRate.r1d7b9315'), key: 'rule1' }, // 及/或

            thirdKey === 'special_coin_asset'
              ? {
                title: this.$t('myRate.special_coin_asset', [thirdConditionSymbol]),
                key: 'thirdValue',
              }
              : { ...this.columns[thirdKey], key: 'thirdValue' },
            { title: this.$t('myRate.r2f441f53'), key: 'r2f441f53', width: '230px' }, // Maker/Taker
          );
          if (this.membershipWithdrawAmountSwitch) {
            this.tardingColumns.push({
              title: this.$t('myRate.r5080d800', ['USDT']),
              key: 'r5080d800',
            }); // 24H提现额度（USDT）
          }
          if (this.feeCoinOpen && this.currNavTabAssistant === '1') {
            const index = this.membershipWithdrawAmountSwitch
              ? this.tardingColumns.length - 1
              : this.tardingColumns.length;
            this.tardingColumns.splice(index, 0, {
              title: this.$t('myRate.r2f441f53'),
              key: 'MT',
              width: '230px',
            }); // Maker/Taker;
          }
          this.tardingColumns = this.tardingColumns.filter((x) => x);
          this.tardingColumns = this.tardingColumns.filter((x) => {
            if (!thirdKey) {
              return x.key !== 'thirdValue';
            }
            return x;
          });
          if (data.data.list) {
            const arr = [];
            const [rule0, rule1] = ruleArr;
            data.data.list.forEach((item) => {
              const makerFormat = `${fixD(nul(item.maker, 100), 6)}%`;
              const takerFormat = `${fixD(nul(item.taker, 100), 6)}%`;
              const platformMakerFormat = item.platformMaker ? `${fixD(nul(item.platformMaker, 100), 6)}%` : '';
              const platformTakerFormat = item.platformTaker ? `${fixD(nul(item.platformTaker, 100), 6)}%` : '';
              const obj = {};
              const compareRule = item.compareRule === 'ge' ? '≥ ' : '< ';
              obj.levelId = item.levelId;
              obj.levelName = item.levelName;
              obj.firstValue = item.firstValue && compareRule + item.firstValue;
              obj.rule0 = rule0;
              obj.secondValue = item.secondValue && compareRule + item.secondValue;
              obj.rule1 = rule1;
              obj.thirdValue = item.thirdValue && compareRule + item.thirdValue;
              obj.r2f441f53 = `${makerFormat} / ${takerFormat}`;
              obj.MT = `${platformMakerFormat} / ${platformTakerFormat}`;
              if (this.membershipWithdrawAmountSwitch) {
                obj.r5080d800 = item.withdrawAmount;
              }
              arr.push(obj);
            });
            this.vipList = data.data.list;
            this.tardingDataList = arr;
          }

          this.tardingTableLoading = false;
        }
      });
    },

    getRate(val) {
      if (val) {
        return `${fixD(nul(val, 100), 6)}%`;
      }
      return val;
    },

    // 手续费率-充值/提现：查询所有开启币种列表 提现手续费
    handeleGetCoinWithdrawFeeList(coinSymbol) {
      this.rAndWTableLoading = true;
      this.axios({
        url: this.$store.state.url.membership.getCoinWithdrawFeeList,
        method: 'post',
        params: { coinSymbol },
      }).then((data) => {
        if (data.code.toString() === '0') {
          if (data.data.list) {
            const arr = [];
            data.data.list.forEach((item, index) => {
              // console.log(item,index)
              let obj = {};
              obj = item;
              obj.index = index;
              obj.r81dfe139 = this.$t('myRate.r49b9b1a'); // 充值手续费都是0
              arr.push(obj);
              if (obj.followList && obj.followList.length > 0) {
                obj.followList = obj.followList.map((flow) => ({
                  ...flow,
                  r81dfe139: this.$t('myRate.r49b9b1a'),
                }));
              }
            });
            this.rAndWDataList = arr;
          }
          this.rAndWTableLoading = false;
        }
      });
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
          value: `${getCoinShowName(
            leverMap[item].baseCoin,
            coinList,
          ).toUpperCase()}/${getCoinShowName(leverMap[item].quoteCoin, coinList).toUpperCase()}`,
        });
      });

      this.symbolList = list;
      if (this.symbolList.length > 0) {
        this.leverSymbol = this.symbolList[0].code;
        this.getLeverSymbolRate(this.symbolList[0].symbol);
      }
    },
    // 获取当前用户等级 当前逐仓杠杆币对 日利率
    getLeverSymbolRate(symbol) {
      const obj = this.leverRateList.find((item) => item.symbol === symbol);
      const rateObj = obj
        && obj.rateList.length > 0
        && obj.rateList.find((item) => item.levelId === this.levelId);
      this.leverSymbolRate = rateObj && fixD(rateObj.leverRate, 4);
    },

    // 开启、关闭平台币抵扣
    handleChangeUseFeeCoinOpen() {
      const info = { useFeeCoinOpen: this.useFeeCoinOpen ? '0' : '1' };
      this.$store.dispatch('updateFeeCoinOpen', info);
      clearTimeout(this.timer1);
      this.timer1 = setTimeout(() => {
        this.getUserFeeDiscount();
        this.handleGetLevelFeeConfigList();
      }, 800);
    },

    // 切换逐仓杠杆币对
    handleSelectChange(item) {
      this.leverSymbol = item.code;
      this.getLeverSymbolRate(item.symbol);
    },
    // NavTab切换
    handleChangeNavTab(item, type) {
      if (type === 'navTab') {
        this.currNavTab = item.index;
        this.findValue = '';
      } else if (type === 'navTabAssistant') {
        this.currNavTabAssistant = item.index;
        this.handleGetLevelFeeConfigList();
      }
    },
    filterInvite(key) {
      if (key === 'invite' || key === 'period_invite') {
        return true;
      }
      return false;
    },
    handleLinkTo(type, link) {
      let url = '';
      if (process.env.NODE_ENV === 'development') {
        switch (type) {
          case 'spotView':
            url = this.linkurl.exUrl ? '/ex/zh_CN/trade' : '';
            break;
          case 'contractView':
            url = this.linkurl.coUrl ? '/co/zh_CN/trade' : '';
            break;
          case 'requirements':
            url = link;
            break;
          default:
            break;
        }
      } else {
        switch (type) {
          case 'spotView':
            url = this.linkurl.exUrl ? `${this.linkurl.exUrl}/trade` : '';
            break;
          case 'contractView':
            url = this.linkurl.coUrl ? `${this.linkurl.coUrl}/trade` : '';
            break;
          case 'requirements':
            url = link;
            break;
          default:
            break;
        }
      }
      if (url === 'inviteFriends') {
        this.handleInvite();
        return;
      }
      window.location.href = url;
    },

    // table 搜索
    handlefindTable(type, value) {
      this.findValue = value;
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        // 搜索利率
        if (type === 'B') {
          this.handleGetLeverRateList(this.findValue);
        } else if (type === 'C') {
          this.handeleGetCoinWithdrawFeeList(this.findValue);
          // 搜索充值/提醒
        }
      }, 800);
    },

    getList() {
      const list = [];
      list.push({
        id: 21,
        buySort: '88',
      });
      this.dataList = list;
    },

    // 邀请好友
    handleInvite() {
      this.inviteDialogFlag = true;
    },

    handleDialogClose() {
      this.inviteDialogFlag = false;
    },
  },
};
