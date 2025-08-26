export default {
  name: 'editPassword',
  data() {
    return {
      editPwdDialogLoading: false,
      editPwdEmail: '',
      editPassword: '',
      editConfirmPwd: '',
      pwdError: this.$t('subAccount.subAcc.error2'), // 添加子账户-密码错误文案
      confirmPwdError: this.$t('subAccount.subAcc.error3'), // 添加子账户-确认密码错误文案
      pwdFlag: true, // 密码显示隐藏（控制小眼睛）

    };
  },
  methods: {
    init() {
      this.editPwdEmail = this.curRow.email;
    },
    changeFlag() {
      this.$emit('close');
    },
    inputChange(value, name) {
      this[name] = value;
    },
    editPwdConfirm() {
      if (!this.editConfirmPwd || this.confirmPwdErrorFlag || this.pwdErrorFlag) return;
      const req = {
        newPassword: this.editConfirmPwd,
        subUid: this.curRow.subUid,
      };
      this.$emit('confirm', req);
    },
    hidePwd() {
      this.pwdFlag = !this.pwdFlag;
    },
  },
  computed: {
    regExps() { return this.$store.state.regExp; },
    // password 是否复合正则验证
    passFlag() { return this.regExps.passWord.test(this.editPassword); },
    // confirmPwd 是否两次密码输入一致
    confirmPwd() { return this.editPassword === this.editConfirmPwd; },
    // pass框是否为错误状态
    pwdErrorFlag() {
      if (this.editPassword.length !== 0 && !this.passFlag) return true;
      return false;
    },
    // comfirm框是否为错误状态
    confirmPwdErrorFlag() {
      if (this.editConfirmPwd.length !== 0 && !this.confirmPwd) return true;
      return false;
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
  },
};
