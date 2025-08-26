import {
  colorMap, getHex, getIconPath, myStorage,
} from '@/utils';

export default {
  name: 'chartsDepth',
  components: {},
  props: {
    chartType: { default: null, type: Number },
  },
  watch: {
    chartType() {
      this.myEcharts.resize();
    },
  },
  data() {
    return {
      getIconPath,
      symbolCurrent: '',
      isshowLoading: true,
      myEcharts: null,
      echartsData: {
        minval: 0,
        maxval: 0,
        buysArr: [],
        asksArr: [],
      },
      styleObject: {
        height: '450px',
      },
    };
  },
  methods: {
    // 当前币对
    getSymbolCurrent() {
      const tradeType = this.$route.query.type || 'spot';
      if (tradeType === 'isolated') {
        this.symbolCurrent = myStorage.get('leverSymbolName');
      } else if (tradeType === 'cross') {
        this.symbolCurrent = myStorage.get('crossSymbolName');
      } else {
        this.symbolCurrent = myStorage.get('sSymbolName');
      }
    },
    init() {
      this.getSymbolCurrent();
      this.initEachart();
      this.$bus.$on('ECHARTS_DATA', (data) => {
        if (data) {
          this.echartsData = data;
          this.eachart();
        } else {
          this.echartsData = {
            minval: 0,
            maxval: 0,
            yminval: 0,
            ymaxval: 0,
            buysArr: [],
            asksArr: [],
          };
          this.eachart();
        }
      });
      // 获取 当前选中的货币对
      this.$bus.$on('SYMBOL_CURRENT', (val) => {
        this.symbolCurrent = val;
        this.echartsData = {
          minval: 0,
          maxval: 0,
          yminval: 0,
          ymaxval: 0,
          buysArr: [],
          asksArr: [],
        };
        this.eachart();
      });
      this.$bus.$on('WINFOW_ON_RESIIZE', () => {
        if (this.myEcharts) {
          this.myEcharts.resize();
        }
      });
    },
    eachart() {
      this.myEcharts.resize();
      this.isshowLoading = false;
      let series = [];
      series = [
        {
          ...this.seriesTypes.buy,
          data: this.echartsData.buysArr,
          type: 'line',
        },
        {
          ...this.seriesTypes.ask,
          data: this.echartsData.asksArr,
          type: 'line',
        },
      ];
      this.myEcharts.setOption({
        xAxis: [
          {
            min: this.echartsData.minval,
            max: this.echartsData.maxval,
          },
        ],
        // yAxis: [
        //   {
        //     min: this.echartsData.yminval,
        //     max: this.echartsData.ymaxval,
        //   },
        // ],
        series,
      });
    },
    initEachart() {
      const self = this;
      // 基于准备好的dom，初始化echarts实例
      this.myEcharts = window.echarts.init(document.getElementById('myEcharts'));
      // 绘制图表
      this.myEcharts.setOption({
        animation: false,
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
              backgroundColor: '##909090', // 故意写错的 auto 没效果 这样颜色就会随着类型变化  ！！！
              borderColor: '##909090', // 故意写错的  auto 没效果  这样颜色就会随着类型变化！！！
              color: '#fff',
            },
          },
        },
        // dataZoom: [
        //   {
        //     type: 'slider',
        //     show: true,
        //     filterMode: 'none', // 缩放区域外（在这里作用是避免数据中断）
        //     xAxisIndex: [0],
        //     start: 100,
        //     end: 0,
        //   },
        // ],
        grid: {
          show: true,
          borderWidth: 0,
          borderColor: getHex(colorMap['fill-6-bd']),
          containLabel: true,
          left: 5,
          top: 40,
          right: 5,
          bottom: 0,
        },
        xAxis: {
          type: 'value',
          splitNumber: 3,
          axisPointer: {
            show: true,
            type: 'line',
            lineStyle: {
              color: getHex(colorMap['text-2-cl']),
              width: 2,
              type: 'dotted',
            },
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
            showMinLabel: false,
            showMaxLabel: false,
            color: getHex(colorMap['text-2-cl']),
            formatter: function name(value) {
              const val = value.toFixed(self.fixValue.priceFix);
              return val;
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
            min: 'dataMin',
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
      });
    },
  },
  computed: {
    seriesTypes() {
      const buy = {
        type: 'line',
        symbol: 'none',
        itemStyle: {
          normal: {
            color: colorMap['rise-1-bg'],
          },
        },
        lineStyle: {
          normal: {
            color: colorMap['rise-1-bg'],
            width: 2,
          },
        },
        areaStyle: {
          normal: {
            color: new window.echarts.graphic.LinearGradient(
              0, 0, 0, 1,
              [
                { offset: 0, color: colorMap['rise-1-bg'] },
                { offset: 1, color: colorMap['rise-4-bg'] },
              ],
            ),
          },
        },
        data: [],
      };
      const ask = {
        type: 'line',
        symbol: 'none',
        lineStyle: {
          normal: {
            color: colorMap['fall-1-bg'],
            width: 2,
          },
        },
        itemStyle: {
          normal: {
            color: colorMap['fall-1-bg'],
          },
        },
        areaStyle: {
          normal: {
            color: new window.echarts.graphic.LinearGradient(
              0, 0, 0, 1,
              [
                { offset: 0, color: colorMap['fall-1-bg'] },
                { offset: 1, color: colorMap['fall-4-bg'] },
              ],
            ),
          },
        },
        data: [],
      };
      const autoBuy = {
        ...buy,
        lineStyle: {
          normal: {
            width: 0,
          },
        },
      };
      const autoAsk = {
        ...ask,
        lineStyle: {
          normal: {
            width: 0,
          },
        },
      };
      return {
        buy,
        ask,
        autoBuy,
        autoAsk,
      };
    },
    // 全部币对列表
    symbolAll() {
      return this.$store.state.baseData.symbolAll;
    },

    // 当前币对精度计算的值
    fixValue() {
      if (this.symbolAll && this.symbolCurrent) {
        const symbol = this.symbolAll[this.symbolCurrent];
        if (!symbol) {
          return {
            priceFix: 2,
            volumeFix: 8,
          };
        }
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
  },
};
