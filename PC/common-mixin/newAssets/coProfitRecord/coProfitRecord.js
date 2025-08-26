import {
  fixD, fixRate, getCookie, getCoinShowName, colorMap, myStorage, fixRateV2, getHex, getIconPath,
} from '@/utils';

export default {
  name: 'profitRecord',
  data() {
    return {
      getIconPath,
      isHide: myStorage.get('assets_hide') || false, // 隐藏资产
      totalBalance: '--', // 总资产折合
      totalRate: '--', // 折合法币
      totalBalanceSymbol: '', // 总资产折合单位
      lastDayAmount: '--', // 昨日盈亏
      lastRealizedAmountRate: '--', // 昨日盈亏率
      lastMonthAmount: '--', // 30日盈亏
      lastMouthRealizedAmountRate: '--', // 30日盈亏率
      yesterdayClass: 'text-1-cl',
      thirtyClass: 'text-1-cl',
      showProfitTip: false,
      timeHover: null,
      timeSelect: 'seven', // 时间范围
      iconHover: null,
      startTime: '', // 日历插件开始时间
      endTime: '', // 日历插件开始时间
      dateList: [],
      profitRate: [], // 累计盈亏率
      btcUAD: [], // btc涨跌率
      dayProfitData: [], // 每日盈亏
      profitData: [], // 累计盈亏
      banlanceData: [], // 资产
      assetsData: [], // 资产总值折线数据
      coinHoverIndex: null, // 资产币种划过
      totalProfitRate: '--', // 累计盈亏率
      totalProfitRateValue: '',
      totalProfit: '--', // 累计盈亏
      dayProfit: '--', // 每日盈亏
      totalAssets: '--',
      hideHover: false,
      pageData: {},
      // 单日盈亏 鼠标移入
      dayProfitShowValue: null,
      dayProfitShowValueClass: '',
      // 累计盈亏 鼠标移入
      totalProfitShowValue: null,
      totalProfitShowValueClass: '',
      // 资产总值
      totalAssetsShowValue: null,
      totalAssetsShowValueClass: '',
      lan: getCookie('lan') || 'en_US',
    };
  },
  computed: {
    legendColor() {
      return [colorMap['main-1-cl'], colorMap['main-6-cl'] || colorMap['main-2-cl']];
    },
    publicInfo() {
      return this.$store.state.baseData.publicInfo;
    },
    // market 接口
    market() {
      return this.$store.state.baseData.market;
    },
    coinList() {
      return this.market && this.market.coinList;
    },
    rate() {
      return (this.market && this.market.rate)
        ? this.market.rate : {};
    },
    // finance/account_balance 接口返回成功的数据
    exchangeData() {
      return this.$store.state.assets.exchangeData;
    },
    userCurrency() {
      if (this.rateData && this.rateData[this.lan]) {
        return this.rateData[this.lan].lang_coin;
      }
      return this.rateData && this.rateData.en_US && this.rateData.en_US.lang_coin;
    },
    // 法币logo
    langLogo() {
      return this.rate[this.userCurrency] ? this.rate[this.userCurrency].lang_logo : '';
    },
    // 开始 禁用前日期范围
    // startAgoDayHide() {
    //   if (this.endTime) {
    //     const start = new Date(this.endTime).getTime() - 180 * 86400000;
    //     return `${start / 1000}`;
    //   }
    //   return '0';
    // },
    // // 开始 禁用后日期范围
    // startFutureDayHide() {
    //   if (this.endTime) {
    //     const end = new Date(this.endTime).getTime();
    //     if (end < new Date().getTime()) {
    //       return `${end / 1000}`;
    //     }
    //   }
    //   return `${new Date().getTime() / 1000}`;
    // },
    // 结束 禁用前日期范围
    endAgoDayHide() {
      if (this.startTime) {
        const start = new Date(this.startTime).getTime();
        return `${start / 1000}`;
      }
      return '0';
    },
    // 结束 禁用后日期范围
    endFutureDayHide() {
      if (this.startTime) {
        const end = new Date(this.startTime).getTime() + 180 * 86400000;
        if (end < new Date().getTime()) {
          return `${end / 1000}`;
        }
      }
      return `${new Date().getTime() / 1000}`;
    },
    // 开始日期 2020-1-1
    startDate() {
      if (this.timeSelect === 'seven') {
        return this.formatDate(new Date() - 7 * 86400000);
      }
      if (this.timeSelect === 'thirty') {
        return this.formatDate(new Date() - 30 * 86400000);
      }
      return this.formatDate(this.startTime);
    },
    // 结束日期 2020-1-1
    endDate() {
      if (this.timeSelect !== 'customize') {
        return this.formatDate(new Date() - 86400000);
      }
      return this.formatDate(this.endTime);
    },
    option1() {
      return {
        textStyle: {
          fontFamily: 'DINPro-Medium',
        },
        xAxis: {
          type: 'category',
          data: this.dateList,
          axisLabel: {
            textStyle: {
              // x轴文字颜色
              color: colorMap['text-2-cl'],
            },
          },
          axisLine: {
            show: false, // 坐标轴线不显
          },
          axisTick: {
            // 坐标轴刻度不显示
            show: false,
          },
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            textStyle: {
              // y轴文字颜色
              color: colorMap['text-2-cl'],
            },
            formatter: '{value}%',
          },
          axisLine: {
            show: false, // 坐标轴线不显示
          },
          splitLine: {
            // 坐标轴内线的样式
            lineStyle: {
              color: colorMap['fill-6-cl'],
              type: 'dashed',
            },
          },
          axisTick: {
            // 坐标轴刻度不显示
            show: false,
          },
          splitNumber: 3,
        },
        grid: {
          left: '0%',
          right: '0%',
          bottom: '0%',
          width: '96%',
          height: '80%',
          containLabel: true,
        },
        series: [
          {
            name: this.$t('assets.coProfitRecord.text9'),
            type: 'line',
            data: this.profitRate,
            smooth: true,
            symbol: 'circle', // 设置标记的图形为circle
            normal: {
              lineStyle: {
                color: getHex(colorMap['main-1-cl']), // 圆点颜色
              },
            },
          },
          {
            name: this.$t('assets.coProfitRecord.text12'),
            type: 'line',
            data: this.btcUAD,
            smooth: true,
            symbol: 'circle', // 设置标记的图形为circle
            normal: {
              lineStyle: {
                color: colorMap['main-6-cl'], // 圆点颜色
              },
            },
          },
        ],
        color: [
          // 折线颜色
          getHex(colorMap['main-1-cl']),
          colorMap['main-6-cl'],
        ],
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'none',
          },
          backgroundColor: colorMap['fill-3-cl'],
          extraCssText: 'box-shadow: 0px 3px 4px 1px rgba(0,0,0,0.18);',
          padding: 12,
          position(pos, params, dom, rect, size) {
            const obj = {
              top: pos[1] - size.contentSize[1] - 10,
              left: pos[0] - size.contentSize[0] / 2,
            };
            return obj;
          },
          textStyle: {
            color: colorMap['text-1-cl'],
            fontSize: 12,
            lineHeight: 18,
          },
          formatter: (param) => {
            const circle1 = `<span style="display: inline-block;vertical-align: middle;width: 6px;height: 6px;border-radius: 100%;background-color: ${getHex(colorMap['main-1-cl'])};margin-right: 4px;"></span>`;
            const circle2 = `<span style="display: inline-block;vertical-align: middle;width: 6px;height: 6px;border-radius: 100%;background-color: ${colorMap['main-6-cl']};margin-right: 4px;"></span>`;
            let str = '';
            if (param[0]) {
              str += `${param[0].name}
              <div style="display: flex;justify-content: space-between;align-items: center;">
                <span style="margin-right: 40px">${circle1}${this.$t('assets.coProfitRecord.text9')}: </span><span>${this.thousands(fixD(param[0].value, this.coinPrecision))}%</span></div>`;
            }
            if (param[1]) {
              str += `<div style="display: flex;justify-content: space-between;align-items: center;">
              <span style="margin-right: 40px">${circle2}${this.$t('assets.coProfitRecord.text12')}: </span><span>${this.thousands(param[1].value)}%</span></div>`;
            }
            const triangle = `
              <div style="position: absolute; left: 45%;bottom: -10px;border: 6px solid transparent;border-top-color: ${colorMap['fill-3-cl']}"></div>
            `;
            this.totalProfitRateValue = `${param[0].value}`;
            return str + triangle;
          },
        },
        legend: {
          data: [],
          right: 0,
          textStyle: {
            color: colorMap['text-2-cl'],
          },
        },
      };
    },
    option2() {
      return {
        textStyle: {
          fontFamily: 'DINPro-Medium',
        },
        xAxis: {
          type: 'category',
          data: this.dateList,
          axisLabel: {
            textStyle: {
              // x轴文字颜色
              color: colorMap['text-2-cl'],
            },
          },
          axisLine: {
            show: false, // 坐标轴线不显示
          },
          axisTick: {
            // 坐标轴刻度不显示
            show: false,
          },
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            textStyle: {
              // y轴文字颜色
              color: colorMap['text-2-cl'],
            },
          },
          axisLine: {
            show: false, // 坐标轴线不显示
          },
          splitLine: {
            // 坐标轴内线的样式
            lineStyle: {
              color: colorMap['fill-6-bd'],
              type: 'dashed',
            },
          },
          axisTick: {
            // 坐标轴刻度不显示
            show: false,
          },
          splitNumber: 3,
        },
        grid: {
          left: '0%',
          right: '0%',
          bottom: '0%',
          width: '96%',
          height: '85%',
          containLabel: true,
        },
        series: [
          {
            data: this.dayProfitData,
            smooth: true,
            type: 'bar',
            barMaxWidth: '30px',
            symbol: 'circle', // 设置标记的图形为circle
            normal: {
              lineStyle: {
                color: getHex(colorMap['main-1-cl']), // 圆点颜色
              },
            },
          },
        ],
        color: [
          // 折线颜色
          getHex(colorMap['main-1-cl']),
        ],
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow',
            shadowStyle: {
              shadowColor: colorMap['fill-5-cl'],
              opacity: 0.5,
            },
          },
          backgroundColor: colorMap['fill-3-cl'],
          extraCssText: 'box-shadow: 0px 3px 4px 1px rgba(0,0,0,0.18);',
          padding: 12,
          position(pos, params, dom, rect, size) {
            const obj = {
              top: pos[1] - size.contentSize[1] - 10,
              left: pos[0] - size.contentSize[0] / 2,
            };
            return obj;
          },
          textStyle: {
            color: colorMap['text-1-cl'],
            fontSize: 12,
            lineHeight: 18,
          },
          formatter: (param) => {
            const circle = `<span style="display: inline-block;vertical-align: middle;width: 6px;height: 6px;border-radius: 100%;background-color: ${getHex(colorMap['main-1-cl'])};margin-right: 4px;"></span>`;
            const triangle = `
              <div style="position: absolute; left: 45%;bottom: -10px;border: 6px solid transparent;border-top-color: ${colorMap['fill-3-cl']}"></div>
            `;
            this.dayProfitShowValue = `${this.thousands(fixD(param[0].value, this.coinPrecision))}`;
            this.dayProfitShowValueClass = '';
            if (param[0].value > 0) {
              this.dayProfitShowValueClass = 'rise-1-cl';
            }
            if (param[0].value < 0) {
              this.dayProfitShowValueClass = 'fall-1-cl';
            }
            return `${param[0].name} <br/>${circle} ${this.$t('assets.coProfitRecord.text13')}: ${this.thousands(fixD(param[0].value, this.coinPrecision))}${triangle}`;
          },
        },
      };
    },
    option3() {
      return {
        textStyle: {
          fontFamily: 'DINPro-Medium',
        },
        xAxis: {
          type: 'category',
          data: this.dateList,
          axisLabel: {
            textStyle: {
              // x轴文字颜色
              color: colorMap['text-2-cl'],
            },
          },
          axisLine: {
            show: false, // 坐标轴线不显示
          },
          axisTick: {
            // 坐标轴刻度不显示
            show: false,
          },
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            textStyle: {
              // y轴文字颜色
              color: colorMap['text-2-cl'],
            },
          },
          axisLine: {
            show: false, // 坐标轴线不显示
          },
          splitLine: {
            // 坐标轴内线的样式
            lineStyle: {
              color: colorMap['fill-6-bd'],
              type: 'dashed',
            },
          },
          axisTick: {
            // 坐标轴刻度不显示
            show: false,
          },
          splitNumber: 3,
        },
        grid: {
          left: '0%',
          right: '0%',
          bottom: '0%',
          width: '96%',
          height: '85%',
          containLabel: true,
        },
        series: [
          {
            data: this.profitData,
            smooth: true,
            type: 'line',
            symbol: 'circle', // 设置标记的图形为circle
            normal: {
              lineStyle: {
                color: getHex(colorMap['main-1-cl']), // 圆点颜色
              },
            },
          },
        ],
        color: [
          // 折线颜色
          getHex(colorMap['main-1-cl']),
        ],
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'none',
          },
          backgroundColor: colorMap['fill-3-cl'],
          extraCssText: 'box-shadow: 0px 3px 4px 1px rgba(0,0,0,0.18);',
          padding: 12,
          position(pos, params, dom, rect, size) {
            const obj = {
              top: pos[1] - size.contentSize[1] - 10,
              left: pos[0] - size.contentSize[0] / 2,
            };
            return obj;
          },
          textStyle: {
            color: colorMap['text-1-cl'],
            fontSize: 12,
            lineHeight: 18,
          },
          formatter: (param) => {
            const circle = `<span style="display: inline-block;vertical-align: middle;width: 6px;height: 6px;border-radius: 100%;background-color: ${getHex(colorMap['main-1-cl'])};margin-right: 4px;"></span>`;
            const triangle = `
              <div style="position: absolute; left: 45%;bottom: -10px;border: 6px solid transparent;border-top-color: ${colorMap['fill-3-cl']}"></div>
            `;
            this.totalProfitShowValue = `${this.thousands(fixD(param[0].value, this.coinPrecision))}`;
            this.totalProfitShowValueClass = '';
            if (param[0].value > 0) {
              this.totalProfitShowValueClass = 'rise-1-cl';
            }
            if (param[0].value < 0) {
              this.totalProfitShowValueClass = 'fall-1-cl';
            }
            return `${param[0].name} <br/>${circle} ${this.$t('assets.coProfitRecord.text15')}: ${this.thousands(fixD(param[0].value, this.coinPrecision))}${triangle}`;
          },
        },
      };
    },
    option5() {
      return {
        textStyle: {
          fontFamily: 'DINPro-Medium',
        },
        xAxis: {
          type: 'category',
          data: this.dateList,
          axisLabel: {
            textStyle: {
              // x轴文字颜色
              color: colorMap['text-2-cl'],
            },
          },
          axisLine: {
            show: false, // 坐标轴线不显示
          },
          axisTick: {
            // 坐标轴刻度不显示
            show: false,
          },
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            textStyle: {
              // y轴文字颜色
              color: colorMap['text-2-cl'],
            },
          },
          axisLine: {
            show: false, // 坐标轴线不显示
          },
          splitLine: {
            // 坐标轴内线的样式
            lineStyle: {
              color: colorMap['fill-6-bd'],
              type: 'dashed',
            },
          },
          axisTick: {
            // 坐标轴刻度不显示
            show: false,
          },
          splitNumber: 7,
        },
        grid: {
          left: '0%',
          right: '0%',
          bottom: '0%',
          width: '96%',
          height: '85%',
          containLabel: true,
        },
        series: [
          {
            data: this.assetsData,
            smooth: true,
            type: 'line',
            symbol: 'circle', // 设置标记的图形为circle
            normal: {
              lineStyle: {
                color: getHex(colorMap['main-1-cl']), // 圆点颜色
              },
            },
            areaStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  {
                    offset: 0,
                    color: 'rgba(39,98,255,0.10)', // 0% 处的颜色
                  },
                  {
                    offset: 1,
                    color: 'rgba(39,98,255,0.00)', //
                  },
                ],
                global: false, // 缺省为 false
              },
            },
          },
        ],
        color: [
          // 折线颜色
          getHex(colorMap['main-1-cl']),
        ],
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'none',
          },
          backgroundColor: colorMap['fill-3-cl'],
          extraCssText: 'box-shadow: 0px 3px 4px 1px rgba(0,0,0,0.18);',
          padding: 12,
          position(pos, params, dom, rect, size) {
            const obj = {
              top: pos[1] - size.contentSize[1] - 10,
              left: pos[0] - size.contentSize[0] / 2,
            };
            return obj;
          },
          textStyle: {
            color: colorMap['text-1-cl'],
            fontSize: 12,
            lineHeight: 18,
          },
          formatter: (param) => {
            const circle = `<span style="display: inline-block;vertical-align: middle;width: 6px;height: 6px;border-radius: 100%;background-color: ${getHex(colorMap['main-1-cl'])};margin-right: 4px;"></span>`;
            const triangle = `
              <div style="position: absolute; left: 45%;bottom: -10px;border: 6px solid transparent;border-top-color: ${colorMap['fill-3-cl']}"></div>
            `;
            this.totalAssetsShowValue = `${this.thousands(fixD(param[0].value, this.coinPrecision))}`;
            this.totalAssetsShowValueClass = '';
            if (param[0].value > 0) {
              this.totalAssetsShowValueClass = 'rise-1-cl';
            }
            if (param[0].value < 0) {
              this.totalAssetsShowValueClass = 'fall-1-cl';
            }
            return `${param[0].name} <br/>${circle} ${this.$t('assets.coProfitRecord.text18')}: ${this.thousands(fixD(param[0].value, this.coinPrecision))}${triangle}`;
          },
        },
      };
    },
    // 累计盈亏
    totalProfitShow() {
      const value = this.totalProfit < 0 ? `-${Math.abs(this.totalProfit)}` : `${this.totalProfit}`;
      return fixD(value, this.coinPrecision);
    },
    // 每日盈亏
    dayProfitShow() {
      const value = this.dayProfit < 0 ? `-${Math.abs(this.dayProfit)}` : `${this.dayProfit}`;
      return fixD(value, this.coinPrecision);
    },
    totalAssetsShow() {
      const value = this.totalAssets < 0 ? `-${Math.abs(this.totalAssets)}` : `${this.totalAssets}`;
      return fixD(value, this.coinPrecision);
    },
    listData() {
      const {
        profitAmount, // 净盈利
        profitRate, // 胜率
        allProfitAmount, // 总盈利
        profitDays, // 盈利天数
        allLossAmount, // 总亏损
        lossDays, // 亏损天数
        profitAverage, // 平均盈利
        normalDays, // 持平天数
      } = this.pageData;
      return [{
        name: this.$t('assets.coProfitRecord.text21'), // '净盈利',
        promptText: this.$t('assets.coProfitRecord.text22'),
        unit: this.userCurrency,
        value: fixD(profitAmount, this.coinPrecision) || '--',
        spotColor: getHex(colorMap['main-1-cl']),
      },
      {
        name: this.$t('assets.coProfitRecord.text23'), // '胜率',
        promptText: this.$t('assets.coProfitRecord.text24'),
        unit: '%',
        value: this.setRate(profitRate) || '0',
        spotColor: '#ED6821',
      },
      {
        name: this.$t('assets.coProfitRecord.text25'), // '总盈利',
        promptText: this.$t('assets.coProfitRecord.text26'), // '所有盈利汇总',
        unit: this.userCurrency,
        value: fixD(allProfitAmount, this.coinPrecision) || '--',
        spotColor: getHex(colorMap['main-1-cl']),
        omit: '********',
      },
      {
        name: this.$t('assets.coProfitRecord.text27'), // '盈利天数',
        promptText: this.$t('assets.coProfitRecord.text28'),
        unit: this.$t('assets.coProfitRecord.text29'), // '天',
        value: profitDays || '0',
        spotColor: getHex(colorMap['main-1-cl']),
        omit: '****',
      },
      {
        name: this.$t('assets.coProfitRecord.text30'), // '总亏损',
        promptText: this.$t('assets.coProfitRecord.text31'), // '所有亏损汇总',
        unit: this.userCurrency,
        value: fixD(allLossAmount, this.coinPrecision) || '--',
        spotColor: '#13B887',
        omit: '********',
      },
      {
        name: this.$t('assets.coProfitRecord.text32'), // '亏损天数',
        promptText: this.$t('assets.coProfitRecord.text33'), // ,
        unit: this.$t('assets.coProfitRecord.text29'), // '天',
        value: lossDays || '0',
        spotColor: '#13B887',
        omit: '****',
      },
      {
        name: this.$t('assets.coProfitRecord.text34'), // '平均盈利',
        promptText: this.$t('assets.coProfitRecord.text35'),
        unit: this.userCurrency,
        value: fixD(profitAverage, this.coinPrecision) || '--',
        spotColor: '#ED6821',
        omit: '********',
      },
      {
        name: this.$t('assets.coProfitRecord.text36'), // '持平天数',
        promptText: this.$t('assets.coProfitRecord.text37'),
        unit: this.$t('assets.coProfitRecord.text29'), // '天',
        value: normalDays || '0',
        spotColor: '#ED6821',
        omit: '****',
      }];
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
        return '--';
      }
      return `${fixRateV2(this.totalBalance, larate, this.totalBalanceSymbol)}${this.userCurrency}`;
    },
    coinPrecision() {
      const larate = this.rateData[this.userCurrency];
      return larate ? Number(larate.coin_precision) : 2;
    },
  },
  watch: {
    exchangeData(v) {
      if (v && this.market) {
        this.initData();
      }
    },
    market(v) {
      if (v && this.exchangeData) {
        this.initData();
      }
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
    getCoinShowName(v, coinList) {
      return getCoinShowName(v, coinList);
    },
  },
  methods: {
    init() {
      // 请求法币汇率
      // this.$store.dispatch('getPratev2');
      this.initData();
      window.addEventListener('scroll', () => {
        this.iconHover = null;
        this.showProfitTip = null;
      });
    },
    initData() {
      this.getData();
      this.getDetailData();
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
          this.totalBalance = fixD(data.data.totalBalance, 4);
          this.totalBalanceSymbol = data.data.totalBalanceSymbol;
        }
      });
    },
    // 千分符
    thousands(num) {
      if (num && parseFloat(num)) {
        const str = num.toString();
        const reg = str.indexOf('.') > -1 ? /(\d)(?=(\d{3})+\.)/g : /(\d)(?=(?:\d{3})+$)/g;
        return str.replace(reg, '$1,');
      }
      return num;
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
    // // // 自定义时间
    dateChange(time, name) {
      this[name] = time;
      if ((name === 'startTime' && this.endTime) || (name === 'endTime' && this.startTime)) {
        if (this.endTime && this.startTime) {
          this.getData();
        }
      }
    },
    timeSelectChange(time = []) {
      [this.startTime, this.endTime] = time;
      if (this.startTime && this.endTime) {
        this.getData();
      }
    },
    coinHover(index, flag) {
      if (flag) {
        this.coinHoverIndex = index;
      } else {
        this.coinHoverIndex = null;
      }
    },
    // 设置盈亏数据
    setProfit(data) {
      const {
        lastDayAmount, // 昨日盈亏
        lastRealizedAmountRate, // 昨日盈亏率
        lastMonthAmount, // 30日盈亏
        lastMouthRealizedAmountRate, // 30日盈亏率
      } = data;
      // 昨日盈亏
      this.lastDayAmount = fixD(lastDayAmount, this.coinPrecision);
      // 30日盈亏
      this.lastMonthAmount = fixD(lastMonthAmount, this.coinPrecision);
      // 昨日盈亏率
      if (lastRealizedAmountRate !== null) {
        let sym = '+';
        if (lastRealizedAmountRate > 0) {
          this.yesterdayClass = 'rise-1-cl';
        } else if (lastRealizedAmountRate < 0) {
          sym = '';
          this.yesterdayClass = 'fall-1-cl';
        }
        this.lastRealizedAmountRate = `${sym}${this.setRate(lastRealizedAmountRate)}%`;
      }
      // 30日盈亏率
      if (lastMouthRealizedAmountRate !== null) {
        let sym = '+';
        if (lastMouthRealizedAmountRate > 0) {
          this.thirtyClass = 'rise-1-cl';
        } else if (lastMouthRealizedAmountRate < 0) {
          sym = '';
          this.thirtyClass = 'fall-1-cl';
        }
        this.lastMouthRealizedAmountRate = `${sym}${this.setRate(lastMouthRealizedAmountRate)}%`;
      }
      //
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
          this.pageData = data;
          this.initEcharts(data.amountStatisticsList);
          this.setProfit(data);
        } else {
          this.$bus.$emit('tip', { text: msg, type: 'error' });
        }
      });
    },
    fixRate(balance) {
      const fold = fixRate(balance, this.rate, 'USDT', this.userCurrency);
      if (fold !== '--') {
        return fold.slice(1);
      }
      return fold;
    },
    // 处理图表数据
    initEcharts(list) {
      const dateList = [];
      const profitRate = [];
      const btcUAD = [];
      const dayProfitData = [];
      const profitData = [];
      const assetsData = [];
      if (list && list.length) {
        list.forEach((item) => {
          const date = item.statisticsDate.split(' ')[0];
          const month = new Date(date).getMonth() + 1;
          const day = new Date(date).getDate();
          // 日期
          dateList.push(`${month}/${this.handleDay(day)}`);
          // 累计盈亏率
          profitRate.push(this.setRate(item.allRealizedAmountRate));
          // BTC累计涨跌比例
          btcUAD.push(this.setRate(item.btcAllUpDownRate));
          // 每日盈亏
          dayProfitData.push({
            value: item.realizedAmount,
            itemStyle: {
              color: this.barColor(item.realizedAmount),
            },
          });
          // 累计盈亏率
          profitData.push(fixD(item.allRealizedAmount, this.coinPrecision));
          // 资产总值
          assetsData.push(item.allAmount);
        });
        this.totalProfitRate = profitRate[profitRate.length - 1]; // 累计盈亏率
        this.totalProfit = profitData[profitData.length - 1]; // 累计盈亏
        this.dayProfit = dayProfitData[dayProfitData.length - 1].value; // 每日盈亏
        this.totalAssets = assetsData[assetsData.length - 1]; // 资产总值
        this.dateList = [...dateList];
        this.profitRate = [...profitRate];
        this.btcUAD = [...btcUAD];
        this.dayProfitData = [...dayProfitData];
        this.profitData = [...profitData];
        this.assetsData = [...assetsData];

        this.$refs.option1.setOption(this.option1);
        this.$refs.option2.setOption(this.option2);
        this.$refs.option3.setOption(this.option3);
        this.$refs.option5.setOption(this.option5);
      }
    },
    barColor(data) {
      if (data && Number(data) > 0) {
        return colorMap['rise-1-cl'];
      }
      return colorMap['fall-1-cl'];
    },
    handleDay(day) {
      return day < 10 ? `0${day}` : day;
    },
    // 隐藏显示资产
    hideAssets() {
      this.isHide = !this.isHide;
      myStorage.set('assets_hide', this.isHide);
    },
    // 回退
    goBack() {
      this.smartBack();
    },
    smartBack() {
      const from = document.referrer;
      // 如果来自站外（比如 baidu.com 或为空），则跳转到默认页面
      const isFromOutside = from === '' || !from.includes(window.location.host);
      if (isFromOutside) {
        window.location.replace('/');// 或 push
      } else {
        this.$router.back();
      }
    },
    // 选择时间范围
    selectTime(time) {
      this.timeSelect = time;
      if (time !== 'customize' || (this.endTime && this.startTime)) {
        this.getData();
      }
    },
    // 设置百分数
    setRate(data) {
      if (data) {
        return fixD(data * 100, 2);
      }
      return 0;
    },
  },
};
