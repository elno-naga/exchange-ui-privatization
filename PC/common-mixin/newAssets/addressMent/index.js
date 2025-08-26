import {
  getCoinShowName, colorMap, imgMap, getIconPath,
  sendVerigicationCode,
} from '@/utils';

export default {
  name: 'page-addressMent',
  data() {
    return {
      getIconPath,
      tabelLoading: true,
      imgMap,
      colorMap,
      alertFlag: false,
      selectList: [],
      remarksisRequire: false,
      googleValue: '', // 添加地址 -- 谷歌验证码
      phoneValue: '', // 添加地址 -- 手机验证码
      dialogFlag: false, // 验证框flag
      dialogConfirmLoading: false, // 弹窗按钮确认loading状态
      tableList: [],
      dialogStatus: '', // 弹窗状态 add 为增加 del 为删除
      deleteObj: {}, // 删除的地址 对象
      paginationObj: {
        total: 0, // 数据总条数
        display: 10, // 每页显示条数
        currentPage: 1, // 当前页码
      },
      branchTip: '',
      qrcodeHover: null, // 划过地址二维码
      addressQRCode: '', // 二维码
      symbolValue: '',
    };
  },
  computed: {
    symbol() { return this.symbolValue; },
    enforceGoogleAuth() {
      return this.$store.state.baseData.is_enforce_google_auth || 0;
    },
    authTitleText() {
      const text = this.enforceGoogleAuth ? 'assets.withdraw.enforceGoogleAuth' : 'assets.withdraw.safetyWarningError';
      return this.$t(text);
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
    // finance/account_balance 接口返回成功的数据
    exchangeData() { return this.$store.state.assets.exchangeData; },
    // market 接口
    market() { return this.$store.state.baseData.market; },
    // userInfo是否请求完毕
    userInfoIsReady() { return this.$store.state.baseData.userInfoIsReady; },
    // 表格title
    columns() {
      return [
        { key: 'coin', title: this.$t('assets.addressMent.listCoin'), width: '15%' }, // 币种
        { key: 'address', title: this.$t('assets.addressMent.listAddress'), width: '40%' }, // 地址
        { key: 'remark', title: this.$t('assets.addressMent.listRemarks'), width: '40%' }, // 备注
        { key: 'operation', title: this.$t('assets.addressMent.listOptions'), width: '5%' }, // 操作
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
    // 用户是否开启谷歌
    OpenGoogle() {
      let flag = false;
      const { userInfo } = this.$store.state.baseData;
      if (userInfo && userInfo.googleStatus.toString() === '1') {
        flag = true;
      }
      return flag;
    },
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
    // 弹窗确认按钮disabled
    dialogConfirmDisabled() {
      let phone = true;
      let google = true;
      if (this.OpenMobile) { phone = this.phoneValueFlag; }
      if (this.OpenGoogle) { google = this.googleValueFlag; }
      if ((phone && google) || this.dialogConfirmLoading) {
        return false;
      }
      return true;
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
    userInfo() {
      return this.$store.state.baseData.userInfo;
    },
    typeList() {
      const arr = [];
      if (this.userInfo && this.userInfo.googleStatus) {
        arr.push('google');
      }
      if (this.userInfo && this.userInfo.isOpenMobileCheck) {
        arr.push('mobile');
      } else if (this.userInfo && this.userInfo.email) {
        arr.push('email');
      }
      return arr;
    },
    sendCodeType() {
      let str = '';
      if (this.dialogStatus === 'add') {
        str = sendVerigicationCode.addWithdrawAddress;
      } else {
        str = sendVerigicationCode.delWithdrawAddress;
      }
      return str;
    },
  },
  watch: {
    market(v) {
      if (v && this.exchangeData) {
        this.initSelectData();
      }
      if (v) {
        this.getTableList();
      }
      if (v && this.symbol) {
        this.branchInit(this.market, this.usdtOpenOmni);
      }
    },
    symbol(v) {
      if (v && this.market) {
        this.branchInit(this.market, this.usdtOpenOmni);
      }
    },
    userInfoIsReady() { this.canAlert(); },
    exchangeData(v) { if (v && this.market) { this.initSelectData(); } },
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
      const { symbol } = this.$route.query;
      this.symbolValue = symbol;
      // 如果没有 finance/account_balance 接口返回成功的数据
      if (!this.exchangeData) {
        this.$store.dispatch('assetsExchangeData');
      } else if (this.market) {
        this.initSelectData();
      }
      if (this.userInfoIsReady) {
        this.canAlert();
      }
      if (this.market) {
        this.getTableList();
      }
    },
    canAlert() {
      if (this.OpenGoogle || (!this.enforceGoogleAuth && this.OpenMobile)) {
        this.alertFlag = false;
      } else {
        setTimeout(() => {
          this.alertFlag = true;
        }, 100);
      }
    },
    alertClone() { this.alertFlag = false; },
    alertGo() { this.$router.push('/personal/userManagement'); },
    pagechange() {

    },
    // 添加地址 -- input改变
    inputLineChange(value, name) {
      this[name] = value;
    },
    // 添加地址 -- select改变
    selectLineChange(item) { this.symbolValue = item.code; },
    setActiveBranch(v) {
      this.activeBranch = v.code;
    },
    // 添加地址 -- select数据
    initSelectData() {
      const list = [];
      Object.keys(this.exchangeData.allCoinMap).forEach((item) => {
        if (this.exchangeData.allCoinMap[item].isFiat) {
          return;
        }
        const { coinList } = this.market;
        const showCoin = getCoinShowName(item, coinList);
        list.push({
          img: coinList[item].icon,
          value: showCoin,
          code: item,
        });
      });
      this.selectList = list;
    },
    // 弹框取消
    // dialogClose() {
    //   this.dialogFlag = false;
    //   this.googleValue = '';
    //   this.phoneValue = '';
    //   this.dialogStatus = '';
    // },
    addDialogConfirm(obj) {
      this.dialogConfirmLoading = true;
      this.axios({
        url: 'addr/add_withdraw_addr',
        params: {
          ...this.addressParams,
          ...obj,
        },
      }).then((data) => {
        this.dialogConfirmLoading = false;
        if (data.code.toString() !== '0') {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        } else {
          this.$refs.addAddress.clear();
          this.$bus.$emit('tip', { text: data.msg, type: 'success' });
          this.getTableList();
          this.dialogFlag = false;
          this.dialogStatus = '';
        }
      });
    },
    delDialogConfirm(obj) {
      if (!obj) return;
      this.dialogConfirmLoading = true;
      this.axios({
        url: 'addr/delete_withdraw_addr',
        params: {
          ids: [this.deleteObj.id], // 删除的id
          ...obj,
        },
      }).then((data) => {
        this.dialogConfirmLoading = false;
        if (data.code.toString() !== '0') {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'success' });
          this.getTableList();
          this.dialogFlag = false;
          this.googleValue = '';
          this.phoneValue = '';
          this.dialogStatus = '';
        }
      });
    },
    // 获取验证码
    getCodeClick() {
      this.sendSmsCode();
    },
    // 发送验证码
    // sendSmsCode() {
    //   const operationType = this.dialogStatus === 'add' ? '11' : '21';
    //   this.axios({
    //     url: 'v4/common/smsValidCode',
    //     params: {
    //       operationType,
    //     },
    //   }).then((data) => {
    //     if (data.code.toString() !== '0') {
    //       setTimeout(() => {
    //         // 倒计时重置
    //         this.$bus.$emit('getCode-clear', 'addressGetcode');
    //         // tip框提示错误
    //         this.$bus.$emit('tip', { text: data.msg, type: 'error' });
    //       }, 2000);
    //     } else {
    //       // 短信已发送，请注意查收
    //       this.$bus.$emit('tip', { text: this.$t('assets.addressMent.phoneSendSuccess'), type: 'success' });
    //     }
    //   });
    // },
    delAddress(item) {
      this.deleteObj = item;
      this.dialogStatus = 'del';
      this.dialogFlag = true;
    },
    getTableList() {
      this.axios({
        url: 'addr/address_list',
      }).then((data) => {
        if (data.code.toString() === '0') {
          const list = [];
          data.data.addressList.forEach((item) => {
            const { coinList } = this.market;
            const showCoin = getCoinShowName(item.symbol, coinList);
            let addressLong = '';
            if (item.address.length > 50) {
              addressLong = item.address;
            }
            const address = item.address.length > 50 ? `${item.address.slice(0, 30)}...${item.address.slice(-6)}` : item.address;
            list.push({
              id: item.id,
              coin: showCoin,
              addressQRCode: item.addrImage,
              address,
              addressLong,
              remark: item.label,
              trustType: item.trustType,
              operation: this.$t('assets.addressMent.delete'), // 删除
            });
          });
          this.tabelLoading = false;
          this.tableList = list;
        }
      });
    },
    // 添加提币
    showConfirmVerify(params) {
      this.addressParams = params;
      if (this.OpenGoogle || (!this.enforceGoogleAuth && this.OpenMobile)) {
        this.dialogStatus = 'add';
        this.dialogFlag = true;
        return;
      }
      this.alertFlag = true;
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
    qrIconHover(row) {
      this.addressQRCode = row.addressQRCode;
      const { id } = row;
      this.qrcodeHover = id;
      const el = document.querySelector(`#popover${id}`);
      const qrImg = document.querySelector('.qrcode-img');
      const { left, top } = el.getBoundingClientRect();
      qrImg.style.left = `${left - 54}px`;
      qrImg.style.top = `${top - 125}px`;
    },
    qrIconHoverOut() {
      this.addressQRCode = '';
      this.qrcodeHover = null;
    },
    branchInit(v, flag = '1', type) { // flag : 是否显示usdt 的 mainChainName, 1 显示 0 不显示   type 'withdraw'提现  recharge 充值
      const { coinList, followCoinList } = v;
      this.haveBranch = false;
      this.branchArr = [];
      this.activeBranch = '';
      this.mainChainName = this.symbol && coinList[this.symbol] && coinList[this.symbol].mainChainName;
      if (this.symbol && coinList[this.symbol]
        && coinList[this.symbol].mainChainType === 1) {
        this.haveBranch = true;
        if (followCoinList[this.symbol]) {
          const arr = [];
          const coinKeys = Object.keys(followCoinList[this.symbol]);
          coinKeys.forEach((item) => {
            const even = followCoinList[this.symbol][item];
            if (even.mainChainName === 'OMNI') {
              // flag值不为0 才会把usdt的mainChainName值为OMNI的链加入到数组中，omni只通过usdt_open_omni开关判断显示隐藏，其他链都过withdrawOpen depositOpen
              if (flag !== '0') {
                arr.push({ value: even.mainChainName, code: item });
              }
            } else {
              // withdrawOpen 提现 1显示tab  0不显示
              // depositOpen 充值 1显示tab  0不显示
              if (type === 'withdraw' && even.withdrawOpen === 1) {
                arr.push({ value: even.mainChainName, code: item });
              }
              if (type === 'recharge' && even.depositOpen === 1) {
                arr.push({ value: even.mainChainName, code: item });
              }
            }
          });
          this.branchArr = arr;
          if (coinKeys.indexOf(this.symbol) !== -1) {
            this.activeBranch = this.symbol;
          } else {
            const [activeBranch] = coinKeys;
            this.activeBranch = activeBranch;
          }
          // flag值为0 的时候 默认选中数组第一个
          if (flag === '0') {
            const newCoinKeys = coinKeys.filter((item) => item !== 'USDT');
            [this.activeBranch] = newCoinKeys;
          }
          // 取this.activeBranch对应的链名称赋值给this.mainChainName
          const obj = arr.find((item) => item.code === this.activeBranch) || {};
          this.mainChainName = obj.value;
        }
      }
    },
    verifyDialogClose() {
      this.dialogFlag = false;
      this.dialogConfirmLoading = false;
    },
    // eslint-disable-next-line consistent-return
    verifyDialogConfirm(item) {
      if (!item) {
        return false;
      }
      const obj = {};
      if (item) {
        if (item.google) {
          obj.googleCode = item.google;
        }
        if (item.email) {
          obj.emailCode = item.email;
        }
      }
      if (this.dialogStatus === 'add') {
        if (item.mobile) {
          obj.smsValidCode = item.mobile;
        }
        this.addDialogConfirm(obj);
      } else if (this.dialogStatus === 'del') {
        if (item.mobile) {
          obj.smsValidCode = item.mobile;
        }
        this.delDialogConfirm(obj);
      }
    },
  },

};
