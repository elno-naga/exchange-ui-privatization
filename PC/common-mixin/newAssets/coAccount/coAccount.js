import {
  fixD, colorMap, imgMap, myStorage, fixRateV2, getCookie, getIconPath,
} from '@/utils';

export default {
  name: 'page-coAccount',
  data() {
    return {
      getIconPath,
      showFlag: false,
      tabelInfoData: [], // 列表元素数据
      detailsData: {}, // 账户详情
      tabelLoading: true,
      imgMap,
      colorMap,
      transferSide: '1',
      transferValue: '',
      dialogConfirmLoading: false,
      // openContract:true,
      // transStatus:0,
      symbol: null,
      // 开通合约交易弹框
      openFuturesDialogShow: false,
      switchFlag: false, // 是否隐藏零资产
      findValue: '', // 搜索币种
      defaultIcon: 'https://bigcustom-oss.oss-cn-hongkong.aliyuncs.com/upload/ieotitleIcon.png',
      isHide: myStorage.get('assets_hide') || false, // 隐藏资产,
      // 折合总资产
      totalBalance: 0,
      // 折合币种
      totalBalanceSymbol: 'BTC',
      lan: getCookie('lan') || 'en_US',
      // 昨日盈亏
      lastDayAmount: '--',
      lastRealizedAmountRate: '--',
      profitClass: '',
      showProfitTip: '',
    };
  },
  filters: {
    fixDFn(v, that) {
      return fixD(v, that.detailsData.showPrecision);
    },
  },
  watch: {
    // 监听 用户配置信息
    openContract(val) {
      if (!val) {
        this.openFuturesDialogShow = true;
      }
    },

  },
  computed: {
    market() {
      return this.$store.state.baseData.market;
    },
    // 是否开通合约
    openContract() {
      if (this.$store.state.future && this.userInfo) {
        return this.$store.state.future.openContract;
      }
      return true;
    },
    // 是否被冻结
    transStatus() {
      if (this.$store.state.future) {
        return this.$store.state.future.transStatus;
      }
      return true;
    },
    // 币种信息
    marginCoinInfor() {
      if (this.$store.state.future.marginCoinInfor) {
        return this.$store.state.future.marginCoinInfor;
      }
      return {};
    },
    // 合约列表
    contractList() {
      if (this.$store.state.future.contractList) {
        return this.$store.state.future.contractList;
      }
      return [];
    },
    userInfo() {
      if (this.$store.state.baseData.userInfo) {
        return this.$store.state.baseData.userInfo;
      }
      return {};
    },
    // 表格数据
    tableData() {
      const arr = [];
      const { coinList } = this.market ? this.market : {};
      this.tabelInfoData.forEach((item) => {
        if (!this.switchFlag || (this.switchFlag && parseFloat(item.totalAmount) >= 0.0001)) {
          if (!this.findValue
            || (this.findValue && item.symbol.toUpperCase().indexOf(this.findValue.toUpperCase())
              !== -1)) {
            const precision = this.marginCoinInfor[item.symbol].marginCoinPrecision;
            const { icon, longName } = coinList[item.symbol] ? coinList[item.symbol] : {};
            const symbolLogoUrl = icon || this.defaultIcon;
            const longTitle = longName || item.symbol;
            arr.push({
              id: JSON.stringify(item),
              coin: {
                symbolLogoUrl,
                longTitle,
                symbol: item.symbol,
              },
              canUseAmount: this.isHide ? '********' : fixD(item.canUseAmount, precision), // 可用s
              totalAmount: this.isHide ? '********' : fixD(item.totalAmount, precision), // 总资产
              totalMargin: this.isHide ? '********' : fixD(item.totalMargin, precision), // 全仓保证金
              isolateMargin: this.isHide ? '********' : fixD(item.isolateMargin, precision), // 逐仓保证金
              lockAmount: this.isHide ? '********' : fixD(item.lockAmount, precision), // 冻结保证金
              // fixD(item.realizedAmount, precision), // 已实现盈亏
              // fixD(item.unRealizedAmount, precision), // 未实现盈亏
              operation: {
                type: this.transStatus && item.symbol !== 'EXUSD' ? 'button' : 'label',
                text: item.symbol !== 'EXUSD' ? this.$t('futures.coAccount.transfer') : '', // 划转
                eventType: 'clickDialog',
                classes: [
                  this.transStatus
                    ? ''
                    : 'tableNownStyle tableTithDraw text-2-cl',
                ],
              },
            });
          }
        }
      });
      return arr;
    },
    dataListFilter() {
      // 隐藏零资产功能过滤数据
      let list = [];
      if (this.switchFlag) {
        const dataList = this.tableData.data;
        dataList.forEach((item) => {
          if (parseFloat(item[2]) >= 0.0001) {
            list.push(item);
          }
        });
      } else {
        list = this.tableData;
      }
      // 搜索框功能过滤数据
      const newList = [];
      // list.forEach((item) => {
      //   if (item.title[0].text.toUpperCase().indexOf(this.findValue.toUpperCase()) !== -1) {
      //     newList.push(item);
      //   }
      // });
      return newList;
    },
    // 表格title
    columns() {
      return [
        { title: this.$t('futures.coAccount.coin'), key: 'coin' }, // 币种
        {
          title: this.$t('futures.coAccount.canUser'), key: 'canUseAmount', sortable: true,
        }, // 可用
        {
          title: this.$t('futures.coAccount.allBalance'), key: 'totalAmount', sortable: true,
        }, // 总资产
        { title: this.$t('futures.coAccount.allMargin'), key: 'totalMargin' }, // 全仓保证金
        { title: this.$t('futures.coAccount.subMargin'), key: 'isolateMargin' }, // 逐仓保证金
        { title: this.$t('futures.coAccount.lockMargin'), key: 'lockAmount' }, // 冻结保证金
        { title: this.$t('futures.coAccount.opera'), key: 'operation' }, // 操作
      ];
    },
    // 汇率单位
    rateData() {
      return (this.market && this.market.rate)
        ? this.market.rate : {};
    },
    // 折合成法币
    legalTotalBalance() {
      const larate = this.rateData[this.lan] || this.rateData.en_US;
      if (!this.rateData || !larate || !this.totalBalance) {
        return `0.00${this.userCurrency}`;
      }
      return `${fixRateV2(this.totalBalance, larate, this.totalBalanceSymbol)}${this.userCurrency}`;
    },
    userCurrency() {
      if (this.rateData && this.rateData[this.lan]) {
        return this.rateData[this.lan].lang_coin;
      }
      if (this.rateData && this.rateData.en_US) {
        return this.rateData.en_US.lang_coin;
      }
      return 'USD';
    },
    // 按钮颜色
    colorList_1() {
      return ['main-1-bd main-1-cl', 'main-1-bg main-1-bd text-4-cl', 'main-1-bg main-1-bd text-4-cl'];
    },
    // 开始日期 2020-1-1
    startDate() {
      return this.formatDate(new Date() - 7 * 86400000);
    },
    // 结束日期 2020-1-1
    endDate() {
      return this.formatDate(new Date() - 86400000);
    },
    coinPrecision() {
      const userCurrency = getCookie('user_Currency') || 'USD';
      const larate = this.rateData[userCurrency];
      return larate ? Number(larate.coin_precision) : 2;
    },
  },
  methods: {
    init() {
      this.getData();
      if (myStorage.get('assetsSwitch')) {
        this.switchFlag = myStorage.get('assetsSwitch');
      }
      // 请求法币汇率
      // this.$store.dispatch('getPratev2');
      // 请求合约PublicInfo
      this.$store.dispatch('getFutorePublicInfo');
      this.getDetailData();
      setTimeout(() => {
        if (!this.openContract && this.openContract !== null && this.userInfo) {
          this.openFuturesDialogShow = true;
        }
      }, 1000);
    },
    getDetailData() {
      this.axios({
        url: 'position/get_assets_list',
        hostType: 'co',
        params: {
          onlyAccount: 1,
        },
      }).then((data) => {
        if (data.code.toString() === '0') {
          this.totalBalance = fixD(data.data.totalBalance, 8);
          this.totalBalanceSymbol = data.data.totalBalanceSymbol;
          if (data.data.accountList.length) {
            this.tabelInfoData = data.data.accountList;
          }
        }
        this.tabelLoading = false;
      });
    },
    tableClick(type, data) {
      if (!this.openContract && this.openContract !== null && this.userInfo) {
        this.openFuturesDialogShow = true;
      } else if (type === 'clickDialog') {
        this.symbol = JSON.parse(data).symbol;
        this.showFlag = true;
      }
    },
    // 开通合约交易
    submit() {
      this.openFuturesDialogShow = false;
      this.getDetailData();
    },
    // 关闭弹窗
    closeDialog(data) {
      if (data) {
        this.getDetailData();
      }
      // 关闭开通合约交易弹框
      this.openFuturesDialogShow = false;
      this.showFlag = false;
    },
    switchChange() {
      this.switchFlag = !this.switchFlag;
      myStorage.set('assetsSwitch', this.switchFlag);
    },
    // 隐藏零资产
    findChanges(v) {
      this.findValue = v;
    },
    // 跳转资金流水页面
    goCoFlowingWater() {
      if (!this.openContract && this.openContract !== null && this.userInfo) {
        this.openFuturesDialogShow = true;
      } else {
        this.$router.push('coFlowingWater');
      }
    },
    goCoProfitRecord() {
      if (!this.openContract && this.openContract !== null && this.userInfo) {
        this.openFuturesDialogShow = true;
      } else {
        this.$router.push('coProfitRecord');
      }
    },
    setShoewCoAccount() {
      this.isHide = !this.isHide;
      myStorage.set('assets_hide', this.isShoewCoAccount);
    },
    // 获取数据
    getData() {
      this.axios({
        url: 'account_statistics',
        hostType: 'co',
        params: {
          startDate: this.startDate,
          endDate: this.endDate,
          coinSymbol: this.userCurrency,
        },
      }).then(({ code, data, msg }) => {
        if (code.toString() === '0') {
          const {
            lastDayAmount, // 昨日盈亏
            lastRealizedAmountRate, // 昨日盈亏率
          } = data;
          // 昨日盈亏
          this.lastDayAmount = fixD(lastDayAmount, this.coinPrecision);
          // 昨日盈亏率
          if (lastRealizedAmountRate !== null) {
            if (lastRealizedAmountRate > 0) {
              this.profitClass = 'rise-1-cl';
            } else if (lastRealizedAmountRate < 0) {
              this.profitClass = 'fall-1-cl';
            }
            this.lastRealizedAmountRate = `${this.setRate(lastRealizedAmountRate)}%`;
          }
        } else {
          this.$bus.$emit('tip', { text: msg, type: 'error' });
        }
      });
    },
    // 设置百分数
    setRate(data) {
      if (data) {
        return fixD(data * 100, 2);
      }
      return 0;
    },
    formatDate(date) {
      const time = new Date(date);
      const year = time.getFullYear();
      const month = time.getMonth() + 1;
      const monthText = month < 10 ? `0${month}` : month;
      const day = time.getDate();
      const dayText = day < 10 ? `0${day}` : day;
      return `${year}-${monthText}-${dayText}`;
    },
  },
};
