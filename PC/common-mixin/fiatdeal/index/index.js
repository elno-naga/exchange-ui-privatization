import { myStorage, getIconPath } from '@/utils';

export default {
  name: 'index',
  watch: {
    otcPublicInfo: {
      immediate: true,
      handler(v) {
        if (!v) return;
        if (this.$route.query.side) {
          this.navListActive = this.$route.query.side === 'BUY' ? 'ordinaryBuy' : 'ordinarySell';
          this.clickName = this.$route.query.side === 'BUY' ? 'ordinaryBuy' : 'ordinarySell';
        } else if (v.defaultSeach && v.defaultSeach.toUpperCase() === 'BUY') {
          this.navListActive = 'ordinaryBuy';
          this.clickName = 'ordinaryBuy';
        } else {
          this.navListActive = 'ordinarySell';
          this.clickName = 'ordinarySell';
        }
      },
    },
  },
  computed: {
    fiatTradeOpen() {
      const base = this.$store.state.baseData.publicInfo;
      if (base && base.switch && base.switch.fiat_trade_open === '1') {
        return true;
      }
      return false;
    },
    otcPublicInfo() { return this.$store.state.baseData.otcPublicInfo; },
    templateLayoutType() {
      return this.$store.state.baseData.templateLayoutType;
    },
    userInfo() {
      return this.$store.state.baseData.userInfo || {};
    },
    userCompanyInfo() {
      return this.userInfo.userCompanyInfo || {};
    },
    otcCompanyInfo() {
      return this.userInfo.otcCompanyInfo || {};
    },
    companyStatus() {
      return Number(this.otcCompanyInfo.status);
    },
    applyStatus() {
      return Number(this.userCompanyInfo.applyStatus);
    },
    isBigDeal() {
      return Number(this.$store.state.baseData.is_open_bigDeal);
    },
    applyRuleStatus() {
      return Number(this.userCompanyInfo.status);
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
    navList() {
      const arr = [
        {
          iconClass: 'iconClass',
          activeNavClass: 'text-1-cl fill-3-bg',
          navText: this.$t('fiatdeal.navList')[0],
          href: '',
          type: 1,
          activeIconSvg: `<svg
                class="icon icon-16"
                viewBox="0 0 1024 1024">
                ${getIconPath('paymentMethod', 'main-1-cl')}
            </svg>`,
          iconSvg: `<svg
                class="icon icon-16"
                viewBox="0 0 1024 1024">
                ${getIconPath('paymentMethod', 'special-4-cl')}
            </svg>`,
          id: 'ordinary',
        },
        {
          iconClass: 'iconClass',
          activeNavClass: 'text-1-cl fill-3-bg',
          navText: this.$t('fiatdeal.navList')[1],
          href: '',
          type: 2,
          activeIconSvg: '',
          iconSvg: '',
          id: 'ordinaryBuy',
        },
        {
          iconClass: 'iconClass',
          activeNavClass: 'text-1-cl fill-3-bg',
          navText: this.$t('fiatdeal.navList')[2],
          href: '',
          type: 2,
          activeIconSvg: '',
          iconSvg: '',
          id: 'ordinarySell',
        },
      ];
      if (this.isBigDeal) {
        arr.push(
          {
            iconClass: 'iconClass',
            activeNavClass: 'text-1-cl fill-3-bg',
            navText: this.$t('fiatdeal.navList')[3],
            href: '',
            type: 1,
            activeIconSvg: `<svg
                class="icon icon-16"
                viewBox="0 0 1024 1024">
                ${getIconPath('letter', 'main-1-cl')}
            </svg>`,
            iconSvg: `<svg
                class="icon icon-16"
                viewBox="0 0 1024 1024">
                ${getIconPath('letter', 'special-4-cl')}
            </svg>`,
            id: 'bulk',
          },
          {
            iconClass: 'iconClass',
            activeNavClass: 'text-1-cl fill-3-bg',
            navText: this.$t('fiatdeal.navList')[4],
            href: '',
            type: 2,
            activeIconSvg: '',
            iconSvg: '',
            id: 'bulkBuy',
          },
          {
            iconClass: 'iconClass',
            activeNavClass: 'text-1-cl fill-3-bg',
            navText: this.$t('fiatdeal.navList')[5],
            href: '',
            type: 2,
            activeIconSvg: '',
            iconSvg: '',
            id: 'bulkSell',
          },
        );
      }
      arr.push(
        {
          iconClass: 'iconClass',
          activeNavClass: 'text-1-cl fill-3-bg',
          navText: this.$t('fiatdeal.navList')[6],
          href: '',
          type: 1,
          activeIconSvg: `<svg
                class="icon icon-16"
                viewBox="0 0 1024 1024">
                ${getIconPath('aircraft', 'main-1-cl')}
            </svg>`,
          iconSvg: `<svg
                class="icon icon-16"
                viewBox="0 0 1024 1024">
                ${getIconPath('aircraft', 'special-4-cl')}
            </svg>`,
          id: 'advertising',
        },
      );
      if (this.companyStatus) {
        arr.push(
          {
            iconClass: 'iconClass',
            activeNavClass: 'text-1-cl fill-3-bg',
            navText: this.$t('fiatdeal.navList')[7],
            href: '',
            type: 1,
            activeIconSvg: `<svg
            class="icon icon-16"
            viewBox="0 0 1024 1024">
            ${getIconPath('mcc', 'main-1-cl')}
            </svg>`,
            iconSvg: `<svg
              className="icon icon-16"
              viewBox="0 0 1024 1024">
              ${getIconPath('mcc', 'special-4-cl')}
            </svg>`,
            id: 'companyApplication',
          },
        );
      }
      return arr;
    },
  },
  methods: {
    init() {
      if (this.navList.length) {
        this.navList.forEach((item) => {
          if (this.navListActive === item.id) {
            this.pageTitleText = item.navText;
          }
        });
      }
    },
    listChanges(data) {
      const { applyStatus } = this;
      const companyAppling = myStorage.get('companyAppling');
      if (this.navListActive !== data.id && data.id !== this.clickName) {
        if (data.id === 'ordinary') {
          this.navListActive = 'ordinaryBuy';
        } else if (data.id === 'bulk') {
          this.navListActive = 'bulkBuy';
        } else {
          if (data.id === 'advertising') {
            this.$router.push('/otcRelease');
            return;
          }
          if (data.id === 'companyApplication') {
            if (applyStatus === 1 && !companyAppling) {
              this.$router.push('/companyApplicationDetail');
              myStorage.set('companyAppling', true);
            } else {
              this.$router.push('/companyApplication');
            }
            return;
          }
          this.navListActive = data.id;
        }
        const info = {
          side: data.id,
        };
        this.$store.dispatch('sideIsBlockTrade', info);
        this.$store.dispatch('setFlag', true);
      }
      this.clickName = data.id;
      this.pageTitleText = data.navText;
      // this.$router.push('/fiatdeal/center');
    },
  },
  data() {
    return {
      getIconPath,
      clickName: '',
      navListActive: 'ordinaryBuy',
      pageTitleText: null,
    };
  },
};
