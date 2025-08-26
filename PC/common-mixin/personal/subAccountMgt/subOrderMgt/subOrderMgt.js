import {
  colorMap, getCoinShowName, fixD, formatTime, imgMap, thousands,
} from '@/utils';

export default {
  name: 'subOrderMgt',
  data() {
    return {
      imgMap,
      colorMap,
      nowType: 1, // 1币币账户 2杠杆账户 3合约账户
      tabType: '1', // 1为当前委托 3为历史委托 合约展示：2 计划委托 4 历史计划委托 5历史成交
      defaultClass: 'text-2-cl fill-2-bg',
      activeClass: 'text-1-cl fill-3-bg',
      paginationObj: {
        total: 0, // 数据总条数
        display: 10, // 每页显示条数
        currentPage: 1, // 当前页码
      },
      tableList: [],
      tableLoading: true,
      subContent: [], // 展开的数据
      subContentId: '',
      selectAccountList: [], // 账户列表
      selectMarketList: [], // 市场列表
      selectSymbolList: [], // 币对列表
      statusList: [],
      selAccount: 0, // 当前查询的子账户
      selSide: 0, // 当前查询的类型
      selMarket: '', // 市场
      selSymbol: 'all', // 币对
      switchFlag: false, // 显示已撤单
      // 合约订单查看
      selContractType: 1, // 选择的合约类型
      // selContractDirection: 1, // 选择的合约方向 1USDT 2币本位
      selContractCoin: null, // 选择的合约币对
      contractCoinList: [], // 合约列表下拉（筛选）
      contractCoinListAll: [], // 所有合约列表
      selContractOrder: '0', // 选择的合约币对
      contractTypeList: [], // 合约类型
      cancelDialogFlag: false,
      cancelDialogLoading: false,
      startTime:
        new Date(new Date().toLocaleDateString()).getTime()
        - 24 * 60 * 60 * 1000 * 2, // 合约历史开始时间
      endTime:
        new Date(new Date().toLocaleDateString()).getTime()
        + (24 * 60 * 60 * 1000 - 1), // 合约历史结束时间
      // startTime: 1657521802000, // 合约历史开始时间
      // endTime: '', // 合约历史结束时间
      showTypeTabList1: false,
      showTypeTabList2: false,
      showTypeTabList3: false,
      showTypeTabList4: false,
      stopOrderData: null, // 止盈止损数据
      isShowStopOrder: false, // 止盈止损弹窗
    };
  },
  watch: {
    market(v) {
      if (v) {
        this.initSymbolMarketList();
        this.getCoinSymbolTableData();
      }
    },
    contractOrderList(v) {
      if (v && v.length) {
        this.selContractOrder = '0';
      }
    },
  },
  methods: {
    async init() {
      this.selectAccountList = await this.getSelAccountList(); // 获取子账户下拉
      this.contractCoinListAll = await this.getContractList(); // 获取全部合约下拉
      if (this.contractCoinListAll.length) {
        this.getSelectContractType();
        setTimeout(() => {
          this.comContractList();
        }, 500);
      }
      if (this.market) { this.initSymbolMarketList(); }
      this.getCoinSymbolTableData(); // 获取杠杆、币币订单表格
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
            tempList.unshift({
              value: this.$t('subAccount.common.sel_allSub'),
              code: 0,
            });
            resolve(tempList);
          } else {
            resolve([
              { value: this.$t('subAccount.common.sel_allSub'), code: 0 },
            ]);
          }
        });
      });
    },
    // 获取合约下拉
    getContractList() {
      return new Promise((resolve) => {
        this.axios({
          url: this.$store.state.url.subAccount.order_selContact,
          method: 'post',
        }).then((data) => {
          if (data.code.toString() === '0') {
            const tempList = data.data.list.map((it) => {
              const tempObj = { ...it };
              tempObj.value = it.contractName;
              tempObj.code = it.id;
              return tempObj;
            });
            resolve(tempList);
          } else {
            resolve([]);
          }
        });
      });
    },
    // 获取币币和杠杆
    getCoinSymbolTableData() {
      if (this.nowType === 3 || !this.market) {
        return;
      }
      const selSymbol = this.selSymbol === 'all' ? '' : this.selSymbol;
      const symbol = selSymbol.toLowerCase();
      const paramsData = {
        side: this.selSide || null, // 买 、卖
        pageSize: this.paginationObj.display, // 每页条数
        page: this.paginationObj.currentPage, // 页码
        entrust: this.tabType, // 1:当前委托 2 历史委托
        subUid: this.selAccount || null, // 当前子账号
        isShowCanceled: this.switchFlag ? '1' : '0', // 是否展示已撤单
        symbol: symbol || null, // 币对
        orderType: this.nowType,
      };
      // if (this.openOrderCollect === '1') {
      //   paramsData.orderType = 1;
      // }
      this.axios({
        url: this.$store.state.url.subAccount.order_coinSymbolUrl,
        method: 'post',
        params: paramsData,
      }).then((data) => {
        if (data.code.toString() === '0') {
          const orderList = [];
          let { list } = data.data;
          const { coinList } = this.market;
          if (this.openOrderCollect === '1') {
            list = data.data.orders;
          }
          list.forEach((item) => {
            const quoteCoin = item.quoteCoin || item.countCoin;
            const { marketFix, coinFix } = this.getFix(quoteCoin, item.baseCoin);
            const subTableBtn = [];
            if (item.status === 2 || (item.status === 4 && parseFloat(item.dealVolume) !== 0)) {
              subTableBtn.push(
                {
                  type: 'detail',
                  text: this.$t('order.exchangeOrder.details'), // 详情
                  eventType: 'view',
                },
              );
            }
            if (item.type.toString() === '1') {
              subTableBtn.push({
                type: 'cancel',
                text: this.$t('order.exchangeOrder.cancel'), // 撤单
                eventType: 'cancelOrder',
              });
            }
            orderList.push({
              data: item,
              id: item.id,
              time: item.createdAt, // 时间
              coin: `${getCoinShowName(item.baseCoin, coinList)}/${getCoinShowName(quoteCoin, coinList)}`, // 币对
              type: {
                text: item.sideText,
                classes: item.side === 'BUY' ? 'rise-1-cl' : 'fall-1-cl',
              },
              price: item.type.toString() === '1'
                ? `${fixD(item.price, marketFix)} ${getCoinShowName(quoteCoin, coinList)}` // 价格
                : this.$t('order.exchangeOrder.marketPrice'), // 市价
              volume: `${fixD(item.volume, coinFix)} ${getCoinShowName(item.baseCoin, coinList)}`, // 数量
              amount: `${fixD(item.totalPrice, marketFix)} ${getCoinShowName(quoteCoin, coinList)}`, // 交易额
              avgPrice: `${fixD(item.avgPrice, marketFix)} ${getCoinShowName(quoteCoin, coinList)}`, // 平均成交价
              percent: {
                text: `${fixD(item.dealVolume, coinFix)} ${getCoinShowName(item.baseCoin, coinList)}`,
                subText: `${fixD(item.remainVolume, coinFix)} ${getCoinShowName(item.baseCoin, coinList)}`,
              },
              operation: subTableBtn,
              userEmail: item.userEmail,
              userId: item.userId,
              symbol: item.symbol,
              status: item.statusText,
            });
          });
          this.tableLoading = false;
          this.tableList = orderList;
          this.paginationObj.total = data.data.count;
        } else {
          this.tableLoading = false;
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
    // 交易类型
    getTradeTypeText(type) {
      let typeText = '';
      switch (type) {
        case 1:
          typeText = this.$t('trade.limitPriceTrade'); // 限价
          break;
        case 2:
          typeText = this.$t('trade.marketPriceTrade'); // 市价
          break;
        case 3:
          typeText = this.$t('trade5.condition.text1'); // 止盈止损
          break;
        case 4:
          typeText = 'FOK';
          break;
        case 5:
          typeText = this.$t('trade5.condition.text43');
          break;
        case 6:
          typeText = 'IOC';
          break;
        default:
          break;
      }
      return typeText;
    },
    // 触发价
    setTriggerPrice(item, fix, coin) {
      if (item.type !== 3) return '--';
      const price = item.trigger_price;
      const side = item.trigger_side;
      if (side === 0) {
        return `≤${thousands(fixD(price, fix))} ${coin}`;
      }
      return `≥${thousands(fixD(price, fix))} ${coin}`;
    },
    // 获取合约表格数据
    getContactTableData() {
      if (this.nowType !== 3) return;
      this.tableLoading = true;
      // 请求：当前委托和历史委托
      if (this.tabType === '1' || this.tabType === '2') {
        const paramsData = {
          contractId: this.selContractCoin, // 合约ID
          subUid: this.selAccount || null,
          page: this.paginationObj.currentPage,
          pageSize: this.paginationObj.display,
          orderType: Number(this.tabType), // 1当前位委托 2历史委托
          type: this.axiosType, // 订单类型
        };
        if (this.tabType === '2') {
          paramsData.startTime = this.startTime;
          paramsData.endTime = this.endTime;
        }
        this.axios({
          url: this.$store.state.url.subAccount.order_tableContact,
          method: 'post',
          params: paramsData,
        }).then((data) => {
          if (data.code.toString() === '0') {
            this.tableLoading = false;
            if (this.tabType === '1') {
              // 当前
              this.tableList = data.data.list.map((item) => {
                const open = item.open === 'OPEN'
                  ? this.$t('futures.order.open')
                  : this.$t('futures.order.close');
                let side = this.$t('futures.order.sell');
                if (
                  (item.open === 'OPEN' && item.side === 'BUY')
                  || (item.open === 'CLOSE' && item.side === 'SELL')
                ) {
                  side = this.$t('futures.order.buy');
                }
                let price = null;
                if (item.type === 2 && Number(item.price) === 0) {
                  price = this.$t('futures.order.currentPrice');
                } else {
                  price = fixD(item.price, item.pricePrecision);
                }
                const tempObj = JSON.parse(JSON.stringify(item));
                tempObj.showType = this.typeStatus(item.type);
                tempObj.showSide = open + side;
                tempObj.showPrice = price; // 委托价格
                tempObj.operation = [
                  {
                    text: this.$t('subAccount.common.table_detail'),
                    type: 'detail',
                  },
                  { text: this.$t('subAccount.order.cancelled'), type: 'cancel' },
                ];
                return tempObj;
              });
              this.paginationObj.total = data.data.count;
            } else {
              // 历史
              this.tableList = data.data.list.map((item) => {
                const tempObj = { ...item };
                const open = item.open === 'OPEN'
                  ? this.$t('futures.order.open')
                  : this.$t('futures.order.close');
                let side = this.$t('futures.order.sell');
                if (
                  (item.open === 'OPEN' && item.side === 'BUY')
                  || (item.open === 'CLOSE' && item.side === 'SELL')
                ) {
                  side = this.$t('futures.order.buy');
                }
                let price = null;
                let unit = null;
                let volume = null;
                if (item.type === 2 && Number(item.price) === 0) {
                  price = this.$t('futures.order.currentPrice');
                  if (item.open === 'OPEN') {
                    if (this.contractListMap) {
                      unit = this.contractListMap[item.contractName].marginCoin;
                      volume = fixD(
                        item.volume,
                        this.contractListMap[item.contractName].mCionFix,
                      );
                    }
                  } else {
                    volume = item.volume;
                    unit = this.$t('futures.order.per');
                  }
                } else {
                  volume = item.volume;
                  price = fixD(item.price, item.pricePrecision);
                  unit = this.$t('futures.order.per');
                }
                tempObj.showType = this.typeStatus(item.type);
                tempObj.showSide = open + side; // 方向
                tempObj.showPrice = item.type === 6 ? '--' : price; // 委托价格
                tempObj.showVolume = `${volume} ${unit}`; // 委托数量
                tempObj.showAverage = !item.avgPrice || item.type === 6
                  ? '--'
                  : fixD(item.avgPrice, item.pricePrecision); // 成交均价
                tempObj.showTradeFee = `${fixD(
                  item.tradeFee,
                  item.pricePrecision,
                )} ${this.contractListMap[item.contractName].marginCoin}`; // 手续费
                tempObj.operation = [
                  {
                    text: this.$t('subAccount.common.table_detail'),
                    type: 'detail',
                  },
                ];
                tempObj.showStatus = this.getStatus(item.status);
                return tempObj;
              });
            }
            this.paginationObj.total = data.data.count;
            this.tableLoading = false;
          } else {
            this.tableLoading = false;
            this.tableList = [];
            // this.$bus.$emit('tip', { text: data.msg, type: 'error' });
          }
        });
      } else if (this.tabType === '3' || this.tabType === '4') {
        // 计划/历史计划
        const paramsData = {
          contractId: this.selContractCoin, // 合约ID
          subUid: this.selAccount || null,
          page: this.paginationObj.currentPage,
          pageSize: this.paginationObj.display,
          orderType: this.tabType === '3' ? 1 : 2, // 1当前位委托 2历史委托
        };
        if (this.tabType === '4') {
          paramsData.startTime = this.startTime;
          paramsData.endTime = this.endTime;
        }
        this.axios({
          url: this.$store.state.url.subAccount.order_triggerContact,
          method: 'post',
          params: paramsData,
        }).then((data) => {
          if (data.code.toString() === '0') {
            if (this.tabType === '3') {
              // 当前计划委托
              this.tableList = data.data.list.map((item) => {
                const open = item.open === 'OPEN'
                  ? this.$t('futures.order.open')
                  : this.$t('futures.order.close');
                let side = this.$t('futures.order.sell');
                if (
                  (item.open === 'OPEN' && item.side === 'BUY')
                  || (item.open === 'CLOSE' && item.side === 'SELL')
                ) {
                  side = this.$t('futures.order.buy');
                }
                let price = null;
                let unit = null;
                let volume = null;
                if (item.type === 2 && Number(item.price) === 0) {
                  price = this.$t('futures.order.currentPrice');
                  if (item.open === 'OPEN') {
                    if (this.contractListMap) {
                      unit = this.contractListMap[item.contractName].marginCoin;
                      volume = fixD(
                        item.volume,
                        this.contractListMap[item.contractName].mCionFix,
                      );
                    }
                  } else {
                    volume = item.volume;
                    unit = this.$t('futures.order.per');
                  }
                } else {
                  volume = item.volume;
                  price = fixD(item.price, item.pricePrecision);
                  unit = this.$t('futures.order.per');
                }
                const tempObj = JSON.parse(JSON.stringify(item));
                tempObj.showType = this.getTriggerType(item.triggerType);
                tempObj.showOrderType = this.typeStatus(item.type);
                tempObj.showSide = open + side;
                tempObj.showPrice = fixD(
                  item.triggerPrice,
                  item.pricePrecision,
                ); // 触发价
                tempObj.showPriceTwo = price; // 委托价格
                tempObj.showNum = `${volume} ${unit}`; // 委托数量
                tempObj.operation = [
                  {
                    text: this.$t('subAccount.common.table_detail'),
                    type: 'detail',
                  },
                  { text: this.$t('subAccount.order.cancelled'), type: 'cancel' },
                ];
                return tempObj;
              });
              this.paginationObj.total = data.data.count;
              this.tableLoading = false;
            } else {
              // 历史计划委托
              this.tableList = data.data.list.map((item) => {
                const tempObj = { ...item };
                const open = item.open === 'OPEN'
                  ? this.$t('futures.order.open')
                  : this.$t('futures.order.close');
                let side = this.$t('futures.order.sell');
                if (
                  (item.open === 'OPEN' && item.side === 'BUY')
                  || (item.open === 'CLOSE' && item.side === 'SELL')
                ) {
                  side = this.$t('futures.order.buy');
                }
                let price = null;
                let unit = null;
                let volume = null;
                if (item.type === 2 && Number(item.price) === 0) {
                  price = this.$t('futures.order.currentPrice');
                  if (item.open === 'OPEN') {
                    if (this.contractListMap) {
                      unit = this.contractListMap[item.contractName].marginCoin;
                      volume = fixD(
                        item.volume,
                        this.contractListMap[item.contractName].mCionFix,
                      );
                    }
                  } else {
                    volume = item.volume;
                    unit = this.$t('futures.order.per');
                  }
                } else {
                  volume = item.volume;
                  price = fixD(item.price, item.pricePrecision);
                  unit = this.$t('futures.order.per');
                }
                tempObj.showType = this.getTriggerType(item.triggerType);
                tempObj.showSide = open + side; // 方向
                tempObj.showTigPrice = fixD(
                  item.triggerPrice,
                  item.pricePrecision,
                ); // 触发价格
                tempObj.showPrice = price; // 委托价格
                tempObj.showVolume = `${volume} ${unit}`; // 委托数量
                tempObj.showAverage = !item.avgPrice || item.type === 6
                  ? '--'
                  : fixD(item.avgPrice, item.pricePrecision); // 成交均价
                tempObj.showTradeFee = `${fixD(
                  item.tradeFee,
                  item.pricePrecision,
                )} ${this.contractListMap[item.contractName].marginCoin}`; // 手续费
                // tempObj.showUnderweight = item.open === 'CLOSE' ? '是' : '否';
                // tempObj.showTime = formatTime(item.ctime); // 提交委托时间
                // tempObj.showTigTime = formatTime(item.mtime); // 触发时间
                tempObj.showStatus = this.getStatus(item.status);
                tempObj.showMemoText = item.memo
                  ? this.historyMemoText[item.memo - 1]
                  : '';
                tempObj.operation = [
                  {
                    text: this.$t('subAccount.common.table_detail'),
                    type: 'detail',
                  },
                ];
                return tempObj;
              });
              this.paginationObj.total = data.data.count;
              this.tableLoading = false;
            }
          } else {
            this.tableLoading = false;
            this.tableList = [];
            // this.$bus.$emit('tip', { text: data.msg, type: 'error' });
          }
        });
      } else {
        // 获取历史成交
        const paramsData = {
          contractId: this.selContractCoin, // 合约ID
          subUid: this.selAccount || null,
          page: this.paginationObj.currentPage,
          pageSize: this.paginationObj.display,
          startTime: this.startTime,
          endTime: this.endTime,
        };
        this.axios({
          url: this.$store.state.url.subAccount.order_historyContact,
          method: 'post',
          params: paramsData,
        }).then((data) => {
          if (data.code.toString() === '0') {
            this.tableList = data.data.list.map((item) => {
              const open = item.open === 'OPEN'
                ? this.$t('futures.order.open')
                : this.$t('futures.order.close');
              let side = this.$t('futures.order.sell');
              if (
                (item.open === 'OPEN' && item.side === 'BUY')
                || (item.open === 'CLOSE' && item.side === 'SELL')
              ) {
                side = this.$t('futures.order.buy');
              }
              const tempObj = JSON.parse(JSON.stringify(item));
              tempObj.showSide = open + side;
              tempObj.showPrice = fixD(item.price, item.pricePrecision); // 成交价格
              tempObj.showFee = `${fixD(item.fee, item.feeCoinPrecision)} ${
                item.feeCoin
              }`; // 手续费
              tempObj.showTime = formatTime(item.ctime);
              tempObj.operation = [];
              return tempObj;
            });
            this.paginationObj.total = data.data.count;
            this.tableLoading = false;
          } else {
            this.tableLoading = false;
            this.tableList = [];
            // this.$bus.$emit('tip', { text: data.msg, type: 'error' });
          }
        });
      }
    },
    // 打开止盈止损弹窗
    stopOrder(row) {
      // 查看止盈止损
      const obj = JSON.parse(JSON.stringify(row));
      this.stopOrderData = obj.otoOrder ? obj.otoOrder : {};
      this.isShowStopOrder = true;
    },
    close() {
      this.isShowStopOrder = false;
    },
    // 类型
    getTriggerType(val) {
      if (val === 1) {
        return this.$t('futures.order.riggerType1'); //  '止损单';
      }
      if (val === 2) {
        return this.$t('futures.order.riggerType2'); //  '止盈单';
      }
      return this.$t('futures.order.riggerType3'); //  '条件单';
    },
    typeStatus(status) {
      let str = '';
      switch (status) {
        case 1:
          str = this.$t('futures.order.orderType1'); // '限价单';
          break;
        case 2:
          str = this.$t('futures.order.orderType2'); // '市价单';
          break;
        case 3:
          str = this.$t('futures.order.orderType4'); // 'IOC';
          break;
        case 4:
          str = this.$t('futures.order.orderType5'); // 'FOK';
          break;
        case 5:
          str = this.$t('futures.order.orderType3'); // 'POST_ONLY';
          break;
        case 6:
          str = this.$t('futures.order.orderType6'); // '强制减仓';
          break;
        case 7:
          str = this.$t('futures.order.orderType7'); // '仓位合并';
          break;
        default:
          str = '';
      }
      return str;
    },
    getStatus(status) {
      let str = '';
      switch (status) {
        case 0:
          str = this.$t('futures.order.status1'); // '新订单';
          break;
        case 1:
          str = this.$t('futures.order.status1'); // '新订单';
          break;
        case 2:
          str = this.$t('futures.order.status2'); // '完全成交';
          break;
        case 3:
          str = this.$t('futures.order.status3'); // '部分成交';
          break;
        case 4:
          str = this.$t('futures.order.status4'); // '已取消';
          break;
        case 5:
          str = this.$t('futures.order.status5'); // '待撤销';
          break;
        case 6:
          str = this.$t('futures.order.status6'); // '异常订单';
          break;
        case 7:
          str = this.$t('futures.order.status7'); // '部分成交已撤销';
          break;
        default:
          str = '';
      }
      return str;
    },
    // 选择时间
    dateChange(v) {
      const [startTime, endTime] = v;
      if (startTime && endTime) {
        this.endTime = new Date(new Date(endTime.replace(/-/g, '/')).toLocaleDateString()).getTime() + (24 * 60 * 60 * 1000 - 1);
        this.startTime = new Date(new Date(startTime.replace(/-/g, '/')).toLocaleDateString()).getTime();
        this.getContactTableData();
      }
    },
    getFix(market, coin) {
      // 例如 btc/usdt
      let marketFix = 0; // 市场精度 usdt
      let coinFix = 0; // 交易币种精度 btc
      const symbol = `${coin}/${market}`;
      if (this.symbolAll[symbol]) {
        const { price, volume } = this.symbolAll[symbol];
        marketFix = price;
        coinFix = volume;
      }
      return {
        marketFix,
        coinFix,
      };
    },
    // 初始化市场列表
    initSymbolMarketList() {
      const { market, coinList } = this.market;
      const list = [];
      if (this.openOrderCollect === '1') {
        // 全部市场(近180天)'
        list.push({ value: this.$t('subAccount.order.sel_text'), code: 'all' });
      }
      Object.keys(market).forEach((item) => {
        list.push({ value: getCoinShowName(item, coinList), code: item });
      });
      this.selectMarketList = list;
      if (list.length) {
        this.selectMarketChange(list[0]);
      }
    },
    // 市场发生改变 生成币对数据
    selectMarketChange(item) {
      if (this.selMarket === item.code) {
        return;
      }
      this.selMarket = item.code;
      // 创建币种列表
      const list = [];
      if (this.openOrderCollect === '1' && this.selMarket === 'all') {
        list.push({
          value: this.$t('subAccount.common.allSymol'),
          code: 'all',
        });
      }
      const { market } = this.market;
      let curList = market[this.selMarket];
      if (this.selMarket === 'all') {
        curList = this.symbolAll;
      }
      if (curList) {
        Object.keys(curList).forEach((citem) => {
          const coinArr = citem.split('/');
          const citemObj = curList[citem];
          const showSymbol = citemObj.showName || citemObj.name;
          list.push({ code: `${coinArr[0]}${coinArr[1]}`, value: showSymbol });
        });
      }
      this.selectSymbolList = list;
      if (list.length) {
        this.selectSymbolChange(list[0]);
      }
      if (this.nowType !== 3) {
        this.getCoinSymbolTableData();
      }
    },
    // 币对发生改变
    selectSymbolChange(item) {
      if (this.selSymbol === item.code) {
        return;
      }
      this.selSymbol = item.code;
      this.paginationObj.currentPage = 1; // 页码
      this.paginationObj.total = 0; // 总条数
      this.tableList = [];
      if (this.nowType !== 3) {
        this.getCoinSymbolTableData();
      }
    },
    // 买入/卖出查询切换
    sideChange(item) {
      if (this.selSide === item.code) {
        return;
      }
      this.selSide = item.code;
      this.paginationObj.currentPage = 1; // 页码
      this.paginationObj.total = 0; // 总条数
      this.tableList = [];
      if (this.nowType !== 3) {
        this.getCoinSymbolTableData();
      }
    },
    // 账户切换
    accountChange(item) {
      if (this.selAccount === item.code) {
        return;
      }
      this.selAccount = item.code;
      this.paginationObj.currentPage = 1; // 页码
      this.paginationObj.total = 0; // 总条数
      this.tableList = [];
      this.switchFlag = false;
      if (this.nowType === 3) {
        this.getContactTableData();
      } else {
        this.getCoinSymbolTableData();
      }
    },
    // 合约账户切换
    conAccountChange(item) {
      if (this.selAccount === item.code) {
        return;
      }
      this.selAccount = item.code;
      this.paginationObj.currentPage = 1; // 页码
      this.paginationObj.total = 0; // 总条数
      this.tableList = [];
      if (this.nowType === 3) {
        this.getContactTableData();
      }
    },
    // 合约类型切换
    conTypeChange(item) {
      if (this.selContractType === item.code) {
        return;
      }
      this.selContractType = item.code;
      this.paginationObj.currentPage = 1; // 页码
      this.paginationObj.total = 0; // 总条数
      this.tableList = [];
      this.tableLoading = true;
      this.comContractList();
    },
    // 合约切换
    conChange(item) {
      if (this.selContractCoin === item.code) {
        return;
      }
      this.selContractCoin = item.code;
      if (this.nowType === 3) this.getContactTableData();
    },
    // 订单类型切换
    conOrderChange(item) {
      if (this.selContractOrder === item.code) {
        return;
      }
      this.selContractOrder = item.code;
      if (this.nowType === 3) this.getContactTableData();
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
    // 合约下拉发生改变
    // 类型按钮切换 当前/历史/等
    typeChange(val) {
      if (this.tabType === val) {
        return;
      }
      this.tabType = val;
      this.paginationObj.currentPage = 1; // 页码
      this.paginationObj.total = 0; // 总条数
      this.tableList = [];
      this.subContentId = null;
      this.subContent = [];
      this.switchFlag = false;
      if (this.nowType === 3) {
        this.selContractType = '';
        this.startTime = new Date(new Date().toLocaleDateString()).getTime()
          - 24 * 60 * 60 * 1000 * 2; // 合约历史开始时间
        this.endTime = new Date(new Date().toLocaleDateString()).getTime()
          + (24 * 60 * 60 * 1000 - 1); // 合约历史结束时间
        this.paginationObj.currentPage = 1; // 页码
        this.paginationObj.total = 0; // 总条数
        setTimeout(() => {
          this.selContractType = this.contractTypeList.length
            ? this.contractTypeList[0].code
            : 1;
          this.comContractList();
          // this.getContactTableData();
        }, 300);
      } else {
        this.getCoinSymbolTableData();
      }
    },
    // 重置详情
    clearSub() {
      this.subContentId = null;
      // this.subColumns = [];
      this.subContent = [];
      this.subLoading = false;
    },
    pageChange(vel) {
      this.paginationObj.currentPage = vel;
      if (this.nowType === 1 || this.nowType === 2 || this.nowType === 4) {
        this.getCoinSymbolTableData();
      } else {
        this.getContactTableData();
      }
    },
    // 切换tab导航 币币/杠杆/合约
    currentType(item) {
      if (this.nowType === item.index) {
        return;
      }
      this.nowType = item.index;
      this.paginationObj.currentPage = 1; // 页码
      this.paginationObj.total = 0; // 总条数
      this.tableList = [];
      this.tableLoading = true;
      this.switchFlag = false;
      this.tabType = '1'; // 默认切到当前委托
      this.selAccount = 0;
      if (this.nowType === 3) {
        this.getContactTableData();
      } else {
        this.getCoinSymbolTableData();
      }
    },
    tableClick(type, row) {
      if (type === 'detail') {
        this.getSubTableData(row.id, row);
      } else if (type === 'cancel') {
        this.cancelOne(row);
      }
    },
    // 查看详情
    getSubTableData(v, row) {
      if (this.subContentId === v) {
        this.subContentId = null;
      } else {
        this.subContent = [];
        this.subLoading = true;
        // 币币的当前无需调接口
        if (this.nowType === 1 || this.nowType === 2 || this.nowType === 4) {
          if (this.tabType === '1') {
            // 当前委托
            this.subContent.push({
              created_at: row.created_at,
              been: `${row.beenTraded}/${row.beenUnsettled}`,
              showAverage: row.showAverage,
            });
          } else {
            // 历史委托
            this.axios({
              url: this.$store.state.url.subAccount.order_coinSymbolDetailUrl,
              method: 'post',
              params: {
                symbol: row.symbol,
                orderId: row.id,
                type: row.type,
                subUid: row.userId,
                pageSize: 10,
                page: 1,
              },
            }).then((data) => {
              if (data.code.toString() === '0') {
                const list = [];
                data.data.list.forEach((item) => {
                  const { marketFix, coinFix } = this.getFix(
                    row.quoteCoin,
                    row.baseCoin,
                  );
                  list.push({
                    subTime: item.ctime,
                    subPrice: fixD(item.price, marketFix),
                    subNum: fixD(item.volume, coinFix),
                    turnover: fixD(item.deal_price, marketFix),
                    free: item.fee,
                  });
                });
                this.subContent = list;
              } else {
                this.$bus.$emit('tip', { text: data.msg, type: 'error' });
              }
            });
          }
        } else if (this.nowType === 3) {
          // 合约
          if (this.tabType === '1') {
            // 当前委托
            this.subContent.push({
              showAvgPrice: row.avgPrice
                ? fixD(row.avgPrice, row.pricePrecision)
                : '--', // 成交均价
              showUnderweight:
                row.open === 'CLOSE'
                  ? this.$t('futures.order.yes')
                  : this.$t('futures.order.no'), // 只减仓
              otoOrder: '--',
              showTime: formatTime(row.ctime),
            });
          } else if (this.tabType === '2') {
            // 历史委托
            this.subContent.push({
              showUnderweight:
                row.open === 'CLOSE'
                  ? this.$t('futures.order.yes')
                  : this.$t('futures.order.no'), // 只减仓
              otoOrder: '--', // 止盈止损
              showStatus: row.showStatus,
              showTime: formatTime(row.ctime),
            });
          } else if (this.tabType === '3') {
            // 计划委托
            this.subContent.push({
              showNum: row.showNum, // 只减仓
              showUnderweight:
                row.open === 'CLOSE'
                  ? this.$t('futures.order.yes')
                  : this.$t('futures.order.no'), // 只减仓
              showExTime: formatTime(row.expireTime),
              showTime: formatTime(row.ctime),
            });
          } else if (this.tabType === '4') {
            // 计划委托
            this.subContent.push({
              showTigTime: formatTime(row.mtime), // 触发时间
              showUnderweight:
                row.open === 'CLOSE'
                  ? this.$t('futures.order.yes')
                  : this.$t('futures.order.no'), // 只减仓
              showTime: formatTime(row.ctime),
            });
          }
        }
        this.subContentId = v;
      }
    },
    switchChange() {
      this.switchFlag = !this.switchFlag;
      if (this.nowType !== 3) {
        this.getCoinSymbolTableData();
      }
    },
    // 撤销全部订单
    cancelAllConfirm() {
      if (!this.selAccount) return;
      this.cancelDialogLoading = true;
      if (this.nowType !== 3) {
        const selSymbol = this.selSymbol === 'all' ? '' : this.selSymbol;
        const symbol = selSymbol ? selSymbol.toLowerCase() : null;
        const paramsData = {
          subUid: this.selAccount,
          orderType: this.nowType === 4 ? 3 : this.nowType,
          symbol,
          side: this.selSide || null,
        };
        this.axios({
          url: this.$store.state.url.subAccount.order_cancelAll,
          method: 'post',
          params: paramsData,
        }).then((data) => {
          if (data.code.toString() === '0') {
            this.getCoinSymbolTableData();
            this.cancelDialogLoading = false;
            this.cancelDialogFlag = false;
            this.$bus.$emit('tip', {
              text: this.$t('subAccount.order.message'),
              type: 'success',
            }); // 撤销成功
          } else {
            this.$bus.$emit('tip', { text: data.msg, type: 'error' });
            this.cancelDialogLoading = false;
          }
        });
      } else {
        this.axios({
          url: this.$store.state.url.subAccount.order_cancelContact,
          method: 'post',
          params: { subUid: this.selAccount, contractId: this.selContractCoin },
        }).then((data) => {
          if (data.code.toString() === '0') {
            this.getContactTableData();
            this.cancelDialogLoading = false;
            this.cancelDialogFlag = false;
            this.$bus.$emit('tip', {
              text: this.$t('subAccount.order.message'),
              type: 'success',
            }); // 撤销成功
          } else {
            this.$bus.$emit('tip', { text: data.msg, type: 'error' });
            this.cancelDialogLoading = false;
          }
        });
      }
    },
    // 撤销单个
    cancelOne(row) {
      if (this.nowType !== 3) {
        const paramsData = {
          subUid: row.userId,
          orderType: this.nowType === 4 ? 3 : this.nowType,
          symbol: row.symbol,
          orderId: row.id,
        };
        this.axios({
          url: this.$store.state.url.subAccount.order_cancelOne,
          method: 'post',
          params: paramsData,
        }).then((data) => {
          if (data.code.toString() === '0') {
            this.getCoinSymbolTableData();
            this.$bus.$emit('tip', {
              text: this.$t('subAccount.order.message'),
              type: 'success',
            }); // 撤销成功
          } else {
            this.$bus.$emit('tip', { text: data.msg, type: 'error' });
          }
        });
      } else {
        this.axios({
          url: this.$store.state.url.subAccount.order_cancelContact,
          method: 'post',
          params: {
            subUid: row.originUid,
            contractId: row.contractId,
            orderId: row.id,
          },
        }).then((data) => {
          if (data.code.toString() === '0') {
            this.getContactTableData();
            this.$bus.$emit('tip', {
              text: this.$t('subAccount.order.message'),
              type: 'success',
            }); // 撤销成功
          } else {
            this.$bus.$emit('tip', { text: data.msg, type: 'error' });
          }
        });
      }
    },
    // 计算后的合约列表
    comContractList() {
      let contractType = '';
      if (this.selContractType !== '') {
        contractType = this.selContractType;
      } else {
        contractType = 1;
      }
      const tempList = [];
      this.contractCoinListAll.forEach((item) => {
        // 合约订单新增classification判断
        // usdt合约
        if (item.classification === 1 && contractType === 1) {
          tempList.push({
            code: item.id,
            // value: item.symbol.replace('-', ''),
            value: item.contractOtherName, // 订单合约新名称####
          });
        }
        // 模拟合约
        if (item.classification === 4 && contractType === 3) {
          tempList.push({
            code: item.id,
            // value: item.symbol.replace('-', ''),
            value: item.contractOtherName, // 订单合约新名称####
          });
        }
        // 混合合约
        if (item.classification === 3 && contractType === 2) {
          tempList.push({
            code: item.id,
            // value: item.symbol.replace('-', ''),
            value: item.contractOtherName, // 订单合约新名称####
          });
        }
        // 币本位合约
        if (item.classification === 2 && contractType === 0) {
          tempList.push({
            code: item.id,
            // value: item.symbol.replace('-', ''),
            value: item.contractOtherName, // 订单合约新名称####
          });
        }
      });
      this.contractCoinList = tempList;
      if (this.contractCoinListAll.length) {
        this.$nextTick(() => {
          this.selContractCoin = tempList[0].code;
          if (this.nowType === 3) this.getContactTableData();
        });
      } else {
        this.paginationObj.currentPage = 1; // 页码
        this.paginationObj.total = 0; // 总条数
        this.tableList = [];
        this.tableLoading = false;
      }
    },
    // 计算获取合约类型
    getSelectContractType() {
      const arr = [];
      if (this.contractCoinListAll) {
        this.contractCoinListAll.forEach((item) => {
          // usdt合约
          if (item.classification === 1 && !this.showTypeTabList1) {
            this.showTypeTabList1 = true;
            arr.push({ code: 1, value: this.$t('futures.market.text4') });
          }
          if (item.classification === 2 && !this.showTypeTabList2) {
            this.showTypeTabList2 = true;
            // 币本位合约
            arr.push({ code: 0, value: this.$t('futures.market.text5') });
          }
          if (item.classification === 3 && !this.showTypeTabList3) {
            // 混合合约
            this.showTypeTabList3 = true;
            arr.push({ code: 2, value: this.$t('futures.market.text6') });
          }
          if (item.classification === 4 && !this.showTypeTabList4) {
            this.showTypeTabList4 = true;
            // 模拟合约
            arr.push({ code: 3, value: this.$t('futures.market.text7') });
          }
        });
      }
      this.contractTypeList = arr;
      this.selContractType = 1; // 设置默认值
    },
  },
  computed: {
    market() {
      return this.$store.state.baseData.market;
    },
    // 订单类型
    axiosType() {
      if (this.selContractOrder === '0') {
        return null;
      }
      return this.selContractOrder;
    },
    columns() {
      if (this.nowType === 3) {
        if (this.tabType === '1') {
          // 合约当前
          return [
            {
              key: 'email',
              title: this.$t('subAccount.order.contactTable_type1C1'),
              width: '16%',
            }, // 子账户邮箱
            {
              key: 'contractName',
              title: this.$t('subAccount.walletHistory.contactTable_c3'),
              width: '12%',
            }, // 合约
            {
              key: 'showType',
              title: this.$t('subAccount.order.contactTable_type1C3'),
              width: '12%',
            }, // 订单类型
            {
              key: 'showSide',
              title: this.$t('subAccount.order.contactTable_type1C4'),
              width: '12%',
            }, // 方向
            {
              key: 'showPrice',
              title: this.$t('subAccount.order.contactTable_type1C5'),
              width: '12%',
            }, // 委托价格
            {
              key: 'volume',
              title: this.$t('subAccount.order.contactTable_type1C6'),
              width: '12%',
            }, // 委托数量(张)
            {
              key: 'dealVolume',
              title: this.$t('subAccount.order.contactTable_type1C7'),
              width: '12%',
            }, // 成交数量(张)
            {
              key: 'operation',
              title: this.$t('subAccount.order.contactTable_type1C8'),
              width: '12%',
            }, // 操作
          ];
        }
        if (this.tabType === '3') {
          // 计划委托
          return [
            {
              key: 'email',
              title: this.$t('subAccount.order.contactTable_type3C1'),
              width: '16%',
            }, // 子账户邮箱
            {
              key: 'contractOtherName',
              title: this.$t('subAccount.walletHistory.contactTable_c3'),
              width: '12%',
            }, // 合约
            {
              key: 'showType',
              title: this.$t('subAccount.order.contactTable_type3C3'),
              width: '12%',
            }, // 类型
            {
              key: 'showOrderType',
              title: this.$t('subAccount.order.contactTable_type3C4'),
              width: '12%',
            }, // 订单类型
            {
              key: 'showSide',
              title: this.$t('subAccount.order.contactTable_type3C5'),
              width: '12%',
            }, // 方向
            {
              key: 'showPrice',
              title: this.$t('subAccount.order.contactTable_type3C6'),
              width: '12%',
            }, // 触发价
            {
              key: 'showPriceTwo',
              title: this.$t('subAccount.order.contactTable_type3C7'),
              width: '12%',
            }, // 委托价格
            {
              key: 'operation',
              title: this.$t('subAccount.order.contactTable_type3C8'),
              width: '12%',
            }, // 操作
          ];
        }
        if (this.tabType === '2') {
          // 历史委托
          return [
            {
              key: 'email',
              title: this.$t('subAccount.order.contactTable_type2C1'),
              width: '18%',
            }, // 子账户邮箱
            {
              key: 'contractOtherName',
              title: this.$t('subAccount.walletHistory.contactTable_c3'),
              width: '10%',
            }, // 合约
            {
              key: 'showType',
              title: this.$t('subAccount.order.contactTable_type2C3'),
              width: '10%',
            }, // 订单类型
            {
              key: 'showSide',
              title: this.$t('subAccount.order.contactTable_type2C4'),
              width: '8%',
            }, // 方向
            {
              key: 'showPrice',
              title: this.$t('subAccount.order.contactTable_type2C5'),
              width: '10%',
            }, // 委托价格
            {
              key: 'showVolume',
              title: this.$t('subAccount.order.contactTable_type2C6'),
              width: '10%',
            }, // 委托数量/价值
            {
              key: 'dealVolume',
              title: this.$t('subAccount.order.contactTable_type2C7'),
              width: '10%',
            }, // 成交数量(张)
            {
              key: 'showAverage',
              title: this.$t('subAccount.order.contactTable_type2C8'),
              width: '8%',
            }, // 成交均价
            {
              key: 'showTradeFee',
              title: this.$t('subAccount.order.contactTable_type2C9'),
              width: '8%',
            }, // 手续费
            {
              key: 'operation',
              title: this.$t('subAccount.order.contactTable_type2C10'),
              width: '8%',
            }, // 操作
          ];
        }
        if (this.tabType === '4') {
          // 历史计划
          return [
            {
              key: 'email',
              title: this.$t('subAccount.order.contactTable_type4C1'),
              width: '20%',
            }, // 子账户邮箱
            {
              key: 'contractOtherName',
              title: this.$t('subAccount.walletHistory.contactTable_c3'),
              width: '10%',
            }, // 合约
            {
              key: 'showType',
              title: this.$t('subAccount.order.contactTable_type4C2'),
              width: '10%',
            }, // 类型
            {
              key: 'showSide',
              title: this.$t('subAccount.order.contactTable_type4C3'),
              width: '10%',
            }, // 方向
            {
              key: 'showTigPrice',
              title: this.$t('subAccount.order.contactTable_type4C4'),
              width: '10%',
            }, // 触发价
            {
              key: 'showPrice',
              title: this.$t('subAccount.order.contactTable_type4C5'),
              width: '10%',
            }, // 委托价格
            {
              key: 'showVolume',
              title: this.$t('subAccount.order.contactTable_type4C6'),
              width: '10%',
            }, // 委托数量/价值
            {
              key: 'showStatus',
              title: this.$t('subAccount.order.contactTable_type4C8'),
              width: '10%',
            }, // 状态
            {
              key: 'operation',
              title: this.$t('subAccount.order.contactTable_type3C8'),
              width: '10%',
            }, // 操作
          ];
        }
        if (this.tabType === '5') {
          // 历史成交
          return [
            {
              key: 'email',
              title: this.$t('subAccount.order.contactTable_type5C1'),
              width: '16%',
            }, // 子账户邮箱
            {
              key: 'contractOtherName',
              title: this.$t('subAccount.walletHistory.contactTable_c3'),
              width: '12%',
            }, // 合约
            {
              key: 'showSide',
              title: this.$t('subAccount.order.contactTable_type5C3'),
              width: '12%',
            }, // 方向
            {
              key: 'role',
              title: this.$t('subAccount.order.contactTable_type5C4'),
              width: '12%',
            }, // 角色
            {
              key: 'volume',
              title: this.$t('subAccount.order.contactTable_type5C5'),
              width: '12%',
            }, // 成交数量(张)
            {
              key: 'showPrice',
              title: this.$t('subAccount.order.contactTable_type5C6'),
              width: '12%',
            }, // 成交均价
            {
              key: 'showFee',
              title: this.$t('subAccount.order.contactTable_type5C7'),
              width: '12%',
            }, // 手续费
            {
              key: 'showTime',
              title: this.$t('subAccount.order.contactTable_type5C8'),
              width: '12%',
            }, // 操作
          ];
        }
      } else {
        // 币币/杠杆：历史委托
        if (this.tabType === '2') {
          // 历史委托
          return [
            {
              key: 'userEmail',
              title: this.$t('subAccount.order.table_type2C1'),
              minWidth: '130px',
            }, // 子账户邮箱
            // 时间
            {
              key: 'time',
              title: this.$t('order.exchangeOrder.hisOrderTime'),
              width: '100px',
            },
            // 币对
            {
              key: 'coin',
              title: this.$t('order.exchangeOrder.coin'),
            },
            // 类别
            {
              key: 'type',
              title: this.$t('order.exchangeOrder.hisOrderType'),
            },
            // 价格
            {
              key: 'price',
              title: this.$t('order.exchangeOrder.hisOrderPrice'),
            },
            // 数量
            {
              key: 'volume',
              title: this.$t('order.exchangeOrder.hisOrderVolume'),
            },
            // 成交均价
            {
              key: 'avgPrice',
              title: this.$t('order.exchangeOrder.hisOrderAverage'),
            },
            // 状态
            {
              key: 'status',
              title: this.$t('order.exchangeOrder.hisOrderStatus'),
            },
            // 操作
            {
              title: this.$t('order.exchangeOrder.hisOrderOptions'),
              width: '10%',
              minWidth: '90px',
              key: 'operation',
              align: 'right',
            },
          ];
        }
        return [
          {
            key: 'userEmail',
            title: this.$t('subAccount.order.table_type1C1'),
            minWidth: '130px',
          }, // 子账户
          // 时间
          {
            key: 'time',
            title: this.$t('order.exchangeOrder.nowOrderTime'),
            width: '100px',
          },
          // 币对
          {
            key: 'coin',
            title: this.$t('order.exchangeOrder.coin'),
          },
          // 类别
          {
            key: 'type',
            title: this.$t('order.exchangeOrder.nowOrderType'),
          },
          // 价格
          {
            key: 'price',
            title: this.$t('order.exchangeOrder.nowOrderPrice'),
          },
          // 数量
          {
            key: 'volume',
            title: this.$t('order.exchangeOrder.nowOrderVolume'),
          },
          // 交易额
          {
            key: 'amount',
            title: this.$t('order.exchangeOrder.nowOrderTotol'),
          },
          // 平均成交价
          {
            key: 'avgPrice',
            title: this.$t('order.exchangeOrder.nowOrderAverage'),
          },
          // 已成交/未成交
          {
            key: 'percent',
            title: this.$t('order.exchangeOrder.nowOrderTransaction'),
          },
          // 操作
          {
            title: this.$t('order.exchangeOrder.nowOrderOptions'),
            minWidth: '90px',
            key: 'operation',
            align: 'right',
          },
        ];
      }
      return [];
    },
    subColumns() {
      if (this.nowType === 3) {
        if (this.tabType === '1') {
          // 当前
          return [
            {
              key: 'showAvgPrice',
              title: this.$t('subAccount.order.contactSubTable_type1C1'),
              width: '25%',
            }, // 成交均价
            {
              key: 'showUnderweight',
              title: this.$t('subAccount.order.contactSubTable_type1C2'),
              width: '25%',
            }, // 只减仓
            {
              key: 'otoOrder',
              title: this.$t('subAccount.order.contactSubTable_type1C3'),
              width: '25%',
            }, // 止盈止损
            {
              key: 'showTime',
              title: this.$t('subAccount.order.contactSubTable_type1C4'),
              width: '25%',
            }, // 时间
          ];
        }
        if (this.tabType === '3') {
          // 计划
          return [
            {
              key: 'showNum',
              title: this.$t('subAccount.order.contactSubTable_type3C1'),
              width: '25%',
            }, // 委托数量/价值
            {
              key: 'showUnderweight',
              title: this.$t('subAccount.order.contactSubTable_type3C2'),
              width: '25%',
            }, // 只减仓
            {
              key: 'showExTime',
              title: this.$t('subAccount.order.contactSubTable_type3C3'),
              width: '25%',
            }, // 止盈止损
            {
              key: 'showTime',
              title: this.$t('subAccount.order.contactSubTable_type3C4'),
              width: '25%',
            }, // 时间
          ];
        }
        if (this.tabType === '2') {
          // 历史
          return [
            {
              key: 'showUnderweight',
              title: this.$t('subAccount.order.contactSubTable_type2C1'),
              width: '25%',
            }, // 只减仓
            {
              key: 'otoOrder',
              title: this.$t('subAccount.order.contactSubTable_type2C2'),
              width: '25%',
            }, // 止盈止损
            {
              key: 'showStatus',
              title: this.$t('subAccount.order.contactSubTable_type2C3'),
              width: '25%',
            }, // 状态
            {
              key: 'showTime',
              title: this.$t('subAccount.order.contactSubTable_type2C4'),
              width: '25%',
            }, // 时间
          ];
        }
        if (this.tabType === '4') {
          // 历史计划
          return [
            {
              key: 'showUnderweight',
              title: this.$t('subAccount.order.contactTable_type4C7'),
              width: '33%',
            }, // 只减仓
            {
              key: 'showTime',
              title: this.$t('subAccount.order.contactTable_type4C9'),
              width: '33%',
            }, // 提交委托时间
            {
              key: 'showTigTime',
              title: this.$t('subAccount.order.contactTable_type4C10'),
              width: '34%',
            }, // 触发时间
          ];
        }
      } else {
        // 杠杆、币币：历史/当前委托都有详情
        if (this.tabType === '2') {
          // 历史委托
          return [
            {
              key: 'subTime',
              title: this.$t('subAccount.order.subTable_type2C1'),
              width: '20%',
            }, // 时间
            {
              key: 'subPrice',
              title: this.$t('subAccount.order.subTable_type2C2'),
              width: '20%',
            }, // 价格
            {
              key: 'subNum',
              title: this.$t('subAccount.order.subTable_type2C3'),
              width: '20%',
            }, // 数量
            {
              key: 'turnover',
              title: this.$t('subAccount.order.subTable_type2C4'),
              width: '20%',
            }, // 成交额
            {
              key: 'free',
              title: this.$t('subAccount.order.contactTable_type5C7'),
              width: '20%',
            }, // 手续费
          ];
        }
        return [
          {
            key: 'created_at',
            title: this.$t('subAccount.order.subTable_type1C1'),
            width: '33%',
          }, // 时间
          {
            key: 'showAverage',
            title: this.$t('subAccount.order.subTable_type1C2'),
            width: '34%',
          }, // 平均成交价
          {
            key: 'been',
            title: this.$t('subAccount.order.subTable_type1C3'),
            width: '33%',
          }, // 已成交/未成交
        ];
      }
      return [];
    },
    selectTypeList() {
      // 类型选择列表
      return [
        { value: this.$t('order.exchangeOrder.sideAll'), code: 0 },
        { value: this.$t('subAccount.order.type1'), code: 'BUY' },
        { value: this.$t('subAccount.order.type2'), code: 'SELL' },
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
        { name: this.$t('subAccount.common.orderType1'), index: 1 },
      ];
      if (this.leverOpen) {
        list.push({ name: this.$t('subAccount.common.orderType2'), index: 2 }); // 杠杆账户 --逐仓
      }
      list.push({ name: this.$t('subAccount.common.orderType4'), index: 3 }); // 合约账户
      return list;
    },
    symbolAll() {
      return this.$store.state.baseData.symbolAll;
    },
    // 是否开启 查询全部币对
    openOrderCollect() {
      if (this.$store.state.baseData.publicInfo) {
        return this.$store.state.baseData.publicInfo.open_order_collect;
      }
      return null;
    },
    // 合约方向列表
    // contractDirectionList() {
    //   return [
    //     { value: this.$t('subAccount.other.text17'), code: 1 }, // usdt合约
    //     { value: this.$t('subAccount.other.text18'), code: 0 }, // 币本位合约
    //   ];
    // },
    // 订单类型
    contractOrderList() {
      if (this.nowType === 3 && this.tabType === '1') { // 当前委托
        return [ // 订单类型列表
          // 全部
          { code: '0', value: this.$t('subAccount.other.text19') },
          // 限价单
          { code: 1, value: this.$t('subAccount.other.text20') },
          // PostOnly
          { code: 5, value: 'postOnly' },
        ];
      }
      if (this.nowType === 3 && this.tabType === '2') { // 历史委托
        return [ // 订单类型列表
        // 全部
          { code: '0', value: this.$t('subAccount.other.text19') },
          // 限价单
          { code: 1, value: this.$t('subAccount.other.text20') },
          // 市价单
          { code: 2, value: this.$t('subAccount.other.text21') },
          // PostOnly
          { code: 5, value: 'PostOnly' },
          // IOC
          { code: 3, value: 'IOC' },
          // FOK
          { code: 4, value: 'FOK' },
        ];
      }
      return [];
    },
    lanText() {
      return {
        newText18: this.$t('futures.orderList.newText18'), // 止盈止损"
        newText19: this.$t('futures.orderList.newText19'), // 知道了"
        newText21: this.$t('futures.orderList.newText21'), // 查看"
        newText22: this.$t('futures.orderList.newText22'), // 止盈"
        newText23: this.$t('futures.orderList.newText23'), // 已生效"
        newText24: this.$t('futures.orderList.newText24'), // 未生效"
        newText25: this.$t('futures.orderList.newText25'), // 止盈触发价"
        newText26: this.$t('futures.orderList.newText26'), // 委托价"
        newText27: this.$t('futures.orderList.newText27'), // 止损"
        newText28: this.$t('futures.orderList.newText28'), // 止损触发价
        mPrice: this.$t('futures.orderList.mPrice'), // 市价
      };
    },
    contractListMap() {
      return this.contractCoinListAll.reduce((pre, cur) => {
        const tempObj = { ...pre };
        tempObj[cur.contractName] = cur;
        return tempObj;
      }, {});
    },
    // 历史委托
    historyMemoText() {
      return [
        this.$t('futures.orderList.memoText1'),
        this.$t('futures.orderList.memoText2'),
        this.$t('futures.orderList.memoText3'),
        this.$t('futures.orderList.memoText4'),
        this.$t('futures.orderList.memoText5'),
        this.$t('futures.orderList.memoText6'),
        this.$t('futures.orderList.memoText7'),
        this.$t('futures.orderList.memoText8'),
      ];
    },
    confirmText() {
      return this.lanText.newText19; // '知道了';
    },
    titleText() {
      return this.lanText.newText18;
    },
    timeRange() {
      return [this.startTime, this.endTime];
    },
  },
};
