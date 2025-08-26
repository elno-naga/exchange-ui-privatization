(() => {
  const { emitter } = window;
  class Tip {
    constructor() {
      this.createTip();
      this.createCss();
      emitter.on('tip', (opt) => {
        const type = opt.type || 'info';
        const { text } = opt;
        this.pushTip(type, text);
      });
      this.tip.addEventListener('transitionend', (e) => {
        const { target } = e;
        if (target.style.opacity === '0') {
          target.parentNode.removeChild(target);
        }
      }, false);
    }

    createTip() {
      const tip = document.createElement('section');
      tip.className = 'common-tip';
      this.tip = document.body && document.body.appendChild(tip);
    }

    pushTip(type, text) {
      const li = document.createElement('li');
      li.className = 'common-tip-even fill-3-bg text-1-cl tip-enter';
      let svgHtml = '';
      if (type === 'success') {
        svgHtml = `<svg viewBox="0 0 16 16" class='icon icon-16' aria-hidden='true'>
          <path fill-rule="evenodd" clip-rule="evenodd" d="M8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16ZM7.00014 12.2388L13.2075 6.03155L11.7933 4.61733L7.00021 9.4103L4.70723 7.11712L3.29296 8.53127L7.00014 12.2388Z" fill="#00B595"/>
        </svg>`;
      } else if (type === 'error') {
        svgHtml = `<svg viewBox="0 0 16 16" class='icon icon-16' aria-hidden='true'>
          <path fill-rule="evenodd" clip-rule="evenodd" d="M8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16ZM3.75015 5.16422L5.16436 3.75L7.99275 6.57839L10.8211 3.75007L12.2353 5.16428L9.40696 7.9926L12.2354 10.8211L10.8212 12.2353L7.99275 9.40681L5.16421 12.2354L3.75 10.8211L6.57854 7.9926L3.75015 5.16422Z" fill="#D1425E"/>
        </svg>`;
      } else if (type === 'warning') {
        svgHtml = `<svg viewBox="0 0 16 16" class='icon icon-16' aria-hidden='true'>
          <path fill-rule="evenodd" clip-rule="evenodd" d="M0 8C0 12.4183 3.58172 16 8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0C3.58172 0 0 3.58172 0 8ZM7 10V3H9V10H7ZM7 13V11H9V13H7Z" fill="#E9A92A"/>
        </svg>`;
      }
      li.innerHTML = `<span class="icon"></span>${svgHtml}<div class='text'>${text}</div>`;
      const tips = this.tip.appendChild(li);
      setTimeout(() => {
        tips.style.opacity = 1;
        tips.style.transform = 'translateX(0)';
      }, 100);
      setTimeout(() => {
        setTimeout(() => {
          tips.style.opacity = 0;
          tips.style.transform = 'translateX(30%)';
        }, 0);
      }, 3000);
    }

    createCss() {
      const css = `
      .tip-item-move {display:inline-block;margin-right:10px}
      .tip-enter-active,.tip-leave-active{transition:all .3s}
      .tip-enter,.tip-leave-to{opacity:0;transform:translateX(30%)}
      .common-tip {
        position: fixed;
        right: 20px;
        top: 83px;
        z-index: 9999;
      }
      .common-tip .common-tip-even {
        width: 280px;
        min-height: 40px;
        border-radius: 4px;
        margin-bottom: 26px;
        //border-left-width: 3px;
        //border-left-style: solid;
        box-sizing: border-box;
        transition: all 0.3s;
        padding: 12px 16px 12px 40px;
        position: relative;
        .icon {
          position: absolute;
          width: 16px;
          height: 16px;
          top: 13px;
          left: 16px;
          border-radius: 50%;
        }
        .text{
          font-family: HarmonyOS-Medium;
          font-size: 14px;
          letter-spacing: 0;
          text-align: left;
          line-height: 20px;
        }
      }`;
      const style = document.createElement('style');
      style.innerHTML = css;
      if (document.body) {
        document.body.appendChild(style);
      }
    }
  }
  window.BlockChainTip = new Tip();
})();
