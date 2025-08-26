import { colorMap, imgMap, getIconPath } from '@/utils';

export default {
  name: 'addAddress',
  props: {
    selectList: {
      type: Array,
      default: () => [],
    },
    defaultSymbol: {
      type: String,
      default: '',
    },
    chainTitleClass: {
      type: String,
      default: 'text-2-cl',
    },
  },
  data() {
    return {
      getIconPath,
      tabelLoading: true,
      imgMap,
      colorMap,
      symbolValue: '', // 添加地址 -- 币种
      addressValue: '', // 添加地址 -- 地址
      remarksValue: '', // 添加地址 -- 备注
      pagesValue: '', // 添加地址 -- 标签
      havePageArr: ['XRP', 'EOS'], // 含有标签的币种
      branchTip: '',
      addressIconHover: false,
      trustAddress: false, // 信任地址
    };
  },
  computed: {
    symbol() { return this.symbolValue; },
    userInfoIsReady() { return this.$store.state.baseData.userInfoIsReady; },
    // market 接口
    market() { return this.$store.state.baseData.market; },
    // 该币种是否有标签
    isHavePage() {
      let flag = false;
      // 判断market是否请求下来
      if (this.market && this.market.coinList) {
        if (!this.haveBranch) {
          // 判断market.coinList是否有当前币种
          if (this.market.coinList[this.symbolValue]) {
            const { tagType } = this.market.coinList[this.symbolValue];
            flag = tagType;
          }
        } else if (this.market.followCoinList[this.symbolValue][this.activeBranch]) {
          const { tagType } = this.market.followCoinList[this.symbolValue][this.activeBranch];
          flag = tagType;
        }
      }
      return flag;
    },
    // 用于检测标签  如果该币种有标签则 非空才通过
    pagesFlag() {
      let flag = false;
      // 如果有值 算通过
      /*    if (this.pagesValue.length) {
        flag = true;
      } */
      // 如果没有标签 直接算通过
      switch (Number(this.isHavePage)) {
        case 1:
        {
          flag = true;
          break;
        }
        case 2:
        {
          if (this.pagesValue.length) {
            flag = true;
          }
          break;
        }
        default:
        {
          flag = true;
        }
      }
      return flag;
    },
    // 添加按钮disabled
    addressBtnDisabled() {
      if (!this.userInfoIsReady) { return true; }
      let flag = true;
      if (this.symbolValue.length
        && this.addressValue.length
        && this.remarksValue.length
        && this.pagesFlag) {
        flag = false;
      }
      return flag;
    },
    // phoneValue 是否复合正则验证
    phoneValueFlag() { return this.$store.state.regExp.verification.test(this.phoneValue); },
    // googleValue 是否复合正则验证
    googleValueFlag() { return this.$store.state.regExp.verification.test(this.googleValue); },
    phoneError() {
      if (this.phoneValue.length !== 0 && !this.phoneValueFlag) return true;
      return false;
    },
    googleError() {
      if (this.googleValue.length !== 0 && !this.googleValueFlag) return true;
      return false;
    },
    // 语音短信开关
    voiceSmsOpen() {
      return this.$store.state.baseData.voiceSmsOpen;
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
  },
  watch: {
    defaultSymbol(val) {
      this.symbolValue = val;
    },
    market(v) {
      if (v && this.symbol) {
        this.branchInit(this.market, this.usdtOpenOmni, 'withdraw');
      }
    },
    symbol(v) {
      if (v && this.market) {
        this.branchInit(this.market, this.usdtOpenOmni, 'withdraw');
      }
    },
    // 添加地址切换币种时 清空地址/备注/标签
    symbolValue() {
      this.addressValue = '';
      this.remarksValue = '';
      this.pagesValue = '';
    },
    activeBranch(v) {
      if (v) {
        this.axios({
          url: 'cost/Getcost',
          params: {
            symbol: v,
          },
        }).then((data) => {
          if (data.code.toString() === '0') {
            this.branchTip = data.data.mainChainNameTip;
          }
        });
      }
    },
  },
  methods: {
    init() {
      if (this.defaultSymbol) {
        this.symbolValue = this.defaultSymbol;
      } else if (this.selectList.length) {
        this.symbolValue = this.selectList[0].code;
      }
    },
    // 添加地址 -- input改变
    inputChange(value, name) {
      this[name] = value;
    },
    // 添加地址 -- select改变
    selectChange(item) {
      this.symbolValue = item.code;
    },
    setActiveBranch(v) {
      this.activeBranch = v;
    },
    clear() {
      // this.symbolValue = '';
      this.addressValue = '';
      this.remarksValue = '';
      this.pagesValue = '';
    },
    addressBtnClick() {
      let address = this.addressValue;
      if (this.isHavePage) {
        address += `_${this.pagesValue}`;
      }
      this.$emit('add', {
        coinSymbol: this.haveBranch ? this.activeBranch : this.symbolValue, // 币种
        address, // 地址
        label: this.remarksValue, // 备注
        trustType: this.trustAddress ? 1 : 0, // 信任地址
      });
    },
    // 信任地址
    setTrust() {
      this.trustAddress = !this.trustAddress;
    },
  },
};
