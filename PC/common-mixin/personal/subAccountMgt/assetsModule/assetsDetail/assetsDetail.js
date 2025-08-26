import {
  colorMap,
  myStorage,
  getCoinShowName,
  fixD,
  fixRate,
  getCookie,
  imgMap,
  getIconPath,
} from '@/utils';

export default {
  name: 'assetsDetailMgt',
  data() {
    return {
      getIconPath,
      colorMap,
      imgMap,
      nowType: 1,
      queryId: '', // 查询的子账户ID
      paginationObj: {
        total: 0, // 数据总条数
        display: 10, // 每页显示条数
        currentPage: 1, // 当前页码
      },
      tableLength: 20,
      dataList: [],
      tableLoading: false,
      selectAccountList: [],
      isHide: myStorage.get('subAssetsDetail_hide') || false, // 隐藏资产
      totalBalanceSymbol: '', // 总资产折合单位
      totalBalance: '--', // 总资产折合
      totalRate: '--', // 折合法币
      exchangeData: {},
      switchFlag: myStorage.get('subAssetsSwitch') || false, // 隐藏小额资产
      findValue: '', // 搜索的币种
      searchListResult: [],
      search: false, // 是否搜索
      havePosition: false, // 平台锁仓
      positionV2: false, // 代币锁仓
      positionV3: false, // 理财锁仓
      leverMap: {}, // 杠杆账户数据
      accountFreezeFlag: true, // 当前选择的子账户是否是禁用状态 true 1 正常
      crossRiskRate: 999,
      remindRiskRate: 1.3,
      burstRiskRate: 1.1,
      rechargeLimit: true, // 充值限制
    };
  },
  watch: {
    market(v) {
      if (v && this.nowType === 1) {
        this.getDataByCoins();
      } else if (v && this.nowType === 2) {
        this.getDataByLever();
      } else if (v && this.nowType === 3) {
        this.getDataByContract();
      } else if (v && this.nowType === 4) {
        this.getDataByCross();
      }
    },
    nowType(v) {
      if (v) this.switchFlag = false;
      if (v) this.findValue = '';
      if (v === 1 && this.market) {
        this.getDataByCoins();
      } else if (v === 2 && this.market) {
        this.getDataByLever();
      } else if (v === 3 && this.market) {
        this.getDataByContract();
      } else if (v && this.nowType === 4) {
        this.getDataByCross();
      }
    },
    queryId(v) {
      if (v) {
        const tempArr = this.selectAccountList.filter((it) => it.code === this.queryId);
        this.accountFreezeFlag = tempArr.length ? tempArr[0].freezeStatus : false;
        if (this.nowType === 1) {
          this.getDataByCoins();
        } else if (this.nowType === 2) {
          this.getDataByLever();
        } else if (this.nowType === 3) {
          this.getDataByContract();
        } else if (this.nowType === 4) {
          this.getDataByCross();
        }
      }
    },
  },
  filters: {
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
    getCoinShowName(v, coinList) {
      return getCoinShowName(v, coinList);
    },
  },
  mounted() {
    if (this.$route.query.type) {
      this.nowType = this.$route.query.type ? Number(this.$route.query.type) : 1;
      // this.getTableList();
    }
  },
  methods: {
    async init() {
      this.selectAccountList = await this.getSelAccountList();
      this.queryId = Number(this.$route.query.id);
      // this.nowType = this.$route.query.type ? Number(this.$route.query.type) : 1;
      // this.currentType({ index: this.nowType });
      this.search = false;
      this.switchFlag = false;
      const tempArr = this.selectAccountList.filter((it) => it.code === this.queryId);
      this.accountFreezeFlag = tempArr.length ? tempArr[0].freezeStatus : false;
      if (!this.queryId) {
        return;
      }
      if (this.nowType === 1 && this.market) this.getDataByCoins();
      // this.getRechargeStatus();
      // if (this.nowType === 3) this.getDataByContract();
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
              freezeStatus: it.freezeStatus,
            }));
            resolve(tempList);
          } else {
            resolve([]);
          }
        });
      });
    },
    // 获取子账户 -- 币币资产
    getDataByCoins() {
      this.tableLoading = true;
      this.axios({
        url: this.$store.state.url.subAccount.recharge_accountBalance,
        params: { subUid: this.queryId },
      }).then((data) => {
        if (data.code.toString() === '0') {
          this.exchangeData = { ...data.data };
          this.tableLoading = false;
          this.setData(this.exchangeData);
        } else {
          this.exchangeData = {};
        }
      });
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
    pageChange(v) {
      this.paginationObj.currentPage = v;
    },
    selectChange(item, name) {
      this[name] = item.code;
    },
    // 切换账户
    currentType(item) {
      if (this.nowType === item.index) {
        return;
      }
      this.nowType = item.index;
      this.search = false;
      this.paginationObj.currentPage = 1; // 页码
      this.paginationObj.total = 0; // 总条数
      this.dataList = [];
      this.tableLoading = true;
    },
    tableClick(type, coinType) {
      if (!this.accountFreezeFlag) {
        this.$bus.$emit('tip', { text: this.$t('subAccount.assets.home.transfer_tip'), type: 'error' }); // 该子账号冻结状态
        return;
      }
      if (type === 'transfer') {
        this.$router.push({ path: 'subAssetsTransfer', query: { fromId: this.queryId, fromType: this.nowType, coin: coinType } });
      }
    },
    jumpPage(type) {
      if (type === 'transfer') { // 划转
        if (!this.accountFreezeFlag) {
          this.$bus.$emit('tip', { text: this.$t('subAccount.assets.home.transfer_tip'), type: 'error' }); // 该子账号冻结状态
          return;
        }
        this.$router.push({ path: 'subAssetsTransfer', query: { fromId: this.queryId, fromType: this.nowType } });
      } else if (type === 'topUp') { // 充值
        this.$router.push({ path: 'subAssetsRecharge', query: { id: this.queryId } });
      }
    },
    // 币币账户子账户余额
    setData(allData) {
      if (this.nowType === 1) {
        const {
          totalBalance, totalBalanceSymbol, platformCoin, allCoinMap,
        } = allData;

        this.positionV3 = Object.keys(allCoinMap).some(
          (key) => Number(allCoinMap[key].lock_increment_amount) > 0,
        );
        const { coinList, rate } = this.market;
        const fix = (coinList[totalBalanceSymbol]
            && coinList[totalBalanceSymbol].showPrecision)
          || 8;
        this.totalBalance = fixD(totalBalance, fix); // 折合资产
        this.totalBalanceSymbol = totalBalanceSymbol; // 折合币种
        this.totalRate = fixRate(
          totalBalance,
          rate,
          totalBalanceSymbol,
          this.userCurrency,
        ); // 折合法币
        if (platformCoin && platformCoin.length) {
          const obj = allCoinMap[platformCoin];
          if (obj && Number(obj.lock_position_balance)) {
            this.havePosition = true;
          }
        }
        if (
          this.baseData.switch.lock_position_v2_status
          && this.baseData.switch.lock_position_v2_status.toString() === '1'
        ) {
          this.positionV2 = true;
        }
        this.setDataList(allCoinMap, totalBalance);
        // if (this.leverOpen) {
        //   this.getLeverData();
        // }
        // if (this.otcOpen) {
        //   this.getOtcCoin();
        // }
      }
      if (this.nowType === 2) {
        const { totalBalance, totalBalanceSymbol, leverMap } = allData;
        this.tableLoading = false;
        const { coinList, rate, market } = this.market;
        this.totalBalance = fixD(totalBalance, 8); // 折合资产
        this.totalBalanceSymbol = totalBalanceSymbol; // 折合币种
        this.totalRate = fixRate(totalBalance, rate, totalBalanceSymbol, this.userCurrency); // 折合法币
        const list = [];
        Object.keys(leverMap).forEach((v) => {
          const item = leverMap[v];
          let quoteFix = coinList[item.quoteCoin].showPrecision || 0;
          if (this.symbolAll) {
            quoteFix = this.symbolAll[item.name].price;
          }
          const obj = market[item.quoteCoin][item.name];
          const showSymbol = obj.showName || obj.name;
          // getCoinShowName
          const showBaseCoin = getCoinShowName(item.baseCoin, coinList);
          const showQuoteCoin = getCoinShowName(item.quoteCoin, coinList);
          list.push({
            id: item.symbol,
            name: item.name,
            symbol: showSymbol,
            showBaseCoin,
            showQuoteCoin,
            risk: item.riskRate ? fixD(item.riskRate, 2) : '--', // 风险率
            riskText: this.setRiskText(item),
            riskColor: this.setRiskClass(item),
            baseTotalBalance: this.thousands(fixD(item.baseTotalBalance, 8)), // 总资产
            quoteTotalBalance: this.thousands(fixD(item.quoteTotalBalance, 8)), // 总资产
            baseNormalBalance: this.thousands(fixD(item.baseNormalBalance, 8)), // 可用
            quoteNormalBalance: this.thousands(fixD(item.quoteNormalBalance, 8)), // 可用
            baseLockBalance: this.thousands(fixD(item.baseLockBalance, 8)), // 冻结
            quoteLockBalance: this.thousands(fixD(item.quoteLockBalance, 8)), // 冻结
            baseBorrowBalance: this.thousands(fixD(item.baseBorrowBalance, 8)), // 已借
            quoteBorrowBalance: this.thousands(fixD(item.quoteBorrowBalance, 8)), // 已借
            burstPrice: `${this.thousands(fixD(item.burstPrice, quoteFix))} ${showQuoteCoin}`, // 爆仓价
            operation: [
              {
                text: this.$t('subAccount.assets.home.btn_transfer'),
                type: 'transfer',
                symbol: v,
              },
            ],
          });
        });
        this.dataList = list;
        this.tableLength = list.length;
      }
      if (this.nowType === 3) {
        const { totalBalance, totalBalanceSymbol, accountList } = allData;
        this.tableLoading = false;
        this.totalBalance = fixD(totalBalance, 8); // 折合资产
        this.totalBalanceSymbol = totalBalanceSymbol; // 折合币种
        const { rate, coinList } = this.market;

        this.totalRate = fixRate(totalBalance, rate, totalBalanceSymbol, this.userCurrency); // 折合法币
        const list = [];
        accountList.forEach((item) => {
          const fix = (coinList[item.symbol] && coinList[item.symbol].showPrecision) || 0;
          list.push({
            id: item.symbol,
            coin: item.symbol,
            icon: coinList[item.symbol] ? coinList[item.symbol].icon : 'https://cbl13isq6gv9.s3.ap-northeast-1.amazonaws.com/1317/upload/20220414171408884.png',
            showName: getCoinShowName(item.symbol) || item.symbol,
            coinLongName: coinList[item.symbol] ? coinList[item.symbol].longName : item.symbol,
            canUseAmount: fixD(item.canUseAmount, fix),
            totalAmount: fixD(item.totalAmount, fix),
            totalMargin: fixD(item.totalMargin, fix),
            isolateMargin: fixD(item.isolateMargin, fix),
            lockAmount: fixD(item.lockAmount, fix),
            operation: [
              {
                text: this.$t('subAccount.assets.home.btn_transfer'),
                type: 'transfer',
                symbol: item.symbol,
              },
            ],
          });
        });
        this.dataList = list;
        this.tableLength = list.length;
      }
      if (this.nowType === 4) {
        const {
          totalBalance, totalBalanceSymbol, leverMap, riskRate, remindRiskRate, burstRiskRate,
        } = allData;
        this.tableLoading = false;
        this.crossRiskRate = riskRate || 0;
        this.remindRiskRate = remindRiskRate || 1.3;
        this.burstRiskRate = burstRiskRate || 1.1;
        const { coinList, rate } = this.market;
        this.totalBalance = fixD(totalBalance, 8); // 折合资产
        this.totalBalanceSymbol = totalBalanceSymbol; // 折合币种
        this.totalRate = fixRate(totalBalance, rate, totalBalanceSymbol, this.userCurrency); // 折合法币
        const list = [];
        Object.keys(leverMap).forEach((v) => {
          const item = leverMap[v];
          const showSymbol = getCoinShowName(v, coinList);
          list.push({
            id: v,
            name: v,
            coin: showSymbol,
            balance: totalBalance,
            totalBalance: this.thousands(fixD(item.totalBalance, 8)), // 总资产
            normalBalance: this.thousands(fixD(item.normalBalance, 8)), // 可用
            lockBalance: this.thousands(fixD(item.lockBalance, 8)), // 冻结
            borrowBalance: this.thousands(fixD(item.borrowBalance, 8)), // 已借
            operation: [
              {
                text: this.$t('subAccount.assets.home.btn_transfer'),
                type: 'transfer',
                symbol: v,
              },
            ],
          });
        });
        this.dataList = list;
        this.tableLength = list.length;
      }
    },
    // 风险率
    setRiskText(item) {
      const { remindRiskRate, riskRate } = item;
      if (!Number(riskRate)) {
        return '--';
      }
      if (riskRate > remindRiskRate && riskRate <= 1.5) {
        return this.$t('assets.leverageAccount.risk2');
      }
      if (riskRate && riskRate <= remindRiskRate) {
        return this.$t('assets.leverageAccount.risk3');
      }
      return this.$t('assets.leverageAccount.risk1');
    },
    setRiskClass(item) {
      const { remindRiskRate, riskRate } = item;
      if (!Number(riskRate)) {
        return 'text-2-cl';
      }
      if (riskRate > remindRiskRate && riskRate <= 1.5) {
        return 'warning-1-cl';
      }
      if (riskRate && riskRate <= remindRiskRate) {
        return 'fall-1-cl';
      }
      return 'rise-1-cl';
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
    // 隐藏显示资产
    hideAssets() {
      this.isHide = !this.isHide;
      myStorage.set('assets_hide', this.isHide);
    },
    // 隐藏小额资产
    switchChange() {
      this.switchFlag = !this.switchFlag;
      myStorage.set('subAssetsSwitch', this.switchFlag);
      if (this.nowType === 1) this.findChanges(this.findValue);
    },
    // 搜索的币种改变时
    findChanges(v) {
      this.findValue = v;
      if (this.nowType === 1) {
        this.paginationObj.currentPage = 1;
        if (v !== '' || this.switchFlag) {
          const result = this.dataList.filter((item) => {
            const isSearch = item.coinShowName.toUpperCase().indexOf(v.toUpperCase()) !== -1;
            return isSearch;
          });
          this.searchListResult = result;
          this.search = true;
        } else {
          this.search = false;
        }
      }
    },
    setDataList(data) {
      const list = [];
      Object.keys(data).forEach((item) => {
        if (data[item].isFiat && data[item].fiatIncome !== 1) {
          return;
        }
        // 该币种精度
        const { coinList, market, rate } = this.market;
        const fix = (coinList[item] && coinList[item].showPrecision) || 0;
        // 资产折合精度
        const totle = this.totalBalanceSymbol;
        const btcFix = (coinList[totle] && coinList[totle].showPrecision) || 0;
        // 逻辑 1 如果 优先找出交易币种为当前货币的
        //     2 如果 1条件未筛选出，则去看当前货币是否为计价货币 把以该货币为计价货币的币对都加进去
        let selectOption = [];
        const by = [];
        Object.keys(market).forEach((v) => {
          Object.keys(market[v]).forEach((cv) => {
            const showSymbol = market[v][cv].showName || market[v][cv].name;
            if (cv.split('/')[0] === item) {
              selectOption.push({
                value: showSymbol,
                code: market[v][cv].name,
              });
            }
            if (v === item) {
              by.push({ value: showSymbol, code: market[v][cv].name });
            }
          });
        });
        if (selectOption.length === 0) {
          selectOption = by;
        }
        let arr = [];
        // 平台币锁仓数量
        const lockPositionBalance = data[item].lock_position_balance || '0';
        // 代币锁仓数量
        const lockPositionV2Amount = data[item].lock_position_v2_amount || '0';
        // 理财锁仓数量
        const lockIncrementAmount = data[item].lock_increment_amount || '0';
        // 判断当前锁仓类型大于一个的时候
        if (this.havePosition || this.positionV2 || this.positionV3) {
          const num = Number(lockPositionBalance)
            + Number(lockPositionV2Amount)
            + Number(lockIncrementAmount);

          const selectList = [];
          if (Number(lockPositionBalance)) {
            selectList.push(
              `${this.$t('assets.exchangeAccount.positionBalance')}：
                    ${this.thousands(fixD(lockPositionBalance, fix))}`,
            );
          }
          if (Number(lockPositionV2Amount)) {
            selectList.push(
              `${this.$t('assets.exchangeAccount.positionV2Amount')}：
                  ${this.thousands(fixD(lockPositionV2Amount, fix))}`,
            );
          }
          if (Number(lockIncrementAmount)) {
            selectList.push(
              `${this.$t(
                'assets.exchangeAccount.incomeLock',
              )}：${this.thousands(fixD(lockIncrementAmount, fix))}`,
            );
          }
          arr = num ? selectList : [this.thousands(fixD(num, fix))];
        }
        let showUnlockSell = false;
        if (
          coinList[item]
          && coinList[item].isOvercharge
          && coinList[item].isOvercharge.toString() === '1'
        ) {
          showUnlockSell = true;
        }
        const btcValuation = fixD(data[item].allBtcValuatin, btcFix);
        // 功能按钮列表
        const funBtnList = [
          {
            text: this.$t('subAccount.assets.home.btn_transfer'),
            type: 'transfer',
            symbol: item,
          },
        ];
        const coinShowName = getCoinShowName(item, coinList);
        list.push({
          id: item,
          coin: item,
          coinShowName,
          total: fixD(data[item].total_balance, fix),
          normal: fixD(data[item].normal_balance, fix),
          showUnlockSell,
          overcharge: `${this.thousands(
            fixD(data[item].overcharge_balance || 0, fix),
          )} ${this.$t('subAccount.assets.detail.table_tip2')}`,
          freeze: this.thousands(fixD(data[item].lock_balance, fix)),
          lock: arr,
          fold: this.thousands(
            fixRate(data[item].allBtcValuatin, rate, 'BTC', this.userCurrency),
          ),
          operation: funBtnList,
          btcValuation,
        });
      });
      this.tableLoading = false;
      this.tableLength = list.length;
      this.dataList = list.sort((a, b) => a.id - b.id);
    },
    // 杠杆账户
    getDataByLever() {
      this.tableLoading = true;
      this.axios({
        url: 'sub_user/property/lever/finance/balance',
        params: { subUid: this.queryId },
      }).then((data) => {
        if (data.code.toString() === '0') {
          this.tableLoading = false;
          const { leverMap } = data.data;
          this.leverMap = leverMap;
          this.setData(data.data);
        }
      });
    },
    // 杠杆账户
    getDataByCross() {
      this.tableLoading = true;
      this.axios({
        url: 'sub_user/property/lever/finance/balance',
        params: { subUid: this.queryId, type: '1' },
      }).then((data) => {
        if (data.code.toString() === '0') {
          this.tableLoading = false;
          const { leverMap } = data.data;
          this.leverMap = leverMap;
          this.setData(data.data);
        }
      });
    },
    // 合约
    getDataByContract() {
      this.tableLoading = true;
      if (!this.queryId) return;
      this.axios({
        url: this.$store.state.url.subAccount.sub_contract_accountBalance,
        params: { subUid: this.queryId },
      }).then((data) => {
        if (data.code.toString() === '0') {
          this.tableLoading = false;
          this.setData(data.data);
        } else {
          this.tableLoading = false;
          this.dataList = [];
          this.tableLength = 0;
          this.totalBalance = fixD(0, 8); // 折合资产
          const { rate } = this.market;

          this.totalRate = fixRate(0, rate, 'BTC', this.userCurrency); // 折合法币
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
  },
  computed: {
    columns() {
      let colArr = [];
      if (this.nowType === 1) {
        let arr = [];
        if (this.havePosition || this.positionV2 || this.positionV3) {
          arr = [
            { key: 'lock', title: this.$t('assets.exchangeAccount.position') },
          ];
        }
        colArr = [
          { key: 'coin', title: this.$t('subAccount.assets.detail.table_c1') }, // 币种
          { key: 'total', title: this.$t('subAccount.assets.detail.table_c2'), sortable: true }, // 总额
          { key: 'normal', title: this.$t('subAccount.assets.detail.table_c3'), sortable: true }, // 可用
          { key: 'freeze', title: this.$t('subAccount.assets.detail.table_c4') }, // 冻结
          ...arr,
          {
            key: 'fold',
            title: `${this.$t('subAccount.assets.detail.table_c5')}(${
              this.rate[this.userCurrency]
              && this.rate[this.userCurrency].lang_coin
            })`,
            width: '150px',
          }, // 资产折合
          { key: 'operation', title: this.$t('subAccount.assets.detail.table_c6'), width: '80px' }, // 操作
        ];
      }
      if (this.nowType === 2) {
        colArr = [
          { key: 'symbol', title: this.$t('subAccount.assets.detail.leverTable_c1'), width: '11%' }, // 杠杆账户
          { key: 'coin', title: this.$t('subAccount.assets.detail.leverTable_c2'), width: '9%' }, // 币种
          {
            key: 'total', title: this.$t('subAccount.assets.detail.leverTable_c3'), width: '11%', sortable: true,
          }, // 总资产
          {
            key: 'normal', title: this.$t('subAccount.assets.detail.leverTable_c4'), width: '11%', sortable: true,
          }, // 可用
          { key: 'freeze', title: this.$t('subAccount.assets.detail.leverTable_c5'), width: '11%' }, // 冻结
          { key: 'borrow', title: this.$t('subAccount.assets.detail.leverTable_c6'), width: '11%' }, // 已借
          { key: 'burstPrice', title: this.$t('subAccount.assets.detail.leverTable_c7'), width: '11%' }, // 爆仓价
          { key: 'risk', title: this.$t('subAccount.assets.detail.leverTable_c8'), width: '7%' }, // 风险率
          { key: 'operation', title: this.$t('subAccount.assets.detail.leverTable_c9'), width: '18%' }, // 操作
        ];
      }
      if (this.nowType === 3) {
        colArr = [
          { key: 'symbol', title: this.$t('subAccount.assets.detail.leverTable_c2'), width: '16%' }, // 币种
          {
            key: 'canUseAmount', title: this.$t('subAccount.assets.detail.leverTable_c4'), width: '14%', sortable: true,
          }, // 可用
          {
            key: 'totalAmount', title: this.$t('subAccount.assets.detail.leverTable_c3'), width: '14%', sortable: true,
          }, // 总资产
          { key: 'totalMargin', title: this.$t('subAccount.other.text6'), width: '14%' }, // 全仓保证金
          { key: 'isolateMargin', title: this.$t('subAccount.other.text7'), width: '14%' }, // 逐仓保证金
          { key: 'lockAmount', title: this.$t('subAccount.other.text8'), width: '14%' }, // 冻结保证金
          { key: 'operation', title: this.$t('subAccount.assets.detail.leverTable_c9'), width: '14%' }, // 操作
        ];
      }
      if (this.nowType === 4) {
        colArr = [
          { key: 'coin', title: this.$t('subAccount.assets.detail.leverTable_c2'), width: '10%' }, // 币种
          {
            key: 'total', title: this.$t('subAccount.assets.detail.leverTable_c3'), width: '20%', sortable: true,
          }, // 总资产
          {
            key: 'normal', title: this.$t('subAccount.assets.detail.leverTable_c4'), width: '20%', sortable: true,
          }, // 可用
          { key: 'freeze', title: this.$t('subAccount.assets.detail.leverTable_c5'), width: '20%' }, // 冻结
          { key: 'borrow', title: this.$t('subAccount.assets.detail.leverTable_c6'), width: '20%' }, // 已借
          { key: 'operation', title: this.$t('subAccount.assets.detail.leverTable_c9'), width: '10%' }, // 操作
        ];
      }
      return colArr;
    },
    // 资金列表展示到页面数据
    dataListFilter() {
      let tableDataList = [];
      if (this.dataList.length) {
        // 币币过滤数据
        if (this.nowType === 1) {
          let resultList = [];
          // 是否隐藏0资产
          const tempAllData = this.search ? this.searchListResult : this.dataList;
          if (this.switchFlag) {
            resultList = tempAllData.filter((item) => item.btcValuation >= 0.0001);
          } else {
            resultList = tempAllData;
          }
          // 过滤筛选数据
          let newList = [];
          newList = resultList.filter((item) => {
            const isSearch = item.coinShowName.toUpperCase().indexOf(this.findValue.toUpperCase()) !== -1;
            return isSearch;
          });
          const num = this.paginationObj.currentPage * this.paginationObj.display;
          const datas = JSON.parse(JSON.stringify(newList));
          tableDataList = datas.slice((this.paginationObj.currentPage - 1) * this.paginationObj.display, num);
          this.paginationObj.total = this.search ? tableDataList.length : tempAllData.length;
        }
        // 杠杆隐藏零资产功能过滤数据
        if (this.nowType === 2) {
          let list = [];
          if (this.switchFlag) {
            this.dataList.forEach((item) => {
              const { baseTotalBalance, quoteTotalBalance } = item;
              if (parseFloat(baseTotalBalance) || parseFloat(quoteTotalBalance)) {
                list.push(item);
              }
            });
          } else {
            list = this.dataList;
          }
          // 搜索框功能过滤数据
          const newList = [];
          list.forEach((item) => {
            if (item.symbol.indexOf(this.findValue.toUpperCase()) !== -1) {
              newList.push(item);
            }
          });
          tableDataList = newList;
        }
        // 杠杆隐藏零资产功能过滤数据
        if (this.nowType === 3) {
          let list = [];
          if (this.switchFlag) {
            this.dataList.forEach((item) => {
              const { totalAmount } = item;
              if (parseFloat(totalAmount)) {
                list.push(item);
              }
            });
          } else {
            list = this.dataList;
          }
          // 搜索框功能过滤数据
          const newList = [];
          list.forEach((item) => {
            if (item.coin.indexOf(this.findValue.toUpperCase()) !== -1) {
              newList.push(item);
            }
          });
          tableDataList = newList;
        }
      }
      // 杠杆隐藏零资产功能过滤数据
      if (this.nowType === 4) {
        let list = [];
        if (this.switchFlag) {
          this.dataList.forEach((item) => {
            const { balance } = item;
            if (parseFloat(balance)) {
              list.push(item);
            }
          });
        } else {
          list = this.dataList;
        }
        // 搜索框功能过滤数据
        const newList = [];
        list.forEach((item) => {
          if (item.coin.indexOf(this.findValue.toUpperCase()) !== -1) {
            newList.push(item);
          }
        });
        tableDataList = newList;
      }
      return tableDataList;
    },
    coinList() {
      return this.market && this.market.coinList;
    },
    rate() {
      return this.market && this.market.rate ? this.market.rate : {};
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
    // market 接口
    market() {
      return this.$store.state.baseData.market;
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
    userCurrency() {
      return getCookie('lan') || 'en_US';
    },
    baseData() {
      return this.$store.state.baseData.publicInfo;
    },
    // 风险率指针图片
    crossRiskImg() {
      let icon = '#icon-t_2';
      if (this.crossRiskRate >= 1.5) {
        icon = '#icon-t_2';
      } else if (this.crossRiskRate >= this.remindRiskRate && this.crossRiskRate < 1.5) {
        icon = '#icon-t_3';
      } else if (this.crossRiskRate && this.riskRate < this.remindRiskRate) {
        icon = '#icon-t_4';
      }
      return icon;
    },
    // 风险率颜色
    crossRiskColor() {
      let color = 'text-2-cl';
      if (this.crossRiskRate > 1.5) {
        color = 'rise-1-cl';
      } else if (this.crossRiskRate > this.remindRiskRate && this.crossRiskRate <= 1.5) {
        color = 'warning-1-cl';
      } else if (this.crossRiskRate && this.crossRiskRate <= this.remindRiskRate) {
        color = 'fall-1-cl';
      }
      return color;
    },
    // 风险级别
    crossRiskText() {
      let text = '--';
      if (this.crossRiskRate > 1.5) {
        text = this.$t('assets.leverageAccount.risk1');
      } else if (this.crossRiskRate > this.remindRiskRate && this.crossRiskRate <= 1.5) {
        text = this.$t('assets.leverageAccount.risk2');
      } else if (this.crossRiskRate && this.crossRiskRate <= this.remindRiskRate) {
        text = this.$t('assets.leverageAccount.risk3');
      }
      return text;
    },
  },
};
