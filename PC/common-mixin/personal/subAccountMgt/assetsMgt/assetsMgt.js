import {
  colorMap, getCoinShowName, getCookie, fixD, fixRate, myStorage,
  getIconPath,
} from '@/utils';

export default {
  name: 'assetsMgt',
  data() {
    return {
      colorMap,
      getIconPath,
      nowType: 1,
      paginationObj: {
        total: 0, // 数据总条数
        display: 10, // 每页显示条数
        currentPage: 1, // 当前页码
      },
      tableList: [],
      tableLoading: true,
      selectAccountList: [],
      selAccount: 0, // 当前查询的子账户
      selStatus: 2, // 当前查询的子账户状态
      totalBalanceSymbol: '', // 总资产折合单位
      totalBalance: '--', // 总资产折合
      totalRate: '--', // 折合法币
      isHide: myStorage.get('subAssets_hide') || false, // 隐藏资产
      subExchangeData: {},
      subTotalBalanceSymbol: '', // 总资产折合单位
      subTotalBalance: '--', // 子账户总资产折合
      subTotalRate: '--', // 子账户总资产折合法币
      rechargeLimit: true, // 充值限制
    };
  },
  watch: {
    exchangeData(v) {
      if (v && this.market && this.nowType === 1) {
        this.setCoinData();
      }
    },
    market(v) {
      if (v && this.exchangeData && this.nowType === 1) {
        this.setCoinData();
      }
    },
  },
  filters: {
    // 千分符
    thousands(num) {
      if (num) {
        const str = num.toString();
        const reg = str.indexOf('.') > -1 ? /(\d)(?=(\d{3})+\.)/g : /(\d)(?=(?:\d{3})+$)/g;
        return str.replace(reg, '$1,');
      }
      return num;
    },
    getCoinShowName(v, coinList) {
      return getCoinShowName(v, coinList);
    },
  },
  methods: {
    async init() {
      if (!this.exchangeData) {
        this.$store.dispatch('assetsExchangeData');
      }
      this.selectAccountList = await this.getSelAccountList();
      if (this.exchangeData && this.market && this.nowType === 1) this.setCoinData();
      // this.getRechargeStatus();
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
    // 获取所有子账户资产总览 sub_allSubTotal
    getSubAssetsData() {
      return new Promise((resolve) => {
        this.axios({
          url: this.$store.state.url.subAccount.sub_allSubTotal,
          method: 'post',
          params: { subUid: this.selAccount || null, freezeStatus: this.selStatus === 2 ? null : this.selStatus, type: this.nowType },
        }).then((data) => {
          if (data.code.toString() === '0') {
            resolve(data.data || {});
          } else {
            this.$bus.$emit('tip', { text: data.msg, type: 'error' });
            resolve({});
          }
        });
      });
    },
    selectChange(item, name) {
      this[name] = item.code;
      if (this.nowType === 1) this.setCoinData();
      if (this.nowType === 2) this.setLeverData();
      if (this.nowType === 3) this.setContractData();
      if (this.nowType === 4) this.setCrossData();
    },
    // 切换账户
    currentType(item) {
      if (this.nowType === item.index) {
        return;
      }
      this.nowType = item.index;
      this.tableList = [];
      this.tableLoading = true;
      // 清空搜索选项
      this.selAccount = 0;
      this.selStatus = 2;
      if (this.nowType === 1 && this.exchangeData && this.market) {
        this.setCoinData();
      } else if (this.nowType === 2 && this.exchangeData && this.market) {
        this.setLeverData();
      } else if (this.nowType === 4 && this.exchangeData && this.market) {
        this.setCrossData();
      } else {
        this.setContractData();
      }
    },
    tableClick(type, row) {
      if (type === 'detail') {
        this.$router.push({ path: 'subAssetsDetail', query: { id: row.subUid, type: this.nowType } });
      } else if (type === 'transfer') {
        if (row.freezeStatus === 0) {
          this.$bus.$emit('tip', { text: this.$t('subAccount.assets.home.transfer_tip'), type: 'error' }); // 该子账号冻结状态
          return;
        }
        this.$router.push({ path: 'subAssetsTransfer', query: { toId: row.subUid, fromType: this.nowType } });
      }
    },
    jumpPage(type) {
      if (type === 'transfer') { // 划转
        this.$router.push({ path: 'subAssetsTransfer', query: { fromId: 99999, fromType: this.nowType } });
      } else if (type === 'topUp') { // 充值
        this.$router.push({ path: 'subAssetsRecharge' });
      }
    },
    // 充值KYC状态
    getRechargeStatus() {
      this.axios({
        url: 'getNewUserGuide',
        params: {
          pageType: '3',
        },
      }).then(({ code, data }) => {
        if (code.toString() === '0') {
          if (data.depositType === '0') {
            this.rechargeLimit = false;
          }
        }
      });
    },
    // 币币账户母账户余额
    async setCoinData() {
      this.subExchangeData = await this.getSubAssetsData();
      // 设置母账户币币
      const {
        totalBalance,
        totalBalanceSymbol,
      } = this.exchangeData;

      const { coinList, rate } = this.market;
      const fix = (coinList[totalBalanceSymbol]
          && coinList[totalBalanceSymbol].showPrecision)
        || 8;
      this.totalBalance = fixD(totalBalance, fix); // 折合资产
      this.totalBalanceSymbol = totalBalanceSymbol; // 折合币种
      this.totalRate = fixRate(totalBalance, rate, totalBalanceSymbol, this.userCurrency); // 折合法币
      // 设置子账户币币
      const { allSubUserTotalBalance, convertCoinSymbol, singleSubUserTotalPropertyVOList } = this.subExchangeData;
      const subFix = (coinList[convertCoinSymbol] && coinList[convertCoinSymbol].showPrecision) || 8;
      this.subTotalBalance = fixD(allSubUserTotalBalance, subFix); // 折合资产
      this.subTotalBalanceSymbol = convertCoinSymbol; // 折合币种
      this.subTotalRate = fixRate(allSubUserTotalBalance, rate, convertCoinSymbol, this.userCurrency); // 折合法币
      // 表格数据
      if (singleSubUserTotalPropertyVOList && singleSubUserTotalPropertyVOList.length) {
        this.tableList = singleSubUserTotalPropertyVOList.map((it) => {
          const tempObj = it;
          tempObj.showAssets = fixD(it.totalBalance, subFix);
          tempObj.operation = [
            {
              text: this.$t('subAccount.assets.home.btn_transfer'), // 转入
              type: 'transfer',
            },
            {
              text: this.$t('subAccount.assets.home.btn_detail'), // 详情
              type: 'detail',
            },
          ];
          return tempObj;
        });
        this.tableLoading = false;
      } else {
        this.tableList = [];
        this.tableLoading = false;
      }
    },
    // 母子账户杠杆资产-逐仓
    async setLeverData() {
      const momLeverData = await this.getMomLeverData();
      const subLeverData = await this.getSubAssetsData();
      this.totalBalance = '--';
      this.totalRate = '--';
      this.subTotalBalance = '--';
      this.subTotalRate = '--';
      const { totalBalance, totalBalanceSymbol } = momLeverData;
      // 设置母账户资产
      const { rate } = this.market;
      this.totalBalance = fixD(totalBalance, 8); // 折合资产
      this.totalBalanceSymbol = totalBalanceSymbol; // 折合币种
      this.totalRate = fixRate(totalBalance, rate, totalBalanceSymbol, this.userCurrency); // 折合法币
      // 设置子账户币币
      const { allSubUserTotalBalance, convertCoinSymbol, singleSubUserTotalPropertyVOList } = subLeverData;
      this.subTotalBalance = fixD(allSubUserTotalBalance, 8); // 折合资产
      this.subTotalBalanceSymbol = convertCoinSymbol; // 折合币种
      this.subTotalRate = fixRate(allSubUserTotalBalance, rate, convertCoinSymbol, this.userCurrency); // 折合法币
      // 表格数据
      if (singleSubUserTotalPropertyVOList && singleSubUserTotalPropertyVOList.length) {
        this.tableList = singleSubUserTotalPropertyVOList.map((it) => {
          const tempObj = it;
          tempObj.showAssets = fixD(it.totalBalance, 8);
          tempObj.operation = [
            {
              text: this.$t('subAccount.assets.home.btn_transfer'), // 转入
              type: 'transfer',
            },
            {
              text: this.$t('subAccount.assets.home.btn_detail'), // 详情
              type: 'detail',
            },
          ];
          return tempObj;
        });
        this.tableLoading = false;
      } else {
        this.tableList = [];
        this.tableLoading = false;
      }
    },
    // 母子账户杠杆资产-全仓
    async setCrossData() {
      const momLeverData = await this.getMomCrossData();
      const subLeverData = await this.getSubAssetsData();
      this.totalBalance = '--';
      this.totalRate = '--';
      this.subTotalBalance = '--';
      this.subTotalRate = '--';
      const { totalBalance, totalBalanceSymbol } = momLeverData;
      // 设置母账户资产
      const { rate } = this.market;
      this.totalBalance = fixD(totalBalance, 8); // 折合资产
      this.totalBalanceSymbol = totalBalanceSymbol; // 折合币种
      this.totalRate = fixRate(totalBalance, rate, totalBalanceSymbol, this.userCurrency); // 折合法币
      // 设置子账户币币
      const { allSubUserTotalBalance, convertCoinSymbol, singleSubUserTotalPropertyVOList } = subLeverData;
      this.subTotalBalance = fixD(allSubUserTotalBalance, 8); // 折合资产
      this.subTotalBalanceSymbol = convertCoinSymbol; // 折合币种
      this.subTotalRate = fixRate(allSubUserTotalBalance, rate, convertCoinSymbol, this.userCurrency); // 折合法币
      // 表格数据
      if (singleSubUserTotalPropertyVOList && singleSubUserTotalPropertyVOList.length) {
        this.tableList = singleSubUserTotalPropertyVOList.map((it) => {
          const tempObj = it;
          tempObj.showAssets = fixD(it.totalBalance, 8);
          tempObj.operation = [
            {
              text: this.$t('subAccount.assets.home.btn_transfer'), // 转入
              type: 'transfer',
            },
            {
              text: this.$t('subAccount.assets.home.btn_detail'), // 详情
              type: 'detail',
            },
          ];
          return tempObj;
        });
        this.tableLoading = false;
      } else {
        this.tableList = [];
        this.tableLoading = false;
      }
    },
    // 母子合约资产
    async setContractData() {
      const momContractData = await this.getMomAllData();
      const subContractData = await this.getSubAssetsData();
      this.totalBalance = '--';
      this.totalRate = '--';
      this.subTotalBalance = '--';
      this.subTotalRate = '--';
      // 设置母账户资产
      const { rate, coinList } = this.market;
      const fix = coinList.BTC.showPrecision;
      this.totalBalance = this.thousands(fixD(momContractData, fix)); // 折合资产
      this.totalBalanceSymbol = 'BTC'; // 折合币种
      this.totalRate = this.thousands(fixRate(momContractData, rate, 'BTC', this.userCurrency));// 折合法币
      // 设置子账户资产
      const { allSubUserTotalBalance, convertCoinSymbol, singleSubUserTotalPropertyVOList } = subContractData;
      this.subTotalBalance = fixD(allSubUserTotalBalance, 8); // 折合资产
      this.subTotalBalanceSymbol = convertCoinSymbol; // 折合币种
      this.subTotalRate = fixRate(allSubUserTotalBalance, rate, convertCoinSymbol, this.userCurrency); // 折合法币
      // 表格数据
      if (singleSubUserTotalPropertyVOList && singleSubUserTotalPropertyVOList.length) {
        this.tableList = singleSubUserTotalPropertyVOList.map((it) => {
          const tempObj = it;
          tempObj.showAssets = fixD(it.totalBalance, 8);
          tempObj.operation = [
            {
              text: this.$t('subAccount.assets.home.btn_transfer'), // 转入
              type: 'transfer',
            },
            {
              text: this.$t('subAccount.assets.home.btn_detail'), // 详情
              type: 'detail',
            },
          ];
          return tempObj;
        });
        this.tableLoading = false;
      } else {
        this.tableList = [];
        this.tableLoading = false;
      }
    },
    // 获取母账户所有资产（取合约）
    getMomAllData() {
      return new Promise((resolve) => {
        this.axios({
          url: 'finance/total_account_balance',
        }).then(({ code, data }) => {
          if (code.toString() === '0') {
            const { futuresBalance } = data;
            resolve(futuresBalance);
          } else {
            resolve('');
          }
        });
      });
    },
    // 获取母账户杠杆币对数据
    getMomLeverData() {
      return new Promise((resolve) => {
        this.axios({
          url: 'lever/finance/balance',
          method: 'post',
        }).then((data) => {
          if (data.code.toString() === '0') {
            resolve(data.data || {});
          } else {
            this.$bus.$emit('tip', { text: data.msg, type: 'error' });
            resolve({});
          }
        });
      });
    },
    // 获取母账户杠杆币对数据
    getMomCrossData() {
      return new Promise((resolve) => {
        this.axios({
          url: 'lever/finance/v2/balance',
          method: 'post',
        }).then((data) => {
          if (data.code.toString() === '0') {
            resolve(data.data || {});
          } else {
            this.$bus.$emit('tip', { text: data.msg, type: 'error' });
            resolve({});
          }
        });
      });
    },
    // 隐藏显示资产
    hideAssets() {
      this.isHide = !this.isHide;
      myStorage.set('assets_hide', this.isHide);
    },
    // 千分符
    thousands(num) {
      if (num) {
        const str = num.toString();
        const reg = str.indexOf('.') > -1
          ? /(\d)(?=(\d{3})+\.)/g
          : /(\d)(?=(?:\d{3})+$)/g;
        return str.replace(reg, '$1,');
      }
      return num;
    },
  },
  computed: {
    columns() {
      return [
        { key: 'subEmail', title: this.$t('subAccount.assets.home.table_c1'), width: '25%' }, // 子账户邮箱
        { key: 'freezeStatus', title: this.$t('subAccount.assets.home.table_c2'), width: '25%' }, // 状态
        {
          key: 'showAssets', title: this.$t('subAccount.assets.home.table_c3'), width: '25%', sortable: true,
        }, // 总资产
        { key: 'operation', title: this.$t('subAccount.assets.home.table_c4'), width: '25%' }, // 操作
      ];
    },
    // 母账户资产详情finance/account_balance 接口返回成功的数据
    exchangeData() {
      return this.$store.state.assets.exchangeData;
    },
    showTotalBalanceSymbol() {
      let str = this.totalBalanceSymbol;
      if (
        this.market
        && this.market.coinList
        && this.market.coinList[this.totalBalanceSymbol]
      ) {
        str = getCoinShowName(this.totalBalanceSymbol, this.market.coinList);
      }
      return str;
    },
    showSubTotalBalanceSymbol() {
      let str = this.subTotalBalanceSymbol;
      if (
        this.market
        && this.market.coinList
        && this.market.coinList[this.subTotalBalanceSymbol]
      ) {
        str = getCoinShowName(this.subTotalBalanceSymbol, this.market.coinList);
      }
      return str;
    },
    userCurrency() {
      return getCookie('lan') || 'en_US';
    },
    currencyUnit() {
      let str = '';
      if (this.market) {
        const { rate } = this.market;
        str = rate[this.userCurrency].lang_coin;
      }
      return str;
    },
    // market 接口
    market() {
      return this.$store.state.baseData.market;
    },
    statusList() {
      return [
        { value: this.$t('subAccount.common.sel_allStatus'), code: 2 },
        { value: this.$t('subAccount.common.selStatus_normal'), code: 1 },
        { value: this.$t('subAccount.common.selStatus_freeze'), code: 0 },
      ];
    },
    publicInfo() {
      return this.$store.state.baseData.publicInfo;
    },
    // 逐仓杠杆开关
    leverOpen() {
      return this.publicInfo && this.publicInfo.switch && this.publicInfo.switch.lever_open === '1';
    },
    navTab() {
      const list = [
        // 币币账户
        { name: this.$t('subAccount.common.coinType1'), index: 1 },
      ];
      if (this.leverOpen) {
        list.push({ name: this.$t('subAccount.common.coinType4'), index: 2 }); // 杠杆账户 --逐仓
      }
      list.push({ name: this.$t('subAccount.common.coinType3'), index: 3 }); // 合约账户
      return list;
    },
  },
};
