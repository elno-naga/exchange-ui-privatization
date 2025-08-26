import {
  fixD,
  formatTime,
  imgMap,
  colorMap,
  getIconPath,
} from '@/utils';

export default {
  name: 'page-otcOrder',
  data() {
    return {
      imgMap,
      colorMap,
      getIconPath,
      switchFlag: false,
      tabelLoading: true,
      tabelList: [],
      startTime: '',
      endTime: '',
      nowType: 1, // 1为当前委托 2计划委托 3历史委托 4历史成交
      contractList: [], // 合约
      side: '', // 当前方向
      contractType: '', // 合约类型
      contract: '', // 当前合约
      orderType: '', // 订单类型
      paginationObj: {
        total: 0, // 数据总条数
        display: 10, // 每页显示条数
        currentPage: 1, // 当前页码
      },
      revokeList: [], // 撤销队列
      isShowStopOrder: false,
      stopOrderData: {},
      showTypeTabList1: false,
      showTypeTabList2: false,
      showTypeTabList3: false,
      showTypeTabList4: false,
      contractTypeList: [], // 合约类型
      forcePositionModal: false, // 历史委托强制减仓类型弹窗
      forcePositionText: null, // 历史委托强制减仓类型弹窗文案
      // 自动减仓弹框
      isShowAdlTip: false,
      promptTextShow: false,
      itempromptText: '',
      promptTextStylw: {
        lefT: 0,
        top: '900px',
      },
      setTimeTer: null,
    };
  },
  watch: {
    sideList(v) {
      if (v && v.length) {
        this.side = 1;
      }
    },
    contractTypeList(v) {
      if (v && v.length) {
        this.contractType = 1;
      }
    },
    orderTypeList(v) {
      if (v && v.length) {
        this.orderType = 'all';
      }
    },
    contractListAll(newVal) {
      if (newVal && newVal.length) {
        this.getContractList();
      }
    },
    side(val) {
      if (val) {
        this.getContractList();
      }
    },
    // startTime(newVal, oldVal) {
    //   if (oldVal) {
    //     this.getData();
    //   }
    // },
    // endTime(newVal, oldVal) {
    //   if (oldVal) {
    //     this.getData();
    //   }
    // },
  },
  computed: {
    lanText() {
      return {
        newText18: this.$t('futures.orderList.newText18'), // 止盈止损"
        newText19: this.$t('futures.orderList.newText19'), // 知道了"
        newText21: this.$t('futures.orderList.newText21'), // 查看"
        newText22: this.$t('futures.orderList.newText22'), // 止盈"
        newText23: this.$t('futures.orderList.newText23'), // 已生效"
        newText24: this.$t('futures.orderList.newText24'), // 未生效"
        newText25: this.$t('futures.orderList.newText25'), // 止盈触发价"
        newText26: this.$t('futures.orderList.newText26'), // 委托价"
        newText27: this.$t('futures.orderList.newText27'), // 止损"
        newText28: this.$t('futures.orderList.newText28'), // 止损触发价
        mPrice: this.$t('futures.orderList.mPrice'), // 市价
        startTime: this.$t('futures.order.startTime'), // 开始时间
        endTime: this.$t('futures.order.endTime'), // 结束时间
      };
    },
    adlLink() {
      if (this.lan === 'zh_CN') {
        return 'https://futuresdoc.gitbook.io/help-center/v/cn/yong-xu-he-yue/untitled-1/zi-dong-jian-cang-adl';
      }
      return 'https://futuresdoc.gitbook.io/help-center/perpetual/overview/adl ';
    },
    // titleText
    titleText() {
      return this.lanText.newText18;
    },
    confirmText() {
      return this.lanText.newText19; // '知道了';
    },
    startTimeNum() {
      return (new Date(this.startTime.replace(/-/g, '/')).getTime() / 1000).toString();
    },
    endTimeNum() {
      return (new Date(this.endTime.replace(/-/g, '/')).getTime() / 1000).toString();
    },
    // 合约列表
    contractListAll() {
      if (this.$store.state.future) {
        return this.$store.state.future.contractList;
      }
      return [];
    },
    // 合约列表 MAP
    contractListMap() {
      if (this.$store.state.future) {
        return this.$store.state.future.contractListMap;
      }
      return {};
    },
    coPublicInfo() { return this.$store.state.baseData.coPublicInfo; },
    navTab() {
      return [
        // 当前委托
        { name: this.$t('order.exchangeOrder.nowOrder'), index: 1 },
        // 计划委托
        { name: this.$t('futures.order.title2'), index: 2 },
        // 历史委托
        { name: this.$t('futures.order.title3'), index: 3 },
        // 历史计划委托
        { name: this.$t('futures.order.title4'), index: 4 },
        // 历史成交
        { name: this.$t('futures.order.title5'), index: 5 },
      ];
    },
    sideList() {
      return [ // 交割类型列表
        // 永续合约
        { code: 1, value: this.$t('futures.order.typeList1') },
        // 模拟合约
        { code: 2, value: this.$t('futures.order.typeList2') },
        // 混合合约
        { code: 3, value: this.$t('futures.order.typeList3') },
      ];
    },
    // 订单类型
    orderTypeList() {
      if (this.nowType === 1) {
        return [ // 订单类型列表
          // 全部
          { code: 'all', value: this.$t('futures.order.all') },
          // 限价单
          { code: 1, value: this.$t('futures.order.orderType1') },
          // PostOnly
          { code: 5, value: this.$t('futures.order.orderType3') },
        ];
      }
      return [ // 订单类型列表
        // 全部
        { code: 'all', value: this.$t('futures.order.all') },
        // 限价单
        { code: 1, value: this.$t('futures.order.orderType1') },
        // 市价单
        { code: 2, value: this.$t('futures.order.orderType2') },
        // PostOnly
        { code: 5, value: this.$t('futures.order.orderType3') },
        // IOC
        { code: 3, value: this.$t('futures.order.orderType4') },
        // FOK
        { code: 4, value: this.$t('futures.order.orderType5') },
      ];
    },
    //
    axiosType() {
      if (this.orderType === 'all') {
        return '';
      }
      return this.orderType;
    },
    // 表格title
    columns() {
      let list = [];
      if (this.nowType === 1) {
        list = [
          { title: this.$t('futures.order.contract'), key: 'name', align: 'left' }, // 合约
          { title: this.$t('futures.order.time'), key: 'time', width: '100px' }, // 时间
          { title: this.$t('futures.order.orderType'), key: 'type' }, // 订单类型
          { title: this.$t('futures.order.side'), key: 'side' }, // 方向
          { title: this.$t('futures.order.intrustPrice'), key: 'price' }, // 委托价格
          { title: this.$t('futures.order.intrustVolume'), key: 'volume' }, // 委托数量
          { title: this.$t('futures.order.dealVolume'), key: 'dealVolume' }, // 成交数量
          { title: this.$t('futures.order.dealPrice'), key: 'avgPrice' }, // 成交均价
          { title: this.$t('futures.order.onlyCut'), key: 'onlyCut' }, // 只减仓
          { title: this.lanText.newText18, key: 'stopOrder' }, // 止盈止损
          { title: this.$t('futures.order.opera'), key: 'operation' }, // 操作
        ];
      }
      if (this.nowType === 2) {
        list = [
          { title: this.$t('futures.order.contract'), key: 'name', align: 'left' }, // 合约
          { title: this.$t('futures.order.type'), key: 'type' }, // 类型
          { title: this.$t('futures.order.time'), key: 'time', width: '100px' }, // 时间
          { title: this.$t('futures.order.orderType'), key: 'status' }, // 订单类型
          { title: this.$t('futures.order.side'), key: 'side' }, // 方向
          { title: this.$t('futures.order.triggerPrice'), key: 'triggerPrice' }, // 触发价
          { title: this.$t('futures.order.intrustPrice'), key: 'price' }, // 委托价格
          { title: this.$t('futures.order.intrustVolumeOrNum'), key: 'volume' }, // 委托数量/价值
          { title: this.$t('futures.order.onlyCut'), key: 'onlyCut' }, // 只减仓
          { title: this.$t('futures.order.overTime'), key: 'overTime', width: '100px' }, // 过期时间
          { title: this.$t('futures.order.opera'), key: 'operation' }, // 操作
        ];
      }
      if (this.nowType === 3) {
        list = [
          { title: this.$t('futures.order.contract'), key: 'name', align: 'left' }, // 合约
          { title: this.$t('futures.order.orderType'), key: 'historyType' }, // 订单类型(张)
          { title: this.$t('futures.order.side'), key: 'side' }, // 方向
          { title: this.$t('futures.order.intrustPrice'), key: 'price' }, // 委托价格
          { title: this.$t('futures.order.intrustVolumeOrNum'), key: 'volume' }, // 委托数量/价值
          { title: this.$t('futures.order.dealVolume'), key: 'dealVolume' }, // 成交数量
          { title: this.$t('futures.order.dealPrice'), key: 'avgPrice' }, // 成交均价
          { title: this.$t('futures.order.fee'), key: 'fee' }, // 手续费
          { title: this.$t('futures.order.onlyCut'), key: 'onlyCut' }, // 只减仓
          { title: this.lanText.newText18, key: 'stopOrder' }, // 止盈止损
          { title: this.$t('futures.order.status'), key: 'historyStatus' }, // 状态
          { title: this.$t('futures.order.time'), key: 'time', width: '100px' }, // 时间
        ];
      }
      if (this.nowType === 4) {
        list = [
          { title: this.$t('futures.order.contract'), key: 'name', align: 'left' }, // 合约
          { title: this.$t('futures.order.type'), key: 'type' }, // 类型
          { title: this.$t('futures.order.side'), key: 'side' }, // 方向
          { title: this.$t('futures.order.triggerPrice'), key: 'triggerPrice' }, // 触发价格
          { title: this.$t('futures.order.intrustPrice'), key: 'price' }, // 委托价格
          { title: this.$t('futures.order.intrustVolumeOrNum'), key: 'volume' }, // 委托数量/价值
          { title: this.$t('futures.order.onlyCut'), key: 'onlyCut' }, // 只减仓
          { title: this.$t('futures.order.status'), key: 'historyStatus' }, // 状态
          { title: this.$t('futures.order.submitTime'), key: 'time', width: '100px' }, // 提交委托时间
          { title: this.$t('futures.order.triggerTime'), key: 'triggerTime', width: '100px' }, // 触发时间
        ];
      }
      if (this.nowType === 5) {
        list = [
          { title: this.$t('futures.order.contract'), key: 'name', align: 'left' }, // 合约
          { title: this.$t('futures.order.side'), key: 'side' }, // 方向
          { title: this.$t('futures.order.roles'), key: 'role' }, // 角色
          { title: this.$t('futures.order.dealVolume'), key: 'volume' }, // 成交数量
          { title: this.$t('futures.order.priceDeal'), key: 'price' }, // 成交价格
          { title: this.$t('futures.order.fee'), key: 'fee' }, // 手续费
          { title: this.$t('futures.order.time'), key: 'time', width: '100px' }, // 时间
        ];
      }
      return list;
    },
    // 历史委托
    historyMemoText() {
      return {
        1: this.$t('futures.orderList.memoText1'),
        2: this.$t('futures.orderList.memoText2'),
        3: this.$t('futures.orderList.memoText3'),
        4: this.$t('futures.orderList.memoText4'),
        5: this.$t('futures.orderList.memoText5'),
        6: this.$t('futures.orderList.memoText6'),
        7: this.$t('futures.orderList.memoText7'),
        8: this.$t('futures.orderList.memoText8'),
        11: this.$t('futures.orderList.deliveryTextq1'), // '系统撤销',
        12: this.$t('futures.orderList.adlText4'), // '仓位发生ADL，委托被撤销',
      };
    },
  },
  methods: {
    init() {
      if (this.sideList[0].value) {
        this.side = 1;
      }
      if (this.orderTypeList[0].value) {
        this.orderType = 'all';
      }
      if (this.contractListAll) {
        this.getContractList();
      }
      this.resetTime();
    },
    // 重置时间
    resetTime() {
      const timestamp = new Date().getTime();
      const t = 60 * 60 * 24 * 1000 * 2;
      // this.startTime = timestamp
      // this.endTime = timestamp - t
      this.startTime = new Date(this.getNowTime(timestamp - t).replace(/-/g, '/')).getTime();
      this.endTime = new Date(this.getNowTime(timestamp).replace(/-/g, '/')).getTime();
      // this.start = `${this.startTime} 00:00:00`;
      // this.end = `${this.endTime} 23:59:59`;
      this.start = formatTime(this.startTime);
      this.end = formatTime(this.endTime + 86400000 - 1);
    },
    getNowTime(time = '') {
      const date = new Date(time);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      return `${year}-${month}-${day}`;
    },
    getContractList() {
      let contractType = '';
      if (this.contractType !== '') {
        contractType = this.contractType;
      } else {
        contractType = 1;
      }
      const list = [];
      this.contract = null;
      // 订单当前委托####
      if (this.contractListAll) {
        this.contractListAll.forEach((item) => {
          // 合约订单新增classification判断
          // usdt合约
          if (item.classification === 1 && contractType === 1) {
            list.push(
              {
                code: item.id,
                // value: item.symbol.replace('-', ''),
                value: item.contractOtherName,
              },
            );
          }
          // 模拟合约
          if (item.classification === 4 && contractType === 3) {
            list.push(
              {
                code: item.id,
                // value: item.symbol.replace('-', ''),
                value: item.contractOtherName,
              },
            );
          }
          // 混合合约
          if (item.classification === 3 && contractType === 2) {
            list.push(
              {
                code: item.id,
                // value: item.symbol.replace('-', ''),
                value: item.contractOtherName,
              },
            );
          }
          // 币本位合约
          if (item.classification === 2 && contractType === 0) {
            list.push(
              {
                code: item.id,
                // value: item.symbol.replace('-', ''),
                value: item.contractOtherName,
              },
            );
          }
        });
      }
      this.contractList = list;
      if (list.length) {
        // this.$nextTick(() => {
        this.contract = list[0].code;
        // });
        this.tabelLoading = true;
        this.getData();
      } else {
        this.paginationObj.currentPage = 1; // 页码
        this.paginationObj.total = 0; // 总条数
        this.tabelList = [];
        this.tabelLoading = false;
      }
    },
    // initContractList() {
    //   const { market } = this.coPublicInfo;
    //   const list = [];
    //   Object.keys(market).forEach((vitem) => {
    //     market[vitem].forEach((item) => {
    //       const {
    //         baseSymbol, quoteSymbol, contractType, settleTime, maxLeverageLevel,
    //       } = item;
    //       let time = '';
    //       if (contractType) {
    //         const t = settleTime.split(' ')[0].split('-');
    //         time = t[1] + t[2];
    //       }
    //       const msg = `${this.getContractType(contractType)} · ${time} (${maxLeverageLevel}X)`;
    //       const str = `${baseSymbol}${quoteSymbol} - ${msg}`;
    //       list.push(
    //         {
    //           code: item.id,
    //           value: str,
    //         },
    //       );
    //     });
    //   });
    //   this.contractList = list;
    //   if (list.length) {
    //     this.contract = list[0].code;
    //     this.getData();
    //   }
    // },
    // switchChange() {
    //   this.switchFlag = !this.switchFlag;
    //   this.getData();
    // },
    getData() {
      if (this.nowType === 1) {
        setTimeout(() => {
          this.getNowData();
        }, 300);
      } else if (this.nowType === 2) {
        this.getPlanData();
      } else if (this.nowType === 3) {
        this.getHisData();
      } else if (this.nowType === 4) {
        this.getHisPlanData();
      } else if (this.nowType === 5) {
        this.getHisDealData();
      }
    },
    typeStatus(status) {
      let str = '';
      switch (status) {
        case 1:
          str = this.$t('futures.order.orderType1'); // '限价单';
          break;
        case 2:
          str = this.$t('futures.order.orderType2'); // '市价单';
          break;
        case 3:
          str = this.$t('futures.order.orderType4'); // 'IOC';
          break;
        case 4:
          str = this.$t('futures.order.orderType5'); // 'FOK';
          break;
        case 5:
          str = this.$t('futures.order.orderType3'); // 'POST_ONLY';
          break;
        case 6:
          str = this.$t('futures.order.orderType6'); // '强制减仓';
          break;
        case 7:
          str = this.$t('futures.order.orderType7'); // '仓位合并';
          break;
        case 9:
          str = this.$t('futures.orderList.deliveryTextq2'); // '系统平仓';
          break;
        case 10:
          str = this.$t('futures.orderList.deliveryTextq3'); // '系统交割';
          break;
        case 11:
          str = this.$t('futures.orderList.adlText1'); //  '自动减仓';
          break;
        default:
          str = '';
      }
      return str;
    },
    getStatus(status) {
      let str = '';
      switch (status) {
        case 0:
          str = this.$t('futures.order.status1'); // '新订单';
          break;
        case 1:
          str = this.$t('futures.order.status1'); // '新订单';
          break;
        case 2:
          str = this.$t('futures.order.status2'); // '完全成交';
          break;
        case 3:
          str = this.$t('futures.order.status3'); // '部分成交';
          break;
        case 4:
          str = this.$t('futures.order.status4'); // '已取消';
          break;
        case 5:
          str = this.$t('futures.order.status5'); // '待撤销';
          break;
        case 6:
          str = this.$t('futures.order.status6'); // '异常订单';
          break;
        case 7:
          str = this.$t('futures.order.status7'); // '部分成交已撤销';
          break;

        default:
          str = '';
      }
      return str;
    },
    getContractType(contractType) {
      let type = '';
      switch (contractType) {
        case 0:
          type = this.$t('futures.order.contractType1'); // '永续';
          break;
        case 1:
          type = this.$t('futures.order.contractType2'); // '当周';
          break;
        case 2:
          type = this.$t('futures.order.contractType3'); // '次周';
          break;
        case 3:
          type = this.$t('futures.order.contractType4'); // '月度';
          break;
        case 4:
          type = this.$t('futures.order.contractType5'); // '季度';
          break;
        default:
          type = '';
      }
      return type;
    },
    statusText(status) {
      let str = '';
      switch (status) {
        case 0:
          str = this.$t('futures.order.statusText1'); // '有效';
          break;
        case 1:
          str = this.$t('futures.order.statusText2'); // '已过期';
          break;
        case 2:
          str = this.$t('futures.order.statusText3'); // '已完成';
          break;
        case 3:
          str = this.$t('futures.order.statusText4'); // '触发失败';
          break;
        case 4:
          str = this.$t('futures.order.status4'); // '已取消';
          break;
        default:
          str = '';
      }
      return str;
    },
    // 获取当前委托
    getNowData() {
      this.axios({
        url: 'order/current_order_list',
        hostType: 'co',
        method: 'post',
        params: {
          type: this.axiosType,
          // side: this.side,
          limit: this.paginationObj.display, // 每页条数
          page: this.paginationObj.currentPage, // 页码
          contractId: this.contract,
        },
      }).then((data) => {
        if (this.nowType !== 1) return;
        this.tabelLoading = false;
        if (data.code.toString() === '0') {
          const list = [];
          const { orderList, count } = data.data;
          if (orderList && orderList.length) {
            orderList.forEach((item) => {
              const open = item.open === 'OPEN' ? this.$t('futures.order.open') : this.$t('futures.order.close');
              let side = this.$t('futures.order.sell');
              if ((item.open === 'OPEN' && item.side === 'BUY')
                || (item.open === 'CLOSE' && item.side === 'SELL')) {
                side = this.$t('futures.order.buy');
              }
              let price = null;
              if (item.type === 2 && Number(item.price) === 0) {
                price = this.$t('futures.order.currentPrice');
              } else {
                price = fixD(item.price, item.pricePrecision);
              }
              list.push({
                id: JSON.stringify(item),
                name: item.symbol, // 合约
                time: formatTime(item.ctime) ? formatTime(item.ctime).slice(5).slice(0, -3) : null, // 时间
                type: this.typeStatus(item.type),
                side: {
                  text: open + side, // 方向
                  classes: item.side === 'BUY' ? 'rise-1-cl' : 'fall-1-cl',
                },
                price, // 委托价格
                volume: item.volume, // 委托数量
                dealVolume: item.dealVolume, // 成交数量
                avgPrice: item.avgPrice ? fixD(item.avgPrice, item.pricePrecision) : '--', // 成交均价
                onlyCut: item.open === 'CLOSE'
                  ? this.$t('futures.order.yes')
                  : this.$t('futures.order.no'), // 只减仓
                // 止盈止损
                stopOrder: item.otoOrder ? {
                  type: 'button',
                  text: this.lanText.newText21, // '查看',
                  eventType: 'stopOrder',
                  classes: 'main-1-cl zs-btn',
                } : '',
                operation: {
                  type: 'button',
                  text: this.$t('futures.order.cancel'), // 撤单
                  eventType: 'cancelOrder',
                  classes: 'main-1-cl',
                },
              });
            });
          }
          this.tabelList = list;
          this.paginationObj.total = count;
        }
      });
    },
    // 获取计划委托
    getPlanData() {
      this.axios({
        url: 'order/trigger_order_list',
        hostType: 'co',
        method: 'post',
        params: {
          type: this.axiosType,
          // side: this.side,
          limit: this.paginationObj.display, // 每页条数
          page: this.paginationObj.currentPage, // 页码
          contractId: this.contract,
        },
      }).then((data) => {
        if (this.nowType !== 2) return;
        this.tabelLoading = false;
        if (data.code.toString() === '0') {
          const list = [];
          const { trigOrderList, count } = data.data;
          if (trigOrderList && trigOrderList.length) {
            trigOrderList.forEach((item) => {
              const open = item.open === 'OPEN' ? this.$t('futures.order.open') : this.$t('futures.order.close');
              let side = this.$t('futures.order.sell');
              if ((item.open === 'OPEN' && item.side === 'BUY')
                || (item.open === 'CLOSE' && item.side === 'SELL')) {
                side = this.$t('futures.order.buy');
              }
              let price = null;
              let unit = null;
              let volume = null;
              if (item.type === 2 && Number(item.price) === 0) {
                price = this.$t('futures.order.currentPrice');
                if (item.open === 'OPEN') {
                  if (this.contractListMap) {
                    unit = this.contractListMap[item.contractName].marginCoin;
                    volume = fixD(item.volume, this.contractListMap[item.contractName].mCionFix);
                  }
                } else {
                  volume = item.volume;
                  unit = this.$t('futures.order.per');
                }
              } else {
                volume = item.volume;
                price = fixD(item.price, item.pricePrecision);
                unit = this.$t('futures.order.per');
              }
              list.push({
                id: JSON.stringify(item),
                name: item.symbol, // 合约
                type: this.getTriggerType(item.triggerType),
                time: formatTime(item.ctime) ? formatTime(item.ctime).slice(5).slice(0, -3) : null, // 时间
                status: this.typeStatus(item.type),
                side: {
                  text: open + side, // 方向
                  classes: item.side === 'BUY' ? 'rise-1-cl' : 'fall-1-cl',
                },
                triggerPrice: fixD(item.triggerPrice, item.pricePrecision), // 触发价
                price, // 委托价格
                volume: `${volume} ${unit}`, // 委托数量
                onlyCut: item.open === 'CLOSE'
                  ? this.$t('futures.order.yes')
                  : this.$t('futures.order.no'), // 只减仓
                overTime: formatTime(item.expireTime)
                  ? formatTime(item.expireTime).slice(5).slice(0, -3) : null, // 过期时间
                operation: {
                  type: 'button',
                  text: this.$t('futures.order.cancel'), // 撤单
                  eventType: 'cancelOrder',
                  classes: 'main-1-cl',
                },
              });
            });
          }
          this.tabelList = list;
          this.paginationObj.total = count;
        }
      });
    },
    // 获取历史委托
    getHisData() {
      this.axios({
        url: 'order/history_order_list',
        hostType: 'co',
        method: 'post',
        params: {
          type: this.axiosType,
          limit: this.paginationObj.display, // 每页条数
          page: this.paginationObj.currentPage, // 页码
          contractId: this.contract,
          beginTime: new Date(this.start).getTime(),
          endTime: new Date(this.end).getTime(),
        },
      }).then((data) => {
        if (this.nowType !== 3) return;
        this.tabelLoading = false;
        if (data.code.toString() === '0') {
          const list = [];
          const { orderList, count } = data.data;
          if (orderList && orderList.length) {
            orderList.forEach((item, index) => {
              const open = item.open === 'OPEN' ? this.$t('futures.order.open') : this.$t('futures.order.close');
              let side = this.$t('futures.order.sell');
              if ((item.open === 'OPEN' && item.side === 'BUY')
                || (item.open === 'CLOSE' && item.side === 'SELL')) {
                side = this.$t('futures.order.buy');
              }
              let price = null;
              let unit = null;
              let volume = null;
              if (item.type === 2 && Number(item.price) === 0) {
                price = this.$t('futures.order.currentPrice');
                if (item.open === 'OPEN') {
                  if (this.contractListMap) {
                    unit = this.contractListMap[item.contractName].marginCoin;
                    volume = fixD(item.volume, this.contractListMap[item.contractName].mCionFix);
                  }
                } else {
                  volume = item.volume;
                  unit = this.$t('futures.order.per');
                }
              } else {
                volume = item.volume;
                price = fixD(item.price, item.pricePrecision);
                unit = this.$t('futures.order.per');
              }
              let lastClass = null;
              if (index > 3) {
                lastClass = 'position-bottom';
              }
              let avgPrice = null; // 成交均价
              if ((!item.avgPrice || item.type === 6) && (item.status !== 4)) {
                avgPrice = '--';
              } else if (item.status === 4) {
                avgPrice = item.avgPrice;
              } else {
                avgPrice = fixD(item.avgPrice, item.pricePrecision);
              }
              list.push({
                id: JSON.stringify(item),
                name: item.symbol, // 合约

                liqPositionMsg: item.liqPositionMsg,
                typeNumber: `${item.type}`,
                historyType: {
                  type: `${item.type}`,
                  text: this.typeStatus(item.type),
                  liqPositionMsg: item.liqPositionMsg ? this.replaceAll(item.liqPositionMsg) : '',
                  lastClass,
                },
                side: {
                  text: open + side, // 方向
                  classes: item.side === 'BUY' ? 'rise-1-cl' : 'fall-1-cl',
                },
                type: item.type,
                placementSide: index > 1 ? 'top' : 'bottom',
                price: item.type === 6 ? '--' : price, // 委托价格
                forcedPrice: fixD(item.forcedPrice, item.pricePrecision), // 强平价格
                volume: `${volume} ${unit}`, // 委托数量
                dealVolume: item.dealVolume, // 成交数量
                avgPrice, // 成交均价

                fee: `${fixD(item.tradeFee, item.pricePrecision === 0 ? 4 : item.pricePrecision)} ${this.contractListMap[item.contractName].marginCoin}`, // 手续费
                onlyCut: item.open === 'CLOSE'
                  ? this.$t('futures.order.yes')
                  : this.$t('futures.order.no'), // 只减仓
                // 止盈止损
                stopOrder: item.otoOrder ? {
                  type: 'button',
                  text: this.lanText.newText21, // '查看',
                  eventType: 'stopOrder',
                  classes: 'main-1-cl zs-btn',
                } : '',
                // 状态
                status: item.status === 4,
                memo: item.memo,
                historyStatus: {
                  text: this.getStatus(item.status),
                  historyMemoText: item.status === 4 && item.memo ? this.historyMemoText[item.memo] : '',
                  lastClass,
                },
                time: formatTime(item.ctime) ? formatTime(item.ctime).slice(5).slice(0, -3) : null, // 时间
              });
            });
          }
          this.tabelList = list;
          this.paginationObj.total = count;
        }
      });
    },
    // 获取历史计划委托
    getHisPlanData() {
      this.axios({
        url: 'order/history_trigger_order_list',
        hostType: 'co',
        method: 'post',
        params: {
          type: this.axiosType,
          limit: this.paginationObj.display, // 每页条数
          page: this.paginationObj.currentPage, // 页码
          contractId: this.contract,
          beginTime: new Date(this.start).getTime(),
          endTime: new Date(this.end).getTime(),
        },
      }).then((data) => {
        if (this.nowType !== 4) return;
        this.tabelLoading = false;
        if (data.code.toString() === '0') {
          const list = [];
          const { trigOrderList, count } = data.data;
          if (trigOrderList && trigOrderList.length) {
            trigOrderList.forEach((item, index) => {
              const open = item.open === 'OPEN' ? this.$t('futures.order.open') : this.$t('futures.order.close');
              let side = this.$t('futures.order.sell');
              if ((item.open === 'OPEN' && item.side === 'BUY')
                || (item.open === 'CLOSE' && item.side === 'SELL')) {
                side = this.$t('futures.order.buy');
              }
              let price = null;
              let unit = null;
              let volume = null;
              if (item.type === 2 && Number(item.price) === 0) {
                price = this.$t('futures.order.currentPrice');
                if (item.open === 'OPEN') {
                  if (this.contractListMap) {
                    unit = this.contractListMap[item.contractName].marginCoin;
                    volume = fixD(item.volume, this.contractListMap[item.contractName].mCionFix);
                  }
                } else {
                  volume = item.volume;
                  unit = this.$t('futures.order.per');
                }
              } else {
                volume = item.volume;
                price = fixD(item.price, item.pricePrecision);
                unit = this.$t('futures.order.per');
              }
              let lastClass = null;
              if (index > 3) {
                lastClass = 'position-bottom';
              }
              list.push({
                id: JSON.stringify(item),

                name: item.symbol, // 合约
                type: this.getTriggerType(item.triggerType),

                side: {
                  text: open + side, // 方向
                  classes: item.side === 'BUY' ? 'rise-1-cl' : 'fall-1-cl',
                },

                triggerPrice: fixD(item.triggerPrice, item.pricePrecision), // 触发价格

                price, // 委托价格
                volume: `${volume} ${unit}`, // 委托数量

                onlyCut: item.open === 'CLOSE'
                  ? this.$t('futures.order.yes')
                  : this.$t('futures.order.no'), // 只减仓

                status: item.status === 4,
                memo: item.memo,
                historyStatus: {
                  text: this.statusText(item.status),
                  historyMemoText: item.status === 4 && item.memo ? this.memoText(item) : '',
                  lastClass,
                },
                time: formatTime(item.ctime) ? formatTime(item.ctime).slice(5).slice(0, -3) : null, // 时间
                triggerTime: formatTime(item.mtime) ? formatTime(item.mtime).slice(5).slice(0, -3) : null, // 提交委托时间
              });
            });
          }
          this.tabelList = list;
          this.paginationObj.total = count;
        }
      });
    },
    replaceAll(str) {
      return str.replace(/\\n/g, '<br/>');
    },
    // 取消原因
    memoText(data) {
      let type = '';
      this.sideList.forEach((item) => {
        if (this.side === item.code) {
          type = item.value;
        }
      });
      if (data.memo === 1) {
        return this.$t('futures.order.memoText1'); // '用户取消';
      }
      if (data.memo === 2) {
        return this.$t('futures.order.memoText2'); // '超过有效期';
      }
      if (data.memo === 3) {
        // 最新价格达到
        return `${formatTime(data.mtime)}${data.symbol}${type} ${this.$t('futures.order.memoText3')}
        ${fixD(data.triggerPrice, data.pricePrecision)}
        ${this.$t('futures.order.memoText4')}`;
        // 触发计划委托，因账户保证金余额不足，委托无法提交，执行失败
      }
      if (data.memo === 4) {
        return `${formatTime(data.mtime)}${data.symbol}${type} ${this.$t('futures.order.memoText3')}
        ${fixD(data.triggerPrice, data.pricePrecision)}
        ${this.$t('futures.order.memoText5')}`;
        // 触发计划委托，因仓位可平数量不足，无法提交委托，执行失败`;
      }
      if (data.memo === 5) {
        return `${formatTime(data.mtime)}${data.symbol}${type} ${this.$t('futures.order.memoText3')}
        ${fixD(data.triggerPrice, data.pricePrecision)}
        ${this.$t('futures.order.memoText6')}`;
        // 触发计划委托，因仓位发生强平，无法提交委托，执行失败`;
      }
      if (data.memo === 6) {
        return `${formatTime(data.mtime)}${data.symbol}${type} ${this.$t('futures.order.memoText3')}
        ${fixD(data.triggerPrice, data.pricePrecision)}
        ${this.$t('futures.order.memoText7')}`;
        // 触发计划委托，因该合约已被暂停交易，无法提交委托，执行失败`;
      }
      return null;
    },
    // 获取历史成交
    getHisDealData() {
      this.axios({
        url: 'order/his_trade_list',
        hostType: 'co',
        method: 'post',
        params: {
          type: this.axiosType,
          limit: this.paginationObj.display, // 每页条数
          page: this.paginationObj.currentPage, // 页码
          contractId: this.contract,
          beginTime: new Date(this.start).getTime(),
          endTime: new Date(this.end).getTime(),
        },
      }).then((data) => {
        if (this.nowType !== 5) return;
        this.tabelLoading = false;
        if (data.code.toString() === '0') {
          const list = [];
          const { tradeHisList, count } = data.data;
          if (tradeHisList && tradeHisList.length) {
            tradeHisList.forEach((item) => {
              const open = item.open === 'OPEN' ? this.$t('futures.order.open') : this.$t('futures.order.close');
              let side = this.$t('futures.order.sell');
              if ((item.open === 'OPEN' && item.side === 'BUY')
                || (item.open === 'CLOSE' && item.side === 'SELL')) {
                side = this.$t('futures.order.buy');
              }
              list.push({
                id: JSON.stringify(item),
                name: item.symbol, // 合约
                side: {
                  text: open + side, // 方向
                  classes: item.side === 'BUY' ? 'rise-1-cl' : 'fall-1-cl',
                },
                role: item.role,
                volume: item.volume, // 成交数量
                price: fixD(item.price, item.pricePrecision), // 成交价格
                fee: `${fixD(item.fee, item.feeCoinPrecision)} ${item.feeCoin}`, // 手续费
                time: formatTime(item.ctime) ? formatTime(item.ctime).slice(5).slice(0, -3) : null, // 时间
              });
            });
          }
          this.tabelList = list;
          this.paginationObj.total = count;
        }
      });
    },
    outExcela() {
      // outExcela(url, params, type) {
      // return new Promise((resolve) => {
      //   this.axios({
      //     url,
      //     params,
      //     hostType: type,
      //     responseType: 'arraybuffer',
      //     mustAll: true,
      //   }).then(({ data, headers }) => {
      //     console.log(data, headers);
      //     const content = data;
      //     const blob = new Blob([content]);
      //     if (decodeURI(headers['content-disposition']) !== 'undefined') {
      //       const fileName = decodeURI(headers['content-disposition'].split('"')[1]);
      //       // const fileName = 'as.xlsx';
      //       // 非IE下载
      //       if ('download' in document.createElement('a')) {
      //         const elink = document.createElement('a');
      //         elink.download = fileName;
      //         elink.style.display = 'none';
      //         elink.href = URL.createObjectURL(blob);
      //         document.body.appendChild(elink);
      //         elink.click();
      //         URL.revokeObjectURL(elink.href); // 释放URL 对象
      //         document.body.removeChild(elink);
      //       } else { // IE10+下载
      //         navigator.msSaveBlob(blob, fileName);
      //       }
      //     }
      //     const enc = new TextDecoder('utf-8');
      //     const res = null;
      //     if (decodeURI(headers['content-disposition']) !== 'undefined') {
      //       res = { code: '0' }; // 转化成json对象
      //     } else {
      //       res = JSON.parse(enc.decode(new Uint8Array(data))); // 转化成json对象
      //     }
      //     resolve(res);
      //   });
      // });
    },
    // 导出CSV
    exportCSV() {
      // let exporturl = '';
      // if (this.nowType === 3) {
      //   exporturl = 'order/export/his_order_list_saas';
      // } else if (this.nowType === 4) {
      //   exporturl = 'order/export/trigger_order_list';
      //   this.axiosType = '';
      // }
      // const data = {
      //   type: this.axiosType,
      //   limit: this.paginationObj.display, // 每页条数
      //   page: this.paginationObj.currentPage, // 页码
      //   contractId: this.contract,
      //   beginTime: new Date(this.start).getTime(),
      //   endTime: new Date(this.end).getTime(),
      // };
      // this.outExcela('order/export/his_order_list_saas', data, 'co').then((datas) => {
      //   // this.outFlagImport = true;
      //   if (datas.code === '0') {
      //     this.$bus.$emit('alert', { type: 'success', message: '导出成功' }); // 导出成功
      //   } else {
      //     this.$bus.$emit('alert', { type: 'error', message: datas.msg }); // 导出失败
      //   }
      // });
    },
    // 切换tab
    currentType(item) {
      if (this.nowType === item.index) { return; }
      this.contractType = '';
      setTimeout(() => {
        this.contractType = this.contractTypeList[0].code;
      }, 300);
      this.resetTime();
      this.nowType = item.index;
      this.paginationObj.currentPage = 1; // 页码
      this.paginationObj.total = 0; // 总条数
      this.tabelList = [];
      this.tabelLoading = true;
      // this.getData();
      this.getContractList();
    },
    // 切换交割类型
    sideChange(item) {
      if (this.side === item.code) { return; }
      this.side = item.code;
      this.paginationObj.currentPage = 1; // 页码
      this.paginationObj.total = 0; // 总条数
      this.tabelList = [];
      this.tabelLoading = true;
      this.getContractList();
    },
    // 切换合约类型
    contractTypeChange(item) {
      if (this.contractType === item.code) { return; }
      this.contractType = item.code;
      this.paginationObj.currentPage = 1; // 页码
      this.paginationObj.total = 0; // 总条数
      this.tabelList = [];
      this.tabelLoading = true;
      this.getContractList();
    },
    // 切换合约
    contractChange(item) {
      if (this.contract === item.code) { return; }
      this.contract = item.code;
      this.paginationObj.currentPage = 1; // 页码
      this.paginationObj.total = 0; // 总条数
      this.tabelList = [];
      this.tabelLoading = true;
      this.getData();
    },
    // 切换订单类型
    orderTypeChange(item) {
      if (this.orderType === item.code) { return; }
      this.orderType = item.code;
      this.paginationObj.currentPage = 1; // 页码
      this.paginationObj.total = 0; // 总条数
      this.tabelList = [];
      this.tabelLoading = true;
      this.getData();
    },
    // 撤销订单
    tableClick(type, v) {
      if (type === 'cancelOrder') {
        let key = 'id';
        if (this.nowType === 1) {
          key = 'orderId';
        } else if (this.nowType === 2) {
          key = 'triggerOrderId';
        }
        const obj = JSON.parse(v);
        this.revokeList.push(obj[key]);
        const isConditionOrder = this.nowType === 2;
        this.axios({
          url: 'order/order_cancel',
          hostType: 'co',
          method: 'post',
          params: {
            orderId: obj[key],
            contractId: this.contract,
            isConditionOrder,
          },
        }).then((data) => {
          const ind = this.revokeList.indexOf(obj[key]);
          this.revokeList.splice(ind, 1);
          if (data.code.toString() === '0') {
            this.$bus.$emit('tip', { text: this.$t('contract.cancel_success'), type: 'success' });
            // let sId = 0;
            // this.tabelList.forEach((item, i) => {
            //   if (item.id === id) {
            //     sId = i;
            //   }
            // });
            // this.tabelList.splice(sId, 1);
            this.getData();
          } else {
            this.$bus.$emit('tip', { text: data.msg, type: 'error' });
          }
        });
      }
      // 查看止盈止损
      if (type === 'stopOrder') {
        const obj = JSON.parse(v);
        this.stopOrderData = obj.otoOrder ? obj.otoOrder : {};
        this.isShowStopOrder = true;
      }
      if (type === 'jiancang') {
        this.isShowAdlTip = true;
      }
      if (type === 'handleForcePositionShow') {
        const obj = JSON.parse(v);
        this.handleForcePositionShow(obj.liqPositionMsg, obj.liqPositionMsgTimeStamp);
      }
    },
    // 撤销全部订单
    cancelAll() {
      if (this.tabelList.length) {
        const isConditionOrder = this.nowType === 2;
        this.axios({
          url: 'order/order_cancel',
          hostType: 'co',
          method: 'post',
          params: {
            contractId: this.contract === 'all' ? '' : this.contract,
            isConditionOrder,
            type: this.orderType === 'all' ? '' : this.orderType,
          },
        }).then((data) => {
          if (data.code.toString() === '0') {
            this.$bus.$emit('tip', { text: this.$t('contract.cancel_success'), type: 'success' });
            this.getData();
          } else {
            this.$bus.$emit('tip', { text: data.msg, type: 'error' });
          }
        });
      }
    },
    search() {
      this.paginationObj.currentPage = 1; // 页码
      this.paginationObj.total = 0; // 总条数
      this.tabelList = [];
      this.tabelLoading = true;
      this.getData();
    },
    // 选择时间
    // startTimeSelect(v, name, type) {
    //   if (name && type === 'canel') {
    //     this.startTime = null;
    //   } else {
    //     this.startTime = v;
    //     // this.start = `${this.startTime} 00:00:00`;
    //     // this.end = `${this.endTime} 23:59:59`;
    //     this.start = formatTime(this.startTime);
    //     this.end = formatTime(this.endTime + 86400000 - 1);
    //   }
    //   // this.loading = true;
    //   // this.listPage.page = 1;
    //   // this.getData();
    // },
    // endTimeSelect(v, name, type) {
    //   if (name && type === 'canel') {
    //     this.endTime = null;
    //   } else {
    //     this.endTime = v;
    //     // this.start = `${this.startTime} 00:00:00`;
    //     // this.end = `${this.endTime} 23:59:59`;
    //     this.start = formatTime(this.startTime);
    //     this.end = formatTime(this.endTime + 86400000 - 1);
    //   }
    //
    //   // this.loading = true;
    //   // this.listPage.page = 1;
    //   // this.getData();
    // },
    timeSelect(time = []) {
      [this.startTime, this.endTime] = time;
      if (this.startTime && this.endTime) {
        this.tabelLoading = true;
        this.paginationObj.currentPage = 1;
        this.start = formatTime(this.startTime);
        this.end = formatTime(this.endTime + 86400000 - 1);
        this.getData();
      }
    },
    pagechange(v) {
      this.paginationObj.currentPage = v;
      this.getData();
    },
    // 类型
    getTriggerType(val) {
      if (val === 1) {
        return this.$t('futures.order.riggerType1'); //  '止损单';
      }
      if (val === 2) {
        return this.$t('futures.order.riggerType2'); //  '止盈单';
      }
      return this.$t('futures.order.riggerType3'); //  '条件单';
    },
    close() {
      this.isShowStopOrder = false;
    },
    // 获取合约类型
    getSelectContractType() {
      const arr = [];
      if (this.contractListAll) {
        this.contractListAll.forEach((item) => {
          // usdt合约
          if (item.classification === 1 && !this.showTypeTabList1) {
            this.showTypeTabList1 = true;
            arr.push({ code: 1, value: this.$t('futures.market.text4') });
          }
          if (item.classification === 2 && !this.showTypeTabList2) {
            this.showTypeTabList2 = true;
            // 币本位合约
            arr.push({ code: 0, value: this.$t('futures.market.text5') });
          }
          if (item.classification === 3 && !this.showTypeTabList3) {
            // 混合合约
            this.showTypeTabList3 = true;
            arr.push({ code: 2, value: this.$t('futures.market.text6') });
          }
          if (item.classification === 4 && !this.showTypeTabList4) {
            this.showTypeTabList4 = true;
            // 模拟合约
            arr.push({ code: 3, value: this.$t('futures.market.text7') });
          }
        });
      }
      this.contractTypeList = arr;
    },
    // 全部取消弹窗关闭
    setCanelClose() {
      // 历史委托强制减仓弹窗
      this.forcePositionModal = false;
    },
    // 历史委托强制减仓弹窗
    handleForcePositionShow(liqPositionMsg, liqPositionMsgTimeStamp) {
      this.forcePositionText = this.replaceAll(liqPositionMsg, liqPositionMsgTimeStamp);
      this.forcePositionModal = true;
    },
    mouseenterEvent(event, text) {
      this.itempromptText = text;
      this.promptTextShow = true;
      this.$nextTick(() => {
        this.setTimeTer = setTimeout(() => {
          const element = event.target;
          const { x, y } = element.getBoundingClientRect();
          const btnWidth = element.getBoundingClientRect().width;
          const promptTextBox = this.$refs.promptTextBoxTwo;
          const { width, height } = promptTextBox.getBoundingClientRect();
          this.promptTextStylw = {
            left: `${x - width / 2 + btnWidth / 2}px`,
            top: `${y - height - 15}px`,
          };
        });
      });
    },
    mouseleaveEvent() {
      clearTimeout(this.setTimeTer);
      this.promptTextShow = false;
    },
    mouseenterEventBox() {
      // this.promptTextShow = true;
    },
    mouseleaveEventBox() {
      clearTimeout(this.setTimeTer);
      // this.promptTextShow = false;
    },
  },
  mounted() {
    setTimeout(() => {
      this.getSelectContractType();// 获取合约类型
    }, 1000);
  },
};
