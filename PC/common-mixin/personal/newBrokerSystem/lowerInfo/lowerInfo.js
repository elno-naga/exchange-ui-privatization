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
      uidValue: '',
      phoneValue: '',
      findFlagLoad: false,
    };
  },
  computed: {
    startTimeNum() {
      return (
        new Date(this.startTime.replace(/-/g, '/')).getTime() / 1000
      ).toString();
    },
    endTimeNum() {
      return (
        new Date(this.endTime.replace(/-/g, '/')).getTime() / 1000
      ).toString();
    },
    startTimeText() {
      return this.$t('broker.startTime');
    },
    endTimeText() {
      return this.$t('broker.endTime');
    },
    navTab() {
      return [
        {
          name: this.$t('brokerSystem.commissionNavTab[0]'),
          index: 1,
        },
        {
          name: this.$t('brokerSystem.commissionNavTab[1]'),
          index: 2,
        },
      ];
    },
    usdtFix() {
      let fix = 0;
      if (this.market && this.market.coinList && this.market.coinList.USDT) {
        fix = this.market.coinList.USDT.showPrecision;
      }
      return fix;
    },
    market() {
      return this.$store.state.baseData.market;
    },
    columns() {
      return [
        {
          title: this.$t('brokerSystem.lowerTable[0]'),
          align: 'left',
          key: 'time',
        },
        {
          title: this.$t('brokerSystem.lowerTable[1]'),
          align: 'left',
          key: 'uid',
        },
        {
          title: this.$t('brokerSystem.lowerTable[2]'),
          key: 'username',
        },
        // {
        //   title: this.$t('brokerSystem.lowerTable[3]'),
        //   width: '100px',
        // },
        // {
        //   title: this.$t('brokerSystem.lowerTable[4]'),
        // },
        // {
        //   title: this.$t('brokerSystem.lowerTable[5]'),
        // },
        // {
        //   title: this.$t('brokerSystem.lowerTable[6]'),
        //   width: '100px',
        // },
        {
          title: this.$t('brokerSystem.commissionTable[1]'),
          key: 'coin',
        },
        {
          title: this.$t('brokerSystem.lowerTable[7]'),
          align: 'right',
          key: 'amount',
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
      this.startTime = this.getNowTime(this.getMonth(-1));
      this.endTime = this.getNowTime(this.getMonth(0));
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
      let startDate = this.startTime;
      let endDate = this.endTime;
      if (typeof this.startTime === 'string') {
        startDate = new Date(new Date(this.startTime.replace(/-/g, '/')).toLocaleDateString()).getTime();
      }
      if (typeof this.endTime === 'string') {
        endDate = new Date(new Date(this.endTime.replace(/-/g, '/')).toLocaleDateString()).getTime() + (24 * 60 * 60 * 1000 - 1);
      }
      this.axios({
        url: 'co/agent/user_list',
        hostType: 'ex',
        params: {
          page: this.listPage.page,
          pageSize: this.listPage.pageSize,
          startDate, // 开始时间 00:00:00
          endDate, // 结束时间：23:59:59
          uid: this.uidValue || undefined,
          username: this.phoneValue || undefined,
          // coin: this.coin === 'all' ? undefined : this.coin,
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
      this.setDate([{ coin: 'USDT', uid: 1 }]);
    },
    setDate(data) {
      // this.loading2 = false;
      const arr = [];
      data.forEach((item, index) => {
        const fix = this.getFix(item.coin.toUpperCase());
        // let typeText = '';
        // switch (item.type) {
        //   case 0:
        //     typeText = this.$t('brokerSystem.lowerTableList[4]'); // '返佣'
        //     break;
        //   case 1:
        //     typeText = this.$t('brokerSystem.lowerTableList[5]'); // '分佣'
        //     break;
        //   default:
        //     typeText = this.$t('brokerSystem.lowerTableList[6]'); // '二级返佣'
        // }
        arr.push({
          id: index,
          time: item.time ? formatTime(item.time) : '--', // 时间
          uid: item.uid, // uid
          username: item.username, // 手机号
          // item.nickname || '--', // 姓名
          // item.type === 0
          //   ? this.$t('brokerSystem.lowerTableList[0]') // '直客'
          //   : this.$t('brokerSystem.lowerTableList[1]'), // '子经纪', // 类型
          // item.source === 1
          //   ? this.$t('brokerSystem.lowerTableList[2]') // '好友邀请'
          //   : this.$t('brokerSystem.lowerTableList[3]'), // '红包邀请', // 邀请方式
          // 给上级返佣类型
          // typeText,
          coin: item.coin,
          amount: fixD(item.amount, fix), // 数额
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
    timeSelect(time = []) {
      [this.startTime, this.endTime] = time;
      if (this.startTime && this.endTime) {
        this.loading = true;
        this.listPage.page = 1;
        this.getDate();
      }
    },
    currentType(data) {
      this.currentTab = data.index;
    },
    inputChanges(value, name) {
      this[name] = value;
      const now = new Date().getTime();
      this.findFlagLoad = now;
      this.loading = true;
      setTimeout(() => {
        if (this.findFlagLoad === now) {
          this.listPage.page = 1;
          this.getDate();
        }
      }, 300);
    },
  },
};
