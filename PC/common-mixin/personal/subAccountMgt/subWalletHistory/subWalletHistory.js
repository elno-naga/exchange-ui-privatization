import {
  colorMap, getCoinShowName, fixD, formatTime, getIconPath,
} from '@/utils';

export default {
  name: 'subOrderMgt',
  data() {
    return {
      colorMap,
      getIconPath,
      nowType: 1, // 1充值记录，2划转记录
      paginationObj: {
        total: 0, // 数据总条数
        display: 10, // 每页显示条数
        currentPage: 1, // 当前页码
      },
      tableList: [],
      tableLoading: false,
      selectAccountList: [], // 账户列表
      currencyList: [], // 币种列表
      selAccount: 0, // 当前查询的子账户
      selCurrency: 0, // 当前查询选择的币种
      selAccountType: '1', // 当前选择的账户类型
      leverList: [], // 币对列表
      selLever: 0, // 查找的币对
      copyValue: '',
    };
  },
  watch: {
    selLever(v) {
      if (v) {
        this.selSymbolName = '';
      }
    },
    exchangeData(v) {
      if (v && this.market) {
        this.setSymbol();
      }
    },
    market(v) {
      if (v && this.exchangeData) {
        this.setSymbol();
      }
    },
  },
  mounted() {
    if (this.$route.query.type) {
      this.nowType = Number(this.$route.query.type || '1');
      this.getTableList();
    }
  },
  methods: {
    async init() {
      // 如果没有 finance/account_balance 接口返回成功的数据
      if (!this.exchangeData) {
        this.$store.dispatch('assetsExchangeData');
      }
      this.selectAccountList = await this.getSelAccountList();
      this.leverList = [{ code: 0, value: this.$t('subAccount.common.allSymol'), symbol: '' }]; //  全部币对
      this.currencyList = [{ code: 0, value: this.$t('subAccount.common.allCoin') }]; // 全部币种
      // 获取全部币种
      if (this.exchangeData && this.market) {
        this.setSymbol();
      }
      this.getTableList();
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
            tempList.unshift({ value: this.$t('subAccount.common.sel_allSub'), code: 0 });
            resolve(tempList);
          } else {
            resolve([{ value: this.$t('subAccount.common.sel_allSub'), code: 0 }]);
          }
        });
      });
    },

    // getSubAllLever(uid) {
    //   return new Promise((resolve) => {
    //     this.axios({
    //       url: this.$store.state.url.subAccount.sub_lever_accountBalance,
    //       params: { subUid: uid },
    //     }).then((data) => {
    //       if (data.code.toString() === '0') {
    //         resolve(data.data);
    //       } else {
    //         resolve({});
    //       }
    //     });
    //   });
    // },
    // 获取子账户币币资产
    // getSubAllCoin(uid) {
    //   return new Promise((resolve) => {
    //     this.axios({
    //       url: this.$store.state.url.subAccount.recharge_accountBalance,
    //       params: { subUid: uid },
    //     }).then((data) => {
    //       if (data.code.toString() === '0') {
    //         resolve(data.data);
    //       } else {
    //         resolve({});
    //       }
    //     });
    //   });
    // },

    // 获取子账户杠杆资产--单币种
    // 获取母账户杠杆资产
    getAllLever() {
      return new Promise((resolve) => {
        this.axios({
          url: 'lever/finance/balance',
        }).then((data) => {
          if (data.code.toString() === '0') {
            resolve(data.data);
          }
        });
      });
    },
    // 获取母账户杠杆资产-全仓
    getAllCross() {
      return new Promise((resolve) => {
        this.axios({
          url: 'lever/finance/v2/balance',
        }).then((data) => {
          if (data.code.toString() === '0') {
            resolve(data.data);
          }
        });
      });
    },
    // 获取合约下拉
    getContractList() {
      return new Promise((resolve) => {
        this.axios({
          url: this.$store.state.url.subAccount.allContractCoin,
        }).then((data) => {
          if (data.code.toString() === '0') {
            resolve(data.data);
          } else {
            resolve({});
          }
        });
      });
    },
    getCoinByLever(code) {
      return new Promise((resolve) => {
        this.axios({
          url: 'lever/finance/symbol/balance',
          params: {
            symbol: code,
          },
        }).then((data) => {
          if (data.code.toString() === '0') {
            resolve(data.data);
          } else {
            this.$bus.$emit('tip', { text: data.msg, type: 'error' });
            resolve({});
          }
        });
      });
    },
    getTableList() {
      // 划转记录
      this.tableLoading = true;
      if (this.nowType === 2) {
        let req;
        let url;
        if (this.selAccountType === '1') { // 币币账户
          req = {
            subUid: this.selAccount || null,
            coinSymbol: this.selCurrency || null,
            page: this.paginationObj.currentPage,
            pageSize: this.paginationObj.display,
          };
          url = this.$store.state.url.subAccount.transfer_coinRecord;
        } else if (this.selAccountType === '2') { // 杠杆账户
          req = {
            type: '0',
            subUid: this.selAccount || null,
            symbol: this.selLever || null,
            coinSymbol: this.selCurrency || null,
            page: this.paginationObj.currentPage,
            pageSize: this.paginationObj.display,
          };
          const tempArr = this.leverList.filter((it) => it.code === this.selLever);
          if (tempArr.length) req.symbol = tempArr[0].symbol;
          url = this.$store.state.url.subAccount.transfer_LeverRecord;
        } else if (this.selAccountType === '4') { // 杠杆账户
          req = {
            type: '1',
            subUid: this.selAccount || null,
            symbol: null,
            coinSymbol: this.selCurrency || null,
            page: this.paginationObj.currentPage,
            pageSize: this.paginationObj.display,
          };
          const tempArr = this.leverList.filter((it) => it.code === this.selLever);
          if (tempArr.length) req.symbol = tempArr[0].symbol;
          url = this.$store.state.url.subAccount.transfer_LeverRecord;
        } else { // 合约账户
          req = {
            subUid: this.selAccount || null,
            coinSymbol: this.selCurrency || null,
            page: this.paginationObj.currentPage,
            pageSize: this.paginationObj.display,
          };
          url = this.$store.state.url.subAccount.transfer_contractRecord;
        }
        this.axios({
          url,
          method: 'post',
          params: req,
        }).then((data) => {
          if (data.code.toString() === '0') {
            this.tableList = data.data.list.map((it) => {
              const tempObj = { ...it };
              tempObj.ctime = tempObj.ctime ? formatTime(tempObj.ctime) : '- -';
              return tempObj;
            });
            this.paginationObj.total = data.data.count;
            this.tableLoading = false;
          } else {
            this.$bus.$emit('tip', { text: data.msg, type: 'error' });
            this.tableLoading = false;
            this.tableList = [];
          }
        });
      } else { // 充值记录
        this.axios({
          url: this.$store.state.url.subAccount.recharge_record,
          params: {
            pageSize: this.paginationObj.display, // 每页条数
            page: this.paginationObj.currentPage, // 页码
            coinSymbol: this.selCurrency || null,
            subUid: this.selAccount || null,
          },
        }).then((data) => {
          if (data.code.toString() === '0') {
            const list = [];
            if (!this.coinList) return;
            const { coinList } = this;
            data.data.list.forEach((item) => {
              let { txid } = item;
              if (txid && txid.length > 11) {
                txid = `${txid.slice(0, 6)}...${txid.slice(-4)}`;
              }
              let address = item.addressTo;
              if (address && address.length > 11) {
                address = `${address.slice(0, 6)}...${address.slice(-4)}`;
              }
              const showPrecision = (coinList[item.symbol] && coinList[item.symbol].showPrecision)
                || 0;
              const amount = fixD(item.amount, showPrecision);
              list.push({
                email: item.email || '',
                coin: item.symbol, // 币种
                time: item.createdAt, // 时间
                amount: this.thousands(amount), // 充值数量
                count: item.confirmDesc, // 确认次数
                address, // 充值地址
                addressLong: item.addressTo,
                updateAt: item.walletTime ? formatTime(item.walletTime) : '- -', // 处理时间
                txid: txid || '- -', // 交易ID
                txidLong: item.txid,
                status: item.statusText, // 状态
              });
            });
            this.tableLoading = false;
            this.tableList = list;
            this.paginationObj.total = data.data.count;
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
    pageChange(vel) {
      this.paginationObj.currentPage = vel;
      this.getTableList();
    },
    // 划转记录（币币-杠杆-合约）
    typeChange(item) {
      this.selAccountType = item.code;
      this.paginationObj.currentPage = 1; // 页码
      this.paginationObj.total = 0; // 总条数
      this.selAccount = 0;
      this.selCurrency = 0;
      this.selLever = 0;
      if (this.selAccountType === '2') {
        this.setLever();
      } else {
        this.setSymbol();
      }
      this.getTableList();
    },
    // 子账户下拉切换
    accountChange(item) {
      this.selAccount = item.code;
      this.paginationObj.currentPage = 1; // 页码
      this.paginationObj.total = 0; // 总条数
      // 清空币对，币种
      // this.leverList = [{ code: 0, value: this.$t('subAccount.common.allSymol'), symbol: '' }];
      // this.selLever = 0;
      // this.currencyList = [{ code: 0, value: this.$t('subAccount.common.allCoin') }];
      // this.selCurrency = 0;
      this.getTableList();
    },
    // 币对改变
    leverChange(item) {
      this.selLever = item.code;
      this.selSymbolName = item.symbol;
      this.paginationObj.currentPage = 1; // 页码
      this.paginationObj.total = 0; // 总条数
      // 清空币种
      this.currencyList = [{ code: 0, value: this.$t('subAccount.common.allCoin') }];
      this.selCurrency = 0;
      if (this.selLever) {
        this.setCoinBySymbol();
      } else {
        // this.setAllCoin();
      }

      this.getTableList();
    },
    // 币种改变
    coinChange(item) {
      this.selCurrency = item.code;
      this.paginationObj.currentPage = 1; // 页码
      this.paginationObj.total = 0; // 总条数
      this.getTableList();
    },
    // 设置币对
    setSymbol() {
      // 如果是充值记录 || 划转记录币币，直接查询所有币种列表
      if (this.nowType === 1 || (this.nowType === 2 && this.selAccountType === '1')) {
        this.setAllCoin();
      } else if (this.nowType === 2 && this.selAccountType === '2') { // 杠杆账户设置币对
        this.setLever();
      } else if (this.nowType === 2 && this.selAccountType === '4') { // 全仓杠杆账户设置币对
        this.cross();
      } else if (this.nowType === 2 && this.selAccountType === '3') { // 合约账户设置币种
        this.setContactCoin();
      }
    },
    // 设置合约币种
    async setContactCoin() {
      const tempContract = await this.getContractList(); // 取出合约币种列表
      const { accountList } = tempContract;
      const list = [{ code: 0, value: this.$t('subAccount.common.allCoin') }];
      Object.keys(accountList).forEach((key) => {
        const obj = {
          code: accountList[key].symbol,
          value: accountList[key].symbol,
          info: accountList[key],
        };
        list.push(obj);
      });
      this.currencyList = list;
      this.getTableList();
    },
    // 获取所有币种
    setAllCoin() {
      if (!this.exchangeData || !this.market) return;
      const list = [{ code: 0, value: this.$t('subAccount.common.allCoin') }];
      const { coinList } = this.market;
      Object.keys(this.exchangeData.allCoinMap).forEach((item) => {
        if (this.exchangeData.allCoinMap[item].isFiat) {
          return;
        }
        const showCoin = getCoinShowName(item, coinList);

        list.push({
          img: coinList[item].icon,
          code: item,
          value: showCoin,
        });
      });
      this.currencyList = list;
    },
    // 获取杠杆币对
    async setLever() {
      if (!this.market) return;
      const tempSubLever = await this.getAllLever(); // 取出币对列表
      const { leverMap } = tempSubLever;
      const { coinList } = this.market;
      this.leverList = [{ code: 0, value: this.$t('subAccount.common.allSymol'), symbol: '' }];
      Object.keys(leverMap).forEach((item) => {
        this.leverList.push({
          symbol: leverMap[item].symbol,
          code: leverMap[item].name,
          info: leverMap[item],
          value: `${getCoinShowName(leverMap[item].baseCoin, coinList)}/${getCoinShowName(leverMap[item].quoteCoin, coinList)}`,
        });
      });
      this.selLever = 0;
      this.currencyList = [{ code: 0, value: this.$t('subAccount.common.allCoin') }]; // 全部币种
      // this.setCoinBySymbol();
    },
    // 根据币对设置币种
    async setCoinBySymbol() {
      this.currencyList = [{ code: 0, value: this.$t('subAccount.common.allCoin') }];
      this.selCurrency = 0;
      if (!this.market || !this.selSymbolName) return;
      const tempSubLever = await this.getCoinByLever(this.selSymbolName);
      const { baseCoin, quoteCoin } = tempSubLever;
      const { coinList } = this.market;
      this.currencyList = [
        { code: 0, value: this.$t('subAccount.common.allCoin') },
        {
          img: coinList[baseCoin].icon || '',
          code: baseCoin,
          value: getCoinShowName(baseCoin, coinList),
        },
        {
          img: coinList[quoteCoin].icon,
          code: quoteCoin,
          value: getCoinShowName(quoteCoin, coinList),
        },
      ];
      this.selCurrency = 0;
    },
    // 切换账户
    tabChange(item) {
      if (this.nowType === item.index) {
        return;
      }
      this.nowType = item.index;
      this.paginationObj.currentPage = 1; // 页码
      this.paginationObj.total = 0; // 总条数
      this.tableList = [];
      // 清空下拉选择
      this.selAccount = 0; // 账户
      this.selCurrency = 0;
      this.selAccountType = '1'; // 类型
      this.selLever = 0;
      this.getTableList();
      // 获取全部币种
      if (this.exchangeData && this.market) {
        this.setSymbol();
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
  },
  computed: {
    columns() {
      if (this.nowType === 2) {
        // // 合约
        if (this.selAccountType === '3') {
          return [
            { key: 'email', title: this.$t('subAccount.walletHistory.contactTable_c1'), width: '21%' }, // 子账户
            { key: 'coinSymbol', title: this.$t('subAccount.walletHistory.contactTable_c2'), width: '20%' }, // 币种
            { key: 'ctime', title: this.$t('subAccount.walletHistory.contactTable_c4'), width: '20%' }, // 时间
            { key: 'amount', title: this.$t('subAccount.walletHistory.contactTable_c5'), width: '20%' }, // 数量
            { key: 'transferType', title: this.$t('subAccount.walletHistory.contactTable_c6'), width: '19%' }, // 方向
          ];
        }
        // 杠杆-逐仓
        if (this.selAccountType === '2') {
          return [
            { key: 'subEmail', title: this.$t('subAccount.walletHistory.leverTable_c1'), width: '21%' }, // 子账户
            { key: 'coinSymbol', title: this.$t('subAccount.walletHistory.leverTable_c2'), width: '16%' }, // 币种
            { key: 'showName', title: this.$t('subAccount.walletHistory.leverTable_c3'), width: '16%' }, // 杠杆账户
            { key: 'amount', title: this.$t('subAccount.walletHistory.leverTable_c5'), width: '16%' }, // 数量
            { key: 'ctime', title: this.$t('subAccount.walletHistory.leverTable_c4'), width: '16%' }, // 时间
            { key: 'transferType', title: this.$t('subAccount.walletHistory.leverTable_c6'), width: '16%' }, // 方向
          ];
        }
        // 币币
        return [
          { key: 'subEmail', title: this.$t('subAccount.walletHistory.coinTable_c1'), width: '20%' }, // 转出账户
          { key: 'coin', title: this.$t('subAccount.walletHistory.coinTable_c2'), width: '20%' }, // 币种
          { key: 'amount', title: this.$t('subAccount.walletHistory.coinTable_c3'), width: '20%' }, // 数量
          { key: 'opType', title: this.$t('subAccount.walletHistory.coinTable_c4'), width: '20%' }, // 转入账户类型
          { key: 'ctime', title: this.$t('subAccount.walletHistory.coinTable_c5'), width: '20%' }, // 时间
        ];
      }
      return [
        { key: 'email', title: this.$t('subAccount.assets.home.table_c1'), width: '12%' }, // 子账户邮箱
        { key: 'showCoin', title: this.$t('subAccount.other.text22'), width: '12%' }, // 币种
        { key: 'time', title: this.$t('subAccount.other.text23'), width: '10%' }, // 时间
        { key: 'amount', title: this.$t('subAccount.other.text24'), width: '12%' }, // 数量
        { key: 'count', title: this.$t('subAccount.assets.recharge.table_c4'), width: '9%' }, // 确认次数
        { key: 'address', title: this.$t('subAccount.assets.recharge.table_c5'), width: '14%' }, // 充值地址
        { key: 'updateAt', title: this.$t('subAccount.assets.recharge.table_c6'), width: '10%' }, // 钱包处理时间
        { key: 'txid', title: this.$t('subAccount.assets.recharge.table_c7'), width: '14%' }, // 区块链交易ID
        { key: 'status', title: this.$t('subAccount.assets.recharge.table_c8'), width: '6%' }, // 状态
      ];
    },
    market() {
      return this.$store.state.baseData.market;
    },
    // finance/account_balance 接口返回成功的数据
    exchangeData() {
      return this.$store.state.assets.exchangeData;
    },
    publicInfo() {
      return this.$store.state.baseData.publicInfo;
    },
    // 杠杆开关
    leverOpen() {
      return this.publicInfo && this.publicInfo.switch && this.publicInfo.switch.lever_open === '1';
    },
    selectAccountTypeList() {
      const list = [
        {
          value: this.$t('subAccount.common.coinType1'),
          code: '1',
        },
      ];
      if (this.leverOpen) {
        list.push({
          value: this.$t('subAccount.common.coinType4'),
          code: '2',
        }); // 杠杆账户 --逐仓
      }
      list.push({
        value: this.$t('subAccount.common.coinType3'),
        code: '3',
      }); // 合约账户
      return list;
    },
    navTab() {
      return [
        // 充值记录
        { name: this.$t('subAccount.walletHistory.tab1'), index: 1 },
        // 划转记录
        { name: this.$t('subAccount.walletHistory.tab2'), index: 2 },
      ];
    },
    // 币种列表
    coinList() {
      return (this.market && this.market.coinList) || null;
    },
  },
};
