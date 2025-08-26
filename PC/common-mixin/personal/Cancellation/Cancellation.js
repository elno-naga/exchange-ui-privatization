import { imgMap, fixD, getCookie } from '@/utils';

export default {
  name: 'cancellation',
  data() {
    return {
      imgMap,
      cancellationTip: imgMap.cancellationTip,
      balance: '0.001', // 账户余额
      understand: false, // 是否同意注销
      totalBalance: 0, // 总资产
      loading: false,

      requirementDialogVisible: false, // 账号检测弹框
      // isMeets: false, // 是否满足账号注销
      dialogConfirmLoading: false, // 注销中
      isSpot: true, // 现货 是否符合要求
      isMargin: true, // 杠杆 是否符合要求
      isFutures: true, // 合约 是否符合要求
      isFiat: true, // 法币 是否符合要求
      isWallet: true, // 账户总资产 是否符合要求

      verificationDialogVisible: false, //  F2A验证弹框
      deleteAccountLoading: false, // 验证中
      phoneValue: '', // 手机验证码
      googleValue: '', // google验证码
      emailValue: '', // 邮箱验证码

    };
  },
  computed: {
    linkurl() {
      if (this.$store.state.baseData.publicInfo) {
        return this.$store.state.baseData.publicInfo.url;
      }
      return {};
    },
    leverOpen() {
      return this.$store.state.baseData.lever_open;
    },
    saasOtcFlowConfig() {
      let flag = false;
      if (this.publicInfo && this.publicInfo.switch
        && this.publicInfo.switch.saas_otc_flow_config
        && this.publicInfo.switch.saas_otc_flow_config.toString() === '1') {
        flag = true;
      }
      return flag;
    },
    otcOpen() {
      return this.linkurl.otcUrl || this.saasOtcFlowConfig;
    },
    // market 接口
    market() {
      return this.$store.state.baseData.market;
    },
    cusSkin() {
      return getCookie('cusSkin');
    },
    // 注销按钮是否可以点击
    dialogConfirmDisabled() {
      return !(this.isSpot && this.isMargin && this.isFutures && this.isFiat && this.isWallet);
    },
    // phoneValue 是否复合正则验证
    phoneValueFlag() {
      return this.$store.state.regExp.verification.test(this.phoneValue);
    },
    // googleValue 是否复合正则验证
    googleValueFlag() {
      return this.$store.state.regExp.verification.test(this.googleValue);
    },
    // emailValue 是否复合正则验证
    emailValueFlag() {
      return this.$store.state.regExp.verification.test(this.emailValue);
    },
    phoneError() {
      if (this.phoneValue.length !== 0 && !this.phoneValueFlag) return true;
      return false;
    },
    googleError() {
      if (this.googleValue.length !== 0 && !this.googleValueFlag) return true;
      return false;
    },
    emailError() {
      if (this.emailValue.length !== 0 && !this.emailValueFlag) return true;
      return false;
    },
    // 验证提交按钮是否可以点击
    deleteAccountDisabled() {
      let phone = true;
      let google = true;
      let email = true;
      if (this.OpenMobile) {
        phone = this.phoneValueFlag;
      }
      if (this.OpenGoogle) {
        google = this.googleValueFlag;
      }
      if (this.OpenEmail) {
        email = this.emailValueFlag;
      }
      if ((phone && google && email) || this.deleteAccountLoading) {
        return false;
      }
      return true;
    },
    // 用户是否开启手机
    OpenMobile() {
      let flag = false;
      const { userInfo } = this.$store.state.baseData;
      if (userInfo && userInfo.isOpenMobileCheck.toString() === '1') {
        flag = true;
      }
      return flag;
    },
    // 用户是否开启谷歌
    OpenGoogle() {
      let flag = false;
      const { userInfo } = this.$store.state.baseData;
      if (userInfo && userInfo.googleStatus.toString() === '1') {
        flag = true;
      }
      return flag;
    },
    // 用户是否开启邮箱
    OpenEmail() {
      let flag = false;
      const { userInfo } = this.$store.state.baseData;
      if (userInfo && userInfo.email) {
        flag = true;
      }
      return flag;
    },
    // 语音短信开关
    voiceSmsOpen() {
      // return this.$store.state.baseData.voiceSmsOpen;
      return true;
    },

  },
  methods: {
    init() {
      this.getTotalAssets();
    },
    // 千分符
    thousands(num) {
      if (num && parseFloat(num)) {
        const str = num.toString();
        const reg = str.indexOf('.') > -1 ? /(\d)(?=(\d{3})+\.)/g : /(\d)(?=(?:\d{3})+$)/g;
        return str.replace(reg, '$1,');
      }
      return num;
    },
    // 获取总资产
    getTotalAssets() {
      this.loading = true;
      this.axios({
        url: 'finance/total_account_balance',
      }).then(({ code, data, msg }) => {
        this.loading = false;
        if (code.toString() === '0') {
          const {
            totalbalance,
          } = data;
          const { coinList } = this.market;
          const fix = coinList.BTC.showPrecision;
          this.totalBalance = this.thousands(fixD(totalbalance, fix));
        } else {
          this.$bus.$emit('tip', { text: msg, type: 'error' });
        }
      });
    },
    inputChange(v, name) {
      this[name] = v;
    },
    // 发送短信验证码
    sendSmsCode() {
      this.axios({
        url: 'v4/common/smsValidCode',
        params: { operationType: '301' },
      }).then((data) => {
        if (data.code.toString() !== '0') {
          setTimeout(() => {
            // 倒计时重置
            this.$bus.$emit('getCode-clear', 'cancellationSmsCode');
            // tip框提示错误
            this.$bus.$emit('tip', { text: data.msg, type: 'error' });
          }, 2000);
        } else {
          this.$bus.$emit('tip', { text: this.$t('assets.withdraw.phoneSendSuccess'), type: 'success' });
        }
      });
    },
    // 发送邮箱验证码
    sendEmailCode() {
      this.axios({
        url: 'v4/common/emailValidCode',
        params: { operationType: '30' },
      }).then((data) => {
        if (data.code.toString() !== '0') {
          setTimeout(() => {
            // 倒计时重置
            this.$bus.$emit('getCode-clear', 'cancellationEmailCode');
            // tip框提示错误
            this.$bus.$emit('tip', { text: data.msg, type: 'error' });
          }, 2000);
        } else {
          this.$bus.$emit('tip', { text: this.$t('assets.withdraw.phoneSendSuccess'), type: 'success' });
        }
      });
    },
    // 是否同意注销
    handleUnderstand() {
      this.understand = !this.understand;
    },
    // 账号检测
    handleAccountDetection() {
      this.axios({
        url: 'cancellation/verification',
      }).then((data) => {
        if (data.code.toString() === '0') {
          this.isSpot = data.data.verifyGeneralOrder.toString() === '1';
          this.isMargin = data.data.verifyLeverOrder.toString() === '1';
          this.isFutures = data.data.verifyContract.toString() === '1';
          this.isFiat = data.data.verifyOutboundTransaction.toString() === '1';
          this.isWallet = data.data.verifyAssets.toString() === '1';
          this.requirementDialogVisible = true;
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
    // 注销账号
    handleAccountCancellation() {
      this.requirementDialogVisible = false;
      this.verificationDialogVisible = true;
    },
    handleDeleteAccount() {
      this.axios({
        url: 'user/deleteAccount',
        method: 'post',
        params: {
          smsAuthCode: this.phoneValue,
          emailAuthCode: this.emailValue,
          googleCode: this.googleValue,
        },
      }).then((data) => {
        if (data.code.toString() === '0') {
          this.$bus.$emit('tip', { text: data.msg, type: 'success' });
          this.verificationDialogVisible = false;
          // 跳转首页
          let home = '';
          if (process.env.NODE_ENV === 'development') {
            home = '/ex/';
          }
          if (this.$store.state.baseData && this.$store.state.baseData.publicInfo) {
            const linkurl = this.$store.state.baseData.publicInfo.url;
            home = linkurl.exUrl ? `${linkurl.exUrl}/` : '/';
          }
          window.location.href = home;
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
    closeRequirement() {
      this.requirementDialogVisible = false;
    },
    closeVerification() {
      this.verificationDialogVisible = false;
    },
  },
};
