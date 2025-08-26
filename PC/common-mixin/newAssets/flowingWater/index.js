import {
  fixD, getCoinShowName, colorMap, imgMap,
  formatTime, getCookie, getIconPath,
} from '@/utils';

export default {
  name: 'page-flowingWater',
  data() {
    return {
      tabelLoading: true,
      imgMap,
      getIconPath,
      colorMap,
      nowType: 1, // 1为充值 2为提现 3为其他 4 创新试验区
      symbol: '', // 当前币种
      tabelList: [], // table数据列表
      financeListData: [],
      symbolList: [], // 币种选择列表
      otherType: '', // 其他记录 type
      otherTypeList: [], // 其他记录 type选择列表
      otherTypeFirst: true,
      paginationObj: {
        total: 0, // 数据总条数
        display: 10, // 每页显示条数
        currentPage: 1, // 当前页码
      },
      revokeList: [], // 撤销队列
      currentIncomeType: '0',
      obj: {},
      lan: getCookie('lan'),
      copyValue: '',
      otherTypeInner: '0', // 其他记录 type
      topUpTypeInner: '0', // 其他记录 type
      popoverShow: false, // popover
      popoverContent: '', // popover
      popoverParent: '',
    };
  },
  computed: {
    incomeType() {
      return [{
        code: '0', value: this.$t('freeStaking.incomeFilter[0]'),
      }, {
        code: '1', value: this.$t('freeStaking.incomeFilter[2]'),
      }, {
        code: '2', value: this.$t('freeStaking.incomeFilter[1]'),
      }];
    },
    topUpTypeList() {
      return [{
        code: '0', value: this.$t('assets.otcFlowingWater.all'),
      }, {
        code: '1', value: this.$t('assets.flowingWater.type1'),
      }, {
        code: '2', value: this.$t('assets.flowingWater.type2'),
      }];
    },
    otherTypeListInner() {
      return [{
        code: '0', value: this.$t('assets.otcFlowingWater.all'),
      }, {
        code: '1', value: this.$t('assets.flowingWater.WithdrawalsRecord'),
      }, {
        code: '2', value: this.$t('assets.withdraw.innerList'),
      }];
    },
    freeStakingStatus() {
      return {
        1: this.$t('manageFinances.completed'),
      };
    },
    financialTypeStatus() {
      return {
        0: this.$t('freeStaking.incomeFilter[0]'),
        1: this.$t('freeStaking.incomeFilter[2]'),
        2: this.$t('freeStaking.incomeFilter[1]'),
      };
    },
    // 是否开启了freeStaking
    incrementConfigStatus() {
      return this.$store.state.baseData.incrementConfigStatus || 0;
    },
    publicInfo() {
      return this.$store.state.baseData.publicInfo;
    },
    navTab() {
      const arr = [
        { name: this.$t('assets.flowingWater.RechargeRecord'), index: 1 }, // 充值记录
        { name: this.$t('assets.flowingWater.WithdrawalsRecord'), index: 2 }, // 提现记录
        { name: this.$t('assets.flowingWater.OtherRecords'), index: 3 }, // 其他记录
      ];
      if (this.newcoinOpen === '1') {
        arr.push({ name: this.$t('innov.innov_tit'), index: 4 }); // 创新试验区
      }
      if (this.incrementConfigStatus) {
        arr.push({ name: this.$t('manageFinances.record'), index: 5 }); // 理财记录
      }

      return arr;
    },
    // finance/account_balance 接口返回成功的数据
    exchangeData() {
      return this.$store.state.assets.exchangeData;
    },
    // market 接口
    market() {
      return this.$store.state.baseData.market;
    },
    coinList() {
      return this.market && this.market.coinList;
    },
    // 表格title
    columns() {
      let list = [];
      if (this.nowType === 1) {
        list = [
          { key: 'coin', title: this.$t('assets.recharge.RechargeCoin'), width: '13%' }, // 币种
          { key: 'time', title: this.$t('assets.recharge.RechargeTime'), width: '12%' }, // 充值时间
          { key: 'amount', title: this.$t('assets.recharge.RechargeVolume'), width: '13%' }, // 充值数量
          { key: 'count', title: this.$t('assets.recharge.RechargeNumber'), width: '10%' }, // 确认次数
          { key: 'address', title: this.$t('assets.recharge.rechargeAddress'), width: '17%' }, // 充值地址
          { key: 'updateAt', title: this.$t('assets.flowingWater.updataAt'), width: '10%' }, // 钱包处理时间
          { key: 'txid', title: this.$t('assets.flowingWater.txid'), width: '13%' }, // 区块链交易ID
          { key: 'status', title: this.$t('assets.recharge.RechargeStatus'), width: '12%' }, // 状态
        ];
      }
      if (this.nowType === 2) {
        list = [
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
      }
      if (this.nowType === 3 || this.nowType === 5) {
        list = [
          { key: 'coin', title: this.$t('assets.flowingWater.otherCoin'), width: '23%' }, // 币种
          { key: 'time', title: this.$t('assets.flowingWater.otherTime'), width: '23%' }, // 时间
          { key: 'type', title: this.$t('assets.flowingWater.otherType'), width: '23%' }, // 类型
          { key: 'amount', title: this.$t('assets.flowingWater.otherVolume'), width: '23%' }, // 数量
          { key: 'statusText', title: this.$t('assets.flowingWater.otherStatus'), width: '8%' }, // 状态
        ];
      }
      return list;
    },
    // 用于axios的symbol
    axiosSymbol() {
      if (this.symbol === 'all') {
        return null;
      }
      return this.symbol;
    },
    newcoinOpen() {
      return this.$store.state.baseData.newcoinOpen;
    },
    isInnerTransferOpen() {
      return this.$store.state.baseData.is_inner_transfer_open || 0;
    },
  },
  watch: {
    exchangeData(v) {
      if (v && this.market) {
        this.setData();
      }
    },
    market(v) {
      if (v && this.exchangeData) {
        this.setData();
      }
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
  methods: {
    init() {
      // 如果没有 finance/account_balance 接口返回成功的数据
      if (!this.exchangeData) {
        this.$store.dispatch('assetsExchangeData');
      }
      if (this.exchangeData && this.market) {
        this.setData();
      }
      if (this.$route.query.nowType) {
        const nowType = Number(this.$route.query.nowType);
        this.currentType({ index: nowType });
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
        this.$router.push('exchangeAccount'); // 返回到上一个页面
      }
    },
    getFreeStaking() {
      this.axios({
        url: this.$store.state.url.freeStaking.financial_management,
        headers: {},
        params: {
          pageSize: this.paginationObj.display, // 每页条数
          page: this.paginationObj.currentPage, // 页码
          gainCoin: this.axiosSymbol || '',
          financialType: Number(this.currentIncomeType),
        },
        method: 'post',
      }).then((data) => {
        if (data.code.toString() === '0') {
          const { financeList, count } = data.data;
          const list = financeList.map((item, index) => {
            const { coinList } = this.market;
            const currentCoin = coinList[item.gainCoin];
            const fix = currentCoin ? currentCoin.showPrecision : 0;

            const showCoin = getCoinShowName(item.gainCoin, coinList);
            return {
              id: index,
              coin: item.gainCoin,
              showCoin, // 币种
              time: formatTime(item.createdAtTime), // 时间
              type: this.financialTypeStatus[item.financialType], // 类型
              amount: this.thousands(fixD(item.amount, fix)), // 数量
              statusText: this.freeStakingStatus[item.status], // 状态
            };
          });
          this.tabelList = list;
          this.paginationObj.total = count;
        }
        this.tabelLoading = false;
      });
    },
    getOtherTypeList() {
      this.axios({
        url: 'record/other_transfer_scene',
      }).then((data) => {
        if (data.code.toString() === '0') {
          const { cenceList } = data.data;
          const list = [];
          cenceList.forEach((item) => {
            list.push({ code: item.key, value: item.key_text });
          });
          this.otherTypeList = list;
          if (list.length) {
            this.otherType = list[0].code;
          }
          this.getData();
        }
      });
    },
    symbolChange(item) {
      this.symbol = item.code;
      this.paginationObj.currentPage = 1; // 页码
      this.paginationObj.total = 0; // 总条数
      this.tabelList = [];
      this.tabelLoading = true;
      this.getData();
    },
    otherTypeChange(item) {
      this.otherType = item.code;
      this.paginationObj.currentPage = 1; // 页码
      this.paginationObj.total = 0; // 总条数
      this.tabelList = [];
      this.tabelLoading = true;
      this.getData();
    },
    otherTypeChangeInner(item) {
      this.otherTypeInner = item.code;
      this.paginationObj.currentPage = 1; // 页码
      this.paginationObj.total = 0; // 总条数
      this.tabelList = [];
      this.tabelLoading = true;
      this.getData();
    },
    topUpTypeChange(item) {
      this.topUpTypeInner = item.code;
      this.paginationObj.currentPage = 1; // 页码
      this.paginationObj.total = 0; // 总条数
      this.tabelList = [];
      this.tabelLoading = true;
      this.getData();
    },
    setIncomeType(item) {
      this.currentIncomeType = item.code;
      this.paginationObj.currentPage = 1; // 页码
      this.paginationObj.total = 0; // 总条数
      this.tabelList = [];
      this.tabelLoading = true;
      this.getData();
    },
    // tab切换
    currentType(item) {
      this.nowType = item.index;
      // this.symbol = 'all'
      this.paginationObj.currentPage = 1; // 页码
      this.paginationObj.total = 0; // 总条数
      this.tabelList = [];
      if (item.index !== 4) {
        this.tabelLoading = true;
      }
      if (item.index === 3) {
        if (this.otherTypeFirst) {
          // 获取其他记录中选择类型的列表
          this.getOtherTypeList();
          this.otherTypeFirst = false;
        } else {
          this.getData();
        }
      }
      if (item.index !== 3) {
        this.getData();
      }
    },
    setData() {
      const list = [
        { code: 'all', value: this.$t('assets.flowingWater.allCoin') },
      ];
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
      this.symbolList = list;
      this.symbol = 'all';
      this.getData();
    },
    getData() {
      if (this.nowType === 1) {
        this.rechargeData();
      } else if (this.nowType === 2) {
        this.withdrawData();
      } else if (this.nowType === 5) {
        this.getFreeStaking();
      } else if (this.nowType === 3) {
        this.otherData();
      }
    },
    pagechange(v) {
      this.paginationObj.currentPage = v;
      this.getData();
    },
    // 撤销操作
    tableClick(type, id) {
      if (type === 'revoke') {
        if (this.revokeList.indexOf(id) === -1) {
          this.revokeList.push(id);
          this.axios({
            url: '/finance/cancel_withdraw',
            headers: {},
            params: {
              withdrawId: id,
            },
            method: 'post',
          }).then((data) => {
            const ind = this.revokeList.indexOf(id);
            this.revokeList.splice(ind, 1);
            if (data.code.toString() === '0') {
              this.getData();
              this.$bus.$emit('tip', { text: data.msg, type: 'success' });
            } else {
              this.$bus.$emit('tip', { text: data.msg, type: 'error' });
            }
          });
        }
      }
    },
    goTxidAddr(item) {
      if (item.txidJump) {
        window.open(item.txidJump);
      }
    },
    // 复制表格数据
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
    // 千分符
    thousands(num) {
      if (num && parseFloat(num)) {
        const str = num.toString();
        const reg = str.indexOf('.') > -1 ? /(\d)(?=(\d{3})+\.)/g : /(\d)(?=(?:\d{3})+$)/g;
        return str.replace(reg, '$1,');
      }
      return num;
    },
    // 充值数据
    rechargeData() {
      this.axios({
        url: 'record/new_deposit_list',
        params: {
          pageSize: this.paginationObj.display, // 每页条数
          page: this.paginationObj.currentPage, // 页码
          coinSymbol: this.axiosSymbol,
          type: this.topUpTypeInner === '0' ? null : Number(this.topUpTypeInner), // 类型
        },
      }).then((data) => {
        if (this.nowType !== 1) return;
        if (data.code.toString() === '0') {
          const list = [];
          this.financeListData = data.data.financeList.map((item, index) => ({
            ...item,
            id: index,
          }));
          const { coinList } = this;
          data.data.financeList.forEach((item, index) => {
            let { txid } = item;
            if (txid && txid.length > 15) {
              txid = `${txid.slice(0, 5)}...${txid.slice(-4)}`;
            }
            let address = item.addressTo;
            if (address && address.length > 15) {
              address = `${address.slice(0, 5)}...${address.slice(-4)}`;
            }
            let txidJump = null;
            if (
              this.publicInfo.switch.open_txid_addr_jump
              && this.publicInfo.switch.open_txid_addr_jump === '1'
              && item.txidAddr
            ) {
              txidJump = item.txidAddr;
            }
            const showPrecision = (coinList[item.symbol] && coinList[item.symbol].showPrecision)
              || 0;
            const amount = fixD(item.amount, showPrecision);
            list.push({
              index,
              coin: item.symbol, // 币种
              time: item.createdAtTime ? formatTime(item.createdAtTime) : '--', // 时间
              amount: this.thousands(amount), // 充值数量
              count: item.confirmDesc, // 确认次数
              address, // 充值地址
              addressLong: item.addressTo,
              updateAt: item.walletTime ? formatTime(item.walletTime) : '- -', // 处理时间
              txid: txid || '- -', // 交易ID
              txidLong: item.txid,
              txidJump, // 充值地址跳转
              status: item.status_text, // 状态
            });
          });
          this.tabelLoading = false;
          this.tabelList = list;
          this.paginationObj.total = data.data.count;
        }
      });
    },
    // 提现数据
    withdrawData() {
      this.axios({
        url: 'record/new_withdraw_list',
        params: {
          pageSize: this.paginationObj.display, // 每页条数
          page: this.paginationObj.currentPage, // 页码
          coinSymbol: this.axiosSymbol,
          type: this.otherTypeInner === '0' ? null : Number(this.otherTypeInner), // 类型
        },
      }).then((data) => {
        if (this.nowType !== 2) return;
        if (data.code.toString() === '0') {
          const list = [];
          this.financeListData = data.data.financeList;
          const { coinList } = this;
          data.data.financeList.forEach((item, index) => {
            let { txid } = item;
            if (txid && txid.length > 15) {
              txid = `${txid.slice(0, 5)}...${txid.slice(-4)}`;
            }
            let txidJump = null;
            if (
              this.publicInfo.switch.open_txid_addr_jump
              && this.publicInfo.switch.open_txid_addr_jump === '1'
              && item.txidAddr
            ) {
              txidJump = item.txidAddr;
            }
            let address = item.addressTo;
            if (address && address.length > 15) {
              address = `${address.slice(0, 5)}...${address.slice(-4)}`;
            }
            const showPrecision = (coinList[item.symbol] && coinList[item.symbol].showPrecision)
              || 0;
            const amount = fixD(item.amount, showPrecision);
            const fee = fixD(item.fee, showPrecision);
            const operation = [];
            if (item.status === 0 && item.type === '1') {
              operation.push(
                {
                  type: 'revoke',
                  text: this.$t('assets.flowingWater.Cancel'),
                },
              );
            } else {
              operation.push(
                {
                  type: '',
                  disabled: true,
                  text: '--',
                },
              );
            }
            list.push({
              index,
              id: item.id,
              coin: item.symbol, // 币种
              time: item.createdAtTime ? formatTime(item.createdAtTime) : '--', // 时间
              amount: this.thousands(amount), // 充值数量
              fee: this.thousands(fee), // 手续费
              address, // 充值地址
              addressLong: item.addressTo,
              remark: item.label,
              updateAt: item.walletTime ? formatTime(item.walletTime) : '- -', // 处理时间
              txid: txid || '- -', // 交易ID
              txidLong: item.txid,
              txidJump,
              status: item.status,
              statusText: item.status_text, // 状态
              operation,

            });
          });
          this.tabelLoading = false;
          this.tabelList = list;
          this.paginationObj.total = data.data.count;
        }
      });
    },
    // 其他数据
    otherData() {
      this.axios({
        url: 'record/other_transfer_list',
        params: {
          pageSize: this.paginationObj.display, // 每页条数
          page: this.paginationObj.currentPage, // 页码
          coinSymbol: this.axiosSymbol,
          transactionScene: this.otherType,
        },
      }).then((data) => {
        if (this.nowType !== 3) return;
        if (data.code.toString() === '0') {
          const { financeList, count } = data.data;
          const list = [];
          financeList.forEach((item, index) => {
            const { coinList } = this.market;
            const fix = (coinList[item.coinSymbol]
                && coinList[item.coinSymbol].showPrecision)
              || 0;
            const showCoin = getCoinShowName(item.coinSymbol, coinList);
            list.push({
              id: index,
              coin: item.coinSymbol,
              showCoin, // 币种
              time: item.createdAtTime ? formatTime(item.createdAtTime) : '--', // 时间
              type: item.transactionScene, // 类型
              amount: this.thousands(fixD(item.amount, fix)), // 数量
              statusText: item.status_text, // 状态
            });
          });

          this.tabelLoading = false;
          this.tabelList = list;
          this.paginationObj.total = count;
        }
      });
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
