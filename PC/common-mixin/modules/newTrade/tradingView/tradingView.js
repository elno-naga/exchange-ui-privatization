import {
  myStorage, getCookie, colorMap, getHex, imgMap, getCoinShowName, logImg, getIconPath, getScript,
} from '@/utils';

export default {
  name: 'tradingView',
  data() {
    return {
      getIconPath,
      TvBoxHeight: '455px',
      // 颜色主题
      theme: 'theme_default',
      // 图标类型 TV：1 Echart: 2
      chartType: 1,
      symbolCurrent: myStorage.get('sSymbolName'),
      MywebSocket: null,
      lastTimeS: myStorage.get('lastTimeS'),
      language: getCookie('lan') ? getCookie('lan').split('_')[0] : '',
      lTime: null,
      fTime: 0,
      isCreateWidget: false,
      isshowLoading: true,
      chartTypeHove: null,
      isfullTv: false,
      isfullTvsd: null,
      echartLoaded: false,
      loadingEchart: false,
      // 市场横向滚动参数
      slidePosition: 0,
      topMenuBarWidth: 0,
      maxPosition: 0,
      maskBg: true,
      lanArry: [
        'ar',
        'zh_TW',
        'zh',
        'cs',
        'da_DK',
        'nl_NL',
        'en',
        'et_EE',
        'fr',
        'de',
        'el',
        'he_IL',
        'hu_HU',
        'id_ID',
        'it',
        'ja',
        'ko',
        'ms_MY',
        'no',
        'fa',
        'pl',
        'pt',
        'ro',
        'ru',
        'sk_SK',
        'es',
        'sv',
        'th',
        'tr',
        'vi',
      ],
      // 合约全部币对
      coSymbolAll: null,
      timeValue: '',
      isTimeSeletFocus: false, // 时间选择hover
      timeHoverIndex: null,
      fullTip: false,
      outFullTip: false,
      isShowSlide: false,
      activeChartType: myStorage.get('lastChartType') || { name: 'Candles', value: 1, svg: 'TV_Candles' },
    };
  },
  props: {
    moduleType: {
      type: String,
      default: 'ex',
    },
  },
  computed: {
    publicInfo() {
      return this.$store.state.baseData.publicInfo || {};
    },
    lan() {
      if (this.$store.state.baseData) {
        return this.$store.state.baseData.lan;
      }
      return null;
    },
    klineLogo() {
      return imgMap.tradingViewLogo || '';
    },
    templateLayoutType() {
      return this.$store.state.baseData.templateLayoutType;
    },
    timeFormatArray() {
      try {
        return this.$store.state.baseData.market.klineScale;
      } catch (w) {
        return [
          '1min',
          '5min',
          '15min',
          '30min',
          '60min',
          '4h',
          '1day',
          '1week',
          '1month',
        ];
      }
    },
    baseTimeArry() {
      try {
        const klineScale = this.$store.state.baseData.market.klineScale || [];
        const hideTimeArr = ['1min', '5min', '1month'];
        return klineScale.filter((item) => hideTimeArr.indexOf(item) < 0);
      } catch (w) {
        return [
          '15min',
          '30min',
          '60min',
          '4h',
          '1day',
          '1week',
        ];
      }
    },
    // 当前货币对名称数据
    symbolName() {
      if (this.symbolCurrent) {
        if (this.moduleType === 'co') {
          const symbolArr = this.symbolCurrent.toLowerCase().split('/');
          return {
            base: this.symbolCurrent.split('/')[0],
            count: this.symbolCurrent.split('/')[1],
            name: this.symbolCurrent,
            symbol: symbolArr[1] ? symbolArr[0] + symbolArr[1] : symbolArr[0],
          };
        }
        const symbolArr = this.symbolCurrent.toLowerCase().split('/');
        const showSymbol = getCoinShowName(this.symbolCurrent, this.symbolAll);
        const showSymbolArr = showSymbol.toLowerCase().split('/');
        return {
          base: this.symbolCurrent.split('/')[0],
          count: this.symbolCurrent.split('/')[1],
          name: this.symbolCurrent,
          symbol: symbolArr[0] + symbolArr[1],
          showSymbol: showSymbolArr[0] + showSymbolArr[1],
        };
      }
      return {
        base: null, // 基础货币
        count: null, // 计价货币
        name: null, // 大写 带/
        symbol: null, // 小写
      };
    },
    timeArry() {
      const a = [];
      if (this.timeFormatArray.length) {
        this.timeFormatArray.forEach((it) => {
          const t = [];
          if (it.indexOf('min') > -1) {
            t.push(it, `${parseFloat(it)}`);
          } else if (
            it.toLowerCase().indexOf('h') > -1
              && it.indexOf('month') < 0
          ) {
            t.push(it, `${parseFloat(it) * 60}`);
          } else if (it.indexOf('day') > -1) {
            t.push(it, `${parseFloat(it)}D`);
          } else if (it.indexOf('week') > -1) {
            t.push(it, `${parseFloat(it)}W`);
          } else if (it.indexOf('month') > -1) {
            t.push(it, `${parseFloat(it)}M`);
          }
          a.push(t);
        });
      }
      return a;
    },
    // 币币and杠杆 全部货币对
    symbolAll() {
      return this.$store.state.baseData.symbolAll;
    },
    themeTV() {
      const theme = getCookie('cusSkin') || getCookie('defSkin') || '1';
      const stheme = theme.toString() === '1' ? 'Dark' : 'Light';
      return stheme;
    },
    timeOptions() {
      return [
        {
          value: '1min',
          label: '1min',
        },
        {
          value: '5min',
          label: '5min',
        },
        {
          value: '1month',
          label: '1month',
        },
      ];
    },
    selectedBg() {
      if (this.timeValue || this.isTimeSeletFocus) {
        return 'fill-3-bg';
      }
      return '';
    },
    // TV类型列表
    chartTypeList() {
      return [
        { name: this.$t('tradingview.Bars'), value: 0, svg: 'TV_Bars' }, // 美国线
        { name: this.$t('tradingview.Candles'), value: 1, svg: 'TV_Candles' }, // K线图
        { name: this.$t('tradingview.Line'), value: 2, svg: 'TV_Line' }, // 线形图
        { name: this.$t('tradingview.Area'), value: 3, svg: 'TV_Area' }, // 面积图
        { name: this.$t('tradingview.HeikenAshi'), value: 8, svg: 'TV_HeikenAshi' }, // HeikenAshi
        { name: this.$t('tradingview.HollowCandles'), value: 9, svg: 'TV_HollowCandles' }, // 空心K线图
        { name: this.$t('tradingview.Baseline'), value: 10, svg: 'TV_Baseline' }, // 基准线
        { name: this.$t('tradingview.HighLow'), value: 12, svg: 'TV_Highlow' }, // 高-低
        { name: this.$t('tradingview.Column'), value: 13, svg: 'TV_Column' }, // 柱状图
        { name: this.$t('tradingview.LineWithMarkers'), value: 14, svg: 'TV_LineWithMarkers' }, // 带标记线
        { name: this.$t('tradingview.Stepline'), value: 15, svg: 'TV_Stepline' }, // 阶梯线
        { name: this.$t('tradingview.HLCArea'), value: 16, svg: 'TV_HLCArea' }, // HLC区域
      ];
    },
  },
  methods: {
    init() {
      // 杠杆当前选中的币对
      if (this.moduleType === 'lever') {
        this.symbolCurrent = myStorage.get('leverSymbolName');
      }
      // 合约当前选中的币对
      if (this.moduleType === 'co') {
        this.TvBoxHeight = '710px';
        this.symbolCurrent = myStorage.get('coNowSymbol');
      }
      // 监听TV 是否是全屏状态
      document.removeEventListener('fullscreenchange', this.quitfullTv);
      document.addEventListener('fullscreenchange', this.quitfullTv);
      this.$bus.$on('SYMBOL_LIST_ALL', (data) => {
        this.coSymbolAll = data;
      });
      // 设置国际版TV的高度
      this.setTvBoxHeight();
      this.$bus.$on('WINFOW_ON_RESIIZE', () => {
        this.topMenuBarWidth = this.$refs.topMenuBar.offsetWidth;
        // 监听TV 是否是全屏状态
        this.quitfullTv();
      });
      if (this.lanArry.indexOf(this.language) <= -1) {
        this.language = 'en';
      }
      if (getCookie('lan') === 'el_GR') {
        this.language = 'zh_TW';
      }
      if (getCookie('lan') === 'zh_TC') {
        this.language = 'zh_TW';
      }
      if (!myStorage.get('lastTimeS')) {
        myStorage.set('lastTimeS', '30min');
        this.lastTimeS = '30min';
      }
      if (myStorage.get('lastTimeS')
          && this.baseTimeArry
          && this.baseTimeArry.length) {
        const val = myStorage.get('lastTimeS');
        this.timeValue = this.baseTimeArry.indexOf(val) !== -1 ? '' : val;
      }
      // 监听 WebSocket 链接成功
      this.$bus.$on('WEBSOCKET_ON_OPEN', (val) => {
        this.MywebSocket = JSON.parse(JSON.stringify(val));
        if (this.MywebSocket) {
          this.isCreateWidget = false;
          this.isshowLoading = true;
          const skin = myStorage.get('skin');
          const cookieCusSkin = getCookie('cusSkin') || getCookie('defSkin') || '1';
          if (skin && skin !== cookieCusSkin) {
            myStorage.remove('exTradingViewData');
          }
          this.initTradingView();
        }
      });
      // 获取 当前选中的货币对
      this.$bus.$on('SYMBOL_CURRENT', (val) => {
        if (this.symbolCurrent !== val) {
          this.removeMAStudies();
          if (this.chartType === 1) {
            this.isshowLoading = true;
          }
          this.symbolCurrent = val;
          if (window.tvWidget) {
            let { showSymbol } = this.symbolName;
            if (this.moduleType === 'co') {
              showSymbol = this.symbolName.symbol;
            }
            const lastTimeS = this.lastTimeS === 'Line' ? '1min' : this.lastTimeS;
            this.$bus.$emit('LAST-TIMES', lastTimeS);
            window.tvWidget.setSymbol(
              showSymbol,
              this.getTimeMin(true, lastTimeS),
              () => {
                this.widget.chart().executeActionById('chartReset');
                this.creatMA();
              },
            );
          }
        }
        this.setTvBoxHeight();
      });
      this.$bus.$on('HIDE_LOADING', () => {
        this.isshowLoading = false;
        this.maskBg = false;
      });
      const screenWidth = document.body.clientWidth;
      let screenHeight = document.documentElement.clientHeight;
      if (screenWidth < 961) {
        this.isMobile = true;
        this.TvBoxHeight = `${screenHeight - 180}px`;
        this.disabled_features_arr.push('header_settings');
      }
      this.$bus.$on('isMobile', (data) => {
        this.isMobile = data;
        if (data) {
          screenHeight = document.documentElement.clientHeight;
          this.TvBoxHeight = `${screenHeight - 180}px`;
        } else {
          this.setTvBoxHeight();
        }
      });
      // 市场 个数的超出宽度
      this.maxPosition = this.$refs.topMenuBox.offsetWidth - this.$refs.topMenuBar.offsetWidth;
    },
    setTvBoxHeight() {
      let bodyH = document.documentElement.clientHeight;
      const { activeName } = this.$route.meta;
      if (bodyH < 800) bodyH = 800;
      if (this.templateLayoutType === '2') {
        if (this.moduleType === 'co') {
          this.TvBoxHeight = '100%';
        } else {
          this.TvBoxHeight = '455px';
        }
      } else {
        this.TvBoxHeight = '455px';
      }
      // 如果是专业版交易页面 则设置 TV的高度为响应式（包含币币和杠杆）
      if (activeName && activeName.indexOf('proTrade') > -1) {
        this.TvBoxHeight = '455px';
      }
      if (this.isMobile) {
        const screenHeight = document.documentElement.clientHeight;
        this.TvBoxHeight = `${screenHeight - 150}px`;
      }
      if (this.moduleType === 'lever') {
        this.TvBoxHeight = '455px';
      }
    },
    enter(index) {
      this.chartTypeHove = index;
    },
    leave() {
      this.chartTypeHove = null;
    },
    chartTypeShow(num) {
      if (this.chartType === num || this.chartTypeHove === num) {
        return true;
      }
      return false;
    },
    initTradingView() {
      this.createWidget();
    },
    // tadingView 生命周期函数
    udf_datafeed() {
      const self = this;
      return {
        onReady(callback) {
          const cnf = {
            supported_resolutions: self.getTimeMin(false, 1), // 数组
            supports_group_request: false,
            supports_marks: true,
            supports_search: false,
            supports_timescale_marks: false,
          };
          setTimeout(() => {
            callback(cnf);
          }, 0);
        },
        // 切换币对后
        resolveSymbol(symbolName, onSymbolResolvedCallback) {
          setTimeout(() => {
            onSymbolResolvedCallback({
              name: symbolName,
              'exchange-traded': '',
              'exchange-listed': '',
              minmov: 1,
              minmov2: 0,
              pointvalue: 1,
              session: '0000-2400:1234567',
              has_intraday: true,
              has_no_volume: false,
              volume_precision: 1,
              description: symbolName.toUpperCase(),
              type: 'bitcoin',
              supported_resolutions: self.getTimeMin(false, 1),
              pricescale: self.fixDepthNumber(self.symbolName.name),
              ticker: symbolName.toUpperCase(),
              timezone: window.jstz.determine().name(),
            });
          }, 0);
        },
        // 获取深度数据（k线无需请求深度）
        calculateHistoryDepth() {
          return undefined;
        },
        // tradingview 获取历史数据
        getBars(
          symbolInfo,
          resolution,
          periodParams,
          onHistoryCallback,
        ) {
          if (periodParams.firstDataRequest) {
            self.lTime = false;
          }
          const lastTimeS = self.lastTimeS === 'Line' ? '1min' : self.lastTimeS;
          if (self.MywebSocket) {
            self.$bus.$emit('WEBSOCKET_KLINE_SEND', {
              type: 'req',
              symbol: self.symbolName.symbol,
              lastTimeS,
              lTime: self.lTime,
              number: 50,
              sd: '2222',
            });
          }
          self.$bus.$off('KLINE_DATA_REQ');
          self.$bus.$on('KLINE_DATA_REQ', (data) => {
            const channelArr = data.channel.split('_');
            const Ntime = channelArr[channelArr.length - 1];
            let [, symbolType] = data.channel.split('_');
            if (self.moduleType === 'co') {
              const [, symbol, type] = data.channel.split('_');
              symbolType = `${symbol}_${type}`;
            }
            if (data.event_rep === 'rep' && symbolType === self.symbolName.symbol && lastTimeS === Ntime) {
              self.fTime = 0;
              const klData = data.data;
              const arrData = [];
              if (data.data && data.data.length) {
                klData.forEach((item) => {
                  arrData.push(self.setData(item));
                });
                self.fTime = arrData[arrData.length - 1].time;
                if (self.lTime === klData[0].id) {
                  onHistoryCallback([], { noData: true });
                  logImg({
                    host: window.location.host,
                    type: 'onHistoryCallback',
                    path: window.location.href,
                    ds: 'onHistoryCallback noDate',
                    data: {
                      symbol: self.symbolCurrent,
                    },
                    t: new Date().getTime(),
                  });
                } else {
                  self.lTime = klData[0].id;
                  onHistoryCallback(arrData);
                }
              } else {
                if (self.secend < 3) {
                  self.udf_datafeed().getBars(
                    symbolInfo,
                    resolution,
                    periodParams,
                    onHistoryCallback,
                  );
                  self.secend += 1;
                  return;
                }
                if (!self.lTime) {
                  logImg({
                    host: window.location.host,
                    type: 'tradingView',
                    path: window.location.href,
                    ds: 'first onHistoryCallback noData',
                    data,
                    t: new Date().getTime(),
                  });
                }
                onHistoryCallback([], { noData: true });
              }
            }
          });
        },
        // tradingview 获取实时数据
        subscribeBars(symbolInfo, resolution, onRealtimeCallback, subscriberUID, onResetCacheNeededCallback) {
          self.isshowLoading = false;
          self.maskBg = false;
          const lastTimeS = self.lastTimeS === 'Line' ? '1min' : self.lastTimeS;
          if (self.MywebSocket) {
            self.$bus.$emit('WEBSOCKET_KLINE_SEND', {
              type: 'sub',
              symbol: self.symbolName.symbol,
              lastTimeS,
            });
          }
          self.$bus.$off('KLINE_DATA_SUB');
          self.$bus.$on('KLINE_DATA_SUB', (data) => {
            const channelArr = data.channel.split('_');
            const Ntime = channelArr[channelArr.length - 1];
            let symbolType;
            if (self.moduleType === 'co') {
              const [, symbol, type] = data.channel.split('_');
              symbolType = `${symbol}_${type}`;
            } else {
              [, symbolType] = data.channel.split('_');
            }
            if (
              data.tick
              && symbolType === self.symbolName.symbol
              && Ntime === lastTimeS
            ) {
              const tickData = self.setData(data.tick);
              if (self.fTime < tickData.time) {
                onRealtimeCallback(tickData);
              }
            }
          });
          self.$bus.$on('LAST-TIMES', () => {
            onResetCacheNeededCallback();
          });
        },
        // tradingview 取消订阅上一 币对 / 刻度
        unsubscribeBars(subscriberUID) {
          const arr = subscriberUID.split('_');
          let symbol = arr[0].toLowerCase();
          let lastTimeS = self.getTimeMin(true, arr[2]);
          if (self.moduleType === 'co') {
            symbol = arr[0].toLowerCase() + arr[1].toLowerCase();
            lastTimeS = self.getTimeMin(true, parseFloat(arr[2]));
          }
          self.$bus.$emit('WEBSOCKET_KLINE_SEND', {
            type: 'unsub',
            symbol,
            lastTimeS,
          });
        },
      };
    },
    // 创建 TradingView
    createWidget() {
      class F extends window.TradingView.widget { }
      const exTradingViewData = myStorage.get('exTradingViewData');
      // eslint-disable-next-line no-multi-assign
      this.widget = window.tvWidget = new F({
        debug: false,
        theme: this.themeTV,
        autosize: true,
        auto_save_delay: 1,
        symbol: this.symbolName.showSymbol,
        interval: this.getTimeMin(true, this.lastTimeS),
        locale: this.language, // 语言
        datafeed: this.udf_datafeed(), // 配置 生命周期
        user_id: 'public_user',
        client_id: 'tradingview.com',
        container: 'tv_chart_container', // DOM id
        charts_storage_api_version: '1.1',
        timezone: window.jstz.determine().name(),
        library_path: '/static/charting_library/', // 静态文件路径
        custom_css_url: '/static/charting_library/themes/index.css',
        StudyTargetPriceScale: 'NoScale',
        // charts_storage_url: `${window.location.protocol}//saveload.tradingview.com`,
        toolbar_bg: getHex(colorMap['fill-2-bg']), // 工具栏底色
        studies_overrides: {
          'volume.volume.color.0': getHex(colorMap['fall-1-bg']),
          'volume.volume.color.1': getHex(colorMap['rise-1-bg']),
          'volume.volume.transparency': 50,
          'volume.volume ma.transparency': 30,
          'volume.volume ma.linewidth': 5,
          'volume.show ma': true,

          'volume bands.median.color': '#33FF88', // new
          'volume bands.upper.linewidth': 7, // new

          // 'Moving Average.precision': this.priceFix(this.symbolName.name) || 4,

        },
        overrides: {
          // k线的颜色
          'paneProperties.backgroundType': 'solid',
          'paneProperties.background': getHex(colorMap['fill-2-bg']), // 图标区域 背景色
          volumePaneSize: 'small', // 成交量大小
          'scalesProperties.fontSize': 12, // 图标区域xy轴 字体大小
          'scalesProperties.textColor': getHex(colorMap['text-2-cl']), // 图标区域xy轴 文字颜色
          'scalesProperties.lineColor': getHex(colorMap['fill-6-bd']), // 图标区域xy轴颜色
          'scalesProperties.showStudyLastValue': false,
          'paneProperties.topMargin': 5,
          'paneProperties.bottomMargin': 2,
          'paneProperties.vertGridProperties.color': getHex(colorMap['fill-1-bg']), // 图标区域 表格纵轴颜色
          'paneProperties.horzGridProperties.color': getHex(colorMap['fill-1-bg']), // 图标区域 表格橫轴颜色
          'paneProperties.crossHairProperties.color': getHex(
            colorMap['text-2-bg'],
          ), // 图标区域 鼠标十字线颜色
          'paneProperties.legendProperties.showLegend': true, // 折叠信息
          'paneProperties.legendProperties.showBackground': false,
          // 柱状图颜色设置
          'mainSeriesProperties.candleStyle.upColor': getHex(colorMap['rise-1-cl']),
          'mainSeriesProperties.candleStyle.downColor': getHex(colorMap['fall-1-cl']),
          'mainSeriesProperties.candleStyle.drawWick': true,
          'mainSeriesProperties.candleStyle.drawBorder': true,
          'mainSeriesProperties.candleStyle.borderColor': '',
          'mainSeriesProperties.candleStyle.borderUpColor': getHex(colorMap['rise-1-cl']),
          'mainSeriesProperties.candleStyle.borderDownColor': getHex(colorMap['fall-1-cl']),
          'mainSeriesProperties.candleStyle.wickUpColor': getHex(colorMap['rise-1-cl']),
          'mainSeriesProperties.candleStyle.wickDownColor': getHex(colorMap['fall-1-cl']),
          'mainSeriesProperties.candleStyle.barColorsOnPrevClose': !1,
          // 分时图颜色设置
          // 分时背景色渐变 上半部分
          'mainSeriesProperties.areaStyle.color1': colorMap['main-4-bg'],
          // 分时背景色渐变 下半部分
          'mainSeriesProperties.areaStyle.color2': colorMap['main-4-bg'],
          'mainSeriesProperties.areaStyle.linecolor': getHex(
            colorMap['main-1-bd'],
          ),
          'mainSeriesProperties.areaStyle.linestyle': 0,
          'mainSeriesProperties.areaStyle.linewidth': 2,
          'mainSeriesProperties.areaStyle.priceSource': 'close',
        },
        customFormatters: {
          timeFormatter: {
            format: (date) => {
              const list = /week|month|year/i;
              if (list.test(this.lastTimeS)) return '';
              return `${this.setNumber(date.getUTCHours())}:${this.setNumber(date.getUTCMinutes())}`;
            },
          },
        },
        disabled_features: [
          'cropped_tick_marks',
          'header_widget',
          'header_symbol_search',
          'symbol_info', // 隐藏品种信息
          'volume_force_overlay',
          'adaptive_logo',
          'display_market_status',
          'use_localstorage_for_settings',
          'legend_inplace_edit',

          'timeframes_toolbar',
          'header_saveload',
          'header_resolutions',
          'header_compare',
          'header_screenshot',
          'header_undo_redo',
          'header_fullscreen_button',
          'timezone_menu',
          'scales_context_menu',
          'legend_context_menu',
          'symbol_search_hot_key',
          // 'show_chart_property_page',
          // 'timeframes_toolbar',
          // 'header_widget_dom_node',
          // 'header_indicators',
          // 'pane_context_menu',
          // 'header_fullscreen_button',
          // 'header_chart_type',
        ],
        enabled_features: ['move_logo_to_main_pane'],
        load_last_chart: true,
        saved_data: exTradingViewData || '',
        studies_access: {
          type: 'black',
          tools: [
            {
              name: 'Volume Profile Fixed Range',
            },
            {
              name: 'Ratio',
            },
            {
              name: 'Spread',
            },
            {
              name: 'Correlation - Log',
            },
            {
              name: 'Correlation Coefficient',
            },
          ],
        },
      });
      this.widget.onChartReady(() => {
        // 现在可以调用其他widget的方法了
        this.isshowLoading = false;
        this.maskBg = false;
        this.isCreateWidget = true;
        this.getIframeStatus();
        this.widget_onChartReady();
        this.creatMA();
        this.topMenuBarWidth = this.$refs.topMenuBar.offsetWidth;
        if (this.symbolName.showSymbol !== this.widget.chart().symbol()) {
          const lastTimeS = this.lastTimeS === 'Line' ? '1min' : this.lastTimeS;
          window.tvWidget.setSymbol(
            this.symbolName.showSymbol,
            this.getTimeMin(true, lastTimeS),
            () => {
              this.widget.chart().executeActionById('chartReset');
            },
          );
        }
      });
    },
    // 轮询判断404
    getIframeStatus() {
      clearInterval(this.timer);
      this.timer = setInterval(() => {
        const ifr = document.getElementsByTagName('iframe')[0].contentDocument;
        const title = ifr ? ifr.title : '';
        if (!ifr || title.indexOf('Error') !== -1 || title.indexOf('404') !== -1) {
          // this.isshowLoading = true;
          // this.createWidget();
          window.location.reload();
        } else {
          // this.isshowLoading = false;
          clearInterval(this.timer);
        }
      }, 5000);
    },
    // 格式化时间刻度
    getTimeMin(only, type) {
      if (only) {
        let t = null;
        if (this.timeArry.length) {
          this.timeArry.forEach((item) => {
            const s = item.indexOf(type);
            if (s > -1) {
              t = s === 0 ? item[1] : item[0];
            }
          });
        }
        return t;
      }
      const t = [];
      this.timeArry.forEach((item) => {
        t.push(item[type]);
      });
      return t;
    },
    priceFix(symbolName) {
      return this.symbolAll[symbolName].price;
    },
    // 精度计算
    fixDepthNumber(symbolName) {
      let n;
      if (this.moduleType === 'co') {
        n = this.coSymbolAll[symbolName].pricePrecision;
      } else {
        n = this.symbolAll[symbolName].price;
      }
      const b = 10 ** n;
      return parseFloat(b.toString());
    },
    widget_onChartReady() {
      this.widget.subscribe('onAutoSaveNeeded', () => {
        this.saveChartData();
      });
    },
    creatMA() {
      this.removeMAStudies();
      this.widget.applyStudiesOverrides({
        'Moving Average.precision': this.priceFix(this.symbolName.name) || 4,
      });
      // ===== 创建移动均线 =====
      const studies = this.widget.chart().getAllStudies();
      let flag = true;
      if (studies.length) {
        studies.forEach((element) => {
          if (element.name === 'Moving Average') {
            flag = false;
          }
        });
      }
      if (!flag) return;
      this.widget
        .chart()
        .createStudy('Moving Average', false, false, { length: 5 }, {
          'plot.color': '#F5CB89',
        });
      this.widget
        .chart()
        .createStudy('Moving Average', false, false, { length: 10 }, {
          'plot.color': '#5FCFBF',
        });
      this.widget
        .chart()
        .createStudy('Moving Average', false, false, { length: 30 }, {
          'plot.color': '#DD89F5',
        });
    },
    // 保存K线设置
    saveChartData() {
      this.widget.save((obj) => {
        myStorage.set('exTradingViewData', obj);
        myStorage.set('skin', getCookie('cusSkin') || getCookie('defSkin') || '1');
      });
    },
    // 删除移动均线
    removeMAStudies() {
      if (this.widget && this.widget.chart) {
        const allStudies = this.widget.chart().getAllStudies() || [];
        if (allStudies.length) {
          allStudies.forEach((item) => {
            if (item.name === 'Moving Average') {
              this.widget.chart().removeEntity(item.id);
            }
          });
        }
      }
    },
    setMAShow() {
      // ===== 显示移动均线 =====
      const c = this.widget.chart().getAllStudies();
      this.widget.chart().setEntityVisibility(c[0].id, true);
      this.widget.chart().setEntityVisibility(c[1].id, true);
      this.widget.chart().setEntityVisibility(c[2].id, true);
    },
    setMAHide() {
      // ===== 隐藏移动均线 =====
      const c = this.widget.chart().getAllStudies();
      this.widget.chart().setEntityVisibility(c[0].id, false);
      this.widget.chart().setEntityVisibility(c[1].id, false);
      this.widget.chart().setEntityVisibility(c[2].id, false);
    },
    timeClike(v, type) {
      console.log('ceshi');
      if (type !== 'select') {
        this.timeValue = '';
      }
      if (v !== this.lastTimeS) {
        this.lastTimeS = v;

        if (v === 'Line') {
          myStorage.set('lastTimeS', '1min');
        } else {
          myStorage.set('lastTimeS', v);
        }
        if (this.isCreateWidget) {
          const resolution = this.widget.chart().resolution();
          if (v === 'Line') {
            if (resolution !== '1') {
              this.widget.chart().setResolution('1', () => {
                this.widget.chart().setChartType(2); // 折线图
              });
            } else if (resolution === '1') {
              this.widget.chart().setChartType(2);
            }
            // this.setMAHide();
          } else {
            const lastChartType = myStorage.get('lastChartType') || { value: 1 };
            if (resolution === '1' && v === '1min') {
              this.widget.chart().setChartType(lastChartType.value); // 蜡烛图
            } else {
              const timeS = this.getTimeMin(true, v);
              this.widget.chart().setResolution(timeS.toString(), () => {
                this.widget.chart().setChartType(lastChartType.value);
                this.widget.chart().executeActionById('chartReset');
              });
            }
            this.setMAShow();
          }
        }
        this.$bus.$emit('LAST-TIMES', v);
      }
    },
    setChartType(type) {
      this.chartType = type;
      this.topMenuBarWidth = this.$refs.topMenuBar.offsetWidth;
    },
    // 格式化数据
    setData(obj) {
      let number = 0;
      if (this.lastTimeS === '1day' || this.lastTimeS === '1week' || this.lastTimeS === '1month') {
        number = 28800000;
      }
      return {
        time: obj.id * 1000 + number,
        close: obj.close,
        open: obj.open,
        high: obj.high,
        low: obj.low,
        volume: obj.vol,
      };
    },
    switchChartType(type) {
      if (type === 2) {
        if (!window.echarts && !this.loadingEchart) {
          this.loadingEchart = true;
          getScript(`${process.env.BASE_URL}static/js/echarts.min.js`).then(() => {
            this.loadingEchart = false;
            this.isshowLoading = false;
            this.echartLoaded = true;
            this.setChartType(type);
          });
        } else {
          this.setChartType(type);
        }
      } else {
        this.setChartType(type);
      }
    },
    quit(e) {
      this.isfullTv = false;
      if (this.isfullTv) {
        const key = e.keyCode;
        if (key === 27) {
          this.isfullTv = false;
        }
      }
    },
    fullTv() {
      if (!this.isfullTv) {
        this.isfullTv = true;
        const element = this.$refs.tv_chart_container;
        if (element.requestFullscreen) {
          element.requestFullscreen();
        } else if (element.mozRequestFullScreen) {
          element.mozRequestFullScreen();
        } else if (element.webkitRequestFullscreen) {
          element.webkitRequestFullscreen();
        } else if (element.msRequestFullscreen) {
          element.msRequestFullscreen();
        }
      } else {
        this.isfullTv = false;
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        }
      }
    },
    // quitfullTv() {
    //   // 监听TV 是否是全屏状态
    //   console.log('quitfullTv进来了', this.isfullTv);

    //   if (this.isfullTv) {
    //     this.isfullTv = window.fullScreen
    //       || document.webkitIsFullScreen
    //       || document.msFullscreenElement;
    //     console.log(this.isfullTv, document.webkitIsFullScreen, document.msFullscreenElement, window.fullScreen, '=====');
    //   }
    // },
    quitfullTv() {
      // 更新当前是否全屏状态
      this.isfullTv = this.isFullscreen();
    },
    isFullscreen() {
      return !!(
        document.fullscreenElement
    || document.webkitFullscreenElement
    || document.mozFullScreenElement
    || document.msFullscreenElement
      );
    },
    // 设置时间刻度的滚动
    slideMarket(type) {
      let position = parseFloat(this.slidePosition);
      if (this.$refs.topMenuBar) {
        if (type === 'left') {
          position += this.$refs.topMenuBar.offsetWidth / 2;
          if (position > 0) {
            position = 0;
          }
        } else {
          const { topMenuBox = null, topMenuBar = null } = this.$refs;
          this.maxPosition = topMenuBox.offsetWidth - topMenuBar.offsetWidth;
          position -= this.$refs.topMenuBar.offsetWidth / 2;
          if (position < -this.maxPosition) {
            position = -this.maxPosition;
          }
        }
        this.slidePosition = `${position}px`;
      }
    },
    timeLineChange(item) {
      this.timeValue = item.value;
      this.timeClike(item.value, 'select');
    },
    timeSeletFocus(val) {
      this.isTimeSeletFocus = val;
    },
    // 头部按钮点击事件
    headerBtnVevnt(type, data) {
      if (type === 'executeActionById') {
        this.widget.chart().executeActionById(data);
      } else {
        this.activeChartType = data;
        myStorage.set('lastChartType', data);
        this.widget.chart().setChartType(data.value, () => {}); // 折线图
      }
    },
  },
  beforeDestroy() {
    clearInterval(this.timer);
  },
};
