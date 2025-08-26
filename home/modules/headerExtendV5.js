(() => {
  const {
    myStorage, getScript, removeCookie, getCookie,
  } = window.BlockChainUtils;
  const {
    location, fetchData, emitter,
  } = window;
  const setCookie = (name, value) => {
    const exp = new Date();
    exp.setTime(exp.getTime() + 36500 * 24 * 60 * 60 * 1000);
    let domain = `.${location.host.split('.')[1]}.${location.host.split('.')[2]}`;
    if (location.host.split('.')[4]) {
      document.cookie = `${name}=${escape(value)};expires=${exp.toGMTString()};path=${escape('/')}`;
    } else if (location.host.split('.')[3]) {
      domain = `.${location.host.split('.')[1]}.${location.host.split('.')[2]}.${location.host.split('.')[3]}`;
      document.cookie = `${name}=${escape(value)};expires=${exp.toGMTString()};domain=${domain};path=${escape('/')}`;
    } else if (location.host.split('.')[2]) {
      document.cookie = `${name}=${escape(value)};expires=${exp.toGMTString()};domain=${domain};path=${escape('/')}`;
    } else if (!location.host.split('.')[2] && !location.host.split('.')[1]) {
      // 本地环境存储
      document.cookie = `${name}=${escape(value)};expires=${exp.toGMTString()};path=${escape('/')}`;
    } else {
      // 当线上读取不到www时
      document.cookie = `${name}=${escape(value)};expires=${exp.toGMTString()};domain=.${location.host};path=${escape('/')}`;
    }
  };
  class HeaderExtend {
    init() {
      this.$commonHeader = document.querySelector('#common-header');
      this.$headerCusNav = document.querySelector('#header-cus-nav');
      this.$headerNavEven = document.querySelector('#common-header-linkList');
      this.$commonHeaderOptionList = document.querySelector('.header-isLogin');
      this.headerNavEvenList = Array.prototype.slice.call(this.$headerNavEven.querySelectorAll('.header-navEven'));
      this.$headerIsLoginNavEvenTitle = Array.prototype.slice.call(document.querySelectorAll('.header-isLogin-navEven-title'));
      this.$btnLink = Array.prototype.slice.call(document.querySelectorAll('.btn-link'));
      this.$lanList = Array.prototype.slice.call(this.$commonHeader.querySelectorAll('.lang-list'));
      this.$currencyList = Array.prototype.slice.call(this.$commonHeader.querySelectorAll('.header-lang_list'));
      this.$loginBtn = this.$commonHeader.querySelector('.header-login-button');
      this.$registerBtn = this.$commonHeader.querySelector('.header-reg-button');
      this.headerNavEvenListIn = Array.prototype.slice.call(this.$commonHeader.querySelectorAll('.header-navEven-list'));
      this.$logOut = this.$commonHeader.querySelector('.logout');
      this.$colorList = Array.prototype.slice.call(document.querySelectorAll('#colorList li'));
      this.$appdownLoadCoin = this.$commonHeader.querySelector('.appdownLoad-coin');
      this.$colorSet = document.querySelector('#color-set');
      this.$headerUserOut = this.$commonHeader.querySelector('.header-user-out');
      this.colorDialog = null;
      this.outFlag = true;
      this.getData();
      if (!window.BlockChainDialog && this.dialogPath) {
        getScript(`${window.staticDomain}/home/static/${this.dialogPath}`).then(() => {
          this.initColorDiaolog();
          this.bindEvent();
        });
      } else {
        this.initColorDiaolog();
        this.bindEvent();
      }
      this.setNavBg();
    }

    setNavBg() {
      if (this.$commonHeader) {
        const { scrollY } = window;
        const classList = Array.prototype.slice.call(this.$commonHeader.classList);
        if (scrollY > 580) {
          this.$commonHeader.classList.remove('static');
        } else if (classList.indexOf('static') < 0) {
          this.$commonHeader.classList.add('static');
        }
      }
    }

    bindEvent() {
      window.addEventListener('scroll', () => {
        this.setNavBg();
      });
      if (this.$appdownLoadCoin) {
        this.$appdownLoadCoin.addEventListener('click', () => {
          window.location.href = '/appDownload';
        }, false);
      }
      if (this.headerNavEvenListIn.length) {
        this.headerNavEvenListIn.forEach((ul) => {
          Array.prototype.slice.call(ul.querySelectorAll('li')).forEach((li) => {
            li.addEventListener('mouseover', () => {
              // const { target } = e;
              // eslint-disable-next-line no-param-reassign
              li.className = 'hover-bg v5-1-cl special-2-bg';
            }, false);
            li.addEventListener('mouseout', () => {
              // const { target } = e;
              // eslint-disable-next-line no-param-reassign
              li.className = 'list-item-cl';
            }, false);
          });
        });
      }
      if (this.$headerUserOut.length) {
        this.$headerUserOut.addEventListener('mouseover', () => {
          // const { target } = e;
          // eslint-disable-next-line no-param-reassign
          this.$headerUserOut.className = 'special-2-bg';
        }, false);
        this.$headerUserOut.addEventListener('mouseout', () => {
          // const { target } = e;
          // eslint-disable-next-line no-param-reassign
          this.$headerUserOut.className = 'list-item-cl';
        }, false);
      }

      if (this.$colorSet) {
        // 设置cusSkin
        this.$colorList.forEach((item) => {
          if (item.dataset.checked) {
            setCookie('cusSkin', item.dataset.id);
          }
        });
        this.$colorSet.addEventListener(
          'click',
          () => {
            // this.colorDialog.show(); //  使用弹框
            // 设置深色、浅色 不使用弹框
            if (getCookie('cusSkin') === '1') {
              setCookie('cusSkin', 2);
              window.location.reload();
              return;
            }
            if (getCookie('cusSkin') === '2') {
              setCookie('cusSkin', 1);
              window.location.reload();
            }
          },
          false,
        );
      }

      Array.prototype.slice.call(this.$commonHeader.querySelectorAll('.goMessage')).forEach((item) => {
        item.addEventListener('click', () => {
          location.href = '/mesage';
        }, false);
      });
      if (this.$logOut) {
        this.$logOut.addEventListener('click', () => {
          if (!this.outFlag) { return; }
          this.outFlag = false;
          fetchData({
            url: '/fe-ex-api/user/login_out',
          }).then((data) => {
            this.outFlag = true;
            if (data.code.toString() === '0') {
              emitter.emit('tip', { text: data.msg, type: 'success' });
              location.reload();
            } else {
              emitter.emit('tip', { text: data.msg, type: 'error' });
            }
          });
        }, false);
      }

      Array.prototype.slice.call(this.$commonHeader.querySelectorAll('.goPersonal')).forEach((item) => {
        item.addEventListener('click', () => {
          location.href = '/personal/userManagement';
        }, false);
      });
      if (this.$loginBtn) {
        this.$loginBtn.addEventListener('click', () => {
          location.href = '/login';
        });
        this.$loginBtn.addEventListener('mouseover', () => {
          this.$loginBtn.className = 'common-button header-login-button common-button-text-kind v5-1-cl';
        });
        this.$loginBtn.addEventListener('mouseout', () => {
          this.$loginBtn.className = 'common-button header-login-button common-button-text-kind v5-5-cl white';
        });
      }
      if (this.$registerBtn) {
        this.$registerBtn.addEventListener('click', () => {
          location.href = '/register';
        });
        this.$registerBtn.addEventListener('mouseover', () => {
          this.$registerBtn.className = 'common-button header-reg-button common-button-hollow-big v5-1-bg';
        });
        this.$registerBtn.addEventListener('mouseout', () => {
          this.$registerBtn.className = 'common-button header-reg-button common-button-hollow-big v5-1-bg';
        });
      }
      this.$lanList.forEach((item) => {
        item.addEventListener('mouseover', (e) => {
          const { target } = e;

          if (target.tagName === 'LI') {
            target.className = 'hover-bg v5-1-cl';
          }
        });

        item.addEventListener('mouseout', (e) => {
          const { target } = e;
          if (target.tagName === 'LI') {
            let lan = 'null';
            if (target.dataset && target.dataset.key) {
              [, lan] = target.dataset.key.split('/');
            }
            const newLan = window.location.href.match(/[a-z]+_[A-Z]+/)[0];
            if (lan === newLan) {
              target.className = 'hover-bg v5-1-cl';
            } else {
              target.className = 'list-item-cl';
            }
          }
        });
        item.addEventListener('click', (e) => {
          const { target } = e;
          const data = target.dataset;
          if (target.tagName === 'LI') {
            if (data.link) {
              location.href = data.link;
            } else if (data.key) {
              location.href = data.key;
            }
          }
        });
      });
      // 汇率语言点击
      this.$currencyList.forEach((item) => {
        item.addEventListener('mouseover', (e) => {
          const { target } = e;
          if (target.tagName === 'LI') {
            target.className = 'header-lang_item hover-bg v5-1-cl';
          }
        });

        item.addEventListener('mouseout', (e) => {
          const { target } = e;
          if (target.tagName === 'LI') {
            target.className = 'header-lang_item';
          }
        });
        item.addEventListener('click', (e) => {
          const { target } = e;
          if (target.tagName === 'LI') {
            const data = target.dataset;
            if (data && data.key) {
              location.href = data.key;
            }
            if (data && data.id) {
              removeCookie('userCurrency');
              setCookie('user_Currency', data.id);
              window.location.reload();
            }
          }
        });
      });
      this.$headerIsLoginNavEvenTitle.forEach((item) => {
        item.addEventListener('mouseover', (e) => {
          const { target } = e;
          if (target.tagName === 'DIV') {
            target.className = 'header-isLogin-navEven-title v5-1-cl';
          }
        });
        item.addEventListener('mouseout', (e) => {
          const { target } = e;
          if (target.tagName === 'DIV') {
            target.className = 'header-isLogin-navEven-title v5-5-cl white';
          }
        });
      });

      this.$btnLink.forEach((item) => {
        item.addEventListener('click', (e) => {
          const { target } = e;
          const data = target.dataset;
          if (target.tagName === 'DIV') {
            if (data.link) {
              location.href = data.link;
            }
          }
        });
      });

      this.$headerNavEven.addEventListener('click', (e) => {
        const { target } = e;
        const data = target.dataset;
        const { link } = data;
        const { trades } = data;
        const { id } = data;
        if (trades) {
          if (id === 'exTrade' && this.etfOpen) {
            myStorage.set('markTitle', '');
            myStorage.set('sSymbolName', '');
          }
        }
        if (link) {
          window.location.href = link;
        }
      }, false);

      this.$headerNavEven.addEventListener('mouseout', () => {
        this.headerNavEvenList.forEach((item) => {
          // eslint-disable-next-line no-param-reassign
          item.className = 'header-navEven v5-5-cl white';
        });
      }, false);
      this.$headerNavEven.addEventListener('mouseover', (e) => {
        const { target } = e;
        if (target && target.className && target.className.indexOf('header-navEven') > -1 && target.tagName === 'LI') {
          target.className = 'header-navEven v5-1-cl';
        }
      }, false);

      if (this.$headerCusNav) {
        this.$headerCusNav.addEventListener('mouseover', (e) => {
          const { target } = e;
          if (target.tagName === 'A') {
            target.className = 'h-4-bg x-3-cl';
          }
        }, false);
        this.$headerCusNav.addEventListener('mouseout', (e) => {
          const { target } = e;
          if (target.tagName === 'A') {
            target.className = 'x-2-cl g-3-cl-h';
          }
        }, false);
      }

      // 任务中心
      // 复制UID
      document.querySelector('.copy-uid-trigger').addEventListener('click', () => {
        const copy = document.querySelector('.show-uid').innerText;
        const copyInput = document.createElement('input');
        // val是要复制的内容
        copyInput.setAttribute('value', copy);
        document.body.appendChild(copyInput);
        copyInput.select();
        const copyed = document.execCommand('copy');
        if (copyed) {
          document.body.removeChild(copyInput);
          const tip = getCookie('lan') === 'zh_CN' ? '复制成功' : 'Copied Successfully!';
          window.emitter.emit('tip', { text: tip, type: 'success' });
        }
      });
      // 菜单跳转
      const list = document.querySelectorAll('.link-nav');
      list.forEach((item) => {
        item.addEventListener('click', () => {
          const jumpType = item.getAttribute('data-type');
          window.location.href = jumpType;
        });
      });
    }

    login() {
      fetchData({
        method: 'post',
        url: '/fe-ex-api/common/user_info',
      }).catch(() => {
      })
        .then((data) => {
          if (data) {
            if (!Number(data.code)) {
              window.isLogin = true;
              const $loginSet = Array.prototype.slice.call(this.$commonHeader.querySelectorAll('.login-set'));
              $loginSet.forEach((target) => {
                // eslint-disable-next-line no-param-reassign
                target.style.display = 'flex';
              });
              const $unloginSet = Array.prototype.slice.call(this.$commonHeader.querySelectorAll('.unlogin-set'));
              $unloginSet.forEach((target) => {
                // eslint-disable-next-line no-param-reassign
                target.style.display = 'none';
              });
              if (data.data.isSub !== 1) {
                if (data.data.authLevel.toString() === '1') {
                  const $loginSetSubAccount = Array.prototype.slice.call(this.$commonHeader.querySelectorAll('.subAccountItem'));
                  $loginSetSubAccount.forEach((target) => {
                    // eslint-disable-next-line no-param-reassign
                    target.style.display = 'flex';
                  });
                }
                const $loginSetLeaglTenderSetItem = Array.prototype.slice.call(this.$commonHeader.querySelectorAll('[data-classSub="subOtcClass"]'));
                $loginSetLeaglTenderSetItem.forEach((target) => {
                  // eslint-disable-next-line no-param-reassign
                  target.style.display = 'block';
                });
              } else {
                const $loginSetLeaglTenderSetItem = Array.prototype.slice.call(this.$commonHeader.querySelectorAll('[data-classSub="subOtcClass"]'));
                $loginSetLeaglTenderSetItem.forEach((target) => {
                  // eslint-disable-next-line no-param-reassign
                  target.style.display = 'none';
                });
              }
              if (this.$commonHeader.querySelector('.userText')) {
                this.$commonHeader.querySelector('.userText').innerHTML = data.data.userAccount;
              }
              if (this.$commonHeader.querySelector('.show-uid')) {
                this.$commonHeader.querySelector('.show-uid').innerText = data.data.id;
              }
              if (this.$commonHeader.querySelector('.levelName')) {
                this.$commonHeader.querySelector('.levelName').innerText = data.data.levelName;
              }
              // if (this.$commonHeader.querySelector('.userStatus')) {
              //   this.$commonHeader.querySelector('.userStatus').innerHTML = `${this.locale.userStatus}: ${this.userState[Number(data.data.accountStatus)]}`;
              // }
            }
            window.emitter.emit('login');
          }
        });
    }

    getFunctionSwitch() {
      fetchData({
        method: 'GET',
        url: '/fe-ex-api/common/switch',
        params: {},
      }).catch(() => {
      })
        .then((data) => {
          if (data) {
            if (data.code === '0') {
              const { switchVo } = data.data;
              if (switchVo && switchVo.jpSpotSwitch === 1) {
                setCookie('jpSpotSwitch', '1');
              } else {
                setCookie('jpSpotSwitch', '0');
              }
            } else {
              setCookie('jpSpotSwitch', '0');
            }
          }
        });
    }

    getMessage() {
      fetchData({
        url: '/fe-ex-api/message/v4/get_no_read_message_count',
        method: 'post',
        // eslint-disable-next-line no-unused-vars
      }).catch((error) => {
      })
        .then((data) => {
          if (data && !Number(data.code)) {
            if (data.data.noReadMsgCount) {
              const $headerUserMessage = this.$commonHeader.querySelector('.header-user-message');
              this.$commonHeader.querySelector('#messageMore').style.display = 'block';
              $headerUserMessage.classList.add('message-list');
              const { userMessageList } = data.data;
              let html = '';
              userMessageList.forEach((item) => {
                html += `<li class="v5-5-cl white mesageNav">
                                    ${item.messageContent}
                                </li>`;
              });
              $headerUserMessage.querySelector('.header-user-text').innerHTML = html;
            }
          }
        });
    }

    getShowTaskReward() {
      window.fetchData({
        url: '/fe-ex-api/reward_center_info',
        method: 'post',
      })
        .then((res) => {
          const { confSwitch } = res.data;
          if (confSwitch === 1) {
            document.querySelector('.gift-center').style.display = 'flex';
          }
          if (res.data.suspendedShowPage && res.data.suspendedShowPage.indexOf('1') !== -1) {
            document.getElementById('reward-card-container').style.display = 'flex';
            setTimeout(() => {
              document.getElementById('taskImg').src = res.data.suspendedImgUrl || window.imgMap.taskFloat;
              document.getElementById('taskTitle').innerHTML = res.data.suspendedTitle || this.locale.rewardDialogTitle;
              document.getElementById('taskDesc').innerHTML = res.data.suspendedSubTitle || this.locale.rewardDialogDesc;
            });
          }
        });
    }

    getTaskMsg() {
      fetchData({
        url: '/fe-ex-api/task_complete_count',
        method: 'post',
      })
        .then((res) => {
          const { count = 0 } = res.data;
          if (count > 0) {
            document.querySelector('.gift-center').className = 'link-item link-nav gift-center show-dot text-1-cl special-2-cl-h';
            document.querySelector('#person-center').className = 'header-user login-set show-dot';
          }
        });
    }

    getData() {
      this.getFunctionSwitch();
      this.login();
      this.getMessage();
      this.getShowTaskReward(); // 任务中心：获取是否展示奖励中心
      this.getTaskMsg(); // 任务中心：获取是否有未领取的奖励-展示红点
    }

    initColorDiaolog() {
      this.$colorList.forEach((item) => {
        if (item.dataset.checked) {
          item.classList.add('checked');
        }
      });
      this.colorDialog = new window.BlockChainDialog({
        locale: this.locale,
        content: `<div class="setBox">
                            <div class="setColor clearfix">
                                <div class="setColor-key v5-5-cl white">${this.locale.color}</div>
                                <ul class="setColor-value colorList">
                                   ${document.querySelector('#colorList').innerHTML}
                                </ul>
                            </div>
                        </div>`,
        confirm() {
          const $checked = this.dialog.querySelector('.checked');
          setCookie('cusSkin', $checked.dataset.id);
          window.location.reload();
        },
      });

      const $DialogColorList = Array.prototype.slice.call(this.colorDialog.dialog.querySelectorAll('.colorList li'));
      $DialogColorList.forEach((item) => {
        item.addEventListener('click', () => {
          if (!item.classList.contains('checked')) {
            $DialogColorList.forEach((el) => {
              el.classList.remove('checked');
            });
            item.classList.add('checked');
          }
        });
      });
    }
  }

  window.HeaderExtend = HeaderExtend;
})();
