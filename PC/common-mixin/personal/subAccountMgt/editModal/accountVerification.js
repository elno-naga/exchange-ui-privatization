export default {
  name: 'accountVerify',
  data() {
    return {
      subCode: '',
      momCode: '',
      verifyDialogLoading: false,
      smsType: 'sms', // 短信类型
    };
  },
  methods: {
    init() {
      // console.log('curRow', this.curRow);
      // console.log('formData', this.formData);
    },
    changeFlag() {
      this.$emit('close');
    },
    inputChange(value, name) {
      this[name] = value;
    },
    verifyConfirm() {
      if (!this.subCode || !this.momCode) return;
      if (this.subError || this.momError) return;
      this.verifyDialogLoading = true;
      const req = this.formData;
      req.subUserEmailCode = this.subCode;
      if (this.verifyType === '1') {
        req.googleCode = this.momCode;
      } else if (this.verifyType === '2') {
        if (this.smsType === 'sms') {
          req.smsCode = this.momCode;
        } else {
          req.smsCode = this.momCode;
        }
      } else {
        req.emailCode = this.momCode;
      }
      this.axios({
        url: this.getUrl,
        params: req,
        method: 'post',
      }).then((resp) => {
        this.verifyDialogLoading = false;
        if (resp.code.toString() === '0') {
          this.$emit('confirm');
          // 操作成功
          this.$bus.$emit('tip', { text: this.$t('subAccount.common.message2'), type: 'success' });
        } else {
          this.$bus.$emit('tip', { text: resp.msg, type: 'error' });
        }
      });
    },
    isShowPwd(flag) {
      this.pwdFlag = flag;
    },
    // 获取验证码
    getCodeClick(name, type) {
      this.sendSmsCode(name, type);
    },
    // 邮箱验证码
    getEmailCodeClick(num) {
      const req = {
        operationType: num,
      };
      if (num === '221') {
        if (this.optionType === 'edit') {
          req.email = this.curRow.email;
        } else {
          req.email = this.formData.subUserEmail;
        }
      }
      this.axios({
        url: 'v4/common/emailValidCode',
        params: req,
      }).then((data) => {
        if (data.code.toString() !== '0') {
          setTimeout(() => {
            // 倒计时重置
            this.$bus.$emit('getCode-clear', 'verifyGetEmailCode');
            // tip框提示错误
            this.$bus.$emit('tip', { text: data.msg, type: 'error' });
          }, 2000);
        } else {
          this.$bus.$emit('tip', {
            text: this.$t('register.emailSendSuccess'),
            type: 'success',
          });
        }
      });
    },
    // 发送短信验证码
    sendSmsCode(name, type) {
      this.axios({
        url: 'v4/common/smsValidCode',
        params: {
          operationType: '220',
          smsType: type && type === 'voiceSms' ? '1' : '0',
        },
      }).then((data) => {
        if (data.code.toString() !== '0') {
          setTimeout(() => {
            // 倒计时重置
            this.$bus.$emit('getCode-clear', 'verifyGetCode');
            // tip框提示错误
            this.$bus.$emit('tip', { text: data.msg, type: 'error' });
          }, 2000);
        } else {
          const successText = type && type === 'voiceSms'
            ? this.$t('login.voiceSendSuccess')
            : this.$t('login.phoneSendSuccess');
          this.$bus.$emit('tip', { text: successText, type: 'success' });
          this.smsType = type === 'sms' ? 'sms' : 'voiceSms';
        }
      });
    },
  },
  computed: {
    userInfo() { return this.$store.state.baseData.userInfo; },
    userText() {
      if (this.userInfo) {
        return this.userInfo.userAccount;
      }
      return '';
    },
    getUrl() {
      let str = '';
      switch (this.optionType) {
        case 'add':
          str = this.$store.state.url.subAccount.addSub_confirm;
          break;
        case 'edit':
          str = this.$store.state.url.subAccount.addSub_editPwd;
          break;
        case 'email':
          str = this.$store.state.url.subAccount.addSub_editEmail;
          break;
        default:
          str = '';
      }
      return str;
    },
    regExps() {
      return this.$store.state.regExp;
    },
    // 语音短信开关
    voiceSmsOpen() {
      return this.$store.state.baseData.voiceSmsOpen;
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
    // 母账户验证 是否复合正则验证
    momValueFlag() { return this.$store.state.regExp.verification.test(this.momCode); },
    momError() {
      if (this.momCode.length !== 0 && !this.momValueFlag) return true;
      return false;
    },
    // 子账户验证 是否复合正则验证
    subValueFlag() { return this.$store.state.regExp.verification.test(this.subCode); },
    subError() {
      if (this.subCode.length !== 0 && !this.subValueFlag) return true;
      return false;
    },
    verifyType() {
      let str = '1';
      // 1谷歌  2手机  3邮箱
      if (!this.OpenGoogle && this.OpenMobile) {
        str = '2';
      } else if (!this.OpenGoogle && !this.OpenMobile) {
        str = '3';
      }
      return str;
    },
    getErrorPromptText() {
      let str = '';
      switch (this.verifyType) {
        case '1':
          str = this.$t('login.googleCodeError'); // 请输入6位数字谷歌验证码
          break;
        case '2':
          str = this.$t('login.phoneCodeError'); // 请输入手机验证码
          break;
        case '3':
          str = this.$t('login.emailCodeError'); // 请输入6位数字邮箱验证码
          break;
        default:
          str = this.$t('login.codeError'); // 请输入6位数字验证码
      }
      return str;
    },
    getVerifyPromptText() {
      let str = '';
      switch (this.verifyType) {
        case '1':
          str = this.$t('subAccount.common.verifiy_p1'); // 请输入谷歌验证码
          break;
        case '2':
          str = this.$t('subAccount.common.verifiy_p2'); // 请输入手机验证码
          break;
        case '3':
          str = this.$t('subAccount.common.verifiy_p3'); // 请输入收到的6位数验证码
          break;
        default:
          str = '';
      }
      return str;
    },
    getVerifyTitleText() {
      let str = '';
      switch (this.verifyType) {
        case '1':
          str = this.$t('subAccount.common.verifiy_t1'); // 谷歌验证
          break;
        case '2':
          str = this.$t('subAccount.common.verifiy_t2'); // 手机验证
          break;
        case '3':
          str = this.$t('subAccount.common.verifiy_t3'); // 邮箱验证
          break;
        default:
          str = '';
      }
      return str;
    },
  },
};
