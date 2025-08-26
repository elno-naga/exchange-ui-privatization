import {
  colorMap, formatTime, imgMap, getIconPath,
} from '@/utils';

export default {
  name: 'subAccountMgt',
  // this.$bus.$emit('tip', { text: data.msg, type: 'error' });
  data() {
    return {
      colorMap,
      imgMap,
      selStatus: 2, // 子账户状态
      selAccount: 0, // 子账户
      selectAccountList: [], // 子账号下拉列表
      contentLoading: true,
      tableList: [], // 表格数据
      tableLoading: true, // 表格 loading
      addDialogFlag: false, // 添加子账户弹窗
      editRemarkDialogFlag: false, // 编辑子账户备注
      remarkDialogLoading: false, // 编辑子账户备注弹窗确认loading
      editRemark: '', // 修改的备注
      isFreezeDialogFlag: false, // 是否冻结、解冻子账户
      isFreezeDialogLoading: false, // 是否冻结、loading
      currentRow: {}, // 当前编辑的行
      isFreeze: '0', // 0 是冻结  1 是解冻
      isShowMoreTool: false, // 是否显示更多弹窗
      editPwdDialogFlag: false, // 修改密码弹窗
      editEmailDialogFlag: false, // 修改邮箱弹窗
      disableDialogFlag: false, // 禁用账户
      disableDialogLoading: false, // 禁用账户确定loading
      isDisable: true, // 该账户是否含有子资产，是否支持禁用
      disableText: '', // 无法禁用的文字
      subContent: [], // 表格详情展开数据
      subContentId: null, // 展开的id
      subLoading: false, // 展开的loading
      verifyAccountDialogFlag: false, // 账户验证
      formData: {}, // 传给二次验证弹框的表单信息
      optionType: '', // 传给二次验证弹框：add添加，edit编辑，
      saveVerifyDialogFlag: false, // 禁用母账户二次验证
      saveVerifyDialogLoading: false,
      saveCode: '',
      hoverItemType: '',
      tableSelectParent: '',
      tableSelectOptions: [],
    };
  },
  watch: {
  },
  methods: {
    async init() {
      this.selectAccountList = await this.getSelAccountList(); // 获取下拉数据
      this.getTableList(); // 获取表格数据
      this.contentLoading = false;
    },
    getIconPath,
    getSelAccountList() {
      return new Promise((resolve) => {
        this.axios({
          url: this.$store.state.url.subAccount.common_getAllSub,
          method: 'post',
        }).then((data) => {
          if (data.code.toString() === '0') {
            const tempList = data.data.list.map((it) => ({
              value: it.email,
              code: it.subUid,
            }));
            tempList.unshift({ value: this.$t('subAccount.common.sel_allSub'), code: 0 });
            resolve(tempList);
          } else {
            resolve([]);
          }
        });
      });
    },
    getTableList() {
      this.tableLoading = true;
      const req = {
        subUid: this.selAccount || null, // 查询的子账户ID
        subFreezeStatus: this.selStatus === 2 ? null : this.selStatus, // 查询的子账户状态
      };
      this.axios({
        url: this.$store.state.url.subAccount.subAcc_tableUrl,
        params: req,
        method: 'post',
      }).then(async (data) => {
        if (data.code.toString() === '0') {
          this.tableList = data.data.list.map((it) => {
            const tempObj = it;
            const { loginType } = it;
            tempObj.id = it.subUid;
            let arr = [
              {
                // 修改密码
                text: this.$t('subAccount.subAcc.add_op1'),
                type: 'editPwd',
                loginType,
              },
              {
                // 修改邮箱
                text: this.$t('subAccount.subAcc.add_op2'),
                type: 'editEmail',
                loginType,
              },
            ];
            // 杠杆账户
            if (this.leverOpen) {
              arr.push({
                // 允许杠杆
                text: it.leverStatus ? this.$t('subAccount.subAcc.text3') : this.$t('subAccount.subAcc.add_op3'),
                type: 'allowLever',
                show: 'leverStatus',
                loginType,
              });
            }
            // 合约账户
            if (this.linkurl.coUrl) {
              arr.push({
                // 允许合约
                text: it.contractStatus ? this.$t('subAccount.subAcc.text4') : this.$t('subAccount.subAcc.add_op4'),
                type: 'allowContract',
                show: 'contractStatus',
                loginType,
              });
            }
            arr.push({
              // 允许ETF
              text: it.etfStatus ? this.$t('subAccount.subAcc.text5') : this.$t('subAccount.subAcc.add_op5'),
              type: 'allowETF',
              show: 'etfStatus',
              loginType,
            });
            arr = [
              ...arr,
              {
                // 允许充值
                text: it.depositStatus ? this.$t('subAccount.subAcc.text6') : this.$t('subAccount.subAcc.text2'),
                type: 'allowRecharge',
                show: 'depositStatus',
                loginType,
              },
              {
                // 禁用账户
                text: this.$t('subAccount.subAcc.add_op6'),
                type: 'disable',
                show: 'status',
                loginType,
              },
            ];
            tempObj.moreOperation = arr;
            tempObj.remarkClip = it.remark;
            if (it.remark && it.remark.length > 7) {
              tempObj.remarkClip = `${it.remark.slice(0, 3)}...${it.remark.slice(-4)}`;
            }
            return tempObj;
          });
          this.tableLoading = false;
          this.selectAccountList = await this.getSelAccountList(); // 刷新一下拉数据
        } else {
          this.tableList = [];
        }
      });
    },
    opDialogFn(name) {
      this[name] = true;
    },
    dialogClose(name) {
      this[name] = false;
    },
    inputChange(value, name) {
      this[name] = value;
    },
    // 选择币种
    selectChange(item, name) {
      this[name] = item.code;
      this.getTableList();
    },
    // 确认创建
    addAccountConfirm(req) {
      // 二次验证 虚拟账户0无需二次校验，邮箱1需要
      if (req.loginType) {
        this.formData = req;
        this.optionType = 'add';
        this.addDialogFlag = false;
        this.verifyAccountDialogFlag = true;
      } else {
        this.addDialogFlag = false;
        this.getTableList();
      }
    },
    // 确认修改密码
    editAccountConfirm(req) {
      this.formData = req;
      this.optionType = 'edit';
      this.editPwdDialogFlag = false;
      this.verifyAccountDialogFlag = true;
    },
    // 确认修改邮箱
    editEmailConfirm(req) {
      this.formData = req;
      this.optionType = 'email';
      this.editEmailDialogFlag = false;
      this.verifyAccountDialogFlag = true;
    },
    // 确认修改备注
    remarkConfirm() {
      this.editRemarkDialogFlag = true;
      const req = {
        subUid: this.currentRow.subUid,
        remark: this.editRemark,
      };
      this.axios({
        url: this.$store.state.url.subAccount.addSub_editRemark,
        params: req,
        method: 'post',
      }).then((resp) => {
        this.editRemarkDialogFlag = false;
        if (resp.code.toString() === '0') {
          this.getTableList();
          this.remarkDialogLoading = false;
          // 修改成功
          this.$bus.$emit('tip', { text: this.$t('subAccount.common.message1'), type: 'success' });
        } else {
          this.$bus.$emit('tip', { text: resp.msg, type: 'error' });
        }
      });
    },
    // 确认冻结/解冻
    isFreezeConfirm() {
      this.isFreezeDialogLoading = true;
      const req = {
        subUid: this.currentRow.subUid,
        freezeStatus: this.isFreeze === '1' ? 1 : 0, // 0冻结，1解冻
      };
      this.axios({
        url: this.$store.state.url.subAccount.addSub_freeze,
        params: req,
        method: 'post',
      }).then((resp) => {
        this.isFreezeDialogLoading = false;
        if (resp.code.toString() === '0') {
          this.getTableList();
          this.isFreezeDialogFlag = false;
          // 操作成功
          this.$bus.$emit('tip', { text: this.$t('subAccount.common.message2'), type: 'success' });
        } else {
          this.$bus.$emit('tip', { text: resp.msg, type: 'error' });
        }
      });
    },
    // 禁用二次验证确认
    saveVerifyConfirm() {
      if (this.momDisabledError || !this.saveCode) return;

      this.saveVerifyDialogLoading = true;
      const req = {
        subUid: this.currentRow.subUid,
      };
      if (this.verifyType === '1') {
        req.googleCode = this.saveCode;
      } else if (this.verifyType === '2') {
        if (this.smsType === 'sms') {
          req.smsValidCode = this.saveCode;
        } else {
          req.smsValidCode = this.saveCode;
        }
      } else {
        req.emailCode = this.saveCode;
      }
      this.axios({
        url: this.$store.state.url.subAccount.addSub_disable,
        params: req,
        method: 'post',
      }).then((resp) => {
        this.saveVerifyDialogLoading = false;
        if (resp.code.toString() === '0') {
          this.$bus.$emit('tip', { text: this.$t('subAccount.common.message3'), type: 'success' });
          this.saveVerifyDialogFlag = false;
          this.getTableList();
        } else {
          this.$bus.$emit('tip', { text: resp.msg, type: 'error' });
        }
      });
    },
    // 检查子账户是否可禁用
    disableAccountConfirm() {
      if (this.isDisable) {
        this.disableDialogLoading = true;
        const req = {
          subUid: this.currentRow.subUid,
        };
        // isDisable disableText
        this.axios({
          url: this.$store.state.url.subAccount.addSub_checkDisable,
          params: req,
          method: 'post',
        }).then((resp) => {
          this.disableDialogLoading = false;
          if (resp.code.toString() === '0') {
          // this.getTableList();
            this.disableDialogFlag = false;
            this.saveCode = ''; // 清空上一次输入的验证码
            // 打开二次验证弹窗
            this.saveVerifyDialogFlag = true;
          } else {
            this.isDisable = false;
            this.disableText = resp.msg;
          }
        });
      } else {
        this.disableDialogFlag = false;
      }
    },
    isShowPwd(flag) {
      this.pwdFlag = flag;
    },
    // 表格操作
    tableClick(type, row, show) {
      if (type === 'freeze' || type === 'unfreeze') {
        // 解冻、冻结
        this.currentRow = row;
        if (type === 'unfreeze') this.isFreeze = '1';
        if (type === 'freeze') this.isFreeze = '0';
        this.isFreezeDialogFlag = true;
      } else if (type === 'editPwd') {
        // 修改密码
        this.currentRow = row;
        this.editPwdDialogFlag = true;
      } else if (type === 'editEmail') {
        // 修改邮箱
        this.currentRow = row;
        this.editEmailDialogFlag = true;
      } else if (
        type === 'allowLever'
        || type === 'allowContract'
        || type === 'allowETF'
        || type === 'allowRecharge'
      ) {
        // 允许杠杆允许合约允许ETF
        if (row[show]) {
        // 不为已开启状态可操作，调接口
        // console.log('允许');
          let str = '';
          if (type === 'allowLever') str = 'lever';
          if (type === 'allowContract') str = 'contract';
          if (type === 'allowETF') str = 'etf';
          if (type === 'allowRecharge') str = 'deposit';
          this.editTradeStatus(str, row, 0);
        } else {
          let str = '';
          if (type === 'allowLever') str = 'lever';
          if (type === 'allowContract') str = 'contract';
          if (type === 'allowETF') str = 'etf';
          if (type === 'allowRecharge') str = 'deposit';
          this.editTradeStatus(str, row, 1);
        }
      } else if (type === 'disable') {
        this.currentRow = row;
        this.isDisable = true;
        this.disableDialogFlag = true;
      } else if (type === 'detail') {
        this.getSubTableData(row.subUid);
      } else if (type === 'editRemark') {
        this.currentRow = row;
        this.editRemark = '';
        this.editRemarkDialogFlag = true;
      }
    },
    tableSelectChange(item) {
      this.isShowMoreTool = false;
      this.tableClick(item.type, this.currentRow, item.show);
    },
    // 修改交易状态
    editTradeStatus(type, row, num) {
      const req = {
        subUid: row.subUid,
        type,
        status: num,
      };
      this.axios({
        url: this.$store.state.url.subAccount.addSub_editTrade,
        params: req,
        method: 'post',
      }).then((resp) => {
        if (resp.code.toString() === '0') {
          this.getTableList();
          // 操作成功
          this.$bus.$emit('tip', { text: this.$t('subAccount.common.message2'), type: 'success' });
        } else {
          this.$bus.$emit('tip', { text: resp.msg, type: 'error' });
        }
      });
    },
    // 展示更多操作
    tableEnter(row) {
      this.currentRow = row;
      this.tableSelectParent = `.table-btn_item${row.subUid}`;
      this.tableSelectOptions = row.moreOperation;
      this.$nextTick(() => {
        this.isShowMoreTool = true;
        this.setToolFn();
      });
      this.hoverItemType = '';
    },
    setToolFn() {
      if (this.tableList.length < 12) return;
      const curRowIndex = this.tableList.findIndex((item) => item.subUid === this.currentRow.subUid);
      const tempScrollDom = document.querySelector('.sub_content').querySelector('.__panel');
      const topNum = tempScrollDom.scrollTop;
      const curMoreToolDom = document.querySelectorAll('.more-option-box');
      if (topNum > 0 && curRowIndex >= 11) {
        curMoreToolDom[curRowIndex].style.top = `-${curMoreToolDom[curRowIndex].offsetHeight - 15}px`;
      } else if (topNum === 0 && curRowIndex >= 10) {
        curMoreToolDom[curRowIndex].style.top = `-${curMoreToolDom[curRowIndex].offsetHeight - 15}px`;
      } else {
        curMoreToolDom[curRowIndex].style.top = '45px';
      }
    },
    // 隐藏更多操作
    tableLeave() {
      this.isShowMoreTool = false;
    },
    optionOver(type) {
      this.hoverItemType = type;
    },
    getCLass(item, row) {
      let tempClass = ''; // 默认位启用的class
      if (item.show) {
        tempClass = row[item.show] ? 'text-2-cl' : '';
      }
      if (item.type === 'disable') {
        tempClass = row[item.show] ? '' : 'text-2-cl';
      }
      if (this.hoverItemType === item.type) {
        tempClass = 'fill-3-bg';
      }
      return tempClass;
    },
    // 查看详情
    getSubTableData(v) {
      if (this.subContentId === v) {
        this.subContentId = null;
      } else {
        const curInfo = this.tableList.filter((it) => it.id === v)[0];
        this.subContent = [];
        this.subContentId = v;
        this.subContent.push({
          subUid: curInfo.subUid || '--',
          ctime: formatTime(curInfo.ctime) || '--',
          loginType: curInfo.loginType ? this.$t('subAccount.subAcc.subTable_loginType') : '--',
          mobileNumber: curInfo.mobileNumber || '--',
        });
        this.$nextTick(() => {
          this.setTableScrollFn(v);
        });
      }
    },
    // 最后几个详情展开时，滚动条自动下移
    setTableScrollFn(id) {
      const curRowIndex = this.tableList.findIndex((item) => item.subUid === id);
      const bodyScrollTopNum = document.documentElement.scrollTop;
      const bodyHeight = document.documentElement.clientHeight - 210;
      const minRowNum = parseInt(bodyHeight / 60, 0);
      const minHeight = ((curRowIndex - (minRowNum - 2)) * 60) + 90;
      if (bodyScrollTopNum <= minHeight && curRowIndex >= minRowNum - 2) {
        document.documentElement.scrollTop = minHeight;
      }
      if (this.tableList.length < 13) return;
      const tempScrollDom = document.querySelector('.sub_content').querySelector('.__panel');
      if (curRowIndex >= 12) {
        tempScrollDom.scrollTop = ((curRowIndex - 12) * 60) + 30;
      }
    },
    // 二次验证完成
    verifyConfirm() {
      this.verifyAccountDialogFlag = false;
      this.getTableList(); // 获取表格数据
    },
    // 获取验证码
    getCodeClick(name, type) {
      this.sendSmsCode(name, type);
    },
    // 发送验证码
    sendSmsCode(name, type) {
      this.axios({
        url: 'v4/common/smsValidCode',
        params: {
          operationType: '220',
          smsType: type && type === 'voiceSms' ? '1' : '0',
        },
      }).then((data) => {
        if (data.code.toString() !== '0') {
          setTimeout(() => {
            // 倒计时重置
            this.$bus.$emit('getCode-clear', 'verifyGetCode');
            // tip框提示错误
            this.$bus.$emit('tip', { text: data.msg, type: 'error' });
          }, 2000);
        } else {
          const successText = type && type === 'voiceSms'
            ? this.$t('login.voiceSendSuccess')
            : this.$t('login.phoneSendSuccess');
          this.$bus.$emit('tip', { text: successText, type: 'success' });
          this.smsType = type === 'sms' ? 'sms' : 'voiceSms';
        }
      });
    },
    // 邮箱验证码
    getEmailCodeClick() {
      this.axios({
        url: 'v4/common/emailValidCode',
        params: {
          operationType: '220',
        },
      }).then((data) => {
        if (data.code.toString() !== '0') {
          setTimeout(() => {
            // 倒计时重置
            this.$bus.$emit('getCode-clear', 'verifyGetEmailCode');
            // tip框提示错误
            this.$bus.$emit('tip', { text: data.msg, type: 'error' });
          }, 2000);
        } else {
          this.$bus.$emit('tip', {
            text: this.$t('register.emailSendSuccess'),
            type: 'success',
          });
        }
      });
    },
  },
  computed: {
    publicInfo() {
      return this.$store.state.baseData.publicInfo;
    },
    // 逐仓杠杆开关
    leverOpen() {
      return this.publicInfo && this.publicInfo.switch && this.publicInfo.switch.lever_open === '1';
    },
    linkurl() {
      if (this.$store.state.baseData.publicInfo) {
        return this.$store.state.baseData.publicInfo.url;
      }
      return {};
    },
    selStatusList() {
      return [
        { value: this.$t('subAccount.common.sel_allStatus'), code: 2 },
        { value: this.$t('subAccount.common.selStatus_normal'), code: 1 },
        { value: this.$t('subAccount.common.selStatus_freeze'), code: 0 },
      ];
    },
    userInfo() {
      return this.$store.state.baseData.userInfo;
    },
    userText() {
      if (this.userInfo) {
        return this.userInfo.userAccount;
      }
      return '';
    },
    // 表格title
    columns() {
      const arr = [
        { key: 'email', title: this.$t('subAccount.subAcc.table_c1'), width: '220px' }, // 子账户邮箱
        { key: 'freezeStatus', title: this.$t('subAccount.subAcc.table_c2') }, // 状态
        { key: 'remark', title: this.$t('subAccount.subAcc.table_c3') }, // 备注
        { key: 'googleStatus', title: this.$t('subAccount.subAcc.table_c4') }, // 谷歌二次验证
      ];
      // 杠杆账户
      if (this.leverOpen) {
        arr.push({ key: 'leverStatus', title: this.$t('subAccount.subAcc.table_c5') });
      }
      // 合约账户
      if (this.linkurl.coUrl) {
        arr.push({ key: 'contractStatus', title: this.$t('subAccount.subAcc.table_c6') });
      }
      arr.push({ key: 'etfStatus', title: this.$t('subAccount.subAcc.table_c7') });
      return [
        ...arr,
        { key: 'depositStatus', title: this.$t('subAccount.subAcc.text1') }, // 充值
        {
          key: 'operation', title: this.$t('subAccount.assets.home.table_c4'), width: '180px', align: 'right',
        }, // 操作
      ];
    },
    // 表格详情
    subColumns() {
      return [
        { key: 'subUid', title: 'UID', width: '25%' }, // 币种
        { key: 'ctime', title: this.$t('subAccount.subAcc.subTable_c1'), width: '25%' }, // 创建日期
        { key: 'loginType', title: this.$t('subAccount.subAcc.subTable_c2'), width: '25%' }, // 邮箱验证
        { key: 'mobileNumber', title: this.$t('subAccount.subAcc.subTable_c3'), width: '25%' }, // 手机号
      ];
    },
    // 母账户验证 是否复合正则验证
    momDisabledFlag() { return this.$store.state.regExp.verification.test(this.saveCode); },
    momDisabledError() {
      if (this.saveCode.length !== 0 && !this.momDisabledFlag) return true;
      return false;
    },
    // 用户是否开启手机
    OpenMobile() {
      let flag = false;
      const { userInfo } = this.$store.state.baseData;
      if (userInfo && userInfo.isOpenMobileCheck.toString() === '1') {
        flag = true;
      }
      return flag;
    },
    // 语音短信开关
    voiceSmsOpen() {
      return this.$store.state.baseData.voiceSmsOpen;
    },
    // 用户是否开启谷歌
    OpenGoogle() {
      let flag = false;
      const { userInfo } = this.$store.state.baseData;
      if (userInfo && userInfo.googleStatus.toString() === '1') {
        flag = true;
      }
      return flag;
    },
    verifyType() {
      let str = '1';
      // 1谷歌  2手机  3邮箱
      if (!this.OpenGoogle && this.OpenMobile) {
        str = '2';
      } else if (!this.OpenGoogle && !this.OpenMobile) {
        str = '3';
      }
      return str;
    },
    getVerifyPromptText() {
      let str = '';
      switch (this.verifyType) {
        case '1':
          str = this.$t('subAccount.common.verifiy_p1'); // 请输入谷歌验证码
          break;
        case '2':
          str = this.$t('subAccount.common.verifiy_p2'); // 请输入手机验证码
          break;
        case '3':
          str = this.$t('subAccount.common.verifiy_p3'); // 请输入收到的6位数验证码
          break;
        default:
          str = '';
      }
      return str;
    },
    getVerifyTitleText() {
      let str = '';
      switch (this.verifyType) {
        case '1':
          str = this.$t('subAccount.common.verifiy_t1'); // 谷歌验证
          break;
        case '2':
          str = this.$t('subAccount.common.verifiy_t2'); // 手机验证
          break;
        case '3':
          str = this.$t('subAccount.common.verifiy_t3'); // 邮箱验证
          break;
        default:
          str = '';
      }
      return str;
    },
    getErrorPromptText() {
      let str = '';
      switch (this.verifyType) {
        case '1':
          str = this.$t('login.googleCodeError'); // 请输入6位数字谷歌验证码
          break;
        case '2':
          str = this.$t('login.phoneCodeError'); // 请输入手机验证码
          break;
        case '3':
          str = this.$t('login.emailCodeError'); // 请输入6位数字邮箱验证码
          break;
        default:
          str = this.$t('login.codeError'); // 请输入6位数字验证码
      }
      return str;
    },
  },
};
