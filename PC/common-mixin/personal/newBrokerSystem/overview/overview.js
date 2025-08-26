import { imgMap, colorMap, fixD } from '@/utils';

export default {

  data() {
    return {
      currentTab: 1,
      lineHeight: '55',
      marginRight: 50, // 距离右边的距离
      loading1: true,
      loading2: true,
      dataList: [],
      dataList2: [],
      imgMap,
      colorMap,
      countTotal: '--', // 总数量
      countAgent: '--', // 子经纪数量
      countCommon: '--', // 直客数量
      countBonus: '--', // 昨日返佣数量
      countTwo: '--', // 二级好友数量
      scaleSecond: null, // 二级返佣
      brokerCustomer: [],

      roleType: '',
      iconHover: false,
      depositHoverNum: false,
      depositHoverTip: false,
      withdrawHoverNum: false,
      withdrawHoverTip: false,
    };
  },
  props: {
    reqReady: {
      default: false,
      type: Boolean,
    },
    reqData: {
      default: () => { },
      type: Object,
    },
  },
  watch: {
    reqReady: {
      immediate: true,
      handler(v) {
        if (v) {
          this.reqSet();
        }
      },
    },
  },
  computed: {
    depositMsg() {
      const childInfo = this.reqData.child_info || {};
      return {
        sum: childInfo.deposit_sum || 0,
        chainNum: childInfo.deposit_chain || 0,
        transNum: childInfo.trans_in || 0,
      };
    },
    withdrawMsg() {
      const childInfo = this.reqData.child_info || {};
      return {
        sum: childInfo.withdraw_sum || 0,
        chainNum: childInfo.withdraw_chain || 0,
        transNum: childInfo.trans_out || 0,
      };
    },
    brokerNumTip() {
      if (this.roleType === '1') {
        const [normal, child] = this.brokerCustomer;
        return `
        <div class="tip_container 1">
          <div class="tip_title">${this.$t('brokerSystem.overview[8]')}</div> 
          <div>${this.$t('brokerSystem.extremeCommission.users')}:<span>${normal}</span></div> 
          <div>${this.$t('brokerSystem.extremeCommission.subBrokers')}:<span>${child}</span></div> 
        </div>
      `;
      }
      const levelStr = this.brokerCustomer.map((item, index) => `<div>${this.$t('brokerSystem.overview[13]', { count: index + 1 })}:<span>${item}</span></div>`);
      return `
        <div class="tip_container 2">
          <div class="tip_title">${this.$t('brokerSystem.overview[8]')}</div> 
          ${levelStr.join('')}
        </div>
      `;
    },
    depositTip() {
      return `
        <div class="tip_container">
          ${this.$t('brokerSystem.overviewDeposit.tip')}
        </div>
      `;
    },
    depositNumTip() {
      return `
        <div class="tip_container">
          <div>${this.$t('brokerSystem.overviewDeposit.list[0]')}:<span>${this.depositMsg.chainNum}</span></div> 
          <div>${this.$t('brokerSystem.overviewDeposit.list[1]')}:<span>${this.depositMsg.transNum}</span></div> 
        </div>
      `;
    },
    withdrawTip() {
      return `
        <div class="tip_container">
          ${this.$t('brokerSystem.overviewWithdraw.tip')}
        </div>
      `;
    },
    withdrawNumTip() {
      return `
        <div class="tip_container">
          <div>${this.$t('brokerSystem.overviewWithdraw.list[0]')}:<span>${this.withdrawMsg.chainNum}</span></div> 
          <div>${this.$t('brokerSystem.overviewWithdraw.list[1]')}:<span>${this.withdrawMsg.transNum}</span></div> 
        </div>
      `;
    },
    market() {
      return this.$store.state.baseData.market;
    },
    usdtFix() {
      let fix = 0;
      if (this.market && this.market.coinList && this.market.coinList.USDT) {
        fix = this.market.coinList.USDT.showPrecision;
      }
      return fix;
    },
    navTab() {
      return [
        // 直客贡献排行
        {
          name: this.$t('brokerSystem.overviewTitle[0]'),
          index: 1,
        },
        // // 子经纪贡献排行
        // {
        //   name: this.$t('brokerSystem.overviewTitle[1]'),
        //   index: 2,
        // },
      ];
    },
    columns() {
      return [
        // 排名
        {
          title: this.$t('brokerSystem.overviewList[0]'),
          align: 'left',
          key: 'index',
        },
        // 手机号
        {
          title: this.$t('brokerSystem.overviewList[1]'),
          align: 'center',
          key: 'username',
        },
        // 返佣手续费 (USDT)
        {
          title: this.$t('brokerSystem.overviewList[2]'),
          align: 'right',
          width: '200px',
          key: 'amount',
        },
      ];
    },
    // columns2() {
    //   return [
    //     // 排名
    //     {
    //       title: this.$t('brokerSystem.overviewList[0]'),
    //       align: 'left',
    //     },
    //     // 手机号
    //     {
    //       title: this.$t('brokerSystem.overviewList[1]'),
    //       align: 'center',
    //     },
    //     // 返佣手续费 (USDT)
    //     {
    //       title: this.$t('brokerSystem.overviewList[2]'),
    //       align: 'right',
    //       width: '200px',
    //     },
    //   ];
    // },
  },
  methods: {
    reqSet() {
      this.initSystem();
      this.initList1();
      // this.initList2();
    },
    initSystem() {
      const data = this.reqData.child_info;
      this.roleType = this.reqData.role_type === undefined ? '0' : `${this.reqData.role_type}`;
      if (this.roleType === '0') {
        // 比例经纪人
        let num = 0;
        const numList = [];
        data.scale_child_info.forEach(({ level, count }) => {
          numList[level - 1] = count;
          num += Number(count);
        });
        this.countTotal = num; // 用户总量
        this.brokerCustomer = numList;
      } else {
        const num = data.range_count_common && data.range_count_two ? Number(data.range_count_common) + Number(data.range_count_two) : data.range_count_common || data.range_count_two;
        // 极差经纪人
        this.countTotal = num; // 用户总量
        this.brokerCustomer = [data.range_count_common, data.range_count_two];
      }
      this.countBonus = data.count_bonus; // 昨日分成用户
      this.scaleSecond = this.reqData.scale_info.scale_second;
    },
    initList1() {
      const data = this.reqData.user_return;
      const arr = [];
      data.forEach((item, index) => {
        arr.push({
          id: index,
          index: `${index + 1}`,
          username: item.username,
          amount: fixD(item.amount, this.usdtFix),
        });
      });
      this.loading1 = false;
      this.dataList = arr;
    },
    // initList2() {
    //   const data = this.reqData.user_sub;
    //   const arr = [];
    //   data.forEach((item, index) => {
    //     arr.push({
    //       id: index,
    //       data: [
    //         `NO.${index + 1}`,
    //         item.username,
    //         fixD(item.amount, this.usdtFix),
    //       ],
    //     });
    //   });
    //   this.loading2 = false;
    //   this.dataList2 = arr;
    // },
    init() {
    },
    currentType(data) {
      this.currentTab = data.index;
    },
  },
};
