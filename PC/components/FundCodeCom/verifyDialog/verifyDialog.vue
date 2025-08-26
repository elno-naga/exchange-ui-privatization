<template>
  <c-v6-dialog :showFlag="verifyShow"
            paddingBottom="14px"
            :titleText="titleText"
            @close="dialogClose"
            @confirm="dialogConfirm"
            :confirmDisabled="confirmDisabled"
            :confirmLoading="confirmLoading">
    <div class="releaseDialog">
      <p v-if="dialogTipsShow" class="text">
        <svg class="icon icon-16" aria-hidden="true">
          <use xlink:href="#icon-c_2"></use>
        </svg>&nbsp;
        <!-- 请务必登录账号确认收到该笔款项 -->
        <span class="warning-1-cl">{{ dialogTips }}</span>
      </p>
    <!-- 手机号验证框 -->
    <c-v6-input
        v-if="isMobile"
        maxLength="6"
        name="smsCodeVal"
        :value="smsCodeVal"
        :promptText="$t('personal.label.smsCodeText')"
        :errorHave="true"
        :errorFlag="smsCodeError"
        :errorText="$t('register.phoneCodeError')"
        @onChanges="inputChange"
        :placeholder="' '"
    >
      <!-- 获取验证码 -->
      <div slot="append">
        <c-getCode
          name="phoneGetCode"
          :autoStart="false"
          @click="getPhoneCodeClick"
        />
      </div>
    </c-v6-input>
    <!-- 邮箱验证 -->
    <c-v6-input
        v-if="isEmail"
        maxLength="6"
        name="emailVal"
        :value="emailVal"
        :promptText="$t('personal.label.emailCodeText')"
        :errorHave="true"
        :errorFlag="emailError"
        :errorText="$t('register.emailCodeError')"
        @onChanges="inputChange"
        :placeholder="' '"
    >
      <!-- 获取验证码 -->
      <div slot="append">
        <c-getCode
          name="emailGetCode"
          :autoStart="false"
          @click="getEmailCodeClick"
        />
      </div>
    </c-v6-input>
    <!-- 谷歌验证码 -->
    <c-v6-input
        v-if="isGoogleCode"
        maxLength="6"
        name="googleValue"
        :value="googleValue"
        :promptText="$t('assets.withdraw.googleCode')"
        :errorHave="true"
        :errorFlag="googleError"
        :errorText="$t('assets.withdraw.googleCodeError')"
        @onChanges="inputChange"
        :placeholder="' '"
        :styles="{marginTop:'32px'}"
    ></c-v6-input>
    <!-- 资金密码 -->
    <c-v6-input
        v-if="isFundCode"
        name="fundCodeVal"
        type="password"
        autocomplete="new-password"
        :value="fundCodeVal"
        :promptText="$t('personal.label.moneyPassword')"
        :errorHave="true"
        :errorFlag="fundCodeError"
        :errorText="$t('modifySetting.fundCodeErrorMsg')"
        @onChanges="inputChange"
        :placeholder="' '"
        :styles="{marginTop:'32px'}"
    ></c-v6-input>
      <div v-if="dialogPassCheckBox" class="passValueText">
        <c-checkBox :value="passCheck" @click="passCheckClick"/>&nbsp;
        <!-- 我确认已登录收款账户，并核对收款无误 -->
        <span class="passValueText-text" @click="passCheckClick">
                {{ dialogPassCheckBoxText }}</span>
      </div>
    </div>
  </c-v6-dialog>
</template>
<script>
export default {
  name: 'c-verifyDialog',
  props: {
    verifyShow: {
      type: Boolean,
      default: false,
      required: true,
    },
    confirmLoading: {
      type: Boolean,
      default: false,
      required: false,
    },
    dialogTipsShow: {
      type: Boolean,
      default: false,
      required: false,
    },
    dialogTips: {
      type: String,
      default: '', // 请务必登录账号确认收到该笔款项
      required: false,
    },
    dialogPassCheckBox: {
      type: Boolean,
      default: false,
      required: false,
    },
    dialogPassCheckBoxText: {
      type: String,
      default: '', // 我确认已登录收款账户，并核对收款无误
      required: false,
    },
    sendCodeType: {
      type: String,
      default: '',
      required: false,
    },
    titleText: { default: '', type: String },
    // 类型列表
    typeList: {
      type: Array,
      default: () => [], // fundCode,google,mobile,email
      required: true,
    },
  },
  data() {
    return {
      smsCodeVal: '',
      smsCodeError: false,
      emailVal: '',
      emailError: false,
      googleValue: '',
      googleError: false,
      fundCodeVal: '',
      fundCodeError: false,
      disabled: false,
      passCheck: false,
      phoneClick: false,
      emailClick: false,
    };
  },
  watch: {
    sendSmsCode(sendSmsCode) {
      if (sendSmsCode !== null) {
        if (sendSmsCode.text === 'success') {
          this.$bus.$emit('tip', { text: sendSmsCode.msg, type: 'success' });
          this.$store.dispatch('resetType');
        } else {
          this.$bus.$emit('tip', { text: sendSmsCode.msg, type: 'error' });
          this.$store.dispatch('resetType');
        }
      }
    },
    sendEmailCode(sendEmailCode) {
      if (sendEmailCode !== null) {
        if (sendEmailCode.text === 'success') {
          this.$bus.$emit('tip', { text: sendEmailCode.msg, type: 'success' });
          this.$store.dispatch('resetType');
        } else {
          this.$bus.$emit('tip', { text: sendEmailCode.msg, type: 'error' });
          this.$store.dispatch('resetType');
        }
      }
    },
    verifyShow(val) {
      if (!val) {
        this.smsCodeVal = '';
        this.smsCodeError = false;
        this.emailVal = '';
        this.emailError = false;
        this.googleValue = '';
        this.googleError = false;
        this.fundCodeVal = '';
        this.fundCodeError = false;
        this.disabled = false;
        this.passCheck = false;
      }
    },
  },
  computed: {
    sendSmsCode() {
      return this.$store.state.personal.sendSmsCode;
    },
    sendEmailCode() {
      return this.$store.state.personal.sendEmailCode;
    },
    isMobile() {
      if (this.typeList && this.typeList.indexOf('mobile') !== -1) {
        return true;
      }
      return false;
    },
    isEmail() {
      if (this.typeList && this.typeList.indexOf('email') !== -1) {
        return true;
      }
      return false;
    },
    isGoogleCode() {
      if (this.typeList && this.typeList.indexOf('google') !== -1) {
        return true;
      }
      return false;
    },
    isFundCode() {
      if (this.typeList && this.typeList.indexOf('fundCode') !== -1) {
        return true;
      }
      return false;
    },
    confirmDisabled() {
      let flag = false;
      if (this.isMobile && (!this.smsCodeVal || this.smsCodeError)) {
        flag = true;
      }
      if (this.isEmail && (!this.emailVal || this.emailError)) {
        flag = true;
      }
      if (this.isGoogleCode && (!this.googleValue || this.googleError)) {
        flag = true;
      }
      if (this.isFundCode && (!this.fundCodeVal || this.fundCodeError)) {
        flag = true;
      }
      if (this.dialogPassCheckBox && !this.passCheck) {
        flag = true;
      }
      return flag;
    },
  },
  methods: {
    dialogClose() {
      this.$emit('close');
    },
    // eslint-disable-next-line consistent-return
    dialogConfirm() {
      const obj = {};
      if (this.confirmLoading) {
        return;
      }
      if (this.isMobile) {
        if (!this.smsCodeVal || this.smsCodeError) {
          this.smsCodeError = true;
          return;
        }
        obj.mobile = this.smsCodeVal;
      }
      if (this.isEmail) {
        if (!this.emailVal || this.emailError) {
          this.emailError = true;
          return;
        }
        obj.email = this.emailVal;
      }
      if (this.isGoogleCode) {
        if (!this.googleValue || this.googleError) {
          this.googleError = true;
          return;
        }
        obj.google = this.googleValue;
      }
      if (this.isFundCode) {
        if (!this.fundCodeVal || this.fundCodeError) {
          this.fundCodeError = true;
          return;
        }
        obj.fundCode = this.fundCodeVal;
      }
      this.$emit('confirm', obj);
    },
    codeFlag(val) {
      return this.$store.state.regExp.verification.test(val);
    },
    passwordFlag(val) {
      return this.$store.state.regExp.passWord.test(val);
    },
    passCheckClick() {
      this.passCheck = !this.passCheck;
    },
    inputChange(value, name) {
      switch (name) {
        case 'smsCodeVal': {
          this.smsCodeVal = value;
          if (this.codeFlag(value)) {
            this.smsCodeError = false;
          } else {
            this.smsCodeError = this.isMobile;
          }
          break;
        }
        case 'emailVal': {
          this.emailVal = value;
          if (this.codeFlag(value)) {
            this.emailError = false;
          } else {
            this.emailError = this.isEmail;
          }
          break;
        }
        case 'googleValue': {
          this.googleValue = value;
          if (this.codeFlag(value)) {
            this.googleError = false;
          } else {
            this.googleError = this.isGoogleCode;
          }
          break;
        }
        default: { // 资金密码
          this.fundCodeVal = value;
          if (this.passwordFlag(value)) {
            this.fundCodeError = false;
          } else {
            this.fundCodeError = this.isFundCode;
          }
        }
      }
      // let bol = false;
      // if(this.isMobile&&(this.smsCodeVal||this.smsCodeError)){
      //   bol = true;
      // }
      // if(this.isEmail&&(this.emailVal||this.emailError)){
      //   bol = true;
      // }
      // if(this.isGoogleCode&&(this.googleValue||this.googleError)){
      //   bol = true;
      // }
      // if(this.isFundCode&&(this.fundCodeVal||this.fundCodeError)){
      //   bol = true;
      // }
      // this.disabled = bol;
    },
    // 获取验证码
    getPhoneCodeClick() {
      if (this.phoneClick) return;
      this.phoneClick = true;
      let str = '32';
      if (this.sendCodeType) {
        str = this.sendCodeType.indexOf(',') !== -1 ? this.sendCodeType.split(',')[0] : this.sendCodeType;
      }
      const params = {
        operationType: str,
      };
      this.axios({
        url: 'v4/common/smsValidCode',
        params,
      }).then((data) => {
        this.phoneClick = false;
        if (data.code.toString() !== '0') {
          setTimeout(() => {
            // 倒计时重置
            this.$bus.$emit('getCode-clear', 'phoneGetCode');
            // tip框提示错误
            this.$bus.$emit('tip', { text: data.msg, type: 'error' });
          }, 2000);
        } else {
          this.$bus.$emit('getCode-start', 'phoneGetCode');
          this.$bus.$emit('tip', { text: this.$t('assets.withdraw.phoneSendSuccess'), type: 'success' });
        }
      });
    },
    // 获取邮箱验证码
    getEmailCodeClick() {
      if (this.emailClick) return;
      this.emailClick = true;
      let str = '30';
      if (this.sendCodeType) {
        str = this.sendCodeType.indexOf(',') !== -1 ? this.sendCodeType.split(',')[1] : this.sendCodeType;
      }
      const params = {
        operationType: str,
      };
      this.axios({
        url: 'v4/common/emailValidCode',
        params,
      }).then((data) => {
        this.emailClick = false;
        if (data.code.toString() !== '0') {
          setTimeout(() => {
            // 倒计时重置
            this.$bus.$emit('getCode-clear', 'emailGetCode');
            // tip框提示错误
            this.$bus.$emit('tip', { text: data.msg, type: 'error' });
          }, 2000);
        } else {
          // 倒计时重置
          this.$bus.$emit('getCode-start', 'emailGetCode');
          this.$bus.$emit('tip', { text: this.$t('register.emailSendSuccess'), type: 'success' });
        }
      });
    },
  },
};
</script>
<style lang='stylus' scoped>
.verificationc-alert {
  .alertTitle {
    margin-bottom: 15px;
  }
  .alertText {
    width: 285px;
    font-size: 12px;
    margin-bottom: 5px;
  }
  .alertError {
    height: 36px;
    border-bottom-width: 1px;
    border-bottom-style: solid;
    line-height: 36px;
    .alertError-text {
      font-size: 12px;
    }
    .alertError-icon {
      float: right;
    }
  }
  .alertBot {
    margin-bottom: 10px
  }
  // 确认收款并放币
  .releaseDialog{
    .passValueText {
      font-size: 14px;
      cursor: pointer;
      user-select: none;
      margin-top: 24px;
      .common-checkout {
        vertical-align: middle;
      }
      .passValueText-text {
        vertical-align: middle;
      }
    }
  }
}
</style>
