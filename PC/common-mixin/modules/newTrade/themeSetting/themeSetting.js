import {
  setCookie, getCookie, imgMap, getIconPath,
} from '@/utils';

export default {
  name: 'themeSetting',
  data() {
    return {
      imgMap,
      getIconPath,
      layoutOrg: getCookie('newTrade_layout') || 'ord',
      layout: getCookie('newTrade_layout') || 'ord',
      userSkinOrg: getCookie('cusSkin') || getCookie('defSkin'),
      userSkin: getCookie('cusSkin') || getCookie('defSkin'), // 用户选择的skin
      hide: false,
      // tradePage: '1',
      layHover: null,
    };
  },
  computed: {
    publicInfo() {
      return this.$store.state.baseData.publicInfo;
    },
    lan() {
      if (this.$store.state.baseData) {
        return this.$store.state.baseData.lan;
      }
      return 'en_US';
    },
    Dskin() {
      let str = '';
      if (this.userSkin) {
        str = this.userSkin;
      } else if (getCookie('defSkin') || getCookie('cusSkin')) {
        if (getCookie('cusSkin')) {
          str = getCookie('cusSkin');
        } else {
          str = getCookie('defSkin');
        }
      }
      return str;
    },
    layoutImg() {
      return [
        imgMap.tradeLayout_1,
        imgMap.tradeLayout_2,
      ];
    },
    colorList() {
      let arr = [];
      let skinType = [];
      if (this.publicInfo) {
        skinType = this.publicInfo.skinType || [];
      }

      if (this.publicInfo && skinType.length) {
        arr = skinType;
      } else if (this.publicInfo
        && this.publicInfo.skin
        && this.publicInfo.skin.listist) {
        arr = this.publicInfo.skin.listist;
      }
      return arr;
    },
    activeName() {
      return this.$route.meta.activeName;
    },
  },
  methods: {
    init() {
      // this.$bus.$on('tradePageChange', (val) => {
      //   this.tradePage = val;
      // });
      // if (this.$route.query.tradePage) {
      //   this.tradePage = this.$route.query.tradePage;
      // }
    },
    // 设置皮肤
    setSkin(id) {
      this.userSkin = id;
      setCookie('cusSkin', this.userSkin);
      if (this.userSkin !== this.userSkinOrg) {
        window.location.reload();
      }
    },
    setClose() {
      this.hide = true;
      setTimeout(() => {
        this.hide = false;
        this.$bus.$emit('openSetting', false);
      }, 500);
    },
    // 设置布局方式
    setLayout(type) {
      const { path } = this.$route;
      this.layout = type;
      setCookie('newTrade_layout', this.layout);
      let replaceStr = 'proTrade';
      if (this.activeName === 'proTradeMargin' || this.activeName === 'marginTrade') {
        replaceStr = 'proTradeMargin';
        if (this.layout !== this.layoutOrg) {
          if (type === 'ord') {
            window.location.href = path.replace(replaceStr, 'margin');
          } else {
            window.location.href = path.replace('margin', replaceStr);
          }
        }
        return;
      }
      if (this.layout !== this.layoutOrg) {
        if (type === 'ord') {
          window.location.href = path.replace(replaceStr, 'trade');
        } else {
          window.location.href = path.replace('trade', replaceStr);
        }
      }
    },
  },
};
