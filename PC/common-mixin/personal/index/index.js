import { getIconPath } from '@/utils';

export default {
  name: 'personal',
  data() {
    return {
      navListActive: 'userManagement',
      pageTitleText: null,
      coAgentFlag: false, //  控制合约经纪人菜单展示，默认false
      coAgentFlagLoad: false, //  控制合约经纪人菜单展示 接口是否请求成功
      subNavActive: null,
      navExpand: null,
      navList: [],
    };
  },
  methods: {
    init() {
      // this.navListActive = this.$route.meta.navName;
      // if (this.navList.length) {
      //   this.navList.forEach((item) => {
      //     if (this.navListActive === item.id) {
      //       this.pageTitleText = item.navText;
      //     }
      //   });
      // }
      if (this.coinsKrwOpen === '1') {
        this.krwGetUserBack();
      }
      this.getCoAgentFlag();
    },
    getCoAgentFlag() {
      this.axios({
        url: 'common/public',
        // hostType: 'fe-increment-api',
        hostType: 'ex',
      }).then((data) => {
        this.coAgentFlagLoad = true;
        if (data.code.toString() === '0') {
          this.coAgentFlag = data.data.coAgentStatus;
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
    listChanges(data) {
      const { id } = data;
      if (data.children && data.children.length) {
        this.subListChanges(data.children[0]);
      } else {
        const tHost = data.isPersonal ? '' : '/personal';
        this.navListActive = id;
        this.pageTitleText = data.navText;
        this.$router.push(`/${tHost}/${id}`);
        this.$store.dispatch('setModifyApiShow', false);
        this.h5ShowMenus = false;
      }
    },
    subListChanges(subItem) {
      const { id, pId } = subItem;
      this.$router.push(`/personal/${id}`);
      this.subNavActive = id;
      this.navListActive = pId;
      this.pageTitleText = subItem.navText;
      this.$store.dispatch('setModifyApiShow', false);
    },
    // 获取当前用户的银行账号 -- krw定制
    krwGetUserBack() {
      this.$store.dispatch('krwGetUserBank');
    },
    setNavList() {
      const arr = [
        {
          iconClass: 'iconClass',
          navText: this.$t('personal.navMenu.list.userManagement'),
          href: '',
          type: 1,
          activeNavClass: 'text-1-cl fill-3-bg',
          activeIconSvg:
              `<svg class="icon icon-16" viewBox="0 0 1024 1024" width="200" height="200">
            ${getIconPath('personal_userManagement', 'text-1-cl')}
            </svg>`,
          iconSvg:
              `<svg class="icon icon-16" viewBox="0 0 1024 1024" width="200" height="200">
            ${getIconPath('personal_userManagement', 'special-4-cl')}
            </svg>`,
          id: 'userManagement',
        },
        {
          iconClass: 'iconClass',
          navText: this.$t('personal.navMenu.list.safetyRecord'),
          href: '',
          type: 1,
          activeIconSvg:
              `<svg class="icon icon-16" viewBox="0 0 1024 1024" width="200" height="200">
            ${getIconPath('personal_safetyRecord', 'text-1-cl')}
            </svg>`,
          iconSvg:
              `<svg class="icon icon-16" viewBox="0 0 1024 1024" width="200" height="200">
            ${getIconPath('personal_safetyRecord', 'special-4-cl')}
            </svg>`,
          id: 'safetyRecord',
          activeNavClass: 'text-1-cl fill-3-bg',
        },
        {
          iconClass: 'iconClass',
          navText: this.$t('sumSubKyc.identityAuth'),
          href: '',
          type: 1,
          activeIconSvg:
              `<svg class="icon icon-16" viewBox="0 0 1024 1024" width="200" height="200">
            ${getIconPath('personal_kyc', 'text-1-cl')}
            </svg>`,
          iconSvg:
              `<svg class="icon icon-16" viewBox="0 0 1024 1024" width="200" height="200">
            ${getIconPath('personal_kyc', 'special-4-cl')}
            </svg>`,
          id: 'identityAuthen',
          activeNavClass: 'text-1-cl fill-3-bg',
        },
      ];

      // 子账户
      // 实名认证用户并且认证通过后显示
      if (this.userInfo && this.userInfo.authLevel.toString() === '1' && this.userInfo.isSub !== undefined && this.userInfo.isSub.toString() !== '1') {
        arr.push(
          // 个人中心-子账号
          {
            iconClass: 'iconClass',
            navText: this.$t('personal.navMenu.list.subAccount'),
            href: '',
            type: 1,
            activeNavClass: 'text-1-cl fill-3-bg',
            activeIconSvg:
                  `<svg class="icon icon-16" viewBox="0 0 1024 1024" width="200" height="200">
              ${getIconPath('personal_subAccount', 'text-1-cl')}
              </svg>`,
            iconSvg: `<svg class="icon icon-16" viewBox="0 0 1024 1024" width="200" height="200">
              ${getIconPath('personal_subAccount', 'special-4-cl')}
              </svg>`,
            id: 'subAccount',
            children: [
              // 个人中心-子账号-账户管理
              {
                iconClass: 'iconClass',
                navText: this.$t('personal.navMenu.list.subAccountChild.nav1'),
                href: '',
                type: 2,
                activeNavClass: 'text-1-cl fill-3-bg',
                activeIconSvg: '',
                iconSvg: '',
                id: 'subManagement',
                pId: 'subAccount',
              },
              // 个人中心-子账号-API管理
              {
                iconClass: 'iconClass',
                navText: this.$t('personal.navMenu.list.subAccountChild.nav2'),
                href: '',
                type: 2,
                activeNavClass: 'text-1-cl fill-3-bg',
                activeIconSvg: '',
                iconSvg: '',
                id: 'subApiManagement',
                pId: 'subAccount',
              },
              // 个人中心-子账号-资产管理
              {
                iconClass: 'iconClass',
                navText: this.$t('personal.navMenu.list.subAccountChild.nav3'),
                href: '',
                type: 2,
                activeNavClass: 'text-1-cl fill-3-bg',
                activeIconSvg: '',
                iconSvg: '',
                id: 'subAssetManagement',
                pId: 'subAccount',
              },
              // 个人中心-子账号-订单管理
              {
                iconClass: 'iconClass',
                navText: this.$t('personal.navMenu.list.subAccountChild.nav4'),
                href: '',
                type: 2,
                activeNavClass: 'text-1-cl fill-3-bg',
                activeIconSvg: '',
                iconSvg: '',
                id: 'subOrderManagement',
                pId: 'subAccount',
              },
              // 个人中心-子账号-钱包历史记录
              {
                iconClass: 'iconClass',
                navText: this.$t('personal.navMenu.list.subAccountChild.nav5'),
                href: '',
                type: 2,
                activeNavClass: 'text-1-cl fill-3-bg',
                activeIconSvg: '',
                iconSvg: '',
                id: 'subWalletHistory',
                pId: 'subAccount',
              },
              // 个人中心-子账号-登录记录
              {
                iconClass: 'iconClass',
                navText: this.$t('personal.navMenu.list.subAccountChild.nav6'),
                href: '',
                type: 2,
                activeNavClass: 'text-1-cl fill-3-bg',
                activeIconSvg: '',
                iconSvg: '',
                id: 'subLoginRecord',
                pId: 'subAccount',
              },
            ],
          },
        );
      }

      if (this.linkurl.otcUrl) {
        arr.push(
          {
            iconClass: 'iconClass',
            navText: this.$t('personal.navMenu.list.leaglTenderSetNew'),
            href: '',
            type: 1,
            activeIconSvg:
                  `<svg class="icon icon-16" viewBox="0 0 1024 1024" width="200" height="200">
              ${getIconPath('personal_c2c', 'text-1-cl')}
              </svg>`,
            iconSvg:
                  `<svg class="icon icon-16" viewBox="0 0 1024 1024" width="200" height="200">
              ${getIconPath('personal_c2c', 'special-4-cl')}
              </svg>`,
            id: 'leaglTenderSet',
            activeNavClass: 'text-1-cl fill-3-bg',
          },
          {
            iconClass: 'iconClass',
            navText: this.$t('personal.navMenu.list.advertisingManagement'),
            href: '',
            type: 1,
            activeIconSvg:
                  `<svg class="icon icon-16" viewBox="0 0 16 16" width="16" height="16">
              ${getIconPath('personal_ad', 'text-1-cl')}
              </svg>`,
            iconSvg:
                  `<svg class="icon icon-16" viewBox="0 0 16 16" width="16" height="16">
              ${getIconPath('personal_ad', 'special-4-cl')}
              </svg>`,
            id: 'advertisingManagement',
            activeNavClass: 'text-1-cl fill-3-bg',
          },
          {
            iconClass: 'iconClass',
            navText: this.$t('personal.navMenu.list.blackList'),
            href: '',
            type: 1,
            activeIconSvg:
                  `<svg class="icon icon-16" viewBox="0 0 16 16" width="16" height="16">
              ${getIconPath('personal_black', 'text-1-cl')}
              </svg>`,
            iconSvg:
                  `<svg class="icon icon-16" viewBox="0 0 16 16" width="16" height="16">
              ${getIconPath('personal_black', 'special-4-cl')}
              </svg>`,
            id: 'blackList',
            activeNavClass: 'text-1-cl fill-3-bg',
          },
        );
      }
      // arr.push({
      //   iconClass: 'iconClass',
      //   navText: this.$t('personal.navMenu.list.apiManagement'),
      //   href: '',
      //   type: 1,
      //   activeIconSvg:
      //       `<svg class="icon icon-16" viewBox="0 0 1024 1024" width="200" height="200">
      //       ${getIconPath('personal_api', 'text-1-cl')}
      //       </svg>`,
      //   iconSvg:
      //       `<svg class="icon icon-16" viewBox="0 0 1024 1024" width="200" height="200">
      //       ${getIconPath('personal_api', 'special-4-cl')}
      //       </svg>`,
      //   id: 'apiManagement',
      //   activeNavClass: 'text-1-cl fill-3-bg',
      // });
      arr.push({
        iconClass: 'iconClass',
        navText: this.$t('personal.navMenu.list.apiManagement'),
        href: '',
        type: 1,
        activeIconSvg:
            `<svg class="icon icon-16" viewBox="0 0 1024 1024" width="200" height="200">
            ${getIconPath('personal_api', 'text-1-cl')}
            </svg>`,
        iconSvg:
            `<svg class="icon icon-16" viewBox="0 0 1024 1024" width="200" height="200">
            ${getIconPath('personal_api', 'special-4-cl')}
            </svg>`,
        id: 'apiManagement',
        activeNavClass: 'text-1-cl fill-3-bg',
      });
      // 现货经纪人
      if (this.userInfo && this.userInfo.agentStatus === 1) {
        arr.push({
          iconClass: 'iconClass',
          navText: this.$t('brokerSystem.overviewTitle[2]'),
          href: '',
          type: 1,
          activeIconSvg:
              `<svg class="icon icon-16" viewBox="0 0 1024 1024" width="200" height="200">
            ${getIconPath('personal_broker', 'text-1-cl')}
            </svg>`,
          iconSvg:
              `<svg class="icon icon-16" viewBox="0 0 1024 1024" width="200" height="200">
            ${getIconPath('personal_broker', 'special-4-cl')}
            </svg>`,
          id: 'exBroker',
          activeNavClass: 'text-1-cl fill-3-bg',
        });
      }
      // 合约经纪人
      if (this.coAgentFlag) {
        arr.push({
          iconClass: 'iconClass',
          navText: this.$t('brokerSystem.overviewTitle[3]'),
          href: '',
          type: 1,
          activeIconSvg:
              `<svg class="icon icon-16" viewBox="0 0 1024 1024" width="200" height="200">
              ${getIconPath('personal_coBroker', 'text-1-cl')}
              </svg>`,
          iconSvg:
              `<svg class="icon icon-16" viewBox="0 0 1024 1024" width="200" height="200">
              ${getIconPath('personal_coBroker', 'special-4-cl')}
              </svg>`,
          id: 'brokerSystem',
          activeNavClass: 'text-1-cl fill-3-bg',
        });
      }
      this.navList = arr;
    },
  },
  computed: {
    userInfo() { return this.$store.state.baseData.userInfo; },
    userInfoIsReady() { return this.$store.state.baseData.userInfoIsReady; },
    // 隐藏 左导航
    showNav() {
      const { pcHideNav, hidePersonalNav } = this.$route.meta;
      return !pcHideNav && !hidePersonalNav;
    },
    fiatTradeOpen() {
      const base = this.$store.state.baseData.publicInfo;
      if (base && base.switch && base.switch.fiat_trade_open === '1') {
        return true;
      }
      return false;
    },
    templateLayoutType() {
      return this.$store.state.baseData.templateLayoutType;
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
    coinsKrwOpen() {
      const { publicInfo } = this.$store.state.baseData;
      let str = '0';
      if (publicInfo && publicInfo.switch && publicInfo.switch.coins_krw_open) {
        str = publicInfo.switch.coins_krw_open.toString();
      }
      return str;
    },
    linkurl() {
      if (this.$store.state.baseData.publicInfo) {
        return this.$store.state.baseData.publicInfo.url;
      }
      return {};
    },
    navMenuListCondition() {
      return {
        coAgentFlagLoad: this.coAgentFlagLoad,
        userInfoIsReady: this.userInfoIsReady,
        metaText: this.metaText,
      };
    },
    publicInfo() {
      return this.$store.state.baseData.publicInfo;
    },
    metaText() {
      return this.$route.meta.navName;
    },
    subMetaText() {
      return this.$route.meta.subNavName;
    },
    metaNav() {
      return {
        userInfoIsReady: this.userInfoIsReady,
        metaText: this.metaText,
      };
    },
  },
  watch: {
    navMenuListCondition: {
      deep: true,
      handler(value) {
        if (value.userInfoIsReady && value.coAgentFlagLoad) {
          this.setNavList();
          this.navListActive = value.metaText;
          if (this.navList.length) {
            this.navList.forEach((item) => {
              if (this.navListActive === item.id) {
                this.pageTitleText = item.navText;
              }
            });
          }
        }
      },
    },
    coinsKrwOpen(v) {
      if (v === '1') {
        this.krwGetUserBack();
      }
    },
    // metaNav:{
    //   deep:true,
    //   handler(v) {
    //     console.log(this.navList,v,"+++++++")
    //     if(v.userInfoIsReady){
    //       this.$nextTick(()=>{
    //         this.navListActive = v.metaText;
    //       })
    //     }
    //   }
    // },
    subMetaText: {
      immediate: true,
      handler(v) {
        this.subNavActive = v;
      },
    },
  },
};
