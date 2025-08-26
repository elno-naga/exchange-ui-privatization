import {
  imgMap, colorMap, getCookie, getIconPath,
} from '@/utils';

export default {
  name: 'kolTrade',
  data() {
    return {
      imgMap,
      colorMap,
      getIconPath,
      isKol: false, // 是否是带单人
      readerFlag: false, // 是否弹窗确认
      bannerInfo: {}, // banner信息
      currentType: 'list',
    };
  },
  computed: {
    loginFlag() {
      // userInfoIsReady： userInfo是否请求完毕
      const { isLogin, userInfoIsReady } = this.$store.state.baseData;
      if (isLogin && userInfoIsReady) {
        return true;
      }
      return false;
    },
    bannerBg() {
      if (!(this.bannerInfo && this.bannerInfo.imageUrl) || this.bannerInfo.imageUrl.indexOf('data:image') !== -1) {
        return "background: url('https://s3.ap-northeast-1.amazonaws.com/chainup-test/kolTradeBg.png') center center no-repeat;";
      }
      return `background: url("${this.bannerInfo.imageUrl}") center center no-repeat;`;
    },
  },
  watch: {
    loginFlag(v) { if (v) { this.getIsKol(); } },
  },
  methods: {
    init() {
      this.$bus.$on('kolMyOrder', () => {
        this.currentType = 'kolMyOrder';
      });
      this.$bus.$on('list', () => {
        this.currentType = 'list';
      });
      this.$bus.$on('kolTraderOrder', () => {
        this.currentType = 'kolTraderOrder';
      });
      this.getBanner();
      if (this.loginFlag) { this.getIsKol(); }
    },
    learnMore() {
      window.open(this.bannerInfo.urlButton);
    },
    // 获取banner配置
    getBanner() {
      this.axios({
        url: 'v2/get_follow_banner',
        hostType: 'coFollow',
        params: {
          type: 0,
          langKey: getCookie('lan'),
        },
        method: 'post',
      }).then((data) => {
        if (data.code.toString() === '0') {
          this.bannerInfo = data.data || {};
          // if (this.bannerInfo.imageUrl.indexOf('data:image') !== -1
          // || !this.bannerInfo.imageUrl) {
          //   this.bannerBg = "background: url('https://saas-test-bucket-21.s3.ap-northeast-1.amazonaws.com/1411/upload/ff146cdd44b7101834ef2b50e9647508.png') center center no-repeat;background-size:cover";
          // } else {
          //   this.bannerBg = `background: url("${this.bannerInfo.url}") center center no-repeat;background-size:cover`;
          // }
        } else {
          this.$bus.$emit('tip', {
            text: data.msg, type: 'error', backgroundColor: '#F6F8FF', textColor: '#16181d',
          });
        }
      });
    },
    // 查看是否是带单人
    getIsKol() {
      this.axios({
        url: 'v2/user/isKol',
        hostType: 'coFollow',
        method: 'post',
      }).then((data) => {
        if (data.code === '0' || data.code === 0) {
          if (data.data.count) {
            this.isKol = true;
          } else {
            this.getFirst();
          }
        } else {
          this.$bus.$emit('tip', {
            text: data.msg, type: 'error', backgroundColor: '#F6F8FF', textColor: '#16181d',
          });
        }
      });
    },
    // 是否确认弹窗
    getFirst() {
      this.axios({
        url: 'v2/user/isExist',
        hostType: 'coFollow',
        method: 'post',
      }).then((data) => {
        if (data.code === '0' || data.code === 0) {
          if (data.data.count === 0) {
            this.readerFlag = true;
          }
        } else {
          this.$bus.$emit('tip', {
            text: data.msg, type: 'error', backgroundColor: '#F6F8FF', textColor: '#16181d',
          });
        }
      });
    },
    // 已阅读风险说明
    readed() {
      this.readerFlag = false;
      this.axios({
        url: 'v2/user/save',
        hostType: 'coFollow',
        method: 'post',
      }).then((data) => {
        if (data.code === '0' || data.code === 0) {
          this.readerFlag = false;
        } else {
          this.$bus.$emit('tip', {
            text: data.msg, type: 'error', backgroundColor: '#F6F8FF', textColor: '#16181d',
          });
        }
      });
    },
  },
};
