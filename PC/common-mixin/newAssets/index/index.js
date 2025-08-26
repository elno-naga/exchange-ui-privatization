import { getCookie, getIconPath, imgMap } from '@/utils';

export default {
  name: 'newAssets',
  data() {
    return {
      imgMap,
      userSkin: getCookie('cusSkin') || getCookie('defSkin'), // 用户选择的skin
      navListActive: 'totalAssets',
      hoverNav: null,
      pageTitleText: null,
      clientWidth: null,
    };
  },
  created() {
    this.clientWidth = document.body.clientWidth;
    this.$bus.$on('WINFOW_ON_RESIIZE', () => {
      this.clientWidth = document.body.clientWidth;
    });
  },
  methods: {
    init() {
      this.navListActive = this.$route.meta.navName;
      if (this.navList.length) {
        this.navList.forEach((item) => {
          if (this.navListActive === item.id) {
            this.pageTitleText = item.navText;
          }
        });
      }
    },
    listChanges(data) {
      const isCoModule = (data.id === 'coFlowingWater' || data.id === 'coAccount');
      const jumpCo = isCoModule && window.HOSTAPI !== 'co';
      const jumpEx = !isCoModule && window.HOSTAPI === 'co';
      if (jumpCo || jumpEx) {
        // 走href
        const paths = this.$route.path.split('/');
        paths[paths.length - 1] = data.id;
        paths[paths.length - 2] = 'assets';
        const hasLan = paths.join('/').indexOf(`/${this.lan}/`) !== -1;
        const baseDomain = jumpCo ? this.linkurl.coUrl : this.linkurl.exUrl;
        window.location.href = `${baseDomain}${hasLan ? '' : `/${this.lan}`}${paths.join('/')}`;
      } else {
        this.$router.push(data.id);
        this.navListActive = data.id;
        this.pageTitleText = data.navText;
      }
    },
  },
  watch: {
    metaText(v) {
      this.navListActive = v;
    },
  },
  computed: {
    lan() {
      if (this.$store.state.baseData) {
        return this.$store.state.baseData.lan;
      }
      return null;
    },
    functionSwitch() {
      return this.$store.state.baseData.functionSwitch;
    },
    isSaleBol() {
      let bol = false;
      if (this.functionSwitch && this.functionSwitch.jpSpotSwitch === 1) {
        bol = true;
      }
      return bol;
    },
    // 显示资产nav
    showNav() {
      return this.$route.meta.showAssetsNav;
    },
    publicInfo() { return this.$store.state.baseData.publicInfo; },
    saasOtcFlowConfig() {
      let flag = false;
      if (this.publicInfo && this.publicInfo.switch
        && this.publicInfo.switch.saas_otc_flow_config
        && this.publicInfo.switch.saas_otc_flow_config.toString() === '1') {
        flag = true;
      }
      return flag;
    },
    fiatTradeOpen() {
      const base = this.$store.state.baseData.publicInfo;
      if (base && base.switch && base.switch.fiat_trade_open === '1') {
        return true;
      }
      return false;
    },
    lineHidth1() {
      if (this.templateLayoutType === '2') {
        return '80';
      }
      return '56';
    },
    subLineHidth() {
      if (this.templateLayoutType === '2') {
        return '60';
      }
      return '56';
    },
    isCoOpen() {
      const base = this.$store.state.baseData.publicInfo;
      if (base && base.switch && base.switch.indep_co_switch === '1') {
        return true;
      }
      return false;
    },
    navList() {
      let arr = [
        // 资产总览
        {
          iconClass: 'iconClass',
          navText: this.$t('assets.total'),
          navClass: 'text-2-cl',
          activeNavClass: 'text-1-cl fill-3-bg',
          href: '',
          type: 1,
          activeIconSvg: `<svg class="icon icon-16" viewBox="0 0 1024 1024">
            ${getIconPath('assets_view', 'text-1-cl')}
          </svg>`,
          iconSvg: `<svg class="icon icon-16" viewBox="0 0 1024 1024">
            ${getIconPath('assets_view', 'special-4-cl')}
          </svg>`,
          id: 'totalAssets',
        },
        // 现货账户
        {
          iconClass: 'iconClass',
          // eslint-disable-next-line no-nested-ternary
          navText: this.isSaleBol ? `${this.$t('sale.texta33')}` : (this.isCoOpen ? this.$t('assets.index.coExchangeAccount') : this.$t('assets.index.exchangeAccount')),
          navClass: 'text-2-cl',
          activeNavClass: 'text-1-cl fill-3-bg',
          href: '',
          type: 1,
          activeIconSvg: `<svg class="icon icon-16" viewBox="0 0 1024 1024">
            ${getIconPath('assets_spot', 'text-1-cl')}
          </svg>`,
          iconSvg: `<svg class="icon icon-16" viewBox="0 0 1024 1024">
            ${getIconPath('assets_spot', 'special-4-cl')}
          </svg>`,
          id: 'exchangeAccount',
        },
      ];
      const otcArr = [
        // 法币账户
        {
          iconClass: 'iconClass',
          navText: this.$t('assets.b2c.otcShow.otcAccount'),
          navClass: 'text-2-cl',
          activeNavClass: 'text-1-cl fill-3-bg',
          href: '',
          type: 1,
          activeIconSvg: `<svg class="icon icon-16" viewBox="0 0 1024 1024">
            ${getIconPath('assets_c2c', 'text-1-cl')}
          </svg>`,
          iconSvg: `<svg class="icon icon-16" viewBox="0 0 1024 1024">
            ${getIconPath('assets_c2c', 'special-4-cl')}
          </svg>`,
          id: 'otcAccount',
        },
      ];
      if (this.linkurl.otcUrl || this.saasOtcFlowConfig) {
        arr = arr.concat(otcArr);
      }

      if (this.linkurl.coUrl) {
        arr = [
          ...arr,
          ...[
            {
              iconClass: 'iconClass',
              class: 'ev-h5-hide',
              navText: this.$t('assets.index.coAccount'),
              navClass: 'text-2-cl',
              activeNavClass: 'text-1-cl fill-3-bg',
              href: '',
              type: 1,
              activeIconSvg: `<svg class="icon icon-16" viewBox="0 0 1024 1024">
                ${getIconPath('assets_contract', 'text-1-cl')}
              </svg>`,
              iconSvg: `<svg class="icon icon-16" viewBox="0 0 1024 1024">
                ${getIconPath('assets_contract', 'special-4-cl')}
              </svg>`,
              id: 'coAccount',
            },
          ],
        ];
      }
      if (this.leverOpen === 1) {
        const leverageArr = [
          {
            iconClass: 'iconClass',
            navText: this.$t('assets.index.leverage'),
            navClass: 'text-2-cl',
            activeNavClass: 'text-1-cl fill-3-bg',
            href: '',
            type: 1,
            activeIconSvg: `<svg class="icon icon-16" viewBox="0 0 1024 1024">
              ${getIconPath('assets_lever', 'text-1-cl')}
            </svg>`,
            iconSvg: `<svg class="icon icon-16" viewBox="0 0 1024 1024">
              ${getIconPath('assets_lever', 'special-4-cl')}
            </svg>`,
            id: 'leverageAccount',
          },
        ];
        arr = [...arr, ...leverageArr];
      }

      return arr;
    },
    linkurl() {
      if (this.$store.state.baseData.publicInfo) {
        return this.$store.state.baseData.publicInfo.url;
      }
      return {};
    },
    is_deposit_open() {
      return this.$store.state.baseData.is_deposit_open;
    },
    metaText() { return this.$route.meta.navName; },
    loginFlag() {
      const { isLogin, userInfoIsReady } = this.$store.state.baseData;
      if (isLogin && userInfoIsReady) {
        return false;
      }
      return true;
    },
    leverOpen() {
      return this.$store.state.baseData.lever_open;
    },
  },
};
