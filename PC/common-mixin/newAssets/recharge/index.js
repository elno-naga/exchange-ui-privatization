import {
  fixD,
  getCoinShowName,
  colorMap,
  imgMap,
  formatTime,
  getIconPath,
} from "@/utils";

export default {
  name: "page-recharge",
  data() {
    return {
      addressShow: true,
      addressPageShow: true,
      tabelLoading: false,
      alertFlag: false,
      imgMap,
      colorMap,
      getIconPath,
      detailsList: [
        { key: "sum", value: "--" },
        { key: "normal", value: "--" },
        { key: "lock", value: "--" },
      ],
      address: "", // 地址
      addressLong: "", // 未省略地址
      addressPage: "", // 标签（xrp/eos）时
      addressQRCode: "", // 二维码地址
      tabelList: [], // 充值记录
      symbol: "",
      havePageArr: ["XRP", "EOS"], // 含有标签的币种
      paginationObj: {
        total: 0, // 数据总条数
        display: 10, // 每页显示条数
        currentPage: 1, // 当前页码
      },
      addressTime: null,
      branchTip: "",
      branchLoading: false,
      rechargeCoinList: [], // 币种列表
      helpIconHover: false,
      copyValue: "", // 复制数据
      showReLoad: false,
      isPermission: 0,
      popoverShow: false, // popover
      popoverContent: "", // popover
      popoverParent: "",
      nowTypeTable: 1, // 1最近充值记录
      popoverPosition: "",
      depositStatus: null, // init 页面后  GetEquity 函数是否执行后进行赋值
    };
  },
  watch: {
    paginationObjCurrentPage() {
      this.getTableList();
    },
    setWatchPermission: {
      deep: true,
      handler(v) {
        // 接口请求完成 开始判断权限
        if (v.depositStatus !== null && v.userInfo !== null) {
          if (v.isSubAccount) {
            this.isPermission = v.isSubAccountDep ? 2 : 1; // 1 有权限 2无权限
          } else {
            this.isPermission = v.depositStatus; // 1 有权限  2无权限
          }
          if (v.market && v.exchangeData) {
            this.setRechargeCoinList();
          }
          if (v.market && v.symbol) {
            this.branchInit(v.market, this.usdtOpenOmni, "recharge");
            if (this.isPermission === 1) {
              this.initAddress();
            }
            this.initDetails();
            // 获取table表数据
            this.getTableList();
          }
        }
      },
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
      return "";
    },
  },
  computed: {
    // fetch user info from store
    userInfo() {
      return this.$store.state.baseData.userInfo;
    },
    firstName() {
      return this.userInfo && this.userInfo.firstName
        ? this.userInfo.firstName
        : "";
    },
    lastName() {
      return this.userInfo && this.userInfo.lastName
        ? this.userInfo.lastName
        : "";
    },
    fullName() {
      return (this.firstName + " " + this.lastName).trim();
    },
    // check if the currency is IDR related
    isIDR() {
      return (
        this.symbol === "IDR" ||
        this.symbol === "IDRPERMATA" ||
        this.coinSymbol === "IDR" ||
        this.coinSymbol === "IDRPERMATA"
      );
    },
    userInfo() {
      return this.$store.state.baseData.userInfo;
    },
    navTabTable() {
      const arr = [
        {
          title: this.$t("assets.recharge.RecentRechargeRecord"), // 当前委托
          value: 1,
        },
      ];
      return arr;
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
          const { tagType } =
            this.market.followCoinList[this.symbol][this.activeBranch];
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
    serverName() {
      const { publicInfo } = this.$store.state.baseData;
      let code = "";
      if (publicInfo && publicInfo.msg && publicInfo.msg.company_name) {
        code = publicInfo.msg.company_name;
      }
      return code;
    },
    paginationObjCurrentPage() {
      return this.paginationObj.currentPage;
    },
    that() {
      return this;
    },
    // 当前币种精度
    showPrecision() {
      let v = 0;
      if (this.coinList && this.coinList[this.symbol]) {
        v = this.coinList[this.symbol].showPrecision;
      }
      return v;
    },
    // finance/account_balance 接口返回成功的数据
    exchangeData() {
      return this.$store.state.assets.exchangeData;
    },
    // market 接口
    market() {
      return this.$store.state.baseData.market;
    },
    // 表格title
    columns() {
      return [
        {
          key: "coin",
          title: this.$t("assets.recharge.RechargeCoin"),
          width: "13%",
        }, // 币种
        {
          key: "time",
          title: this.$t("assets.recharge.RechargeTime"),
          width: "12%",
        }, // 充值时间
        {
          key: "amount",
          title: this.$t("assets.recharge.RechargeVolume"),
          width: "13%",
        }, // 充值数量
        {
          key: "count",
          title: this.$t("assets.recharge.RechargeNumber"),
          width: "10%",
        }, // 确认次数
        {
          key: "address",
          title: this.$t("assets.recharge.rechargeAddress"),
          width: "17%",
        }, // 充值地址
        {
          key: "updateAt",
          title: this.$t("assets.flowingWater.updataAt"),
          width: "10%",
        }, // 钱包处理时间
        {
          key: "txid",
          title: this.$t("assets.flowingWater.txid"),
          width: "13%",
        }, // 区块链交易ID
        {
          key: "status",
          title: this.$t("assets.recharge.RechargeStatus"),
          width: "12%",
        }, // 状态
      ];
    },
    // 币种列表
    coinList() {
      return (this.market && this.market.coinList) || null;
    },
    // 是否显示usdt 的 mainChainName, 1 显示 0 不显示
    usdtOpenOmni() {
      if (this.$store.state.baseData.publicInfo) {
        if (this.$store.state.baseData.publicInfo.switch) {
          return this.$store.state.baseData.publicInfo.switch.usdt_open_omni;
        }
      }
      return "1";
    },
    // 是否是子账户
    isSubAccount() {
      let bol = false;
      if (this.userInfo && this.userInfo.isSub.toString() === "1") {
        bol = true;
      }
      return bol;
    },
    // 是否是子账户 如果是 则 是否开启充值
    isSubAccountDep() {
      let bol = false;
      if (
        this.userInfo &&
        this.userInfo.isSub.toString() === "1" &&
        this.userInfo.subUserDepositOpen.toString() === "0"
      ) {
        bol = true;
      }
      return bol;
    },
    setWatchPermission() {
      return {
        isSubAccountDep: this.isSubAccountDep,
        isSubAccount: this.isSubAccount,
        userInfo: this.userInfo,
        depositStatus: this.depositStatus,
        market: this.market,
        exchangeData: this.exchangeData,
        symbol: this.symbol,
      };
    },
  },
  methods: {
    // 去实名
    handClick() {
      this.$router.push("/personal/identityAuthen");
    },
    // 回退
    goBack() {
      this.smartBack();
    },
    smartBack() {
      const from = document.referrer;
      // 如果来自站外（比如 baidu.com 或为空），则跳转到默认页面
      const isFromOutside = from === "" || !from.includes(window.location.host);
      if (isFromOutside) {
        window.location.replace("/"); // 或 push
      } else {
        this.$router.back();
      }
    },
    setActiveBranch(v) {
      if (this.activeBranch !== v) {
        this.branchLoading = true;
      }
      this.activeBranch = v;
      this.initAddress();
    },
    async init() {
      const data = await this.getEquity();
      console.log("ceshi");
      this.depositStatus = data.depositStatus ? 1 : 2;
      // 如果没有 finance/account_balance 接口返回成功的数据
      if (!this.exchangeData) {
        this.$store.dispatch("assetsExchangeData");
      }
      // if (this.exchangeData && this.market) {
      //   console.log('ceshi2');
      //   this.setRechargeCoinList();
      // }
    },
    // getEquity
    getEquity(symbol) {
      const params = {};
      if (symbol) {
        params.symbol = symbol;
      }
      return new Promise((resolve) => {
        this.axios({
          url: "sumsub/get_equity",
          params,
        }).then(({ code, data, msg }) => {
          if (code.toString() === "0") {
            resolve(data);
          } else {
            resolve({ depositStatus: false });
            this.$bus.$emit("tip", { text: msg, type: "error" });
          }
        });
      });
    },
    // 处理可充值币种数据
    setRechargeCoinList() {
      console.log(this.isPermission, "ceshi");
      if (this.isPermission === 0) return;
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
        if (data[item].depositOpen) {
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
      } else if (this.rechargeCoinList.length > 0) {
        this.symbol = this.rechargeCoinList[0].code; // 默认下拉列表第一个
      }
    },
    handMouseenter(name) {
      if (name === "address") {
        this.addressShow = false;
      } else {
        this.addressPageShow = false;
      }
    },
    handMouseleave(name) {
      if (name === "address") {
        this.addressShow = true;
      } else {
        this.addressPageShow = true;
      }
    },
    alertClone() {
      this.alertFlag = false;
    },
    initDetails() {
      const obj = this.exchangeData.allCoinMap[this.symbol];
      const normalBalance =
        Number(obj.normal_balance) || Number(obj.overcharge_balance);
      this.detailsList = [
        { key: "sum", value: obj.total_balance },
        { key: "normal", value: normalBalance },
        { key: "lock", value: obj.lock_balance },
      ];
    },
    getBranchAddress() {
      this.axios({
        url: "cost/Getcost",
        params: {
          symbol: this.activeBranch,
        },
      }).then((data) => {
        if (data.code.toString() === "0") {
          this.branchTip = data.data.mainChainNameTip;
        }
      });
    },
    // 刷新充值地址
    reload() {
      this.initAddress();
    },
    initAddress() {
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
        url: "finance/get_charge_address",
        params: {
          symbol:
            this.haveBranch && this.activeBranch
              ? this.activeBranch
              : this.symbol,
        },
      }).then((data) => {
        if (data.code.toString() === "0") {
          // let { allCoinMap } = this.exchangeData
          this.addressQRCode = data.data.addressQRCode;
          if (this.addressQRCode) {
            this.branchLoading = false;
          } else {
            this.showReLoad = true;
          }
          let addressText = "";
          if (this.isHavePage) {
            const arr = data.data.addressStr.split("_");
            const [address, addressPage] = arr;
            addressText = address || "--";
            this.addressPage = addressPage || "--";
          } else {
            addressText = data.data.addressStr || "--";
          }
          if (addressText.length > 37) {
            this.address = `${addressText.slice(0, 28)}...${addressText.slice(
              -6
            )}`;
            this.addressLong = addressText;
          } else {
            this.address = addressText;
            this.addressLong = "";
          }
        } else {
          this.$bus.$emit("tip", { text: data.msg, type: "error" });
        }
      });
    },
    copy(item, value) {
      if (item === "address") {
        this.copyAddress();
      } else if (item === "addressPage") {
        this.copyAddressPage();
      } else if (item === "table") {
        this.copyTableValue(value);
      }
    },
    // 复制表格数据
    copyTableValue(value) {
      this.copyValue = value;
      this.$nextTick(() => {
        const input = this.$refs.copyValue;
        input.select();
        document.execCommand("copy");
        // 地址复制成功
        this.$bus.$emit("tip", {
          text: this.$t("assets.krw.copySuccess"),
          type: "success",
        });
      });
    },
    copyAddress() {
      const input = this.$refs.address;
      input.select();
      document.execCommand("copy");
      // 地址复制成功
      this.$bus.$emit("tip", {
        text: this.$t("assets.recharge.copyAddress"),
        type: "success",
      });
    },
    copyAddressPage() {
      const input = this.$refs.addressPage;
      input.select();
      input.setSelectionRange(0, input.value.length);
      document.execCommand("copy");
      // 复制成功
      this.$bus.$emit("tip", {
        text: this.$t("personal.prompt.copySucces"),
        type: "success",
      });
    },
    pagechange(v) {
      this.paginationObj.currentPage = v;
    },
    // 选择币种
    selectChange(item, name) {
      this[name] = item.code;
    },
    // 查看全部充值记录
    lookAll() {
      this.$router.push("/assets/flowingWater?nowType=1");
    },
    // 千分符
    thousands(num) {
      if (num && parseFloat(num)) {
        const str = num.toString();
        const reg =
          str.indexOf(".") > -1
            ? /(\d)(?=(\d{3})+\.)/g
            : /(\d)(?=(?:\d{3})+$)/g;
        return str.replace(reg, "$1,");
      }
      return num;
    },
    // 获取充值记录
    getTableList() {
      this.tabelLoading = true;
      this.axios({
        url: "record/deposit_list",
        params: {
          pageSize: this.paginationObj.display, // 每页条数
          page: this.paginationObj.currentPage, // 页码
          coinSymbol: this.symbol,
        },
      }).then((data) => {
        if (data.code.toString() === "0") {
          const list = [];
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
            const showPrecision =
              (coinList[item.symbol] && coinList[item.symbol].showPrecision) ||
              0;
            const amount = fixD(item.amount, showPrecision);
            list.push({
              index,
              coin: item.symbol, // 币种
              time: formatTime(item.createdAtTime), // 时间
              amount: this.thousands(amount), // 充值数量
              count: item.confirmDesc, // 确认次数
              address, // 充值地址
              addressLong: item.addressTo,
              updateAt: item.walletTime ? formatTime(item.walletTime) : "- -", // 处理时间
              txid: txid || "- -", // 交易ID
              txidLong: item.txid,
              status: item.status_text, // 状态
            });
          });
          this.tabelLoading = false;
          this.tabelList = list;
          this.paginationObj.total =
            data.data.count > 30 ? 30 : data.data.count;
        }
      });
    },
    showPopover(content, parent) {
      this.popoverContent = content;
      this.popoverParent = parent;
      this.popoverPosition = "bottom-start";
      this.$nextTick(() => {
        this.popoverShow = true;
      });
    },
    closePopover() {
      this.popoverShow = false;
    },
    showMemoHelp() {
      this.helpIconHover = true;
      this.popoverContent = this.$t("assets.recharge.pageText");
      this.popoverParent = ".iconPage";
      this.popoverPosition = "top";
      this.$nextTick(() => {
        this.popoverShow = true;
      });
    },
    closeMemoHelp() {
      this.helpIconHover = false;
      this.popoverShow = false;
    },
  },
};
