// 信用卡入金
export default {
  name: 'creditCardPurchase',
  props: {
    isShow: {
      default: false,
      type: Boolean,
    },
    close: {
      default() {},
      type: Function,
    },
    // 选中的支付方式
    rateName: {
      default: '',
      type: String,
    },
    // 查询付款状态url
    simplexUrl: {
      default: '',
      type: String,
    },
  },
  data() {
    return {};
  },
  computed: {
    // 弹窗标题
    dialogTitle() {
      return `${this.rateName}${this.$t('creditCardPurchase.payForFeedback')}`; // xx支付反馈
    },
  },
  methods: {
    init() {},
    handleConfirm() {
      this.$router.push({
        path: '/order/otcOrder',
      });
      this.close();
    },
  },
};
