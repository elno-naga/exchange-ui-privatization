import {
  imgMap, colorMap, fixD, getCoinShowName, formatTime, getIconPath,
} from '@/utils';

export default {
  name: 'kolTrade',
  data() {
    return {
      imgMap,
      colorMap,
      getIconPath,
      // bannerBg: null,
      // isKol: false, // 是否是带单人
      // readerFlag: false, // 是否弹窗确认
      // bannerInfo: {}, // banner信息
      // currentType: 'list',
      income_amount: '0', // 收益 -- 收益额
      income_rate: '0', // 收益 -- 收益率
      follow_amount: '0', // 收益 -- 跟单总额
      nowType: 1,
      dataLength: 0,
      tableList: [],
      tabelLoading: false,
      paginationObj: {
        total: 0, // 数据总条数
        display: 10, // 每页显示条数
        currentPage: 1, // 当前页码
      },
      fixObj: {},
      cancelOrderFlag: false,
      closeData: {},
      dialogConfirmLoading: false,
      OrderDetailFlag: false,
      detailInfo: {},
      detailList: [],
      transactionDetailsList: [], // 成交详情列表
    };
  },
  filters: {
    formatTimeFn(date) {
      if (date) {
        return formatTime(date);
      }
      return '--';
    },
    rateFiter(v) {
      let str = '';
      if (Number(v) >= 0) {
        str = `+${v}`;
      } else {
        str = v;
      }
      return `${str}%`;
    },
  },
  computed: {
    isLogin() {
      return this.$store.state.baseData.isLogin;
    },
    // 用户信息
    userInfo() {
      return this.$store.state.baseData.userInfo;
    },
    market() {
      return this.$store.state.baseData.market;
    },
    navTab() {
      return {
        selected: this.nowType,
        list: [
          { name: `${this.$t('kol.kolTraderMyOrder.t30')}(${this.dataLength})`, index: 1 },
          { name: this.$t('kol.kolTraderMyOrder.t32'), index: 2 },
          { name: this.$t('kol.kolTraderMyOrder.t31'), index: 3 },
        ],
      };
    },
    columns() {
      if (this.nowType === 1) {
        return [
          {
            title: this.$t('kol.kolTradePc.text70'), key: 'changeSymbol', width: '20%', align: 'left',
          },
          // 带单人
          {
            title: this.$t('kol.kolTraderMyOrder.t13'), key: 'kol_name', width: '15%', align: 'center',
          },
          // 持仓均价
          {
            title: this.$t('kol.kolTraderMyOrder.t7'), key: 'avg_cost_px', width: '10%', align: 'center',
          },
          // 预估强平价
          {
            title: this.$t('kol.kolTraderMyOrder.t8'), key: 'avg_close_px', width: '10%', align: 'center',
          },
          // 收益率
          {
            title: this.$t('kol.kolTraderMyOrder.t9'), key: 'rate', width: '10%', align: 'center',
          },
          // 已下单金额 / 总跟单
          {
            title: `${this.$t('kol.kolTraderMyOrder.t10')}/${this.$t('kol.kolTraderMyOrder.t11')}`, key: 'trade_amount', width: '15%', align: 'center',
          },
          {
            title: this.$t('kol.kolTradePc.text67'), key: 'operation', width: '20%', align: 'right',
          },
        ];
      }
      return [
        {
          title: this.$t('kol.kolTradePc.text70'), key: 'changeSymbol', width: '20%', align: 'left',
        },
        // 带单人
        {
          title: this.$t('kol.kolTraderMyOrder.t13'), key: 'kol_name', width: '15%', align: 'center',
        },
        // 持仓均价
        {
          title: this.$t('kol.kolTraderMyOrder.t7'), key: 'avg_cost_px', width: '10%', align: 'center',
        },
        // 平仓均价
        {
          title: this.$t('kol.kolTraderMyOrder.t24'), key: 'avg_close_px', width: '10%', align: 'center',
        },
        // 收益率
        {
          title: this.$t('kol.kolTraderMyOrder.t9'), key: 'rate', width: '10%', align: 'center',
        },
        // 已下单金额 / 总跟单
        {
          title: `${this.$t('kol.kolTraderMyOrder.t10')}/${this.$t('kol.kolTraderMyOrder.t11')}`, key: 'trade_amount', width: '15%', align: 'center',
        },
        {
          title: this.$t('kol.kolTradePc.text67'), key: 'operation', width: '20%', align: 'right',
        },
      ];
    },
    columns1() {
      return [
        // 带单人
        {
          title: this.$t('kol.kolTraderMyOrder.t13'), key: 'kol_name', width: '20%', align: 'left',
        },
        // 跟单金额
        {
          title: this.$t('kol.kolTraderMyOrder.t33'), key: 'follow_amount', width: '30%', align: 'center',
        },
        // 盈亏金额
        {
          title: this.$t('kol.kolTraderMyOrder.t19'), key: 'profit_amount', width: '30%', align: 'center',
        },
        {
          title: this.$t('kol.kolTradePc.text67'), key: 'operation', width: '20%', align: 'right',
        },
      ];
    },
  },
  watch: {
    // isLogin(v) {
    //   if (v) {
    //     this.getIsKol();
    //   }
    // },
    market() {
      this.getFixData();
      this.getData();
    },
  },
  created() {
    if (this.market) {
      this.getFixData();
      this.getData();
    }
    this.getIncome();
  },
  methods: {
    init() {
      // this.$bus.$on('myOrder', () => {
      //   this.currentType = 'myOrder';
      // });
      // this.$bus.$on('list', () => {
      //   this.currentType = 'list';
      // });
      // this.$bus.$on('traderOrder', () => {
      //   this.currentType = 'traderOrder';
      // });
      // this.getBanner();
    },
    getType(v) {
      let str = '';
      let className = '';
      switch (v) {
        // 买入开多
        case 1:
          str = this.$t('kol.kolTraderOrderDte.t17');
          className = 'label-color-buy rise-1-cl';
          break;
        // 买入平空
        case 2:
          str = this.$t('kol.kolTraderOrderDte.t18');
          className = 'label-color-buy rise-1-cl';
          break;
        // 卖出平多
        case 3:
          str = this.$t('kol.kolTraderOrderDte.t19');
          className = 'label-color-sell fall-1-cl';
          break;
        // 卖出开空
        default:
          str = this.$t('kol.kolTraderOrderDte.t20');
          className = 'label-color-sell fall-1-cl';
      }
      return { str, className };
    },
    rateClass(v) {
      let str = 'fall-1-cl';
      if (Number(v) >= 0) {
        str = 'rise-1-cl';
      }
      return str;
    },
    fixFn(v, fix) {
      // fix
      if (`${fix}` !== 'undefined') {
        return fixD(v, fix);
      }
      return fixD(v, this.fix);
    },
    getIncome() {
      this.axios({
        url: 'v2/user/income_info',
        hostType: 'coFollow',
        // params: {
        //   uid: this.uid
        // },
        method: 'post',
      }).then((data) => {
        if (data.code === '0' || data.code === 0) {
          this.income_amount = data.data.income_amount; // 收益 -- 收益额
          this.income_rate = data.data.income_rate; // 收益 -- 收益率
          this.follow_amount = data.data.follow_amount; // 收益 -- 跟单总额
        } else {
          this.$bus.$emit('tip', {
            text: data.msg, type: 'error', backgroundColor: '#F6F8FF', textColor: '#16181d',
          });
        }
      });
    },
    tabChange(item) {
      this.nowType = item.index;
      this.tableList = [];
      setTimeout(() => {
        this.getData();
      }, 500);
    },
    // 合约信息
    getFixData() {
      this.axios({
        url: 'v2/common/symbol_list',
        hostType: 'coFollow',
        // params: obj,
        method: 'post',
      }).then((data) => {
        // this.dialogConfirmLoading = false
        if (data.code === '0' || data.code === 0) {
          const fixObj = {};
          const { coinList } = this.market;
          data.data.list.forEach((item) => {
            fixObj[item.instrumentId] = item;
            const [base, quote] = item.symbol.split('-');
            fixObj[item.instrumentId].symbol = `${getCoinShowName(base, coinList)}-${getCoinShowName(quote, coinList)}`;
          });
          this.fixObj = fixObj;
        } else {
          this.$bus.$emit('tip', {
            text: data.msg, type: 'error', backgroundColor: '#F6F8FF', textColor: '#16181d',
          });
        }
      });
    },
    // 翻页
    pageChange(v) {
      this.paginationObj.currentPage = v;
      this.getData();
    },
    getData() {
      this.tabelLoading = true;
      if (this.nowType === 3) {
        this.getD1();
      } else {
        this.getD2();
      }
    },
    getD1() {
      this.axios({
        url: 'v2/user/waiting_order',
        hostType: 'coFollow',
        params: {
          page: this.paginationObj.currentPage,
          pageSize: this.paginationObj.display,
        },
        method: 'post',
      }).then((data) => {
        if (this.nowType !== 3) return;
        if (data.code === '0' || data.code === 0) {
          this.paginationObj.total = data.data.count;
          this.tableList = data.data.list;
        } else {
          this.$bus.$emit('tip', {
            text: data.msg, type: 'error', backgroundColor: '#F6F8FF', textColor: '#16181d',
          });
        }
        this.tabelLoading = false;
      });
    },
    getD2() {
      const type = this.nowType;
      this.tabelLoading = true;
      this.paginationObj.currentPage = 1;
      this.axios({
        url: 'v2/user/order_list',
        hostType: 'coFollow',
        params: {
          page: this.paginationObj.currentPage,
          pageSize: this.paginationObj.display,
          type: this.nowType === 1 ? 0 : 1, // 0.进行中 1.已结束
        },
        method: 'post',
      }).then((data) => {
        if (this.nowType !== type) return;
        if (data.code === '0' || data.code === 0) {
          this.paginationObj.total = data.data.count;
          const { coinList } = this.market;
          if (this.nowType === 1) {
            this.dataLength = data.data.count;
          }
          data.data.list.forEach((item) => {
            const [base, quote] = item.symbol.split('-');
            // eslint-disable-next-line no-param-reassign
            item.changeSymbol = `${getCoinShowName(base, coinList)}/${getCoinShowName(quote, coinList)}`;
          });
          this.tableList = data.data.list;
        } else {
          this.$bus.$emit('tip', {
            text: data.msg, type: 'error', backgroundColor: '#F6F8FF', textColor: '#16181d',
          });
        }
        this.tabelLoading = false;
      });
    },
    goList() {
      this.$bus.$emit('list', true);
    },
    cancelFollow(item, flag) {
      this.cancelOrderFlag = true;
      this.closeData = {
        item, flag,
      };
    },
    closeCancelFollowFlag() {
      this.cancelOrderFlag = false;
    },
    dialogConfirmCancelFollow(type) {
      if (this.dialogConfirmLoading) return;
      this.dialogConfirmLoading = true;
      const { flag, item } = this.closeData;
      let obj = {};
      if (flag === 'following') {
        if (type === 1) {
          // 只平次单
          obj = {
            uid: item.kol_uid,
            instrument_id: item.instrument_id,
            side: item.side,
            cancel_type: type,
          };
        }
        if (type === 2) {
          // 取消跟随
          obj = {
            uid: item.kol_uid,
            // instrument_id: item.instrument_id,
            // side: item.side,
            // cancel_type: type,
          };
        }
      } else {
        obj = {
          uid: item.kol_uid,
        };
      }
      this.axios({
        url: 'v2/kol/cancel_follow',
        hostType: 'coFollow',
        params: obj,
        method: 'post',
      }).then((data) => {
        if (data.code === '0' || data.code === 0) {
          this.tableList = [];
          this.cancelOrderFlag = false;
          this.getData();
          this.$bus.$emit('tip', {
            text: data.msg, type: 'success', backgroundColor: '#F6F8FF', textColor: '#16181d',
          });
        } else {
          this.$bus.$emit('tip', {
            text: data.msg, type: 'error', backgroundColor: '#F6F8FF', textColor: '#16181d',
          });
        }
        this.dialogConfirmLoading = false;
      });
    },
    closeOrderDetailFlag() {
      this.OrderDetailFlag = false;
      this.detailList = [];
    },
    getDetail(item) {
      this.detailInfo = {};
      this.OrderDetailFlag = true;
      this.detailInfo = item;
      this.getDetailList();
    },
    getDetailList() {
      const obj = {
        instrument_id: this.detailInfo.instrument_id,
        positionId: this.detailInfo.id,
        uid: this.detailInfo.uid,
      };
      this.axios({
        url: 'v2/user/position_order_list',
        hostType: 'coFollow',
        params: obj,
        method: 'post',
      }).then((data) => {
        if (data.code === '0' || data.code === 0) {
          this.detailList = data.data.list;
          // this.detailList = [
          //   {
          //     side: 1, // 订单方向 1-开多 买 2- 平空 买 3-平多 卖 4-开空 卖
          //     category: 1, // 订单类型 1:限价委托 2:市价委托 7:被动委托(PostOnly)
          //     ctime: 1596092273095, // 创建时间戳
          //     mtime: 1596092273095, // 成交时间戳
          //     price: 200, // 订单价格
          //     tradePrice: 100, // 成交均价
          //     order_volume: 10, // 订单总量
          //     trade_volume: 12, // 成交量
          //     make_fee: 1,
          //     take_fee: 2
          //   }
          // ]
          // data.data.count = 11
          // this.income_amount = data.data.income_amount // 收益 -- 收益额
          // this.income_rate = data.data.income_rate // 收益 -- 收益率
          // this.follow_amount = data.data.follow_amount // 收益 -- 跟单总额
          // this.pagination.count = data.data.count;
        } else {
          this.$bus.$emit('tip', {
            text: data.msg, type: 'error', backgroundColor: '#F6F8FF', textColor: '#16181d',
          });
        }
      });
    },
    goDte(row) {
      // 设置索引
      let ind = null;
      this.detailList = this.detailList.map((item, index) => {
        const newItem = item;
        if (newItem.oid === row.oid) {
          ind = index;
          newItem.showTranscationDetailsList = !newItem.showTranscationDetailsList;
        }
        return newItem;
      });
      if (row.showTranscationDetailsList) {
        const obj = {
          instrument_id: row.instrument_id,
          oid: row.oid,
          uid: row.uid,
        };
        this.axios({
          url: 'v2/user/position_trade_list',
          hostType: 'coFollow',
          params: obj,
          method: 'post',
        }).then((data) => {
          if (data.code === '0' || data.code === 0) {
            this.loadingFlag = false;
            // this.pagination.count = data.data.count;
            // if (
            //   Math.ceil(
            //     parseFloat(data.data.count) / parseFloat(this.pagination.pageSize)
            //   ) > this.pagination.page
            // ) {
            //   this.pullUpState = 0;
            // } else {
            //   this.pullUpState = 3;
            // }
            const detailList = JSON.parse(JSON.stringify(this.detailList));
            if (ind !== null && this.detailList[ind]) {
              detailList[ind].transactionDetailsList = data.data.list;
            }
            this.detailList = detailList;
            ind = null;
            // this.transactionDetailsList = data.data.list;
          } else {
            this.$bus.$emit('tip', {
              text: data.msg, type: 'error', backgroundColor: '#F6F8FF', textColor: '#16181d',
            });
          }
        });
      }
    },
    getStatus(status) {
      // 订单状态(0初始订单,1新订单,2完全成交,3部分成交,4已撤单,5待撤单,6异常订单)
      if (status === 0) {
        return this.$t('kolTraderMyOrderStatus.t0');
      } if (status === 1) {
        return this.$t('kolTraderMyOrderStatus.t1');
      } if (status === 2) {
        return this.$t('kolTraderMyOrderStatus.t2');
      } if (status === 3) {
        return this.$t('kolTraderMyOrderStatus.t3');
      } if (status === 4) {
        return this.$t('kolTraderMyOrderStatus.t4');
      } if (status === 5) {
        return this.$t('kolTraderMyOrderStatus.t5');
      } if (status === 6) {
        return this.$t('kolTraderMyOrderStatus.t6');
      }
    },
  },
};
