import {
  nul,
  fixD,
  division,
  thousandsComma,
  getCookie,
  myStorage,
  formatTime,
  getIconPath,
} from '@/utils';

export default {
  name: 'currentSymbol',
  components: {},
  data() {
    return {
      getIconPath,
      // 标记价格隐藏显示
      explainShow1: false,
      explainShow2: false,
      explainShow3: false,
      explainShow4: false,
      // 24小时行情数据
      WsData: {},
      // 是否显示市场
      isShowMarket: false,
      // 是否显示 合约设置弹框
      setFuturesIsShow: false,

      // 下次收取资金费率开始时间戳
      nextStartTime: null,
      // 下次收取资金费率开始时间倒计时
      countDownTime: null,
      // 倒计时
      setIntervalTimer: null,
      // 当前价格颜色的Class
      activePriceClass: '',
      // 轮训倒计时
      timer: null,
      // 本期结算时间
      activeTimer: null,
      // 下期结算时间
      nextTimer: null,
      // 当前合约市场id
      contractSide: myStorage.get('futuresMarketCurrent'),
      lan: getCookie('lan'),
      explainShowTimer: null,
      realTimePrice: {},
    };
  },
  computed: {
    futuresdocUrl() {
      let url = 'https://futuresdoc.gitbook.io/help-center';
      if (this.$store.state.future && this.$store.state.future.contractProInfo) {
        url = this.$store.state.future.contractProInfo;
      }
      return url;
    },
    lantext() {
      return {
        explain1: this.$t('futures.currentSymbol.explain1'),
        explain4: this.$t('futures.currentSymbol.explain4'),
      };
    },
    // 是否登录
    isLogin() {
      return this.$store.state.baseData.isLogin;
    },
    // 当前合约信息
    contractInfo() {
      return this.$store.state.future.contractInfo;
    },
    // 资金费率间隔
    capitalFrequency() {
      if (this.contractInfo) {
        return this.contractInfo.capitalFrequency;
      }
      return 1;
    },
    // 当前合约名称
    activeContractName() {
      // let name = '';
      // let text = '';
      // if (this.contractInfo) {
      //   const nameText = this.contractInfo.symbol
      //     ? this.contractInfo.symbol.replace('-', '')
      //     : '';
      //   if (this.contractInfo.contractType !== 'E') {
      //     text = `-${this.contractInfo.marginCoin}`;
      //   }
      //   name = `${nameText}${text}`;
      // }
      // return name;
      let name = '';
      if (this.contractInfo) {
        const nameText = this.contractInfo.contractOtherName ? this.contractInfo.contractOtherName : '';
        name = `${nameText}`;
      }
      return name;
    },
    activeContractNameNew() {
      let name = '';
      if (this.contractInfo) {
        const nameText = this.contractInfo.contractOtherName ? this.contractInfo.contractOtherName : '';
        name = `${nameText}`;
      }
      return name;
    },
    // 当前合约面值
    multiplier() {
      return Number(this.$store.state.future.multiplier);
    },
    // 合约数量单位
    coUnit() {
      return this.$store.state.future.coUnit;
    },
    // 数量单位类型Number
    coUnitType() {
      return this.$store.state.future.coUnitType;
    },
    // 合约数量精度
    volfix() {
      return this.$store.state.future.volfix;
    },
    // 合约币对价格精度
    pricefix() {
      return this.$store.state.future.pricefix;
    },
    // 合约类型列表
    contractTypeText() {
      return this.$store.state.future.contractTypeText;
    },
    // 用户配置信息
    userConfig() {
      return this.$store.state.future.futureUserConfig;
    },
    // 当前合约保证金模式
    marginModel() {
      if (this.userConfig) {
        // 全仓 ： 逐仓
        return this.userConfig.marginModel === 1
          ? this.$t('futures.currentSymbol.marginModel1')
          : this.$t('futures.currentSymbol.marginModel2');
      }
      return this.$t('futures.currentSymbol.marginModel1');
    },
    // 当前合约杠杆倍数
    nowLevel() {
      if (this.userConfig) {
        return this.userConfig.nowLevel || '20';
      }
      return '20';
    },
    // 获取服务器和本地的时间差
    serveTimeDiff() {
      return this.$store.state.future.serveTimeDiff;
    },
    // 标记价格、指数价格、资金费率
    publicMarkertInfo() {
      const { publicMarkertInfo } = this.$store.state.future;
      if (publicMarkertInfo) {
        return {
          // 标记价格
          tagPrice: this.fixPrice(publicMarkertInfo.tagPrice),
          // 资金费率下次
          nextFundRate: this.fundRate(publicMarkertInfo.nextFundRate),
          // 指数价格
          indexPrice: this.fixPrice(publicMarkertInfo.indexPrice),
          // 本期资金费率
          currentFundRate: this.fundRate(publicMarkertInfo.currentFundRate),
        };
      }
      return {
        tagPrice: '--',
        nextFundRate: '--',
        currentFundRate: '--',
        indexPrice: '--',
        dealVol: '--', // 24H成交额
        dealVolUnit: '',
        volUnit: '',
      };
    },
    // 当前合约24小时行情数据
    activeWsData() {
      let obj = {
        close: '--',
        rose: '--',
        vol: '--',
        roseClass: '',
      };
      if (this.contractInfo && this.WsData) {
        const key = this.contractInfo.wsDatakey;
        if (this.WsData[key]) {
          const data = this.WsData[key];
          // 关闭当前合约价格
          this.$bus.$emit('ACTIVE_CONTRACT_PRICE', data.close);
          let { vol } = data;
          let roseClass = '';
          let slie = '';
          const val = parseFloat(data.rose, 0);
          if (val > 0) {
            roseClass = 'rise-1-cl';
            slie = '+';
          }
          if (val < 0) {
            roseClass = 'fall-1-cl';
            slie = '-';
          }
          if (val === 0) {
            roseClass = 'text-2-cl';
            slie = '';
          }
          // 标的货币
          if (this.coUnitType === 1) {
            vol = nul(vol, this.multiplier);
          }
          let volUnit; // 24H成交量 数量单位
          if (this.lan === 'zh_CN') {
            if (vol >= 0 && vol < 10000) {
              if (this.coUnitType === 1) {
                vol = fixD(vol, this.volfix);
              }
            } else if (vol >= 10000 && vol < 100000000) {
              vol = fixD(division(vol, 10000), 2); // 22.1万
              volUnit = this.$t('futures.currentSymbol.unitM');
            } else if (vol >= 100000000) {
              vol = fixD(division(vol, 100000000), 2); // 22.亿
              volUnit = this.$t('futures.currentSymbol.unitB');
            }
          } else if (vol >= 0 && vol < 1000000) {
            vol = fixD(vol, this.volfix);
          } else if (vol >= 1000000 && vol < 1000000000) {
            vol = fixD(division(vol, 1000000), 2); // 22.1M
            volUnit = this.$t('futures.currentSymbol.unitM');
          } else if (vol >= 1000000000) {
            vol = fixD(division(vol, 1000000000), 2); // 22.亿
            volUnit = this.$t('futures.currentSymbol.unitB');
          }

          let dealVol = data.amount; // 24H成交额
          if (this.contractInfo) {
            if (this.contractInfo.contractSide === 1) {
              // 1 正向
              if (this.coUnitType === 1) {
                // 币
                dealVol = nul(data.amount, this.multiplier);
              } else {
                // 张
                dealVol = nul(data.amount, this.multiplier);
              }
            }
            if (this.contractInfo.contractSide === 0) {
              // 0反向
              if (this.coUnitType === 1) {
                // 币
                dealVol = nul(data.amount, this.multiplier);
              } else {
                // 张
                dealVol = nul(data.amount, this.multiplier);
              }
            }
          }
          let dealVolUnit; // 24H成交额 数量单位
          if (this.lan === 'zh_CN') {
            if (dealVol >= 0 && dealVol < 10000) {
              dealVol = fixD(dealVol, this.marginCoinFix);
            } else if (dealVol >= 10000 && dealVol < 100000000) {
              dealVol = fixD(division(dealVol, 10000), 2); // 22.1万
              dealVolUnit = this.$t('futures.currentSymbol.unitM');
            } else if (dealVol >= 100000000) {
              dealVol = fixD(division(dealVol, 100000000), 2); // 22.亿
              dealVolUnit = this.$t('futures.currentSymbol.unitB');
            }
          } else if (dealVol >= 0 && dealVol < 1000000) {
            dealVol = fixD(dealVol, this.marginCoinFix);
          } else if (dealVol >= 1000000 && dealVol < 1000000000) {
            dealVol = fixD(division(dealVol, 1000000), 2); // 22.1M
            dealVolUnit = this.$t('futures.currentSymbol.unitM');
          } else if (dealVol >= 1000000000) {
            dealVol = fixD(division(dealVol, 1000000000), 2); // 22.亿
            dealVolUnit = this.$t('futures.currentSymbol.unitB');
          }
          obj = {
            close: this.fixPrice(data.close),
            rose: `${slie}${this.fixdRose(data.rose)}`,
            vol,
            volUnit,
            roseClass,
            dealVol,
            dealVolUnit,
          };
        }
      }
      return obj;
    },
    publicInfo() {
      if (this.$store.state && this.$store.state.baseData) {
        return this.$store.state.baseData.publicInfo;
      }
      return null;
    },
    typeTabList() {
      if (this.contractSide === 1) {
        return this.$t('futures.market.text4'); // 'USDT合约',
      }
      if (this.contractSide === 0) {
        return this.$t('futures.market.text5'); // '币本位合约',
      }
      if (this.contractSide === 2) {
        return this.$t('futures.market.text6'); // '混合合约',
      }
      if (this.contractSide === 3) {
        return this.$t('futures.market.text7'); // '模拟合约',
      }
      return this.$t('futures.market.text4'); // 'USDT合约',
    },
    // 页面标题title
    documentTitle() {
      const lang = getCookie('lan');
      let str = '';
      if (this.publicInfo) {
        const { indexHeaderTitle, seo } = this.publicInfo;
        let title = '';
        if (indexHeaderTitle) {
          if (lang) {
            title = seo.title || indexHeaderTitle[lang];
          } else {
            const lan = this.publicInfo.lan.defLan;
            title = seo.title || indexHeaderTitle[lan];
          }
        }
        if (title === undefined) {
          str = `${this.activeWsData.close}-${this.activeContractName}
          ${this.typeTabList} |
          ${this.$t('pageTitle.contract')}`;
        } else {
          str = `${this.activeWsData.close}-${this.activeContractName}
          ${this.typeTabList} |
          ${this.$t('pageTitle.contract')}| ${title}`;
        }
      }
      return str;
    },
    // 下次资金费结算时间戳
    nextCapitalSettTime() {
      return this.contractInfo ? this.contractInfo.nextCapitalSettTime : 0;
    },
    // 当前合约保证金币种
    marginCoin() {
      if (this.contractInfo) {
        return this.contractInfo.marginCoin;
      }
      return '';
    },
    // 当前合约保证金币种精度
    marginCoinFix() {
      if (this.contractInfo && this.contractInfo.coinResultVo) {
        return this.contractInfo.coinResultVo.marginCoinPrecision;
      }
      return 4;
    },

  },
  watch: {
    // 页面标题title
    documentTitle(val) {
      document.title = val;
    },
    // 当前价格变化
    activeWsData(val, old) {
      if (val && old) {
        if (val.close !== '--' || old.close !== '--') {
          const newP = parseFloat(val.close, 0);
          const oldP = parseFloat(old.close, 0);
          if (newP > oldP) {
            this.activePriceClass = 'rise-1-cl';
          } else if (newP < oldP) {
            this.activePriceClass = 'fall-1-cl';
          } else if (newP !== oldP) {
            this.activePriceClass = '';
          }
        } else if (val !== old) {
          this.activePriceClass = '';
        }
      }
      this.$bus.$emit('activeWsData', {
        close: val.close,
        class: this.activePriceClass,
      });
    },
    contractInfo(val) {
      if (val) {
        // 设置 资金费率倒计时
        this.setNextStartTime();
      }
    },
    nextCapitalSettTime(val) {
      if (val) {
        // 设置 资金费率倒计时
        this.setNextStartTime();
      }
    },
  },
  methods: {
    // 显示提示框
    explainShows(type) {
      this.explainShowTimer = setTimeout(() => {
        this[type] = true;
      }, 1000);
    },
    // 隐藏提示框
    explainHide(type) {
      clearTimeout(this.explainShowTimer);
      this[type] = false;
    },
    // 新价精度
    fixPrice(value) {
      if (value) {
        return fixD(value, this.pricefix);
      }
      return '--';
    },
    // 数量精度
    fixVol(value) {
      if (value) {
        return fixD(value, this.volfix);
      }
      return '--';
    },
    // 处理涨跌幅
    fixdRose(value) {
      if (value) {
        const num = Math.abs((value * 10000) / 100);
        return `${Number(num.toString().match(/^\d+(?:\.\d{0,2})?/))}`;
      }
      return '00.00';
    },
    // 处理资金费率
    fundRate(value) {
      if (value === 0) {
        return value;
      }
      if (value) {
        let slie;
        const val = parseFloat(value, 0);
        if (val > 0) {
          slie = '+';
        }
        if (val < 0) {
          slie = '-';
        }
        const num = Math.abs((value * 10000) / 100);
        // return `${slie}${Number(num.toString().match(/^\d+(?:\.\d{0,5})?/))}`;
        return `${slie}${fixD(num, 5)}`;
      }
      return '--';
    },

    getDateString(value) {
      const date = new Date(value);
      let taskStartTime = new Date().getTime();
      taskStartTime = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
      return taskStartTime;
    },

    // 设置下次收取资金费率开始时间戳
    setNextStartTime() {
      if (this.contractInfo) {
        // 本期结算时间
        const activeTimer = this.nextCapitalSettTime ? formatTime(this.nextCapitalSettTime) : '';
        const activeTimerArr = activeTimer ? activeTimer.split(' ') : '';
        const activeTimerHM = activeTimerArr[1] ? activeTimerArr[1].split(':') : '';
        this.activeTimer = activeTimerHM && activeTimerHM.length > 1 ? `${activeTimerHM[0]}:${activeTimerHM[1]}` : '';

        // 下期结算时间
        const nextTimerStr = this.nextCapitalSettTime && this.capitalFrequency ? this.nextCapitalSettTime + nul(this.capitalFrequency, 3600000) : 0;
        const nextTimer = nextTimerStr ? formatTime(nextTimerStr) : '';
        const nextTimerArr = nextTimer ? nextTimer.split(' ') : '';
        const nextTimerHM = nextTimerArr[1] ? nextTimerArr[1].split(':') : '';
        this.nextTimer = nextTimerHM && nextTimerHM.length > 1 ? `${nextTimerHM[0]}:${nextTimerHM[1]}` : '';
        this.countdown();
      }
    },
    // 设置倒计时
    countdown() {
      clearInterval(this.setIntervalTimer);
      this.setIntervalTimer = setInterval(() => {
        // 获取当前时间
        const nowtime = new Date().getTime() + this.serveTimeDiff;
        const lefttime = this.nextCapitalSettTime - nowtime; // 距离结束时间的毫秒数

        if (lefttime > 0) {
          let lefth = Math.floor(division(lefttime, 3600000) % 24); // 计算小时数
          let leftm = Math.floor(division(lefttime, 60000) % 60); // 计算分钟数
          let lefts = Math.floor(division(lefttime, 1000) % 60); // 计算秒数
          lefth = lefth < 10 ? `0${lefth}` : lefth;
          leftm = leftm < 10 ? `0${leftm}` : leftm;
          lefts = lefts < 10 ? `0${lefts}` : lefts;
          this.countDownTime = `${lefth}:${leftm}:${lefts}`; // 返回倒计时的字符串
        } else {
          // 重新请求PublicInfo 接口
          this.$store.dispatch('getFutorePublicInfo');
        }
      }, 1000);
    },
    // 开启弹框
    showDialog(type) {
      // 显示开通合约交易弹框
      if (this.userConfig && !this.userConfig.openContract) {
        this.$bus.$emit('OPEN_FUTURE');
        return false;
      }
      if (this.isLogin) {
        this.$store.dispatch('getUserConfig');
      }
      this[type] = true;
      return false;
    },
    // 关闭弹窗
    closeDialog() {
      // 关闭市场
      this.isShowMarket = false;
      // 关闭合约设置弹窗
      this.setFuturesIsShow = false;
    },
    // 关闭市场
    onClickOutside() {
      this.isShowMarket = false;
    },
    // 显示 市场
    showMarket() {
      this.isShowMarket = !this.isShowMarket;
    },
    init() {
      // 获取前台公共实时信息(指数价格 标记价格 资金费率)
      clearInterval(this.timer);
      this.timer = setInterval(() => {
        this.$store.dispatch('getPublicMarkertInfo');
      }, 5000);
      // 接收24小时行情数据
      this.$bus.$on('FUTURE_MARKET_DATA', (data) => {
        this.WsData = JSON.parse(data);
      });
      this.$bus.$on('futuresMarketCurrent', (data) => {
        this.contractSide = data;
      });
      this.$bus.$on('PRICE_REAL_TIME', (item) => {
        this.realTimePrice = item || {};
      });
      this.setNextStartTime();
    },
    thousandsComma(num) {
      if (num) {
        return thousandsComma(num);
      }
      return num;
    },
  },
  destroyed() {
    this.$bus.$off('FUTURE_MARKET_DATA');
    clearInterval(this.timer);
    this.timer = null;
  },
};
