import {
  fixD, getCoinShowName, colorMap, imgMap, formatTime, getIconPath,
} from '@/utils';

export default {
  name: 'assets-transfer',
  data() {
    return {
      imgMap,
      colorMap,
      getIconPath,
      rechargeCoinList: [], // 币种列表
      symbol: '', // 选择的币种
      selectAccountList: [], // 子账户下拉
      selAccount: '', // 选择的子账户
      detailsList: [
        { key: 'sum', value: '' },
        { key: 'normal', value: '' },
        { key: 'lock', value: '' },
      ], // 余额预览
      branchLoading: false,
      branchTip: '',
      addressQRCode: '', // 二维码地址
      showReLoad: false,
      address: '', // 地址
      addressLong: '', // 未省略地址
      addressPage: '', // 标签（xrp/eos）时
      copyValue: '', // 复制数据
      rechargeFlag: true, // 充提 是否展示 针对ecxx家加的校验 非白名单用户 隐藏充提
      addressPageShow: true,
      addressShow: true,
      helpIconHover: false, // 标签提示
      tableList: [],
      tableLoading: false,
      paginationObj: {
        total: 0, // 数据总条数
        display: 10, // 每页显示条数
        currentPage: 1, // 当前页码
      },
      alertFlag: false,
      exchangeData: {},
      nowType: 1,
    };
  },
  watch: {
    // exchangeData(v) {
    //   if (v && this.market) {
    //     this.setRechargeCoinList();
    //   }
    // },
    symbol(v) {
      if (v && this.market) {
        this.branchInit(this.market, 'recharge');
        // this.initAddress();
        // this.initDetails();
        this.getExchangeData();
      }
    },
    selAccount(v) {
      if (v && this.market) {
        this.branchInit(this.market, 'recharge');
        // this.initAddress();
        // this.initDetails();
        this.getExchangeData();
      }
    },
    market: {
      immediate: true,
      handler(v) {
        if (v && JSON.stringify(this.exchangeData) !== '{}') {
          this.setRechargeCoinList();
        }
      },
    },
    // paginationObjCurrentPage() {
    //   this.getTableList();
    // },
  },
  methods: {
    async init() {
      this.selectAccountList = await this.getSelAccountList();
      this.selAccount = this.$route.query.id ? Number(this.$route.query.id) : this.selectAccountList[0].code;
      // 如果没有 finance/account_balance 接口返回成功的数据
      this.getExchangeData();
      if (this.cropPassSwitch) {
        this.getWhiteList();
      }
      this.getTableList();
    },
    // 获取白名单用户
    getWhiteList() {
      this.axios({
        url: 'finance/whiteListUsers',
        headers: {},
        params: {},
        method: 'post',
      }).then((data) => {
        if (data.code === '0') {
          // eslint-disable-next-line max-len
          this.rechargeFlag = data.data.whiteListUsers.some((item) => Number(item) === this.userInfo.id);
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
    // 获取子账户下拉
    getSelAccountList() {
      return new Promise((resolve) => {
        this.axios({
          url: this.$store.state.url.subAccount.common_getAllSub,
          method: 'post',
        }).then((data) => {
          if (data.code.toString() === '0') {
            const tempList = data.data.list.map((it) => ({
              value: it.email,
              code: it.subUid,
            }));
            resolve(tempList);
          } else {
            resolve([]);
          }
        });
      });
    },
    // 获取子账户资产
    getExchangeData() {
      this.axios({
        url: this.$store.state.url.subAccount.recharge_accountBalance,
        params: { subUid: this.selAccount },
      }).then((data) => {
        if (data.code.toString() === '0') {
          this.exchangeData = { ...data.data };
          if (this.exchangeData && this.market) {
            this.setRechargeCoinList();
            this.initAddress();
            this.initDetails();
          }
        } else {
          this.exchangeData = {};
        }
      });
    },
    // 处理可充值币种数据（币种下拉）ll
    setRechargeCoinList() {
      if (this.rechargeCoinList.length) return;
      const data = this.exchangeData.allCoinMap;
      const list = [];
      Object.keys(data).forEach((item) => {
        if (data[item].isFiat) {
          return;
        }
        // 该币种精度
        const { coinList } = this;
        const fix = (coinList[item] && coinList[item].showPrecision) || 0;
        const coinName = getCoinShowName(item, coinList);
        if (data[item].depositOpen && this.rechargeFlag) {
          list.push({
            img: coinList[item].icon,
            code: item,
            value: coinName,
            subValue: coinList[item].longName,
            sort: data[item].normal_balance,
            label: this.thousands(fixD(data[item].normal_balance, fix)),
          });
        }
      });
      list.sort((a, b) => b.sort - a.sort);
      this.rechargeCoinList = [...list];
      // 如果不存在币种
      if (this.$route.query.symbol) {
        this.symbol = this.$route.query.symbol.toUpperCase();
      } else if (this.rechargeCoinList.length && data.USDT && data.USDT.depositOpen) {
        this.symbol = 'USDT';
      }
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
    selectChange(item, name) {
      this[name] = item.code;
      this.getTableList();
    },
    setActiveBranch(v) {
      if (this.activeBranch !== v) {
        this.branchLoading = true;
      }
      this.activeBranch = v;
      this.initAddress();
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
    // 刷新充值地址
    reload() {
      this.initAddress();
    },
    getBranchAddress() {
      this.axios({
        url: 'cost/Getcost',
        params: {
          symbol: this.activeBranch,
        },
      }).then((data) => {
        if (data.code.toString() === '0') {
          this.branchTip = data.data.mainChainNameTip;
        }
      });
    },
    initAddress() {
      if (!this.symbol) return;
      this.branchLoading = true;
      this.showReLoad = false;
      const { tagType } = this.coinList[this.symbol];
      if (tagType === 1 || tagType === 2) {
        setTimeout(() => {
          this.alertFlag = Boolean(tagType);
        }, 100);
      }
      if (this.haveBranch) {
        this.getBranchAddress();
      }
      // 请求该数据详情
      this.axios({
        url: this.$store.state.url.subAccount.recharge_address,
        params: {
          symbol: !this.haveBranch ? this.symbol : this.activeBranch,
          subUid: this.selAccount,
        },
      }).then((data) => {
        if (data.code.toString() === '0') {
          // let { allCoinMap } = this.exchangeData
          this.addressQRCode = data.data.addressQRCode;
          if (this.addressQRCode) {
            this.branchLoading = false;
          } else {
            this.showReLoad = true;
          }
          let addressText = '';
          if (this.isHavePage) {
            const arr = data.data.addressStr.split('_');
            const [address, addressPage] = arr;
            addressText = address || '--';
            this.addressPage = addressPage || '--';
          } else {
            addressText = data.data.addressStr || '--';
          }
          if (addressText.length > 37) {
            this.address = `${addressText.slice(0, 28)}...${addressText.slice(-6)}`;
            this.addressLong = addressText;
          } else {
            this.address = addressText;
            this.addressLong = '';
          }
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
    copy(item, value) {
      if (item === 'address') {
        this.copyAddress();
      } else if (item === 'addressPage') {
        this.copyAddressPage();
      } else if (item === 'table') {
        this.copyTableValue(value);
      }
    },
    copyAddress() {
      const input = this.$refs.address;
      input.select();
      document.execCommand('copy');
      // 地址复制成功
      this.$bus.$emit('tip', { text: this.$t('subAccount.assets.recharge.copy_m1'), type: 'success' });
    },
    handMouseenter(name) {
      if (name === 'address') {
        this.addressShow = false;
      } else {
        this.addressPageShow = false;
      }
    },
    handMouseleave(name) {
      if (name === 'address') {
        this.addressShow = true;
      } else {
        this.addressPageShow = true;
      }
    },
    // 复制表格数据
    copyTableValue(value) {
      this.copyValue = value;
      this.$nextTick(() => {
        const input = this.$refs.copyValue;
        input.select();
        document.execCommand('copy');
        // 地址复制成功
        this.$bus.$emit('tip', { text: this.$t('subAccount.assets.recharge.copy_m1'), type: 'success' });
      });
    },
    // 地址标签复制
    copyAddressPage() {
      const input = this.$refs.addressPage;
      input.select();
      input.setSelectionRange(0, input.value.length);
      document.execCommand('copy');
      // 地址标签复制成功
      this.$bus.$emit('tip', { text: this.$t('subAccount.assets.recharge.copy_m2'), type: 'success' });
    },
    // pageChange(v) {
    //   this.paginationObj.currentPage = v;
    // },
    alertClone() { this.alertFlag = false; },
    initDetails() {
      if (!this.symbol) return;
      const obj = this.exchangeData.allCoinMap[this.symbol];
      const normalBalance = Number(obj.normal_balance) || Number(obj.overcharge_balance);
      this.detailsList = [
        { key: 'sum', value: obj.total_balance },
        { key: 'normal', value: normalBalance },
        { key: 'lock', value: obj.lock_balance },
      ];
    },
    // 获取充值记录
    getTableList() {
      this.tableLoading = true;
      this.axios({
        url: this.$store.state.url.subAccount.recharge_record,
        params: {
          pageSize: 10, // 每页条数
          page: 1, // 页码
          coinSymbol: null,
          subUid: this.selAccount,
        },
      }).then((data) => {
        if (data.code.toString() === '0') {
          const list = [];
          const { coinList } = this;
          data.data.financeList.forEach((item) => {
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
            list.push({
              coin: item.symbol, // 币种
              time: item.createdAt, // 时间
              amount: this.thousands(amount), // 充值数量
              count: item.confirmDesc, // 确认次数
              address, // 充值地址
              addressLong: item.addressTo,
              updateAt: item.walletTime ? formatTime(item.walletTime) : '- -', // 处理时间
              txid: txid || '- -', // 交易ID
              txidLong: item.txid,
              status: item.status_text, // 状态
            });
          });
          this.tableLoading = false;
          this.tableList = list;
          // this.paginationObj.total = data.data.count > 30 ? 30 : data.data.count;
        }
      });
    },
    // 查看全部充值记录
    lookAll() {
      this.$router.push({ path: 'subWalletHistory', query: { type: '1' } });
    },
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
  },
  computed: {
    // 表格title
    columns() {
      return [
        { key: 'coin', title: this.$t('subAccount.assets.recharge.table_c1'), width: '13%' }, // 币种
        { key: 'time', title: this.$t('subAccount.assets.recharge.table_c2'), width: '12%' }, // 时间
        { key: 'amount', title: this.$t('subAccount.assets.recharge.table_c3'), width: '13%' }, // 数量
        { key: 'count', title: this.$t('subAccount.assets.recharge.table_c4'), width: '10%' }, // 确认次数
        { key: 'address', title: this.$t('subAccount.assets.recharge.table_c5'), width: '17%' }, // 充值地址
        { key: 'updateAt', title: this.$t('subAccount.assets.recharge.table_c6'), width: '10%' }, // 钱包处理时间
        { key: 'txid', title: this.$t('subAccount.assets.recharge.table_c7'), width: '17%' }, // 区块链交易ID
        { key: 'status', title: this.$t('subAccount.assets.recharge.table_c8'), width: '8%' }, // 状态
      ];
    },
    that() {
      return this;
    },
    isHavePage() {
      let flag = false;
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
      if (this.coinList && this.coinList[this.symbol]) {
        str = getCoinShowName(this.symbol, this.coinList);
      }
      return str;
    },
    // market 接口
    market() {
      return this.$store.state.baseData.market;
    },
    // 币种列表
    coinList() {
      return (this.market && this.market.coinList) || null;
    },
    navTab() {
      return [
        { name: this.$t('subAccount.assets.recharge.table_title'), index: 1 },
      ];
    },
    // finance/account_balance 接口返回成功的数据
    // exchangeData() { return this.$store.state.assets.exchangeData; },
  },
};
