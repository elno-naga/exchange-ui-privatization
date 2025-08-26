import {
  colorMap, imgMap, getCookie, getIconPath,
} from '@/utils';

export default {
  name: 'apiMgt',
  data() {
    return {
      colorMap,
      imgMap,
      selAccount: 0, // 搜索得账户
      contentLoading: true,
      selectAccountList: [], // 全部子账户下拉列表
      apiLabel: '', // 输入的查询API 标签
      tableList: [],
      tableLoading: true,
      paginationObj: {
        total: 0, // 数据总条数
        display: 10, // 每页显示条数
        currentPage: 1, // 当前页码
      },
      addAPIDialogFlag: false, // 创建API弹窗
      addSelectAccountList: [], // 全部子账户下拉列表
      addAPIConfirmLoading: false, // 添加API确定loading
      addDialogFlag: false, // 创建子账号flag
      verifyAccountDialogFlag: false, // 添加子账户二次验证
      addAccount: '', // 添加API：子账户字段
      addRemark: '', // 添加API：备注字段
      addGoogleCode: '', // 添加API：谷歌验证码
      addPhoneCode: '', // 添加API：手机验证码
      delApiDialogFlag: false, // 删除API弹窗
      delApiDialogLoading: false, // 删除弹窗确定loading
      subContentId: '', // 当前展开的行ID
      isSaveEditDialogFlag: false, // 是否保存正在编辑的API
      isSaveEditDialogLoading: false,
      alertFlag: false, // alert变量
      currentEditRow: { }, // 当前正在编辑的行
      nextCurRow: {}, // 即将切换的行
      allowedArr: [],
      editIP: '', // 编辑时输入的IP
      optionType: '', // 添加还是编辑
      delToken: '', // 删除的token
      saveVerifyDialogFlag: false, // 保存验证弹框
      saveVerifyDialogLoading: false,
      saveGoogleCode: '', // 保存谷歌验证码
      savePhoneCode: '', // 保存手机验证码
      ipPermission: false,
      ipInputErrorText: '', // ip校验错误的提示文字
      ipConfirmArr: [], // 校验成功的IP
      formData: {}, // 保存的数据
      isHaveData: false,
      iconHover: null,
      popoverShow: false, // popover
      popoverContent: '', // popover
      popoverParent: '',
    };
  },
  watch: {
    userInfoIsReady(val) {
      if (val) {
        this.getTableList();
      }
    },
  },
  methods: {
    init() {
      this.getTableList();
    },
    getIconPath,
    copyKeyClick() {
      if (!this.currentEditRow.secretKey) {
        this.$bus.$emit('tip', { // 复制成功
          text: this.$t('tcPay.text14'),
          type: 'error',
        });
      } else {
        this.copy(this.currentEditRow && this.currentEditRow.secretKey ? this.currentEditRow.secretKey : '');
      }
    },
    copyIDClick() {
      this.copy(this.currentEditRow && this.currentEditRow.token ? this.currentEditRow.token : '');
    },
    copy(str) {
      this.$bus.$emit('tip', { text: this.$t('personal.prompt.copySucces'), type: 'success' });
      function save(e) {
        e.clipboardData.setData('text/plain', str); // 下面会说到clipboardData对象
        e.preventDefault(); // 阻止默认行为
      }
      document.addEventListener('copy', save);
      document.execCommand('copy'); // 使文档处于可编辑状态，否则无效
      document.removeEventListener('copy', save);
    },
    showPopover(content, parent) {
      this.popoverContent = content;
      this.popoverParent = parent;
      this.$nextTick(() => {
        this.popoverShow = true;
      });
    },
    closePopover() {
      this.popoverShow = false;
    },
    getSelAccountList() {
      this.axios({
        url: this.$store.state.url.subAccount.common_getAllSub,
        method: 'post',
      }).then((data) => {
        if (data.code.toString() === '0') {
          this.addSelectAccountList = data.data.list.map((it) => ({
            value: it.email,
            code: it.subUid,
          }));
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
        subUid: this.uid || null, // 查询的子账户ID
        label: this.apiLabel || null, // 查询的子账户状态
      };
      this.axios({
        url: this.$store.state.url.subAccount.apiMgt_tableList,
        params: req,
        method: 'post',
      }).then((data) => {
        if (data.code.toString() === '0') {
          this.tableList = data.data.list.map((it) => {
            const tempObj = { ...it };
            if (it.believeIps) {
              tempObj.believeIps = it.believeIps
                .split(',')
                .filter((item) => item !== '');
              tempObj.showIpFlag = true;
            } else {
              tempObj.believeIps = [];
              tempObj.showIpFlag = false;
            }
            tempObj.labelClip = it.label;
            if (it.label && it.label.length > 8) {
              tempObj.labelClip = `${it.label.slice(0, 4)}...${it.label.slice(-4)}`;
            }
            return tempObj;
          });
          this.paginationObj.total = data.data.count;
          this.tableLoading = false;
          this.isHaveData = data.data.list.length;
          this.contentLoading = false;
        } else {
          this.tableList = [];
        }
      });
    },
    pageChange(v) {
      this.paginationObj.currentPage = v;
      this.getTableList();
    },
    tableClick(type, row) {
      if (type === 'delete') {
        if (this.subContentId) {
          this.optionType = 'add';
          this.isSaveEditDialogFlag = true;
        } else {
          this.delToken = row.token;
          this.delApiDialogFlag = true;
        }
      } else if (type === 'edit' || type === 'cancel') {
        if (type === 'edit') this.optionType = 'edit';
        this.judgeHasEdit(row);
      } else if (type === 'save') {
        this.saveApiConfirm();
      }
    },
    // 判断当前是否有正在编辑的操作
    judgeHasEdit(row) {
      if (this.subContentId === row.id) {
        this.subContentId = null;
        this.currentEditRow = {};
      } else {
        if (this.subContentId) {
          this.nextCurRow = JSON.parse(JSON.stringify(row));
          this.isSaveEditDialogFlag = true;
          return;
        }
        this.currentEditRow = JSON.parse(JSON.stringify(row));
        if (this.currentEditRow.believeIps.length) {
          this.ipPermission = false;
        } else {
          this.ipPermission = true;
        }
        this.subContentId = row.id;
      }
    },
    // 选择变化
    selectChange(item, name) {
      this[name] = item.code;
      if (name === 'selAccount') {
        this.getTableList();
      }
    },
    inputChange(value, name) {
      this[name] = value;
      if (name === 'apiLabel') {
        this.getTableList();
      }
    },
    // 删除标签
    closeLabel(item) {
      const index = this.currentEditRow.believeIps.indexOf(item);
      if (index !== -1) this.currentEditRow.believeIps.splice(index, 1);
    },
    // 确认添加子账户
    addAccountConfirm(req) {
      // 二次验证 虚拟账户0无需二次校验，邮箱1需要
      if (req.loginType) {
        this.formData = req;
        this.addDialogFlag = false;
        this.verifyAccountDialogFlag = true;
      } else {
        this.addDialogFlag = false;
        // this.getSelAccountList();
      }
    },
    // 二次验证完成
    verifyConfirm() {
      this.verifyAccountDialogFlag = false;
      // this.getSelAccountList(); // 获取表格数据
    },
    // 确认创建API
    addAPIConfirm() {
      // if (!this.addAccount) return;
      if (this.OpenGoogle && this.addGoogleCodeError) return;
      if (this.OpenMobile && this.addPhoneCodeError) return;
      if (this.OpenGoogle && !this.addGoogleCode) return;
      if (this.OpenMobile && !this.addPhoneCode) return;
      const req = {
        // subUid: this.userInfo.id,
        label: this.addRemark,
        believeIps: '',
      };
      if (this.OpenGoogle) {
        req.googleCode = this.addGoogleCode;
      }
      if (this.OpenMobile) {
        if (this.smsType === 'sms') {
          req.smsValidCode = this.addPhoneCode;
        } else {
          req.smsValidCode = this.addPhoneCode;
        }
      }
      this.addAPIConfirmLoading = true;
      this.axios({
        url: this.$store.state.url.subAccount.apiMgt_addApi,
        params: req,
        method: 'post',
      }).then((resp) => {
        this.addAPIConfirmLoading = false;
        if (resp.code.toString() === '0') {
          this.$bus.$emit('tip', { text: this.$t('subAccount.common.message2'), type: 'success' });
          this.addAPIDialogFlag = false;
          this.getTableList();
          // 给的当前编辑行赋值
          this.currentEditRow = {};
          this.currentEditRow.qrCode = resp.data.qrCode;
          this.currentEditRow.token = resp.data.token;
          this.currentEditRow.secretKey = resp.data.secretKey;
          this.currentEditRow.believeIps = [];
          this.currentEditRow.id = resp.data.id;
          this.tableClick('edit', this.currentEditRow);
        } else {
          this.$bus.$emit('tip', { text: resp.msg, type: 'error' });
        }
      });
    },
    // 删除API
    delApiConfirm() {
      this.axios({
        url: this.$store.state.url.common.delete_open_api,
        params: { token: this.delToken },
        method: 'post',
      }).then((data) => {
        if (data.code.toString() === '0') {
          this.delApiDialogFlag = false;
          this.getTableList();
          this.$bus.$emit('tip', { text: this.$t('subAccount.common.message4'), type: 'success' }); // 删除成功
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
        }
      });
    },
    // 编辑时-ip权限变化
    changeIpRadio(flag) {
      this.ipPermission = flag;
    },
    // 保存API
    saveApiConfirm() {
      const tempObj = this.tableList.filter(
        (it) => it.id === this.currentEditRow.id,
      )[0];

      this.formData = {
        token: this.currentEditRow.token,
        label: tempObj.label,
        believeIps: '',
      };
      if (this.currentEditRow.believeIps.length) { this.formData.believeIps = this.currentEditRow.believeIps.join(','); }
      if (this.ipPermission) this.formData.believeIps = '';
      this.saveGoogleCode = ''; // 清空验证码
      this.savePhoneCode = ''; // 清空验证码
      this.saveVerifyDialogFlag = true;
      this.isSaveEditDialogFlag = false;
    },
    // 保存验证账户
    saveVerifyConfirm() {
      if (this.OpenGoogle && this.momGoogleError) return;
      if (this.OpenGoogle && !this.saveGoogleCode) return;
      if (this.OpenMobile && this.momPhoneError) return;
      if (this.OpenMobile && !this.savePhoneCode) return;

      if (this.OpenGoogle) {
        this.formData.googleCode = this.saveGoogleCode;
      }
      if (this.OpenMobile) {
        if (this.smsType === 'sms') {
          this.formData.smsValidCode = this.savePhoneCode;
        } else {
          this.formData.smsValidCode = this.savePhoneCode;
        }
      }
      this.saveVerifyDialogLoading = true;
      this.axios({
        url: this.$store.state.url.subAccount.apiMgt_editApi,
        params: this.formData,
        method: 'post',
      }).then((resp) => {
        this.saveVerifyDialogLoading = false;
        if (resp.code.toString() === '0') {
          this.$bus.$emit('tip', { text: this.$t('subAccount.common.message2'), type: 'success' });
          this.saveVerifyDialogFlag = false;
          this.subContentId = null;
          this.getTableList();
        } else {
          this.$bus.$emit('tip', { text: resp.msg, type: 'error' });
        }
      });
    },
    // 打开模态框
    openDialogFn(name) {
      if (name === 'addAPIDialogFlag') {
        this.optionType = 'add';
        this.addAccount = '';
        this.addRemark = '';
        this.addGoogleCode = '';
        this.addPhoneCode = '';
        // 如果用户木有绑定谷歌或者邮箱，需要让用户绑定其中一个
        if (!this.OpenGoogle && !this.OpenMobile) {
          this.alertFlag = true;
          return;
        }
        // 如果有正在操作的API，就不能创建
        if (this.subContentId) {
          this.isSaveEditDialogFlag = true;
          return;
        }
      }
      if (name === 'addDialogFlag') {
        this.addAPIDialogFlag = false;
      }
      this[name] = true;
    },
    // 确认添加IP
    ipConfirm() {
      if (!this.ipInputErrorFlag) {
        this.currentEditRow.believeIps = [
          ...this.currentEditRow.believeIps,
          ...this.ipConfirmArr,
        ];
        this.editIP = '';
        this.ipConfirmArr = [];
      }
    },
    // 关闭是否保存提示框
    closeIsSaveDialog(type) {
      this.isSaveEditDialogFlag = false;
      if (type === 'cancel') {
        if (this.optionType === 'edit') {
          this.currentEditRow = this.nextCurRow;
          this.subContentId = null;
          this.tableClick('edit', this.currentEditRow);
        } else {
          this.subContentId = null;
          this.currentEditRow = {};
        }
      }
    },
    // 关闭模态框
    dialogClose(name) {
      this[name] = false;
    },
    // 获取验证码
    getCodeClick(name) {
      this.sendSmsCode(name);
    },
    // 发送验证码
    sendSmsCode() {
      this.axios({
        url: 'v4/common/smsValidCode',
        params: {
          operationType: '16',
        },
      }).then((data) => {
        if (data.code.toString() !== '0') {
          setTimeout(() => {
            // 倒计时重置
            this.$bus.$emit('getCode-clear', 'verifyGetCode');
            // tip框提示错误
            this.$bus.$emit('tip', { text: data.msg, type: 'error' });
          }, 2000);
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
    alertClone() {
      this.alertFlag = false;
    },
    alertGo() {
      this.$router.push('/personal/userManagement');
    },
    // 打开API文档
    openFile() {
      window.open(this.apiNoteUrl);
    },
    // 赋值key
    // copyValueFn() {
    //   const range = document.createRange();
    //   range.selectNode(document.getElementById('copyToken'));
    //   const selection = window.getSelection();
    //   if (selection.rangeCount > 0) selection.removeAllRanges();
    //   selection.addRange(range);
    //   document.execCommand('copy');
    //   this.$bus.$emit('tip', { // 复制成功
    //     text: this.$t('subAccount.common.message5'),
    //     type: 'success',
    //   });
    // },
    // 复制表格数据
    copyValueFn(value) {
      this.$bus.$emit('tip', { // 复制成功
        text: this.$t('subAccount.common.message5'),
        type: 'success',
      });
      return navigator.clipboard && navigator.clipboard.writeText && navigator.clipboard.writeText(value);
      // this.copyValue = value;
      // this.$nextTick(() => {
      //   const input = this.$refs.copyValue;
      //   input.selct();
      //   document.execCommand('copy');
      //   // 地址复制成功
      //   this.$bus.$emit('tip', { text: this.$t('subAccount.assets.recharge.copy_m1'), type: 'success' });
      // });
    },
  },
  computed: {
    editAllowedList() {
      const arr = [
        { text: this.$t('subAccount.apiMgt.table_btn1'), code: '0', disabled: true }, // 允许取读
        { text: this.$t('subAccount.apiMgt.table_btn4'), code: '1' }, // 允许币币
        { text: this.$t('subAccount.apiMgt.table_btn3'), code: '2' }, // 允许杠杆
        { text: this.$t('subAccount.apiMgt.table_btn2'), code: '3' }, // 允许合约
      ];
      if (this.userInfo && this.userInfo.isSub !== 1) {
        arr.push({ text: this.$t('subAccount.common.text3'), code: '4' }); // 允许提现
      }
      return arr;
    },
    userInfoIsReady() {
      return this.$store.state.baseData.userInfoIsReady;
    },
    // 用户信息
    userInfo() {
      return this.$store.state.baseData.userInfo;
    },
    uid() {
      return this.userInfo && this.userInfo.id;
    },
    regExps() {
      return this.$store.state.regExp;
    },
    statusList() {
      return this.$store.state.subAccount.statusList;
    },
    columns() {
      return [
        { key: 'label', title: this.$t('subAccount.apiMgt.table_c2') }, // 标签
        { key: 'c', title: this.$t('subAccount.apiMgt.table_c6'), width: '120px' }, // IP限制
        { key: 'operation', title: this.$t('subAccount.apiMgt.table_c7'), width: '220px' }, // 操作
      ];
    },
    // ip权限IP输入错误判断
    ipInputErrorFlag() {
      if (!this.editIP) {
        return false;
      }
      const ipArr = this.editIP.split(',').filter((it) => it !== '');
      if (!ipArr.length) {
        this.ipInputErrorText = this.$t('subAccount.apiMgt.eiitIp'); // 请输入有效的IP信息,用英文逗号隔开
        return true;
      }
      const reg = /^((2[0-4]\d|25[0-5]|[01]?\d\d?)\.){3}(2[0-4]\d|25[0-5]|[01]?\d\d?)$/;
      const ipsFlag = [];
      ipArr.forEach((ip) => {
        ipsFlag.push(reg.test(ip));
      });
      if (ipsFlag.includes(false)) {
        this.ipInputErrorText = this.$t('subAccount.apiMgt.eiitIp2'); // IP地址校验不通过，请输入正确的IP地址
        return true;
      }
      if (this.currentEditRow.believeIps.length + ipArr.length > 10) {
        this.ipInputErrorText = this.$t('subAccount.apiMgt.eiitIp4'); // 最多只能存在10个受信任的IP地址
        return true;
      }
      this.ipInputErrorText = '';
      this.ipConfirmArr = ipArr;
      return false;
    },
    // verifyType() {
    //   let str = '1';
    //   // 1谷歌  2手机  3手机谷歌同时
    //   if (!this.OpenGoogle && this.OpenMobile) {
    //     str = '2';
    //   } else if (this.OpenGoogle && this.OpenMobile) {
    //     str = '3';
    //   }
    //   return str;
    // },
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
    // 母账户谷歌验证 是否复合正则验证
    addGoogleCodeFlag() { return this.$store.state.regExp.verification.test(this.addGoogleCode); },
    addGoogleCodeError() {
      if (this.addGoogleCode.length !== 0 && !this.addGoogleCodeFlag) return true;
      return false;
    },
    // 母账户谷歌验证 是否复合正则验证
    addPhoneCodeFlag() { return this.$store.state.regExp.verification.test(this.addPhoneCode); },
    addPhoneCodeError() {
      if (this.addPhoneCode.length !== 0 && !this.addPhoneCodeFlag) return true;
      return false;
    },
    // 母账户谷歌验证 是否复合正则验证
    momGoogleValueFlag() { return this.$store.state.regExp.verification.test(this.saveGoogleCode); },
    momGoogleError() {
      if (this.saveGoogleCode.length !== 0 && !this.momGoogleValueFlag) return true;
      return false;
    },
    // 母账户手机验证 是否复合正则验证
    momPhoneValueFlag() { return this.$store.state.regExp.verification.test(this.savePhoneCode); },
    momPhoneError() {
      if (this.savePhoneCode.length !== 0 && !this.momPhoneValueFlag) return true;
      return false;
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
    // 用户是否开启手机
    OpenMobile() {
      let flag = false;
      const { userInfo } = this.$store.state.baseData;
      if (userInfo && userInfo.isOpenMobileCheck.toString() === '1') {
        flag = true;
      }
      return flag;
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
    // 语音短信开关
    voiceSmsOpen() {
      return this.$store.state.baseData.voiceSmsOpen;
    },
    addApiIsNull() {
      let flag = false;
      if (
        this.selectAccountList.length === 1
          && this.selectAccountList[0].code === 0
      ) {
        flag = true;
      }
      return flag;
    },
    authTitleText() {
      const text = this.enforceGoogleAuth
        ? 'assets.withdraw.enforceGoogleAuth'
        : 'assets.withdraw.safetyWarningError';
      return this.$t(text);
    },
    alertData() {
      const arr = [
        // 绑定谷歌验证
        { text: this.$t('assets.withdraw.bindGoogle'), flag: this.OpenGoogle },
      ];
      if (!this.enforceGoogleAuth) {
        // 绑定手机验证
        arr.push({
          text: this.$t('assets.withdraw.bindPhone'),
          flag: this.OpenMobile,
        });
      }
      return arr;
    },
    enforceGoogleAuth() {
      return this.$store.state.baseData.is_enforce_google_auth || 0;
    },
    // 商户域名
    openApiUrl() {
      let nowDomainName = window.location.host;
      nowDomainName = nowDomainName.replace(/www/, 'openapi');
      return nowDomainName;
    },
    // 三方 API链接
    thirdApiDocUrl() {
      const { publicInfo } = this.$store.state.baseData;
      return publicInfo && publicInfo.msg && publicInfo.msg.openApiDocUrl;
    },
    apiNoteUrl() {
      const lan = getCookie('lan');
      if (lan === 'zh_CN' || lan === 'el_GR') {
        // 中文路径
        return 'https://exchangedocsv2.gitbook.io/jian-ti-zhong-wen';
      }
      // 英文路径
      return 'https://exchangedocsv2.gitbook.io/jian-ti-zhong-wen/english';
    },

  },
};
