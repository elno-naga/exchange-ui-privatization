import { getCookie, colorMap } from '@/utils';
import countryMinix from '../../countryList/countryList';

export default {
  name: 'bindPhone',
  mixins: [countryMinix],
  watch: {
    sendSmsCode(sendSmsCode) {
      if (sendSmsCode !== null) {
        if (sendSmsCode.text === 'success') {
          this.moreVerifyDisabled = true;
          if (this.verifyObj && this.verifyObj.nc) {
            this.verifyObj.nc.reset(); // 极验滑动重置
          }
          this.$bus.$emit('tip', { text: sendSmsCode.msg, type: 'success' });
          this.$store.dispatch('resetType');
          if (this.verificationType === '3' && window.turnstile) {
            /* eslint-disable */
            window.turnstile.reset('#cloundFlareWidget'); // cloudflare 重置
            /* eslint-enable */
          }
        } else {
          this.$bus.$emit('tip', { text: sendSmsCode.msg, type: 'error' });
          this.$store.dispatch('resetType');
        }
      }
    },
    nowUserRegType: {
      immediate: true,
      handler() {
        this.dialogSet();
      },
    },
    userInfo: {
      immediate: true,
      handler(userinfo) {
        if (userinfo) {
          this.googleCode = !!Number(userinfo.googleStatus);
          this.googleReady = true;
          this.dialogSet();
        }
      },
    },
    mobileBindSave(mobileBindSave) {
      if (mobileBindSave !== null) {
        this.loading = false;
        if (mobileBindSave.text === 'success') {
          if (this.verifyObj && this.verifyObj.nc) {
            this.verifyObj.nc.reset(); // 极验滑动重置
          }
          if (this.verificationType === '3' && window.turnstile) {
            /* eslint-disable */
            window.turnstile.reset('#cloundFlareWidget'); // cloudflare 重置
            /* eslint-enable */
          }
          this.$bus.$emit('tip', { text: mobileBindSave.msg, type: 'success' });
          this.$store.dispatch('resetType');
          this.$router.push('/personal/userManagement');
        } else {
          this.$bus.$emit('tip', { text: mobileBindSave.msg, type: 'error' });
          this.$store.dispatch('resetType');
          if (mobileBindSave.code !== '10009') {
            this.$bus.$emit('getCode-clear', 'phone');
          }
        }
      }
    },
  },
  computed: {
    promptText() { return this.$t('personal.label.promptText'); },
    errorText() { return this.$t('personal.label.errorText'); },
    promptText1() { return this.$t('personal.label.phone'); },
    promptText2() { return this.$t('personal.label.smsCodeText'); },
    promptText3() { return this.$t('personal.label.googleCodeText'); },
    // errorText1() { return this.$t('personal.prompt.errorPhone'); },
    errorText2() { return this.$t('personal.prompt.errorCode'); },
    errorText3() { return this.$t('personal.prompt.errorCode'); },
    userInfo() {
      return this.$store.state.baseData.userInfo;
    },
    sendSmsCode() {
      return this.$store.state.personal.sendSmsCode;
    },
    mobileBindSave() {
      return this.$store.state.personal.mobileBindSave;
    },
    userRegType() {
      const { publicInfo } = this.$store.state.baseData;
      let str = '{}';
      if (publicInfo) {
        if (publicInfo.switch && publicInfo.switch.user_reg_type) {
          str = publicInfo.switch.user_reg_type;
        }
      }
      return JSON.parse(str);
    },
    nowUserRegType() {
      const lan = getCookie('lan');
      let arr = [1, 2];
      if (this.userRegType[lan]) {
        arr = this.userRegType[lan];
      }
      return arr;
    },
    verificationType() {
      const { publicInfo } = this.$store.state.baseData;
      if (publicInfo && publicInfo.switch) {
        if (publicInfo.switch.verificationType === '2') {
          // 极验
          return '2';
        }
        if (publicInfo.switch.verificationType === '3') {
          // cloudflare
          return '3';
        }
        if (publicInfo.switch.verificationType === '0') {
          // 混合模式
          if (
            this.tartCaptchaV2
            && this.tartCaptchaV2.geetest
            && this.tartCaptchaV2.geetest.success
            && this.tartCaptchaV2.geetest.challenge
            && this.tartCaptchaV2.geetest.gt
            && this.tartCaptchaV2.cloudflare
            && this.tartCaptchaV2.cloudflare.siteKey
          ) {
            if (Number(Math.random()) > 0.5) {
              return '2';
            }
            return '3';
          }
          if (
            this.tartCaptchaV2
            && this.tartCaptchaV2.geetest
            && this.tartCaptchaV2.geetest.success
            && this.tartCaptchaV2.geetest.challenge
            && this.tartCaptchaV2.geetest.gt
          ) {
            return '2';
          }
          if (
            this.tartCaptchaV2
            && this.tartCaptchaV2.cloudflare
            && this.tartCaptchaV2.cloudflare.siteKey
          ) {
            return '3';
          }
          return '2';
        }
      }
      return '2';
    },
  },
  data() {
    return {
      colorMap,
      loading: false,
      checkValue1: '',
      checkValue2: '',
      checkValue3: '',
      checkErrorFlag1: false,
      checkErrorFlag2: false,
      checkErrorFlag3: false,
      disabled: true,
      googleCode: false,
      countryErrorFlag: false,
      dialogFlag: false,
      googleReady: false,
      verifyObj: {},
      moreVerifyDisabled: true,
      captchaObj: null, // 极验
      tartCaptchaV2: null, // 所有验证方式
      errorText1: '',
    };
  },
  methods: {
    // 极验或cloudflare滑动通过
    verifyCallBack(parameter) {
      this.verifyObj = parameter;
      this.moreVerifyDisabled = false;
      if (this.captchaObj && this.captchaObj.verify) {
        this.captchaObj.verify();
      }
    },
    // 存储极验
    getCaptchaObj(captchaObj) {
      this.captchaObj = captchaObj;
    },
    dialogSet() {
      if (this.nowUserRegType[0] === 2
          && this.nowUserRegType.length === 1
          && this.googleReady && !this.googleCode) {
        this.dialogFlag = true;
      }
    },
    dialogClose() {
      this.dialogFlag = false;
    },
    dialogConfirm() {
      this.$router.push('/personal/bindGoogle');
    },
    init() {
      this.errorText1 = this.$t('personal.prompt.errorPhone');
      if (this.userInfo) {
        this.googleCode = !!Number(this.userInfo.googleStatus);
      }
      this.gettartCap();
    },
    gettartCap() {
      this.axios({
        url: 'common/tartCaptchaV2',
        headers: {},
        params: {},
        method: 'post',
      }).then((data) => {
        if (data.code === '0') {
          this.tartCaptchaV2 = data.data;
          const { publicInfo } = this.$store.state.baseData;
          setTimeout(() => {
            if (publicInfo && publicInfo.switch) {
              if (
                publicInfo.switch.verificationType === '2'
              && !this.tartCaptchaV2.geetest
              ) {
              // 极验
                this.$bus.$emit('tip', {
                  text: this.$t('cloudFlare.verifyEroor'),
                  type: 'error',
                });
              }
              if (
                publicInfo.switch.verificationType === '3'
              && !this.tartCaptchaV2.cloudflare
              ) {
              // cloudflare
                this.$bus.$emit('tip', {
                  text: this.$t('cloudFlare.verifyEroor'),
                  type: 'error',
                });
              }
            }
          }, 1000);
        }
      });
    },
    // 手机正则
    phoneFlag(val) {
      return this.$store.state.regExp.phone.test(val);
    },
    codeFlag(val) {
      return this.$store.state.regExp.verification.test(val);
    },
    getCodeClick() {
      if (this.checkValue1 && !this.checkErrorFlag1) {
        this.$bus.$emit('getCode-start', 'phone');
        const info = {
          countryCode: this.countryKeyCode,
          mobile: this.checkValue1,
          operationType: 2,
        };
        this.$store.dispatch('sendSmsCode', info);
      } else {
        this.checkErrorFlag1 = true;
        this.errorText1 = this.$t('personal.prompt.errorPhoneText');
      }
    },
    inputChanges(value, name) {
      switch (name) {
        case 'phone': { // phone
          this.checkValue1 = value;
          if (this.phoneFlag(value)) {
            this.checkErrorFlag1 = false;
          } else {
            this.checkErrorFlag1 = true;
            this.errorText1 = this.$t('personal.prompt.errorPhone');
          }
          break;
        }
        case 'phoneCode': {
          this.checkValue2 = value;
          if (this.codeFlag(value)) {
            this.checkErrorFlag2 = false;
          } else {
            this.checkErrorFlag2 = true;
          }
          break;
        }
        default: { // google验证码
          this.checkValue3 = value;
          if (this.codeFlag(value)) {
            this.checkErrorFlag3 = false;
          } else {
            this.checkErrorFlag3 = true;
          }
        }
      }
      if (this.checkValue1 && this.checkValue2 && !this.checkErrorFlag1
        && !this.checkErrorFlag2 && !this.checkErrorFlag3) {
        if (this.googleCode) {
          if (this.checkValue3) {
            this.disabled = !this.checkValue3;
          }
        } else {
          this.disabled = false;
        }
      } else {
        this.disabled = true;
      }
    },
    btnLink() {
      this.loading = true;
      const info = {
        ...this.verifyObj,
        countryCode: this.countryKeyCode,
        mobileNumber: this.checkValue1,
        smsAuthCode: this.checkValue2,
        googleCode: this.checkValue3,
        verificationType: this.verificationType,
        geetestChallenge: this.verifyObj.geetest_challenge,
        geetestValidate: this.verifyObj.geetest_validate,
        geetestSeccode: this.verifyObj.geetest_seccode,
      };
      this.$store.dispatch('mobileBindSaveVerify', info);
    },
  },
};
