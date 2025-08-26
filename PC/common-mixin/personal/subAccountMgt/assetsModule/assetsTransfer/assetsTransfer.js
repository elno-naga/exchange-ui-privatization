import {
  colorMap,
  imgMap,
  getCoinShowName,
  fixD,
  fixInput,
  formatTime,
  getIconPath,
} from '@/utils';

export default {
  name: 'assets-transfer',
  data() {
    return {
      imgMap,
      colorMap,
      getIconPath,
      accountAllList: [],
      selCoinList: [], // 币种列表
      selSymbolList: [], // 币对列表
      transferSide: 1, // 划转方向 1 从-到
      formAccount: {}, // 从哪里转出
      formAccountType: '', // 从哪个账户转出
      toAccount: {}, // 转到哪个账户去
      toAccountType: '', // 转到对方哪个账户
      transferCoin: '', // 转出的币种
      transferSymbol: '', // 转出的币对
      transferNum: '', // 转出数量
      selSymbolName: '', // 当前选择的币对symbol
      compareFindEmail: '', // 余额比较：邮箱搜索
      compareFindType: '1', // 余额比较：类型搜索
      compareTableList: [], // 账户余额比较
      transferTableList: [], // 最近划转记录
      transferTableLoading: false,
      fromAvailable: '--',
      toAvailable: '--',
      firstInit: true,
      transferBtnLoading: false, // 确认loading
      // 表格下拉选项
      table_selAccountType: '1',
      table_selAccount: 0,
      table_selectAccountList: [
        { value: this.$t('subAccount.common.sel_allSub'), code: 0 },
      ],
      comSymbol: '',
      transferDisabled: true,
    };
  },
  watch: {
    toAccountTypeList(newVal) {
      if (newVal.length) this.toTypeChange(this.toAccountTypeList[0]);
    },
    toAccountList(newVal) {
      if (newVal.length && this.$route.query.fromId) this.toAccountChange(this.toAccountList[0]);
      if (newVal.length && this.$route.query.toId && this.formAccount.type === 'son') this.toAccountChange(this.toAccountList[1]);
    },
    exchangeData(v) {
      if (v && this.market) {
        this.getCoinList();
      }
    },
    market(v) {
      if (v && this.exchangeData) {
        this.getCoinList();
      }
    },
    // 币对改变时
    transferSymbol(val) {
      if (val) {
        this.setCoinBySymbol();
      }
    },
    formAccount: {
      handler(v) {
        if (this.market && this.exchangeData) this.getCoinList();
        if (v.value.length >= 18) {
          setTimeout(() => {
            this.formAccount.value = `${v.value.slice(0, 18)}...`;
          }, 500);
        }
      },
      deep: true,
    },
    toAccountType(val) {
      if (val && this.market && this.exchangeData) this.getCoinList();
    },
    formAccountType(val) {
      if (val && this.market && this.exchangeData) this.getCoinList();
    },
    transferNum(v) {
      this.transferNum = fixInput(v, this.transferCoinFix);
      let bol = true;
      if (v && Number(this.transferNum) > 0) {
        bol = false;
      }
      this.transferDisabled = bol;
    },
    transferCoin(v) {
      // 币种改变时，调余额
      if (v) {
        this.setAvailable();
      }
    },
    toAccount: {
      handler(v) {
        if (this.market && this.exchangeData) {
          this.setAvailable();
        }
        if (v.value.length >= 18) {
          setTimeout(() => {
            this.toAccount.value = `${v.value.slice(0, 18)}...`;
          }, 500);
        }
      },
      deep: true,
    },
  },
  filters: {
    // 千分符
    thousands(num) {
      if (num) {
        const str = num.toString();
        const reg = str.indexOf('.') > -1
          ? /(\d)(?=(\d{3})+\.)/g
          : /(\d)(?=(?:\d{3})+$)/g;
        return str.replace(reg, '$1,');
      }
      return num;
    },
  },
  methods: {
    async init() {
      this.accountAllList = await this.getSelAccountList();
      // 如果没有 finance/account_balance 接口返回成功的数据
      if (!this.exchangeData) {
        this.$store.dispatch('assetsExchangeData');
      }
      // 从哪个账户转出 paramsFromId paramsFromType
      // 如果有传入的就用传入的账户和type，如果没有就用默认的第一个；
      // if (this.paramsFromId && this.paramsFromId === 99999) {
      [this.formAccount] = this.accountAllList.filter(
        (it) => it.code === Number(this.paramsFromId),
      ); // 默认进来选择为左边
      // }
      // if (this.paramsaToId) {
      [this.toAccount] = this.accountAllList.filter(
        (it) => it.code === Number(this.paramsaToId),
      ); // 默认进来选择为左边
      // }

      this.formAccountType = this.paramsFromType; // 默认进来的类型，1：币币，2：杠杆，3：合约

      if (this.exchangeData && this.market) {
        this.getCoinList();
      }
      this.getRecentTransfer(); // 获取最近划转记录
      this.getCompareList(); // 获取子账户余额比较表格
    },
    // 获取子账户下拉
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
              type: 'son',
            }));
            this.table_selectAccountList = data.data.list.map((it) => ({
              value: it.email,
              code: it.subUid,
            }));
            this.table_selectAccountList.unshift({
              code: 0,
              value: this.$t('subAccount.common.sel_allSub'),
            });
            tempList.unshift({
              value: this.userInfo && (this.userInfo.email || this.userInfo.mobileNumber),
              code: 99999,
              type: 'mom',
            });
            resolve(tempList);
          } else {
            resolve([
              {
                value: this.userInfo.email || this.userInfo.mobileNumber,
                code: 99999,
                type: 'mom',
              },
            ]);
          }
        });
      });
    },
    // 获取子账户币币资产
    getSubAllCoin(uid) {
      return new Promise((resolve) => {
        this.axios({
          url: this.$store.state.url.subAccount.recharge_accountBalance,
          params: { subUid: uid },
        }).then((data) => {
          if (data.code.toString() === '0') {
            resolve(data.data);
          } else {
            resolve({});
          }
        });
      });
    },
    // 获取子账户杠杆资产
    // getSubAllLeverOld(uid) {
    //   return new Promise((resolve) => {
    //     this.axios({
    //       url: this.$store.state.url.subAccount.sub_lever_accountBalance,
    //       params: { subUid: uid },
    //     }).then((data) => {
    //       if (data.code.toString() === '0') {
    //         resolve(data.data);
    //       } else {
    //         resolve({});
    //       }
    //     });
    //   });
    // },
    // 获取子账户杠杆资产
    getSubAllLeverOld(uid) {
      this.axios({
        url: this.$store.state.url.subAccount.sub_lever_accountBalance,
        params: { subUid: uid },
      }).then((data) => {
        if (data.code.toString() === '0') {
          const { leverMap } = data.data;
          if (!leverMap) return;
          const { coinList } = this.market;
          this.selSymbolList = [];
          Object.keys(leverMap).forEach((item) => {
            this.selSymbolList.push({
              symbol: leverMap[item].symbol,
              code: leverMap[item].name,
              info: leverMap[item],
              value: `${getCoinShowName(
                leverMap[item].baseCoin,
                coinList,
              )}/${getCoinShowName(leverMap[item].quoteCoin, coinList)}`,
            });
          });
          // 如果路由传进来杠杆类型，选择传递进来的杠杆币对即可
          if (this.firstInit) {
            if (this.paramsFromType === '2' && this.paramsCoin) {
              this.transferSymbol = this.paramsCoin;
              this.selSymbolName = this.selSymbolList.filter(
                (it) => it.code === this.paramsCoin,
              )[0].symbol;
            } else {
              this.transferSymbol = this.selSymbolList[0].code;
              this.selSymbolName = this.selSymbolList[0].symbol;
            }
            this.firstInit = false;
          } else {
            this.transferSymbol = this.selSymbolList[0].code;
            this.selSymbolName = this.selSymbolList[0].symbol;
          }
          this.setCoinBySymbol();
        }
      });
    },
    // 获取子账户杠杆资产-全仓
    getSubAllCrossOld(uid) {
      this.axios({
        url: this.$store.state.url.subAccount.sub_lever_accountBalance,
        params: { subUid: uid, type: '1' },
      }).then((data) => {
        if (data.code.toString() === '0') {
          const { leverMap } = data.data;
          if (!leverMap) return;
          const { coinList } = this.market;
          this.selCoinList = [];
          Object.keys(leverMap).forEach((item) => {
            this.selCoinList.push({
              code: item,
              info: leverMap[item],
              value: getCoinShowName(item, coinList),
            });
          });
          // 如果路由传进来杠杆类型，选择传递进来的杠杆币对即可
          if (this.firstInit) {
            if (this.paramsFromType === '4' && this.paramsCoin) {
              this.transferCoin = this.paramsCoin;
            } else {
              this.transferCoin = this.selCoinList[0].code;
            }
            this.firstInit = false;
          } else {
            this.transferCoin = this.selCoinList[0].code;
          }
        }
      });
    },
    getSubAllLever(uid) {
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        this.getSubAllLeverOld(uid);
      }, 500);
    },
    getSubAllCross(uid) {
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        this.getSubAllCrossOld(uid);
      }, 500);
    },
    // 获取子账户杠杆资产--单币种
    getSubCoinByLever(uid, code) {
      return new Promise((resolve) => {
        this.axios({
          url: this.$store.state.url.subAccount.sub_coinByLever,
          params: { subUid: uid, symbol: code },
        }).then((data) => {
          if (data.code.toString() === '0') {
            resolve(data.data);
          } else {
            this.$bus.$emit('tip', { text: data.msg, type: 'error' });
            resolve({});
          }
        });
      });
    },
    // 获取子账户杠杆资产--单币种
    getSubCoinByCross(uid, code) {
      return new Promise((resolve) => {
        this.axios({
          url: this.$store.state.url.subAccount.sub_coinByLever,
          params: { subUid: uid, symbol: code, type: '1' },
        }).then((data) => {
          if (data.code.toString() === '0') {
            resolve(data.data);
          } else {
            this.$bus.$emit('tip', { text: data.msg, type: 'error' });
            resolve({});
          }
        });
      });
    },
    // 获取子账户合约资产
    getSubContract(uid) {
      return new Promise((resolve) => {
        this.axios({
          url: this.$store.state.url.subAccount.sub_contract_accountBalance,
          params: { subUid: uid },
        }).then((data) => {
          if (data.code.toString() === '0') {
            resolve(data.data);
          } else {
            this.$bus.$emit('tip', { text: data.msg, type: 'error' });
            resolve({});
          }
        });
      });
    },
    // 获取币种/币对列表 页面进入/账户改变
    async getCoinList() {
      if (!this.market || !this.exchangeData) {
        return;
      }
      // 先清空币对币种列表
      this.selCoinList = [];
      this.selSymbolList = [];
      this.transferCoin = '';
      // 无杠杆，只能是母子币币划转
      if (this.formAccountType === '1' && this.toAccountType === '1') {
        // 如果是母账户，查询母账户的币币列表
        if (this.formAccount.type === 'mom') {
          this.selCoinList = [];
          const { allCoinMap } = this.exchangeData;
          const { coinList } = this.market;
          Object.keys(allCoinMap).forEach((key) => {
            const obj = {
              img: coinList[key].icon,
              code: key,
              value: getCoinShowName(key, coinList),
              info: allCoinMap[key],
            };
            this.selCoinList.push(obj);
          });
        } else if (this.formAccount.type === 'son') {
          this.selCoinList = [];
          const tempSubCoin = await this.getSubAllCoin(this.formAccount.code);
          const { allCoinMap } = tempSubCoin;
          const { coinList } = this.market;
          Object.keys(allCoinMap).forEach((key) => {
            const obj = {
              img: coinList[key].icon,
              code: key,
              value: getCoinShowName(key, coinList),
              info: allCoinMap[key],
            };
            this.selCoinList.push(obj);
          });
        }
        // 第一次进来渲染传进来的币种
        if (this.firstInit) {
          if (this.selCoinList.length && this.paramsCoin) {
            this.transferCoin = this.paramsCoin;
          } else {
            this.transferCoin = this.selCoinList[0].code;
          }
          this.firstInit = false;
        } else if (!this.firstInit && this.selCoinList.length) {
          this.transferCoin = this.selCoinList[0].code;
        }
      } else if (this.formAccountType === '2' || this.toAccountType === '2') {
        // 有杠杆，只能是同一子账户币币to杠杆or杠杆to币币
        if (this.errorFlag || this.formAccount.code === 99999) return; // 如果有报错的情况不执行
        // 币币to杠杆or杠杆to币币，只针对同一个账户；所以币对列表只有一种情况
        this.getSubAllLever(this.formAccount.code); // 取出币对列表

        // const tempSubLever = await this.getSubAllLever(this.formAccount.code); // 取出币对列表
        // const { leverMap } = tempSubLever;
        // if (!leverMap) return;
        // const { coinList } = this.market;
        // this.selSymbolList = [];
        // Object.keys(leverMap).forEach((item) => {
        //   this.selSymbolList.push({
        //     symbol: leverMap[item].symbol,
        //     code: leverMap[item].name,
        //     info: leverMap[item],
        //     value: `${getCoinShowName(
        //       leverMap[item].baseCoin,
        //       coinList,
        //     )}/${getCoinShowName(leverMap[item].quoteCoin, coinList)}`,
        //   });
        // });
        // // 如果路由传进来杠杆类型，选择传递进来的杠杆币对即可
        // if (this.firstInit) {
        //   if (this.paramsFromType === '2' && this.paramsCoin) {
        //     this.transferSymbol = this.paramsCoin;
        //     this.selSymbolName = this.selSymbolList.filter(
        //       (it) => it.code === this.paramsCoin,
        //     )[0].symbol;
        //   } else {
        //     this.transferSymbol = this.selSymbolList[0].code;
        //     this.selSymbolName = this.selSymbolList[0].symbol;
        //   }
        //   this.firstInit = false;
        // } else {
        //   this.transferSymbol = this.selSymbolList[0].code;
        //   this.selSymbolName = this.selSymbolList[0].symbol;
        // }
        // this.setCoinBySymbol();
      } else if (this.formAccountType === '3' || this.toAccountType === '3') {
        // 有合约，同子币币to合约or合约to币币
        if (this.errorFlag) return; // 如果有报错的情况不执行
        const tempContract = await this.getSubContract(this.formAccount.code); // 取出合约币种列表
        const { accountList } = tempContract;
        this.selCoinList = [];
        Object.keys(accountList).forEach((key) => {
          const obj = {
            code: accountList[key].symbol,
            value: accountList[key].symbol,
            info: accountList[key],
          };
          this.selCoinList.push(obj);
        });
        // this.transferCoin = '';
        // 第一次进来渲染传进来的币种
        if (this.paramsCoin) {
          if (this.selCoinList.length && this.paramsCoin) {
            this.transferCoin = this.paramsCoin;
          } else {
            this.transferCoin = this.selCoinList[0].code;
          }
          this.firstInit = false;
        } else if (this.selCoinList.length) {
          this.transferCoin = this.selCoinList[0].code;
        }
      } else if (this.formAccountType === '4' || this.toAccountType === '4') {
        if (this.errorFlag || this.formAccount.code === 99999) return; // 如果有报错的情况不执行
        // 币币to杠杆or杠杆to币币，只针对同一个账户；所以币对列表只有一种情况
        this.getSubAllCross(this.formAccount.code); // 取出币对列表
      }
    },
    // 根据币对设置币种
    async setCoinBySymbol() {
      if (this.formAccountType === '2' || this.toAccountType === '2') {
        if (!this.selSymbolName) {
          return;
        }
        const tempSubLever = await this.getSubCoinByLever(
          this.formAccount.code,
          this.selSymbolName,
        );
        const { baseCoin, quoteCoin } = tempSubLever;
        const { coinList } = this.market;
        this.selCoinList = [
          {
            img: coinList[baseCoin].icon || '',
            code: baseCoin,
            value: getCoinShowName(baseCoin, coinList),
          },
          {
            img: coinList[quoteCoin].icon,
            code: quoteCoin,
            value: getCoinShowName(quoteCoin, coinList),
          },
        ];
        // this.transferCoin = '';
        if (this.selCoinList.length) { this.transferCoin = this.selCoinList[0].code; }
      }
    },
    // 设置可用余额
    async setAvailable() {
      if (!this.exchangeData && !this.market) {
        return;
      }
      // 无杠杆的情况下，币币分别取母账户或者子账户的币币余额
      if (this.formAccountType === '1' && this.toAccountType === '1') {
        if (!this.transferCoin) return;
        const { allCoinMap } = this.exchangeData;
        const fix = this.market.coinList[this.transferCoin].showPrecision;
        if (this.formAccount.type === 'mom') {
          // 如果左侧是母账户，右侧就是子账户币币
          if (this.formAccount.type === 'mom') {
            // 设置母账户余额
            this.fromAvailable = fixD(
              allCoinMap[this.transferCoin].normal_balance,
              fix,
            );
            // 设置子账户余额
            const tempSubCoin = await this.getSubAllCoin(this.toAccount.code);
            const subAllCoinMap = tempSubCoin.allCoinMap;
            const subFix = this.market.coinList[this.transferCoin].showPrecision;
            this.toAvailable = fixD(
              subAllCoinMap[this.transferCoin].normal_balance,
              subFix,
            );
          }
        } else if (this.toAccount.type === 'mom') {
          // 如果左侧是子账户，右侧为母账户
          // 设置母账户余额
          this.toAvailable = fixD(
            allCoinMap[this.transferCoin].normal_balance,
            fix,
          );
          // 设置子账户余额
          const tempSubCoin = await this.getSubAllCoin(this.formAccount.code);
          const subAllCoinMap = tempSubCoin.allCoinMap;
          const subFix = this.market.coinList[this.transferCoin].showPrecision;
          this.fromAvailable = fixD(
            subAllCoinMap[this.transferCoin].normal_balance,
            subFix,
          );
        }
      } else if (
        (this.formAccountType === '2' && this.toAccountType === '1')
        || (this.formAccountType === '1' && this.toAccountType === '2')
      ) {
        // 如果是杠杆
        if (!this.selSymbolName || !this.transferCoin) return;
        const tempLever = await this.getSubCoinByLever(
          this.formAccount.code,
          this.selSymbolName,
        );
        const fix = this.market.coinList[this.transferCoin].showPrecision;
        if (this.formAccountType === '1') {
          if (tempLever.baseCoin === this.transferCoin) { this.fromAvailable = fixD(tempLever.baseExNormalBalance, fix); }
          if (tempLever.quoteCoin === this.transferCoin) { this.fromAvailable = fixD(tempLever.quoteEXNormalBalance, fix); }
        }
        if (this.formAccountType === '2') {
          if (tempLever.baseCoin === this.transferCoin) { this.fromAvailable = fixD(tempLever.baseCanTransfer, fix); }
          if (tempLever.quoteCoin === this.transferCoin) { this.fromAvailable = fixD(tempLever.quoteCanTransfer, fix); }
        }
        if (this.toAccountType === '1') {
          if (tempLever.baseCoin === this.transferCoin) { this.toAvailable = fixD(tempLever.baseExNormalBalance, fix); }
          if (tempLever.quoteCoin === this.transferCoin) { this.toAvailable = fixD(tempLever.quoteEXNormalBalance, fix); }
        }
        if (this.toAccountType === '2') {
          if (tempLever.baseCoin === this.transferCoin) { this.toAvailable = fixD(tempLever.baseCanTransfer, fix); }
          if (tempLever.quoteCoin === this.transferCoin) { this.toAvailable = fixD(tempLever.quoteCanTransfer, fix); }
        }
      } else if (
        (this.formAccountType === '3' && this.toAccountType === '1')
        || (this.formAccountType === '1' && this.toAccountType === '3')
      ) {
        if (!this.transferCoin) return;
        // 合约划转
        const contractAssets = await this.getSubContract(this.toAccount.code); // 获取当前账户的合约余额
        const coinAssets = await this.getSubAllCoin(this.toAccount.code); // 获取账户币币余额
        const fix = this.market.coinList[this.transferCoin].showPrecision;
        const tempContract = contractAssets.accountList.filter(
          (it) => it.symbol === this.transferCoin,
        )[0];
        // 左侧是合约
        if (this.formAccountType === '3') {
          this.fromAvailable = fixD(tempContract.canUseAmount, fix);
          const subAllCoinMap = coinAssets.allCoinMap;
          this.toAvailable = fixD(
            subAllCoinMap[this.transferCoin].normal_balance,
            fix,
          );
        } else if (this.toAccountType === '3') {
          // 右侧是合约
          this.toAvailable = fixD(tempContract.canUseAmount, fix);
          const subAllCoinMap = coinAssets.allCoinMap;
          this.fromAvailable = fixD(
            subAllCoinMap[this.transferCoin].normal_balance,
            fix,
          );
        }
      } else if (
        (this.formAccountType === '4' && this.toAccountType === '1')
        || (this.formAccountType === '1' && this.toAccountType === '4')
      ) {
        // 如果是杠杆
        if (!this.selSymbolName || !this.transferCoin) return;
        const tempLever = await this.getSubCoinByCross(
          this.formAccount.code,
          this.transferCoin,
        );
        const fix = this.market.coinList[this.transferCoin].showPrecision;
        if (this.formAccountType === '1') {
          if (tempLever.coinSymbol === this.transferCoin) { this.fromAvailable = fixD(tempLever.exNormalBalance, fix); }
        }
        if (this.formAccountType === '4') {
          if (tempLever.coinSymbol === this.transferCoin) { this.fromAvailable = fixD(tempLever.canTransfer, fix); }
        }
        if (this.toAccountType === '1') {
          if (tempLever.coinSymbol === this.transferCoin) { this.toAvailable = fixD(tempLever.exNormalBalance, fix); }
        }
        if (this.toAccountType === '4') {
          if (tempLever.coinSymbol === this.transferCoin) { this.toAvailable = fixD(tempLever.canTransfer, fix); }
        }
      }
    },
    // 回退
    goBack() {
      this.smartBack();
    },
    smartBack() {
      const from = document.referrer;
      // 如果来自站外（比如 baidu.com 或为空），则跳转到默认页面
      const isFromOutside = from === '' || !from.includes(window.location.host);
      if (isFromOutside) {
        window.location.replace('/');// 或 push
      } else {
        this.$router.back();
      }
    },
    // 全部划转
    transferAll() {
      this.transferNum = this.fromAvailable;
    },
    findChanges(v) {
      this.compareFindEmail = v;
      this.getCompareList();
    },
    inputChange(value, name) {
      this[name] = value;
    },
    selectChange(item, name) {
      if (
        (this.formAccountType === '2' || this.toAccountType === '2')
        && (name === 'transferCoin' || name === 'transferSymbol')
      ) {
        this[name] = item.code;
      } else if (this.formAccountType === '1' && this.toAccountType === '1') {
        this[name] = item.code;
      } else if (this.formAccountType === '4' || this.toAccountType === '4') {
        this[name] = item.code;
      } else {
        this[name] = item.value;
      }
      if (name === 'transferSymbol') {
        this.selSymbolName = item.symbol;
      }
    },
    fromAccountChange(item) {
      this.formAccount = { ...item };
    },
    fromTypeChange(item) {
      this.formAccountType = item.code;
    },
    toAccountChange(item) {
      this.toAccount = { ...item };
    },
    toTypeChange(item) {
      this.toAccountType = item.code;
    },
    // 调整划转方向
    changeTransferSide() {
      const form = this.formAccount;
      const formType = this.formAccountType;
      const to = this.toAccount;
      const totype = this.toAccountType;
      this.formAccount = to;
      this.formAccountType = totype;
      this.toAccount = form;
      this.toAccountType = formType;

      const { fromAvailable } = this;
      const { toAvailable } = this;
      this.fromAvailable = toAvailable;
      this.toAvailable = fromAvailable;

      const el = document.querySelector('.transfer-account');
      el.classList.add('ani');
      setTimeout(() => {
        el.classList.remove('ani');
      }, 200);
      this.getCoinList();
    },
    // 确认划转
    transferConfirm() {
      if (this.errorFlag || this.transferError || !this.transferNum || Number(this.transferNum) === 0) {
        return;
      }
      // 母子币币划转
      if (this.formAccountType === '1' && this.toAccountType === '1') {
        let req;
        if (this.formAccount.type === 'mom') {
          req = {
            subUid: this.toAccount.code,
            type: 1, // 划转类型 0:子转母 1:母转子
            amount: this.transferNum,
            coinSymbol: this.transferCoin,
          };
        } else if (this.toAccount.type === 'mom') {
          req = {
            subUid: this.formAccount.code,
            type: 0, // 划转类型 0:子转母 1:母转子
            amount: this.transferNum,
            coinSymbol: this.transferCoin,
          };
        }
        this.transferBtnLoading = true;
        this.axios({
          url: this.$store.state.url.subAccount.transfer_coinToCoin,
          method: 'post',
          params: req,
        }).then((data) => {
          if (data.code.toString() === '0') {
            this.transferBtnLoading = false;
            this.$bus.$emit('tip', {
              text: this.$t('subAccount.assets.transfer.message'),
              type: 'success',
            }); // 划转成功
            this.transferNum = ''; // 清空划转记录
            this.$store.dispatch('assetsExchangeData'); // 重新获取母数据余额
            // 重新获取余额
            // this.getCoinList(); // 获取币种
            setTimeout(() => {
              this.setAvailable();
              this.getRecentTransfer(); // 获取最近划转记录
              this.getCompareList(); // 获取子账户余额比较表格
            }, 800);
          } else {
            this.$bus.$emit('tip', { text: data.msg, type: 'error' });
            this.transferBtnLoading = false;
          }
        });
      } else if (this.formAccountType === '2' || this.toAccountType === '2') {
        // 子子杠杆划转
        let req;
        if (this.formAccountType === '2') {
          req = {
            transferType: '2',
            subUid: this.formAccount.code,
            amount: this.transferNum,
            symbol: this.transferSymbol,
            coinSymbol: this.transferCoin,
          };
          const tempArr = this.selSymbolList.filter(
            (it) => it.code === this.transferSymbol,
          );
          if (tempArr.length) req.symbol = tempArr[0].symbol;
        } else if (this.toAccountType === '2') {
          req = {
            transferType: '1',
            subUid: this.formAccount.code,
            amount: this.transferNum,
            symbol: this.transferSymbol,
            coinSymbol: this.transferCoin,
          };
          const tempArr = this.selSymbolList.filter(
            (it) => it.code === this.transferSymbol,
          );
          if (tempArr.length) req.symbol = tempArr[0].symbol;
        }
        this.transferBtnLoading = true;
        this.axios({
          url: this.$store.state.url.subAccount.transfer_SymbolToCoin,
          method: 'post',
          params: req,
        }).then((data) => {
          if (data.code.toString() === '0') {
            this.transferBtnLoading = false;
            this.$bus.$emit('tip', {
              text: this.$t('subAccount.assets.transfer.message'),
              type: 'success',
            });
            this.transferNum = ''; // 清空划转记录
            this.setAvailable();
            this.getRecentTransfer(); // 获取最近划转记录
            this.getCompareList(); // 获取子账户余额比较表格
          } else {
            this.$bus.$emit('tip', { text: data.msg, type: 'error' });
            this.transferBtnLoading = false;
          }
        });
      } else if (this.formAccountType === '3' || this.toAccountType === '3') {
        // 子子合约划转
        let req;
        if (this.formAccountType === '3') {
          req = {
            transferType: 2, // 2合约to币币，1币币to合约
            subUid: this.formAccount.code,
            amount: this.transferNum,
            coinSymbol: this.transferCoin,
          };
        } else if (this.toAccountType === '3') {
          req = {
            transferType: 1, // 2合约to币币，1币币to合约
            subUid: this.formAccount.code,
            amount: this.transferNum,
            coinSymbol: this.transferCoin,
          };
        }
        this.transferBtnLoading = true;
        this.axios({
          url: this.$store.state.url.subAccount.transfer_contractToCoin,
          method: 'post',
          params: req,
        }).then((data) => {
          if (data.code.toString() === '0') {
            this.transferBtnLoading = false;
            this.$bus.$emit('tip', {
              text: this.$t('subAccount.assets.transfer.message'),
              type: 'success',
            });
            this.transferNum = ''; // 清空划转记录
            this.setAvailable();
            this.getRecentTransfer(); // 获取最近划转记录
            this.getCompareList(); // 获取子账户余额比较表格
          } else {
            this.$bus.$emit('tip', { text: data.msg, type: 'error' });
            this.transferBtnLoading = false;
          }
        });
      } else if (this.formAccountType === '4' || this.toAccountType === '4') {
        // 子子杠杆划转
        let req;
        if (this.formAccountType === '4') {
          req = {
            transferType: '4',
            subUid: this.formAccount.code,
            amount: this.transferNum,
            symbol: null,
            coinSymbol: this.transferCoin,
          };
          const tempArr = this.selSymbolList.filter(
            (it) => it.code === this.transferSymbol,
          );
          if (tempArr.length) req.symbol = tempArr[0].symbol;
        } else if (this.toAccountType === '4') {
          req = {
            transferType: '3',
            subUid: this.formAccount.code,
            amount: this.transferNum,
            symbol: null,
            coinSymbol: this.transferCoin,
          };
          const tempArr = this.selSymbolList.filter(
            (it) => it.code === this.transferSymbol,
          );
          if (tempArr.length) req.symbol = tempArr[0].symbol;
        }
        this.transferBtnLoading = true;
        this.axios({
          url: this.$store.state.url.subAccount.transfer_SymbolToCoin,
          method: 'post',
          params: req,
        }).then((data) => {
          if (data.code.toString() === '0') {
            this.transferBtnLoading = false;
            this.$bus.$emit('tip', {
              text: this.$t('subAccount.assets.transfer.message'),
              type: 'success',
            });
            this.transferNum = ''; // 清空划转记录
            this.setAvailable();
            this.getRecentTransfer(); // 获取最近划转记录
            this.getCompareList(); // 获取子账户余额比较表格
          } else {
            this.$bus.$emit('tip', { text: data.msg, type: 'error' });
            this.transferBtnLoading = false;
          }
        });
      }
    },
    // 表格区域下拉改变时
    tableSelectChange(item, name) {
      this[name] = item.code;
      this.getRecentTransfer();
    },
    // 获取最近划转记录
    getRecentTransfer() {
      let req;
      let url;
      this.transferTableLoading = true;
      if (this.table_selAccountType === '1') {
        // 币币账户
        req = {
          subUid: this.table_selAccount || null,
          coinSymbol: null,
          page: 1,
          pageSize: 10,
        };
        url = this.$store.state.url.subAccount.transfer_coinRecord;
      } else if (this.table_selAccountType === '2') {
        // 杠杆账户
        req = {
          subUid: this.table_selAccount || null,
          symbol: null,
          coinSymbol: null,
          type: '0',
          page: 1,
          pageSize: 10,
        };
        url = this.$store.state.url.subAccount.transfer_LeverRecord;
      } else if (this.table_selAccountType === '3') {
        // 合约账户
        req = {
          subUid: this.table_selAccount || null,
          coinSymbol: null,
          page: 1,
          pageSize: 10,
        };
        url = this.$store.state.url.subAccount.transfer_contractRecord;
      } else if (this.table_selAccountType === '4') {
        // 杠杆账户
        req = {
          subUid: this.table_selAccount || null,
          symbol: null,
          coinSymbol: null,
          type: '1',
          page: 1,
          pageSize: 10,
        };
        url = this.$store.state.url.subAccount.transfer_LeverRecord;
      }
      this.axios({
        url,
        method: 'post',
        params: req,
      }).then((data) => {
        if (data.code.toString() === '0') {
          this.transferTableList = data.data.list.map((it) => {
            const tempObj = { ...it };
            tempObj.ctime = tempObj.ctime ? formatTime(tempObj.ctime) : '- -';
            return tempObj;
          });
          this.transferTableLoading = false;
        } else {
          this.$bus.$emit('tip', { text: data.msg, type: 'error' });
          this.transferTableList = [];
          this.transferTableLoading = false;
        }
      });
    },
    // 查看全部
    lookAll() {
      this.$router.push({ path: 'subWalletHistory', query: { type: '2' } });
    },
    // 获取所有子账户资产总览 sub_allSubTotal
    getSubAssetsData() {
      return new Promise((resolve) => {
        this.axios({
          url: this.$store.state.url.subAccount.sub_allSubTotal,
          method: 'post',
          params: {
            subUid: null,
            freezeStatus: null,
            type: Number(this.compareFindType),
          },
        }).then((data) => {
          if (data.code.toString() === '0') {
            const { coinList } = this.market;
            this.comSymbol = data.data.convertCoinSymbol;
            const subFix = (coinList[data.data.convertCoinSymbol]
                && coinList[data.data.convertCoinSymbol].showPrecision)
              || 8;
            const tempList = data.data.singleSubUserTotalPropertyVOList.map(
              (it) => {
                const tempObj = it;
                tempObj.showAssets = fixD(it.totalBalance, subFix);
                return tempObj;
              },
            );
            resolve(tempList);
          } else {
            this.$bus.$emit('tip', { text: data.msg, type: 'error' });
            resolve([]);
          }
        });
      });
    },
    compareTypeChange(item, name) {
      this[name] = item.code;
      this.getCompareList();
    },
    // 获取子账户余额比较
    async getCompareList() {
      this.compareTableList = await this.getSubAssetsData();
    },
  },
  computed: {
    // 计算余额比较列表资产查询
    compareFilterTableList() {
      if (this.compareFindEmail) {
        return this.compareTableList.filter(
          (it) => it.subEmail.indexOf(this.compareFindEmail) !== -1,
        );
      }
      return this.compareTableList;
    },
    // 用户信息
    userInfo() {
      return this.$store.state.baseData.userInfo;
    },
    fromAccountList() {
      // 如果右侧选择了母账户，from只能是子账户
      if (
        this.toAccount.code
        && this.toAccount.type === 'mom'
        && this.formAccountType !== '2'
      ) {
        return this.accountAllList.filter((it) => it.type === 'son');
      }
      // 如果to选择了子账户，from只能是同一子账户和母账户
      if (
        this.toAccount.code
        && this.toAccount.type === 'son'
        && this.formAccountType !== '2'
      ) {
        return this.accountAllList.filter(
          (it) => it.code === this.toAccount.code || it.type === 'mom',
        );
      }
      return this.accountAllList;
    },
    fromAccountTypeList() {
      if (this.formAccount.code && this.formAccount.type === 'mom') {
        this.formAccountType = '1';
        return this.accountAllTypeList.filter((it) => it.code === '1');
      }
      return this.accountAllTypeList;
    },
    toAccountList() {
      if (this.formAccount.code && this.formAccount.type === 'mom') {
        return this.accountAllList.filter((it) => it.type === 'son');
      }
      if (this.formAccount.code && this.formAccount.type === 'son') {
        return this.accountAllList.filter(
          (it) => it.code === this.formAccount.code || it.type === 'mom',
        );
      }
      if (!this.formAccount.code) {
        return this.accountAllList;
      }
      return [];
    },
    toAccountTypeList() {
      if (this.formAccount.type === 'mom' || this.toAccount.type === 'mom') {
        return this.accountAllTypeList.filter((it) => it.code === '1');
      }
      if (
        this.formAccount.code
        && this.formAccount.type === 'son'
        && this.formAccountType === '1'
      ) {
        return this.accountAllTypeList.filter((it) => it.code !== '1');
      }
      if (
        this.formAccount.code
        && this.formAccount.type === 'son'
        && this.formAccountType !== '1'
      ) {
        return this.accountAllTypeList.filter((it) => it.code === '1');
      }
      // this.toAccountType = this.toAccountTypeList ? this.toAccountTypeList[0].code : '';
      return [];
    },
    // 划转类型报错（子：杠杆、币币 to 母）
    errorFlag() {
      if (
        this.formAccount.type === 'son'
        && (this.formAccountType === '2' || this.formAccountType === '3' || this.formAccountType === '4')
        && this.toAccount.type === 'mom'
        && this.toAccountType === '1'
      ) {
        return true;
      }
      return false;
    },
    transferError() {
      let flag = false;
      if (parseFloat(this.transferNum) > parseFloat(this.transferCanNum)) {
        flag = true;
      }
      return flag;
    },
    // 可划转数量
    transferCanNum() {
      let balance = 0;
      balance = this.fromAvailable;
      return Number(balance);
    },
    paramsFromId() {
      return this.$route.query.fromId || 99999;
    },
    paramsaToId() {
      return this.$route.query.toId || 99999;
    },
    paramsFromType() {
      return this.$route.query.fromType || '1';
    },
    paramsCoin() {
      return this.$route.query.coin
        && this.$route.query.coin.indexOf('%2F') !== -1
        ? this.$route.query.coin.spilt('%2F').join('')
        : this.$route.query.coin;
    },
    paramsToType() {
      return this.$route.query.toType;
    },
    compareColumns() {
      return [
        {
          key: 'subEmail',
          title: this.$t('subAccount.assets.transfer.right_table_c1'),
          width: '60%',
        }, // 子账户邮箱
        {
          key: 'showAssets',
          title: this.$t('subAccount.assets.transfer.right_table_c2', { symbol: this.comSymbol }),
          width: '40%',
          sortable: true,
        }, // 总资产
      ];
    },
    transferColumns() {
      // // 合约
      if (this.table_selAccountType === '3') {
        return [
          {
            key: 'email',
            title: this.$t('subAccount.assets.transfer.contactTable_c1'),
            width: '21%',
          }, // 子账户
          {
            key: 'coinSymbol',
            title: this.$t('subAccount.assets.transfer.contactTable_c2'),
            width: '20%',
          }, // 币种
          {
            key: 'ctime',
            title: this.$t('subAccount.assets.transfer.contactTable_c4'),
            width: '20%',
          }, // 时间
          {
            key: 'amount',
            title: this.$t('subAccount.assets.transfer.contactTable_c5'),
            width: '20%',
          }, // 数量
          {
            key: 'transferType',
            title: this.$t('subAccount.assets.transfer.contactTable_c6'),
            width: '19%',
          }, // 方向
        ];
      }
      // 杠杆
      if (this.table_selAccountType === '2') {
        return [
          {
            key: 'subEmail',
            title: this.$t('subAccount.assets.transfer.leverTable_c1'),
            width: '21%',
          }, // 子账户
          {
            key: 'coinSymbol',
            title: this.$t('subAccount.assets.transfer.leverTable_c2'),
            width: '16%',
          }, // 币种
          {
            key: 'showName',
            title: this.$t('subAccount.assets.transfer.leverTable_c3'),
            width: '16%',
          }, // 杠杆账户
          {
            key: 'amount',
            title: this.$t('subAccount.assets.transfer.leverTable_c4'),
            width: '16%',
          }, // 数量
          {
            key: 'ctime',
            title: this.$t('subAccount.assets.transfer.leverTable_c5'),
            width: '16%',
          }, // 时间
          {
            key: 'transferType',
            title: this.$t('subAccount.assets.transfer.leverTable_c6'),
            width: '16%',
          }, // 方向
        ];
      }
      // 杠杆
      if (this.table_selAccountType === '4') {
        return [
          {
            key: 'subEmail',
            title: this.$t('subAccount.assets.transfer.leverTable_c1'),
            width: '20%',
          }, // 子账户
          {
            key: 'coinSymbol',
            title: this.$t('subAccount.assets.transfer.leverTable_c2'),
            width: '20%',
          }, // 币种
          {
            key: 'amount',
            title: this.$t('subAccount.assets.transfer.leverTable_c4'),
            width: '20%',
          }, // 数量
          {
            key: 'ctime',
            title: this.$t('subAccount.assets.transfer.leverTable_c5'),
            width: '20%',
          }, // 时间
          {
            key: 'transferType',
            title: this.$t('subAccount.assets.transfer.leverTable_c6'),
            width: '20%',
          }, // 方向
        ];
      }
      // 币币
      return [
        {
          key: 'subEmail',
          title: this.$t('subAccount.assets.transfer.coinTable_c1'),
          width: '20%',
        }, // 转出账户
        {
          key: 'coin',
          title: this.$t('subAccount.assets.transfer.coinTable_c2'),
          width: '20%',
        }, // 币种
        {
          key: 'amount',
          title: this.$t('subAccount.assets.transfer.coinTable_c3'),
          width: '20%',
        }, // 数量
        {
          key: 'opType',
          title: this.$t('subAccount.assets.transfer.coinTable_c4'),
          width: '20%',
        }, // 转入账户类型
        {
          key: 'ctime',
          title: this.$t('subAccount.assets.transfer.coinTable_c5'),
          width: '20%',
        }, // 时间
      ];
    },
    // finance/account_balance 母账户币币资产
    exchangeData() {
      return this.$store.state.assets.exchangeData;
    },
    market() {
      return this.$store.state.baseData.market;
    },
    navTab() {
      return [
        // 最近划转记录
        { name: this.$t('subAccount.assets.transfer.title'), index: 1 },
      ];
    },
    publicInfo() {
      return this.$store.state.baseData.publicInfo;
    },
    // 逐仓杠杆开关
    leverOpen() {
      return this.publicInfo && this.publicInfo.switch && this.publicInfo.switch.lever_open === '1';
    },
    table_selectAccountTypeList() {
      const list = [
        {
          value: this.$t('subAccount.common.coinType1'),
          code: '1',
        },
      ];
      if (this.leverOpen) {
        list.push({
          value: this.$t('subAccount.common.coinType4'),
          code: '2',
        }); // 杠杆账户 --逐仓
      }
      list.push({
        value: this.$t('subAccount.common.coinType3'),
        code: '3',
      }); // 合约账户
      return list;
    },
    accountAllTypeList() {
      const list = [
        {
          value: this.$t('subAccount.common.coinType1'),
          code: '1',
        },
      ];
      if (this.leverOpen) {
        list.push({
          value: this.$t('subAccount.common.coinType4'),
          code: '2',
        }); // 杠杆账户 --逐仓
      }
      list.push({
        value: this.$t('subAccount.common.coinType3'),
        code: '3',
      }); // 合约账户
      return list;
    },
  },
};
