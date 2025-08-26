// @ is an alias to /src
import { colorMap } from '@/utils';
import countryMinix from '../../countryList/countryList';

export default {
  name: 'changePassword',
  mixins: [countryMinix],
  watch: {
    userInfo(userinfo) {
      this.googleCode = !!Number(userinfo.googleStatus);
      this.smsCode = !!Number(userinfo.isOpenMobileCheck);
      this.checkValue1 = this.userInfo.mobileNumber;
    },
    mobileUpdate(mobileUpdate) {
      if (mobileUpdate !== null) {
        this.loading = false;
        if (mobileUpdate.text === 'success') {
          this.$bus.$emit('tip', { text: mobileUpdate.msg, type: 'success' });
          this.$store.dispatch('resetType');
          this.$router.push('/personal/userManagement');
        } else {
          this.$bus.$emit('tip', { text: mobileUpdate.msg, type: 'error' });
          this.$store.dispatch('resetType');
          if (mobileUpdate.code !== '10009') {
            this.$bus.$emit('getCode-clear', 'smsCode');
          }
        }
      }
    },
    sendSmsCode(sendSmsCode) {
      if (sendSmsCode !== null) {
        if (sendSmsCode.text === 'success') {
          if (this.currentCodeType === 'old') {
            if (this.verifyObjOld && this.verifyObjOld.nc) {
              this.verifyObjOld.nc.reset(); // 极验滑动重置
            }
            if (this.verificationType === '3' && window.turnstile) {
              /* eslint-disable */
              window.turnstile.reset('#cloundFlareWidget'); // cloudflare 重置
              /* eslint-enable */
            }
            this.moreVerifyDisabledOld = true; // 发送按钮置灰
          } else if (this.currentCodeType === 'new') {
            if (this.verifyObjNew && this.verifyObjNew.nc) {
              this.verifyObjNew.nc.reset(); // 极验滑动重置
            }
            if (this.verificationType === '3' && window.turnstile) {
              /* eslint-disable */
              window.turnstile.reset('#cloundFlareWidget'); // cloudflare 重置
              /* eslint-enable */
            }
            this.moreVerifyDisabledNew = true; // 发送按钮置灰
          }
          this.$bus.$emit('tip', { text: sendSmsCode.msg, type: 'success' });
          this.$store.dispatch('resetType');
        } else {
          this.$bus.$emit('tip', { text: sendSmsCode.msg, type: 'error' });
          this.$store.dispatch('resetType');
        }
      }
    },
  },
  computed: {
    promptText() { return this.$t('personal.label.promptText'); },
    errorText() { return this.$t('personal.label.errorText'); },
    promptText1() { return this.$t('personal.label.oldPhone'); },
    promptText2() { return this.$t('personal.label.smsCodeText'); },
    promptText3() { return this.$t('personal.label.newPhone'); },
    promptText4() { return this.$t('personal.label.smsCodeText'); },
    promptText5() { return this.$t('personal.label.googleCodeText'); },
    errorText2() { return this.$t('personal.prompt.errorCode'); },
    // errorText3() { return this.$t('personal.prompt.errorPhone'); },
    errorText4() { return this.$t('personal.prompt.errorCode'); },
    errorText5() { return this.$t('personal.prompt.errorCode'); },
    userInfo() {
      return this.$store.state.baseData.userInfo;
    },
    sendSmsCode() {
      return this.$store.state.personal.sendSmsCode;
    },
    mobileUpdate() {
      return this.$store.state.personal.mobileUpdate;
    },
    update_safe_withdraw() {
      return this.$store.state.baseData.update_safe_withdraw;
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
      checkValue4: '',
      checkValue5: '',
      errorText1: '',
      checkErrorFlag1: false,
      checkErrorFlag2: false,
      checkErrorFlag3: false,
      checkErrorFlag4: false,
      checkErrorFlag5: false,
      disabled: true,
      oldNew: false,
      smsCode: false,
      googleCode: false,
      countryErrorFlag: false,
      verifyObjOld: {},
      moreVerifyDisabledOld: true,
      verifyObjNew: {},
      moreVerifyDisabledNew: true,
      currentCodeType: '',
      isShowNewPhoneNumber: false,
      captchaObjOld: null, // 极验
      captchaObjNew: null,
      tartCaptchaV2: null, // 所有验证方式
      errorText3: '',
    };
  },
  methods: {
    handleOldPhone() {
      if (this.verifyObjNew && this.verifyObjNew.nc) {
        this.verifyObjNew.nc.reset(); // 极验滑动重置
      }
      if (this.verificationType === '3' && window.turnstile) {
        /* eslint-disable */
        window.turnstile.reset('#cloundFlareWidget'); // cloudflare 重置
        /* eslint-enable */
      }
      this.axios({
        url: 'user/opt/unused_mobile_check',
        method: 'post',
        params: {
          smsAuthCode: this.checkValue2,
          smsAuthVoiceCode: this.checkValue2,
        },
      }).then(({ code, data, msg }) => {
        if (code.toString() === '0') {
          console.log(data);
          this.$bus.$emit('getCode-clear', 'oldSmsCode');
          this.isShowNewPhoneNumber = true;
        } else {
          this.$bus.$emit('tip', { text: msg, type: 'error' });
        }
      });
    },
    // 极验或cloudflare滑动通过
    verifyCallBackOld(parameter) {
      this.verifyObjOld = parameter;
      this.moreVerifyDisabledOld = false;
      if (this.captchaObjOld && this.captchaObjOld.verify) {
        this.captchaObjOld.verify();
      }
    },
    // 存储极验
    getCaptchaObjOld(captchaObj) {
      this.captchaObjOld = captchaObj;
    },
    // 极验或cloudflare滑动通过
    verifyCallBackNew(parameter) {
      this.verifyObjNew = parameter;
      this.moreVerifyDisabledNew = false;
      if (this.captchaObjNew && this.captchaObjNew.verify) {
        this.captchaObjNew.verify();
      }
    },
    // 存储极验
    getCaptchaObjNew(captchaObj) {
      this.captchaObjNew = captchaObj;
    },
    init() {
      this.errorText3 = this.$t('personal.prompt.errorPhone');
      if (this.userInfo) {
        this.googleCode = !!Number(this.userInfo.googleStatus);
        this.smsCode = !!Number(this.userInfo.isOpenMobileCheck);
        this.checkValue1 = this.userInfo.mobileNumber;
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
    getCodeClick(name) {
      if (name === 'oldSmsCode') {
        this.$bus.$emit('getCode-start', 'oldSmsCode');
        const info = { operationType: 3 };
        this.$store.dispatch('sendSmsCode', info);
        this.currentCodeType = 'old';
      } else if (this.checkValue3 && !this.checkErrorFlag3) {
        this.currentCodeType = 'new';
        this.$bus.$emit('getCode-start', 'smsCode');
        const info = {
          mobile: this.checkValue3,
          operationType: 2,
          countryCode: this.countryKeyCode,
        };
        this.$store.dispatch('sendSmsCode', info);
      } else {
        this.checkErrorFlag3 = true;
        this.errorText3 = this.$t('personal.prompt.errorNewPhone');
      }
    },
    inputChanges(value, name) {
      switch (name) {
        case 'oldSmsCode': { // oldSmsCode
          this.checkValue2 = value;
          if (this.codeFlag(value)) {
            this.checkErrorFlag2 = false;
          } else {
            this.checkErrorFlag2 = true;
          }
          break;
        }
        case 'newPhone': { // newPhone
          this.checkValue3 = value;
          if (this.phoneFlag(value)) {
            this.checkErrorFlag3 = false;
          } else {
            this.checkErrorFlag3 = true;
            this.errorText3 = this.$t('personal.prompt.errorPhone');
          }
          break;
        }
        case 'smsCode': { // 短信验证码
          this.checkValue4 = value;
          if (this.codeFlag(value)) {
            this.checkErrorFlag4 = false;
          } else {
            this.checkErrorFlag4 = true;
          }
          break;
        }
        default: { // google验证码
          this.checkValue5 = value;
          if (this.codeFlag(value)) {
            this.checkErrorFlag5 = false;
          } else {
            this.checkErrorFlag5 = true;
          }
        }
      }
      if (this.checkValue4 && this.checkValue2 && this.checkValue3
        && !this.checkErrorFlag2 && !this.checkErrorFlag3 && !this.checkErrorFlag4
        && !this.checkErrorFlag5) {
        if (this.googleCode) {
          this.disabled = !this.checkValue5;
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
        ...this.verifyObjNew,
        smsAuthCode: this.checkValue4,
        countryCode: this.countryKeyCode,
        mobileNumber: this.checkValue3,
        googleCode: this.checkValue5,
        authenticationCode: this.checkValue2,
        verificationType: this.verificationType,
        geetestChallenge: this.verifyObjNew.geetest_challenge,
        geetestValidate: this.verifyObjNew.geetest_validate,
        geetestSeccode: this.verifyObjNew.geetest_seccode,
      };
      this.$store.dispatch('mobileUpdateVerify', info);
    },
  },
};
