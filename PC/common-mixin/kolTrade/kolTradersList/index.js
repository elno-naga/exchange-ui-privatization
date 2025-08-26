import {
  imgMap, colorMap, fixD, getCoinShowName, fixInput, formatTime, getIconPath,
} from '@/utils';

export default {
  name: 'kolTrade',
  data() {
    return {
      getIconPath,
      imgMap,
      colorMap,
      currentTab: 1, // 收益额1,收益率2,胜率3,跟单人数4
      currentType: 1, // 表格视图1,方块视图2
      tabelLoading: false, // 表格加载中
      listArr: [], // 列表数据（两种视图的）
      paginationObj: {
        total: 0, // 数据总条数
        display: 9, // 每页显示条数
        currentPage: 1, // 当前页码
      },
      followSetFlag: false, // 跟单设置弹框是否显示
      // currentUserInfo: {},
      user_name: '',
      uid: '',
      date_diff: '', // 入住天数
      rate: '', // 盈利分成
      profit_rate: '', // 累计收益率
      win_rate_week: '', // 近两周交易胜率
      profit_amount: '', // 总收益
      win_rate: '', // 交易胜率
      order_number: '', // 交易笔数
      total_number: '', // 跟单人数
      order_frequency: '', // 交易频次
      position_status: '', // 持仓状态
      label: '', // 签名
      is_share: '', // 是否开启分享
      amount: '', // 跟单金额
      minAmount: '10',
      maxAmount: '1000',
      img_url: '',
      share_rate: '',
      follow_status: 0,
      coinSelectList: [
        // { key: 'USDT', value: 'USDT', active: true },
        // { key: 'BTC', value: 'BTC', active: false },
        // { key: 'ETH', value: 'USDT', active: false }
      ],
      coinListObj: {},
      symbolSelectList: [
        // { key: 'USET/BTC', value: 'USET/BTC', active: true },
        // { key: 'AA/BTC', value: 'AA/BTC', active: false },
        // { key: 'ETH/USDT', value: 'ETH/USDT', active: false },
        // { key: 'USET/BTC', value: 'USET/BTC', active: true },
        // { key: 'AA/BTC', value: 'AA/BTC', active: false },
        // { key: 'ETH/USDT', value: 'ETH/USDT', active: false },
      ],
      symbolObj: {},
      isOpenScale: 0, // 跟单模式开关
      followTypeMod: 1, // 跟单模式 1.固定 2.比例
      loss: '50', // 止损
      lossActive: true, // 止损超过选择
      profit: '50', // 盈利
      profitActive: true, // 盈利超过选择
      confirmFollowFlag: false, // 风险提示弹框是否显示
      isAgree: false, // 是否同意条款
      dialogConfirmLoading: false, // 二次点击
      // isFirst: 1, // 是否是首次（暂时废弃）
      kolTraderInfoFlag: false, // 带单人详情弹框是否显示
      currentInfoTab: 1, // 带单人详情- 带单概况1， 带单人详情- 历史带单2
      hisData: [], // 带单人详情- 历史带单列表
      fixObj: {},
      isSearchFocus: false, // 搜索
      listfilter: '', // 搜索内容
      confirmTextFollow: '', // 带单详情文案
      confirmTextFollowDdis: false, // 带单详情按钮
    };
  },
  props: {
    // 是否是带单人
    isKol: {
      default: false,
      type: Boolean,
    },
  },
  filters: {
    // 格式化时间
    formatTimeFn(date) {
      if (date) {
        return formatTime(date);
      }
      return '--';
    },
    // 百分号
    rateFiter(v) {
      let str = '';
      if (Number(v) >= 0) {
        str = `+${v}`;
      } else {
        str = v;
      }
      return `${str}%`;
    },
  },
  computed: {
    // companyId() {
    //   return this.$store.state.baseData.publicInfo
    //     && this.$store.state.baseData.publicInfo.msg
    //     && this.$store.state.baseData.publicInfo.msg.companyId;
    // },
    market() {
      return this.$store.state.baseData.market;
    },
    isLogin() {
      return this.$store.state.baseData.isLogin;
    },
    // 用户信息
    userInfo() {
      return this.$store.state.baseData.userInfo;
    },
    // tab 收益额1,收益率2,胜率3,跟单人数4
    buttonList() {
      return {
        selected: this.currentTab,
        list: [
          { text: this.$t('kol.newKol2.text5'), id: 1 },
          { text: this.$t('kol.newKol2.text6'), id: 2 },
          { text: this.$t('kol.newKol2.text7'), id: 3 },
          { text: this.$t('kol.kolTradePc.text35'), id: 4 },
        ],
      };
    },
    // 表头
    columns() {
      return [
        {
          title: this.$t('kol.kolTradePc.text65'), key: 'user_name', width: '20%', align: 'left',
        },
        {
          title: this.$t('kol.newKol2.text6'), key: 'profit_rate', width: '15%', align: 'center',
        },
        {
          title: this.$t('kol.newKol2.text5'), key: 'profit_amount', width: '15%', align: 'center',
        },
        {
          title: this.$t('kol.newKol2.text7'), key: 'win_rate_week', width: '15%', align: 'center',
        },
        {
          title: this.$t('kol.kolTradePc.text35'), key: 'current_number', width: '15%', align: 'center',
        },
        {
          title: this.$t('kol.kolTradePc.text67'), key: 'operation', width: '20%', align: 'right',
        },
      ];
    },
    // 选中
    activeCoin() {
      let active = '';
      this.coinSelectList.forEach((item) => {
        if (item.active) {
          active = item.value;
        }
      });
      return active;
    },
    // 跟单-单位，现货可用
    nowActiveMess() {
      let obj = {};
      if (this.coinListObj[this.activeCoin]) {
        obj = this.coinListObj[this.activeCoin];
      }
      return obj;
    },
    //
    fix() {
      let fix = 2;
      if (this.nowActiveMess.type === 0) {
        fix = 4;
      }
      return fix;
    },
    amountText() {
      // 限额
      return `${this.$t('kol.kolTradersSet.t17')}：${fixD(
        this.minAmount,
        this.fix,
      )} - ${fixD(this.maxAmount, this.fix)}`;
    },
    amountError() {
      // amount
      const amount = this.amount * 1;
      const min = this.minAmount * 1;
      const max = this.maxAmount * 1;
      const haveAmount = this.nowActiveMess.amount * 1;
      const obj = {
        flag: false,
        text: '',
      };
      // 不可大于可用余额
      if (this.nowActiveMess.type === 0 && haveAmount < amount) {
        obj.text = `${this.$t('kol.kolTradersSet.t20')}`;
        obj.flag = true;
      }
      // 下单范围
      if (this.amount.length && (amount < min || amount > max)) {
        obj.text = `${this.$t('kol.kolTradersSet.t21')} ${this.fixFn(
          min,
        )} - ${this.fixFn(max)}`;
        obj.flag = true;
      }
      // if (!this.amount.length) {
      //   obj.flag = false;
      // }
      return obj;
    },
    lossError() {
      // loss
      const loss = this.loss * 1;
      const min = 0 * 1;
      const max = 90 * 1;
      const obj = {
        flag: false,
        str: '',
      };
      if (this.loss.length && (loss < min || loss > max)) {
        // 止损范围
        obj.str = `${this.$t('kol.kolTradersSet.t18')} ${fixD(
          min,
          0,
        )}% - ${fixD(max, 0)}%`;
        obj.flag = true;
      }
      // if (!this.loss.length) {
      //   obj.flag = false;
      // }
      return obj;
    },
    profitError() {
      // profit
      const profit = this.profit * 1;
      const min = 0 * 1;
      const max = 500 * 1;
      const obj = {
        flag: false,
        str: '',
      };
      // 止盈范围
      if (this.profit.length && (profit < min || profit > max)) {
        obj.str = `${this.$t('kol.kolTradersSet.t19')} ${fixD(
          min,
          0,
        )}% - ${fixD(max, 0)}%`;
        obj.flag = true;
      }
      // if (!this.profit.length) {
      //   obj.flag = false;
      // }
      return obj;
    },
    navTab() {
      const arr = [
        { name: this.$t('kol.kolTradePc.text68'), index: 1 },
        { name: this.$t('kol.kolTradePc.text69'), index: 2 },
      ];
      return arr;
    },
    // 开始跟单按钮-Disabled
    followSetConfirmBtn() {
      let flag = false;
      if (this.symbolSelectList.findIndex((target) => target.active === true) === -1
      ) {
        flag = true;
      }
      if (!this.amount || this.amountError.flag) {
        flag = true;
      }
      if ((this.lossActive && !this.loss) || this.lossError.flag) {
        flag = true;
      }
      if ((this.profitActive && !this.profit) || this.profitError.flag) {
        flag = true;
      }
      return flag;
    },
    // 我的跟单记录，我的带单记录
    myRewrad() {
      if (this.isKol) {
        return this.$t('kol.kolTradePc.text49');
      }
      return this.$t('kol.kolTradePc.text39');
    },
    // 所有币对
    allChecked() {
      if (this.symbolSelectList.findIndex((target) => target.active === false) === -1) {
        return true;
      }
      return false;
    },
  },
  watch: {
    // isLogin(v) {
    //   if (v) {
    //     this.getIsKol();
    //   }
    // },
    // 跟单金额
    amount(v) {
      this.$nextTick(() => {
        this.amount = fixInput(v, this.fix);
      });
    },
    loss(v) {
      this.$nextTick(() => {
        this.loss = fixInput(v, 0);
      });
    },
    profit(v) {
      this.$nextTick(() => {
        this.profit = fixInput(v, 0);
      });
    },
    listfilter() {
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        this.getList();
      }, 1000);
    },
  },
  mounted() {
    this.getList();
  },
  methods: {
    init() {

    },
    copyShare() {
      const { userInfo } = this.$store.state.baseData;
      this.copy(userInfo.inviteUrl);
    },
    copy(str) {
      this.$bus.$emit('tip', {
        text: this.$t('personal.prompt.copySucces'), type: 'success', backgroundColor: '#F6F8FF', textColor: '#16181d',
      });
      function save(e) {
        e.clipboardData.setData('text/plain', str); // 下面会说到clipboardData对象
        e.preventDefault(); // 阻止默认行为
      }
      document.addEventListener('copy', save);
      document.execCommand('copy'); // 使文档处于可编辑状态，否则无效
      document.removeEventListener('copy', save);
    },
    fixFn(v) {
      return fixD(v, this.fix);
    },
    // 切换 收益额1,收益率2,胜率3,跟单人数4
    changeTab(id) {
      this.currentTab = id;
      this.paginationObj.currentPage = 1;
      this.listArr = [];
      this.getList();
    },
    // 切换 表格视图1,方块视图2
    changType(val) {
      this.currentType = val;
      this.getList();
    },
    myOrder() {
      // this.currentType = 'myOrder';
      this.$bus.$emit('myOrder', true);
    },
    // 获取列表数据
    getList() {
      this.tabelLoading = false;
      this.axios({
        url: 'v2/kol/list',
        hostType: 'coFollow',
        method: 'post',
        params: {
          page: this.paginationObj.currentPage,
          pageSize: this.paginationObj.display,
          orderByType: this.buttonList.selected,
          nickName: this.listfilter,
        },
      }).then((data) => {
        if (data.code === '0' || data.code === 0) {
          this.paginationObj.total = data.data.count;
          this.isOpenScale = data.data.isOpenScale;
          const arr = [];
          if (data.data.list) {
            data.data.list.forEach((item, index) => {
              // console.log(item,index)
              let obj = {};
              obj = item;
              obj.index = index;
              arr.push(obj);
            });
          }
          this.listArr = arr;
          this.optionBox = {};
          this.listArr.forEach((item, index) => {
            this.optionBox[index] = {
              textStyle: {
                fontFamily: 'DINPro-Medium',
              },
              xAxis: {
                type: 'category',
                data: [],
                axisLabel: {
                  textStyle: {
                    // x轴文字颜色
                    color: colorMap['text-2-cl'],
                  },
                },
                show: false,
                axisLine: {
                  show: false, // 坐标轴线不显示
                },
                axisTick: {
                  // 坐标轴刻度不显示
                  show: false,
                },
              },
              yAxis: {
                type: 'value',
                axisLabel: {
                  textStyle: {
                    // y轴文字颜色
                    color: colorMap['text-2-cl'],
                  },
                },
                show: false,
                axisLine: {
                  show: false, // 坐标轴线不显示
                },
                splitLine: {
                  // 坐标轴内线的样式
                  lineStyle: {
                    color: colorMap['fill-6-bd'],
                    type: 'dashed',
                  },
                },
                axisTick: {
                  // 坐标轴刻度不显示
                  show: false,
                },
                splitNumber: 0,
              },
              grid: {
                left: '0%',
                right: '0%',
                bottom: '0%',
                width: '96%',
                height: '85%',
                containLabel: true,
              },
              series: [
                {
                  data: item.profitRateList,
                  smooth: true,
                  type: 'line',
                  showSymbol: false,
                  // symbol: 'circle', // 设置标记的图形为circle
                  // normal: {
                  //   lineStyle: {
                  //     color: '#2762FF', // 圆点颜色
                  //   },
                  // },
                  areaStyle: {
                    color: {
                      type: 'linear',
                      x: 0,
                      y: 0,
                      x2: 0,
                      y2: 1,
                      colorStops: [
                        {
                          offset: 0,
                          color: 'rgba(39,98,255,0.40)', // 0% 处的颜色
                        },
                        {
                          offset: 1,
                          color: 'rgba(39,98,255,0.00)', //
                        },
                      ],
                      global: false, // 缺省为 false
                    },
                  },
                },
              ],
              color: [
                // 折线颜色
                '#2762FF',
              ],
              // tooltip: {
              //   trigger: 'axis',
              //   axisPointer: {
              //     type: 'none',
              //   },
              //   backgroundColor: colorMap['fill-3-cl'],
              //   extraCssText: 'box-shadow: 0px 3px 4px 1px rgba(0,0,0,0.18);',
              //   padding: 12,
              //   position(pos, params, dom, rect, size) {
              //     const obj = {
              //       top: pos[1] - size.contentSize[1] - 10,
              //       left: pos[0] - size.contentSize[0] / 2,
              //     };
              //     return obj;
              //   },
              //   textStyle: {
              //     color: colorMap['text-1-cl'],
              //     fontSize: 12,
              //     lineHeight: 18,
              //   },
              //   formatter: (param) => {
              //     const circle = `<span style="display: inline-block;vertical-align: middle;width: 6px;height: 6px;border-radius: 100%;background-color: ${'#2762FF'};margin-right: 4px;"></span>`;
              //     const triangle = `
              //       <div style="position: absolute; left: 45%;bottom: -10px;border: 6px solid transparent;border-top-color: ${colorMap['fill-3-cl']}"></div>
              //     `;
              //     return `${param[0].name} <br/>${circle} ${this.langLogo} ${this.thousands(param[0].value)}${triangle}`;
              //   },
              // },
            };
          });
        } else {
          this.$bus.$emit('tip', {
            text: data.msg, type: 'error', backgroundColor: '#F6F8FF', textColor: '#16181d',
          });
        }
        this.tabelLoading = false;
      });
    },
    // 翻页
    pageChange(v) {
      this.paginationObj.currentPage = v;
      this.getList();
    },
    // 颜色，红|绿
    rateClass(v) {
      let str = 'fall-1-cl';
      if (Number(v) >= 0) {
        str = 'rise-1-cl';
      }
      return str;
    },
    // 精度处理
    fixNumber(val, fix) {
      // const showPrecision = this.coinList[fix] ? this.coinList[fix].showPrecision : 8;
      return fixD(val, fix);
    },
    // 跟单弹窗
    follow(item) {
      if (!this.isLogin) {
        this.$router.push('/login');
        return;
      }
      this.followSetFlag = true;
      this.img_url = item.img_url;
      this.getDteData(item.uid);
      this.getSymbolList(item.uid);
      this.uid = item.uid;
    },
    // 关闭跟单弹窗
    closeFollowSet() {
      this.followSetFlag = false;
      this.amount = '';
      this.followTypeMod = 1; // 跟单模式 1.固定 2.比例
      this.loss = '50'; // 亏损
      this.lossActive = true;
      this.profit = '50'; // 盈利
      this.profitActive = true;
      this.uid = '';
    },
    // 跟单人信息
    getDteData(uid) {
      this.axios({
        url: 'v2/kol/info',
        hostType: 'coFollow',
        params: {
          uid,
        },
        method: 'post',
      }).then((data) => {
        if (data.code.toString() === '0') {
          const { info } = data.data;
          this.minAmount = info.single_min_amount;
          this.maxAmount = info.single_max_amount;
          this.user_name = info.user_name;
          this.date_diff = info.date_diff; // 入住天数
          this.rate = info.rate; // 盈利分成
          this.profit_rate = info.profit_rate; // 累计收益率
          this.win_rate_week = info.win_rate_week; // 近两周交易胜率
          this.profit_amount = info.profit_amount; // 总收益
          this.win_rate = info.win_rate; // 交易胜率
          this.order_number = info.order_number; // 交易笔数
          this.total_number = info.total_number; // 跟单人数
          this.order_frequency = info.order_frequency; // 交易频次
          this.follow_status = info.follow_status; // 是否对次跟单
          this.position_status = info.position_status; // 持仓状态
          this.label = info.label; // 签名
          this.is_share = info.is_share; // 是否开启分享
          this.img_url = info.img_url;
          this.share_rate = info.share_rate;
          this.loadingFlag = false;
          if (this.follow_status === 1) {
            this.confirmTextFollowDdis = true;
            this.confirmTextFollow = this.$t('kol.kolTradePc.text14');
          } else if (info.switchFollowerNumber === 2) {
            // 满员
            this.confirmTextFollow = this.$t('kol.kolTradePc.text15');
            this.confirmTextFollowDdis = true;
          } else if (this.follow_status === 0) {
            this.confirmTextFollowDdis = false;
            this.confirmTextFollow = this.$t('kol.kolTradePc.text30');
          }
        } else {
          this.$bus.$emit('tip', {
            text: data.msg, type: 'error', backgroundColor: '#F6F8FF', textColor: '#16181d',
          });
        }
      });
    },

    // 选择跟单合约
    symbolSelect(coin, index) {
      if (coin.active) {
        this.symbolSelectList[index].active = false;
      } else {
        this.symbolSelectList[index].active = true;
      }
    },
    // 所有币对
    checkAll() {
      this.symbolSelectList.forEach((item) => {
        // eslint-disable-next-line no-param-reassign
        item.active = true;
      });
    },
    // 所有币对
    cancelAll() {
      this.symbolSelectList.forEach((item) => {
        // eslint-disable-next-line no-param-reassign
        item.active = false;
      });
    },
    // 获取合约列表
    getSymbolList(uid) {
      this.axios({
        url: 'v2/kol/symbol_info',
        hostType: 'coFollow',
        params: {
          uid,
        },
        method: 'post',
      }).then((data) => {
        if (data.code === '0' || data.code === 0) {
          // data.data.coinList = [
          //   { coin: "BTC", type: 1, amount: 100 },
          //   { coin: "EXUSD", type: 1, amount: 0 },
          //   { coin: "ETH", type: 0, amount: 500 }
          // ];
          // data.data.symbolList = [
          //   { symbol: "BTCUSD[BTC]", instrumentId: 6, marginCoin: "BTC" },
          //   { symbol: "BTCAAA[BTC]", instrumentId: 8, marginCoin: "BTC" },
          //   { symbol: "BTCABC[BTC]", instrumentId: 9, marginCoin: "BTC" },
          //   { symbol: "ETHUSD[ETH]", instrumentId: 7, marginCoin: "ETH" },
          //   { symbol: "BTCEXUSD", instrumentId: 22, marginCoin: "EXUSD" }
          // ];
          const symbolObj = {};
          const { coinList } = this.market;
          data.data.symbolList.forEach((item) => {
            const [base, quote] = item.symbol.split('-');
            const citem = { ...item };
            citem.symbol = `${getCoinShowName(base, coinList)}-${getCoinShowName(quote, coinList)}`;
            if (!symbolObj[item.marginCoin]) {
              symbolObj[item.marginCoin] = {};
            }
            symbolObj[item.marginCoin][item.symbol] = citem;
          });
          this.symbolObj = symbolObj;
          const coinSelectList = [];
          const coinListObj = [];
          // let have;
          data.data.coinList.forEach((item) => {
            let active = false;
            if (item.coin === 'USDT') {
              active = true;
            }
            // else if (item.coin === `USDT${this.companyId}`) {
            //   active = true;
            // }
            // eslint-disable-next-line no-param-reassign
            item.showCoin = getCoinShowName(item.coin, this.market.coinList);
            // active = index === 0 ? true : false;
            // console.log(item)
            let str = '';
            if (item.type === 1) {
              str = ` (${this.$t('kol.kolTradersSet.t22')})`;
            }
            coinSelectList.push({
              key: getCoinShowName(item.coin, this.market.coinList) + str,
              value: item.coin,
              active,
            });
            coinListObj[item.coin] = item;
          });
          this.coinSelectList = coinSelectList;
          this.coinListObj = coinListObj;
          this.upDataSymbolList();
        } else {
          this.$bus.$emit('tip', {
            text: data.msg, type: 'error', backgroundColor: '#F6F8FF', textColor: '#16181d',
          });
        }
      });
    },
    // 合约列表
    upDataSymbolList() {
      const symbolSelectList = [];
      Object.keys(this.symbolObj[this.activeCoin]).forEach((key) => {
        // let active = index === 0 ? true : false;
        const item = this.symbolObj[this.activeCoin][key];
        symbolSelectList.push({
          key: item.symbol.replace('-', '/'),
          value: item.instrumentId,
          active: true,
          lever: item.lever,
        });
      });
      this.symbolSelectList = symbolSelectList;
    },
    // 跟单模式
    setFollowTypeMod(val) {
      this.followTypeMod = val;
    },
    inputChange(value, name) {
      this[name] = value;
    },
    // 去划转
    goTransfer() {
      this.$router.push('assets/exchangeAccount');
    },
    // 止损超过选择
    setLossActive() {
      this.lossActive = !this.lossActive;
    },
    // 盈利超过选择
    setProfitActive() {
      this.profitActive = !this.profitActive;
    },
    // 开始跟单
    confirmFollow() {
      if (this.symbolSelectList.findIndex((target) => target.active === true) === -1) {
        this.$bus.$emit('tip', {
          text: `${this.$t('common.chooseOne')}合约`, type: 'error', backgroundColor: '#F6F8FF', textColor: '#16181d',
        });
        return;
      }
      if (!this.amount.length) {
        this.$bus.$emit('tip', {
          text: '请输入跟单金额', type: 'error', backgroundColor: '#F6F8FF', textColor: '#16181d',
        });
        return;
      }
      this.confirmFollowFlag = true;
    },
    // 是否同意风险提示
    setAgree() {
      this.isAgree = !this.isAgree;
    },
    // 同意风险提示
    confirmFollowNow() {
      if (this.dialogConfirmLoading) return;
      this.dialogConfirmLoading = true;
      const arr = [];
      this.symbolSelectList.forEach((item) => {
        if (item.active) {
          arr.push({
            symbol: item.key,
            instrumentId: item.value,
          });
        }
      });
      const obj = {
        uid: this.uid,
        amount: this.amount,
        coin: this.activeCoin,
        isStopDeficit: this.lossActive ? 1 : 0,
        stopDeficit: this.loss,
        isStopProfit: this.profitActive ? 1 : 0,
        stopProfit: this.profit,
        symbolRelationStr: JSON.stringify(arr),
        followType: this.isOpenScale ? this.followTypeMod : undefined,
        isFirst: this.isFirst,
      };
      this.axios({
        url: 'v2/kol/follow',
        hostType: 'coFollow',
        params: obj,
        method: 'post',
      }).then((data) => {
        this.flag = false;
        if (data.code === '0' || data.code === 0) {
          this.$bus.$emit('tip', {
            text: data.msg, type: 'success', backgroundColor: '#F6F8FF', textColor: '#16181d',
          });
          this.confirmFollowFlag = false;
          this.followSetFlag = false;
          this.getList();
        } else {
          this.$bus.$emit('tip', {
            text: data.msg, type: 'error', backgroundColor: '#F6F8FF', textColor: '#16181d',
          });
        }
        this.dialogConfirmLoading = false;
      });
    },
    // 关闭风险提示
    closeFollowNow() {
      this.confirmFollowFlag = false;
    },
    // 打开 带单人详情
    showInfo(uid) {
      if (!this.isLogin) {
        this.$router.push('/login');
        return;
      }
      this.kolTraderInfoFlag = true;
      this.uid = uid;
      this.getDteData(uid);
    },
    // 关闭 带单人详情
    closeInfo() {
      this.kolTraderInfoFlag = false;
      this.confirmTextFollowDdis = false;
      this.confirmTextFollow = '';
      this.uid = '';
      this.currentInfoTab = 1;
    },
    tabChange(item) {
      this.currentInfoTab = item.index;
      if (item.index === 2) {
        this.getHistory();
      }
    },
    getHistory() {
      this.axios({
        url: 'v2/kol/history_order',
        hostType: 'coFollow',
        params: {
          page: 1,
          pageSize: 50,
          uid: this.uid,
        },
        method: 'post',
      }).then((data) => {
        if (data.code === '0' || data.code === 0) {
          // this.loadingFlag = false;
          // this.pagination.count = data.data.count;
          const { coinList } = this.market;
          // if (
          //   Math.ceil(
          //     parseFloat(data.data.count) / parseFloat(this.pagination.pageSize),
          //   ) > this.pagination.page
          // ) {
          //   this.pullUpState = 0;
          // } else {
          //   this.pullUpState = 3;
          // }
          data.data.list.forEach((item) => {
            const [base, quote] = item.symbol.split('-');
            // eslint-disable-next-line no-param-reassign
            item.changeSymbol = `${getCoinShowName(base, coinList)}/${getCoinShowName(quote, coinList)}`;
          });
          this.hisData = data.data.list;
        } else {
          this.$bus.$emit('tip', {
            text: data.msg, type: 'error', backgroundColor: '#F6F8FF', textColor: '#16181d',
          });
        }
      });
    },
    // 合约信息
    getFixData() {
      this.axios({
        url: 'v2/common/symbol_list',
        hostType: 'coFollow',
        // params: obj,
        method: 'post',
      }).then((data) => {
        // this.dialogConfirmLoading = false
        if (data.code === '0' || data.code === 0) {
          const fixObj = {};
          const { coinList } = this.market;
          data.data.list.forEach((item) => {
            fixObj[item.instrumentId] = item;
            const [base, quote] = item.symbol.split('-');
            fixObj[item.instrumentId].symbol = `${getCoinShowName(base, coinList)}-${getCoinShowName(quote, coinList)}`;
          });
          this.fixObj = fixObj;
        } else {
          this.$bus.$emit('tip', {
            text: data.msg, type: 'error', backgroundColor: '#F6F8FF', textColor: '#16181d',
          });
        }
      });
    },
    confirmFollowKolTrader() {
      this.kolTraderInfoFlag = false;
      this.followSetFlag = true;
      this.getDteData(this.uid);
      this.getSymbolList(this.uid);
    },
    goReward() {
      if (this.isLogin) {
        if (this.isKol) {
          this.currentType = 'kolTraderOrder';
          this.$bus.$emit('kolTraderOrder', true);
        } else {
          this.currentType = 'kolMyOrder';
          this.$bus.$emit('kolMyOrder', true);
        }
      } else {
        this.$router.push('/login');
      }
    },
    inputchanges(v) {
      this.listfilter = v;
    },
  },
};
