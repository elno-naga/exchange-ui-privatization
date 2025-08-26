export default {
  computed: {
    // 链接
    lan() {
      if (this.$store.state.baseData) {
        return this.$store.state.baseData.lan;
      }
      return null;
    },
    linkurl() {
      if (this.$store.state.baseData.publicInfo) {
        return this.$store.state.baseData.publicInfo.url;
      }
      return {};
    },
    // 任务类型
    isTaskTypeFn() {
      return {
        0: {
          // 每日
          title: this.$t('rewardsCenter.dailyTask'),
          value: 0,
        },
        1: {
          // 新手
          title: this.$t('rewardsCenter.beginnerTask'),
          value: 1,
        },
        2: {
          // 进阶
          title: this.$t('rewardsCenter.advancedTask'),
          value: 2,
        },
        3: {
          // 签到
          title: this.$t('rewardsCenter.signInTask'),
          value: 3,
        },
      };
    },
    // 功能模块 0现货，1杠杆，3合约，4数字货币入金（2为etf先不做）
    isTaskCategoryFn() {
      return {
        0: {
          // 现货
          routerUrl: this.linkurl.exUrl ? `${this.linkurl.exUrl}/${this.lan}/trade` : '',
        },
        1: {
          // 杠杆
          routerUrl: this.linkurl.exUrl ? `${this.linkurl.exUrl}/${this.lan}/margin` : '',
        },
        2: {
          // ETF
          routerUrl: '',
        },
        3: {
          // 合约
          routerUrl: this.linkurl.coUrl ? `${this.linkurl.coUrl}/${this.lan}/trade` : '', // 合约
        },
        4: {
          // 数字货币入金
          routerUrl: this.linkurl.exUrl ? `${this.linkurl.exUrl}/${this.lan}/assets/recharge?symbol=USDT` : '',
        },
      };
    },
    // 任务奖励类型  0现金奖励
    isRewardTypeFn() {
      return {
        0: {
          // 现金奖励
          title: this.$t('rewardsCenter.cashReward'),
          value: 0,
        },
      };
    },
  },
};
