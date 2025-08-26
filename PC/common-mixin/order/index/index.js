import { getIconPath, getCookie } from '@/utils';

export default {
  name: 'order',
  data() {
    return {
      navListActive: 'exchangeOrder',
      pageTitleText: null,
      hoverNav: null,
      getIconPath,
      userSkin: getCookie('cusSkin') || getCookie('defSkin'), // 用户选择的skin
    };
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
      const isCoModule = data.id === 'coOrder';
      const jumpCo = isCoModule && window.HOSTAPI !== 'co';
      const jumpEx = !isCoModule && window.HOSTAPI === 'co';
      if (jumpCo || jumpEx) {
        // 走href
        const paths = this.$route.path.split('/');
        paths[paths.length - 1] = data.id;
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
    fiatTradeOpen() {
      const base = this.$store.state.baseData.publicInfo;
      if (base && base.switch && base.switch.fiat_trade_open === '1') {
        return true;
      }
      return false;
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
    templateLayoutType() {
      return this.$store.state.baseData.templateLayoutType;
    },
    navList() {
      const arr = [];
      if (this.linkurl.exUrl) {
        // 现货订单
        arr.push({
          iconClass: 'iconClass',
          navText: this.isSaleBol ? this.$t('sale.texta17') : this.$t('order.index.exOrder'),
          href: '',
          type: 1,
          navClass: 'text-2-cl',
          activeNavClass: 'text-1-cl fill-3-bg',
          activeIconSvg: `<svg class="icon icon-16" viewBox="0 0 1024 1024">
            ${getIconPath('order_spot', 'text-1-cl')}
          </svg>`,
          iconSvg: `<svg class="icon icon-16" viewBox="0 0 1024 1024">
            ${getIconPath('order_spot', 'special-4-cl')}
          </svg>`,
          id: 'exchangeOrder',
        });
      }
      if (this.isSaleBol) {
        // 贩卖所
        arr.push({
          iconClass: 'iconClass',
          navText: this.$t('sale.texta16'),
          href: '',
          type: 1,
          navClass: 'text-2-cl',
          activeNavClass: 'text-1-cl fill-3-bg',
          activeIconSvg: `<svg class="icon icon-16" viewBox="0 0 1024 1024">
            ${getIconPath('order_spot', 'text-1-cl')}
          </svg>`,
          iconSvg: `<svg class="icon icon-16" viewBox="0 0 1024 1024">
            ${getIconPath('order_spot', 'special-4-cl')}
          </svg>`,
          id: 'saleOrder',
        });
      }
      // 法币订单
      if (this.linkurl.otcUrl || this.saasOtcFlowConfig) {
        arr.push({
          iconClass: 'iconClass',
          navText: !this.fiatTradeOpen
            ? this.$t('order.index.otcOrder')
            : this.$t('assets.b2c.otcShow.otcOrder'),
          href: '',
          type: 1,
          navClass: 'text-2-cl',
          activeNavClass: 'text-1-cl fill-3-bg',
          activeIconSvg: `<svg class="icon icon-16" viewBox="0 0 1024 1024">
            ${getIconPath('order_c2c', 'text-1-cl')}
          </svg>`,
          iconSvg: `<svg class="icon icon-16" viewBox="0 0 1024 1024">
            ${getIconPath('order_c2c', 'special-4-cl')}
          </svg>`,
          id: 'otcOrder',
        });
      }
      // 合约订单',
      if (this.linkurl.coUrl) {
        arr.push({
          iconClass: 'iconClass',
          navText: this.$t('order.coOrder.coOrder'),
          href: '',
          type: 1,
          navClass: 'text-2-cl',
          activeNavClass: 'text-1-cl fill-3-bg',
          activeIconSvg: `<svg class="icon icon-16" viewBox="0 0 1024 1024">
              ${getIconPath('order_contract', 'text-1-cl')}
              </svg>`,
          iconSvg: `<svg class="icon icon-16" viewBox="0 0 1024 1024">
            ${getIconPath('order_contract', 'special-4-cl')}
          </svg>`,
          id: 'coOrder',
        });
      }

      // 杠杆订单
      if (this.leverOpen === 1) {
        arr.push({
          iconClass: 'iconClass',
          navText: this.$t('order.index.leverage'),
          href: '',
          type: 1,
          navClass: 'text-2-cl',
          activeNavClass: 'text-1-cl fill-3-bg',
          activeIconSvg: `<svg class="icon icon-16" viewBox="0 0 1024 1024">
              ${getIconPath('order_lever', 'text-1-cl')}
              </svg>`,
          iconSvg: `<svg class="icon icon-16" viewBox="0 0 1024 1024">
              ${getIconPath('order_lever', 'special-4-cl')}
            </svg>`,
          id: 'leverageOrder',
        });
      }
      return arr;
    },
    linkurl() {
      if (this.$store.state.baseData.publicInfo) {
        return this.$store.state.baseData.publicInfo.url;
      }
      return {};
    },
    metaText() { return this.$route.meta.navName; },
    leverOpen() {
      return this.$store.state.baseData.lever_open;
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
  },
};
