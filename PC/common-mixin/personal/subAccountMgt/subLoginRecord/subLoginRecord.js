// eslint-disable-next-line import/named
import { colorMap, formatTime } from '@/utils';

export default {
  name: 'subOrderMgt',
  data() {
    return {
      colorMap,
      nowType: 1,
      paginationObj: {
        total: 0, // 数据总条数
        display: 13, // 每页显示条数
        currentPage: 1, // 当前页码
      },
      tableList: [],
      tableLoading: false,
      selectAccountList: [],
      selAccount: 0, // 当前查询的子账户
    };
  },
  methods: {
    init() {
      this.getSelAccountList();
      this.getTableList();
    },
    getSelAccountList() {
      this.axios({
        url: this.$store.state.url.subAccount.common_getAllSub,
        method: 'post',
      }).then((data) => {
        if (data.code.toString() === '0') {
          this.selectAccountList = data.data.list.map((it) => ({
            value: it.email,
            code: it.subUid,
          }));
          this.selectAccountList.unshift({ value: this.$t('subAccount.common.sel_allSub'), code: 0 });
        } else {
          this.selectAccountList = [{ value: this.$t('subAccount.common.sel_allSub'), code: 0 }];
        }
      });
    },
    getTableList() {
      this.tableLoading = true;
      const req = {
        page: this.paginationObj.currentPage,
        pageSize: this.paginationObj.display,
        subUid: this.selAccount || null, // 查询的子账户ID
      };
      this.axios({
        url: this.$store.state.url.subAccount.login_record,
        params: req,
        method: 'post',
      }).then((data) => {
        if (data.code.toString() === '0') {
          const arr = [];
          if (data.data.historyLoginList && data.data.historyLoginList.length) {
            // eslint-disable-next-line array-callback-return
            data.data.historyLoginList.map((item) => {
              arr.push({
                email: item.email,
                formatLgInTime: this.formatTimeFn(item.lgInTime),
                lgPlatform: item.lgPlatform,
                lgIp: item.lgIp,
                lgStatus: item.lgStatus,
              });
            });
          }
          this.tableList = arr;
          this.paginationObj.total = data.data.count;
          this.tableLoading = false;
        } else {
          this.tableList = [];
        }
      });
    },
    pageChange(v) {
      this.paginationObj.currentPage = v;
      this.getTableList();
    },
    selectChange(item, name) {
      this[name] = item.code;
      this.getTableList();
    },
    formatTimeFn(date) {
      return formatTime(date);
    },
  },
  computed: {
    columns() {
      return [
        { key: 'email', title: this.$t('subAccount.assets.home.table_c1'), width: '25%' }, // 子账户邮箱
        { key: 'formatLgInTime', title: this.$t('subAccount.other.text25'), width: '25%' }, // 登录时间
        { key: 'lgPlatform', title: this.$t('subAccount.other.text26'), width: '15%' }, // 登录方式
        { key: 'lgIp', title: this.$t('subAccount.other.text27'), width: '25%' }, // IP地址
        { key: 'lgStatus', title: this.$t('subAccount.other.text28'), width: '10%' }, // 状态
      ];
    },
  },
};
