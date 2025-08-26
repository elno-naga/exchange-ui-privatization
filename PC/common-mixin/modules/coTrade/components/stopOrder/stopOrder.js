import {
  imgMap,
  colorMap,
  division,
  cut,
  nul,
  fixD,
  thousandsComma,
  getIconPath,
  NPdivision,
  NPnul
} from '@/utils';

export default {
  name: 'stopOrderMode',
  data() {
    return {
      getIconPath,
      imgMap,
      colorMap,
      marginModel: 1,
      tableLoading: false,
      // 是否加载成功
      dialogConfirmLoading: false,
      //  表格数据
      tableDataList: [],
      // 表单
      formData_1: {
        title: '',
        units: this.priceUnit,
        fix: 8,
        errorText: null,
        value: null,
      },
      formData_2: {
        title: '',
        units: this.priceUnit,
        fix: 8,
        errorText: null,
        value: null,
      },
      formData_3: {
        title: '',
        units: '',
        fix: 8,
        errorText: null,
        value: null,
      },
      formData_4: {
        title: '',
        units: this.priceUnit,
        fix: 8,
        errorText: null,
        value: null,
      },
      formData_5: {
        title: '',
        units: this.priceUnit,
        fix: 8,
        errorText: null,
        value: null,
      },
      // 止盈是否是市价
      isMarket_profit: true,
      // 止损是否是市价
      isMarket_loss: true,
      // 止盈数量
      takeProfitCount: null,
      // 止损数量
      stopLossCount: null,
      // 止盈数量列表
      takeProfitList: [],
      // 止损数量列表
      stopLossList: [],
      // 防止重复提交
      sumbitFla: true,
      // 防止重复取消订单
      cancelFla: true,
      // 到期时间
      expireTime: '14',
      // 2小时行情数据WS
      WsData: {},
      // 订单类型 1市价 2限价
      sideType: 1,
      // 是否开启止盈
      isSurplus: true,
      // 是否开启止损
      isLoss: true,
      // 百分比值鼠标移入效果
      percentageVlaueHover: null,
      // 百分比值
      percentageVlaue: null,
    };
  },
  props: {
    isShow: {
      default: false,
      type: Boolean,
    },
    close: {
      default() {},
      type: Function,
    },
    dataInfo: {
      default: () => {},
      type: Object,
    },
  },
  computed: {
    lanText() {
      return {
        titleText: this.$t('futures.stopOrder.titleText'), // '止盈止损',
        text1: this.$t('futures.stopOrder.text1'), // '止盈',
        text2: this.$t('futures.stopOrder.text2'), // '撤销所有止盈单',
        text3: this.$t('futures.stopOrder.text3'), // '止盈价需大于标记价格',
        text4: this.$t('futures.stopOrder.text4'), // '止盈价需小于标记价格',
        text5: this.$t('futures.stopOrder.text5'), // '预计盈亏',
        text6: this.$t('futures.stopOrder.text6'), // '预计收益率',
        text7: this.$t('futures.stopOrder.text7'), // '止损',
        text8: this.$t('futures.stopOrder.text8'), // '撤销所有止损单',
        text9: this.$t('futures.stopOrder.text9'), // '止损价需小于标记价格，大于强平价格',
        text10: this.$t('futures.stopOrder.text10'), // '止损价需大于标记价格，小于强平价格',
        text11: this.$t('futures.stopOrder.text11'), // '预计盈亏',
        text12: this.$t('futures.stopOrder.text12'), // '预计收益率',
        text13: this.$t('futures.stopOrder.text13'), // '止盈触发价',
        text14: this.$t('futures.stopOrder.text14'), // '委托价格',
        text15: this.$t('futures.stopOrder.text15'), // '委托数量',
        text16: this.$t('futures.stopOrder.text16'), // '张',
        text17: this.$t('futures.stopOrder.text17'), // '止损触发价',
        text18: this.$t('futures.stopOrder.text18'), // '委托价格',
        text19: this.$t('futures.stopOrder.text19'), // '量',
        text20: this.$t('futures.stopOrder.text20'), // '价格',
        text21: this.$t('futures.stopOrder.text21'), // '止盈价需大于标记价格！',
        text22: this.$t('futures.stopOrder.text22'), // '止盈价需小于标记价格！',
        text23: this.$t('futures.stopOrder.text23'), // '止损价需小于标记价格！',
        text24: this.$t('futures.stopOrder.text24'), // '止损价需大于强平价格！',
        text25: this.$t('futures.stopOrder.text25'), // '止损价需大于标记价格！',
        text26: this.$t('futures.stopOrder.text26'), // '止损价需小于强平价格！',
        text27: this.$t('futures.stopOrder.text27'), // '价格偏差太大！',
        text28: this.$t('futures.stopOrder.text28'), // '超出可平数量！',
        text29: this.$t('futures.stopOrder.text29'), // '有效期',
        text30: this.$t('futures.stopOrder.text30'), // '市价',
        columns1: this.$t('futures.stopOrder.columns1'), // '合约',
        columns2: this.$t('futures.stopOrder.columns2'), // '仓位/可平',
        columns3: this.$t('futures.stopOrder.columns3'), // '成本价',
        columns4: this.$t('futures.stopOrder.columns4'), // '标记价格',
        columns5: this.$t('futures.stopOrder.columns5'), // '强平价格',
        columns6: this.$t('futures.stopOrder.columns6'), // '止盈触发价',
        columns7: this.$t('futures.stopOrder.columns7'), // '委托价格',
        columns8: this.$t('futures.stopOrder.columns8'), // '委托数量',
        columns9: this.$t('futures.stopOrder.columns9'), // '止损触发价',
        columns10: this.$t('futures.stopOrder.columns10'), // '最新价格',
        time1: this.$t('futures.stopOrder.time1'), // '24H',
        time2: this.$t('futures.stopOrder.time2'), // '7天',
        time3: this.$t('futures.stopOrder.time3'), // '14天',
        time4: this.$t('futures.stopOrder.time4'), // '30天',
        newText1: this.$t('futures.stopOrder.newText1'), // '多',
        newText2: this.$t('futures.stopOrder.newText2'), // '空',
        newText3: this.$t('futures.stopOrder.newText3'), // '当市场价格到达',
        newText4: this.$t('futures.stopOrder.newText4'), // '系统将为你提交一个',
        newText5: this.$t('futures.stopOrder.newText5'), // '市价"
        newText6: this.$t('futures.stopOrder.newText6'), // '限价"
        newText7: this.$t('futures.stopOrder.newText7'), // '平仓单"
        newText8: this.$t('futures.stopOrder.newText8'), // '成交后"
        newText9: this.$t('futures.stopOrder.newText9'), // '预计"
        newText10: this.$t('futures.stopOrder.newText10'), // '可平仓位"
        newText11: this.$t('futures.stopOrder.newText11'), // '止盈委托价"
        newText12: this.$t('futures.stopOrder.newText12'), // '止损委托价"
        newText13: this.$t('futures.stopOrder.newText13'), // '亏损"
        newText14: this.$t('futures.stopOrder.newText14'), // '盈利
        newText15: this.$t('futures.stopOrder.newText15'), // 请至少保留一条订单
      };
    },
    // 用户配置信息
    userConfig() {
      return this.$store.state.future.futureUserConfig;
    },
    // 数量单位类型Number(1标的货币 2张)
    coUnitType() {
      return this.$store.state.future.coUnitType;
    },
    // 合约数量单位
    volUnit() {
      return this.$store.state.future.coUnit;
    },
    // 表头
    columns() {
      // '量 ' : '张'
      // const coUnittext = this.coUnitType === 1 ? this.lanText.text19 : this.lanText.text16;
      return [
        {
          // title: this.dataInfo.name, // '合约币对',
          title: this.dataInfo.contractOtherName, // '合约新名称',
        },
        {
          title: this.lanText.columns3, // '成本价',
        },
        {
          title: this.lanText.columns10, // '最新价格',
        },
        {
          title: this.lanText.columns5, // '强平价格',
        },
      ];
    },
    // 是否禁止提交
    dialogConfirmDisabled() {
      if (!this.formData_3.value) {
        return true;
      }
      if (this.isSurplus) {
        if (!this.formData_1.value || (this.sideType === 2 && !this.formData_2.value)) {
          return true;
        }
      }
      if (this.isLoss) {
        if (!this.formData_4.value || (this.sideType === 2 && !this.formData_5.value)) {
          return true;
        }
      }
      return false;
    },
    // 仓位张数
    positionVolume() {
      // 直接取后台返回的张数
      return this.dataInfo.positionVolumeOriginal;
    },
    // 止盈预计盈亏
    takeAmount() {
      // 预计盈亏
      // 正向合约计算公式
      // 预计盈亏（市价-多仓） =（触发价 - 开仓均价）* 仓位张数 * 面值 / 保证金汇率
      // 预计盈亏（市价-空仓） =（触发价 - 开仓均价）* 仓位张数 * 面值 / 保证金汇率 * -1
      // 预计盈亏（限价-多仓） =（委托价 - 开仓均价）* 仓位张数 * 面值 / 保证金汇率
      // 预计盈亏（限价-空仓） =（委托价 - 开仓均价）* 仓位张数 * 面值 / 保证金汇率 * -1
      // 反向合约计算公式
      // 预计盈亏（市价-多仓） =（1/开仓均价 - 1/触发价）* 仓位张数 * 面值 / 保证金汇率
      // 预计盈亏（市价-空仓） =（1/开仓均价 - 1/触发价）* 仓位张数 * 面值 / 保证金汇率 * -1
      // 预计盈亏（限价-多仓） =（1/开仓均价 - 1/委托价）* 仓位张数 * 面值 / 保证金汇率
      // 预计盈亏（限价-空仓） =（1/开仓均价 - 1/委托价）* 仓位张数 * 面值 / 保证金汇率 * -1
      let value = 0;
      // 开仓均价, 开仓方向、保证金汇率  合约方向(1:正向 0:方向)
      const {
        openAvgPrice, orderSide, marginRate, contractSide,openAvgPriceOld
      } = this.dataInfo;
      // 委托数量
      const volume = this.formData_3.value;
      // 基础价格 （市价：触发价、 限价：委托价）
      const price = this.sideType === 1 ? this.formData_1.value : this.formData_2.value;
      if (!volume || !price) return null;
      // 正向合约
      let V1;
      if (contractSide === 1) {
        // V1 = 基础价格 - 开仓均价
        V1 = cut(price, openAvgPriceOld);
      } else {
        // 反向
        V1 = cut(1 / openAvgPriceOld, 1 / price);
      }
      // V1 * 委托数量 / 保证金汇率
      value = NPdivision(NPnul(V1, this.volumeNumber(volume)), marginRate);
      // 空仓
      if (orderSide === 'SELL') {
        value *= -1;
      }
      return `${fixD(value, this.dataInfo.mCionFix)}`;
    },
    // 止损预计盈亏
    lossAmount() {
      // 预计盈亏
      let value = 0;
      // 开仓均价, 开仓方向、保证金汇率  合约方向(1:正向 0:方向)
      const {
        openAvgPrice, orderSide, marginRate, contractSide,openAvgPriceOld
      } = this.dataInfo;
      // 委托数量
      const volume = this.formData_3.value;
      // 基础价格 （市价：触发价、 限价：委托价）
      const price = this.sideType === 1 ? this.formData_4.value : this.formData_5.value;
      if (!volume || !price) return null;
      // 正向合约
      let V1;
      if (contractSide === 1) {
        // V1 = 基础价格 - 开仓均价
        V1 = cut(price, openAvgPriceOld);
      } else {
        // 反向
        V1 = cut(1 / openAvgPriceOld, 1 / price);
      }
      // V1 * 委托数量 / 保证金汇率
      value = NPdivision(NPnul(V1, this.volumeNumber(volume)), marginRate);
      // 空仓
      if (orderSide === 'SELL') {
        value *= -1;
      }
      return `${fixD(value, this.dataInfo.mCionFix)}`;
    },
    // 获取止盈单最大或者最小触发价
    takeOutProfit() {
      if (!this.takeProfitList.length) return null;
      const { orderSide } = this.dataInfo;
      let value = this.takeProfitList[0];
      this.takeProfitList.forEach((item, i) => {
        const next = this.takeProfitList[i + 1] || {};
        if (orderSide === 'SELL') {
          // 空仓取最大触发价
          value = value.triggerPrice < next.triggerPrice ? next : value;
        } else {
          // 多仓取最小触发价
          value = value.triggerPrice > next.triggerPrice ? next : value;
        }
      });
      return value;
    },
    // 获取止损单最大或者最小触发价
    takeLoss() {
      if (!this.stopLossList.length) return null;
      const { orderSide } = this.dataInfo;
      let value = this.stopLossList[0];
      this.stopLossList.forEach((item, i) => {
        const next = this.stopLossList[i + 1] || {};
        if (orderSide === 'BUY') {
          // 多仓取最大触发价
          value = value.triggerPrice < next.triggerPrice ? next : value;
        } else {
          // 空仓取最小触发价
          value = value.triggerPrice > next.triggerPrice ? next : value;
        }
      });
      return value;
    },
    // 最新价格
    newPrice() {
      if (this.WsData && this.dataInfo && this.dataInfo.symbol) {
        const name = `${this.dataInfo.contractType}_${this.dataInfo.symbol.replace('-', '')}`;
        const kay = name.toLowerCase();

        if (this.WsData && this.WsData[kay]) {
          return this.WsData[kay].close;
        }
        return 0.00;
      }
      return 0.00;
    },
    // 类型（市价、限价）
    sideTypeList() {
      return [
        {
          index: 1,
          name: this.lanText.newText5, //  '市价',
        },
        {
          index: 2,
          name: this.lanText.newText6, //  '限价',
        },
      ];
    },
    // 百分比列表
    percentageList() {
      return [10, 20, 50, 100];
    },
  },
  watch: {
    dataInfo(val) {
      if (val.brokerId) {
        this.initForm();
      }
    },
    isShow() {
      this.initForm();
    },
    'formData_1.value': function formData1(value) {
      if (value && Number(value)) {
        this.formData_1.errorText = null;
      }
    },
    'formData_2.value': function formData2(value) {
      if (value && Number(value)) {
        this.formData_2.errorText = null;
      }
    },
    'formData_3.value': function formData3(value) {
      if (value && Number(value)) {
        this.formData_3.errorText = null;
      }
    },
    'formData_4.value': function formData1(value) {
      if (value && Number(value)) {
        this.formData_4.errorText = null;
      }
    },
    'formData_5.value': function formData2(value) {
      if (value && Number(value)) {
        this.formData_5.errorText = null;
      }
    },
  },
  methods: {
    init() {
      // 接收24小时行情数据
      this.$bus.$on('FUTURE_MARKET_DATA', (data) => {
        this.WsData = JSON.parse(data);
      });
    },
    // 设置精度
    setAmountFix(data) {
      const { priceFix } = this.dataInfo;
      let fix = priceFix + 2;
      if (fix > 8) {
        fix = 8;
      }
      return this.thousandsComma(fixD(data, fix));
    },
    // 设置数字的颜色
    returnColor(vlaue) {
      if (vlaue) {
        if (Number(vlaue) < 0) return 'fall-1-cl';
        if (Number(vlaue) > 0) return 'rise-1-cl';
      }
      return '';
    },
    // 委托数量 = 委托张数 * 合约面值
    volumeNumber(volume) {
      // 如果当前单位是张
      if (this.coUnitType === 2) {
        // 合约面值
        const { multiplier } = this.dataInfo;
        // 转换成量
        return multiplier ? nul(volume, multiplier) : 0;
      }
      return volume;
    },
    // 委托张数 = 委托数量 / 合约面值
    volumeSheet(volume) {
      // 如果当前单位是量
      if (this.coUnitType === 1 && volume) {
        const { multiplier } = this.dataInfo;
        // 转换成张
        return multiplier ? division(volume, multiplier) : 0;
      }
      return volume;
    },
    // 设置表单参数
    initForm() {
      let volUnit = this.dataInfo.multiplierCoin;
      if (this.coUnitType === 2) {
        volUnit = this.lanText.text16; // '张';
      }
      this.formData_1.title = this.lanText.text13; // '止盈触发价';
      this.formData_2.title = this.lanText.newText11; // '止盈委托价';
      this.formData_3.title = this.lanText.text15; // '委托数量';
      this.formData_4.title = this.lanText.text17; // '止损触发价';
      this.formData_5.title = this.lanText.newText12; // '止损委托价';
      this.formData_1.value = null;
      this.formData_2.value = null;
      this.formData_3.value = null;
      this.formData_4.value = null;
      this.formData_5.value = null;
      this.formData_1.errorText = null;
      this.formData_2.errorText = null;
      this.formData_3.errorText = null;
      this.formData_4.errorText = null;
      this.formData_5.errorText = null;
      this.formData_1.units = this.dataInfo.quote;
      this.formData_1.fix = this.dataInfo.priceFix;
      this.formData_2.units = this.dataInfo.quote;
      this.formData_2.fix = this.dataInfo.priceFix;
      this.formData_4.units = this.dataInfo.quote;
      this.formData_4.fix = this.dataInfo.priceFix;
      this.formData_5.units = this.dataInfo.quote;
      this.formData_5.fix = this.dataInfo.priceFix;
      this.formData_3.units = volUnit;
      if (this.coUnitType === 2) {
        this.formData_3.fix = 0;
      } else {
        this.formData_3.fix = this.dataInfo.volfix;
      }
    },
    // 表单输入事件
    changeInput(type, value) {
      this[type].value = value;
      if (type === 'formData_3' && value) {
        const { canCloseVolume } = this.dataInfo;
        const percentage = division(value, canCloseVolume) * 100;
        this.percentageVlaue = percentage;
      }
    },
    // 设置数量（张数和数量的转换）
    setNumber(volume, type) {
      const { multiplier, volfix } = this.dataInfo;
      if (this.coUnitType === 1 && volume && multiplier) {
        // 把量换成张
        if (type === 2) {
          return fixD(division(volume, multiplier), 0);
        }
        // 把张换成量
        return fixD(nul(volume, multiplier), volfix);
      }
      return volume;
    },
    // 表单验证
    formVerify() {
      let flag = true;
      // 非空验证
      if (this.isSurplus && (this.formData_1.value || this.formData_3.value)) {
        if (!this.formData_1.value
          || !this.formData_3.value
          || (!this.formData_2.value && this.sideType === 2)) {
          flag = false;
        }
      }
      if (this.isLoss && (this.formData_4.value || this.formData_3.value)) {
        if (!this.formData_4.value
          || !this.formData_3.value
          || (!this.formData_5.value && this.sideType === 2)) {
          flag = false;
        }
      }
      if (!this.formData_1.value && !this.formData_4.value) {
        flag = false;
      }
      return flag;
    },
    formVerify_v2() {
      const flag = true;
      // 可平数量
      const { canCloseVolume } = this.dataInfo;
      // 验证止损委托价格
      if (this.formData_3.value && canCloseVolume) {
        if (Number(canCloseVolume) < Number(this.formData_3.value)) {
          // 超出可平数量！
          this.$bus.$emit('tip', { text: this.lanText.text28, type: 'error' });
          this.formData_3.errorText = 'true';
          return false;
        }
      }
      return flag;
    },
    // 提交订单
    submit() {
      if (!this.formVerify()) return;
      if (!this.formVerify_v2()) return;
      if (!this.sumbitFla) return;
      this.sumbitFla = false;
      const orderList = [];
      if (this.isSurplus) {
        orderList.push({
          triggerType: 2,
          type: this.sideType === 1 ? 2 : 1,
          price: this.sideType === 1 ? 0 : this.formData_2.value,
          volume: this.setNumber(this.formData_3.value, 2),
          triggerPrice: this.formData_1.value,
        });
      }
      if (this.isLoss) {
        orderList.push({
          triggerType: 1,
          type: this.sideType === 1 ? 2 : 1,
          price: this.sideType === 1 ? 0 : this.formData_5.value,
          volume: this.setNumber(this.formData_3.value, 2),
          triggerPrice: this.formData_4.value,
        });
      }
      const paramsData = {
        contractId: this.dataInfo.contractId,
        positionType: this.dataInfo.positionType,
        leverageLevel: this.dataInfo.leverageLevel,
        side: this.dataInfo.orderSide === 'BUY' ? 'SELL' : 'BUY',
        orderList,
      };
      this.dialogConfirmLoading = true;
      this.axios({
        url: this.$store.state.url.futures.conditionCreate,
        hostType: 'co',
        params: paramsData,
      }).then((data) => {
        if (data.code === '0') {
          this.close();
          this.$bus.$emit('tip', { text: data.msg, type: 'success' });
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
        this.sumbitFla = true;
        this.dialogConfirmLoading = false;
      }).catch(() => {
        this.sumbitFla = true;
        this.dialogConfirmLoading = false;
      });
    },

    thousandsComma(num) {
      if (num) {
        return thousandsComma(num);
      }
      return num;
    },
    // 点击数量百分比
    setPercentageVlaue(value) {
      this.percentageVlaue = value;
      const number = division(this.dataInfo.canCloseVolume, 100 / value);
      this.formData_3.value = fixD(number, this.formData_3.fix);
      // dataInfo.canCloseVolume
    },
    // 选择 到期时间
    selectPlanType(val) {
      this.expireTime = val;
    },
    // 切换类型 市价、限价
    switchType(type, id) {
      if (this[type] !== id) {
        this[type] = id;
      }
    },
    // 多选框选择事件
    checkBoxClick(key) {
      if ((key === 'isSurplus' && !this.isLoss) || (key === 'isLoss' && !this.isSurplus)) {
        this.$bus.$emit('tip', { text: this.lanText.newText15, type: 'error' });
      } else {
        this[key] = !this[key];
      }
    },
    // 鼠标移入
    evenHandMouseenter(key, type) {
      this[key] = type;
    },
    returnTypeText(num) {
      if (num) {
        return Number(num) <= 0 ? this.lanText.newText13 : this.lanText.newText14; // '亏损' : '盈利';
      }
      return num;
    },
    colorTextClasses(num) {
      if (num) {
        return Number(num) <= 0 ? 'fall-1-cl' : 'rise-1-cl';
      }
      return '';
    },
  },
};
