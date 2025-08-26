import {
  getIconPath,
} from '@/utils';
// 开通合约交易页面
export default {
  name: 'openFuture',
  data() {
    return {
      getIconPath,
      // 是否加载成功
      dialogConfirmLoading: false,
      // 是否禁止提交
      dialogConfirmDisabled: false,
      authLevel: '', //  //认证状态 0、未审核，1、通过，2、未通过  3未认证  4未获取用户认证状态
      futuresLocalLimit: '', // 1 区域限制范围内  0 不在限制范围
    };
  },
  props: {
    isShow: {
      default: false,
      type: Boolean,
    },
    close: {
      default() {},
      type: Function,
    },
  },
  computed: {
    lanText() {
      return {
        // 合约交易风险确认书
        titleText: this.$t('futures.openFutures.titleText'),
        // 确认并开通合约交易
        confirmText: this.$t('futures.openFutures.confirmText'),
        text1: this.$t('futures.openFutures.text1'),
        text2: this.$t('futures.openFutures.text2'),
        text3: this.$t('futures.openFutures.text3'),
        text4: this.$t('futures.openFutures.text4'),
        text5: this.$t('futures.openFutures.text5'),
        text6: this.$t('futures.openFutures.text6'),
        text7: this.$t('futures.openFutures.text7'),
      };
    },
    userInfo() {
      return this.$store.state.baseData.userInfo;
    },
    // 是否开通了合约交易
    openContract() {
      return this.$store.state.future.openContract;
    },
    // 用户配置信息
    future() {
      return this.$store.state.future;
    },
    // 是否登录
    isLogin() {
      return this.$store.state.baseData.isLogin;
    },
  },
  watch: {},
  methods: {
    init() {
      this.dialogConfirmLoading = false;
    },
    selectCategory(id) {
      this.currentCategory = id;
    },
    // 开通合约交易
    submit() {
      this.$store.dispatch('getUserConfig');
      if (this.future && this.future.futureUserConfig) {
        // 认证状态 0、未审核，1、通过，2、未通过  3未认证  4未获取用户认证状态vel;
        this.authLevel = this.future.futureUserConfig.authLe;
        // futuresLocalLimit    1 区域限制范围内  0 不在限制范围
        this.futuresLocalLimit = this.future.futureUserConfig.futuresLocalLimit;
      }
      // 非合约云用户
      if (this.authLevel === 3) {
        // 未kyc认证
        this.$bus.$emit('OPEN_LIMITFUTURESTIP', 1);
        // console.log(1, "未kyc认证");
        return;
      }
      if (this.authLevel === 1 && this.futuresLocalLimit === 1) {
        // 认证过，是限制国家
        // console.log(2, "认证过，是限制国家");
        this.$bus.$emit('OPEN_LIMITFUTURESTIP', 2);
        return;
      }
      if (this.authLevel === 0) {
        // 认证过，非限制国家审核中
        // console.log(3, "认证过，非限制国家审核中");
        this.$bus.$emit('OPEN_LIMITFUTURESTIP', 3);
        return;
      }
      if (this.authLevel === 2) {
        // 认证过，非限制国家失败
        // console.log(4, "认证过，非限制国家失败");
        this.$bus.$emit('OPEN_LIMITFUTURESTIP', 4);
        return;
      }
      if (this.authLevel === 4) {
        // 未获取用户认证状态
        this.$bus.$emit('OPEN_LIMITFUTURESTIP', 5);
        // console.log(5, "未获取用户认证状态");
        return;
      }
      // 之前逻辑
      const { mobileNumber, email, id } = this.userInfo;
      this.dialogConfirmLoading = true;
      this.axios({
        url: this.$store.state.url.futures.createCoId,
        hostType: 'co',
        method: 'post',
        params: {
          mobileNumber,
          email,
          uid: id,
        },
      }).then(({ code, msg }) => {
        if (code.toString() === '0') {
          this.$store.dispatch('getUserConfig');
          this.close();
          this.$bus.$emit('tip', { text: msg, type: 'success' });
        } else {
          this.$bus.$emit('tip', { text: msg, type: 'error' });
        }
        this.dialogConfirmLoading = false;
      });
    },
  },
};
