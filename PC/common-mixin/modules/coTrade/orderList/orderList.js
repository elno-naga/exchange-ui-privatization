import {
  imgMap,
  colorMap,
  formatTime,
  fixD,
  nul,
  division,
  thousandsComma,
  myStorage,
  getCookie,
  getDigit,
  getIconPath,
} from '@/utils';

export default {
  name: 'orderList',
  data() {
    return {
      getIconPath,
      // 订单类型：0：持有仓位 1：当前委托 2：当日成交 3：历史委托 4: 盈亏记录 5: '成交记录'
      orderType: 0,
      imgMap,
      colorMap,
      pagination: {
        // 翻页数据
        count: 0, // 总数量
        pageSize: 10, // 每页显示条数
        page: 1, // 当前页数
      },
      // 撤销订单 防止重复点击
      cancelFla: true,
      tableLoading: false,
      cancelOrderId: null,
      timer: 15000,
      // 当前操作的合约数据（修改保证金，平仓，全仓）
      currentOrder: {},
      // 当前委托列表
      currentOrderLis: [],
      // 历史委托
      currentHistoryOrderLis: [],
      // 成交记录
      currentDealOrderLis: [],
      // 盈亏记录
      currentProfitLossOrderLis: [],
      // table使用的 数量列表
      dataList: [],
      cellHeight: 42,
      headHeight: 52,
      revokeList: [],
      // 条件单显示类别
      triggeType: 0,
      // 轮训请求订单
      getDataTimer: null,
      // 只显示当前合约开关
      isShowCurPosition: myStorage.get('isShowCurPosition'),
      // 盈亏记录只显示当前合约
      isShowCurLossList: myStorage.get('isShowCurLossList'),
      // 仓位数量
      positionListNumber: 0,
      stopOrderData: {},
      //  止盈止损弹框
      isShowStopOrder: false,
      // 全部取消弹窗
      allCancelDialog: false,
      allCanelType: '',
      // 全部取消订单loading 状态
      cancelOrderLoading: false,
      // 一键全平确认弹框
      allClosePosition: false,
      // 历史委托强制减仓类型弹窗
      forcePositionModal: false,
      // 历史委托强制减仓类型弹窗文案
      forcePositionText: null,
      // 自动减仓弹框
      isShowAdlTip: false,

      promptTextShow: false,
      itempromptText: '',
      promptTextStylw: {
        lefT: 0,
        top: '900px',
      },
    };
  },
  watch: {
    orderType(val) {
      this.dataList = [];
      clearInterval(this.getDataTimer);
      this.getDataTimer = null;
      if (val > 0) {
        this.getOrderList();
      }
      // if (val > 3) {
      //   this.cellHeight = 28;
      // } else {
      //   this.cellHeight = 56;
      // }
    },
    currentOrderLis(data) {
      if (data && data.length && this.orderType > 0 && this.orderType < 3) {
        clearInterval(this.getDataTimer);
        this.getDataTimer = null;
        this.intervalGetData();
      } else {
        clearInterval(this.getDataTimer);
        this.getDataTimer = null;
      }
    },
    coUnitType() {
      this.getOrderList();
      if (this.orderType === 1) {
        this.formatCurrentData();
      }
    },
    contractId() {
      this.getOrderList();
    },
    orderCount() {
      this.getOrderList('init');
      this.$store.dispatch('getUserConfig');
      this.getOrderList('init');
      this.getOrderList('history');
    },
    triggerOrderCount() {
      this.getOrderList();
      this.$store.dispatch('getUserConfig');
      this.getOrderList('init');
      this.getOrderList('history');
    },
    isShowCurLossList() {
      this.getOrderList();
    },
    isLogin(val) {
      if (val) {
        this.getOrderList('init');
        this.getOrderList('history');
      }
    },
    openContract(val) {
      if (val) {
        this.getOrderList('init');
        this.getOrderList('history');
      }
    },
  },
  computed: {
    OLBHeight() {
      let height = document.documentElement.clientHeight - 700;
      height = height > 500 ? 500 : height;
      return height < 255 ? 255 : height;
    },
    lan() {
      return getCookie('lan');
    },
    adlLink() {
      if (this.lan === 'zh_CN') {
        return 'https://futuresdoc.gitbook.io/help-center/v/cn/yong-xu-he-yue/untitled-1/zi-dong-jian-cang-adl';
      }
      return 'https://futuresdoc.gitbook.io/help-center/perpetual/overview/adl ';
    },
    // titleText
    titleText() {
      return this.lanText.newText18; // '止盈止损';
    },
    confirmText() {
      return this.lanText.newText19; // '知道了'
    },
    // 是否 是云合约在iframe中调用
    isIframe() {
      return this.$store.state.future.isIframe;
    },
    lanText() {
      return {
        tabType1: this.$t('futures.orderList.tabType1'), // 仓位
        tabType2: this.$t('futures.orderList.tabType2'), // 普通委托
        tabType3: this.$t('futures.orderList.tabType3'), // 条件委托
        tabType4: this.$t('futures.orderList.tabType4'), // 历史委托
        tabType5: this.$t('futures.orderList.tabType5'), // 资金流水
        subTabType1: this.$t('futures.orderList.subTabType1'), // 所有
        subTabType2: this.$t('futures.orderList.subTabType2'), // 止损单
        subTabType3: this.$t('futures.orderList.subTabType3'), // 止盈单
        a_columns_1: this.$t('futures.orderList.a_columns_1'), // 合约
        a_columns_2: this.$t('futures.orderList.a_columns_2'), // 方向
        a_columns_3: this.$t('futures.orderList.a_columns_3'), // 数量
        a_columns_4: this.$t('futures.orderList.a_columns_4'), // 完成度
        a_columns_5: this.$t('futures.orderList.a_columns_5'), // 委托价格
        a_columns_6: this.$t('futures.orderList.a_columns_6'), // 成交均价
        a_columns_7: this.$t('futures.orderList.a_columns_7'), // 类型
        a_columns_8: this.$t('futures.orderList.a_columns_8'), // 只减仓
        a_columns_9: this.$t('futures.orderList.a_columns_9'), // 时间
        a_columns_10: this.$t('futures.orderList.a_columns_10'), // 操作
        b_columns_1: this.$t('futures.orderList.b_columns_1'), // 合约
        b_columns_2: this.$t('futures.orderList.b_columns_2'), // 方向
        b_columns_3: this.$t('futures.orderList.b_columns_3'), // 触发价格
        b_columns_4: this.$t('futures.orderList.b_columns_4'), // 委托价格
        b_columns_5: this.$t('futures.orderList.b_columns_5'), // 委托数量/价值
        b_columns_6: this.$t('futures.orderList.b_columns_6'), // 类型
        b_columns_7: this.$t('futures.orderList.b_columns_7'), // 只减仓
        b_columns_8: this.$t('futures.orderList.b_columns_8'), // 提交时间
        b_columns_9: this.$t('futures.orderList.b_columns_9'), // 过期时间
        c_columns_1: this.$t('futures.orderList.c_columns_1'), // 合约
        c_columns_2: this.$t('futures.orderList.c_columns_2'), // 类型
        c_columns_3: this.$t('futures.orderList.c_columns_3'), // 方向
        c_columns_4: this.$t('futures.orderList.c_columns_4'), // 委托价格
        c_columns_5: this.$t('futures.orderList.c_columns_5'), // 委托数量/价值
        c_columns_6: this.$t('futures.orderList.c_columns_6'), // 成交数量
        c_columns_7: this.$t('futures.orderList.c_columns_7'), // 成交均价
        c_columns_8: this.$t('futures.orderList.c_columns_8'), // 盈亏
        c_columns_9: this.$t('futures.orderList.c_columns_9'), // 状态
        c_columns_10: this.$t('futures.orderList.c_columns_10'), // 时间
        c_columns_11: this.$t('futures.orderList.c_columns_11'), // 手续费
        d_columns_1: this.$t('futures.orderList.d_columns_1'), // 时间
        d_columns_2: this.$t('futures.orderList.d_columns_2'), // 类型
        d_columns_3: this.$t('futures.orderList.d_columns_3'), // 金额
        d_columns_4: this.$t('futures.orderList.d_columns_4'), // 币种
        typeStatus1: this.$t('futures.orderList.typeStatus1'), // 限价单
        typeStatus2: this.$t('futures.orderList.typeStatus2'), // 市价单
        typeStatus3: this.$t('futures.orderList.typeStatus3'), // 只做maker
        typeStatus4: this.$t('futures.orderList.typeStatus4'), // 强制减仓
        typeStatus5: this.$t('futures.orderList.typeStatus5'), // 仓位合并
        getStatus1: this.$t('futures.orderList.getStatus1'), // 新订单
        getStatus2: this.$t('futures.orderList.getStatus2'), // 完全成交
        getStatus3: this.$t('futures.orderList.getStatus3'), // 部分成交
        getStatus4: this.$t('futures.orderList.getStatus4'), // 已取消
        getStatus5: this.$t('futures.orderList.getStatus5'), // 待撤销
        getStatus6: this.$t('futures.orderList.getStatus6'), // 异常订单
        getStatus7: this.$t('futures.orderList.getStatus7'), // 部分成交已撤销
        sideT1: this.$t('futures.orderList.sideT1'), // 开
        sideT2: this.$t('futures.orderList.sideT2'), // 平
        sideT3: this.$t('futures.orderList.sideT3'), // 空
        sideT4: this.$t('futures.orderList.sideT4'), // 多
        mPrice: this.$t('futures.orderList.mPrice'), // 市价
        isclose1: this.$t('futures.orderList.isclose1'), // 是
        isclose2: this.$t('futures.orderList.isclose2'), // 否
        cancel: this.$t('futures.orderList.cancel'), // 取消
        allCancel: this.$t('futures.orderList.allCancel'), // 全部取消
        tstext1: this.$t('futures.orderList.tstext1'), // 请
        tstext2: this.$t('futures.orderList.tstext2'), // 登录/注册
        tstext3: this.$t('futures.orderList.tstext3'), // 再进行操作
        text14: this.$t('futures.positionLis.text14'),
        text15: this.$t('futures.positionLis.text15'),
        newText17: this.$t('futures.orderList.newText17'), // 條件單
        newText18: this.$t('futures.orderList.newText18'), // 止盈止损"
        newText19: this.$t('futures.orderList.newText19'), // 知道了"
        newText20: this.$t('futures.orderList.newText20'), // 订单类型"
        newText21: this.$t('futures.orderList.newText21'), // 查看"
        newText22: this.$t('futures.orderList.newText22'), // 止盈"
        newText23: this.$t('futures.orderList.newText23'), // 已生效"
        newText24: this.$t('futures.orderList.newText24'), // 未生效"
        newText25: this.$t('futures.orderList.newText25'), // 止盈触发价"
        newText26: this.$t('futures.orderList.newText26'), // 委托价"
        newText27: this.$t('futures.orderList.newText27'), // 止损"
        newText28: this.$t('futures.orderList.newText28'), // 止损触发价
        deliveryTextq1: this.$t('futures.orderList.deliveryTextq1'), // 系统撤销
        deliveryTextq2: this.$t('futures.orderList.deliveryTextq2'), // 系统平仓
        deliveryTextq3: this.$t('futures.orderList.deliveryTextq3'), // 系统交割
      };
    },
    // tab 项
    tabTypeItem() {
      return [
        // 持仓
        {
          text: this.isLogin
            ? `${this.lanText.tabType1} (${this.positionListNumber})`
            : this.lanText.tabType1,
          id: 0,
        },
        {
          text: this.isLogin
            ? `${this.lanText.tabType2} (${this.orderCount})`
            : this.lanText.tabType2, // '普通委托'
          id: 1,
        },
        {
          text: this.isLogin
            ? `${this.lanText.tabType3} (${this.triggerOrderCount})`
            : this.lanText.tabType3, // '条件委托'
          id: 2,
        },
        {
          text: this.lanText.tabType4, // '历史委托'
          id: 3,
        },
        {
          text: this.$t('futures.orderList.newText1'), // '盈亏记录',
          id: 4,
        },
        {
          text: this.$t('futures.orderList.newText2'), // '成交记录',
          id: 5,
        },
        // this.lanText.tabType5, // '资金流水'
      ];
    },
    // 条件单（筛选项）
    subTabTypeItem() {
      return [
        this.lanText.subTabType1, // '所有',
        this.lanText.subTabType2, // '止损单',
        this.lanText.subTabType3, // '止盈单',
      ];
    },
    // 合约列表 MAP
    contractListMap() {
      return this.$store.state.future.contractListMap;
    },
    // 当前合约ID
    contractId() {
      return this.$store.state.future.contractId;
    },
    // 仓位数量
    // positionListNumber() {
    //   if (this.$store.state.future.positionListNumber) {
    //     return this.$store.state.future.positionListNumber;
    //   }
    //   return '0';
    // },
    // 当前合约信息
    contractInfo() {
      return this.$store.state.future.contractInfo;
    },
    // 当前合约方向（1正向、0反向）
    contractSide() {
      if (this.contractInfo) {
        return this.contractInfo.contractSide;
      }
      return 1;
    },
    // 当前合约保证金币种
    marginCoin() {
      if (this.contractInfo) {
        return this.contractInfo.marginCoin;
      }
      return '';
    },
    // 当前合约币种精度
    coinfix() {
      return this.$store.state.future.coinfix;
    },
    // 当前合约价格精度
    pricefix() {
      return this.$store.state.future.pricefix;
    },
    // 当前合约保证金币种精度
    marginCoinFix() {
      if (this.contractInfo && this.contractInfo.coinResultVo) {
        return this.contractInfo.coinResultVo.marginCoinPrecision;
      }
      return 4;
    },
    // 数量单位类型Number(1标的货币 2张)
    coUnitType() {
      return this.$store.state.future.coUnitType;
    },
    // 当前合约面值
    multiplier() {
      return Number(this.$store.state.future.multiplier) || 1;
    },
    // 当前合约数量精度
    volfix() {
      if (this.coUnitType === 1) {
        return this.$store.state.future.volfix;
      }
      return 0;
    },
    // 当前合约数量单位
    volUnit() {
      return this.$store.state.future.coUnit;
    },
    // 当前合约价格单位
    priceUnit() {
      return this.$store.state.future.priceUnit;
    },
    // 当前普通单委托数量
    orderCount() {
      return this.$store.state.future.orderCount;
    },
    // 当前条件单委托数量
    triggerOrderCount() {
      return this.$store.state.future.triggerOrderCount;
    },
    // 表头
    columns() {
      // 当前委托
      if (this.orderType === 1) {
        return [
          {
            title: this.lanText.a_columns_1, // 合约
            classes: 'symbol',
            styleClass: 'symbol-name',
            key: 'name',
          },
          {
            title: this.lanText.a_columns_2, // 方向
            key: 'side',
          },
          {
            title: `${this.lanText.a_columns_3}`, // 数量
            key: 'number',
          },
          {
            title: this.lanText.a_columns_4, // 完成度
            key: 'makeRate',
          },
          {
            title: this.lanText.a_columns_5, // 委托价格
            key: 'price',
          },
          {
            title: this.lanText.a_columns_6, // 成交均价
            key: 'avgPrice',
          },
          {
            title: this.lanText.a_columns_7, // 类型
            key: 'type',
          },
          {
            title: this.lanText.a_columns_8, // 只减仓
            key: 'isclose',
          },
          {
            title: this.lanText.newText18, // '止盈止损',
            key: 'otoOrder',
          },
          {
            title: this.lanText.a_columns_9, // 时间
            key: 'time',
            width: '100px',
          },
          {
            title: this.lanText.a_columns_10, // 操作
            classes: 'opera',
            styleClass: 'opera-btn',
            key: 'operation',
          },
        ];
      }
      // 条件委托
      if (this.orderType === 2) {
        return [
          {
            title: this.lanText.b_columns_1, // 合约
            key: 'name',
          },
          {
            title: this.lanText.b_columns_6, // 类型,
            key: 'type',
            selectOPtion: [
              {
                text: this.lanText.subTabType1,
                id: 0,
              },
              {
                text: this.lanText.subTabType2,
                id: 1,
              },
              {
                text: this.lanText.subTabType3,
                id: 2,
              },
            ],
          },
          {
            title: this.lanText.b_columns_2, // 方向
            key: 'side',
          },
          {
            title: this.lanText.b_columns_3, // 触发价格
            key: 'triggerPrice',
          },
          {
            title: this.lanText.b_columns_4, // 委托价格
            key: 'price',
          },
          {
            title: this.lanText.b_columns_5, // 委托数量/价值
            key: 'volume',
          },
          {
            title: this.lanText.newText20, // '订单类型', // 类型
            key: 'orderType',
          },
          {
            title: this.lanText.b_columns_7, // 只减仓
            key: 'isclose',
          },
          {
            title: this.lanText.b_columns_8, // 提交时间
            key: 'time',
            width: '100px',
          },
          {
            title: this.lanText.b_columns_9, // 过期时间
            key: 'expireTime',
            width: '100px',
          },
          {
            title: this.lanText.a_columns_10, // 操作
            classes: 'opera',
            key: 'operation',
          },
        ];
      }
      // 历史委托
      if (this.orderType === 3) {
        return [
          {
            title: this.lanText.c_columns_1, // 合约
            key: 'name',
          },
          {
            title: this.lanText.c_columns_2, // 类型
            key: 'historyType',
            width: '110px',
          },
          {
            title: this.lanText.c_columns_3, // 方向
            key: 'side',
          },
          {
            title: this.lanText.c_columns_4, // 委托价格
            key: 'price',
          },
          {
            title: this.lanText.c_columns_5, // 委托数量/价值
            key: 'volume',
          },
          {
            title: `${this.lanText.c_columns_6}`, // 成交数量
            key: 'dealVolume',
          },
          {
            title: this.lanText.c_columns_7, // 成交均价
            key: 'avgPrice',
          },
          {
            title: this.lanText.c_columns_8, // 盈亏
            key: 'realizedAmount',
          },
          {
            title: `${this.lanText.c_columns_11}`, // 手续费  // (${this.marginCoin})
            key: 'tradeFee',
          },
          {
            title: this.lanText.newText18, // '止盈止损',
            key: 'otoOrder',
          },
          {
            title: this.lanText.c_columns_9, // 状态
            key: 'statusMemo',
          },
          {
            title: this.lanText.c_columns_10, // 时间
            key: 'time',
          },
        ];
      }
      // 盈亏记录
      if (this.orderType === 4) {
        return [
          {
            title: this.lanText.c_columns_1, // 合约
            width: '200px',
            key: 'nameLevel',
          },
          {
            title: this.$t('futures.orderList.newText3'), // '开仓均价',
            classes: 'left-text',
            key: 'openPrice',
          },
          {
            title: `${this.$t('futures.orderList.newText5')}`, // 仓位数量
            key: 'volume',
          },
          {
            title: this.$t('futures.orderList.newText6'), // '已实现盈亏',
            promptText: this.$t('futures.orderList.newText7'), // '总盈亏为该仓位持仓期间累计发生的总盈亏，总盈亏 = 手续费+资金费用+仓位盈亏',
            key: 'realizedAmount',
          },
          {
            title: `${this.lanText.c_columns_11}`, // 手续费
            promptText: this.$t('futures.orderList.newText8'), // '开仓、平仓累计总手续费',
            key: 'tradeFee',
          },
          {
            title: this.$t('futures.orderList.newText9'), // '资金费用',
            promptText: this.$t('futures.orderList.newText10'), // '持仓期间的总资金费用',
            key: 'capitalFee',
          },
          {
            title: this.$t('futures.orderList.newText15'), // '仓位盈亏',
            promptText: this.$t('futures.orderList.newText11'), // '仓位盈亏为仓位每次平仓的仓位盈亏之和，平仓盈亏根据 平仓前的持仓均价和平仓均价计算得出',
            key: 'closeProfit',
          },
          // {
          //   title: this.$t('futures.orderList.newText12'), // '分摊',
          //   key: 'shareAmount',
          // },
          {
            title: this.$t('futures.orderList.newText13'), // '平仓时间',
            key: 'time',
          },
        ];
      }
      // 成交记录
      return [
        {
          title: this.lanText.c_columns_1, // 合约
          key: 'name',
        },
        {
          title: this.lanText.a_columns_6, // 成交均价
          classes: 'left-text',
          key: 'price',
        },
        {
          title: this.lanText.c_columns_3, // 方向
          key: 'side',
        },
        {
          title: `${this.lanText.c_columns_6}`, // 成交数量
          key: 'volume',
        },
        {
          title: this.$t('futures.orderList.newText14'), // '角色',
          key: 'role',
        },
        {
          title: `${this.lanText.c_columns_11}`, // 手续费
          key: 'fee',
        },
        {
          title: this.lanText.c_columns_10, // 时间
          width: '100px',
          key: 'time',
        },
      ];
    },
    // 是否Login
    isLogin() {
      return this.$store.state.baseData.isLogin;
    },
    // 是否开通了合约交易
    openContract() {
      return this.$store.state.future.openContract;
    },
    bodyClasses() {
      return `bodyContent${this.orderType}`;
    },
    memoText() {
      return {
        1: this.$t('futures.orderList.memoText1'),
        2: this.$t('futures.orderList.memoText2'),
        3: this.$t('futures.orderList.memoText3'),
        4: this.$t('futures.orderList.memoText4'),
        5: this.$t('futures.orderList.memoText5'),
        6: this.$t('futures.orderList.memoText6'),
        7: this.$t('futures.orderList.memoText7'),
        8: this.$t('futures.orderList.memoText8'),
        11: this.lanText.deliveryTextq1, // '系统撤销',
        12: this.$t('futures.orderList.adlText4'), // '自动减仓',
      };
    },
  },
  methods: {
    init() {
      if (myStorage.get('isShowCurPosition') === undefined) {
        this.isShowCurPosition = true;
      }
      if (myStorage.get('isShowCurLossList') === undefined) {
        this.isShowCurLossList = false;
      }

      this.$bus.$off('CRAET-ORDER-SUCCESS');
      // 监听下单成功 重新请求订单
      this.$bus.$on('CRAET-ORDER-SUCCESS', () => {
        this.getOrderList('init');
        this.getOrderList();
        this.getOrderList('history');
        if (
          this.isLogin
          && typeof this.openContract === 'boolean'
          && this.openContract
        ) {
          this.$store.dispatch('getUserOrderCount');
        }
      });
      this.$bus.$on('positionListNumber', (data) => {
        this.positionListNumber = data;
      });
      setTimeout(() => {
        this.getOrderList('init');
      }, 500);
      this.$bus.$on('cancelCurrentOrder', (data) => {
        this.elementClick('cancelOrder', data);
      });
    },
    // 切换订单类型
    switchType(obj) {
      const index = typeof obj === 'object' ? obj.id : obj;
      if (this.orderType !== index) {
        this.orderType = index;
        if (this.isLogin && this.openContract) {
          this.tableLoading = true;
        }
      }
    },
    subSwitchType(index) {
      if (this.triggeType !== index) {
        this.triggeType = index;
        this.formatTrigData();
      }
    },
    // 订单类型
    typeStatus(status) {
      let str = '';
      switch (status) {
        case 1:
          str = this.lanText.typeStatus1; // '限价单';
          break;
        case 2:
          str = this.lanText.typeStatus2; // '市价单';
          break;
        case 3:
          str = 'IOC'; // 'IOC';
          break;
        case 4:
          str = 'FOK'; // 'FOK';
          break;
        case 5:
          str = this.lanText.typeStatus3; // '只做maker';
          break;
        case 6:
          str = this.lanText.typeStatus4; // '强制减仓';
          break;
        case 7:
          str = this.lanText.typeStatus5; // '仓位合并';
          break;
        case 9:
          str = this.lanText.deliveryTextq2; // '系统平仓';
          break;
        case 10:
          str = this.lanText.deliveryTextq3; // '系统交割';
          break;
        case 11:
          str = this.$t('futures.orderList.adlText1'); // '自动减仓'
          break;
        default:
          str = '';
      }
      return str;
    },
    // 订单状态
    getStatus(status) {
      let str = '';
      switch (status) {
        case 0:
          str = this.lanText.getStatus1; // 新订单
          break;
        case 1:
          str = this.lanText.getStatus1; // 新订单
          break;
        case 2:
          str = this.lanText.getStatus2; // 完全成交
          break;
        case 3:
          str = this.lanText.getStatus3; // 部分成交
          break;
        case 4:
          str = this.lanText.getStatus4; // 已取消
          break;
        case 5:
          str = this.lanText.getStatus5; // 待撤销
          break;
        case 6:
          str = this.lanText.getStatus6; // 异常订单
          break;
        case 7:
          str = this.lanText.getStatus7; // 部分成交已撤销
          break;
        default:
          str = '';
      }
      return str;
    },
    // 订单数量
    setVolume(volume, multiplier) {
      if (this.coUnitType === 1) {
        let multiplierVal = this.multiplier;
        // let volfixval = this.volfix;
        let volfixval = getDigit(multiplier);// 获取每个合约的合约面值数量精度
        if (multiplier) {
          multiplierVal = multiplier;
          const strArr = multiplier.toString().split('.');
          volfixval = strArr.length > 1 ? strArr[1].length : 0;
        }
        return fixD(nul(volume, multiplierVal), volfixval);
      }
      return this.thousandsComma(volume);
    },
    // 完成度
    makeRate(dealVolume, volume) {
      if (dealVolume && volume) {
        // 已完成数量 / 委托数量
        const value = nul(division(dealVolume, volume), 100);
        return fixD(value, 2);
      }
      return 0.0;
    },
    // 返回订单方向
    setSide(data) {
      let classes = 'rise-1-cl';
      // 开 ：平
      const open = data.open === 'OPEN' ? this.lanText.sideT1 : this.lanText.sideT2;
      // 空
      let side = this.lanText.sideT3;
      if (
        (data.open === 'OPEN' && data.side === 'BUY')
        || (data.open === 'CLOSE' && data.side === 'SELL')
      ) {
        // 多
        side = this.lanText.sideT4;
      }
      if (data.side === 'SELL') {
        classes = 'fall-1-cl';
      }
      return {
        text: `${open}${side}`,
        classes,
      };
    },
    // 返回合约名称
    setContractName(data) {
      // 合约新名称-普通委托
      const acriveData = this.contractListMap[data.contractName];
      let name = '';
      if (acriveData) {
        if (data) {
          const nameText = acriveData.contractOtherName ? acriveData.contractOtherName : '';
          name = `${nameText}`;
        }
      }
      return name;
    },
    // 根据 合约ID 返回合约名称
    setContractIDName(id) {
      /* eslint-disable */
      // 合约新名称-普通委托
      let acriveData = '';
      for (const key in this.contractListMap) {
        if (this.contractListMap[key] && this.contractListMap[key].id === id) {
          acriveData = this.contractListMap[key];
        }
      }
      const name = acriveData.contractOtherName ? acriveData.contractOtherName : '';
      return name;
      /* eslint-enable */
    },
    // 请求订单数据
    getOrderList(type) {
      /* eslint-disable */
      if (!this.isLogin || !this.openContract) return;
      let paramsData = {
        contractId: this.contractId,
      };
      setTimeout(() => {
        // 加延时解决刷新跳出登录问题
        // 请求数量
        if (
          this.isLogin
          && typeof this.openContract === 'boolean'
          && this.openContract
        ) {
          // this.$store.dispatch('getUserOrderCount');
        }
      }, 500);
      // 当前委托
      let url = this.$store.state.url.futures.currentOrderList;
      // 条件委托
      if (this.orderType === 2) {
        url = this.$store.state.url.futures.triggerOrderList;
      }
      // 盈亏记录
      if (this.orderType === 4) {
        url = this.$store.state.url.futures.historyPositionList;
        // if (!this.isShowCurLossList) {
        //   paramsData = {};
        // }
      }
      // 成交记录
      if (this.orderType === 5) {
        url = this.$store.state.url.futures.getTradeInfo;
      }
      // 当前委托
      if (type === 'init') {
        url = this.$store.state.url.futures.currentOrderList;
        paramsData = {
          contractId: this.contractId,
        };
      }
      // 历史委托
      if (type === 'history') {
        url = this.$store.state.url.futures.historyOrderList;
      }
      if ((this.orderType === 3 || type === 'history') && type !== 'init') {
        // 解决当前委托显示历史委托数据问题
        this.axios({
          url: this.$store.state.url.futures.historyOrderList,
          method: 'post',
          hostType: 'co',
          params: paramsData,
        }).then((rs) => {
          this.tableLoading = false;
          if (rs.code === '0' && rs.data) {
            if (this.orderType === 3 || type === 'history') {
              this.currentHistoryOrderLis = rs.data.orderList;
              this.formatHistoryData();
            }
          }
        });
        // 为了在K 线上展示不一样的数据 加了isKline 字段， 返回的数据还没有标识识别，只能在下面另外写一个
        this.axios({
          url: this.$store.state.url.futures.historyOrderList,
          method: 'post',
          hostType: 'co',
          params: {
            contractId: this.contractId,
            isKline: 1,
          },
        }).then((rs) => {
          this.tableLoading = false;
          if (rs.code === '0' && rs.data) {
            if (this.orderType === 3 || type === 'history') {
              const currentHistoryOrderLis = rs.data.orderList;
              this.$store.commit('CURRENT_HISTORY_OTDER', currentHistoryOrderLis);
            }
          }
        });
      }
      else {
        this.axios({
          url,
          method: 'post',
          hostType: 'co',
          params: paramsData,
        }).then((rs) => {
          this.tableLoading = false;
          if (rs.code === '0' && rs.data) {
            // 当前委托
            if (this.orderType === 1 || type === 'init') {
              this.currentOrderLis = rs.data.orderList;
              // 将当前委托存储在vuex
              this.$store.commit('CURRENT_OTDER_LIST', this.currentOrderLis);
              this.formatCurrentData();
            }
            // 条件委托
            else if (this.orderType === 2) {
              this.currentOrderLis = rs.data.trigOrderList;
              this.formatTrigData();
            }
            // 盈亏记录
            else if (this.orderType === 4) {
              this.currentProfitLossOrderLis = rs.data.positionList;
              this.formatTransData();
            }
            // 成交记录
            else if (this.orderType === 5) {
              this.currentDealOrderLis = rs.data.tradeList;
              this.formatTradeInfo();
            }
          }
        });
      }
      /* eslint-enable */
    },
    // 格式化当前委托订单数据
    formatCurrentData() {
      const list = [];
      if (this.currentOrderLis && this.currentOrderLis.length) {
        this.currentOrderLis.forEach((item) => {
          let price = null;
          if (item.type === 2 && Number(item.price) === 0) {
            price = this.lanText.mPrice; // '市价';
          } else {
            price = this.thousandsComma(fixD(item.price, item.pricePrecision));
          }
          let volumeUnit = null; // 委托数量单位
          if (this.coUnitType === 1) {
            if (item.contractSide === 0) {
              // 币本位反向合约
              volumeUnit = item.quote;
            } else {
              volumeUnit = item.base;
            }
          } else {
            // zhang
            volumeUnit = this.volUnit;
          }
          list.push({
            // id: JSON.stringify(item),
            // classes: 'text-1-cl',
            // data: [
            id: JSON.stringify(item),
            // 合约
            name: this.setContractName(item),
            // 方向
            side: this.setSide(item),
            // 成交数量 / 委托数量
            number: `${this.setVolume(item.dealVolume, item.multiplier)} / ${this.setVolume(
              item.volume, item.multiplier,
            )} ${volumeUnit}`,
            // '完成度',
            makeRate: `${this.makeRate(item.dealVolume, item.volume)}%`,
            // 委托价格
            price,
            // 成交均价
            avgPrice: item.avgPrice ? this.thousandsComma(fixD(item.avgPrice, item.pricePrecision)) : '--',
            // 类型
            type: this.typeStatus(item.type),
            // 只减仓  '是' : '否'
            isclose: item.open === 'CLOSE'
              ? this.lanText.isclose1
              : this.lanText.isclose2,
            // 止盈止损
            otoOrder: item.otoOrder,
            // 时间
            time: formatTime(item.ctime),
            // 操作
            operation: {
              text: this.lanText.cancel,
              eventType: 'cancelOrder',
            }, // 取消
          });
        });
      }
      if (this.orderType === 1) {
        if (list.length > 100) {
          this.dataList = list.slice(0, 100);
        } else {
          this.dataList = list;
        }
      }
    },
    // 格式化条件委托订单数据
    formatTrigData() {
      const list = [];
      if (this.currentOrderLis && this.currentOrderLis.length) {
        this.currentOrderLis.forEach((item) => {
          if (this.triggeType && this.triggeType !== item.triggerType) return;
          let price = null;
          let volume = null;
          if (item.type === 2 && Number(item.price) === 0) {
            price = this.lanText.mPrice; // '市价';
            // 价值
            if (item.open === 'OPEN') {
              // 反向
              let unit = this.contractInfo ? this.contractInfo.base : '';
              const { minOrderMoneyFix } = this.$store.state.future;
              const coinFix = minOrderMoneyFix;
              // 正向
              if (this.contractSide === 1) {
                unit = this.priceUnit;
              }
              volume = `${fixD(item.volume, coinFix)} ${unit}`;
            } else {
              // 委托数量 (coUnitType 2 zhang)
              if (this.coUnitType === 2) {
                volume = `${this.setVolume(item.volume)} ${this.volUnit}`;
              } else if (item.contractSide === 0) {
                // 币本位反向合约
                volume = `${this.setVolume(item.volume, item.multiplier)} ${item.quote}`;
              } else {
                volume = `${this.setVolume(item.volume, item.multiplier)} ${item.base}`;
              }
            }
          } else {
            price = this.thousandsComma(fixD(item.price, item.pricePrecision));
            // 委托数量 (coUnitType 2 zhang)
            if (this.coUnitType === 2) {
              volume = `${this.setVolume(item.volume)} ${this.volUnit}`;
            } else if (item.contractSide === 0) {
              // 币本位反向合约
              volume = `${this.setVolume(item.volume, item.multiplier)} ${item.quote}`;
            } else {
              volume = `${this.setVolume(item.volume, item.multiplier)} ${item.base}`;
            }
          }
          list.push({
            // id: JSON.stringify(item),
            // classes: 'text-1-cl',
            // data: [
            id: JSON.stringify(item),
            // 合约
            name: this.setContractName(item),
            // 类型
            type: this.getTriggerType(item.triggerType),
            // 方向
            side: this.setSide(item),
            // 触发价格
            triggerPrice: this.thousandsComma(fixD(item.triggerPrice, item.pricePrecision)),
            // 委托价格
            price,
            // 委托数量/价值
            volume,
            // 类型
            orderType: this.typeStatus(item.timeInForce),
            // 只减仓
            // '是' : '否',
            isclose: item.open === 'CLOSE'
              ? this.lanText.isclose1
              : this.lanText.isclose2,
            // 提交时间
            time: formatTime(item.mtime),
            // 过期时间
            expireTime: formatTime(item.expireTime),
            // 操作 撤单
            operation: {
              text: this.lanText.cancel,
              eventType: 'cancelOrder',
            },
          });
        });
      }
      if (this.orderType === 2) {
        if (list.length > 100) {
          this.dataList = list.slice(0, 100);
        } else {
          this.dataList = list;
        }
      }
    },
    // 格式化 历史委托 订单数据
    formatHistoryData() {
      const list = [];
      if (this.currentHistoryOrderLis && this.currentHistoryOrderLis.length) {
        this.currentHistoryOrderLis.forEach((item, index) => {
          let price = null;
          let volume = null;
          if (item.type === 2 && Number(item.price) === 0) {
            price = this.lanText.mPrice; // '市价';
            // 价值
            if (item.open === 'OPEN') {
              // 反向
              let unit = this.contractInfo ? this.contractInfo.base : '';
              const { minOrderMoneyFix } = this.$store.state.future;
              const coinFix = minOrderMoneyFix;
              // 正向
              if (this.contractSide === 1) {
                unit = this.priceUnit;
              }
              volume = `${fixD(item.volume, coinFix)} ${unit}`;
            } else {
              // 委托数量 (coUnitType 2 zhang)
              if (this.coUnitType === 2) {
                volume = `${this.setVolume(item.volume)} ${this.volUnit}`;
              } else if (item.contractSide === 0) {
                // 币本位反向合约
                volume = `${this.setVolume(item.volume, item.multiplier)} ${item.quote}`;
              } else {
                volume = `${this.setVolume(item.volume, item.multiplier)} ${item.base}`;
              }
            }
          } else {
            price = this.thousandsComma(fixD(item.price, item.pricePrecision));
            // 委托数量 (coUnitType 2 zhang)
            if (this.coUnitType === 2) {
              volume = `${this.setVolume(item.volume)} ${this.volUnit}`;
            } else if (item.contractSide === 0) {
              // 币本位反向合约
              volume = `${this.setVolume(item.volume, item.multiplier)} ${item.quote}`;
            } else {
              volume = `${this.setVolume(item.volume, item.multiplier)} ${item.base}`;
            }
          }
          // 成交数量单位
          let dealVolumeUnit;
          if (this.coUnitType === 2) {
            // zhang
            dealVolumeUnit = this.volUnit;
          } else if (item.contractSide === 0) {
            // 币本位反向合约
            dealVolumeUnit = item.quote;
          } else {
            dealVolumeUnit = item.base;
          }
          const cancelCauseClass = index > 3 ? 'position-bottom' : '';
          list.push({
            id: JSON.stringify(item),
            // 合约
            name: this.setContractName(item),
            // 类型
            liqPositionMsg: item.liqPositionMsg,
            liqPositionMsgTimeStamp: item.liqPositionMsgTimeStamp,
            // historyType: this.typeStatus(item.type),
            historyType: {
              type: `${item.type}`,
              text: this.typeStatus(item.type),
            },
            placementSide: index > 1 ? 'top' : 'bottom',
            // 方向
            side: this.setSide(item),
            // 强平价格
            forcedPrice: fixD(item.forcedPrice, item.pricePrecision),
            // 委托价格
            type: item.type,
            price: item.type === 6 ? this.thousandsComma(fixD(item.takeOverPrice, item.pricePrecision)) : price,
            // 委托数量/价值
            volume,
            // 成交数量
            dealVolume: this.coUnitType === 2 ? `${this.setVolume(item.dealVolume)} ${this.volUnit}` : `${this.setVolume(item.dealVolume, item.multiplier)} ${dealVolumeUnit}`,
            // 成交均价
            avgPrice: item.type === 6
              ? this.thousandsComma(fixD(item.takeOverPrice, item.pricePrecision))
              : this.thousandsComma(fixD(item.avgPrice, item.pricePrecision)),
            // 盈亏

            realizedAmount: {
              text: `${fixD(item.realizedAmount, this.marginCoinFix)} ${item.marginCoin
              }`,
              classes: this.setClsdsd(item.realizedAmount),
            },
            // 手续费
            tradeFee: `${fixD(item.tradeFee, this.marginCoinFix)} ${item.marginCoin}`,
            // 只减仓
            // item.open === 'CLOSE' ? '是' : '否',
            // 止盈止损
            otoOrder: item.otoOrder,
            // 状态
            memo: item.memo,
            statusMemo: item.status,
            cancelCauseClass,
            // 提交时间
            time: formatTime(item.ctime),
          });
        });
      }
      if (this.orderType === 3) {
        this.dataList = list;
        this.tableLoading = false;
      }
    },
    // 格式化盈亏记录数据
    formatTransData() {
      const list = [];
      if (this.currentProfitLossOrderLis && this.currentProfitLossOrderLis.length) {
        this.currentProfitLossOrderLis.forEach((item) => {
          // 杠杆
          const level = `${item.leverageLevel}X`;
          // 类型
          const sideBgclass = item.side === 'BUY' ? 'rise-1-bg' : 'fall-1-bg';
          //
          const sideClclass = item.side === 'BUY' ? 'rise-1-cl' : 'fall-1-cl';
          // 合约名称
          const name = item.contractOtherName;
          // 类型  '逐仓' : '全仓';
          const type = item.positionType === 2 ? this.lanText.text15 : this.lanText.text14;
          let volUint = this.volUnit;
          if (this.orderType === 1) {
            volUint = item.base;
          }

          // 仓位数量单位
          let volumeUnit;
          if (this.coUnitType === 1) {
            if (item.contractSide === 0) {
              volumeUnit = item.quote;
            } else {
              volumeUnit = item.base;
            }
          }
          list.push({
            id: JSON.stringify(item),
            nameLevel: {
              name,
              type,
              level,
              sideBgclass,
              sideClclass,
              classes: this.amountClass(item.amount),
            },
            // 开仓均价
            openPrice: fixD(item.openPrice, item.pricePrecision),
            // 仓位数量
            volume: `${this.setVolume(item.volume, item.multiplier)} ${this.coUnitType === 2 ? volUint : volumeUnit}`,
            // 已实现盈亏
            realizedAmount: {
              text: this.fixDSign(item.historyRealizedAmount, item.marginCoinPrecision),
              classes: this.setClsdsd(item.realizedAmount),
            },
            // 手续费
            tradeFee: `${this.fixDSign(item.tradeFee, item.marginCoinPrecision)} ${item.marginCoin}`,
            // 资金费用
            capitalFee: this.fixDSign(item.capitalFee, item.marginCoinPrecision),
            // 仓位盈亏
            closeProfit: this.fixDSign(item.closeProfit, item.marginCoinPrecision),
            // 分摊金额
            // shareAmount: this.fixDSign(item.shareAmount, item.marginCoinPrecision),
            // 平仓时间
            time: formatTime(item.mtime),
          });
        });
      }
      if (this.orderType === 4) {
        this.dataList = list;
      }
    },
    // 格式化成交记录数据
    formatTradeInfo() {
      const list = [];
      if (this.currentDealOrderLis && this.currentDealOrderLis.length) {
        this.currentDealOrderLis.forEach((item) => {
          // 成交数量单位
          let volumeUnit;
          if (this.coUnitType === 1) {
            if (item.contractSide === 0) {
              // 币本位反向合约
              volumeUnit = item.quote;
            } else {
              volumeUnit = item.base;
            }
          }
          list.push({
            id: JSON.stringify(item),
            // 合约
            name: this.setContractName(item),
            // 成交均价
            price: fixD(item.price, this.pricefix),
            // 方向
            side: this.setSide(item),
            // 成交数量
            volume: `${this.setVolume(item.volume, item.multiplier)} ${this.coUnitType === 2 ? this.volUnit : volumeUnit}`,
            // 角色
            role: item.role,
            // 手续费
            fee: `${fixD(item.fee, item.feeCoinPrecision)} ${item.feeCoin}`,
            // 时间
            time: formatTime(item.ctime),
          });
        });
      }
      if (this.orderType === 5) {
        this.dataList = list;
      }
    },
    // 获取当前订单的止盈止损数据
    // getotoOrderData(id) {
    //   if (this.currentOrderLis && this.currentOrderLis.length) {
    //     this.currentOrderLis.forEach((item) => {
    //     })
    //   }
    // },
    // 类型
    getTriggerType(val) {
      if (val === 1) {
        return this.lanText.subTabType2; // '止损单'
      }
      if (val === 2) {
        return this.lanText.subTabType3; //  '止盈单'
      }
      return this.lanText.newText17; // '条件单'
    },
    replaceAll(str, timeStamp) {
      const reg = /([0-9]{3}[1-9]|[0-9]{2}[1-9][0-9]{1}|[0-9]{1}[1-9][0-9]{2}|[1-9][0-9]{3})-(((0[13578]|1[02])-(0[1-9]|[12][0-9]|3[01]))|((0[469]|11)-(0[1-9]|[12][0-9]|30))|(02-(0[1-9]|[1][0-9]|2[0-8])))([ ])([0-1]?[0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])/g;
      const result = str.match(reg);
      let text = str;
      if (result && timeStamp) {
        const date = formatTime(timeStamp);
        text = text.replace(result[0], date);
      }
      return `${text}`;
    },
    setClsdsd(val) {
      if (val === 0) {
        return '';
      }
      return val < 0 ? 'fall-1-cl' : 'rise-1-cl';
    },
    // 设置精度 + 符号
    fixDSign(value, fix) {
      if (value && fix.toString()) {
        if (Number(value) > 0) {
          return `+${fixD(value, fix)}`;
        }
        return fixD(value, fix);
      }
      return '0.00';
    },
    amountClass(value) {
      if (value) {
        if (Number(value) > 0) {
          return 'rise-1-cl';
        }
        if (Number(value) < 0) {
          return 'fall-1-cl';
        }
      }
      return '';
    },
    // 表格操作按钮点击事件
    elementClick(type, v) {
      if (type === 'cancelOrderAll') {
        this.allCancelDialog = true;
        this.allCanelType = 'cancelOrderAll';
      }
      if (type === 'cancelOrder') {
        const obj = JSON.parse(v);
        this.revokeList.push(obj.id);
        this.cancelOrderLoading = true;
        let orderId;
        if (this.orderType === 1) {
          orderId = obj.orderId;
        } else if (this.orderType === 2) {
          orderId = obj.triggerOrderId;
        }
        setTimeout(() => {
          this.axios({
            url: this.$store.state.url.futures.orderCancel,
            hostType: 'co',
            method: 'post',
            params: {
              contractId: obj.contractId,
              orderId,
              isConditionOrder: this.orderType === 2,
            },
          }).then((data) => {
            this.setCanelClose();
            const ind = this.revokeList.indexOf(obj.id);
            this.revokeList.splice(ind, 1);
            if (data.code.toString() === '0') {
              this.$store.dispatch('getPositionList');
              this.$store.dispatch('getUserConfig');
              setTimeout(() => {
                this.$store.dispatch('getUserConfig');
              }, 1000);
              this.$bus.$emit('tip', { text: data.msg, type: 'success' });
              this.getOrderList();
              this.getOrderList('history');
            } else {
              this.$bus.$emit('tip', { text: data.msg, type: 'error' });
            }
            this.cancelOrderLoading = false;
          });
        }, 500);
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
    // 取消委托
    cancelOrder() { },
    goPage(path) {
      if (path === 'login' && this.isIframe) {
        window.parent.postMessage('login', '*');
      } else {
        this.$router.push(`/${path}`);
      }
    },
    // 轮训请求订单数据
    intervalGetData() {
      clearInterval(this.getDataTimer);
      this.getDataTimer = setInterval(() => {
        this.getOrderList();
        if (!this.isLogin || !this.currentOrderLis.length) {
          clearInterval(this.getDataTimer);
          this.getDataTimer = null;
        }
      }, 3000);
    },
    thousandsComma(num) {
      if (num) {
        return thousandsComma(num);
      }
      return num;
    },
    // 只显示当前合约开关
    switchChange() {
      this.isShowCurPosition = !this.isShowCurPosition;
      myStorage.set('isShowCurPosition', this.isShowCurPosition);
      this.$bus.$emit('isShowCurPosition', this.isShowCurPosition);
    },
    close() {
      this.isShowStopOrder = false;
    },
    // 全部取消弹窗关闭
    setCanelClose() {
      this.allCancelDialog = false;
      // 取消一键全平
      this.allClosePosition = false;
      this.forcePositionModal = false;
    },
    // 全部取消确认
    setCanelConfirm() {
      if (this.allCanelType === 'cancelOrderAll') {
        const obj = {};
        this.revokeList.push(obj.id);
        setTimeout(() => {
          this.axios({
            url: this.$store.state.url.futures.orderCancel,
            hostType: 'co',
            method: 'post',
            params: {
              contractId: this.contractId,
              orderId: obj.id,
              isConditionOrder: this.orderType === 2,
            },
          }).then((data) => {
            this.setCanelClose();
            const ind = this.revokeList.indexOf(obj.id);
            this.revokeList.splice(ind, 1);
            if (data.code.toString() === '0') {
              this.$store.dispatch('getPositionList');
              this.$store.dispatch('getUserConfig');
              setTimeout(() => {
                this.$store.dispatch('getUserConfig');
              }, 1000);
              this.$bus.$emit('tip', { text: data.msg, type: 'success' });
              this.getOrderList();
            } else {
              this.$bus.$emit('tip', { text: data.msg, type: 'error' });
            }
          });
        }, 500);
      }
    },
    // 一键全平
    closePositionConfirm() {
      const params = {};
      if (this.isShowCurPosition) {
        params.contractId = this.contractId;
      }
      this.axios({
        url: 'order/close_all_position',
        hostType: 'co',
        method: 'post',
        params,
      }).then((data) => {
        this.setCanelClose();
        if (data.code.toString() === '0') {
          this.$store.dispatch('getPositionList');
          this.$store.dispatch('getUserConfig');
          setTimeout(() => {
            this.$store.dispatch('getUserConfig');
          }, 1000);
          this.$bus.$emit('tip', { text: data.msg, type: 'success' });
          this.getOrderList();
          this.allClosePosition = false;
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
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
    window.handleForcePositionShow = this.handleForcePositionShow;
  },
};
