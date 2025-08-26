import {
  colorMap, imgMap, getIconPath, dateToNum, formatTime, getCoinShowName,
} from '@/utils';

export default {
  data() {
    return {
      getIconPath,
      colorMap,
      imgMap,
      currentType: 0, // 0 锁仓  1 持仓
      startTime: '',
      endTime: '',
      posData: [],
      paginationData: {
        total: 100, // 数据总条数
        display: 10, // 每页显示条数
        currentPage: 1, // 当前页码
      },
      subTableData: null,
      subTableDataId: null,
      subPosData: [],
      loading: false,
      pageData: {},
    };
  },
  computed: {
    market() { return this.$store.state.baseData.market; },
    startTimeNum() {
      return Number((new Date(this.startTime.replace(/-/g, '/')).getTime() / 1000).toString());
    },
    endTimeNum() {
      return Number((new Date(this.endTime.replace(/-/g, '/')).getTime() / 1000).toString());
    },
    columns() {
      const lockPosTable = [
        { title: this.$t('freeStaking.myPos.lockPosTable[0]'), key: 'coin' },
        { title: this.$t('manageFinances.startTime'), key: 'time' },
        { title: this.$t('freeStaking.myPos.lockPosTable[2]'), key: 'amount' },
        { title: this.$t('freeStaking.myPos.lockPosTable[3]'), key: 'rate' },
        { title: this.$t('freeStaking.myPos.lockPosTable[4]'), key: 'gainAmount' },
        { title: this.pageData.tipStatus, key: 'status' },
      ];

      const unLockPosTable = [
        { title: this.$t('freeStaking.myPos.unLockPosTable[0]'), key: 'coin' },
        { title: this.$t('freeStaking.myPos.unLockPosTable[1]'), key: 'time' },
        { title: this.$t('freeStaking.myPos.unLockPosTable[2]'), key: 'amount' },
        { title: this.$t('freeStaking.myPos.unLockPosTable[3]'), key: 'rate' },
        { title: this.$t('freeStaking.myPos.unLockPosTable[4]'), key: 'gainAmount' },
      ];

      return this.currentType ? unLockPosTable : lockPosTable;
    },
    subColumns() {
      const columns = [
        { title: this.$t('freeStaking.detail.incomeTime'), key: 'time' },
        { title: this.$t('freeStaking.detail.incomeNum'), key: 'amount' },
      ];

      return this.currentType ? [] : columns;
    },
    navTabList() {
      return [{
        name: this.pageData.tipLock,
        index: 0,
      }, {
        name: this.pageData.tipNormal,
        index: 1,
      }];
    },
    startTimeText() {
      return this.$t('broker.startTime');
    },
    endTimeText() {
      return this.$t('freeStaking.myPos.endTime');
    },
  },
  methods: {
    init() {
      this.startTime = this.getNowTime(this.getMonth(-3));
      this.endTime = this.getNowTime(this.getMonth(3));
      this.getUserPosData(this.currentType);
    },
    getMonth(n) {
      const date = new Date();
      return date.setMonth(date.getMonth() + n);
    },
    getUserPosData(currentType) {
      const { currentPage, display } = this.paginationData;
      this.loading = true;

      this.axios({
        url: this.$store.state.url.freeStaking.pos_history,
        headers: {},
        params: {
          page: currentPage,
          pageSize: display,
          projectType: currentType ? 1 : 3,
          strTimeMillis: this.startTime ? dateToNum(`${this.startTime} 00:00:00`) : '',
          entTimeMillis: this.endTime ? dateToNum(`${this.endTime} 23:59:59`) : '',
        },
        method: 'post',
      }).then((data) => {
        if (data.code === '0' && currentType === this.currentType) {
          const { count, posList } = data.data;
          this.pageData = data.data;
          this.paginationData.total = count;
          this.posData = this.initPosData(posList);
          this.loading = false;
        }
      });
    },
    reducePost() {
      if (this.timer) clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        this.getUserPosData(this.currentType);
      }, 500);
    },
    initPosData(data) {
      if (!Array.isArray(data)) return false;
      const subPosData = [];
      const posData = data.map((item, index) => {
        const lockData = {
          coin: item.baseCoin,
          time: formatTime(item.ltimeMillis, true),
          amount: `${item.totalAmount} ${getCoinShowName(item.baseCoin, this.market.coinList)}`,
          rate: `${item.gainRate}%`,
          gainAmount: `${item.totalUserGainAmount} ${getCoinShowName(item.gainCoin, this.market.coinList)}`,
          type: 'subTable',
          status: this.countStatusText(item.projectStatus),
        };
        const unLockData = {
          coin: item.baseCoin,
          time: formatTime(item.revenueTimeMillis, true),
          amount: `${item.baseAmount} ${getCoinShowName(item.baseCoin, this.market.coinList)}`,
          rate: `${item.gainRate}%`,
          gainAmount: `${item.gainAmount} ${getCoinShowName(item.gainCoin, this.market.coinList)}`,
        };

        const subPosDataItem = !this.currentType && Array.isArray(item.userGainList)
          ? item.userGainList : [];

        const subPosDataItemAddClass = subPosDataItem.map((el) => ({
          time: formatTime(el.gainTimeMillis),
          amount: `${el.gainAmount} ${getCoinShowName(item.gainCoin, this.market.coinList)}`,
        }));

        subPosData.push(
          subPosDataItemAddClass,
        );
        const dataObj = this.currentType ? unLockData : lockData;

        return {
          id: index,
          // data: dataObj,
          ...dataObj,
        };
      });

      this.subPosData = subPosData;
      return posData;
    },
    getNowTime(time = '') {
      const date = new Date(time);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const monthStr = `${month}`.padStart(2, '0');
      const day = date.getDate();

      return `${year}-${monthStr}-${day}`;
    },
    selectType(item) {
      if (this.loading) return;
      this.paginationData = {
        total: 100, // 数据总条数
        display: 10, // 每页显示条数
        currentPage: 1, // 当前页码
      };
      this.currentType = item.index;
      this.subTableDataId = null;
      this.getUserPosData(this.currentType);
    },
    timeSelect(time = []) {
      this.startTime = time.length ? this.getNowTime(time[0]) : '';
      this.endTime = time.length ? this.getNowTime(time[1]) : '';
      // if (this.startTime && this.endTime) {
      this.paginationData = {
        total: 100, // 数据总条数
        display: 10, // 每页显示条数
        currentPage: 1, // 当前页码
      };
      this.reducePost();
      // }
    },
    countStatusText(status) {
      const statusText = {
        0: this.$t('freeStaking.home.status[0]'),
        1: this.$t('freeStaking.home.status[1]'),
        2: this.$t('freeStaking.home.status[2]'),
        3: this.$t('freeStaking.home.status[3]'),
        4: this.$t('freeStaking.home.status[4]'),
        5: this.$t('freeStaking.home.status[5]'),
        6: this.$t('freeStaking.home.status[6]'),
      };
      return statusText[status];
    },
    pagechange(e) {
      if (this.loading) return;
      this.paginationData.currentPage = e;
      this.subTableDataId = null;
      this.getUserPosData(this.currentType);
    },
    tableClick(element, id) {
      if (!this.currentType && this.subTableDataId !== id) {
        this.subTableData = this.subPosData[id];
        this.subTableDataId = id;
      } else {
        this.subTableData = null;
        this.subTableDataId = null;
      }
    },
  },
};
