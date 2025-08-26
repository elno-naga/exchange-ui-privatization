// 未开通合约KYC认证提示
export default {
  name: 'limitFuturesTip',
  data() {
    return {
      // 是否加载成功
      dialogConfirmLoading: false,
      // 是否禁止提交
      dialogConfirmDisabled: false,
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
    // 弹窗文字类型
    openType: {
      default: 0,
      type: Number,
    },
  },
  computed: {
    lanText() {
      if (this.openType === 1) {
        return {
          // KYC认证标题
          titleText: this.$t('futures.limitFutures.titleText'),
          // 去认证
          confirmText: this.$t('futures.limitFutures.confirmText'),
        };
      }
      if (this.openType === 2 || this.openType === 3 || this.openType === 5) {
        return {
          titleText: this.$t('futures.limitFutures.titleText2'),
          confirmText: this.$t('futures.openFutures.confirmText2'),
        };
      }
      if (this.openType === 4) {
        return {
          titleText: this.$t('futures.limitFutures.titleText2'),
          confirmText: this.$t('futures.limitFutures.confirmText'), // 去认证
        };
      }
      return {
        // KYC认证标题
        titleText: this.$t('futures.limitFutures.titleText'),
        // 去认证
        confirmText: this.$t('futures.limitFutures.confirmText'),
      };
    },
    userInfo() {
      return this.$store.state.baseData.userInfo;
    },
  },
  methods: {
    init() {},
    submit() {
      // 未kyc认证，跳转KYC认证
      if (this.openType === 1 || this.openType === 4) {
        this.$router.push('/personal/identityAuthen');
      } else {
        this.$bus.$emit('CLOSE_LIMITFUTURESTIP');
      }
    },
  },
};
