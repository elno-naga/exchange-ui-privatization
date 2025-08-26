import {
  sendVerigicationCode,
} from '@/utils';

export default {
  name: 'modifySettings',
  data() {
    return {
      loading: false,
      // 验证码部分
      checkErrorFlag1: false,
      checkValue1: '',
      checkErrorFlag2: false,
      checkValue2: '',
      promptText3: '',
      checkErrorFlag3: false,
      checkValue3: '',
      promptText4: '',
      checkErrorFlag4: false,
      checkValue4: '',
      disabled: true,
      // 验证框显示隐藏
      smsCode: false,
      originalShow: false,
      googleCode: false,
      // 是否开启资金密码 0 关闭 1 开启
      isCapitalPwordSet: 0,
      isChangeText: 0, // 页面文案显示
      checkErrorFlag5: false,
      checkValue5: '',
      checkValue6: '',
      checkErrorFlag6: false,
      typeList: [],
      verifyShow: false,
      verifyDialogTitle: '',
      confirmLoading: false,
    };
  },
  methods: {
    init() {
      const { userInfo } = this.$store.state.baseData;
      if (userInfo !== null) {
        this.isCapitalPwordSet = userInfo.isCapitalPwordSet;
        this.isChangeText = userInfo.isCapitalPwordSet;
      }
    },
    passwordFlag(val) {
      return this.$store.state.regExp.passWord.test(val);
    },
    codeFlag(val) {
      return this.$store.state.regExp.verification.test(val);
    },
    getCodeClick() {
      this.$bus.$emit('getCode-start', 'phone');
      const info = {
        operationType: (this.isCapitalPwordSet === 0 ? 6 : 7),
      };
      this.$store.dispatch('sendSmsCode', info);
    },
    getEmailCodeClick() {
      this.axios({
        url: 'v4/common/emailValidCode',
        params: { operationType: this.isCapitalPwordSet === 0 ? 6 : 7 },
      }).then((data) => {
        if (data.code.toString() !== '0') {
          setTimeout(() => {
            // 倒计时重置
            this.$bus.$emit('getCode-clear', 'email');
            // tip框提示错误
            this.$bus.$emit('tip', { text: data.msg, type: 'error' });
          }, 2000);
        } else {
          this.$bus.$emit('getCode-start', 'email');
          this.$bus.$emit('tip', { text: this.$t('register.emailSendSuccess'), type: 'success' });
        }
      });
    },
    inputChanges(value, name) {
      switch (name) {
        case 'originalFundCode':
          this.checkValue5 = value;
          if (this.passwordFlag(value)) {
            this.checkErrorFlag5 = false;
          } else {
            this.checkErrorFlag5 = true;
          }
          break;
        case 'password':
          this.checkValue3 = value;
          if (this.passwordFlag(value)) {
            this.checkErrorFlag3 = false;
            if (this.checkValue4 && this.checkValue3 !== this.checkValue4) {
              this.checkErrorFlag4 = true;
            } else {
              this.checkErrorFlag4 = false;
            }
          } else {
            this.checkErrorFlag3 = true;
          }
          break;
        case 'passwordAgain':
          this.checkValue4 = value;
          if (this.checkValue3 === this.checkValue4) {
            this.checkErrorFlag4 = false;
          } else {
            this.checkErrorFlag4 = true;
          }
          break;
        case 'smsCode':
          this.checkValue1 = value;
          if (this.codeFlag(value)) {
            this.checkErrorFlag1 = false;
          } else {
            this.checkErrorFlag1 = true;
          }
          break;
        case 'emailCode':
          this.checkValue6 = value;
          if (this.codeFlag(value)) {
            this.checkErrorFlag6 = false;
          } else {
            this.checkErrorFlag6 = true;
          }
          break;
        default:
          this.checkValue2 = value;
          if (this.codeFlag(value)) {
            this.checkErrorFlag2 = false;
          } else {
            this.checkErrorFlag2 = true;
          }
      }
      if (this.originalFalg) {
        this.disabled = !this.checkValue5;
      }
      if (this.checkValue3 && this.checkValue4
        && this.checkValue3 === this.checkValue4
        && !this.checkErrorFlag3 && !this.checkErrorFlag4
        && !this.checkErrorFlag1 && !this.checkErrorFlag2
        && !this.checkErrorFlag5 && !this.checkErrorFlag6) {
        if (this.typeStr === 'mobile') {
          this.disabled = !this.checkValue1;
        }
        if (this.typeStr === 'google') {
          this.disabled = !this.checkValue2;
        }
        if (this.typeStr === 'email') {
          this.disabled = !this.checkValue6;
        }
        // if (this.googleCode && this.smsCode) {
        //   this.disabled = !(this.checkValue1 && this.checkValue2);
        // }
      } else {
        this.disabled = true;
      }
    },
    btnLink() {
      this.loading = true;
      const info = {
        newCapitalPwd: this.checkValue3,
      };
      if (this.typeStr === 'mobile') {
        info.smsAuthCode = this.checkValue1;
      }
      if (this.typeStr === 'google') {
        info.googleCode = this.checkValue2;
      }
      if (this.typeStr === 'email') {
        info.emailAuthCode = this.checkValue6;
      }
      if (this.originalFalg && this.checkValue5 && !this.checkErrorFlag5) {
        info.capitalPwd = this.checkValue5;
        info.checkOldFlag = 1;// 是否验证旧密码0否1是
      } else {
        info.checkOldFlag = 0;
      }
      this.$store.dispatch('otcCapitalPasswordSet', info);
    },
    // 忘记密码
    onClickForgetPassword() {
      const arr = [];
      if (this.userInfo.googleStatus) {
        arr.push('google');
      }
      if (this.userInfo.isOpenMobileCheck) {
        arr.push('mobile');
      } else {
        arr.push('email');
      }
      this.typeList = arr;
      this.verifyShow = true;
      this.verifyDialogTitle = this.$t('assets.addressMent.safetyVerification');
    },
    verifyDialogClose() {
      this.clearDialogData();
    },
    clearDialogData() {
      this.verifyShow = false;
      this.typeList = [];
      this.verifyDialogTitle = '';
      this.confirmLoading = false;
    },
    // eslint-disable-next-line consistent-return
    verifyDialogConfirm(item) {
      if (!item) {
        return false;
      }
      const obj = {};
      if (item) {
        if (item.fundCode) {
          obj.capitalPassword = item.fundCode;
        }
        if (item.google) {
          obj.googleCode = item.google;
        }
        if (item.mobile) {
          obj.smsAuthCode = item.mobile;
        }
        if (item.email) {
          obj.emailAuthCode = item.email;
        }
      }
      this.confirmLoading = true;
      this.axios({
        url: 'capital_password/forget',
        method: 'post',
        params: {
          ...obj,
        },
      }).then((data) => {
        this.confirmLoading = false;
        if (data.code.toString() === '0') {
          this.isCapitalPwordSet = 0;
          this.isChangeText = 1;
          // this.$store.dispatch('getUserInfo');
          this.clearDialogData();
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
  },
  computed: {
    promptText1() { return this.$t('personal.label.smsCodeText'); },
    errorText1() { return this.$t('assets.withdraw.phoneCodeError'); },
    promptText2() { return this.$t('personal.label.googleCodeText'); },
    promptText6() { return this.$t('personal.label.emailCodeText'); },
    errorText2() { return this.$t('assets.addressMent.googleCodeError'); },
    errorText3() { return this.$t('personal.prompt.errorPasswordText'); },
    errorText4() { return this.$t('personal.prompt.errorPasswordTwo'); },
    errorText5() { return this.$t('personal.prompt.errorPasswordText'); },
    errorText6() { return this.$t('login.emailCodeError'); },
    originalFalg() {
      return this.isCapitalPwordSet !== 0;
    },
    enforceGoogleAuth() {
      return this.$store.state.baseData.is_enforce_google_auth || 0;
    },
    moneyPassword() {
      if (this.isChangeText === 0) {
        return this.$t('personal.modifySettings.setTitle');
      }
      return this.$t('personal.label.oldMoneyPassword');
    },
    confirmMoneyPassword() {
      if (this.isChangeText === 0) {
        return this.$t('personal.label.confirmMoneyPassword');
      }
      return this.$t('personal.label.newConfirmMoneyPassword');
    },
    sendSmsCode() {
      return this.$store.state.personal.sendSmsCode;
    },
    otcCapitalPasswordSet() {
      return this.$store.state.personal.otcCapitalPasswordSet;
    },
    userInfo() {
      return this.$store.state.baseData.userInfo;
    },
    typeStr() {
      let str = '';
      if (this.userInfo) {
        if (this.userInfo.googleStatus) {
          str = 'google';
        } else if (this.userInfo.isOpenMobileCheck) {
          str = 'mobile';
        } else {
          str = 'email';
        }
      }
      return str;
    },
    update_safe_withdraw() {
      return this.$store.state.baseData.update_safe_withdraw;
    },
    sendCodeType() {
      return sendVerigicationCode.forgetFundCode;
    },
  },
  watch: {
    sendSmsCode(sendSmsCode) {
      if (sendSmsCode !== null) {
        if (sendSmsCode.text === 'success') {
          this.$bus.$emit('tip', { text: this.$t('assets.withdraw.phoneSendSuccess'), type: 'success' });
          this.$store.dispatch('resetType');
        } else {
          this.$bus.$emit('tip', { text: sendSmsCode.msg, type: 'error' });
          this.$store.dispatch('resetType');
          this.$bus.$emit('getCode-clear', 'phone');
        }
      }
    },
    otcCapitalPasswordSet(otcCapitalPasswordSet) {
      if (otcCapitalPasswordSet !== null) {
        this.loading = false;
        if (otcCapitalPasswordSet.text === 'success') {
          this.$bus.$emit('tip', { text: otcCapitalPasswordSet.msg, type: 'success' });
          this.$store.dispatch('resetType');
          this.$router.push('/personal/userManagement');
        } else {
          this.$bus.$emit('tip', { text: otcCapitalPasswordSet.msg, type: 'error' });
          this.$store.dispatch('resetType');
          this.$bus.$emit('getCode-clear', 'phone');
        }
      }
    },
    userInfo(userInfo) {
      if (userInfo !== null) {
        this.isCapitalPwordSet = userInfo.isCapitalPwordSet;
        this.isChangeText = userInfo.isCapitalPwordSet;
      }
    },
  },
};
