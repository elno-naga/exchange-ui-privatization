/*
@ 持仓列表
@author HDD */
import {
  nul,
  division,
  fixD,
  fixInput,
  thousandsComma,
  myStorage,
  imgMap,
  getIconPath,
  upFixed,
} from '@/utils';

export default {
  name: 'positionList',
  data() {
    return {
      imgMap,
      getIconPath,
      // 修改保证金弹框
      isShowDialog: false,
      formLisValue: {},
      loading: false,
      // 持仓列表
      tableDataList: null,
      // 平仓提交数据
      submitData: {},
      // 修改保证金数据
      editMargindata: {},
      // 二次确认数据
      confirmData: {},
      // 是否显示二次确认弹框
      forcedReminderShow: false,
      // 防止二次提交
      submitFlag: true,
      // 止盈止损弹框
      stopOrderShow: false,
      // 止盈止损张数
      stopOrderdata: {},
      cellWidth: [],
      // class
      activeLineId: '',
      activeLineClass: '',
      // 只显示当前合约开关
      isShowCurPosition: myStorage.get('isShowCurPosition'),
      // 显示已结算盈亏弹框
      isAmountDialog: false,
      // 已结算盈亏弹框数据
      activeAmountData: {},
      // 去掉已结算盈亏弹框的按钮
      ishaveOption: false,
      // positionListNumber: 0,
      // 仓位列表tip隐藏显示
      promptTextShow: false,
      hoverType: null,
      // 百分比值鼠标移入效果
      percentageVlaueHover: null,
      percentageList: [10, 20, 50, 100],
      priceBasisValue: 1,
      interval: null,
      // 提示文案
      itempromptText: '',
      promptLeft: 0,
      promptIndex: 0,
      promptTextShowBox: false,
      promptTextStylw: {
        lefT: 0,
        top: 0,
      },
      startClientY: 0,
      isSubmitIng: false,
      // 提交委托loading 状态
      dialogConfirmLoading: false,
      setTimeTer: null,
      closePositionTabObj: {},
      // 滚动条配置
      ops: {
        rail: {
          gutterOfSide: '0px',
        },
      },
      // adl
      adlLevelList: [1, 2, 3, 4, 5],
      isShowAdlTip: false,
      skeletonList: [0, 1, 2, 3],
      updateDom: '',
    };
  },
  watch: {
    positionList(val) {
      if (val && val.length) {
        this.tableDataList = this.formPosition();
      } else {
        this.tableDataList = null;
      }
      this.setCellWidth();
    },
    userConfig(val, old) {
      if (val && old) {
        this.formLisValue = {};
        this.$store.dispatch('getPriceList', this.originalCoin);
        this.$store.dispatch('getPositionList');
        this.tableDataList = this.formPosition();
      }
    },
    positionListNumber(val) {
      this.$bus.$emit('positionListNumber', val);
    },
    priceBasis(val) {
      this.setCellWidth();
      this.priceBasisValue = val;
    },
    requestFinish(val) {
      if (val) {
        this.loading = false;
      }
    },
    tableDataList(val) {
      if (val) {
        this.loading = false;
      }
    },
    unRealizedAmount() {
      this.tableDataList = this.formPosition();
    },
  },
  computed: {
    intervalTimer() {
      if (this.positionList && this.positionList.length) {
        return 1000;
      }
      return 5000;
    },
    OLBHeight() {
      let height = document.documentElement.clientHeight - 788;
      height = height > 500 ? 500 : height;
      return height < 255 ? 255 : height;
    },
    userInfo() {
      return this.$store.state.baseData.userInfo || {};
    },
    lanText() {
      return {
        columns1: this.$t('futures.positionLis.columns1'),
        columns2: this.$t('futures.positionLis.columns2'),
        columns2_1: this.$t('futures.positionLis.columns2_1'),
        columns3: this.$t('futures.positionLis.columns3'),
        columns4: this.$t('futures.positionLis.columns4'),
        columns5: this.$t('futures.positionLis.columns5'),
        columns6: this.$t('futures.positionLis.columns6'),
        columns7: this.$t('futures.positionLis.columns7'),
        columns8: this.$t('futures.positionLis.columns8'),
        columns8_1: this.$t('futures.positionLis.columns8_1'),
        columns9: this.$t('futures.positionLis.columns9'),
        columns10: this.$t('futures.positionLis.columns10'),
        columns11: this.$t('futures.positionLis.columns11'),
        text1: this.$t('futures.positionLis.text1'),
        text2: this.$t('futures.positionLis.text2'),
        text3: this.$t('futures.positionLis.text3'),
        text4: this.$t('futures.positionLis.text4'),
        text5: this.$t('futures.positionLis.text5'),
        text6: this.$t('futures.positionLis.text6'),
        text7: this.$t('futures.positionLis.text7'),
        text8: this.$t('futures.positionLis.text8'),
        text9: this.$t('futures.positionLis.text9'),
        text10: this.$t('futures.positionLis.text10'),
        text11: this.$t('futures.positionLis.text11'),
        text12: this.$t('futures.positionLis.text12'),
        text13: this.$t('futures.positionLis.text13'),
        text14: this.$t('futures.positionLis.text14'),
        text15: this.$t('futures.positionLis.text15'),
        text16: this.$t('futures.positionLis.text16'),
        text17: this.$t('futures.positionLis.text17'),
        text18: this.$t('futures.positionLis.text18'),
        text19: this.$t('futures.positionLis.text19'),
        text20: this.$t('futures.positionLis.text20'),
        text21: this.$t('futures.positionLis.text21'),
        text22: this.$t('futures.positionLis.text22'),
        text23: this.$t('futures.positionLis.text23'),
        text24: this.$t('futures.positionLis.text24'),
        text25: this.$t('futures.positionLis.text25'),
        text26: this.$t('futures.positionLis.text26'),
        text33: this.$t('futures.positionLis.text33'),
        text34: this.$t('futures.positionLis.text34'),
        text35: this.$t('futures.positionLis.text35'),
        text36: this.$t('futures.positionLis.text36'),
        text37: this.$t('futures.positionLis.text37'),
        text38: this.$t('futures.positionLis.text38'),
        text39: this.$t('futures.positionLis.text39'),
        text40: this.$t('futures.positionLis.text40'),
        text43: this.$t('futures.positionLis.text43'),
      };
    },
    // 市价，限价平仓切换
    tabTitle() {
      return [
        this.$t('futures.stopOrder.newText5'),
        this.$t('futures.stopOrder.newText6'),
      ];
    },
    // 表头
    columns() {
      return [
        {
          title: this.lanText.columns1, // '合约',
        },
        {
          title: this.lanText.text43, // '数量',
          promptText: this.lanText.text40,
        },
        {
          title: this.lanText.columns3, // '成本价',
          promptText: this.lanText.text7,
        },
        {
          title: this.lanText.columns4, // '标记价格',
          promptText: this.lanText.text8,
        },
        {
          title: this.lanText.columns11, // '预估强评价',
          promptText: this.lanText.text9,
        },
        {
          title: this.lanText.columns6, // '占用保证金',
          promptText: this.lanText.text10,
        },
        {
          title: this.lanText.columns7, // '保证金率',
          promptText: this.lanText.text11,
        },
        {
          title: this.lanText.columns8, // '盈亏/收益率',
          promptText: this.lanText.text12,
        },
        // {
        //   title: this.lanText.text26, // '已结算盈亏',
        // },
        {
          title: this.lanText.columns9, // '快速平仓',
          classes: 'close-position',
        },
        {
          title: this.lanText.columns10, // '止盈止损',
          promptText: this.lanText.text13,
        },
      ];
    },
    // 用户配置信息
    userConfig() {
      return this.$store.state.future.futureUserConfig;
    },
    // 合约列表 MAP
    contractListMap() {
      return this.$store.state.future.contractListMap;
    },
    // 当前合约ID
    contractId() {
      return this.$store.state.future.contractId;
    },
    // 当前合约信息
    contractInfo() {
      if (this.$store.state.future.contractInfo) {
        return this.$store.state.future.contractInfo;
      }
      return {};
    },
    // 当前合约保证金币种
    marginCoin() {
      if (this.contractInfo) {
        return this.contractInfo.marginCoin;
      }
      return '';
    },
    // 当前合约保证金币种
    originalCoin() {
      if (this.contractInfo) {
        return this.contractInfo.originalCoin;
      }
      return '';
    },
    // 资产数据 钱包余额 总权益 未实现盈亏
    amountInfoData() {
      return this.$store.state.future.amountInfoData || {};
    },
    // 未实现盈亏
    unRealizedAmount() {
      if (this.amountInfoData && this.amountInfoData.unRealizedAmount) {
        return this.amountInfoData.unRealizedAmount;
      }
      return 0;
    },
    // 持仓列表
    positionList() {
      return this.$store.state.future.positionList || [];
    },
    // 持仓列表 接口请求结束
    requestFinish() {
      return this.$store.state.future.requestFinish || false;
    },
    // 合约数量精度
    volfix() {
      return this.$store.state.future.volfix;
    },
    // 数量单位类型Number（1标的货币 2张）
    coUnitType() {
      return this.$store.state.future.coUnitType;
    },
    // 当前合约面值
    multiplier() {
      return Number(this.$store.state.future.multiplier);
    },
    // 合约数量单位
    volUnit() {
      return this.$store.state.future.coUnit;
    },
    // 合约币对价格精度
    pricefix() {
      return this.$store.state.future.pricefix;
    },

    positionTypeList() {
      // ['', '全仓', '逐仓'];
      return ['', this.lanText.text14, this.lanText.text15];
    },
    // volumePlaceholder() {
    //   // '输入数量' : '输入张数';
    //   return this.coUnitType === 1 ? this.lanText.text24 : this.lanText.text25;
    // },
    positionListNumber() {
      if (this.tableDataList) {
        const keyArr = Object.keys(this.tableDataList);
        return keyArr.length;
      }
      return 0;
    },
    // 标记价格列表
    tagPriceList() {
      return this.$store.state.future.tagPriceList;
    },
    // 0 最新价格  1 标记价格
    priceBasis() {
      return this.userConfig ? this.userConfig.priceBasis : 1;
    },
    // 是否开通了合约交易
    openContract() {
      return this.$store.state.future.openContract;
    },
  },
  methods: {
    // 设置表头单元格的宽度
    setCellWidth() {
      const tdFefsKeys = Object.keys(this.$refs);
      this.cellWidth = [];
      tdFefsKeys.forEach((item) => {
        if (item.indexOf('td') !== -1) {
          if (this.$refs[item][0]) {
            this.cellWidth.push(`${this.$refs[item][0].offsetWidth - 0.5}px`);
          }
        }
      });
    },
    // 当前合约名称
    activeContractName(data) {
      // let name = '';
      // let text = '';
      // if (data) {
      //   const nameText = data.symbol ? data.symbol.replace('-', '') : '';
      //   if (data.contractType !== 'E') {
      //     text = `-${data.marginCoin}`;
      //   }
      //   name = `${nameText}${text}`;
      // }
      // return name;
      let name = '';
      if (data) {
        const nameText = data.contractOtherName ? data.contractOtherName : '';
        name = `${nameText}`;
      }
      return name;
    },
    // 设置精度
    fixDset(value, fix) {
      if (value && fix.toString()) {
        return fixD(value, fix);
      }
      return '0.00';
    },
    // 设置精度 + 符号
    fixDSign(value, fix) {
      if (value && fix.toString()) {
        if (Number(value) > 0) {
          return `+${fixD(value, fix)}`;
        }
        return fixD(value, fix);
      }
      return '0.00';
    },
    // 设置 标的货币单位的数量 还是 张数
    setVolume(vol, fix, multiplier) {
      let volume = vol;
      // 标的货币
      if (this.coUnitType === 1 && multiplier) {
        // 算出标的货币数量（数量 * 合约面值）
        volume = fixD(nul(vol, multiplier), fix);
      }
      return volume;
    },
    // 获取仓位的合约和币对配置的信息
    activeContractInfo(name) {
      if (this.contractListMap) {
        return this.contractListMap[name];
      }
      return null;
    },
    // 换算百分比
    setRate(data) {
      if (data) {
        return `${this.fixDset(nul(data, 100), 2)}%`;
      }
      return '0.00%';
    },
    lineClass(contractId) {
      if (contractId !== this.activeLineId) {
        this.activeLineId = contractId;
        const classes = this.activeLineClass === 'fill-2-bg' ? '' : 'fill-2-bg';
        this.activeLineClass = classes;
        return this.activeLineClass;
      }
      return this.activeLineClass;
    },
    // 格式化持有仓位
    formPosition() {
      const arr = {};
      const activeArr = {};
      if (this.positionList && this.positionList.length) {
        this.positionList.forEach((item) => {
          if (
            !this.isShowCurPosition
            || (this.isShowCurPosition && item.contractId === this.contractId)
          ) {
            this.activeLineId = '';
            this.activeLineClass = '';
            const activeData = this.activeContractInfo(item.contractName);
            if (!activeData) return false;
            const activeName = this.activeContractName(activeData);
            const key = `${activeName}${item.orderSide}`;
            let priceVal = null;
            let volumeVal = null;
            let percentageValue = null;
            let closePositionTabCur = 0;
            let volInputIsFocus = false;
            if (this.formLisValue && this.formLisValue[key]) {
              priceVal = this.formLisValue[key].price;
              volumeVal = this.formLisValue[key].volume;
              percentageValue = this.formLisValue[key].percentageValue;
              closePositionTabCur = this.formLisValue[key].closePositionTabCur || 0;
              volInputIsFocus = this.formLisValue[key].volInputIsFocus || false;
            }
            if (this.closePositionTabObj && this.closePositionTabObj[key]) {
              closePositionTabCur = this.closePositionTabObj[key].closePositionTabCur || 0;
            }
            let sideClass = {
              bg: 'rise-1-bg',
              color: 'rise-1-cl',
            };
            if (item.orderSide === 'SELL') {
              sideClass = {
                bg: 'fall-1-bg',
                color: 'fall-1-cl',
              };
            }
            // 强平价格
            let reducePrice;
            if (item.reducePrice && item.reducePrice <= 0) {
              reducePrice = '--';
            } else {
              reducePrice = this.fixDset(item.reducePrice, activeData.priceFix);
            }
            // 合约面值 ： 张
            const coUnit = this.coUnitType === 1
              ? activeData.multiplierCoin
              : this.lanText.text5; // '张';
            // marginRate
            const obj = {
              positionId: item.id,
              key,
              contractName: item.contractName,
              sideText:
                item.orderSide === 'SELL'
                  ? this.lanText.text16
                  : this.lanText.text17, // '空' : '多',
              // 数量精度
              volfix: activeData.volfix,
              // 价格精度
              priceFix: activeData.priceFix,
              // classs
              lineClass: this.lineClass(item.contractId),
              // 合约名称
              name: activeName,
              // 合约ID
              contractId: item.contractId,
              // 合约币对
              symbol: item.symbol,
              // 买入卖出方向
              orderSide: item.orderSide,
              // 买卖Class
              sideClass,
              // 杠杆
              leverageLevel: item.leverageLevel,
              // 仓位模式（1全仓 2逐仓）
              positionType: item.positionType,
              // 仓位模式文案（1全仓 2逐仓）
              positionTypeText: this.positionTypeList[item.positionType],
              // 数量单位
              coUnit,
              // 张数
              positionVolumeOriginal: item.positionVolume,
              // 合约面值
              multiplier: activeData.multiplier,
              // 仓位数量
              positionVolume: this.setVolume(
                item.positionVolume,
                activeData.volfix,
                activeData.multiplier,
              ),
              // 可平数量
              canCloseVolume: this.setVolume(
                item.canCloseVolume,
                activeData.volfix,
                activeData.multiplier,
              ),
              // 开仓均价
              openAvgPrice: this.fixDset(
                item.openAvgPrice,
                activeData.priceFix,
              ),
              openAvgPriceOld:item.openAvgPrice,//不保留精度的开仓均价
              // 标记价格
              indexPrice: this.fixDset(item.indexPrice, activeData.priceFix),
              // 强平价格
              reducePrice,
              // 保证金
              holdAmount: this.fixDset(item.holdAmount, activeData.mCionFix),
              // 保证金 只有强平价计算使用不保留小数
              holdAmountNew: item.holdAmount,
              // 保证金币种
              marginCoin: activeData.marginCoin,
              // 保证金率
              marginRate: this.setRate(item.marginRate),
              // 盈亏
              openRealizedAmount: this.fixDset(
                item.openRealizedAmount,
                activeData.mCionFix,
              ),
              openRealizedClass:
                item.openRealizedAmount < 0 ? 'fall-1-cl' : 'rise-1-cl',
              // 回报率
              returnRate: this.setRate(item.returnRate),
              returnRateClass: item.returnRate < 0 ? 'fall-1-cl' : 'rise-1-cl',
              // 可用
              canUseAmount: this.fixDset(
                item.canUseAmount,
                activeData.mCionFix,
              ),
              // 可减少保证金
              canSubMarginAmount: this.fixDset(
                item.canSubMarginAmount,
                activeData.mCionFix,
              ),
              // 限价
              price: priceVal,
              volume: volumeVal,
              // 百分比
              percentageValue,
              // 已盈
              realizedAmount: item.realizedAmount,
              // 未盈
              unRealizedAmount: item.unRealizedAmount,
              // 阶梯最低维持保证金率
              keepRate: item.keepRate,
              // 平仓最大手续费率
              maxFeeRate: item.maxFeeRate,
              // 当前合约价格单位
              quote: activeData.quote,
              // 已结算盈亏
              profitRealizedAmount: this.fixDSign(
                item.profitRealizedAmount,
                activeData.mCionFix,
              ),
              // 持仓结算
              settleProfit: this.fixDSign(
                item.settleProfit,
                activeData.mCionFix,
              ),
              // 手续费
              tradeFee: this.fixDSign(item.tradeFee, activeData.mCionFix),
              // 资金费用
              capitalFee:
                item.capitalFee && item.capitalFee !== '0'
                  ? this.fixDSign(item.capitalFee, activeData.mCionFix)
                  : '--',
              // 平仓盈亏
              closeProfit:
                item.closeProfit && item.closeProfit !== '0'
                  ? this.fixDSign(item.closeProfit, activeData.mCionFix)
                  : '--',
              // 分摊金额
              shareAmount:
                item.shareAmount && item.shareAmount !== '0'
                  ? this.fixDSign(item.shareAmount, activeData.mCionFix)
                  : '--',
              // 平仓切换默认值
              closePositionTabCur,
              // 平仓数量百分比 是否显示
              volInputIsFocus,
              // 未实现盈亏
              unrealizedProfitLoss: this.setUnrealizedProfitLoss(activeData, item),
              // ADL
              adlLevel: item.adlLevel ? parseFloat(item.adlLevel) : 0,
            };
            if (this.contractId === item.contractId) {
              activeArr[key] = obj;
            } else {
              arr[key] = obj;
            }
          }
          return false;
        });
      }
      this.setCellWidth();
      this.$store.commit('POSITION_LIST_PRO', activeArr);
      return Object.assign(activeArr, arr);
    },
    // 设置未实现盈亏
    setUnrealizedProfitLoss(activeData, item) {
      // 当前最新标记价格
      let activeTagPrice = 0;
      const activeCionPeice = this.tagPriceList[item.contractName];
      if (activeCionPeice) {
        if (this.priceBasis === 0) {
          activeTagPrice = activeCionPeice.lastPrice;
        } else {
          activeTagPrice = activeCionPeice.tagPrice;
        }
      }
      let value = 0;
      // 开仓均价, 保证金
      const { openAvgPrice, openAmount } = item;
      // 合约面值，保证金汇率
      const { multiplier, marginRate } = activeData;
      if (activeTagPrice) {
      // USDT合约 （contractSide === 1）
        if (activeData.contractSide === 1) {
        // 持仓数量*面值*汇率
          const V1 = nul(nul(item.positionVolume, multiplier), marginRate);
          // 多仓 （当前标记价格-开仓均价
          let V2 = activeTagPrice - openAvgPrice;
          // 空仓 开仓均价-当前标记价格
          if (item.orderSide === 'SELL') {
            V2 = openAvgPrice - activeTagPrice;
          }
          value = V2 * V1;
        } else {
          // 币本位合约
          let S1 = 1;
          let S2 = 1;
          if (item.orderSide === 'BUY') {
            // 持仓数量 *面值/开仓均价
            S1 = division(nul(item.positionVolume, multiplier), openAvgPrice);
            //  持仓数量 *面值/当前标记价格
            S2 = division(nul(item.positionVolume, multiplier), activeTagPrice);
          }
          if (item.orderSide === 'SELL') {
            // 持仓数量 *面值/开仓均价
            S1 = division(nul(item.positionVolume, multiplier), activeTagPrice);
            //  持仓数量 *面值/当前标记价格
            S2 = division(nul(item.positionVolume, multiplier), openAvgPrice);
          }
          value = S1 - S2;
        }
      }
      return {
        value: this.fixDset(value, activeData.mCionFix),
        class: Number(value) < 0 ? 'fall-1-cl' : 'rise-1-cl',
        rate: `${this.fixDset(nul(division(value, openAmount), 100), 2)}%`,
      };
    },
    // 输入平仓价格
    priceChange(e, data) {
      const { value } = e.target;
      const price = fixInput(value, data.priceFix) || '';
      this.$nextTick(() => {
        this.tableDataList[data.key].price = price;
      });
      if (!this.formLisValue[data.key]) {
        this.formLisValue[data.key] = {
          price,
        };
      } else {
        this.formLisValue[data.key].price = price;
      }
    },
    // 输入平仓数量
    volumeChange(e, data) {
      const { value } = e.target;
      const { canCloseVolume } = data;
      let volume = 0;
      if (this.coUnitType === 1) {
        volume = fixInput(value, data.volfix);
      } else {
        volume = fixInput(value, 0);
      }
      this.$nextTick(() => {
        this.tableDataList[data.key].volume = volume;
        this.updateDom = new Date().getTime();
      });
      if (!this.formLisValue[data.key]) {
        this.formLisValue[data.key] = {
          volume,
        };
      } else {
        this.formLisValue[data.key].volume = volume;
      }
      const bfb = (value / canCloseVolume) * 100;
      this.$nextTick(() => {
        this.tableDataList[data.key].percentageValue = bfb;
        this.updateDom = new Date().getTime();
      });
      if (!this.formLisValue[data.key]) {
        this.formLisValue[data.key] = {
          percentageValue: bfb,
        };
      } else {
        this.formLisValue[data.key].percentageValue = bfb;
      }
    },
    // 平仓切换
    handleTabChange(data, index) {
      this.$nextTick(() => {
        this.tableDataList[data.key].closePositionTabCur = index;
        this.closePositionTabObj[data.key] = {
          closePositionTabCur: index,
        };
      });
      if (!this.formLisValue[data.key]) {
        this.formLisValue[data.key] = {
          closePositionTabCur: index,
        };
      } else {
        this.formLisValue[data.key].closePositionTabCur = index;
      }
      this.updateDom = new Date().getTime();
    },
    // 平仓提交
    closeOrder(type, data) {
      const { canCloseVolume, volume, price } = data;
      if (!price && type === 1) {
        // 请输入价格
        this.$bus.$emit('tip', { text: this.lanText.text18, type: 'error' });
        return false;
      }
      if (!volume) {
        // 请输入数量
        this.$bus.$emit('tip', { text: this.lanText.text19, type: 'error' });
        return false;
      }
      if (Number(volume) > Number(canCloseVolume)) {
        // 超出可平数量
        this.$bus.$emit('tip', { text: this.lanText.text20, type: 'error' });
        return false;
      }

      let submitVolume = volume;
      // 计算提交时 使用的数量[张]
      if (this.coUnitType === 1) {
        submitVolume = fixD(division(volume, data.multiplier), 0);
      }
      let orderUnit; // 传给后端 币、张、价值
      if (this.coUnitType === 1) {
        orderUnit = 2;
      } else if (this.coUnitType === 2) {
        orderUnit = 0;
      }
      this.submitData = {
        contractId: data.contractId, // 合约ID
        positionType: data.positionType, // 持仓类型(1 全仓，2 仓逐)
        side: data.orderSide === 'SELL' ? 'BUY' : 'SELL', // 买卖方向（buy 买入，sell 卖出）
        leverageLevel: data.leverageLevel, // 杠杆倍数
        price, // 平仓价格(市价单传0)
        volume: submitVolume, // 平仓数量
        open: 'CLOSE',
        type, // 订单类型 (1 limit， 2 market)
        triggerPrice: null,
        isConditionOrder: false, // 是否是条件单
        orderUnit, // 0 zhang 1价值  2币
      };
      // 判断用户是否设置了开启二次确认
      if (this.userConfig && this.userConfig.pcSecondConfirm) {
        // 确认按钮class
        let sideClass = 'fall-1-bg';
        let sideText = this.lanText.text21; // '卖出平多';
        if (data.orderSide === 'SELL') {
          sideText = this.lanText.text22; // '买入平空';
          sideClass = 'rise-1-bg';
        }

        this.confirmData = {
          // 价格
          price: type === 1 ? `${price} ${data.quote}` : this.lanText.text23, // '市价',
          //  数量
          vol: `${volume} ${data.coUnit}`,
          // 保证金
          marginCoin: `0.00 ${data.marginCoin}`,
          // 币种
          // symbol: data.symbol.replace('-', ''),
          symbol: data.name,
          // 订单类型Number（1限价单、2市价单、3条件单）
          currentCategory: type,
          // 确认按钮文案（买入做多...）
          sideText,
          // 确认按钮颜色class
          sideClass,
          // 是否是开仓市价单
          isOpenAndIsMarket: false,
          // 条件单 触发价
          triggerPrice: '',
        };
        this.forcedReminderShow = true;
      } else {
        this.dialogConfirmLoading = true;
        this.submit();
      }

      return false;
    },
    // 下单提交
    submit() {
      if (this.submitFlag) {
        this.submitFlag = false;
        this.axios({
          url: this.$store.state.url.futures.orderCreate,
          hostType: 'co',
          method: 'post',
          params: this.submitData,
        })
          .then(({ code, msg }) => {
            if (code.toString() === '0') {
              this.formLisValue = {};
              this.$store.dispatch('getUserConfig');
              this.forcedReminderShow = false;
              setTimeout(() => {
                this.$store.dispatch('getUserConfig');
                this.$store.dispatch('getPositionList');
                this.$bus.$emit('CRAET-ORDER-SUCCESS');
              }, 1000);
              this.$bus.$emit('tip', { text: msg, type: 'success' });
            } else {
              this.$bus.$emit('tip', { text: msg, type: 'error' });
            }
            this.dialogConfirmLoading = false;
            this.submitFlag = true;
          })
          .catch(() => {
            this.dialogConfirmLoading = false;
            this.submitFlag = true;
          });
      }
    },
    // 下单二次确认提交
    submitOrder(data) {
      // 如果勾选了下次不再提醒
      if (data) {
        this.axios({
          url: this.$store.state.url.futures.editUserPageConfig,
          hostType: 'co',
          method: 'post',
          params: {
            pcSecondConfirm: 0,
            contractId: this.contractId,
          },
        }).then(({ code, msg }) => {
          if (code.toString() === '0') {
            this.$store.dispatch('getUserConfig');
          } else {
            this.$bus.$emit('tip', { text: msg, type: 'error' });
          }
        });
      }
      this.dialogConfirmLoading = true;
      this.submit();
    },
    // 显示保证金弹框
    openMarginDialog(item) {
      const activeData = this.activeContractInfo(item.contractName);
      const obj = { ...item, ...activeData };
      this.editMargindata = obj;
      this.isShowDialog = true;
    },
    // 显示止盈止损弹框
    showStopOrder(item) {
      const activeData = this.activeContractInfo(item.contractName);
      const obj = { ...item, ...activeData };
      this.stopOrderdata = obj;
      this.stopOrderShow = true;
    },
    // 弹框取消
    dialogClose() {
      this.isShowDialog = false;
      // 关闭强制提醒（二次确认）弹框
      this.forcedReminderShow = false;
      // 关闭 止盈止损弹框
      this.stopOrderShow = false;
      // 关闭 已结算盈亏弹框
      this.isAmountDialog = false;
    },
    thousandsComma(num) {
      if (num) {
        return thousandsComma(num);
      }
      return num;
    },
    // 显示已结算盈亏弹框
    isShowAmountDialog(data) {
      this.activeAmountData = data;
      this.isAmountDialog = true;
    },
    // 已结算盈亏颜色
    profitClass(val) {
      if (val) {
        if (val.indexOf('+') > -1) {
          return 'rise-1-cl';
        }
        return 'fall-1-cl';
      }
      return 'text-1-cl';
    },
    // 快速平仓选择百分比
    percentageValue(index, data) {
      const { canCloseVolume } = data;
      let num = nul(canCloseVolume, (index / 100));
      if (this.coUnitType === 2) {
        num = Math.ceil(num);
      } else if (index < 100) {
        num = upFixed(num, data.volfix);
      }
      this.volumeChange({ target: { value: num } }, data);
      this.$nextTick(() => {
        this.tableDataList[data.key].percentageValue = index;
      });
      if (!this.formLisValue[data.key]) {
        this.formLisValue[data.key] = {
          percentageValue: index,
        };
      } else {
        this.formLisValue[data.key].percentageValue = index;
      }
    },
    delPercentageValue(e, data) {
      this.$nextTick(() => {
        this.tableDataList[data.key].percentageValue = null;
        this.tableDataList[data.key].volume = null;
      });
      this.formLisValue[data.key].percentageValue = null;
      this.formLisValue[data.key].volume = null;
    },
    init() {
      this.intervalGetPriceList();
      this.priceBasisValue = this.priceBasis;
      this.$bus.$emit('positionListNumber', this.positionListNumber);
      if (myStorage.get('isShowCurPosition') === undefined) {
        this.isShowCurPosition = true;
      }
      if (this.positionList && this.positionList.length) {
        this.tableDataList = this.formPosition();
      } else {
        this.tableDataList = null;
      }
      setTimeout(() => {
        this.setCellWidth();
      }, 0);
      // 监听 浏览器窗口大小改变
      this.$bus.$on('WINFOW_ON_RESIIZE', () => {
        this.setCellWidth();
      });
      // 监听 只显示当前合约
      this.$bus.$on('isShowCurPosition', (data) => {
        this.isShowCurPosition = data;
        this.tableDataList = this.formPosition();
      });
    },
    evenHandMouseenter(key, type) {
      this[key] = type;
    },
    evenHandMouseleave(key) {
      this[key] = null;
    },
    inputIsfocus(type, data) {
      if (type) {
        this.$nextTick(() => {
          this.tableDataList[data.key].volInputIsFocus = type;
          this.updateDom = new Date().getTime();
        });
        if (!this.formLisValue[data.key]) {
          this.formLisValue[data.key] = {
            volInputIsFocus: type,
          };
        } else {
          this.formLisValue[data.key].volInputIsFocus = type;
        }
      } else {
        setTimeout(() => {
          this.$nextTick(() => {
            this.tableDataList[data.key].volInputIsFocus = type;
            this.updateDom = new Date().getTime();
          });
          if (!this.formLisValue[data.key]) {
            this.formLisValue[data.key] = {
              volInputIsFocus: type,
            };
          } else {
            this.formLisValue[data.key].volInputIsFocus = type;
            this.updateDom = new Date().getTime();
          }
        }, 300);
      }
    },
    // 切换事件
    redioChange(value) {
      if (this.priceBasisValue !== value && !this.isSubmitIng) {
        this.isSubmitIng = true;
        this.axios({
          url: this.$store.state.url.futures.editUserPageConfig,
          hostType: 'co',
          method: 'post',
          params: {
            priceBasis: value,
            contractId: this.contractId,
          },
        }).then(({ code, msg }) => {
          if (code.toString() === '0') {
            this.priceBasisValue = value;
            this.$store.dispatch('getUserConfig');
            this.$bus.$emit('tip', { text: msg, type: 'success' });
          } else {
            this.$bus.$emit('tip', { text: msg, type: 'error' });
          }
          this.isSubmitIng = false;
        });
      }
    },
    // 轮训获取标记价格
    intervalGetPriceList() {
      clearInterval(this.interval);
      this.$store.dispatch('getPriceList', this.originalCoin);
      this.interval = setInterval(() => {
        if (this.openContract) {
          this.$store.dispatch('getPriceList', this.originalCoin);
        }
      }, this.intervalTimer);
    },
    mouseenterEvent(event, item, index) {
      if (item.promptText) {
        this.itempromptText = item.promptText;
        this.promptIndex = index;
        const itemF = document.querySelector(`#thead-box > .cell:nth-child(${index + 1})`);
        this.promptLeft = itemF.getBoundingClientRect().x;
        if (index > 7) {
          this.promptLeft -= 120;
        }
        this.promptTextStylw = {
          left: `${this.promptLeft}px`,
          bottom: `${this.OLBHeight + 40}px`,
        };
        const oevent = event || window.event;
        this.startClientY = oevent.clientY;
        this.setTimeTer = setTimeout(() => {
          this.promptTextShow = true;
        }, 600);
      } else {
        clearTimeout(this.setTimeTer);
        this.promptTextShow = false;
      }
    },
    mouseleaveEvent(event) {
      clearTimeout(this.setTimeTer);
      const oevent = event || window.event;
      const entclientY = oevent.clientY;
      const entclientX = oevent.clientX - 10;
      if (this.startClientY < entclientY || entclientX < this.promptLeft) {
        this.promptTextShow = false;
      }
    },
    mouseenterEventBox() {
      this.promptTextShow = true;
    },
    mouseleaveEventBox() {
      clearTimeout(this.setTimeTer);
      this.promptTextShow = false;
    },
    // 快速平仓 可平提示文案
    volumePlaceholder(item) {
      // '输入数量' : '输入张数';
      return `${item.canCloseVolume} ${this.coUnitType === 1 ? item.coUnit : this.lanText.text5}`;
    },
  },
  destroyed() {
    clearInterval(this.interval);
    this.loading = true;
  },
};
