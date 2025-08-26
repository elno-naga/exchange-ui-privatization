import {
  imgMap, colorMap, formatTime, fixD, nul,
} from '@/utils';

export default {
  data() {
    return {
      loading: true,
      imgMap,
      colorMap,
      dataList: [],
      cellHeight: 55,
      headHeight: 30,
      lineNumber: 10,
      classes: '',
      headClasses: '',
      bodyClasses: '',
      lineClass: '',
      // 数据相关
      // 数据相关
      listPage: {
        count: 0, // 总条数
        page: 1, // 当前page
        pageSize: 10, // 每页显示
      },
      startTime: '',
      endTime: '',
      uidValue: '',
      phoneValue: '',
      coinType: '',
      type: 'all',
      lowerType: 'all',
      findFlagLoad: false,
      levelType: 'all',
      maxLevel: undefined,
      showRateTip: null,
      showRateTipMsg: null,
    };
  },
  computed: {
    levelTypeList() {
      const { maxLevel } = this;
      const list = [];
      for (let i = 1; i < maxLevel + 1; i += 1) {
        list.push({
          code: `${i}`,
          key: 'levelType',
          value: this.$t('coBroker.textLevel', { count: i }),
        });
      }
      return [
        // 全部
        { code: 'all', key: 'levelType', value: this.$t('order.otcOrder.all') },
        { code: '0', key: 'levelType', value: this.$t('brokerSystem.extremeCommission.selfRebate') },
        ...list,
      ];
    },
    levelTexr() {
      return [this.$t('brokerSystem.extremeCommission.selfRebate'), this.$t('coBroker.text8'), this.$t('coBroker.text9')];
    },
    coinTypeList() {
      return [
        // 全部
        { code: 'all', key: 'coinType', value: this.$t('order.otcOrder.all') },
      ];
    },
    lowerTypeList() {
      return [
        // 全部
        { code: 'all', key: 'lowerType', value: this.$t('order.otcOrder.all') },
      ];
    },
    startTimeNum() {
      return (
        new Date(this.startTime.replace(/-/g, '/')).getTime() / 1000
      ).toString();
    },
    endTimeNum() {
      return (
        new Date(this.endTime.replace(/-/g, '/')).getTime() / 1000
      ).toString();
    },
    startTimeText() {
      return this.$t('broker.startTime');
    },
    endTimeText() {
      return this.$t('broker.endTime');
    },
    navTab() {
      return [
        {
          name: this.$t('brokerSystem.commissionNavTab[0]'),
          index: 1,
        },
        {
          name: this.$t('brokerSystem.commissionNavTab[1]'),
          index: 2,
        },
      ];
    },
    usdtFix() {
      let fix = 0;
      if (this.market && this.market.coinList && this.market.coinList.USDT) {
        fix = this.market.coinList.USDT.showPrecision;
      }
      return fix;
    },
    market() {
      return this.$store.state.baseData.market;
    },
    columns() {
      return [
        {
          // 日期
          title: this.$t('coBroker.columns1'), // '日期',
          align: 'left',
          key: 'time',
        },
        {
          title: this.$t('coBroker.columns2'), // '邀请人账号',
          align: 'left',
          width: '150px',
          key: 'account',
        },
        // {
        //   title: `${this.$t('coBroker.columns3')}(USDT)`, // '邀请人交易额',
        //   align: 'center',
        //   width: '150px',
        // },
        {
          title: this.$t('coBroker.columns4'), // '币种',
          align: 'center',
          key: 'coin',
          width: '70px',
        },
        // {
        //   title: this.$t('coBroker.columns5'), // '返佣类型',
        //   align: 'center',
        //   width: '100px',
        // },
        {
          title: `${this.$t('coBroker.columns6')}`, // '交易者ID',
          align: 'center',
          width: '180px',
          key: 'subAccount',
        },
        {
          title: this.$t('coBroker.columns7'), // '返佣级别',
          align: 'center',
          key: 'subLevel',
          width: '70px',
        },
        {
          title: `${this.$t('brokerSystem.tradeSearchTable[5]')}`, // 手续费,
          align: 'center',
          key: 'fee',
          width: '150px',
        },
        // {
        //   title: `${this.$t('coBroker.columns8')}(USDT)`, // '被邀请人交易额',
        //   align: 'center',
        //   width: '150px',
        // },
        {
          title: this.$t('brokerSystem.lowerTable1[4]'), // 返佣比例
          align: 'center',
          key: 'amountScale',
          promptText: this.$t('brokerSystem.extremeCommission.rebateRateTips'),
          width: '70px',
        },
        {
          title: this.$t('brokerSystem.lowerTable1[3]'), // 返佣金额,
          align: 'right',
          key: 'amountReturn',
          promptText: this.$t('brokerSystem.extremeCommission.refundAmountTips'),
          width: '155px',
        },
      ];
    },
  },
  methods: {
    // 显示
    showTip(val) {
      if (val === 'th_amountScale') {
        this.showRateTipMsg = this.$t('brokerSystem.extremeCommission.rebateRateTips');
      } else {
        this.showRateTipMsg = this.$t('brokerSystem.extremeCommission.refundAmountTips');
      }
      this.showRateTip = `saleIconPath-${val}`;
    },
    hideTip() {
      this.showRateTip = null;
      this.showRateTipMsg = null;
    },
    getMaxLevel() {
      this.axios({ url: '/co/agent/co_agent_support_level' })
        .then((res) => {
          this.maxLevel = res.data.supportMaxLevel;
        });
    },
    pagechange(v) {
      this.listPage.page = v;
      this.getDate();
    },
    init() {
      this.listPage.page = 1;
      const timestamp = new Date().getTime();
      const t = 60 * 60 * 24 * 1000 * 7;
      this.startTime = this.getNowTime(timestamp - t);
      this.endTime = this.getNowTime(timestamp);
      this.getDate();
    },
    getMonth(n) {
      const date = new Date();
      return date.setMonth(date.getMonth() + n);
    },
    getNowTime(time = '') {
      const date = new Date(time);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();

      return `${year}-${month}-${day}`;
    },
    timeSelect(time) {
      [this.startTime, this.endTime] = time;
      if (this.startTime && this.endTime) {
        this.reducePost();
        this.getDate();
      }
    },
    currentType(data) {
      this.currentTab = data.index;
    },
    reducePost() {
      if (this.timer) clearTimeout(this.timer);
      this.timer = setTimeout(() => { }, 500);
    },
    inputChanges(value, name) {
      this[name] = value;
      const now = new Date().getTime();
      this.findFlagLoad = now;
      setTimeout(() => {
        if (this.findFlagLoad === now) {
          this.listPage.page = 1;
          this.getDate();
        }
      }, 800);
    },
    setSelect(item) {
      this.listPage.page = 1;
      this[item.key] = item.code;
      this.getDate();
    },
    getFix(v) {
      let fix = 2;
      if (this.market && this.market.coinList && this.market.coinList[v]) {
        fix = this.market.coinList[v].showPrecision;
      }
      return fix;
    },
    getDate() {
      let startDate = this.startTime;
      let endDate = this.endTime;
      if (typeof this.startTime === 'string') {
        startDate = new Date(new Date(this.startTime.replace(/-/g, '/')).toLocaleDateString()).getTime();
      }
      if (typeof this.endTime === 'string') {
        endDate = new Date(new Date(this.endTime.replace(/-/g, '/')).toLocaleDateString()).getTime() + (24 * 60 * 60 * 1000 - 1);
      }
      this.loading = true;
      this.axios({
        url: 'co/agent/user_bonus_list',
        hostType: 'ex',
        params: {
          page: this.listPage.page,
          pageSize: this.listPage.pageSize,
          start_time: startDate, // 开始时间 00:00:00
          end_time: endDate, // 结束时间：23:59:59
          level: this.levelType === 'all' ? '' : this.levelType,
          account: this.uidValue || undefined,
          sub_account: this.phoneValue || undefined,
          // coin: this.coin === 'all' ? undefined : this.coin,
        },
      }).then((data) => {
        this.loading = false;
        if (data.code.toString() === '0') {
          this.setDate(data.data.mapList);
          this.listPage.count = data.data.count;
        } else {
          this.setDate([{
            amount_scale: 0.007,
          }]);
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
    setDate(data) {
      // this.loading2 = false;
      const arr = [];
      data.forEach((item, index) => {
        // const fix = this.getFix(item.coin.toUpperCase());
        // let typeText = '';
        // switch (item.bonus_type) {
        //   case 0:
        //     typeText = this.$t('brokerSystem.lowerTableList[4]'); // '返佣'
        //     break;
        //   case 1:
        //     typeText = this.$t('brokerSystem.lowerTableList[5]'); // '分佣'
        //     break;
        //   default:
        //     typeText = this.$t('brokerSystem.lowerTableList[6]'); // '二级返佣'
        // }
        arr.push({
          id: index,
          time: item.time ? formatTime(item.time) : '--', // 时间
          account: item.account ? item.account : '--', // 邀请人账号
          // `${fixD(item.selfVolume, fix)}`, // 邀请人交易额
          coin: item.coin, // 币种
          // typeText,
          subAccount: item.sub_account, // 交易者ID
          subLevel: item.sub_level === 0 ? this.$t('brokerSystem.extremeCommission.selfRebate') : this.$t('coBroker.textLevel', { count: item.sub_level }), // 返佣级别
          // fixD(item.sub_volume, fix), // 被邀请人交易额
          fee: fixD(item.fee, 8), // 手续费
          amountScale: `${nul(item.amount_scale, 100)} %`, // 返佣比例
          amountReturn: fixD(item.amount_return, 8), // 返佣金额
        });
      });
      this.dataList = arr;
    },
  },
  mounted() {
    this.getMaxLevel();
  },
};
