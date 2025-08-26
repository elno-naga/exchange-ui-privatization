import { colorMap, browser } from '@/utils';
import worker from '@/utils/webWorker';

export default {
  name: 'app',
  data() {
    return {
      timer: null,
      hideheade: true,
      hideFooter: true,
      hideNav: false,
      userActivite: false,
      userTime: 0,
      userTimer: null,
      setTimer: null,
      moving: false,
      wsClosed: false,
      fullWidth: document.documentElement.clientWidth,
      findFlagLoad: 0,
    };
  },
  mounted() {
    // 设置宽度
    this.setW();
    // 绑定一个 resize 事件,给 bus emit WINFOW_ON_RESIIZE 事件,值为浏览器 clientWidth
    window.onresize = () => {
      this.$bus.$emit('WINFOW_ON_RESIIZE', document.body.clientWidth);
      const now = new Date().getTime();
      this.findFlagLoad = now;
      setTimeout(() => {
        if (this.findFlagLoad === now) {
          this.setW();
        }
      }, 80);
    };
  },
  watch: {
    phoneCode() {
      this.filterPhoneCode(this.limitCountryList);
    },
    limitCountryList: {
      handler(val) {
        this.filterPhoneCode(val);
      },
      immediate: true,
    },
    mustLogin(newMeta) {
      setTimeout(() => {
        if (this.loginFlag === '1' && newMeta) {
          this.$router.push('/login');
        }
      }, 500);
    },
    url(url) {
      if (url) {
        this.goM();
      }
      if (url && url.coUrl) {
        this.$store.dispatch('getFutorePublicInfo');
      }
    },
    loginFlag(val) {
      if (val === '2') {
        clearInterval(this.timer);
        this.$store.dispatch('getMessage_count');
        this.timer = setInterval(() => {
          this.$store.dispatch('getMessage_count');
        }, 15000);
      } else {
        clearInterval(this.timer);
      }
    },
    routeMeta(val) {
      // 国际版有些页面不显示header
      if (this.templateLayoutType === '2' && val.hideHeade) {
        this.hideheade = true;
      } else if (val.hideHeade === 'visitLimit') {
        this.hideheade = true;
      } else {
        this.hideheade = false;
      }

      // 是否显示 navigation
      if (val.hideNav) {
        this.hideNav = true;
      } else {
        this.hideNav = false;
      }
      // 国际版有些页面不显示footer
      if (this.templateLayoutType === '2' && val.hideFooter !== 'false') {
        this.hideFooter = true;
      } else {
        this.hideFooter = false;
      }
      if (val.hideFooter === 'MandatoryHide') {
        this.hideFooter = true;
      }
      if (val.hideFooter === 'tradeHideFooter') {
        this.hideFooter = true;
      }
    },
    templateLayoutType(val) {
      if (val === '2' && this.routeMeta.hideFooter !== 'false') {
        this.hideFooter = true;
      } else if (this.routeMeta.hideFooter === 'MandatoryHide') {
        this.hideFooter = true;
      } else if (this.routeMeta.hideFooter === 'tradeHideFooter') {
        this.hideFooter = true;
      } else {
        this.hideFooter = false;
      }
    },
    $route(to) {
      if (to.name !== 'serviceLimit') {
        this.getVisitStatus();
      }
    },
  },
  computed: {
    phoneCode() {
      return this.$t('phoneCode');
    },
    limitCountryList() {
      return this.$store.state.baseData.limitCountryList;
    },
    worker() {
      return worker();
    },
    templateLayoutType() {
      return this.$store.state.baseData.templateLayoutType;
    },
    routeMeta() {
      return this.$route.meta;
    },
    navigationType() {
      if (
        this.templateLayoutType === '2'
        && this.$route.meta.navigation !== '1'
      ) {
        return '2';
      }
      return '1';
    },
    routeTheme() {
      return this.$route.meta.theme;
    },
    // 底色 主题背景色
    pageTheme() {
      let layoutClass = 'Chainer';
      if (this.templateLayoutType === '2' && this.navigationType === '2') {
        layoutClass = 'Int';
      }
      if (this.routeTheme && this.routeTheme === 'homeOther') {
        return `fill-1-bg ${layoutClass}`;
      }
      return `fill-1-bg ${layoutClass}`;
    },
    // 头部别景色
    headClass() {
      if (this.routeTheme && this.routeTheme === 'homeOther') {
        return 'fill-2-bg';
      }
      return 'fill-2-bg';
    },
    // 底部 上边距
    footerClass() {
      const arr = [];
      if (this.routeTheme && this.routeTheme === 'homeOther') {
        arr.push('fill-2-bg fill-6-bd');
      } else {
        arr.push('fill-2-bg fill-6-bd');
      }
      if (this.$route.meta.footNotMrgin) {
        arr.push('no-margin');
      }
      return arr;
    },
    mustLogin() {
      return this.$route.meta.mustLogin;
    },
    publicInfo() {
      const info = this.$store.state.baseData.publicInfo || {};
      return info;
    },
    url() {
      return this.publicInfo.url || {};
    },
    loginFlag() {
      const { isLogin, userInfoIsReady } = this.$store.state.baseData;
      if (!isLogin && userInfoIsReady) {
        return '1';
      }
      return '2';
    },
    isV5Header() {
      // 是否开启5.0 header
      return true;
      // const { path } = this.$route;
      // const tempList = ['1', '2', '3', '4'];
      // // 专业版不显示5.0header
      // if (path && path.indexOf('proTrade') > -1) {
      //   return false;
      // }
      // if (this.publicInfo && this.publicInfo.switch) {
      //   // eslint-disable-next-line camelcase
      //   const { index_temp_type } = this.publicInfo.switch;
      //   if (tempList.indexOf(index_temp_type.toString()) > -1) {
      //     return true;
      //   }
      // }
      // return false;
    },
  },
  methods: {
    // 区域IP访问限制 0 不限 1 限制
    getVisitStatus() {
      this.axios({
        // url: '/common/checkVisitStatus',
        url: 'limit_ip_login',
      }).then((data) => {
        if (data.code === '109109') {
          window.sessionStorage.setItem('LimitCountryNames', data.msg);
          this.$router.push('serviceLimit');
        }
      });
    },
    setW() {
      window.fullWidth = document.documentElement.clientWidth;
      this.fullWidth = window.fullWidth;
      this.$store.dispatch('setDefindTemplateLayoutType', window.fullWidth);
    },
    filterPhoneCode(val) {
      if (this.phoneCode.A.length) {
        if (val.length) {
          Object.keys(this.phoneCode).forEach((item) => {
            this.phoneCode[item] = this.phoneCode[item].filter((vitem) => {
              const valueArr = vitem.split('+');
              return val.indexOf(valueArr[2]) === -1;
            });
          });
        }

        this.$store.dispatch('setPhoneCodeGlobal', this.phoneCode);
      }
    },
    reload() {
      if (this.wsClosed) {
        window.location.reload();
      }
    },
    setTiming() {
      this.userActivite = true;
      this.userTime = 0;
      clearTimeout(this.userTimer);
      this.userTimer = null;
      clearTimeout(this.setTimer);
      this.setTimer = null;
      this.moving = true;
      this.setTimer = setTimeout(() => {
        this.moving = false;
        this.userActivite = false;
        if (!this.moving) {
          this.timing();
        }
      }, 1000);
    },
    timing() {
      clearTimeout(this.userTimer);
      this.userTimer = null;
      this.userTimer = setTimeout(() => {
        this.userTime += 1;
        if (this.userTime > 7200) {
          this.userActivite = true;
          window.localtion.reload();
          this.worker.postMessage({
            type: 'CLOSE_WEBSOCKET',
          });
          this.wsClosed = true;
        }
        if (!this.userActivite) {
          this.timing();
        }
      }, 1000);
    },
    goM() {
      if (this.url.mexUrl) {
        if (browser.isPhone || browser.isAndroid) {
          window.location.href = this.url.mexUrl;
        }
      }
    },
    setStyle() {
      if (colorMap) {
        const str = `
          input::-webkit-input-placeholder {
            color: ${colorMap['text-3-cl']};
          }
          input::-moz-placeholder {
            color: ${colorMap['text-3-cl']};
          }
          input::-moz-placeholder {
            color: ${colorMap['text-3-cl']};
          }
          input::-ms-input-placeholder {
            color: ${colorMap['text-3-cl']};
          }
          #common-AliyunCaptcha .nc_scale {
            background: ${colorMap['fill-2-bg']};
          }
          #common-AliyunCaptcha .clickCaptcha {
            background: ${colorMap['fill-2-bg']};
          }
          #common-AliyunCaptcha .nc-container .nc_scale .clickCaptcha div {
            background: ${colorMap['fill-2-bg']};
          }
          #common-AliyunCaptcha .nc_scale .btn_slide {
            background: ${colorMap['fill-3-bg']};
            color: ${colorMap['text-2-cl']};
          }
          #common-AliyunCaptcha .scale_text.scale_text.slidetounlock span[data-nc-lang="_startTEXT"] {
            -webkit-text-fill-color: ${colorMap['text-2-cl']};
          }
          #common-AliyunCaptcha .nc_scale .nc_bg {
            background: ${colorMap['fill-2-bg']};
          }
          #common-AliyunCaptcha .nc_scale .scale_text2 {
            color: ${colorMap['text-2-cl']};
            background: ${colorMap['fill-2-bg']};
          }
          #common-AliyunCaptcha .nc_scale .btn_ok {
            background: ${colorMap['fill-3-bg']};
            color: ${colorMap['text-2-cl']};
          }
          #common-AliyunCaptcha .imgCaptcha {
            background: ${colorMap['fill-2-bg']}!important;
          }
          #common-AliyunCaptcha .imgCaptcha_text {
            background: ${colorMap['fill-2-bg']}!important;
            border-bottom-color: ${colorMap['text-1-bd']}!important;
          }
          #common-AliyunCaptcha .imgCaptcha_text input {
            background: ${colorMap['fill-2-bg']}!important;
            color: ${colorMap['text-2-cl']}!important;
          }
          #common-AliyunCaptcha .nc_scale_submit {
            background: ${colorMap['main-1-bg']};
          }
          #common-AliyunCaptcha .icon_close {
            color: ${colorMap['fall-1-cl']};
          }
          input:-webkit-autofill , textarea:-webkit-autofill, select:-webkit-autofill {
            -webkit-box-shadow: 0px 0px 0px 1000px ${colorMap['fill-3-bg']} inset;
            -webkit-text-fill-color: ${colorMap['text-2-cl']};
          }
          input{
            caret-color: ${colorMap['text-1-cl']};
          }
          ::-webkit-scrollbar {
            width: 4px;
            height: 4px;
          }
          ::-webkit-scrollbar-track {
            background: ${colorMap['fill-6-bg']};
            border-radius: 4px;
          }
          ::-webkit-scrollbar-thumb {
            background: ${colorMap['fill-5-bg']};
            border-radius: 4px;
          }
          * {
            scrollbar-color: ${colorMap['fill-5-bg']} ${colorMap['fill-6-bg']};
            scrollbar-width: thin;
          }
        `;
        const nod = document.createElement('style');
        nod.type = 'text/css';
        if (nod.styleSheet) {
          // ie下
          nod.styleSheet.cssText = str;
        } else {
          nod.innerHTML = str; // 或者写成 nod.appendChild(document.createTextNode(str))
        }
        document.getElementsByTagName('head')[0].appendChild(nod);
      }
    },
  },
};
