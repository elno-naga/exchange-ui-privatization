import { colorMap } from '@/utils';

export default {
  name: 'addAccount',
  data() {
    return {
      colorMap,
      dialogConfirmLoading: false, // 添加子账户弹窗确认loading
      addEmailTypeList: [
        // 新增子账户邮箱类型
        {
          value: this.$t('subAccount.subAcc.add_type1'), // 邮箱创建
          code: 1,
        },
        {
          value: this.$t('subAccount.subAcc.add_type2'), // 虚拟邮箱创建
          code: 0,
        },
      ],
      pwdShowFlag: true, // 密码显示隐藏（控制小眼睛）
      addEmailType: 1, // 添加子账户-邮箱类型 1邮箱 0虚拟
      addEmail: '', // 添加子账户-邮箱
      addPassword: '', // 添加子账户-密码
      addConfirmPwd: '', // 添加子账户-确认密码
      addVirtualEmail: '', // 添加子账户-虚拟邮箱账户
      addVirtualCode: '', // 添加子账户-母账户验证码
      addFromError: {
        virtualEmailErrorFlag: false, // 添加子账户-虚拟邮箱是否错误提示
        emailError: this.$t('subAccount.subAcc.error1'), // 添加子账户-邮箱错误文案
        pwdError: this.$t('subAccount.subAcc.error2'), // 添加子账户-密码错误文案
        confirmPwdError: this.$t('subAccount.subAcc.error3'), // 添加子账户-确认密码错误文案
      },
      emailIsExists: false,
      smsType: 'sms', // 短信类型
    };
  },
  methods: {
    init() {
      this.addEmailType = 1;
    },
    // 是否显示隐藏密码
    hidePwd() {
      this.pwdShowFlag = !this.pwdShowFlag;
    },
    // 检查邮箱是否存在
    checkedEmail() {
      if (!this.addEmail || this.addEmailErrorFlag) return;
      const req = {
        subUserEmail: this.addEmail,
        loginType: this.addEmailType,
      };
      this.axios({
        url: this.$store.state.url.subAccount.addSub_checkEmail,
        params: req,
        method: 'post',
      }).then((data) => {
        if ((data.code).toString() === '0') {
          this.emailIsExists = false;
        } else {
          this.emailIsExists = true;
        }
      });
    },
    // 确认添加
    addAccountConfirm() {
      if (this.addEmailType) {
        if (
          this.confirmPwdErrorFlag
          || this.emailIsExists
          || this.addEmailErrorFlag
          || this.pwdErrorFlag
          || !this.addConfirmPwd
        ) { return; }
        const req = {
          subUserEmail: this.addEmail,
          loginType: this.addEmailType,
          password: this.addConfirmPwd,
        };
        this.$emit('confirm', req);
      } else {
        if (
          !this.addVirtualEmail
          || !this.addVirtualCode
          || this.momError
        ) { return; }
        this.dialogConfirmLoading = true;
        const req = {
          subUserEmail: this.addVirtualEmail,
          loginType: this.addEmailType,
        };
        if (this.verifyType === '1') req.googleCode = this.addVirtualCode;
        if (this.verifyType === '2' && this.smsType === 'sms') req.smsCode = this.addVirtualCode;
        if (this.verifyType === '2' && this.smsType === 'voiceSms') req.smsCode = this.addVirtualCode;
        if (this.verifyType === '3') req.emailCode = this.addVirtualCode;
        this.axios({
          url: this.$store.state.url.subAccount.addSub_confirm,
          params: req,
          method: 'post',
        }).then((resp) => {
          this.dialogConfirmLoading = false;
          if (resp.code.toString() === '0') {
            this.$emit('confirm', req);
            // 操作成功
            this.$bus.$emit('tip', { text: this.$t('subAccount.common.message2'), type: 'success' });
          } else {
            this.$bus.$emit('tip', { text: resp.msg, type: 'error' });
          }
        });
      }
    },
    changeFlag() {
      this.$emit('close');
    },
    inputChange(value, name) {
      if (name === 'addEmailType') {
        this.emailIsExists = false;
      }
      if (name === 'addEmail') {
        if (!value) this.emailIsExists = false;
      }
      this[name] = value;
    },
    // 选择币种
    selectChange(item, name) {
      this[name] = item.code;
    },
    // 邮箱验证码
    getEmailCodeClick() {
      this.axios({
        url: 'v4/common/emailValidCode',
        params: {
          operationType: '220',
        },
      }).then((data) => {
        if (data.code.toString() !== '0') {
          setTimeout(() => {
            // 倒计时重置
            this.$bus.$emit('getCode-clear', 'virtualGetEmailCode');
            // tip框提示错误
            this.$bus.$emit('tip', { text: data.msg, type: 'error' });
          }, 2000);
        } else {
          this.$bus.$emit('tip', { text: this.$t('register.emailSendSuccess'), type: 'success' });
        }
      });
    },
    // 获取验证码
    getCodeClick(name, type) {
      this.sendSmsCode(name, type);
    },
    // 发送验证码
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
            this.$bus.$emit('getCode-clear', 'virtualGetCode');
            // tip框提示错误
            this.$bus.$emit('tip', { text: data.msg, type: 'error' });
          }, 2000);
        } else {
          const successText = type && type === 'voiceSms' ? this.$t('login.voiceSendSuccess') : this.$t('login.phoneSendSuccess');
          this.$bus.$emit('tip', { text: successText, type: 'success' });
          this.smsType = type === 'sms' ? 'sms' : 'voiceSms';
        }
      });
    },
  },
  computed: {
    // 母账户验证 是否复合正则验证
    momValueFlag() { return this.$store.state.regExp.verification.test(this.addVirtualCode); },
    momError() {
      if (this.addVirtualCode.length !== 0 && !this.momValueFlag) return true;
      return false;
    },
    regExps() {
      return this.$store.state.regExp;
    },
    // 语音短信开关
    voiceSmsOpen() {
      return this.$store.state.baseData.voiceSmsOpen;
    },
    userInfo() {
      return this.$store.state.baseData.userInfo;
    },
    userText() {
      if (this.userInfo) {
        return this.userInfo.userAccount;
      }
      return '';
    },
    // confirmPwd 是否两次密码输入一致
    confirmPwd() {
      return this.addPassword === this.addConfirmPwd;
    },
    // password 是否复合正则验证
    passFlag() {
      return this.regExps.passWord.test(this.addPassword);
    },
    // confirm框是否为错误状态
    confirmPwdErrorFlag() {
      if (this.addConfirmPwd.length !== 0 && !this.confirmPwd) return true;
      return false;
    },
    // 邮箱 是否复合正则验证
    emailFlag() {
      const reg = this.regExps.email;
      return reg.test(this.addEmail);
    },
    // 邮箱账号框是否为错误状态
    addEmailErrorFlag() {
      if (this.addEmail.length !== 0 && !this.emailFlag) return true;
      return false;
    },
    // pass框是否为错误状态
    pwdErrorFlag() {
      if (this.addPassword.length !== 0 && !this.passFlag) return true;
      return false;
    },
    // 是否显示提示文字
    warningEmailShow() {
      let flag = true;
      if (this.addEmail && !this.emailIsExists && !this.addEmailErrorFlag) {
        flag = false;
      }
      if (this.addEmailErrorFlag) {
        flag = false;
      }
      return flag;
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
  },
};
