import {
  fixD, fixInput, getCoinShowName, colorMap, imgMap,
  formatTime, getIconPath, sendVerigicationCode,
} from '@/utils';

export default {
  name: 'page-withdraw',
  data() {
    return {
      tabelLoading: false,
      fixD,
      imgMap,
      getIconPath,
      colorMap,
      alertFlag: false, // alert变量
      detailsList: [
        { key: 'sum', value: '--' },
        { key: 'normal', value: '--' },
        { key: 'lock', value: '--' },
      ],
      withdrawalLimitList: [
        // { key: 'withdrawalLimit', value: '0.0' },
        { key: 'withdrawalLimit24', value: '0.0/0.0 USDT' },
      ],
      withdrawMin: '--', // 最小提币额度
      withdrawMax: '--', // 最大提币额度
      daywithdrawMax: '--', // 最大提币额度
      feeMin: '--', // 最小手续费
      feeMax: '--', // 最大手续费
      tabelList: [], // 提现记录
      subTableData: [], // 提现记录详情
      financeListData: [],
      subTableDataId: null, // 提现记录详情ID
      symbol: '',
      addressValue: '', // 提现地址
      detailsAddressList: {}, // axios返回的地址列表对象
      pagesValue: '', // 地址标签
      numberValue: '', // 提币数量
      proceduresValue: '', // 手续费
      addressList: [], // 提现地址列表
      havePageArr: ['XRP', 'EOS'], // 含有标签的币种
      paginationObj: {
        total: 0, // 数据总条数
        display: 10, // 每页显示条数
        currentPage: 1, // 当前页码
      },
      dialogFlag: false, // 弹窗开关
      revokeList: [], // 撤销队列
      defaultFeeFlag: true,
      defaultFee: null,
      symbol_withdraw_msg: null,
      branchTip: '', // 多主链提示
      notIdShowDialog: false,
      canLableEdit: false, // 标签可编辑
      withdrawalbe: '',
      withdrawalLimit: '',
      dailyAmount: '', // 日提现额度
      withdrawCoinList: [], // 可提现币种列表
      inputHover: false, // 地址交互参数
      // inputFocus: false, // 地址交互参数
      clearHover: false, // 地址交互参数
      optionHover: false, // 地址交互参数
      optionSelect: null, // 地址交互参数
      addressText: '', // 地址交互参数
      helpIconHover: false, // icon交互参数
      copyValue: '', // 复制数据
      showAddressDialog: false, // 添加地址
      addressCoinList: [], // 添加地址币种列表
      verifyType: '', // 验证类型 address 添加地址  withdraw 体现
      addressParams: {}, // 添加地址参数
      trustType: 0, // 信任提现地址 0 不信任 1 信任
      loading: false,
      confirmLoading: false,
      showConfirmDialog: false, // 提笔确认弹窗
      nowType: 1, // 1为站外提现2为站内提现
      nowTypeTable: 1, // 1为站外提现2为站内提现
      accountValue: '', // 账号
      hoverType: null, // 划过
      withdrawList: [], // 普通提现币种
      innerList: [], // 站内直转币种
      isPermission: true,
      typeList: [], // 验证选项
      popoverShow: false, // popover
      popoverContent: '', // popover
      popoverParent: '',
      canUseAmount: '',

      // Fallback bank list if API fails
      fallbackBankList: [
        { code: 'BCA', value: 'BCA' },
        { code: 'MANDIRI', value: 'Mandiri' },
        { code: 'BNI', value: 'BNI' },
        { code: 'BRI', value: 'BRI' },
        { code: 'PERMATA', value: 'Permata' },
        { code: 'CIMB', value: 'CIMB Niaga' },
      ],
      selectedBank: 'BCA', // default selected
      bankListFromApi: [],

    };
  },
  filters: {
    fixDFn(v, that) {
      return fixD(v, that.showPrecision);
    },
    getCoinShowName(v, coinList) {
      if (v) {
        return getCoinShowName(v, coinList);
      }
      return '';
    },
    // 千分符
    thousands(num) {
      if (num) {
        const str = num.toString();
        const reg = str.indexOf('.') > -1 ? /(\d)(?=(\d{3})+\.)/g : /(\d)(?=(?:\d{3})+$)/g;
        return str.replace(reg, '$1,');
      }
      return num;
    },
  },
  watch: {
    exchangeData(v) {
      if (v && this.symbol) {
        this.initDetails();
      }
      if (v && this.market) {
        this.setWithdrawCoinList();
      }
    },
    symbol(v) {
      if (v === 'IDR' || v === 'IDRPERMATA') {
      this.getBankList();
    }
      if (v && this.market) {
        this.branchInit(this.market, this.usdtOpenOmni, 'withdraw');
        this.addressInit();
        this.defInit();
        this.initDetails();
        if (this.nowType === 2) {
          this.getBranchAddress(this.symbol);
        }
      }
    },
    market: {
      immediate: true,
      handler(v) {
        if (v && this.exchangeData) {
          this.setWithdrawCoinList();
        }
        if (v && this.symbol) {
          this.branchInit(v, this.usdtOpenOmni, 'withdraw');
          this.addressInit();
          this.defInit();
        }
      },
    },
    proceduresValue(v) { this.proceduresValue = fixInput(v, this.showPrecision); },
    numberValue(v) { this.numberValue = fixInput(v, this.showPrecision); },
    addressValue(v) {
      const addressItem = this.addressList.find((val) => val.code === v);
      if (addressItem) {
        this.addressText = addressItem.value;
      } else {
        this.addressText = v;
      }
    },
    verifyType(v) {
      const arr = [];
      if (v === 'withdraw') {
        if (this.enforceGoogleAuth) {
          arr.push('google');
        }
      }
      if (arr.length === 0) {
        if (this.userInfo && this.userInfo.isCapitalPwordSet && v !== 'address') {
          arr.push('fundCode');
        }
        if (this.userInfo && this.userInfo.googleStatus) {
          arr.push('google');
        }
        if (this.userInfo && this.userInfo.isOpenMobileCheck) {
          arr.push('mobile');
        } else if (this.userInfo && this.userInfo.email) {
          arr.push('email');
        }
      }
      this.typeList = arr;
    },
    deepWatchGetEquity: {
      handler(v) {
        if (v.userInfoIsReady && v.symbol) {
          this.getEquity(this.symbol);
        }
      },
      deep: true,
    },
  },
  computed: {

    // if IDR is selected fetch bank list from API
    isIDR() {
      return this.symbol === 'IDR' || this.symbol === 'IDRPERMATA'
          || this.coinSymbol === 'IDR' || this.coinSymbol === 'IDRPERMATA';
    },

    bankSelectOptions() {
      if (!this.isIDR) return [];
      if (this.bankListFromApi && this.bankListFromApi.length) {
        return this.bankListFromApi;
      }
      return this.fallbackBankList;
    },

    deepWatchGetEquity() {
      return {
        userInfoIsReady: this.userInfoIsReady,
        symbol: this.symbol,
      };
    },
    // userInfo是否请求完毕
    userInfoIsReady() { return this.$store.state.baseData.userInfoIsReady; },
    userInfo() {
      return this.$store.state.baseData.userInfo;
    },
    isHavePage() {
      // 默认 为不需要 tag
      let flag = 0;
      // 判断market是否请求下来
      if (this.coinList) {
        if (!this.haveBranch) {
          // 判断market.coinList是否有当前币种
          if (this.coinList[this.symbol]) {
            const { tagType } = this.coinList[this.symbol];
            flag = tagType;
          }
        } else if (this.market.followCoinList[this.symbol][this.activeBranch]) {
          const { tagType } = this.market.followCoinList[this.symbol][this.activeBranch];
          flag = tagType;
        }
      }
      return flag;
    },
    showSymbol() {
      let str = this.symbol;
      if (this.coinList
        && this.coinList[this.symbol]) {
        str = getCoinShowName(this.symbol, this.coinList);
      }
      return str;
    },
    enforceGoogleAuth() {
      return this.$store.state.baseData.is_enforce_google_auth || 0;
    },
    authTitleText() {
      const text = this.enforceGoogleAuth ? 'assets.withdraw.enforceGoogleAuth' : 'assets.withdraw.safetyWarningError';
      return this.$t(text);
    },
    switchadd() {
      const { publicInfo } = this.$store.state.baseData;
      let switchopen = 0;
      if (publicInfo && publicInfo.switch.open_txid_addr) {
        switchopen = Number(publicInfo.switch.open_txid_addr);
      }
      return switchopen;
    },
    alertData() {
      const arr = [
        // 绑定谷歌验证
        { text: this.$t('assets.withdraw.bindGoogle'), flag: this.OpenGoogle },
      ];
      if (!this.enforceGoogleAuth) {
        // 绑定手机验证
        arr.push({ text: this.$t('assets.withdraw.bindPhone'), flag: this.OpenMobile });
      }
      return arr;
    },
    // 当前币种精度
    showPrecision() {
      let v = 0;
      if (this.coinList && this.coinList[this.symbol]) {
        v = this.coinList[this.symbol].showPrecision;
      }
      return v;
    },
    // 当前币种精度
    branchShowPrecision() {
      let v = 0;
      const { market } = this.$store.state.baseData;
      if (market && market.followCoinList
        && market.followCoinList[this.symbol]
        && market.followCoinList[this.symbol][this.activeBranch]) {
        v = market.followCoinList[this.symbol][this.activeBranch].showPrecision;
      }
      return v;
    },
    // finance/account_balance 接口返回成功的数据
    exchangeData() { return this.$store.state.assets.exchangeData; },
    // market 接口
    market() { return this.$store.state.baseData.market; },
    // 提现按钮禁用状态
    btnDisabled() {
      let flag = true;
      if (this.nowType === 2) {
        if (this.accountValue.length && this.numberOptions.flag) {
          flag = false;
        }
      } else {
        if (this.addressValue.length && this.numberOptions.flag && this.proceduresFlag) {
          flag = false;
        }
        if (this.canLableEdit && (this.isHavePage.toString() === '2') && !this.pagesValue) {
          flag = true;
        }
      }
      return flag;
    },
    // 表格title
    columns() {
      if (this.nowTypeTable === 2) {
        return [
          { key: 'time', title: this.$t('assets.withdraw.transferTime'), width: '15%' }, // 转账时间
          { key: 'addressTo', title: this.$t('assets.withdraw.sideAccount'), width: '45%' }, // 对方账号
          { key: 'amount', title: this.$t('assets.withdraw.transferNumber'), width: '15%' }, // 转账数量
          { key: 'fee', title: this.$t('assets.withdraw.withdrawFee'), width: '15%' }, // 手续费
          { key: 'statusText', title: this.$t('assets.withdraw.withdrawStatus'), width: '10%' }, // 状态
        ];
      }
      return [
        { key: 'coin', title: this.$t('assets.recharge.RechargeCoin'), width: '10%' }, // 币种
        { key: 'time', title: this.$t('assets.withdraw.withdrawTime'), width: '10%' }, // 提现时间
        { key: 'amount', title: this.$t('assets.withdraw.withdrawVolume'), width: '10%' }, // 提币数量
        { key: 'fee', title: this.$t('assets.flowingWater.withdrawFee'), width: '7%' }, // 手续费
        { key: 'address', title: this.$t('assets.withdraw.withdrawAddress'), width: '15%' }, // 提币地址
        { key: 'remark', title: this.$t('assets.flowingWater.withdrawRemarks'), width: '10%' }, // 备注
        { key: 'updateAt', title: this.$t('assets.flowingWater.updataAt'), width: '10%' }, // 钱包处理时间
        { key: 'txid', title: this.$t('assets.flowingWater.txid'), width: '15%' }, // 区块链交易ID
        { key: 'statusText', title: this.$t('assets.withdraw.withdrawStatus'), width: '8%' }, // 状态
        { key: 'operation', title: this.$t('assets.withdraw.withdrawOptions'), width: '5%' }, // 操作
      ];
    },
    // 用户是否开启手机
    OpenMobile() {
      let flag = false;
      const { userInfo } = this.$store.state.baseData;
      if (userInfo && userInfo.isOpenMobileCheck.toString() === '1') {
        flag = true;
      }
      return flag;
    },
    idAuth() {
      const { userInfo } = this.$store.state.baseData;
      let idAuth = 0;
      if (userInfo) {
        idAuth = Number(userInfo.authLevel);
      }
      return idAuth;
    },
    // 用户是否开启谷歌
    OpenGoogle() {
      let flag = false;
      const { userInfo } = this.$store.state.baseData;
      if (userInfo && userInfo.googleStatus.toString() === '1') {
        flag = true;
      }
      return flag;
    },
    // 用户是否开启白名单
    isOpenWhitelist() {
      let flag = false;
      const { userInfo } = this.$store.state.baseData;
      if (userInfo && userInfo.withdrawWhitelistFlag !== undefined && userInfo.withdrawWhitelistFlag.toString() === '1') {
        flag = true;
      }
      return flag;
    },
    // // phoneValue 是否复合正则验证
    // phoneValueFlag() { return this.$store.state.regExp.verification.test(this.phoneValue); },
    // // googleValue 是否复合正则验证
    // googleValueFlag() { return this.$store.state.regExp.verification.test(this.googleValue); },
    // phoneError() {
    //   if (this.phoneValue.length !== 0 && !this.phoneValueFlag) return true;
    //   return false;
    // },
    // googleError() {
    //   if (this.googleValue.length !== 0 && !this.googleValueFlag) return true;
    //   return false;
    // },
    // 弹窗确认按钮
    dialogConfirmDisabled() {
      let phone = true;
      let google = true;
      if (this.OpenMobile) { phone = this.phoneValueFlag; }
      if (this.OpenGoogle) { google = this.googleValueFlag; }
      if ((phone && google) || this.loading) {
        return false;
      }
      return true;
    },
    that() { return this; },
    // 提币数量的校验
    // 提现条件：
    // 1. 提现数量 > 手续费
    // 2. 提现数量 <= 可用余额 （提现数量包含手续费）
    // 3. 提现最小限额 =< (提现数量 -手续费) =<提现最大限额
    numberOptions() {
      const obj = {
        text: '', // 错误提示文案
        flag: null, // 是否通过校验
        error: null, // 是否展示文案
      };
      const haveNum = parseFloat(this.detailsList[1].value) || 0; // 可用
      const minNum = parseFloat(this.withdrawMin) || 0; // 最小提币额
      const maxNum = parseFloat(this.withdrawMax) || 0; // 最大提币额
      const daymaxNum = parseFloat(this.daywithdrawMax) || 0; // 单日最大提币额
      const canUseAmount = parseFloat(this.canUseAmount) || 0; // 单日最大提币额
      const spk = fixD(this.numberValue - this.proceduresValue, this.showPrecision); // 提币数量减手续费
      if (this.numberValue.length === 0) {
        // 请输入提币数量
        obj.text = this.$t('assets.withdraw.NumberOfCoinsError');
        obj.flag = false;
        obj.error = false;
        return obj;
      } if (parseFloat(this.numberValue) === 0) {
        // 请输入提币数量
        obj.text = this.$t('assets.withdraw.NumberOfCoinsError');
        obj.flag = false;
        obj.error = true;
        return obj;
      } if (parseFloat(this.numberValue) <= parseFloat(this.proceduresValue)) {
        // 提币数量需大于矿工手续费
        obj.text = this.$t('assets.withdraw.NumberOfCoinsError2');
        obj.flag = false;
        obj.error = true;
        return obj;
      } if (parseFloat(this.numberValue) > haveNum) {
        // 提币数量不得大于可用余额
        obj.text = this.$t('assets.withdraw.NumberOfCoinsError3');
        obj.flag = false;
        obj.error = true;
        return obj;
      } if (parseFloat(minNum) > spk || parseFloat(maxNum) < spk) {
        // （提币数量-矿工手续费）需要大于最小提币额且小于最大提币额
        obj.text = this.$t('assets.withdraw.NumberOfCoinsError4');
        obj.flag = false;
        obj.error = true;
        return obj;
      } if (parseFloat(canUseAmount) < spk) {
        // （提币数量-矿工手续费）需要小于单日最大提币额
        obj.text = this.$t('assets.withdraw.NumberOfCoinsError5');
        obj.flag = false;
        obj.error = true;
        return obj;
      } if (this.switchadd === 1) {
        if (parseFloat(daymaxNum) < spk) {
          // （提币数量-矿工手续费）需要小于单日最大提币额
          obj.text = this.$t('assets.withdraw.NumberOfCoinsError5');
          obj.flag = false;
          obj.error = true;
          return obj;
        }
      }
      obj.flag = true;
      obj.error = false;
      return obj;
    },
    // 手续费的校验
    proceduresFlag() {
      return true;
    },
    // 手续费框是否展示为错误
    proceduresError() {
      return false;
    },
    baseData() {
      return this.$store.state.baseData.publicInfo;
    },
    // 提现是否开启了必须实名认证
    withdrawKycOpen() {
      let isOpen = 0;
      if (this.baseData && this.baseData.kycLimitConfig) {
        isOpen = this.baseData.kycLimitConfig.withdraw_kyc_open;
      }
      return Number(isOpen);
    },
    // 语音短信开关
    voiceSmsOpen() {
      return this.$store.state.baseData.voiceSmsOpen;
    },
    // 币种列表
    coinList() {
      return (this.market && this.market.coinList) || null;
    },
    navTab() {
      const arr = [{ name: this.$t('assets.withdraw.normal'), index: 1 }];
      if (this.exchangeData && this.symbol) {
        if (this.exchangeData.allCoinMap[this.symbol].innerTransferOpen
          && this.$store.state.baseData.is_inner_transfer_open) {
          arr.push({ name: this.$t('assets.withdraw.innerTranfer'), index: 2 }); // 站内
        }
      }
      return arr;
    },
    navTabTable() {
      const arr = [{ name: this.$t('assets.withdraw.RecentWithdrawalRecords'), index: 1 }];
      if (this.exchangeData && this.symbol) {
        if (this.exchangeData.allCoinMap[this.symbol].innerTransferOpen
          && this.$store.state.baseData.is_inner_transfer_open) {
          arr.push({ name: this.$t('assets.withdraw.innerList'), index: 2 }); // 站内];
        }
      }
      return arr;
    },
    // 是否显示usdt 的 mainChainName, 1 显示 0 不显示
    usdtOpenOmni() {
      if (this.$store.state.baseData.publicInfo) {
        if (this.$store.state.baseData.publicInfo.switch) {
          return this.$store.state.baseData.publicInfo.switch.usdt_open_omni;
        }
      }
      return '1';
    },
    sendCodeType() {
      let str = '';
      if (this.nowType === 2) {
        str = `${sendVerigicationCode.turnStraight},${sendVerigicationCode.turnStraightEmail}`;
      } else if (this.verifyType === 'withdraw') {
        str = sendVerigicationCode.withdraw;
      } else if (this.verifyType === 'address') {
        str = sendVerigicationCode.addWithdrawAddress;
      }
      return str;
    },
  },
  methods: {
     onBankChange(item) {
      this.selectedBank = item.code;
    },
    getBankList() {
      this.axios({
        url: 'finance/bank_list', // ganti sesuai endpoint asli
      }).then(res => {
        if (res.code.toString() === '0') {
          this.bankListFromApi = res.data.map(b => ({
            code: b.code,
            value: b.name,
          }));
        } else {
          this.bankListFromApi = [];
        }
      }).catch(() => {
        this.bankListFromApi = [];
      });
    },

    getShowName(v) {
      let str = v;
      if (this.market) {
        const { coinList } = this.market;
        str = getCoinShowName(v, coinList);
      }
      return str;
    },
    handClick() {
      this.$router.push('/personal/identityAuthen');
    },
    defInit() {
      if (this.exchangeData && this.market) {
        this.setWithdrawCoinList();
      }
    },
    // 处理可充值币种数据
    setWithdrawCoinList() {
      if (this.withdrawCoinList.length) return;
      const data = this.exchangeData.allCoinMap;
      const list = [];
      const innerList = [];
      const addressCoinList = [];
      Object.keys(data).forEach((item) => {
        if (data[item].isFiat) {
          return;
        }
        // 该币种精度
        const { coinList } = this;
        const fix = (coinList[item] && coinList[item].showPrecision) || 0;
        const coinName = getCoinShowName(item, coinList);
        if (data[item].withdrawOpen) {
          if (data[item].innerTransferOpen
            && this.$store.state.baseData.is_inner_transfer_open) {
            innerList.push({
              img: coinList[item].icon,
              code: item,
              value: coinName,
              subValue: coinList[item].longName,
              sort: data[item].normal_balance,
              label: this.thousands(fixD(data[item].normal_balance, fix)),
            }); // 站内
          }
          list.push({
            img: coinList[item].icon,
            code: item,
            value: coinName,
            subValue: coinList[item].longName,
            sort: data[item].normal_balance,
            label: this.thousands(fixD(data[item].normal_balance, fix)),
          });
        }
        addressCoinList.push({
          img: coinList[item].icon,
          code: item,
          value: coinName,
        });
      });
      this.addressCoinList = addressCoinList;
      list.sort((a, b) => b.sort - a.sort);
      this.innerList = innerList;
      this.withdrawList = list;
      this.withdrawCoinList = [...list];
      // 如果不存在币种
      if (this.$route.query.symbol) {
        this.symbol = this.$route.query.symbol.toUpperCase();
      } else if (this.withdrawCoinList.length > 0) {
        this.symbol = this.withdrawCoinList[0].code; // 默认下拉列表第一个
      }
    },
    // tab切换
    currentType(item) {
      this.nowType = item.index;
      this.initDetails();
      if (this.nowType === 1) {
        this.withdrawCoinList = [...this.withdrawList];
        this.nowTypeTable = 1;
        this.paginationObj.currentPage = 1; // 页码
        this.paginationObj.total = 0; // 总条数
        this.tabelList = [];
        this.canAlert();
        this.addressInit();
      } else if (this.nowType === 2) {
        this.withdrawCoinList = [...this.innerList];
        this.nowTypeTable = 2;
        this.paginationObj.currentPage = 1; // 页码
        this.paginationObj.total = 0; // 总条数
        this.tabelList = [];
        this.getTableList();
        this.getBranchAddress(this.symbol);
      }
    },
    // LIST tab切换
    currentTypeTable(item) {
      this.nowTypeTable = item.index;
      if (this.nowTypeTable === 1) {
        this.paginationObj.currentPage = 1; // 页码
        this.paginationObj.total = 0; // 总条数
        this.tabelList = [];
        this.getTableList();
      } else if (this.nowTypeTable === 2) {
        this.paginationObj.currentPage = 1; // 页码
        this.paginationObj.total = 0; // 总条数
        this.tabelList = [];
        this.getTableList();
      }
    },
    // 判断站内账户是否存在
    isExistAccount() {
      this.axios({
        url: 'inner_transfer/user_auth',
        params: {
          transferUid: this.accountValue, // 对方账号
        },
      }).then((data) => {
        if (data.code.toString() === '0') {
          this.verifyType = 'withdraw';
          this.dialogFlag = true;
        } else {
          // this.accountFlag = true;
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
    // 查看全部充值记录
    lookAll() {
      this.$router.push('/assets/flowingWater?nowType=2');
    },
    // 选择币种
    selectChange(item, name) {
      this[name] = item.code;
    },
    // 回退
    goBack() {
      this.smartBack();
    },
    smartBack() {
      const from = document.referrer;
      // 如果来自站外（比如 baidu.com 或为空），则跳转到默认页面
      const isFromOutside = from === '' || !from.includes(window.location.host);
      if (isFromOutside) {
        window.location.replace('/');// 或 push
      } else {
        this.$router.back();
      }
    },
    setActiveBranch(v, name) {
      this.addressValue = ''; // 提现地址
      this.pagesValue = ''; // 地址标签
      this.numberValue = ''; // 提币数量
      this.defaultFee = '';
      this.defaultFeeFlag = true;
      this.proceduresValue = ''; // 手续费
      this.feeMin = '--';
      this.feeMax = '--';
      this.activeBranch = v;
      this.mainChainName = name;
      this.addressList = [];
      this.detailsAddressList = {};
      this.getAddress();
    },
    init() {
      // this.getEquity(this.symbol);
      if (this.userInfoIsReady) {
      //   this.canAlert();
        this.getEquity(this.symbol);
      }
      if (!this.exchangeData) {
        this.$store.dispatch('assetsExchangeData');
      }
    },
    // getEquity
    getEquity(symbol) {
      const params = {};
      if (symbol) {
        params.symbol = symbol;
      }
      this.axios({
        url: 'sumsub/get_equity',
        params,
      }).then(({ code, data, msg }) => {
        if (code.toString() === '0') {
          const vf = this.haveBranch ? this.branchShowPrecision : this.showPrecision;
          this.isPermission = (data.withdrawAmount && data.withdrawAmount > 0);
          if (this.isPermission) {
            this.canAlert();
          }
          this.canUseAmount = data.canUseAmount;
          if (symbol && this.isPermission) {
            this.withdrawalLimitList = [
              // { key: 'withdrawalLimit', value: data.currentSymbolAmount ? `${fixD(data.currentSymbolAmount)}` : `${0}` },
              // { key: 'withdrawalLimit24', value: `${data.canUseAmount ? fixD(data.canUseAmount) : '0.0'}/${data.withdrawAmount ? fixD(data.withdrawAmount) : '0.0'} USDT` },
              { key: 'withdrawalLimit24', value: `${data.canUseAmount ? fixD(data.canUseAmount, vf) : '0.00'}/${data.withdrawAmount ? fixD(data.withdrawAmount, vf) : '0.00'} ${symbol}` },
            ];
          }
        } else {
          this.$bus.$emit('tip', { text: msg, type: 'error' });
        }
      });
    },
    canAlert() {
      if (this.enforceGoogleAuth) {
        if (!this.OpenGoogle) {
          this.alertFlag = true;
        }
      } else if (!this.OpenGoogle && !this.OpenMobile) {
        this.alertFlag = true;
      }
    },
    alertClone() {
      this.alertFlag = false;
      this.notIdShowDialog = false;
    },
    verifyDialogClose() {
      this.clearDialogData();
    },
    clearDialogData() {
      this.dialogFlag = false;
      this.typeList = [];
      this.verifyType = '';
      this.confirmLoading = false;
    },
    // eslint-disable-next-line consistent-return
    verifyDialogConfirm(item) {
      if (!item) {
        return false;
      }
      const obj = {};
      if (item) {
        if (item.fundCode) {
          obj.capitalPwd = item.fundCode;
        }
        if (item.google) {
          obj.googleCode = item.google;
        }
        if (item.email) {
          obj.emailCode = item.email;
        }
      }
      if (this.nowType === 2) {
        if (item.mobile) {
          obj.smsAuthCode = item.mobile;
        }
        this.innnerTransfer(obj);
      } else if (this.verifyType === 'withdraw') {
        if (item.mobile) {
          obj.smsAuthCode = item.mobile;
        }
        this.confirmWithdraw(obj);
      } else if (this.verifyType === 'address') {
        if (item.mobile) {
          obj.smsValidCode = item.mobile;
        }
        this.confirmAddAddress(obj);
      }
    },
    alertGo() { this.$router.push('/personal/userManagement'); },
    goAddress() {
      this.$router.push(`/assets/addressMent?symbol=${this.symbol}`);
    },
    inputChange(v, name) {
      this[name] = v;
    },
    addressInit() {
      // 获取table表数据
      this.getTableList();
      this.getAddress();
    },
    addressInput(val) {
      // const { value } = e.target;
      this.addressChange({ code: val });
    },
    autocompleteChanges(obj) {
      this.addressChange({ code: obj.value, ...obj });
    },
    // 提现select框 change
    addressChange(item) {
      this.optionSelect = item.code;
      this.trustType = Number(item.trustType) || 0;
      this.addressValue = item.code;
      const addressItem = this.addressList.find((val) => val.code === item.code);
      if (addressItem) {
        this.canLableEdit = false;
      } else {
        this.canLableEdit = true;
      }
      if (this.isHavePage && addressItem) {
        const [, pagesValue] = this.detailsAddressList[item.code].address.split('_');
        this.pagesValue = pagesValue;
      }
    },
    // 全部提现
    allWithDraw() {
      if (this.detailsList[1].value === '--') return;
      this.numberValue = this.detailsList[1].value;
    },
    // 分页器
    pagechange(v) {
      this.paginationObj.currentPage = v;
      this.getTableList();
    },
    // 上半部分 左侧数据
    initDetails() {
      const obj = this.exchangeData.allCoinMap[this.symbol];
      const normalBalance = Number(obj.normal_balance) || Number(obj.overcharge_balance);
      this.detailsList = [
        { key: 'sum', value: fixD(obj.total_balance, this.showPrecision) }, // 总额
        { key: 'normal', value: fixD(normalBalance, this.showPrecision) }, // 可用
        { key: 'lock', value: fixD(obj.lock_balance, this.showPrecision) }, // 冻结
      ];
      this.symbol_withdraw_msg = obj.symbol_withdraw_msg || null; // 注意事项
      // this.withdrawMin = fixD(obj.withdraw_min, this.showPrecision); // 最小提币额
      // this.withdrawMax = fixD(obj.withdraw_max, this.showPrecision);// 最大提币额
      // this.daywithdrawMax = fixD(obj.withdraw_max_day, this.showPrecision);// 单日最大提币额
      if (this.nowType === 2) {
        this.defaultFeeFlag = true;
        this.defaultFee = `${obj.innerTransferFee}`;
        this.proceduresValue = `${obj.innerTransferFee}`; // 默认手续费
      }
      // if (!this.haveBranch) {
      //   this.feeMin = fixD(obj.feeMin, this.showPrecision);// 最大手续费
      //   this.feeMax = fixD(obj.feeMax, this.showPrecision);// 最大手续费
      //   if (this.defaultFeeFlag) {
      //     this.defaultFeeFlag = false;
      //     this.defaultFee = `${obj.defaultFee}`;
      //     this.proceduresValue = `${obj.defaultFee}`; // 默认手续费
      //   }
      // }
    },
    getBranchAddress(symbol) {
      const str = symbol || (this.haveBranch ? this.activeBranch : this.symbol);
      this.axios({
        url: 'cost/Getcost',
        params: {
          symbol: str,
        },
      }).then((data) => {
        if (data.code.toString() === '0') {
          const list = [];
          const detailsList = {};
          const { userWithdrawAddrList } = data.data;
          userWithdrawAddrList.forEach((item) => {
            let value = item.address;
            if (this.isHavePage) {
              [value] = item.address.split('_');
            }
            list.push({
              code: `${item.id}`, value, label: item.label, trustType: item.trustType,
            });
            detailsList[item.id] = item;
          });
          const vf = this.haveBranch ? this.branchShowPrecision : this.showPrecision;
          // this.feeMin = fixD(data.data.feeMin, this.branchShowPrecision);// 最大手续费
          // this.feeMax = fixD(data.data.feeMax, this.branchShowPrecision);// 最大手续费
          if (this.nowType === 1) {
            this.feeMin = fixD(data.data.feeMin, vf);// 最大手续费
            this.feeMax = fixD(data.data.feeMax, vf);// 最大手续费
            if (this.defaultFeeFlag) {
              this.defaultFeeFlag = false;
              this.defaultFee = `${data.data.defaultFee}`;
            }
            this.proceduresValue = `${data.data.defaultFee}`; // 默认手续费
            this.branchTip = data.data.mainChainNameTip;
            this.tabelLoading = false;
            this.addressList = list;
            this.detailsAddressList = detailsList;
          }
          this.withdrawMin = fixD(data.data.withdraw_min, vf); // 最小提币额
          this.withdrawMax = fixD(data.data.withdraw_max, vf);// 最大提币额
        }
      });
    },
    // 获取提现地址
    getAddress() {
      if (this.nowType === 1) {
        this.getBranchAddress();
        return;
      }
      this.axios({
        url: 'addr/address_list',
        params: {
          coinSymbol: this.haveBranch ? this.activeBranch : this.symbol,
        },
      }).then((data) => {
        if (data.code.toString() === '0') {
          const list = [];
          const detailsList = {};
          const { addressList } = data.data;
          addressList.forEach((item) => {
            let value = item.address;
            if (this.isHavePage) {
              [value] = item.address.split('_');
            }
            list.push({
              code: `${item.id}`, value, label: item.label, trustType: item.trustType,
            });
            detailsList[item.id] = item;
          });
          this.tabelLoading = false;
          this.addressList = list;
          this.detailsAddressList = detailsList;
        }
      });
    },
    // 获取验证码
    getCodeClick() {
      this.sendSmsCode();
    },
    // 发送验证码
    sendSmsCode() {
      let operationType = '';
      if (this.nowType === 2) {
        operationType = '34';
      } else if (this.verifyType === 'withdraw') {
        operationType = '10';
      } else if (this.verifyType === 'address') {
        operationType = '11';
      }
      this.axios({
        url: 'v4/common/smsValidCode',
        params: {
          operationType,
        },
      }).then((data) => {
        if (data.code.toString() !== '0') {
          setTimeout(() => {
            // 倒计时重置
            this.$bus.$emit('getCode-clear', 'withdrawGetcode');
            // tip框提示错误
            this.$bus.$emit('tip', { text: data.msg, type: 'error' });
          }, 2000);
        } else {
          this.$bus.$emit('tip', { text: this.$t('login.phoneSendSuccess'), type: 'success' });
        }
      });
    },
    withdrawClick() {
      if (this.OpenGoogle || (!this.enforceGoogleAuth && this.OpenMobile)) {
        if (this.withdrawKycOpen && this.idAuth !== 1) {
          this.notIdShowDialog = true;
          return;
        }
        if (this.nowType === 2) {
          this.isExistAccount();
          return;
        }
        this.showConfirmDialog = true;
        return;
      }
      this.alertFlag = true;
    },
    // 站内直转确认
    innnerTransfer(obj) {
      if (!obj) return;
      this.loading = true;
      this.confirmLoading = true;
      const pv = this.showPrecision;
      const amount = fixD(this.numberValue - this.proceduresValue, pv);
      this.axios({
        url: 'inner_transfer/do_withdraw',
        params: {
          transferUid: this.accountValue, // 提现地址id
          fee: this.proceduresValue, // 手续费
          amount, // 提现金额（不包含手续费
          symbol: this.symbol,
          ...obj,
        },
      }).then((data) => {
        this.loading = false;
        this.confirmLoading = false;
        if (data.code.toString() === '0') {
          this.$store.dispatch('assetsExchangeData'); // 更新额度
          this.getTableList();
          this.$bus.$emit('tip', { text: data.msg, type: 'success' });
          this.clearDialogData();
          this.proceduresValue = '';
          this.numberValue = '';
          // this.phoneValue = '';
          // this.googleValue = '';
          this.accountValue = '';
          // this.dialogFlag = false;
          // 后端不能做额度及时更新，非要加一秒延迟，列表能及时更新额度，这个接口不行，真是666
          setTimeout(() => {
            this.getEquity(this.symbol);
          }, 1000);
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
    doWithdraw() {
      this.showConfirmDialog = false;
      if (this.trustType === 1) {
        this.loading = true;
        this.confirmWithdraw();
        return;
      }
      this.verifyType = 'withdraw';
      this.dialogFlag = true;
    },
    // 提现
    confirmWithdraw(obj) {
      this.loading = true;
      this.confirmLoading = true;
      let addressId = this.addressValue;
      let address = this.addressValue;
      if (this.pagesValue) {
        address = `${this.addressValue}_${this.pagesValue}`;
      }
      const pv = this.haveBranch ? this.branchShowPrecision : this.showPrecision;
      const amount = fixD(this.numberValue - this.proceduresValue, pv);
      const addressItem = this.addressList.find((item) => item.code === this.addressValue);
      if (!addressItem) {
        addressId = '';
      } else {
        address = '';
      }
      const params = obj ? {
        ...obj,
        inputAddress: address, // 提现地址
        addressId, // 提现地址id
        fee: this.proceduresValue, // 手续费
        amount, // 提现金额（不包含手续费
        symbol: this.haveBranch ? this.activeBranch : this.symbol,
        trustType: this.trustType,
      } : {
        inputAddress: address, // 提现地址
        addressId, // 提现地址id
        fee: this.proceduresValue, // 手续费
        amount, // 提现金额（不包含手续费
        symbol: this.haveBranch ? this.activeBranch : this.symbol,
        trustType: this.trustType,
      };
      this.axios({
        url: 'finance/do_withdraw',
        params,
      }).then((data) => {
        this.loading = false;
        this.confirmLoading = false;
        if (data.code.toString() === '0') {
          this.getTableList(); // 获取列表
          this.$store.dispatch('assetsExchangeData'); // 更新额度
          this.$bus.$emit('tip', { text: data.msg, type: 'success' });
          this.addressValue = '';
          this.pagesValue = '';
          this.numberValue = '';
          // this.proceduresValue = this.defaultFee;
          this.clearDialogData();
          // this.phoneValue = '';
          // this.googleValue = '';
          // this.dialogFlag = false;
          setTimeout(() => {
            this.getEquity(this.symbol);
          }, 1000);
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
    // 添加地址
    confirmAddAddress(obj) {
      this.loading = true;
      this.confirmLoading = true;
      if (!obj) return;
      this.axios({
        url: 'addr/add_withdraw_addr',
        params: {
          ...this.addressParams,
          ...obj,
        },
      }).then((data) => {
        this.loading = false;
        this.confirmLoading = false;
        this.clearDialogData();
        if (data.code.toString() !== '0') {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'success' });
          this.getBranchAddress();
        }
      });
    },
    copy(value) {
      this.copyValue = value;
      this.$nextTick(() => {
        const input = this.$refs.copyValue;
        input.select();
        document.execCommand('copy');
        // 地址复制成功
        this.$bus.$emit('tip', { text: this.$t('assets.krw.copySuccess'), type: 'success' });
      });
    },
    // 撤销操作
    revoke(item) {
      if (this.revokeList.indexOf(item.id) === -1) {
        this.revokeList.push(item.id);
        this.axios({
          url: '/finance/cancel_withdraw',
          headers: {},
          params: {
            withdrawId: item.id,
          },
          method: 'post',
        }).then((data) => {
          const ind = this.revokeList.indexOf(item.id);
          this.revokeList.splice(ind, 1);
          if (data.code.toString() === '0') {
            this.getTableList();
            this.$store.dispatch('assetsExchangeData'); // 更新额度
            this.$bus.$emit('tip', { text: data.msg, type: 'success' });
          } else {
            this.$bus.$emit('tip', { text: data.msg, type: 'error' });
          }
        });
      }
    },
    // 千分符
    thousands(num) {
      if (num && parseFloat(num)) {
        const str = num.toString();
        const reg = str.indexOf('.') > -1 ? /(\d)(?=(\d{3})+\.)/g : /(\d)(?=(?:\d{3})+$)/g;
        return str.replace(reg, '$1,');
      }
      return num;
    },
    // 获取提现记录数据
    getTableList() {
      this.tabelLoading = true;
      this.axios({
        url: 'record/new_withdraw_list',
        params: {
          pageSize: this.paginationObj.display, // 每页条数
          page: this.paginationObj.currentPage, // 页码
          coinSymbol: this.symbol,
          type: this.nowTypeTable,
        },
      }).then((data) => {
        this.tabelLoading = false;
        if (data.code.toString() === '0') {
          const list = [];
          this.financeListData = data.data.financeList;
          const { coinList } = this;
          data.data.financeList.forEach((item, index) => {
            let { txid } = item;
            if (txid && txid.length > 15) {
              txid = `${txid.slice(0, 8)}...${txid.slice(-6)}`;
            }
            let address = item.addressTo;
            if (address && address.length > 15) {
              address = `${address.slice(0, 8)}...${address.slice(-6)}`;
            }
            const showPrecision = (coinList[item.symbol] && coinList[item.symbol].showPrecision)
              || 0;
            const amount = fixD(item.amount, showPrecision);
            const fee = fixD(item.fee, showPrecision);
            if (this.nowTypeTable === 1) {
              list.push({
                index,
                id: item.id,
                coin: item.symbol, // 币种
                time: item.createdAtTime ? formatTime(item.createdAtTime) : '- -', // 时间
                amount: this.thousands(amount), // 充值数量
                fee: this.thousands(fee), // 手续费
                address, // 充值地址
                addressLong: item.addressTo,
                remark: item.label,
                updateAt: item.walletTime ? formatTime(item.walletTime) : '- -', // 处理时间
                txid: txid || '- -', // 交易ID
                txidLong: item.txid,
                status: item.status,
                statusText: item.status_text, // 状态
                operation: this.$t('assets.flowingWater.Cancel'),
              });
            } else if (this.nowTypeTable === 2) {
              list.push({
                index,
                id: item.id,
                time: item.createdAtTime ? formatTime(item.createdAtTime) : '- -', // 时间
                addressTo: item.addressTo,
                amount: this.thousands(amount), // 充值数量
                fee: this.thousands(fee), // 手续费
                statusText: item.status_text, // 状态
              });
            }
          });
          this.tabelList = [...list];
          this.paginationObj.total = data.data.count > 30 ? 30 : data.data.count;
        }
      });
    },
    // 去认证
    gotoAuth() {
      this.$router.push('/personal/identityAuthen');
    },
    // 添加提币地址
    addWithdrawAddress() {
      if (this.OpenGoogle || (!this.enforceGoogleAuth && this.OpenMobile)) {
        this.showAddressDialog = true;
      } else {
        this.alertFlag = true;
      }
    },
    // 添加提币
    showConfirmVerify(params) {
      this.addressParams = params;
      this.verifyType = 'address';
      this.$refs.addAddress.clear();
      this.showAddressDialog = false;
      this.dialogFlag = true;
    },
    showPopover(content, parent) {
      this.popoverContent = content;
      this.popoverParent = parent;
      this.$nextTick(() => {
        this.popoverShow = true;
      });
    },
    closePopover() {
      this.popoverShow = false;
    },
  },
};
