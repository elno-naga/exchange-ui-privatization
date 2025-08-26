// import { formatTime } from 'BlockChain-ui/utils';
import Clipboard from 'clipboard';
import {
  fixD, colorMap, getIconPath, imgMap, formatTimeFn,
} from '@/utils';

export default {
  name: 'promotionIndex',
  data() {
    return {
      colorMap,
      getIconPath,
      imgMap,
      rewardAmount: '11 USDT',
      unit: 'USDT',
      basic_data: {
        headingText: '', // 标题
        subheadingText: '', // 副标题

        inviteCode: '', // 邀请码
        inviteQECode: '', // 邀请码图片
        inviteUrl: '', // 邀请链接
        showInviteUrl: '', // 剪裁后的url

        // mobileNum: '', // 账户手机号
        inviteUserDirectCount: 0, // 邀请好友人数
        inviteUserSubOneCount: 0, // 下级邀请人数
        inviteUserSubTwoCount: 0, // 下2级邀请人数
        inviteRewardUsdtSum: 0, // 当前用户邀请奖励（折算usdt）
        topReferrerRewardAmount: 0, // 顶级推荐人奖励金额
        rankedOpen: false, // 排行榜
        config: {
          pcHeaderIndexImg: 'https://s3.ap-northeast-1.amazonaws.com/chainup-test/Friend_banner.png', // 首页banner图
          faceToFaceImg: 'https://s3.ap-northeast-1.amazonaws.com/chainup-test/face_to.png',
        }, // 页面配置
      },
      condition: {
        activityDays: 0, // 生效时间
        needAuth: 0, // 奖励达成条件 0:不需要实名认证  1：需要实名认证
        depositAmount: 0, // 奖励达成条件：累计充值金额
        depositSymbol: '', // 奖励达成条件：累计充值币种
        tradeAmount: 0, // 奖励达成条件：累计交易金额/累计交易量
        tradeSymbol: '', // 奖励达成条件：交易币对
        invitationUserRewardAmountStr: 0, // 邀请者奖励金额
        invitationLevelOneRewardAmountStr: 0, // 邀请者上一级奖励金额
        invitationLevelTwoRewardAmountStr: 0, // 邀请者上两级奖励金额
        registeredUserRewardAmountStr: 0, // 注册者奖励金额
        rewardCoin: '', // 奖励币种
        sendType: null, // 发放返佣奖励类型：0:系统自动发放  1:T+1发放
        tradeType: 0, // 1截取前面。2截取后面
        tradeSymbolSplitByType: '',
      },
      pagination: {
        // 翻页数据
        count: 0, // 总数量
        pageSize: 10, // 每页显示条数
        page: 1, // 当前页数
      },
      detailsType: 'invitation',
      dataList: [],
      tableLoading: true,
      cellHeight: 56,
      showInviteFlag: false,
      showRankingFlag: false,
      showCodeFlag: false,
    };
  },
  computed: {
    detailsTypeList() {
      const arr = [
        {
          title: this.$t('inviteFriends.invite_myInvite'), // 当前委托
          value: 'invitation',
        },
        {
          title: this.$t('inviteFriends.invite_inviteRewards'), // 当前委托
          value: 'inviteRewards',
        },
      ];
      return arr;
    },
    // 全部币种列表
    coinList() {
      if (this.$store.state.baseData && this.$store.state.baseData.market) {
        return this.$store.state.baseData.market.coinList;
      }
      return null;
    },
    usdtPre() {
      if (this.coinList && this.coinList.USDT) {
        return this.coinList.USDT.showPrecision;
      }
      return 2;
    },
    // 表头
    columns() {
      if (this.detailsType === 'inviteRewards') {
        return [
          {
            title: this.$t('inviteFriends.invite_text23'), // 发放时间
            key: 'time',
            classes: 'text-2-cl',
          },
          {
            title: this.$t('inviteFriends.invite_text24'), // 注册账号
            key: 'account',
            classes: 'text-2-cl',
          },
          {
            title: this.$t('inviteFriends.invite_text25'), // 奖励数量
            key: 'amount',
            classes: 'text-2-cl',
          },
          {
            title: this.$t('inviteFriends.invite_text26'), // USDT估值
            key: 'volume',
            classes: 'text-2-cl',
          },
        ];
      }
      const arr = [
        {
          title: this.$t('inviteFriends.invite_text17'), // 被邀请人UID
          key: 'levelZeroRegisterUid',
          classes: 'text-2-cl',
        },
        {
          title: this.$t('inviteFriends.invite_text18'), // 被邀请人账号
          key: 'levelZeroRegisterAccount',
          classes: 'text-2-cl',
        },
        {
          title: this.$t('inviteFriends.invite_text19'), // 类型
          key: 'levelStr',
          classes: 'text-2-cl',
        }, {
          title: this.$t('inviteFriends.invite_text20'), // 邀请人UID
          key: 'levelOneInvitationUid',
          classes: 'text-2-cl',
        },
        {
          title: this.$t('inviteFriends.invite_text21'), // 邀请人账号
          key: 'levelOneInvitationAccount',
          classes: 'text-2-cl',
        },
        {
          title: this.$t('inviteFriends.invite_text22'), // 注册日期
          key: 'time',
          classes: 'text-2-cl',
        },
      ];
      // const one = this.condition.invitationLevelOneRewardAmountStr;
      // const two = this.condition.invitationLevelTwoRewardAmountStr;
      // if (one && Number(one) >= 0 && two && Number(two)) {
      //   arr = [...arr, {
      //     title: this.$t('inviteFriends.invite_text19'), // 类型
      //     key: 'levelStr',
      //   }, {
      //     title: this.$t('inviteFriends.invite_text20'), // 邀请人UID
      //     key: 'levelOneInvitationUid',
      //   },
      //   {
      //     title: this.$t('inviteFriends.invite_text21'), // 邀请人账号
      //     key: 'levelOneInvitationAccount',
      //   }];
      // }
      // arr.push({
      //   title: this.$t('inviteFriends.invite_text22'), // 注册日期
      //   key: 'time',
      // });
      return arr;
    },
    // 是否Login
    isLogin() {
      return this.$store.state.baseData.isLogin;
    },
    // 用户信息
    userInfo() {
      return this.$store.state.baseData.userInfo;
    },
    // market 接口
    market() {
      return this.$store.state.baseData.market;
    },
    lan() {
      if (this.$store.state.baseData) {
        return this.$store.state.baseData.lan;
      }
      return null;
    },
    // 奖励发放条件 - 是否显示
    rewardConditions() {
      let bol = true;
      if (!this.condition.needAuth && this.condition.depositAmount <= 0 && this.condition.tradeAmount <= 0) {
        bol = false;
      }
      return bol;
    },

  },
  methods: {
    async init() {
      const tempData = await this.getData();
      const conditionData = await this.getConditions(); // 请求奖励达成条件
      this.getDetailsData();
      let tradeSymbolone = '';
      let tradeSymboltwo = '';
      if (conditionData && conditionData.tradeSymbol.indexOf('/') !== -1) {
        const tradeSymbol = conditionData.tradeSymbol.split('/');
        if (conditionData.tradeType === 1) {
          [, conditionData.tradeSymbolSplitByType] = tradeSymbol;
        } else if (conditionData.tradeType === 2) {
          [conditionData.tradeSymbolSplitByType] = tradeSymbol;
        }
        tradeSymbolone = this.showRewardCoin(tradeSymbol[0]);
        tradeSymboltwo = this.showRewardCoin(tradeSymbol[1]);
      }
      this.condition = { ...conditionData, tradeSymbol: tradeSymbolone ? `${tradeSymbolone}/${tradeSymboltwo}` : '' } || this.condition;
      // tempData.config.posterOneImg = '';
      if (tempData.inviteUrl) {
        tempData.showInviteUrl = `${tempData.inviteUrl.substring(0, 12)}...${
          tempData.inviteUrl.substring(tempData.inviteUrl.length - 8, tempData.inviteUrl.length)
        }`;
      }
      if (!tempData.config) {
        tempData.config = {
          id: '',
          langKey: '',
          appBannerImg: '',
          pcHeaderIndexImg: '',
          faceToFaceImg: '',
          posterOneImg: '',
          posterTwoImg: '',
          headingText: '',
          subheadingText: '',
          invitationRuleUrl: '',
          ctime: '',
          mtime: '',
          operator: '',
          brokerId: '',
        };
      }
      this.basic_data = {
        ...tempData,
        inviteUserSubOneCount: tempData.inviteUserSubOneCount ? tempData.inviteUserSubOneCount : 0,
        inviteUserSubTwoCount: tempData.inviteUserSubTwoCount ? tempData.inviteUserSubTwoCount : 0,
      };
      if (!tempData.config.pcHeaderIndexImg) {
        this.basic_data.config.pcHeaderIndexImg = 'https://s3.ap-northeast-1.amazonaws.com/chainup-test/Friend_banner.png';
      }
      if (!tempData.config.faceToFaceImg) {
        this.basic_data.config.faceToFaceImg = 'https://s3.ap-northeast-1.amazonaws.com/chainup-test/face_to.png';
      }
      if (!this.isLogin) this.tableLoading = false;

      // 邀请总览保留两位小数
      this.basic_data.inviteRewardUsdtSum = this.basic_data.inviteRewardUsdtSum ? fixD(this.basic_data.inviteRewardUsdtSum, this.usdtPre) : 0;
      this.basic_data.topReferrerRewardAmount = this.basic_data.topReferrerRewardAmount ? fixD(this.basic_data.topReferrerRewardAmount, this.usdtPre) : 0;
    },
    // 请求页面基本数据
    getData() {
      return new Promise((resolve) => {
        this.axios({
          url: 'invitation/publicConfig',
          params: {},
          method: 'post',
        }).then((data) => {
          if (data.code.toString() === '0') {
            resolve(data.data);
          }
        });
      });
    },
    // 请求邀请奖励数据(发放条件等)
    getConditions() {
      return new Promise((resolve) => {
        this.axios({
          url: 'invitation/rewardConfig',
          params: {},
          method: 'post',
        }).then((data) => {
          if (data.code.toString() === '0') {
            resolve(data.data || {});
          }
        });
      });
    },
    httpPostDetailsData(type) {
      const reqUrl = type === 'invitation'
        ? 'invitation/myInvitations'
        : 'invitation/myInvitationRewards';
      return new Promise((resolve) => {
        this.axios({
          url: reqUrl,
          params: {
            page: this.pagination.page,
            pageSize: this.pagination.pageSize,
          },
          method: 'post',
        }).then((data) => {
          if (data.code.toString() === '0') {
            resolve(data.data);
          }
        });
      });
    },
    // 请求邀请详情数据(表格)
    async getDetailsData() {
      const tempData = await this.httpPostDetailsData(this.detailsType);
      const fix = this.conFix();
      this.tableLoading = false;
      this.pagination.count = tempData.count; // 邀请详情表格；
      if (this.detailsType === 'inviteRewards') {
        if (!tempData.rewardList.length) {
          this.dataList = [];
          return;
        }
        this.dataList = tempData.rewardList.map((item) => ({
          time: formatTimeFn(item.sendTime, 'YYYY-MM-DD HH:MM'),
          account: item.userAccountNum,
          amount: `${item.rewardAmount} ${item.rewardCoin ? this.showRewardCoin(item.rewardCoin) : ''}`,
          volume: `${Number(fixD(item.conversionAmount, fix))} USDT`,
        }));
      } else if (this.detailsType === 'invitation') {
        if (!tempData.invitationList.length) {
          this.dataList = [];
          return;
        }
        this.dataList = tempData.invitationList.map((item) => ({
          levelZeroRegisterUid: item.levelZeroRegisterUid,
          levelOneInvitationUid: item.levelOneInvitationUid,
          levelZeroRegisterAccount: item.levelZeroRegisterAccount,
          levelOneInvitationAccount: item.levelOneInvitationAccount,
          account: item.mobileNumber,
          levelStr: item.levelStr,
          time: item.registerTime ? formatTimeFn(Number(item.registerTime), 'YYYY-MM-DD HH:MM') : '',
        }));
      }
    },
    conFix() {
      let fix = 0;
      if (this.market && this.market.coinList && this.market.coinList.USDT) {
        fix = this.market.coinList.USDT.showPrecision;
      }
      return Number(fix);
    },
    showRewardCoin(val) {
      let bol = val;
      if (this.coinList) {
        bol = this.coinList[val] ? this.coinList[val].showName : val;
      }
      return bol;
    },
    // 翻页事件
    pagechange(num) {
      this.pagination.page = num;
      this.tableLoading = true;
      this.getDetailsData();
    },
    changeTable(obj) {
      this.detailsType = obj.value;
      this.pagination.count = 0;
      this.pagination.pageSize = 10;
      this.pagination.page = 1;
      this.tableLoading = true;
      this.getDetailsData();
    },
    copyUrl() {
      const clipboard = new Clipboard('.copy-node');
      clipboard.on('success', () => {
        this.$bus.$emit('tip', {
          text: this.$t('personal.prompt.copySucces'),
          type: 'success',
        });
        // 释放内存
        clipboard.destroy();
      });
      clipboard.on('error', () => {
        // 不⽀持复制
        this.$bus.$emit('tip', {
          text: this.$t('inviteFriends.invite_text36'),
          type: 'error',
        });
        // 释放内存
        clipboard.destroy();
      });
    },
    // 查看奖励注册规则说明
    openLink() {
      if (this.basic_data.config.invitationRuleUrl) {
        window.open(this.basic_data.config.invitationRuleUrl, '_blank');
      }
    },
    // 打开邀请好友
    openInviteModal() {
      this.showInviteFlag = true;
    },
    openRankingModal() {
      this.showRankingFlag = true;
    },
    openCodeModal() {
      this.showCodeFlag = true;
    },
  },
};
