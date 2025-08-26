import {
  imgMap, setCookie, getCookie, removeCookie, myStorage, colorMap,
} from '@/utils';
import { getIconPath } from '../../../../utils';
// 注意此处getIconPath不能用@/utils
// 按钮
export default {
  name: 'c-v5-header',
  data() {
    return {
      getIconPath,
      colorMap,
      outFlag: true,
      // langArr: [], // 语言数组
      langHover: '', // 语言滑过
      // currencyHover: '', // 汇率滑过
      langHoverSub: null,
      showFlag: false, // 设置主题弹窗变量
      userSkin: getCookie('cusSkin') || getCookie('defSkin'), // 用户选择的skin
      hoverHeader: '', //
      activeHeader: '',
      hoverMark: '',
      activeMark: '',
      extensionPosition: {},
      isShowHeader: '',
      srcArr: ['innovation', 'appDownload', 'init'], // 自定义头部列表包含该项去重
      symbolCurrent: myStorage.get('sSymbolName'),
      defaultTradePage: window.localStorage.getItem('defaultTradePage') || '5',
      navId: null,
      userCurrency: getCookie('user_Currency') || 'USD',
      currencyList: [], // 汇率列表
      navHover: null, // 划过导航
      subNavHover: null, // 划过次级导航
      headerList: [], // 所有导航 各种语言导航的集合
      contractInfoLogo: 'https://saas-futures.oss-cn-hongkong.aliyuncs.com/nav-icon/Information1.png', // 默认合约信息图标
      contractDataLogo: 'https://saas-futures.oss-cn-hongkong.aliyuncs.com/nav-icon/Data1.png', // 默认合约数据图标
      contractTutorialLogo: 'https://saas-futures.oss-cn-hongkong.aliyuncs.com/nav-icon/Tutorial1.png', // 默认合约信息教程图标
      showDotList: [],
      showTaskCenter: false,
      menu_list: null,
      // 滚动条配置
      ops: {
        scrollPanel: {
          scrollingX: false,
        },
        rail: {
          opacity: '0',
        },
        bar: {
          background: colorMap['fill-6-bg'],
          keepShow: true,
          size: '4px',
          minSize: 0.2,
        },
      },
    };
  },
  props: {
    fullWidth: {
      default: 0,
      type: Number,
    },
    // 是否隐藏导航
    hideNav: {
      type: Boolean,
    },
  },
  watch: {
    lanText() {
      this.headerList = this.handleNavList();
    },
    title() {
      this.modifyTilte();
    },
    $route: {
      handler() {
        this.setActive();
        this.setMarkActive();
      },
      // 深度观察监听
      deep: true,
    },
    market: {
      handler(v) {
        if (v) {
          this.setActive();
        }
      },
      // 深度观察监听
      deep: true,
    },
    router(router) {
      if (router !== null) {
        this.modifyTilte();
      }
    },
    exchangeHide() {
      const { fullPath } = this.$route;
      if (this.exchangeHide && fullPath.indexOf('/order/exchangeOrder') > -1 && this.ieoPoolHide) {
        if (this.orderList.length && this.orderList[0].link) {
          this.$router.push(this.orderList[0].link);
        } else {
          this.ipfsJump('/sly/order/ipfsOrder');
        }
      }
    },
    ieoPoolHide() {
      const { fullPath } = this.$route;
      if (this.exchangeHide && fullPath.indexOf('/order/exchangeOrder') > -1 && this.ieoPoolHide) {
        if (this.orderList.length && this.orderList[0].link) {
          this.$router.push(this.orderList[0].link);
        } else {
          this.ipfsJump('/sly/order/ipfsOrder');
        }
      }
    },
    lan() {
      this.headerList = this.handleNavList();
    },
  },
  computed: {
    // 合约教程
    futuresdocUrl() {
      let url = 'https://futuresdoc.gitbook.io/help-center';
      if (this.$store.state.future && this.$store.state.future.contractProInfo) {
        url = this.$store.state.future.contractProInfo;
      }
      return url;
    },
    functionSwitch() {
      return this.$store.state.baseData.functionSwitch;
    },
    isJpSpotSwitch() {
      let bol = false;
      if (this.functionSwitch && this.functionSwitch.jpSpotSwitch === 1) {
        bol = true;
      }
      return bol;
    },
    uid() {
      return this.userInfo ? this.userInfo.id : '-';
    },
    rate() {
      return this.$store.state.baseData.rate;
    },
    // 汇率
    showCurrency() {
      if (this.userCurrency && this.rate) {
        const currencyItem = this.rate[this.userCurrency];
        return currencyItem ? currencyItem.lang_coin : 'USD';
      }
      return 'USD';
    },
    navType() {
      if (this.publicInfo
        && this.publicInfo.switch
        && this.publicInfo.switch.header_navigation_type) {
        return this.publicInfo.switch.header_navigation_type;
      }
      return '1';
    },
    loginHide() { return this.$store.state.baseData.loginHide; },
    registerHide() { return this.$store.state.baseData.registerHide; },
    loginForbidden() { return this.$store.state.baseData.loginForbidden; },
    registerForbidden() { return this.$store.state.baseData.registerForbidden; },
    // 法币
    fiatTradeOpen() {
      const base = this.$store.state.baseData.publicInfo;
      if (base && base.switch && base.switch.fiat_trade_open === '1') {
        return true;
      }
      return false;
    },
    // 杠杆
    leverFlag() {
      let leverFlag = false;
      if (this.publicInfo && this.publicInfo.switch
        && this.publicInfo.switch.lever_open
        && this.publicInfo.switch.lever_open.toString() === '1') {
        leverFlag = true;
      }
      return leverFlag;
    },
    symbolAll() {
      return this.$store.state.baseData.symbolAll;
    },
    // 全部币种列表
    coinList() {
      if (this.$store.state.baseData && this.$store.state.baseData.market) {
        return this.$store.state.baseData.market.coinList;
      }
      return null;
    },
    // market 接口
    market() { return this.$store.state.baseData.market; },
    saasOtcFlowConfig() {
      let flag = false;
      if (this.publicInfo && this.publicInfo.switch
        && this.publicInfo.switch.saas_otc_flow_config
        && this.publicInfo.switch.saas_otc_flow_config.toString() === '1') {
        flag = true;
      }
      return flag;
    },
    headerTemplateReceived() {
      return this.$store.state.baseData.swiperFlag;
      // return true;
    },
    optionalSymbolServerOpen() {
      return this.$store.state.baseData.optional_symbol_server_open;
    },
    // 是否显示 矿池订单
    ieoPoolHide() {
      let flag = false;
      // 1：显示、 0：不显示
      if (this.publicInfo && this.publicInfo.switch
        && this.publicInfo.switch.ieo_pool_hide
        && this.publicInfo.switch.ieo_pool_hide.toString() === '1') {
        flag = true;
      }
      return flag;
    },
    // 专业版交易页面当前选中的页面标题
    proActiveNavText() {
      let text = '';
      if (this.proTradesSubList.length) {
        this.proTradesSubList.forEach((item) => {
          if (item.activeId === this.activeHeader) {
            text = item.title;
          }
        });
      }
      return text;
    },
    assetsList() {
      const arr = [];
      // 如果开启了矿池 币币资产必须显示（2020.06.27 矿池需求新增逻辑）
      if (this.headerLink.trade || this.ieoPoolHide) {
        arr.push({
          title: this.isJpSpotSwitch ? this.$t('sale.texta33') : this.$t('assets.index.exchangeAccount'),
          link: '/assets/exchangeAccount',
        });
      }

      const otcTitle = this.$t('c2c.amount');

      if (this.headerLink.otc && this.userInfo && this.userInfo.isSub !== 1) {
        arr.push({
          title: otcTitle,
          link: '/assets/otcAccount',
        });
      }
      // if (this.fiatTradeOpen) {
      //   arr.push({
      //     title: this.$t('assets.index.otcAccount'),
      //     link: '/assets/b2cAccount',
      //   });
      // }
      if (!this.headerLink.otc && this.saasOtcFlowConfig && this.userInfo && this.userInfo.isSub !== 1) {
        arr.push({
          title: otcTitle,
          link: '/assets/otcAccount',
        });
      }
      if (this.headerLink.co) {
        let url = `${this.headerLink.co}/assets/coAccount`;
        if (window.HOSTAPI === 'co') {
          url = '/assets/coAccount';
        }
        arr.push({
          title: this.$t('assets.index.coAccount'),
          link: url,
        });
      }
      if (this.leverFlag) {
        arr.push({
          title: this.$t('assets.index.leverage'),
          link: '/assets/leverageAccount',
        });
      }
      // 资产不在显示'理财账户'
      // //  '理财账户',
      // if (this.incrementConfigStatus) {
      //   arr.push({
      //     title: this.$t('freeStaking.freeStakingAccount'),
      //     link: '/myPos',
      //   });
      // }
      return arr;
    },
    orderList() {
      const arr = [];
      if (this.headerLink.trade && !this.exchangeHide) {
        arr.push({
          title: this.isJpSpotSwitch ? this.$t('sale.texta17') : this.$t('order.index.exOrder'),
          link: '/order/exchangeOrder',
        });
      }
      if (this.isJpSpotSwitch) {
        arr.push({
          title: this.$t('sale.texta16'),
          link: '/order/saleOrder',
        });
      }
      // const otcTitle = !this.fiatTradeOpen
      //   ? this.$t('order.index.otcOrder')
      //   : this.$t('assets.b2c.otcShow.otcOrder');
      const otcTitle = this.$t('c2c.order');

      if (this.headerLink.otc && this.userInfo && this.userInfo.isSub !== 1) {
        arr.push({
          title: otcTitle,
          link: '/order/otcOrder',
        });
      }
      if (!this.headerLink.otc && this.saasOtcFlowConfig && this.userInfo && this.userInfo.isSub !== 1) {
        arr.push({
          title: otcTitle,
          link: '/order/otcOrder',
        });
      }
      if (this.headerLink.co) {
        let url = `${this.headerLink.co}/order/coOrder`;
        if (window.HOSTAPI === 'co') {
          url = '/order/coOrder';
        }
        arr.push({
          title: this.$t('order.coOrder.coOrder'),
          link: url,
        });
      }
      if (this.leverFlag) {
        arr.push({
          title: this.$t('order.index.leverage'),
          link: '/order/leverageOrder',
        });
      }
      //  '矿池订单',
      if (this.ieoPoolHide) {
        arr.push({
          title: this.$t('order.ipfsOrder.title'),
          link: '/sly/order/ipfsOrder',
        });
      }
      // 借贷订单
      if (this.toLoanFlag) {
        arr.push({
          title: this.$t('broToloan.common.order'),
          link: '/order/toLoanOrder',
        });
      }
      return arr;
    },
    title() {
      let seo = {};
      if (this.publicInfo) {
        seo = this.publicInfo.seo;
      }
      const { indexHeaderTitle, lan } = this.$store.state.baseData;
      let title = '';
      if (getCookie('lan')) {
        const language = getCookie('lan');
        title = indexHeaderTitle[language] || '';
      } else {
        const language = lan ? lan.defLan : '';
        title = language ? indexHeaderTitle[language] : '';
      }
      return seo.title || title;
    },
    templateLayoutType() {
      // if (this.fullWidth < 910) return '1';
      return this.$store.state.baseData.templateLayoutType;
    },
    incrementConfigStatus() {
      return this.$store.state.baseData.incrementConfigStatus;
    },
    navigationType() {
      if (this.templateLayoutType === '2' && this.$route.meta.navigation !== '1') {
        return '2';
      }
      return '1';
    },
    appDownload() {
      return this.$store.state.baseData.app_download || '';
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
    colorList() {
      let arr = [];
      const { skinType = [] } = this.publicInfo;

      if (this.publicInfo && skinType.length) {
        arr = skinType;
      } else if (this.publicInfo
        && this.publicInfo.skin
        && this.publicInfo.skin.listist) {
        arr = this.publicInfo.skin.listist;
      }
      return arr;
    },
    chanSkin() {
      let sw = '1';
      if (this.publicInfo
        && this.publicInfo.skin
        && this.publicInfo.skin.changeSkin) {
        sw = this.publicInfo.skin.changeSkin;
      }
      return sw;
    },
    subNavisShow() {
      if (this.publicInfo && this.publicInfo.switch.newcoinOpen === '1') {
        return true;
      }
      if (this.publicInfo && this.publicInfo.switch.is_return_open === '1') {
        return true;
      }
      if (this.appDownload && this.appDownload.app_page_url) {
        return true;
      }
      return false;
    },
    lan() {
      if (this.$store.state.baseData) {
        return this.$store.state.baseData.lan;
      }

      return null;
    },
    showLan() {
      let str = '';
      if (this.langArr.length) {
        this.langArr.forEach((item) => {
          if (this.lan === item.id) {
            str = item.name;
          }
        });
      }
      return str;
    },
    messageCount() {
      if (this.$store.state.baseData.messageCount) {
        return this.$store.state.baseData.messageCount;
      }
      return null;
    },
    userMessageList() {
      if (this.$store.state.baseData.userMessageList) {
        return this.$store.state.baseData.userMessageList;
      }
      return null;
    },
    linkurl() {
      if (this.$store.state.baseData.publicInfo) {
        return this.$store.state.baseData.publicInfo.url;
      }
      return {};
    },
    toLoanFlag() {
      let flag = false;
      // 1：显示、 0：不显示
      if (this.publicInfo && this.publicInfo.switch
        && this.publicInfo.switch.mortgage_borrow_hide
        && this.publicInfo.switch.mortgage_borrow_hide.toString() === '1') {
        flag = true;
      }
      return flag;
    },
    headerLink() {
      if (process.env.NODE_ENV === 'development') {
        return {
          home: '/ex/',
          trade: this.linkurl.exUrl ? '/ex/zh_CN/trade' : '',
          market: this.linkurl.exUrl ? '/ex/zh_CN/market' : '',
          lever: '/ex/zh_CN/margin',
          otc: this.linkurl.otcUrl ? '/otc/zh_CN/' : '',
          co: this.linkurl.coUrl ? '/co/zh_CN/trade' : '',
          proTrade: '/ex/zh_CN/proTrade',
          proLever: '/ex/zh_CN/proTradeMargin',
          proSwap: this.linkurl.coUrl ? '/co/zh_CN/proSwap' : '',
          exUrl: '/ex/zh_CN',
          otcUrl: this.linkurl.otcUrl ? '/otc/zh_CN' : '',
          coUrl: this.linkurl.coUrl ? '/co/zh_CN/' : '',
        };
      }
      if (this.$store.state.baseData && this.$store.state.baseData.publicInfo) {
        const { lan } = this;
        return {
          home: this.linkurl.exUrl ? `${this.linkurl.exUrl}/${lan}/` : '/',
          trade: this.linkurl.exUrl ? `${this.linkurl.exUrl}/${lan}/trade` : '',
          proTrade: this.linkurl.exUrl ? `${this.linkurl.exUrl}/${lan}/proTrade` : '',
          market: this.linkurl.exUrl ? `${this.linkurl.exUrl}/${lan}/market` : '',
          otc: this.linkurl.otcUrl ? `${this.linkurl.otcUrl}/${lan}/` : '',
          lever: this.linkurl.exUrl ? `${this.linkurl.exUrl}/${lan}/margin` : '',
          proLever: this.linkurl.exUrl ? `${this.linkurl.exUrl}/${lan}/proTradeMargin` : '',
          co: this.linkurl.coUrl ? `${this.linkurl.coUrl}/${lan}/trade` : '',
          proSwap: this.linkurl.coUrl ? `${this.linkurl.coUrl}/${lan}/proSwap` : '',
          exUrl: this.linkurl.exUrl ? `${this.linkurl.exUrl}/${lan}` : '',
          otcUrl: this.linkurl.otcUrl ? `${this.linkurl.otcUrl}/${lan}` : '',
          coUrl: this.linkurl.coUrl ? `${this.linkurl.coUrl}/${lan}` : '',
        };
      }
      return '';
    },
    router() {
      return this.$route.name;
    },
    routerPath() {
      return this.$route.path;
    },
    headerTemplate() {
      let arr = [];
      try {
        arr = JSON.parse(this.$store.state.baseData.headerTemplate) || [];
      } catch (w) {
        arr = [];
      }
      const newArr = [];
      arr.forEach((item) => {
        let str = '';
        let classN = '';
        const vind = item.link.split('/');
        this.srcArr.forEach((ele) => {
          if (vind[vind.length - 1] === ele) {
            classN = 'ev-h5-hide';
          }
        });
        const first = item.link.split('//');
        if (first && first.length === 2) {
          const fid = first[1].indexOf('/');
          if (fid !== -1) {
            const ac = first[1].slice(fid + 1, first[1].length);
            if (ac && ac.length) {
              str = ac;
            }
          }
        }
        if (str.length === 0) {
          str = item.link;
        }
        newArr.push({ ...{}, ...item, ...{ activeId: str, classN } });
      });
      return newArr;
    },
    isLogin() {
      return this.$store.state.baseData.isLogin;
    },
    userInfoIsReady() {
      return this.$store.state.baseData.userInfoIsReady;
    },
    userInfo() { return this.$store.state.baseData.userInfo; },
    publicInfo() { return this.$store.state.baseData.publicInfo; },

    // 会员等级功能开关
    membershipLevelOpen() {
      if (this.publicInfo && this.publicInfo.switch && this.publicInfo.switch.membership_level_open) {
        return this.publicInfo.switch.membership_level_open.toString() === '1';
      }
      return false;
    },

    langArr() {
      if (this.publicInfo && this.publicInfo.lan) {
        return this.publicInfo.lan.lanList;
      }
      return [];
    },
    userText() {
      if (this.userInfo) {
        return this.userInfo.userAccount;
      }
      return '';
    },
    logoUrl() {
      let url = '';
      if (this.publicInfo && this.publicInfo.msg && this.publicInfo.msg.logoUrl) {
        url = this.userSkin && this.userSkin.toString() === '1' ? (this.publicInfo.msg.logoUrl_dark || this.publicInfo.msg.logoUrl) : this.publicInfo.msg.logoUrl;
        // 设置 标题栏的 icon 图标
        // const link = document.querySelector
        // ("link[rel*='icon']") || document.createElement('link');
        // link.type = 'image/x-icon';
        // link.rel = 'shortcut icon';
        // link.href = this.publicInfo.msg.iconUrl;
        // document.getElementsByTagName('head')[0].appendChild(link);
      }
      return url || imgMap.logo;
    },
    intLogoUrl() {
      let url = '';
      if (this.publicInfo && this.publicInfo.msg && this.publicInfo.msg.logoUrl) {
        url = this.publicInfo.msg.index_international_logo || imgMap.int_logo;
      }
      return url;
    },
    userStatus() {
      let str = '';
      if (this.userInfo && this.userInfo.accountStatus.toString()) {
        switch (this.userInfo.accountStatus.toString()) {
          case '0':
            str = this.$t('header.userStatus1'); // '正常';
            break;
          case '1':
            str = this.$t('header.userStatus2'); // '冻结交易，冻结提现';
            break;
          case '2':
            str = this.$t('header.userStatus3'); // '冻结交易';
            break;
          case '3':
            str = this.$t('header.userStatus4'); // '冻结提现';
            break;
          default:
            break;
        }
      }
      return str;
    },
    activeName() {
      return this.$route.meta.activeName;
    },
    lanText() {
      return {
        ContractInfo: this.$t('futuresInfo.ContractInfo'), // 合约信息
        ContractData: this.$t('futuresInfo.ContractData'), // 合约数据
        Tutorial: this.$t('futuresInfo.Tutorial'), // 合约教程
        TutorialTip: this.$t('futuresInfo.TutorialTip'), // 合约教程提示
        ContractDataTip: this.$t('futuresInfo.ContractDataTip'), // 合约数据提示
      };
    },
    showInviteFriends() {
      let bol = false;
      if (this.functionSwitch && this.functionSwitch.invitationSwitch === 1) {
        bol = true;
      }
      return bol;
    },
    showSubAccount() {
      let bol = false;
      // 实名认证用户 且 非子账户 显示
      if (this.userInfo && this.userInfo.authLevel.toString() === '1' && this.userInfo.isSub !== undefined && this.userInfo.isSub.toString() !== '1') {
        bol = true;
      }
      return bol;
    },
  },
  methods: {
    getMesssageState() {
      this.axios({
        url: 'task_complete_count',
        method: 'post',
      })
        .then((res) => {
          const { count = 0 } = res.data || {};
          if (count > 0) {
            this.showDotList = ['rewardCenter'];
          } else {
            this.showDotList = [];
          }
        });
    },
    copy(copyMsg) {
      const copyInput = document.createElement('input');
      // val是要复制的内容
      copyInput.setAttribute('value', copyMsg);
      document.body.appendChild(copyInput);
      copyInput.select();
      const copyed = document.execCommand('copy');
      if (copyed) {
        document.body.removeChild(copyInput);
        this.$bus.$emit('tip', { text: this.$t('rewardsCenter.copySuccess'), type: 'success' });
      }
    },
    rewardListen() {
      // 监听奖励领取
      this.$bus.$on('REWARD_GAIN', () => {
        this.getMesssageState();
      });
    },
    getTaskCenterShow() {
      this.axios({
        url: 'reward_center_info',
        method: 'post',
      })
        .then((res) => {
          const { confSwitch } = res.data;
          this.showTaskCenter = confSwitch === 1;
        });
    },
    getHeader() {
      this.axios({
        url: 'common/index_v5',
      }).then(({ code, data, msg }) => {
        if (code.toString() === '0' && data.menu_list) {
          this.menu_list = data.menu_list;
          this.headerList = this.handleNavList();
        } else {
          this.$bus.$emit('tip', { text: msg, type: 'error' });
        }
      });
    },
    // 获取汇率列表
    getCurrencyList() {
      this.axios({
        url: 'common/getFaitCoinList',
      }).then(({ code, data }) => {
        if (code.toString() === '0') {
          if (data && data.length) {
            this.currencyList = data.map((item) => ({
              lan: item.fiat_symbol.toLocaleUpperCase(),
              text: `${item.fiat_icon} ${item.fiat_symbol.toLocaleUpperCase()}`,
            }));
          }
        }
      });
    },
    handleNavList() {
      const navList = JSON.parse(JSON.stringify(this.menu_list));
      if (!navList || !this.lanText.ContractInfo) return [];
      // 本地写死合约信息导航
      if (window.HOSTAPI === 'co') {
        const childList = [{
          id: 10001,
          title: this.lanText.ContractData, // 合约数据
          imageUrl: imgMap.contractDataLogo ? imgMap.contractDataLogo : this.contractDataLogo,
          subTitle: this.lanText.ContractDataTip,
          httpUrl: '/futuresData',
          type: '0',
          menuType: '3',
          angleMark: '',
          angleMarkType: 0,
          langKey: this.lan,
          superscriptIconType: 0,
        }];
        if (this.$store.state.future && this.$store.state.future.coPublicInfo && this.$store.state.future.coPublicInfo.showContractProInfoFlag.toString() === '1'
        ) {
          childList.push({
            id: 10002,
            title: this.lanText.Tutorial, // 合约教程
            imageUrl: imgMap.contractTutorialLogo ? imgMap.contractTutorialLogo : this.contractTutorialLogo,
            subTitle: this.lanText.TutorialTip,
            httpUrl: '/futuresTutorial',
            type: '0',
            menuType: '3',
            angleMark: '',
            angleMarkType: 0,
            langKey: this.lan,
            superscriptIconType: 0,
          });
        }

        navList.push({
          id: 10000,
          title: this.lanText.ContractInfo, // 合约信息
          imageUrl: imgMap.contractInfoLogo ? imgMap.contractInfoLogo : this.contractInfoLogo,
          subTitle: this.lanText.ContractInfo,
          httpUrl: '/futuresData',
          type: '0',
          menuType: '3',
          angleMark: '',
          angleMarkType: 0,
          langKey: this.lan,
          templateBannerList: childList,
        });
      }
      const newNavList = navList.filter((item) => item.langKey === this.lan)
        .sort((a, b) => a.sort - b.sort)
        .map((item) => {
          if (item && item.templateBannerList.length > 0) {
            item.templateBannerList.sort((a, b) => a.sort - b.sort);
          }
          return item;
        });
      const { headerLink } = this;
      if (headerLink) {
        const formatList = newNavList.map((item) => {
          const type = item.menuType ? item.menuType.toString() : '';
          const nav = item;
          if (type === '1') {
            nav.httpUrl = `${headerLink.exUrl}${item.httpUrl}`;
          } else if (type === '2') {
            if (this.userInfo && this.userInfo.isSub === 1) {
              // 子账号跳首页
              nav.httpUrl = `${headerLink.exUrl}${item.httpUrl}`;
            } else {
              nav.httpUrl = `${headerLink.otcUrl}${item.httpUrl}`;
            }
          } else if (type === '3') {
            nav.httpUrl = `${headerLink.coUrl}${item.httpUrl}`;
          }
          if (item.templateBannerList && item.templateBannerList.length) {
            nav.childList = item.templateBannerList.map((child) => {
              const subType = child.menuType ? child.menuType.toString() : '';
              const subNav = child;
              if (subType === '1') {
                subNav.httpUrl = `${headerLink.exUrl}${child.httpUrl}`;
              } else if (subType === '2') {
                if (this.userInfo && this.userInfo.isSub === 1) {
                  // 子账号跳首页
                  subNav.httpUrl = `${headerLink.exUrl}${child.httpUrl}`;
                } else {
                  subNav.httpUrl = `${headerLink.otcUrl}${child.httpUrl}`;
                }
              } else if (subType === '3') {
                subNav.httpUrl = `${headerLink.coUrl}${child.httpUrl}`;
              }
              return subNav;
            });
          }
          return nav;
        });
        return formatList;
      }
      return newNavList;
    },
    // 云算力H5订单跳转
    ipfsJump(link) {
      const { lan } = this.$store.state[this.moduleName || 'baseData'];
      const links = `${window.origin}/${lan}${link}`;
      window.location.href = links;
    },
    showHeader() {
      this.isShowHeader = !this.isShowHeader;
    },
    init() {
      // 杠杆当前选中的币对
      if (this.moduleType === 'lever') {
        this.symbolCurrent = myStorage.get('leverSymbolName');
      }
      this.$bus.$on('SYMBOL_CURRENT', (val) => {
        this.symbolCurrent = val;
      });
      // this.getCurrencyList();
      this.getHeader();
    },
    setAlert() {
      this.showFlag = true;
    },
    setClose() {
      this.userSkin = '';
      this.showFlag = false;
    },
    lanClick(id) {
      // this.
      if (id === this.lan) { return; }
      if (this.isLogin) {
        this.axios({
          url: this.$store.state.url.common.change_language,
          params: { language: id },
          method: 'post',
        }).then((res) => {
          if (Number(res.code) === 0) {
            setCookie('lan', id);
            const { fullPath } = this.$route;
            const str = fullPath.replace(this.lan, id);
            window.location.href = str;
          }
        });
      } else {
        setCookie('lan', id);
        const { fullPath } = this.$route;
        const str = fullPath.replace(this.lan, id);
        window.location.href = str;
      }
    },
    // 获取服务端自选币对
    getMySymbol() {
      return this.axios({
        url: 'optional/list_symbol',
        params: {},
        headers: {
          'exchange-client': 'pc',
        },
        method: 'post',
      }).then((data) => {
        if (data.code === '0') {
          myStorage.set('mySymbol', []);
          const mySymbol = data.data.symbols.filter((x) => x !== '');
          myStorage.set('mySymbol', mySymbol);
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
    handMouseenter(id, sub) {
      if (sub === 'sub') {
        this.subNavHover = id;
      } else {
        this.navHover = id;
      }
    },
    handMouseleave(sub) {
      if (sub === 'sub') {
        this.subNavHover = null;
      } else {
        this.navHover = null;
      }
    },
    jump(key) {
      const linkList = ['', '/personal/userManagement', '/personal/leaglTenderSet', '/taskCenter', '/personal/apiManagement', '/inviteFriends', '/personal/subManagement'];
      const link = this.linkurl.exUrl ? `${this.linkurl.exUrl}/${this.lan}${linkList[key]}` : '';
      this.btnLink(link);
    },
    // 路由跳转
    btnLink(link) {
      this.isShowHeader = false;
      if (link === 'order') {
        if (this.orderList.length) {
          this.$router.push(this.orderList[0].link);
        }
      } else if (link.indexOf('http') > -1) {
        window.location.href = link;
      } else if (window.HOSTAPI === 'co') {
        this.futuresLink(link);
      } else {
        this.$router.push(link);
      }
    },
    futuresLink(link, target) {
      // console.log('link', `${this.headerLink.coUrl}${link}`);
      // 如果是合约模块，地址改成绝对地址；
      if (link.indexOf('http') > -1) {
        window.location.href = link;
        return;
      }
      let linkUrl = `${this.linkurl.exUrl}/${this.lan}${link}`;
      if (this.isFuturesLink(link)) {
        linkUrl = `${this.headerLink.coUrl}${link}`;
      } else if (['/login'].includes(link)) {
        linkUrl += `?return=${window.decodeURIComponent(window.location.href)}`;
      }
      if (target && target === 'black') {
        window.open(linkUrl);
      } else {
        window.location.href = linkUrl;
      }
    },
    isFuturesLink(link) {
      let falg = false;
      const futuresRoutes = ['futuresData', 'coAccount', 'coFlowingWater', 'coProfitRecord', 'coOrder', 'coBroker', 'competition'];
      futuresRoutes.forEach((item) => {
        if (link.indexOf(item) > -1) {
          falg = true;
        }
      });
      return falg;
    },
    goLang() {
      window.localStorage.lastUrl = window.location.pathname;
      this.isShowHeader = false;
      this.$router.push('/setLang');
    },
    btnHref(link, target, options) {
      this.isShowHeader = false;
      if (options && options.isOtcList) {
        return;
      }
      if (options && options.trades) {
        if (options.id === this.activeHeader) {
          return;
        }
        if (options.id === 'exTrade' && this.etfOpen) {
          this.marketCurrent = myStorage.set('markTitle', '');
          // 获取当前币对
          this.symbolCurrent = myStorage.set('sSymbolName', '');
        }
      }
      const headerTitleList = Object.keys(this.headerLink);
      const currentTitle = headerTitleList.filter((x) => (this.headerLink[x] === link ? x : '')).join();
      // 点击首页行情和币币交易时拉取最新自选币对
      if (this.optionalSymbolServerOpen === 1 && this.isLogin
        && (currentTitle === 'home' || currentTitle === 'trade')) {
        this.getMySymbol().finally(() => {
          if (target && target === 'black') {
            window.open(link);
          } else {
            window.location.href = link;
          }
        });
      } else if (link === `${this.headerLink.coUrl}/futuresTutorial`) {
        // 合约教程
        window.location.href = this.futuresdocUrl;
      } else if (target && target === 'black') {
        window.open(link);
      } else {
        window.location.href = link;
      }
    },
    // 退出登录
    out() {
      this.isShowHeader = false;
      if (!this.outFlag) { return; }
      this.outFlag = false;
      this.axios({
        url: '/user/login_out',
      }).then((data) => {
        this.outFlag = true;
        if (data.code.toString() === '0') {
          this.$bus.$emit('tip', { text: data.msg, type: 'success' });
          this.$bus.$emit('outUserIsLogin');
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
    getClass(v) {
      let str = '';
      if (v === this.activeHeader || v === this.hoverHeader) {
        str = 'main-1-cl';
      }
      return str;
    },
    setActive() {
      const { meta } = this.$route;
      const arr = ['exTrade', 'otcTrade', 'coTrade', 'marginTrade', 'assets', 'order', 'crad', 'proTrade', 'proTradeMargin', 'proTradeSwap'];
      let active = '';
      if (meta && meta.activeName
        && arr.indexOf(meta.activeName) !== -1) {
        active = meta.activeName;
      } else {
        const reg = /\/ex\/|\/otc\/|\/co\//g;
        let myPath = '';
        if (this.$route.path.match(reg)) {
          const Brr = this.$route.path.match(reg);

          myPath = `${this.$route.path.split(Brr[0])[1]}`;
        } else {
          myPath = this.$route.path.slice(1, this.$route.path.length);
        }
        active = myPath;
      }
      if (active === 'exTrade') {
        if (this.market && this.etfOpen
          && this.$route.params && this.$route.params.symbol) {
          const routeSymbol = this.$route.params.symbol;
          let symbolNameClassCion = routeSymbol.split('_')[0];
          let markTitleClassCion = routeSymbol.split('_')[1];
          const symbolNameClass = routeSymbol.split('_')[0];
          const markTitleClass = routeSymbol.split('_')[1];
          const coinLisArr = Object.keys(this.coinList);
          coinLisArr.forEach((item) => {
            const { showName } = this.coinList[item];
            if (showName === markTitleClass) {
              markTitleClassCion = item;
            }
            if (showName === symbolNameClass) {
              symbolNameClassCion = item;
            }
          });
          const symbol = `${symbolNameClassCion}/${markTitleClassCion}`;
          if (this.symbolAll[symbol] && this.symbolAll[symbol].etfOpen) {
            active = 'etf';
          }
        }
      }
      this.activeHeader = active;
    },
    setMarkActive() {
      const reg = /\/ex\/|\/otc\/|\/co\//g;
      let myPath = '';
      if (this.$route.path.match(reg)) {
        const arr = this.$route.path.match(reg);
        myPath = `/${this.$route.path.split(arr[0])[1]}`;
      } else {
        myPath = this.$route.path.slice(0, this.$route.path.length);
      }
      this.activeMark = myPath;
    },
    // title
    modifyTilte() {
      let routerName = this.$route.name;
      if (this.fiatTradeOpen && routerName === 'fiatdeal') { routerName = 'b2cFiatdeal'; }
      let title = `${this.$t('pageTitle')[routerName] ? this.$t('pageTitle')[routerName] : ''}`;
      if (this.title) title = `${this.title}-${title}`;
      if (title) {
        document.title = title;
      }
    },
    setConfirm() {
      setCookie('cusSkin', this.userSkin);
      window.location.reload();
    },
    setSkin(id) {
      this.userSkin = id;
    },
    colorSet() {
      // 设置深色、浅色 不使用弹框
      const id = this.userSkin === '1' ? '2' : '1';
      myStorage.remove('futuresTradingViewData');
      myStorage.remove('exTradingViewData');
      this.setSkin(id);
      this.setConfirm();
      this.setClose();
    },
    // App 下载
    download(type) {
      window.open(this.appDownload[`${type}_download_url`]);
    },
    compare(property) {
      return function short(a, b) {
        const value1 = a[property];
        const value2 = b[property];
        return value1 - value2;
      };
    },
    currencyClick(lan) {
      if (this.userCurrency !== lan) {
        this.userCurrency = lan;
        removeCookie('userCurrency');
        setCookie('user_Currency', this.userCurrency);
        window.location.reload();
      }
    },
    goMyRates() {
      if (window.HOSTAPI === 'co') {
        const links = `${this.headerLink.exUrl}/myRate`;
        window.location.href = links;
      } else {
        this.$router.push('/myRate');
      }
    },
  },
};
