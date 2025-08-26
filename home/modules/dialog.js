(() => {
  class BlockChainDialog {
    constructor(option) {
      this.locale = option.locale || {};
      this.content = option.content || '';
      this.confirm = option.confirm || function s() {
      };
      this.createDialog();
      this.bindEvent();
    }

    bindEvent() {
      const $confirm = this.dialog.querySelector('.confirm');
      const $closeBtn = this.dialog.querySelector('.closeBtnClass');
      const $headerClose = this.dialog.querySelector('.dialog-frame-head-close');
      const $dialogFrame = this.dialog.querySelector('.dialog-frame');
      $confirm.addEventListener('click', () => {
        this.confirm();
      });
      $closeBtn.addEventListener('mouseover', () => {
        $closeBtn.className = 'common-button common-button-text main-1-cl main-2-bg closeBtnClass';
      });
      $closeBtn.addEventListener('mouseout', () => {
        $closeBtn.className = 'common-button common-button-text main-1-cl closeBtnClass';
      });
      $closeBtn.addEventListener('mousedown', () => {
        $closeBtn.className = 'common-button common-button-text main-1-cl main-3-bg closeBtnClass';
      });
      $closeBtn.addEventListener('mouseup', () => {
        $closeBtn.className = 'common-button common-button-text main-1-cl closeBtnClass';
      });
      $closeBtn.addEventListener('click', () => {
        this.hide();
      });

      $headerClose.addEventListener('click', () => {
        this.hide();
      }, false);

      $dialogFrame.addEventListener('webkitAnimationEnd', (e) => {
        const { target } = e;
        if (target.classList.contains('drop-leave-active')) {
          $dialogFrame.classList.remove('drop-leave-active');
          this.dialog.style.display = 'none';
        } else {
          $dialogFrame.classList.remove('drop-enter-active');
        }
      }, false);
    }

    show() {
      this.dialog.style.display = 'block';
      this.dialog.querySelector('.dialog-frame').classList.add('drop-enter-active');
    }

    hide() {
      this.dialog.querySelector('.dialog-frame').classList.add('drop-leave-active');
    }

    createDialog() {
      const dialog = document.createElement('section');
      const { locale } = this;
      dialog.className = 'common-dialog';
      dialog.style.display = 'none';
      dialog.innerHTML = `<div class="dialog-markAll fill-8-bg"></div>
                    <div class="dialog-frame fill-2-bg">
                        <div class="dialog-frame-head fill-3-bg">
                            <span class="dialog-frame-head-text text-1-cl">${locale.titleText}</span>
                            <span class="dialog-frame-head-close">
                                <section class="common-iconButton">
                                    <div class="iconButton-icon">
                                        <svg aria-hidden="true" class="icon icon-16">
                                            <use xlink:href="#icon-c_7"></use>
                                        </svg>
                                    </div>
                                    <div class="iconButton-bg"></div>
                                </section>
                            </span>
                        </div>
                        <div class="dialog-frame-body" style="padding-top: 30px; padding-bottom: 30px;">
                            <div class="setBox">
                                ${this.content}
                            </div>
                        </div>
                        <div class="dialog-frame-bottom">
                            <div class="dialog-frame-options">
                                <button class="common-button common-button-text main-1-cl closeBtnClass" style="height: 40px; padding-left: 31px; padding-right: 31px; margin-top: 0;">
                                    <div class="common-button-slot">${locale.closeTextProps}</div>
                                </button>
                                <button class="common-button common-button-solid main-1-bg text-4-cl confirm" style="height: 40px; padding-left: 31px; padding-right: 31px; margin-top: 0;">
                                    <div class="common-button-slot">${locale.confirmTextProps}</div>
                                    <div class='solidBc bghover main-2-bg'></div>
                                    <div class='solidBc bgactive main-3-bg'></div>
                                </button>
                            </div>
                        </div>
                    </div>`;
      const body = document.querySelector('body');
      this.dialog = body.appendChild(dialog);
    }
  }

  window.BlockChainDialog = BlockChainDialog;
})();
