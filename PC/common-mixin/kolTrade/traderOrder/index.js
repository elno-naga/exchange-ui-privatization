import {
  imgMap, colorMap, fixD, getCoinShowName, formatTime, fixInput,
} from '@/utils';

export default {
  name: 'kolTrade',
  data() {
    return {
      imgMap,
      colorMap,
      info: {},
      changeImgFlag: false,
      headImgUrl: '',
      // 接受文件类型
      acceptType: ['.jpeg', '.jpg', '.png', '.JPG'],
      maxSize: 1,
      sizeType: 'MB',
      name: 'headImg',
      shareFlag: false,
      shareType: 0,
      shareRate: '5',
      D1Date: {}, // 带单信息
      amount: '0', // 累计佣金分成
      tabelLoading: false,
      paginationObj: {
        total: 0, // 数据总条数
        display: 10, // 每页显示条数
        currentPage: 1, // 当前页码
      },
      D3Date: [],
      D4Date: [], // 跟单用户明细
      amountFlag: false,
      // bannerBg: null,
      // isKol: false, // 是否是带单人
      // readerFlag: false, // 是否弹窗确认
      // bannerInfo: {}, // banner信息
      // currentType: 'list',
      income_amount: '0', // 收益 -- 收益额
      income_rate: '0', // 收益 -- 收益率
      follow_amount: '0', // 收益 -- 跟单总额
      nowType: 1,
      dataLength: 0,
      tableList: [],
      fixObj: {},
      cancelOrderFlag: false,
      closeData: {},
      dialogConfirmLoading: false,
      OrderDetailFlag: false,
      detailInfo: {},
      detailList: [],
      label: '', // 个性签名
      labelFlag: false,
      headImgUrlDis: true,

    };
  },
  filters: {
    formatTimeFn(date) {
      if (date) {
        return formatTime(date);
      }
      return '--';
    },
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
    isLogin() {
      return this.$store.state.baseData.isLogin;
    },
    isOpenUploadImg() {
      const data = this.$store.state.baseData.publicInfo;
      let flag = '0';
      if (data && data.switch && data.switch.is_open_upload_img
        && data.switch.is_open_upload_img.toString === '1') {
        flag = '1';
      }
      return flag;
    },
    // 用户信息
    userInfo() {
      return this.$store.state.baseData.userInfo;
    },
    market() {
      return this.$store.state.baseData.market;
    },
    navTab() {
      return {
        selected: this.nowType,
        list: [
          { name: `${this.$t('kol.kolTraderMyOrder.t30')}(${this.dataLength})`, index: 1 },
          { name: this.$t('kol.kolTraderMyOrder.t32'), index: 2 },
          { name: this.$t('kol.kolTraderMyOrder.t31'), index: 3 },
        ],
      };
    },
    columns() {
      return [
        {
          title: this.$t('kol.kolTradePc.text73'), key: 'username', width: '20%', align: 'left',
        },
        // 跟单类型
        {
          title: this.$t('kol.kolTradePc.text71'), key: 'followType', width: '20%', align: 'center',
        },
        // 跟单时间
        {
          title: this.$t('kol.newKol2.text58'), key: 'followTime', width: '20%', align: 'center',
        },
        // 跟单金额
        {
          title: this.$t('kol.kolTraderMyKol.ot4'), key: 'total', width: '20%', align: 'center',
        },
        // // 跟单盈利
        // {
        //   title: this.$t('kol.kolTraderMyKol.ot5'), key: 'profit', width: '16%', align: 'center',
        // },
        // 分成金额
        {
          title: this.$t('kol.kolTraderMyKol.ot6'), key: 'followProfit', width: '20%', align: 'right',
        },
      ];
    },
  },
  watch: {
    userInfo(v) {
      if (v) {
        this.getInfo();
      }
    },
    market() {
      this.getFixData();
    },
    shareRate(v) {
      this.$nextTick(() => {
        this.shareRate = fixInput(v, 0, { number: true });
      });
    },
  },
  created() {
    if (this.market) {
      this.getFixData();
    }
  },
  methods: {
    init() {
      if (this.userInfo) {
        this.getInfo();
      }
      this.getD1();
      this.getD2();
      this.getD3();
      this.getD4();
    },
    // 带单人信息
    getInfo() {
      this.axios({
        url: 'v2/kol/info',
        hostType: 'coFollow',
        params: {
          uid: this.userInfo.id,
        },
        method: 'post',
      }).then((data) => {
        if (data.code.toString() === '0') {
          const { info } = data.data;
          this.info = info;
          this.headImgUrl = info.img_url;
          // this.minAmount = info.single_min_amount;
          // this.maxAmount = info.single_max_amount;
          // this.user_name = info.user_name;
          // this.date_diff = info.date_diff; // 入住天数
          // this.rate = info.rate; // 盈利分成
          // this.profit_rate = info.profit_rate; // 累计收益率
          // this.win_rate_week = info.win_rate_week; // 近两周交易胜率
          // this.profit_amount = info.profit_amount; // 总收益
          // this.win_rate = info.win_rate; // 交易胜率
          // this.order_number = info.order_number; // 交易笔数
          // this.total_number = info.total_number; // 跟单人数
          // this.order_frequency = info.order_frequency; // 交易频次
          // this.follow_status = info.follow_status; // 是否对次跟单
          // this.position_status = info.position_status; // 持仓状态
          // this.label = info.label; // 签名
          // this.is_share = info.is_share; // 是否开启分享
        } else {
          this.$bus.$emit('tip', {
            text: data.msg, type: 'error', backgroundColor: '#F6F8FF', textColor: '#16181d',
          });
        }
      });
    },
    // 修改头像
    changeImg() {
      this.changeImgFlag = true;
      // this.headImgUrl = null;
      this.headImgUrlDis = true;
    },
    // 选择图片
    imageChange(e) {
      const file = e.target.files[0];
      // 校验尺寸
      if (this.maxSize) {
        let maxSize = '';
        if (this.sizeType.toLocaleUpperCase() === 'KB') {
          maxSize = this.maxSize * 1024;
        } else if (this.sizeType.toLocaleUpperCase() === 'MB') {
          maxSize = this.maxSize * 1024 * 1024;
        } else {
          maxSize = this.maxSize;
        }
        if (file.size > maxSize) {
          const error = this.$t('components.upload.warnTip', {
            size: `${this.maxSize}${this.sizeType}`,
          });
          this.$bus.$emit('tip', {
            text: error, type: 'error', backgroundColor: '#F6F8FF', textColor: '#16181d',
          });
          e.target.value = '';
          return;
        }
      }
      this.upload(file);
    },
    // 上传图片
    upload(val) {
      const formData = new FormData();
      formData.append(this.name, val);
      formData.append('name', this.name);
      // if (this.expand.length > 0) {
      //   this.expand.forEach((item) => {
      //     formData.append(Object.keys(item)[0], item[Object.keys(item)[0]]);
      //   });
      // }
      this.axios({
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        method: 'post',
        url: 'common/upload_img',
        hostType: Number(this.isOpenUploadImg) === 1 ? 'upload' : null,
        params: formData,
      }).then(({ code, data, msg }) => {
        if (code.toString() === '0') {
          const fileName = data.filenameStr
            ? data.filenameStr
            : data.filename;
          // const name = data.name || this.name;
          // this.$emit('change', {
          //   url: data.base_image_url + fileName,
          //   fileName,
          //   name,
          // }, this.name);
          this.headImgUrl = data.base_image_url + fileName;
          this.headImgUrlDis = false;
        } else {
          this.$bus.$emit('tip', {
            text: msg, type: 'error', backgroundColor: '#F6F8FF', textColor: '#16181d',
          });
        }
      });
    },
    // 确认修改头像
    confirmUpload() {
      this.axios({
        url: 'v2/uploadAvatarFile',
        hostType: 'coFollow',
        params: {
          fileName: this.headImgUrl,
        },
        method: 'post',
      }).then((data) => {
        // this.dialogConfirmLoading = false
        if (data.code === '0' || data.code === 0) {
          this.$bus.$emit('tip', {
            text: data.msg, type: 'success', backgroundColor: '#F6F8FF', textColor: '#16181d',
          });
          this.changeImgFlag = false;
          this.getInfo();
        } else {
          this.$bus.$emit('tip', {
            text: data.msg, type: 'error', backgroundColor: '#F6F8FF', textColor: '#16181d',
          });
        }
      });
    },
    // 关闭修改头像弹窗
    closeChangeImg() {
      this.changeImgFlag = false;
      this.headImgUrl = this.info.img_url;
    },
    // 关闭修改签名弹窗
    closeModifylabel() {
      this.labelFlag = false;
      this.label = this.info.label;
    },
    // 修改签名
    modifyLabel() {
      this.labelFlag = true;
    },
    // 确认修改签名
    confirmModifylabel() {
      this.axios({
        url: 'v2/kol/label/update',
        hostType: 'coFollow',
        params: {
          label: this.label,
        },
        method: 'post',
      }).then((data) => {
        if (data.code === '0' || data.code === 0) {
          this.labelFlag = false;
          // this.label = this.info.label;
          this.getInfo();
          this.$bus.$emit('tip', {
            text: data.msg, type: 'success', backgroundColor: '#F6F8FF', textColor: '#16181d',
          });
        } else {
          this.$bus.$emit('tip', {
            text: data.msg, type: 'error', backgroundColor: '#F6F8FF', textColor: '#16181d',
          });
        }
      });
    },
    // 关闭分享设置弹窗
    closeShare() {
      this.shareFlag = false;
    },
    // 开启分享设置弹窗
    setShare() {
      this.shareFlag = true;
      this.getD1();
    },
    // 分享配置
    setShareType(v) {
      this.shareType = v;
    },
    // 确认设置分享
    setShareConfirm() {
      let confirmFlag = false;
      if (this.shareType === 1) {
        if (!this.shareRate) {
          this.$bus.$emit('tip', {
            text: this.$t('kol.newKol2.text65'), type: 'error', backgroundColor: '#F6F8FF', textColor: '#16181d',
          });
          confirmFlag = true;
        }
        if (this.shareRate && (Number(this.shareRate) < 5 || Number(this.shareRate) > 99)) {
          this.$bus.$emit('tip', {
            text: this.$t('kol.newKol2.text66'), type: 'error', backgroundColor: '#F6F8FF', textColor: '#16181d',
          });
          confirmFlag = true;
        }
      }
      if (confirmFlag) return;
      this.axios({
        url: 'v2/kol/share/edit',
        hostType: 'coFollow',
        params: {
          is_share: this.shareType === 1 ? '1' : '0',
          share_rate: this.shareRate,
        },
        method: 'post',
      }).then((data) => {
        this.closeFlag = false;
        if (data.code === '0' || data.code === 0) {
          this.shareFlag = false;
          this.$bus.$emit('tip', {
            text: data.msg, type: 'success', backgroundColor: '#F6F8FF', textColor: '#16181d',
          });
        } else {
          this.$bus.$emit('tip', {
            text: data.msg, type: 'error', backgroundColor: '#F6F8FF', textColor: '#16181d',
          });
        }
      });
    },
    // 分享数据和总数据
    getD1() {
      this.axios({
        url: 'v2/kol/record_count',
        hostType: 'coFollow',
        params: {
        },
        method: 'post',
      }).then((data) => {
        if (data.code === '0' || data.code === 0) {
          this.D1Date = data.data;
          this.shareType = data.data.is_share ? 1 : 0;
          this.shareRate = data.data.share_rate;
          this.label = data.data.label;
        } else {
          this.$bus.$emit('tip', {
            text: data.msg, type: 'error', backgroundColor: '#F6F8FF', textColor: '#16181d',
          });
        }
      });
    },
    getD2() {
      this.axios({
        url: 'v2/kol/income_all',
        hostType: 'coFollow',
        params: {
        },
        method: 'post',
      }).then((data) => {
        if (data.code === '0' || data.code === 0) {
          this.amount = data.data.amount;
        } else {
          this.$bus.$emit('tip', {
            text: data.msg, type: 'error', backgroundColor: '#F6F8FF', textColor: '#16181d',
          });
        }
      });
    },
    getD3() {
      this.axios({
        url: 'v2/kol/income_list',
        hostType: 'coFollow',
        params: {
          page: 1,
          pageSize: 50,
          // type: this.nowType === 0 ? 0 : 2, // 0.进行中 1.已结束
        },
        method: 'post',
      }).then((data) => {
        if (data.code === '0' || data.code === 0) {
          this.D3Date = data.data.list;
        } else {
          this.$bus.$emit('tip', {
            text: data.msg, type: 'error', backgroundColor: '#F6F8FF', textColor: '#16181d',
          });
        }
      });
    },
    getD4() {
      this.tabelLoading = true;
      this.axios({
        url: 'v2/kol/follow_users',
        hostType: 'coFollow',
        params: {
          page: this.paginationObj.currentPage,
          pageSize: this.paginationObj.display,
          // type: this.nowType === 0 ? 0 : 2, // 0.进行中 1.已结束
        },
        method: 'post',
      }).then((data) => {
        if (data.code === '0' || data.code === 0) {
          this.paginationObj.total = data.data.count;
          this.D4Date = data.data.list;
        } else {
          this.$bus.$emit('tip', {
            text: data.msg, type: 'error', backgroundColor: '#F6F8FF', textColor: '#16181d',
          });
        }
        this.tabelLoading = false;
      });
    },
    pageChange(v) {
      this.paginationObj.currentPage = v;
      this.getD4();
    },
    rateClass(v) {
      let str = 'fall-1-cl';
      if (Number(v) >= 0) {
        str = 'rise-1-cl';
      }
      return str;
    },
    fixFn(v, fix) {
      // fix
      if (`${fix}` !== 'undefined') {
        return fixD(v, fix);
      }
      return fixD(v, this.fix);
    },
    setTime(dateTime) {
      const date = new Date(dateTime);
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const hours = date.getHours();
      const minutes = date.getMinutes();
      function s(t) {
        return t < 10 ? `0${t}` : t;
      }
      return `${s(month)}/${s(day)} ${s(hours)}:${s(minutes)}`;
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
    goList() {
      this.$bus.$emit('list', true);
    },
    showAmount() {
      this.amountFlag = true;
    },
    closeAmount() {
      this.amountFlag = false;
    },
  },
};
