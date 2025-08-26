import {
  imgMap, colorMap, formatTime, fixD,
} from '@/utils';

export default {
  data() {
    return {
      loading: true,
      imgMap,
      colorMap,
      dataList: [],
      cellHeight: 55,
      headHeight: 30,
      lineNumber: 10,
      classes: '',
      headClasses: '',
      bodyClasses: '',
      lineClass: '',
      // 数据相关
      listPage: {
        count: 0, // 总条数
        page: 1, // 当前page
        pageSize: 10, // 每页显示
      },
      startTime: '',
      endTime: '',
      findFlagLoad: false,
    };
  },
  computed: {
    startTimeNum() {
      return (new Date(this.startTime.replace(/-/g, '/')).getTime() / 1000).toString();
    },
    endTimeNum() {
      return (new Date(this.endTime.replace(/-/g, '/')).getTime() / 1000).toString();
    },
    startTimeText() {
      return this.$t('broker.startTime');
    },
    endTimeText() {
      return this.$t('freeStaking.myPos.endTime');
    },
    usdtFix() {
      let fix = 0;
      if (this.market && this.market.coinList && this.market.coinList.USDT) {
        fix = this.market.coinList.USDT.showPrecision;
      }
      return fix;
    },
    market() { return this.$store.state.baseData.market; },
    columns() {
      return [
        {
          title: this.$t('studio.columns1'), // '日期',
          key: 'time',
          align: 'left',
          width: '100px',
          classes: '',
        },
        {
          title: this.$t('studio.columns2'), // '币种',
          key: 'coin',
        },
        {
          title: `${this.$t('studio.columns3')}(U)`, // '当天交易量(U)',
          key: 'volume_day',
          width: '180px',
        },
        {
          title: `${this.$t('studio.columns4')}(U)`, // '本月交易量(U)',
          key: 'volume_month',
          width: '180px',
        },
        {
          title: `${this.$t('studio.columns5')}(U)`, // '总交易量(U)',
          key: 'volume_total',
          width: '180px',
        },
        {
          title: this.$t('studio.columns6'), // '当天手续费',
          key: 'fee_day',
          width: '150px',
        },
        {
          title: this.$t('studio.columns7'), // '本月手续费',
          key: 'fee_month',
          width: '150px',
        },
        {
          title: this.$t('studio.columns8'), // '总手续费',
          key: 'fee_total',
          width: '150px',
        },
        {
          title: this.$t('studio.columns9'), // '工作室人数',
          key: 'number',
          width: '150px',
        },
      ];
    },
  },
  methods: {
    pagechange(v) {
      this.listPage.page = v;
      this.getDate();
    },
    init() {
      this.listPage.page = 1;
      const timestamp = new Date().getTime();
      const t = 60 * 60 * 24 * 1000 * 7;
      this.startTime = this.getNowTime(timestamp - t);
      this.endTime = this.getNowTime(timestamp);
      this.getDate();
    },
    getFix(v) {
      let fix = 2;
      if (this.market && this.market.coinList && this.market.coinList[v]) {
        fix = this.market.coinList[v].showPrecision;
      }
      return fix;
    },
    getDate() {
      this.axios({
        url: 'v2/co/studio/volume_list',
        hostType: 'ex',
        params: {
          page: this.listPage.page,
          pageSize: this.listPage.pageSize,
          startDate: formatTime(new Date(this.startTime).getTime()),
          endDate: formatTime(new Date(this.endTime).getTime()),
        },
      }).then((data) => {
        this.loading = false;
        if (data.code.toString() === '0') {
          this.setDate(data.data.mapList);
          this.listPage.count = data.data.count;
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
    setDate(data) {
      const arr = [];
      data.forEach((item, index) => {
        // const fix = this.getFix(item.coin.toUpperCase());
        arr.push({
          id: index,
          time: item.time ? formatTime(item.time) : '--', // 时间
          coin: item.coin, // 币种
          volume_day: fixD(item.volume_day, this.usdtFix), // 当天交易量
          volume_month: fixD(item.volume_month, this.usdtFix), // 当月交易量（U）
          volume_total: fixD(item.volume_total, this.usdtFix), // 总交易量（U）
          fee_day: fixD(item.fee_day, 8), // 当天手续费
          fee_month: fixD(item.fee_month, 8), // 当月手续费
          fee_total: fixD(item.fee_total, 8), // 总手续费
          number: item.number, // 工作室人数
        });
      });
      this.dataList = arr;
    },
    getMonth(n) {
      const date = new Date();
      return date.setMonth(date.getMonth() + n);
    },
    getNowTime(time = '') {
      const date = new Date(time);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();

      return `${year}-${month}-${day}`;
    },
    timeSelect(time) {
      this.startTime = time.length ? this.getNowTime(time[0]).toString() : '';
      this.endTime = time.length ? this.getNowTime(time[1]).toString() : '';
      if (this.startTime && this.endTime) {
        this.loading = true;
        this.listPage.page = 1;
        this.getDate();
      }
    },
  },
};
