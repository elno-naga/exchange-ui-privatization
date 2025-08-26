// 调节逐仓仓位保证金
import { getIconPath } from '@/utils';

export default {
  name: 'inviteFriends',
  data() {
    return {
      getIconPath,
      // 是否加载成功
      dialogConfirmLoading: false,
      // 邀请码信息
      inviteCode: '',
      inviteQECode: '',
      inviteUrl: '',
      inviteCodeShow: true,
      inviteUrlShow: true,
    };
  },
  props: {
    dialogFlag: {
      default: false,
      type: Boolean,
    },
    dialogClose: {
      default() {},
      type: Function,
    },
  },
  computed: {
    userInfo() {
      if (this.$store.state.baseData.userInfo) {
        return this.$store.state.baseData.userInfo;
      }
      return {};
    },
    lanText() {
      return {
        // titleText: this.$t('futures.setMarginCoin.titleText'), // '调节逐仓仓位保证金',
        // text1: this.$t('futures.setMarginCoin.text1'), // '当前',
        // text2: this.$t('futures.setMarginCoin.text2'), // '变更后',
        // text3: this.$t('futures.setMarginCoin.text3'), // '仓位',
        // text4: this.$t('futures.setMarginCoin.text4'), // '仓位保证金',
        // text5: this.$t('futures.setMarginCoin.text5'), // '实际杠杆',
        // text6: this.$t('futures.setMarginCoin.text6'), // '强平价',
        // text7: this.$t('futures.setMarginCoin.text7'), // '可用',
        // text8: this.$t('futures.setMarginCoin.text8'), // '可减少保证金',
        // text9: this.$t('futures.setMarginCoin.text9'), // '全部',
        // text10: this.$t('futures.setMarginCoin.text10'), // '增加保证金',
        // text11: this.$t('futures.setMarginCoin.text11'), // '减少保证金',
        // text12: this.$t('futures.setMarginCoin.text12'), // '增加保证金数量',
        // text13: this.$t('futures.setMarginCoin.text13'), // '减少保证金数量',
        // text14: this.$t('futures.setMarginCoin.text14'), // '余额不足',
        // text15: this.$t('futures.setMarginCoin.text15'), // '可减少保证金不足',
      };
    },
  },
  watch: {
    dialogFlag() {
      if (this.userInfo !== null) {
        // 邀请码信息
        this.inviteCode = this.userInfo.inviteCode;
        this.inviteQECode = this.userInfo.inviteQECode;
        this.inviteUrl = this.userInfo.inviteUrl;
      }
    },
  },
  methods: {
    init() {},

    handMouseenter(name) {
      if (name === 'inviteCode') {
        this.inviteCodeShow = false;
      } else {
        this.inviteUrlShow = false;
      }
    },
    handMouseleave(name) {
      if (name === 'inviteCode') {
        this.inviteCodeShow = true;
      } else {
        this.inviteUrlShow = true;
      }
    },
    copyClick(name) {
      if (name === 'inviteCode') {
        this.copy(this.inviteCode);
      } else {
        this.copy(this.inviteUrl);
      }
    },
    copy(str) {
      this.$bus.$emit('tip', { text: this.$t('personal.prompt.copySucces'), type: 'success' });
      function save(e) {
        e.clipboardData.setData('text/plain', str); // 下面会说到clipboardData对象
        e.preventDefault(); // 阻止默认行为
      }
      document.addEventListener('copy', save);
      document.execCommand('copy'); // 使文档处于可编辑状态，否则无效
      document.removeEventListener('copy', save);
    },
  },
};
