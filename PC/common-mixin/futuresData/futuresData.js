import {
  colorMap, getHex, imgMap, formatTime, fixD, getCookie, nul, thousandsComma,
} from '@/utils';

export default {
  name: 'futuresData',
  data() {
    return {
      imgMap,
      colorMap,
      tableType: 6,
      headClasses: 'fill-2-bg',
      bodyClasses: 'fill-2-bg',
      symbol: null,
      type: null,
      contractId: null,
      tableLoading: true,
      dataList: [],
      brokenLineList: [],
      historyList: [],
      amount: 0,
      pagination: {
        // 翻页数据
        count: 0, // 总数量
        pageSize: 10, // 每页显示条数
        page: 1, // 当前页数
      },
      coinAlias: null, // usdt名义价值
      ruleTime: null, // 规则更新时间
    };
  },
  computed: {
    // 币种信息
    marginCoinInfor() {
      if (this.$store.state.future.marginCoinInfor) {
        return this.$store.state.future.marginCoinInfor;
      }
      return {};
    },
    // 类型列表 USDT合约/币本位合约
    typeTabList() {
      return [
        {
          code: '1',
          value: this.$t('futuresData.typeTabList1'), // 'USDT合约',
        },
        {
          code: '0',
          value: this.$t('futuresData.typeTabList2'), // '币本位合约',
        },
        {
          code: '2',
          value: this.$t('futuresData.typeTabList3'), // '混合合约',
        },
        {
          code: '3',
          value: this.$t('futuresData.typeTabList4'), // '模拟合约',
        },
      ];
    },
    tbaleTitle() {
      let text = this.$t('futuresData.tabList1'); //  '收支记录';
      if (this.tableType === 2) {
        text = this.$t('futuresData.tabList2'); //  '历史数据';
      }
      if (this.tableType === 3) {
        text = this.$t('futuresData.tabList3'); //  '指数价格组成';
      }
      return text;
    },
    moreText() {
      const lang = getCookie('lan');
      let data = {
        text: this.$t('futuresData.moreText1'), //  '了解保险基金',
        link: lang === 'zh_CN' ? 'https://futuresdoc.gitbook.io/help-center/v/cn/yong-xu-he-yue/untitled-1/bao-xian-ji-jin-yu-fen-tan' : 'https://futuresdoc.gitbook.io/help-center/perpetual/overview/insurance-fund-and-allocation',
      };
      if (this.tableType === 2) {
        data = {
          text: this.$t('futuresData.moreText2'), //  '了解资金费率',
          link: lang === 'zh_CN' ? 'https://futuresdoc.gitbook.io/help-center/v/cn/yong-xu-he-yue/untitled-1/zi-jin-fei-lv' : 'https://futuresdoc.gitbook.io/help-center/perpetual/overview/funding-rate',
        };
      }
      if (this.tableType === 3) {
        data = {
          text: this.$t('futuresData.moreText3'), //  '了解指数价格',
          link: lang === 'zh_CN' ? 'https://futuresdoc.gitbook.io/help-center/v/cn/yong-xu-he-yue/untitled-1/zhi-shu-jia-ge' : 'https://futuresdoc.gitbook.io/help-center/perpetual/overview/index-price',
        };
      }
      if (this.tableType === 4) {
        data = {
          text: this.$t('futuresData.moreText4'), //  '了解指标记价格',
          link: lang === 'zh_CN' ? 'https://futuresdoc.gitbook.io/help-center/v/cn/yong-xu-he-yue/untitled-1/biao-ji-jia-ge' : 'https://futuresdoc.gitbook.io/help-center/perpetual/overview/mark-price',
        };
      }
      return data;
    },
    // 合约列表
    contractList() {
      if (this.$store.state.future) {
        return this.$store.state.future.contractList;
      }
      return null;
    },
    // 当前基金币种信息
    acriveSymbol() {
      let data = {};
      if (this.contractList.length && this.symbol) {
        this.contractList.forEach((item) => {
          if (item.marginCoin === this.symbol) {
            data = item;
          }
        });
      }
      return data;
    },
    // 当前合约信息
    acriveContract() {
      let data = {};
      if (this.contractList.length && this.symbol) {
        this.contractList.forEach((item) => {
          if (item.id === this.contractId) {
            data = item;
          }
        });
      }
      return data;
    },
    // 合约列表
    marketList() {
      const data = [];
      if (this.contractList && this.contractList.length) {
        this.contractList.forEach((item) => {
          if (Number(this.type) === this.filterType(item)) {
            data.push({
              value: item.contractOtherName,
              code: item.id,
            });
          }
        });
      }

      return data;
    },
    // 保证金币种列表
    marginCoinList() {
      if (this.$store.state.future.marginCoinList) {
        return this.$store.state.future.marginCoinList;
      }
      return [];
    },
    tabList() {
      return [
        {
          key: 6,
          text: this.$t('futuresInfo.LvrgnMg'), // '杠杆和保证金',
        },
        {
          key: 1,
          text: this.$t('futuresData.tabList1'), // '永续合约保险基金',
        },
        {
          key: 2,
          text: this.$t('futuresData.tabList2'), // '资金费率',
        },
        {
          key: 3,
          text: this.$t('futuresData.tabList3'), // '指数价格',
        },
        {
          key: 4,
          text: this.$t('futuresData.tabList4'), // '标记价格',
        },
      ];
    },
    // 保险基金币种
    symbolOPtion() {
      const arr = [];
      if (this.marginCoinList.length) {
        this.marginCoinList.forEach((item) => {
          arr.push({
            value: item,
            code: item,
          });
        });
      }

      return arr;
    },
    columns() {
      if (this.tableType === 6) {
        return [
          {
            title: this.$t('futuresInfo.Tier'), //  '层级',
            key: 'lever',
          },
          {
            title: this.$t('futuresInfo.PositionBraket', { coinAlias: this.coinAlias }), //  '持仓(usdt名义价值)',
            promptText: this.$t('futuresInfo.PBtips'), // 为多空仓位的总和
            key: 'PBtips',
          },
          {
            title: this.$t('futuresInfo.MaxLeverage'), //  '最高杠杆倍数',
            key: 'MaxLeverage',
            promptText: this.$t('futuresInfo.MLtips'),
          },
          {
            title: this.$t('futuresInfo.MtncMgRt'), //  '维持保证金率',
            key: 'MtncMgRt',
            promptText: this.$t('futuresInfo.MMRtips'),
          },
        ];
      }
      if (this.tableType === 1) {
        return [
          {
            title: this.$t('futuresData.columns1'), //  '时间',
            key: 'time',
          },
          {
            title: this.$t('futuresData.columns2'), //  '流水类型',
            key: 'type',
          },
          {
            title: this.$t('futuresData.columns3'), //  '金额',
            key: 'amount',
          },
        ];
      }
      if (this.tableType === 2) {
        return [
          {
            title: this.$t('futuresData.columns1'), //  '时间',
            key: 'time',
          },
          {
            title: this.$t('futuresData.columns4'), //  '合约',
            key: 'name',
          },
          {
            title: this.$t('futuresData.columns5'), //  '当期资金费率',
            key: 'fee',
          },
        ];
      }
      return [
        {
          title: this.$t('futuresData.columns6'), //  '交易所',
          key: 'name',
        },
        {
          title: this.$t('futuresData.columns7'), //  '权重',
          key: 'rate',
        },
      ];
    },
    contractName() {
      if (this.contractId && this.marketList.length) {
        let name = '';
        this.marketList.forEach((item) => {
          if (this.contractId === item.code) {
            name = item.value;
          }
        });
        return name;
      }
      return '';
    },
    publicInfo() {
      if (this.$store.state && this.$store.state.baseData) {
        return this.$store.state.baseData.publicInfo;
      }
      return null;
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
        str = `${this.$t('futuresData.pageTitle')} | ${this.$t('pageTitle.contract')} | ${title}`;
      }
      return str;
    },
  },
  watch: {
    // 页面标题title
    documentTitle(val) {
      setTimeout(() => {
        document.title = val;
      }, 200);
    },
    // 永续合约保险基金列表
    symbolOPtion(val, old) {
      if (val.length && !old.length) {
        this.setSymbolValue();
      }
    },
    // 永续合约保险基金
    symbol(val) {
      if (val) {
        this.pagination.page = 1;
        setTimeout(() => {
          this.getData();
        }, 500);
        this.getRiskAccount();
      }
    },
    // 合约类型列表
    typeTabList(val, old) {
      if (val.length && !old.length) {
        // this.type = val[0].code;
        this.setTypeValue();
      }
    },
    // 合约列表
    marketList(val) {
      if (val.length) {
        this.pagination.page = 1;
        // this.contractId = val[0].code;
        this.setcoValue();
      } else {
        this.contractId = null;
      }
    },
    contractId(val) {
      this.brokenLineList = [];
      if (val) {
        setTimeout(() => {
          this.getData();
        }, 500);
      }
    },
    tableType(val) {
      if (val) {
        this.setSymbolValue();
        if (this.typeTabList.length) {
          // this.type = this.typeTabList[0].code;
          this.setTypeValue();
        }
        if (this.marketList.length) {
          // this.contractId = this.marketList[0].code;
          this.setcoValue();
        }
        this.$nextTick(() => {
          this.getData();
        });
      }
    },
  },
  methods: {
    init() {
      this.setInitValue();
      this.setSymbolValue();
      document.title = this.documentTitle;
      this.$nextTick(() => {
        setTimeout(() => {
          if (this.tableType === 1 || this.tableType === 2) {
            this.initEachart();
          }
        }, 300);
      });
    },
    // 设置默认保险基金币种
    setSymbolValue() {
      if (this.symbolOPtion.length) {
        const { marginCoin } = this.$route.query;
        if (marginCoin && this.isIndexFo(this.symbolOPtion, marginCoin)) {
          this.symbol = marginCoin;
        } else if (this.isIndexFo(this.symbolOPtion, 'USDT')) {
          this.symbol = 'USDT';
        } else {
          this.symbol = this.symbolOPtion[0].code;
        }
      }
    },
    // 设置默认合约类型
    setTypeValue() {
      this.tableLoading = true;
      if (this.typeTabList.length) {
        const { type } = this.$route.query;
        if (type && this.isIndexFo(this.typeTabList, type)) {
          this.type = type;
        } else {
          this.type = this.typeTabList[0].code;
        }
      }
    },
    // 设置默认合约
    setcoValue() {
      if (this.marketList.length) {
        const { contractId } = this.$route.query;
        if (contractId && this.isIndexFo(this.marketList, contractId)) {
          this.contractId = Number(contractId);
        } else {
          this.contractId = this.marketList[0].code;
        }
      }
    },
    isIndexFo(list, val) {
      let flag = false;
      list.forEach((item) => {
        if (item.code.toString() === val.toString()) {
          flag = true;
        }
      });
      return flag;
    },
    setInitValue() {
      // 合约列表
      if (this.marketList.length) {
        // this.contractId = this.marketList[0].code;
        this.setcoValue();
      }
      // 合约类型
      if (this.typeTabList.length) {
        // this.type = this.typeTabList[0].code;
        this.setTypeValue();
      }
      // 保险基金币种
      if (this.symbolOPtion.length) {
        // this.symbol = this.symbolOPtion[0].code;
        this.setSymbolValue();
      }
    },

    initEachart() {
      // 基于准备好的dom，初始化echarts实例
      this.myEcharts = window.echarts.init(document.getElementById('chartbox'));
      // 绘制图表
      this.myEcharts.setOption({
        animation: false,
        tooltip: {
          trigger: 'axis', // 不限时弹层
          axisPointer: { // 显示随手指移动的刻度线
            type: 'cross',
            label: {
              color: getHex(colorMap['text-1-cl']),
              backgroundColor: getHex(colorMap['fill-2-bg']),
            },
            crossStyle: {
              width: 2,
              color: getHex(colorMap['text-2-cl']),
              type: 'cross',
            },
          },
        },
        grid: {
          show: true,
          borderWidth: 0,
          borderColor: getHex(colorMap['fill-6-bd']),
          containLabel: true,
          left: 0,
          top: 40,
          right: 0,
          bottom: 0,
        },
        xAxis: {
          data: [],
          axisPointer: {
            show: true,
            type: 'line',
          },
          axisLine: {
            show: true,
            lineStyle: {
              width: 1,
              color: getHex(colorMap['fill-6-bd']),
            },
          },
          axisTick: {
            lineStyle: {
              color: getHex(colorMap['fill-6-bd']),
            },
          },
          axisLabel: {
            color: getHex(colorMap['text-2-cl']),
            formatter: function name(value) {
              return value;
            },
          },
          splitLine: {
            lineStyle: {
              width: 1,
              color: getHex(colorMap['fill-6-bd']),
            },
          },
        },
        yAxis: [
          {
            type: 'value',
            axisLine: {
              show: true,
              lineStyle: {
                width: 1,
                color: getHex(colorMap['fill-6-bd']),
              },
            },
            axisTick: {
              lineStyle: {
                color: getHex(colorMap['fill-6-bd']),
              },
            },
            axisLabel: {
              color: getHex(colorMap['text-2-cl']),
            },
            splitLine: {
              lineStyle: {
                width: 1,
                color: getHex(colorMap['fill-6-bd']),
              },
            },
          },
        ],
        series: [{
          data: [],
          lineStyle: {
            color: getHex(colorMap['main-1-cl']),
          },
          itemStyle: {
            color: getHex(colorMap['main-1-cl']),
          },
          type: 'line',
        }],
      });
    },
    // 筛选币对列表
    filterType(data) {
      // USDT 合约
      if (data.classification === 1) {
        this.showTypeTabList1 = true;
        return 1;
      }
      // 币本位合约
      if (data.classification === 2) {
        this.showTypeTabList0 = true;
        return 0;
      }
      // 模拟合约
      if (data.classification === 4) {
        this.showTypeTabList3 = true;
        return 3;
      }
      // 混合合约
      this.showTypeTabList2 = true;
      return 2;
    },
    // 切换类型
    switcherType(obj) {
      this.pagination.page = 1;
      this.pagination.count = 0;
      this.tableType = obj.key;
      this.dataList = [];
      if (obj.key === 1) {
        this.getRiskAccount();
      }
      if (this.tableType === 6) {
        this.$nextTick(() => {
          this.getData();
        });
      }
      if (this.tableType === 1 || this.tableType === 2) {
        this.$nextTick(() => {
          this.initEachart();
        });
      }
    },
    // 切换合约类型
    contractTypeChange(item) {
      if (this.type === item.code) { return; }
      this.type = item.code;
      if (this.marketList[0] && this.marketList[0].code) {
        this.contractId = this.marketList[0].code; // 默认第一个合约
      }
    },
    // 切换合约
    contractChange(item) {
      this.contractId = item.code;
      this.$nextTick(() => {
        this.getData();
      });
    },
    // select 选择事件
    selectOnChange(data, name) {
      this[name] = data.code;
      this.symbol = data.code;
      this.$nextTick(() => {
        this.getData();
      });
    },
    getData() {
      let url = this.$store.state.url.futures.riskBalanceList;
      const { originalCoin, marginCoinPrecision } = this.marginCoinInfor[this.symbol];

      let paramsData = {
        symbol: originalCoin,
        page: this.pagination.page,
        limit: this.pagination.pageSize,
      };
      if (this.tableType === 1) {
        paramsData = {
          symbol: originalCoin,
          page: this.pagination.page,
          limit: this.pagination.pageSize,
        };
      }
      if (this.tableType === 2) {
        url = this.$store.state.url.futures.fundingRateList;
        paramsData = {
          contractId: this.contractId,
          page: this.pagination.page,
          limit: this.pagination.pageSize,
        };
      }
      if (this.tableType === 3) {
        url = this.$store.state.url.futures.indexPriceWeightList;
        paramsData = {
          contractId: this.contractId,
          page: this.pagination.page,
          limit: this.pagination.pageSize,
        };
      }
      if (this.tableType === 6) {
        // 合约信息公示
        url = this.$store.state.url.futures.publicFuturesContractInfo;
        paramsData = {
          contractId: this.contractId,
        };
      }
      this.brokenLineList = [];
      this.axios({
        url,
        hostType: 'co',
        params: paramsData,
      }).then(({ data, code, msg }) => {
        this.tableLoading = false;
        if (code === '0') {
          this.historyList = data.historyList;
          if (!data.brokenLineList) {
            this.brokenLineList = [{ amount: 100, ctime: 0 }];
          } else {
            this.brokenLineList = data.brokenLineList;
            let time = [];
            let datas = [];
            const datasTwo = [];
            if (this.brokenLineList && this.brokenLineList.length) {
              this.brokenLineList.forEach((item) => {
                time.push(formatTime(item.ctime));
                if (this.tableType === 1) {
                  datas.push(fixD(item.amount, marginCoinPrecision));
                  datasTwo.push(fixD(item.amount, marginCoinPrecision));
                } else {
                  datas.push(nul(item.amount, 100));
                  datasTwo.push(nul(item.amount, 100));
                }
              });
            } else {
              time = [0];
              datas = [0];
            }
            datasTwo.sort((a, b) => a - b);
            const min = datasTwo[0]; // 5
            const max = datasTwo[datasTwo.length - 1]; // 56
            if (this.tableType === 1 || this.tableType === 2) {
              this.myEcharts = window.echarts.init(document.getElementById('chartbox'));
              this.myEcharts.setOption({
                tooltip: {
                  trigger: 'axis', // 不限时弹层
                  axisPointer: { // 显示随手指移动的刻度线
                    type: 'cross',
                    crossStyle: {
                      width: 2,
                      color: getHex(colorMap['text-2-cl']),
                      type: 'cross',
                    },
                    label: {
                      precision: this.tableType === 1 ? 0 : 'auto', // 坐标指示器保留几位小数
                      formatter: this.tableType === 2 ? '{value}' : '{value}',
                      color: getHex(colorMap['text-1-cl']),
                      backgroundColor: getHex(colorMap['fill-2-bg']),

                    },
                  },
                  formatter: (params) => {
                    let relVal = params[0].name;
                    for (let i = 0, l = params.length; i < l; i += 1) {
                      if (this.tableType === 2) {
                        relVal += `<br/>${params[i].marker}${params[i].value} %`;
                      } else {
                        relVal += `<br/>${params[i].marker}${params[i].value}`;
                      }
                    }
                    return relVal;
                  },
                },
                xAxis:
                {
                  data: time,
                },
                yAxis: {
                  min,
                  max,
                  axisLabel: {
                    formatter: this.tableType === 2 ? '{value} %' : '{value}',
                  },
                },
                series: [
                  {
                    type: 'line',
                    data: datas,
                  },
                ],
              });
            }
          }
          if (this.tableType === 3) {
            this.setData(data.records);
          } else if (this.tableType === 6) {
            this.coinAlias = data.coinAlias;
            this.ruleTime = formatTime(Number(data.mTime));
            this.setData(data.leverMarginInfo);
          } else {
            this.setData(this.historyList);
          }
          if (this.tableType === 1) {
            this.pagination.count = data.hisCount;
          }
          if (this.tableType === 2) {
            this.pagination.count = data.count;
          }
        } else {
          this.$bus.$emit('tip', { text: msg, type: 'error' });
        }
      });
    },
    setData(dataList) {
      const arr = [];
      if (dataList && dataList.length) {
        if (this.tableType === 1) {
          dataList.forEach((item) => {
            arr.push({
              id: item.id,
              time: formatTime(item.ctime),
              // '接管盈利注入' : '风险准备金支出',
              type: item.type === 1
                ? this.$t('futuresData.text2')
                : this.$t('futuresData.text3'),
              amount: fixD(item.hisAmount, this.acriveSymbol.mCionFix),
            });
          });
        }
        if (this.tableType === 2) {
          dataList.forEach((item) => {
            arr.push({
              id: item.id,
              time: formatTime(item.ctime),
              name: item.contractName,
              fee: `${fixD(item.amount * 100, 5)}%`,
            });
          });
        }
        if (this.tableType === 3) {
          dataList.forEach((item) => {
            arr.push({
              id: item.id,
              name: item.name,
              rate: `${fixD(item.weightRate * 100, 2)}%`,
            });
          });
        }
        if (this.tableType === 6) {
          // 合约信息公示
          dataList.forEach((item) => {
            arr.push({
              id: item.level,
              lever: item.level,
              PBtips: `${thousandsComma(item.minPositionValue)}-${thousandsComma(item.maxPositionValue)}`,
              MaxLeverage: `${item.maxLever}`,
              MtncMgRt: item.minMarginRate,
            });
          });
        }
      }
      this.dataList = arr;
    },
    getRiskAccount() {
      const url = this.$store.state.url.futures.getRiskAccount;
      const { originalCoin } = this.marginCoinInfor[this.symbol];
      const paramsData = {
        coinSymbol: originalCoin,
      };
      this.axios({
        url,
        hostType: 'co',
        params: paramsData,
      }).then(({ data, code }) => {
        this.tableLoading = false;
        if (code === '0') {
          this.amount = fixD(data.amount, this.acriveSymbol.mCionFix);
        }
      });
    },
    pagechange(v) {
      this.pagination.page = v;
      this.$nextTick(() => {
        this.getData();
      });
    },
    linkMore(link) {
      window.open(link);
    },
    thousandsComma(num) {
      if (num) {
        return thousandsComma(num);
      }
      return num;
    },
  },
};
