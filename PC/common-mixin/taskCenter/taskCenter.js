import { formatTime } from 'BlockChain-ui-privatization/utils';
import taskMsg from 'BlockChain-ui-privatization/PC/common-mixin/taskCenter/taskMsg';
import { getCookie, imgMap, getIconPath } from '@/utils';

export default {
  name: 'taskCenter',
  data() {
    return {
      getIconPath,
      imgMap,
      userSkin: getCookie('cusSkin') || getCookie('defSkin'), // 用户选择的skin
      tabActive: 'task',
      taskState: 'inProgress',
      rewardActive: 'record',
      tablePage: {
        record: {
          total: 0,
          current: 1,
        },
        overview: {
          total: 0,
          current: 1,
        },
        withdraw: {
          total: 0,
          current: 1,
        },
      },
      tableData: {
        record: undefined,
        overview: undefined,
        withdraw: undefined,
      },
      tableLoading: {
        record: false,
        overview: false,
        withdraw: false,
      },
      taskData: {
        inProgress: undefined,
        beginner: undefined,
        daily: undefined,
      },
      bannerMsg: {
        title: undefined,
        desc: undefined,
        bannerImg: undefined,
        btnText: undefined,
        btnTextUrl: undefined,
      },
      attendanceData: {
        continuous: undefined,
        timeZone: undefined,
        inComeList: [],
        check: {
          user: false,
          phoneEmail: false,
        },
      },
      rewardReceiveType: undefined,
      rewardReceiveTerm: undefined,
      timeZone: undefined,
      canWithdraw: false,
      showRewardSuccess: false,
      reward: {
        count: undefined,
        unit: undefined,
      },
      imgDomain: undefined,
    };
  },
  mixins: [taskMsg],
  computed: {
    isDarkTheme() {
      return this.userSkin === '1';
    },
    taskStateList() {
      return [
        {
          key: 'inProgress',
          name: this.$t('rewardsCenter.taskInProgress'),
        },
        {
          key: 'beginner',
          name: this.$t('rewardsCenter.beginnerTask'),
        },
        {
          key: 'daily',
          name: this.$t('rewardsCenter.dailyTask'),
        },
        // {
        //   key:'4',
        //   name:this.$t('rewardsCenter.advancedTask')
        // }
      ];
    },
    tabList() {
      return [
        {
          key: 'task',
          name: this.$t('rewardsCenter.taskCenter'),
        },
        {
          key: 'reward',
          name: this.$t('rewardsCenter.myRewards'),
        },
      ];
    },
    rewardTypeList() {
      return [
        {
          key: 'record',
          name: this.$t('rewardsCenter.rewardRecord'),
        },
        {
          key: 'overview',
          name: this.$t('rewardsCenter.rewardOverview'),
        },
        {
          key: 'withdraw',
          name: this.$t('rewardsCenter.withdrawalRecord'),
        },
      ];
    },
    tableColumns() {
      return {
        record: [
          {
            key: 'coin',
            title: this.$t('rewardsCenter.rewardCrypto'),
            width: '14%',
            align: 'left',
          },
          {
            key: 'taskType', // 转换
            title: this.$t('rewardsCenter.taskType'),
            width: '14%',
            align: 'left',
          },
          {
            key: 'taskName', // 拼接
            title: this.$t('rewardsCenter.taskName'),
            width: '25%',
            align: 'left',
          },
          {
            key: 'amount',
            title: this.$t('rewardsCenter.rewardAmount'),
            width: `${47 / 3}%`,
            align: 'left',
          },
          {
            key: 'usdtAmount',
            title: this.$t('rewardsCenter.rewardAmountEqu'),
            width: `${47 / 3}%`,
            align: 'left',
          },
          {
            key: 'receiveTime',
            title: this.$t('rewardsCenter.rewardTime'),
            width: `${47 / 3}%`,
            align: 'right',
          },
        ],
        overview: [
          {
            key: 'coin',
            title: this.$t('rewardsCenter.rewardCrypto'),
            width: `${100 / 5}%`,
            align: 'left',
          },
          {
            key: 'rewardAmount',
            title: this.$t('rewardsCenter.rewardTotal'),
            width: `${100 / 5}%`,
            align: 'left',
          },
          {
            key: 'withdrewAmount',
            title: this.$t('rewardsCenter.rewardWithdrawn'),
            width: `${100 / 5}%`,
            align: 'left',
          },
          {
            key: 'unWithdrawAmount',
            title: this.$t('rewardsCenter.rewardWithdrawnWait'),
            width: `${100 / 5}%`,
            align: 'left',
          },
          {
            key: 'unWithdrawUsdtAmount',
            title: this.$t('rewardsCenter.rewardWithdrawnWaitU'),
            width: `${100 / 5}%`,
            align: 'right',
          },
        ],
        withdraw: [
          {
            key: 'coin',
            title: this.$t('rewardsCenter.withdrawalCryptoList'),
            width: `${100 / 4}%`,
            align: 'left',
          },
          {
            key: 'withdrawTime',
            title: this.$t('rewardsCenter.withdrawalTime'),
            width: `${100 / 4}%`,
            align: 'left',
          },
          {
            key: 'amount',
            title: this.$t('rewardsCenter.withdrawalAmountList'),
            width: `${100 / 4}%`,
            align: 'left',
          },
          {
            key: 'usdtAmount',
            title: this.$t('rewardsCenter.withdrawalAmountEqu'),
            width: `${100 / 4}%`,
            align: 'right',
          },
        ],
      };
    },
    // 全部币种列表
    coinList() {
      if (this.$store.state.baseData && this.$store.state.baseData.market) {
        return this.$store.state.baseData.market.coinList;
      }
      return null;
    },
    // 任务提示 - 仅新手，每日展示
    taskTip() {
      if (this.rewardReceiveType === undefined) {
        return '';
      }
      // 奖励发放方式 0系统自动 1手动领取
      if (this.taskState === 'beginner') {
        return this.rewardReceiveType === 0 ? this.$t('rewardsCenter.beginnerTaskHint') : this.$t('rewardsCenter.beginnerTaskHintMan', { count: this.rewardReceiveTerm });
      } if (this.taskState === 'daily') {
        return this.rewardReceiveType === 0 ? this.$t('rewardsCenter.dailyTaskHint') : this.$t('rewardsCenter.dailyTaskHintMan', { timeZone: this.timeZone });
      }
      return '';
    },
    // 是否登录
    isLogin() {
      return this.$store.state.baseData.isLogin;
    },
    // 是否展示任务列表
    showTask() {
      const type = this.taskState;
      return this.taskData[type] || [];
    },
    // 当前展示的记录表头
    rewardTableColumns() {
      return this.tableColumns[this.rewardActive];
    },
    // 当前展示的记录分页信息
    rewardTablePage() {
      return this.tablePage[this.rewardActive];
    },
    // 当前展示的记录信息
    rewardTableData() {
      return this.tableData[this.rewardActive] || [];
    },
  },
  methods: {
    // 切换tab 【任务中心，奖励中心】
    changeType(type) {
      this.tabActive = type;
      if (this.isLogin && type === 'reward') {
        this.getRecord();
      }
    },
    // 切换任务tab
    changeTaskState(type) {
      this.taskState = type;
      this.getTaskData(type);
    },
    // 奖励中心-记录切换分页
    changePageIndex(index) {
      this.$set(this.tablePage, this.rewardActive, {
        current: index,
        total: this.tablePage[this.rewardActive].total,
      });
      this.getRecordItem(this.rewardActive);
    },
    // 奖励中心-切换记录tab
    changeRewardtype(type) {
      this.rewardActive = type;
      this.getRecordItem(type, 1);
    },
    // 获取任务中心基础数据
    getTaskCenterMsg() {
      this.axios({
        url: 'task_center_index',
        method: 'post',
      }).then((res) => {
        const {
          rewardMainHeading,
          rewardSubheading,
          rewardButtonStr,
          rewardButtonUrl,
          bannerImageUrl,
          nightBannerImageUrl,
          rewardReceiveType,
          rewardReceiveTerm,
          timeZone,
          withdrawSwitch,
          signInInfo = {},
          imgUrl,
        } = res.data || {};
        const {
          rewards = [], rewardCoin, seriateSignInNum, isSignIn, isKyc, isTwoCheck, rewardDetails = [],
        } = signInInfo || {};
        this.imgDomain = imgUrl;
        this.bannerMsg = {
          title: rewardMainHeading,
          desc: rewardSubheading,
          btnText: rewardButtonStr,
          btnTextUrl: rewardButtonUrl,
          bannerImg: this.isDarkTheme ? nightBannerImageUrl : bannerImageUrl,
        };
        const timeZoneShow = timeZone === '+0' ? '' : timeZone;
        this.attendanceData = {
          continuous: seriateSignInNum || 0,
          timeZone: `${timeZoneShow}`,
          inComeList: rewards.map((item, index) => ({
            income: item,
            unit: rewardCoin,
            checked: index < seriateSignInNum,
          })),
          inComeDetailList: rewardDetails || [],
          isSignIn,
          check: {
            user: isKyc === 1,
            phoneEmail: isTwoCheck === 1,
          },
        };
        this.rewardReceiveType = rewardReceiveType;
        this.rewardReceiveTerm = rewardReceiveTerm;
        this.timeZone = timeZoneShow;
        this.canWithdraw = withdrawSwitch === 1;
      });
    },
    // 奖励中心-获取三个记录数据
    getRecord() {
      this.$bus.$emit('updateWithdraw');
      const listObj = this.rewardTypeList.map((item) => item.key);
      listObj.forEach((key) => {
        this.getRecordItem(key, 1);
      });
    },
    // 奖励中心-获取记录数据
    getRecordItem(key, index) {
      const listObj = {
        record: 'user_reward_records',
        overview: 'user_reward_overall',
        withdraw: 'user_withdraw_records',
      };
      this.axios({
        url: listObj[key],
        method: 'post',
        params: key !== 'overview' ? {
          page: index || this.tablePage[key].current,
          pageSize: 5,
        } : undefined,
      })
        .then((res) => {
          let count;
          let list;
          if (key === 'overview') {
            list = res.data;
          } else {
            count = res.data.count;
            list = res.data.list;
          }
          if (key !== 'overview') {
            this.$set(this.tablePage, key, {
              total: count,
              current: index || this.tablePage[key].current,
            });
          }
          const showData = this.recordDataDeal(key, list);
          this.$set(this.tableData, key, showData);
        });
    },
    // 奖励中心处理记录信息数据
    recordDataDeal(key, data) {
      const $this = this;
      if (key === 'record') {
        return [...data].map((item) => {
          const coinName = item.coin.toUpperCase();
          const iconImg = $this.coinList && $this.coinList[coinName] ? $this.coinList[coinName].icon : null;
          // let iconShow;
          // if (iconImg) {
          //   iconShow = [
          //     {
          //       type: 'img',
          //       imgUrl: iconImg,
          //     },
          //     {
          //       text: item.coin,
          //     },
          //   ];
          // } else {
          //   iconShow = coinName;
          // }
          return {
            iconImg,
            coin: coinName,
            taskType: this.isTaskTypeFn[item.taskType].title,
            taskName: item.taskName,
            amount: `${item.amount} ${coinName}`,
            usdtAmount: item.usdtAmount ? (Math.floor(item.usdtAmount * 100) / 100).toFixed(2) : item.usdtAmount,
            receiveTime: formatTime(item.receiveTime),
          };
        });
      }
      if (key === 'overview') {
        return [...data].map((item) => {
          const coinName = item.coin.toUpperCase();
          const iconImg = $this.coinList && $this.coinList[coinName] ? $this.coinList[coinName].icon : null;
          // let iconShow;
          // if (iconImg) {
          //   iconShow = [
          //     {
          //       type: 'img',
          //       imgUrl: iconImg,
          //     },
          //     {
          //       text: coinName,
          //     },
          //   ];
          // } else {
          //   iconShow = coinName;
          // }
          return {
            iconImg,
            coin: coinName,
            rewardAmount: `${item.rewardedAmount} ${coinName}`,
            withdrewAmount: `${item.withdrewAmount} ${coinName}`,
            unWithdrawAmount: `${item.unWithdrawAmount} ${coinName}`,
            unWithdrawUsdtAmount: item.unWithdrawUsdtAmount ? (Math.floor(item.unWithdrawUsdtAmount * 100) / 100).toFixed(2) : item.unWithdrawUsdtAmount,
          };
        });
      }
      if (key === 'withdraw') {
        return [...data].map((item) => {
          const coinName = item.coin.toUpperCase();
          const iconImg = $this.coinList && $this.coinList[coinName] ? $this.coinList[coinName].icon : null;
          // let iconShow;
          // if (iconImg) {
          //   iconShow = [
          //     {
          //       type: 'img',
          //       imgUrl: iconImg,
          //     },
          //     {
          //       text: item.coin,
          //     },
          //   ];
          // } else {
          //   iconShow = coinName;
          // }
          return {
            iconImg,
            coin: coinName,
            withdrawTime: formatTime(item.withdrawTime),
            amount: `${item.amount} ${coinName}`,
            usdtAmount: item.usdtAmount ? (Math.floor(item.usdtAmount * 100) / 100).toFixed(2) : item.usdtAmount,
          };
        });
      }
      return [];
    },
    // 签到任务-签到成功回调
    attendanceSuccess(type) {
      this.getTaskCenterMsg();
      if (type) {
        this.changeType('reward');
      }
    },
    // 任务中心-获取任务列表
    getTaskData(type) {
      let requestUrl = '';
      let taskType = '';
      switch (type) {
        case 'inProgress': requestUrl = 'user_task_info_list'; taskType = undefined; break;
        case 'beginner': requestUrl = 'user_task_info_list'; taskType = 1; break;
        case 'daily': requestUrl = 'user_task_info_list'; taskType = 0; break;
        default: break;
      }
      this.axios({
        url: requestUrl,
        params: {
          type: taskType,
        },
      })
        .then((res) => {
          const taskListMsg = res.data || [];
          this.$set(this.taskData, type, taskListMsg);
        });
    },
    init() {
      this.getTaskCenterMsg();
      this.getTaskData(this.taskState);
      // 监听提现操作
      this.$bus.$on('WITHDRAW_SUCCESS', () => {
        this.getRecordItem('withdraw', 1);
      });
    },
    // 领取奖励
    getRewardSuccess(res) {
      this.showRewardSuccess = true;
      this.reward = {
        count: res.receiveAmount,
        unit: res.rewardCoin,
      };
    },
    closeDialog(key) {
      this.showRewardSuccess = false;
      this.reward = {
        count: undefined,
        unit: undefined,
      };
      if (key) {
        this.changeType('reward');
      }
      // 刷新任务列表
      this.getTaskData(this.taskState);
    },
  },
  watch: {
    isLogin() {
      if (!this.login && this.tabActive === 'reward') {
        this.tabActive = 'task';
      }
      this.getTaskCenterMsg();
      this.getTaskData(this.taskState);
    },
  },
};
