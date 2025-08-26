import { imgMap, nul } from '@/utils';

export default {
  data() {
    return {
      currentTab: 1,
      lineHeight: '55',
      marginRight: 50, // 距离右边的距离
      userName: '', // 用户名称
      scaleReturn: '--', // 直推返佣
      scaleSub: null, // 子经济分佣
      roleType: '0', // 经纪人角色类型
      rangeReturnRate: '', // 极差返佣比例
      roleName: '--', // 角色名称
      reqData: {}, // 返回的数据
      reqReady: false, // 返回数据是否成功
      bonusInfo: {},
      coCommonPublic: {},
      inviteUrl: '', // 邀请链接
      inviteCode: '', // 邀请码

      subBrokerVisible: false, // 添加下级经纪人弹框
      roleId: '', // 经纪人角色
      roleInfoErrorText: '',
      roleInfo: '', // UID/邮箱/手机号码
      roleInfoDisabled: false,
      selectList: [],
      dialogConfirmLoading: false, // 弹窗按钮确认loading状态
      titleText: '',
      searchUid: '',
      rowId: '',

      cancellationVisible: false, // 删除下级经纪人弹框
      iconHover: false,
      scaleList: [],
    };
  },
  computed: {
    scaleTip() {
      const levelStr = this.scaleList.map((item, index) => `<div>${this.$t('common.level', { count: index + 1 })}:<span>${nul(item, 100)}%</span></div>`);
      return `
        <div class="tip_container">
          <div class="tip_title">${this.$t('brokerSystem.extremeCommission.rebateRate')}</div> 
          ${levelStr.join('')}
        </div>
      `;
    },
    roleIdFlag() {
      if (!this.roleId) return true;
      return false;
    },
    roleInfoFlag() {
      if (this.roleInfo.length === 0) return true;
      return false;
    },
    navTab() {
      const arr = [
        {
          name: this.$t('brokerSystem.navTab[0]'),
          index: 1,
        },
        {
          name: this.$t('brokerSystem.navTab[1]'),
          index: 2,
        },
        {
          name: this.$t('brokerSystem.navTab[2]'),
          index: 3,
        },

      ];
      if (this.coCommonPublic && this.coCommonPublic.isStudio === '1') {
        arr.push({
          name: this.$t('studio.studioText1'), // '工作室',
          index: 6,
        });
      }
      if (this.roleType !== '0') {
        arr.push({
          name: this.$t('brokerSystem.extremeCommission.brokerManagement'),
          index: 7,
        });
      }
      return arr;
    },
    customStyle() {
      let style = null;
      if (this.currentTab === 1 || this.currentTab === 7) {
        style = {
          backgroundImage: `url(${imgMap.broker_one})`,
        };
      } if (this.currentTab === 2 || this.currentTab === 3) {
        style = {
          backgroundImage: `url(${imgMap.broker_two})`,
        };
      }
      return style;
    },
    userInfo() {
      return this.$store.state.baseData.userInfo;
    },
    coComminPublicData() {
      return this.$store.state.personal.coComminPublic;
    },
    // 弹窗确认按钮disabled
    dialogConfirmDisabled() {
      if ((!this.roleIdFlag && !this.roleInfoFlag) || this.dialogConfirmLoading) {
        return false;
      }
      return true;
    },
  },
  watch: {
    userInfo: {
      immediate: true,
      handler(v) {
        if (v) {
          this.userInfoReady();
        }
      },
    },
    coComminPublicData(val) {
      this.coCommonPublic = val;
    },
  },
  methods: {
    init() {
      this.coCommonPublic = this.coComminPublicData;
      this.$bus.$on('CO-COMMON-PUBLIC', (data) => {
        this.coCommonPublic = data;
      });
      this.getData();
    },
    currentType(data) {
      this.currentTab = data.index;
    },
    userInfoReady() {
      this.userName = this.userInfo.mobileNumber !== ''
        ? this.userInfo.mobileNumber
        : this.userInfo.email; // 有电话号码显示电话号码,无则显示邮箱
      this.inviteUrl = this.userInfo.inviteUrl; // 邀请链接
      this.inviteCode = this.userInfo.inviteCode; // 邀请码
    },
    getData() {
      // const data = {
      //   scale_info: {
      //     scale_return: '10',
      //     scale_sub: '100',
      //   },
      //   bonus_info: {
      //     amount_total: '1000',
      //     amount_yesterday: '1000',
      //     amount_yesterday_rate: '1',
      //     amount_b_yesterday: '100',
      //     amount_b_yesterday_rate: '0',
      //     amount_return: '100',
      //     amount_sub: '1000',
      //   },
      //   bonus_week: [
      //     { time: 1583020800000, amount: '1' },
      //     { time: 1583107200000, amount: '2' },
      //     { time: 1583193600000, amount: '3' },
      //     { time: 1583280000000, amount: '4' },
      //     { time: 1583366400000, amount: '5' },
      //     { time: 1583452800000, amount: '6' },
      //     { time: 1583539200000, amount: '7' },
      //   ],
      //   child_info: {
      //     count_total: '1',
      //     count_agent: '3',
      //     count_common: '2',
      //     count_bonus: '4',
      //   },
      //   user_return: [
      //     { username: '213123', amount: '1' },
      //     { username: '123', amount: '2' },
      //     { username: '12113', amount: '3' },
      //   ],
      //   user_sub: [
      //     { username: '213123', amount: '4' },
      //     { username: '123', amount: '5' },
      //     { username: '12113', amount: '6' },
      //   ],
      // };
      this.axios({
        url: 'co/agent/index',
        hostType: 'ex',
      }).then((data) => {
        if (data.code.toString() === '0') {
          this.setData(data.data);
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
    setData(data) {
      this.reqReady = true;
      this.reqData = data;
      this.bonusInfo = data.bonus_info;
      this.roleName = data.role_name;
      // 处理数据
      const scaleInfo = data.scale_info;
      if (scaleInfo.length > 0) {
        const scaleList = scaleInfo.map((item) => item.scale);
        const min = Math.min.apply(Math, scaleList);
        const max = Math.max.apply(Math, scaleList);
        let showStr = '';
        if (min === max) {
          showStr = `${nul(min, 100)}%`;
        } else {
          showStr = `${nul(min, 100)}% ～ ${nul(max, 100)}%`;
        }
        this.scaleReturn = showStr;
        const list = [];
        scaleInfo.forEach(({ level, scale }) => {
          list[level - 1] = scale;
        });
        this.scaleList = list;
      }
      this.scaleSub = !!scaleInfo[0];
      this.roleType = this.reqData.role_type === undefined ? '0' : `${this.reqData.role_type}`;
      this.rangeReturnRate = scaleInfo[0] ? nul(scaleInfo[0].scale, 100) : null;
    },
    // 复制邀请链接
    copy(type) {
      // this.$bus.$emit('tip', { text: this.$t('personal.prompt.copySucces'), type: 'success' });
      let save;
      if (type === 'link') {
        save = (e) => {
          e.clipboardData.setData('text/plain', this.inviteUrl); // 下面会说到clipboardData对象
          e.preventDefault(); // 阻止默认行为
        };
      }
      if (type === 'code') {
        save = (e) => {
          e.clipboardData.setData('text/plain', this.inviteCode); // 下面会说到clipboardData对象
          e.preventDefault(); // 阻止默认行为
        };
      }
      document.addEventListener('copy', save);
      document.execCommand('copy'); // 使文档处于可编辑状态，否则无效
      document.removeEventListener('copy', save);
      this.$bus.$emit('tip', {
        text: this.$t('personal.prompt.copySucces'),
        type: 'success',
      });
    },
    getOptions() {
      this.axios({
        url: 'co/agent/range_drop_info_list',
        hostType: 'ex',
        params: { uid: this.searchUid },
      }).then((data) => {
        this.loading = false;
        if (data.code.toString() === '0') {
          this.selectList = data.data.list.map((item) => ({
            code: item.id,
            value: item.roleInfo,
          }));
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
    // 添加下级经纪人
    handleAddSubBroker() {
      const { userInfo } = this.$store.state.baseData;
      this.searchUid = userInfo.id;
      this.roleId = '';
      this.roleInfo = '';
      this.getOptions();
      this.titleText = this.$t('brokerSystem.extremeCommission.addSubBroker');
      this.subBrokerVisible = true;
      this.roleInfoDisabled = false;
    },
    // 修改下级经纪人
    handleEditSubBroker(row) {
      const { userInfo } = this.$store.state.baseData;
      this.searchUid = userInfo.id;
      this.roleId = row.roleId;
      this.roleInfo = `${row.uid}`;
      this.getOptions();
      this.titleText = this.$t('brokerSystem.extremeCommission.editSubBroker');
      this.subBrokerVisible = true;
      this.roleInfoDisabled = true;
      this.rowId = row.id;
    },
    // 关闭 下级经纪人
    closeSubBroker() {
      this.subBrokerVisible = false;
      this.roleId = '';
      this.roleInfo = '';
      this.searchUid = '';
    },
    // 提交 下级经纪人
    confirmSubBroker() {
      const params = {
        roleInfo: this.roleInfo,
        roleId: this.roleId,
        uid: this.searchUid,
        status: '1', // 状态   0:删除，1:正常
      };
      if (this.roleInfoDisabled) {
        params.id = this.rowId;
      }
      this.dialogConfirmLoading = true;
      this.axios({
        url: 'co/agent/range_user_set',
        hostType: 'ex',
        params,
      }).then((data) => {
        this.dialogConfirmLoading = false;
        if (data.code.toString() === '0') {
          this.$bus.$emit('tip', { text: data.msg, type: 'success' });
          this.$bus.$emit('broker_extremeCommission');
          this.subBrokerVisible = false;
          this.roleId = '';
          this.roleInfo = '';
          this.searchUid = '';
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
    inputChange(v, name) {
      this[name] = v;
    },
    // 修改
    selectChange(item, name) {
      this[name] = item.code;
    },
    // 删除下级经纪人
    handleDeleteSubBroker(row) {
      this.cancellationVisible = true;
      const { userInfo } = this.$store.state.baseData;
      this.searchUid = userInfo.id;
      this.roleId = row.roleId;
      this.roleInfo = row.uid;
      this.rowId = row.id;
    },
    closeCancellation() {
      this.cancellationVisible = false;
    },
    confirmCancellation() {
      const params = {
        roleInfo: this.roleInfo,
        roleId: this.roleId,
        uid: this.searchUid,
        id: this.rowId,
        status: '0', // 状态   0:删除，1:正常
      };

      this.dialogConfirmLoading = true;
      this.axios({
        url: 'co/agent/range_user_set',
        hostType: 'ex',
        params,
      }).then((data) => {
        this.dialogConfirmLoading = false;
        if (data.code.toString() === '0') {
          this.$bus.$emit('tip', { text: data.msg, type: 'success' });
          this.cancellationVisible = false;
          this.searchUid = '';
          this.$bus.$emit('broker_extremeCommission');
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
  },
};
