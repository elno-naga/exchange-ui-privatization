export default {
  name: 'editEmail',
  data() {
    return {
      editEmailDialogLoading: false,
      editEmail: '',
      editNewEmail: '',
      newEmailError: this.$t('subAccount.subAcc.error1'), // 请输入正确格式的邮箱
      emailIsExists: false,
    };
  },
  methods: {
    init() {
      this.editEmail = this.curRow.email;
    },
    changeFlag() {
      this.$emit('close');
    },
    inputChange(value, name) {
      this[name] = value;
    },
    editEmailConfirm() {
      if (!this.editNewEmail || this.editEmailErrorFlag || this.emailIsExists) return;
      const req = {
        subUserEmail: this.editNewEmail,
        subUid: this.curRow.subUid,
      };
      this.$emit('confirm', req);
    },
    // 检查邮箱是否存在
    checkedEmail() {
      if (!this.editNewEmail || this.editEmailErrorFlag) return;
      const req = {
        subUserEmail: this.editNewEmail,
        loginType: this.curRow.loginType,
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
  },
  computed: {
    regExps() { return this.$store.state.regExp; },
    // 添加邮箱 是否符合正则验证
    emailFlag() {
      const reg = this.regExps.email;
      return reg.test(this.editNewEmail);
    },
    // 邮箱账号框是否为错误状态
    editEmailErrorFlag() {
      if (this.editNewEmail.length !== 0 && !this.emailFlag) return true;
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
