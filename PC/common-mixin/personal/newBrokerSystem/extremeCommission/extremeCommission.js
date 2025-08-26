import {
  imgMap, colorMap, formatTime, nul,
  //  fixD,
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
      paginationObj: {
        total: 0, // 数据总条数
        currentPage: 1, // 当前页码
        display: 10, // 每页显示条数
      },
    };
  },
  computed: {
    market() {
      return this.$store.state.baseData.market;
    },
    columns() {
      return [
        {
          title: this.$t('brokerSystem.extremeCommission.partnerid'),
          width: '25%',
          key: 'uid',
        },
        {
          title: this.$t('brokerSystem.extremeCommission.rebateRate'),
          width: '25%',
          key: 'returnScarn',
        },
        {
          title: this.$t('brokerSystem.extremeCommission.updateTime'),
          width: '25%',
          key: 'mtime',
        },
        {
          title: this.$t('brokerSystem.extremeCommission.operation'),
          width: '25%',
          key: 'operation',
        },
      ];
    },
  },
  methods: {
    // 分页器
    pagechange(v) {
      this.paginationObj.currentPage = v;
      this.getDate();
    },
    init() {
      this.getDate();
      this.$bus.$on('broker_extremeCommission', () => {
        this.paginationObj.currentPage = 1;
        this.paginationObj.display = 10;
        this.getDate();
      });
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
        url: 'co/agent/range_user_list',
        hostType: 'ex',
        params: {
          page: this.paginationObj.currentPage,
          pageSize: this.paginationObj.display,
        },
      }).then((data) => {
        this.loading = false;
        if (data.code.toString() === '0') {
          this.setDate(data.data.list);
          this.paginationObj.total = data.data.count;
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
    setDate(data) {
      const arr = [];
      data.forEach((item) => {
        // const fix = this.getFix(item.coin.toUpperCase());
        arr.push({
          id: item.id, // 合伙人id
          uid: item.uid, // 合伙人id
          roleId: item.roleId, // 合伙人id
          returnScarn: `${nul(+item.returnScale, 100)}%`, // 返佣比例
          mtime: item.mtime ? formatTime(item.mtime) : '--', // 时间
          operation: [
            {
              type: 'cancel',
              text: this.$t('common.cancel'), // 取消
            },
            {
              type: 'edit',
              text: this.$t('brokerSystem.extremeCommission.change'), // 修改
            },
          ],
        });
      });
      this.dataList = arr;
    },
    tableClick(type, row) {
      if (type === 'cancel') {
        this.handleCancel(row);
      }
      if (type === 'edit') {
        this.handleEdit(row);
      }
    },
    handleCancel(row) {
      this.$emit('deleteSubBroker', row);
    },
    handleEdit(row) {
      this.$emit('changeSubBroker', row);
    },
  },
};
