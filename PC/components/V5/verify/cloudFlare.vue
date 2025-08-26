<!-- eslint-disable no-undef -->
<!-- eslint-disable no-param-reassign -->
<template>
  <div
    class="cloudflare"
    v-show="isShowCloudFlare"
    :style="{
      marginTop: isShowCloudFlare && !isHideMode ? '32px' : '0px',
    }"
  >
    <div class="box" id="cloundFlareWidget" data-size="flexible" v-show="isShowCloudFlare">
      <div class="error-mask"></div>
    </div>
  </div>
</template>

<script>
import { getCookie } from '@/utils';

export default {
  name: 'common-geetest',
  data() {
    return {
      isReady: false, // 是否准备成功
      isShowCloudFlare: false, // 是否显示 cloudflare
      isHideMode: true, // 是否是无形模式
      timer1: null,
      timer2: null,
      widgetId: null, // 保存 turnstile 渲染 id
      cfObserver: null,
      cfResizeObs: null,
    };
  },
  props: {
    product: { default: '', type: String },
    width: { default: '100%', type: String },
    marginTop: { default: '0px', type: String },
    errorHave: { default: false, type: Boolean },
    errorText: { default: '', type: String },
    errorFlag: { default: false, type: Boolean },
    geetestBg: { default: 'fill-1-bg', type: String },
    colorMap: { default: () => {}, required: true },
  },
  computed: {
    lan() {
      return this.$store.state.baseData.lan;
    },
    cloudFlareLan() {
      let language = '';
      if (this.lan === 'zh_CN') language = 'zh-cn';
      else if (this.lan === 'el_GR') language = 'zh-hk';
      else if (this.lan === 'pt_PT') language = 'pt-pt';
      else if (this.lan === 'tr_TR') language = 'tR';
      else {
        const arr = ['en', 'ja', 'id', 'ko', 'ru', 'ar', 'es', 'fr', 'de'];
        if (this.lan.length && this.lan.split('_').length) {
          const first = this.lan.split('_')[0].toLowerCase();
          if (arr.indexOf(first) !== -1) language = first;
        }
      }
      if (!language.length) language = 'en';
      return language;
    },
    cusSkin() {
      return getCookie('cusSkin'); // 1黑色 2白色
    },
  },
  created() {
    this.init();
  },
  beforeDestroy() {
    this.cleanup();
  },
  methods: {
    init() {
      this.axios({
        url: 'common/tartCaptchaV2',
        headers: {},
        params: {},
        method: 'post',
      }).then((data) => {
        if (data.code === '0' && data.data && data.data.cloudflare) {
          const { siteKey } = data.data.cloudflare;
          this.turnstileCb(siteKey);
        }
      });
    },

    turnstileCb(siteKey) {
      const selector = '#cloundFlareWidget';
      const container = document.querySelector(selector);
      if (!container) {
        // console.warn('[Turnstile] 容器未找到:', selector);
        return;
      }

      this.cleanup(); // 先清理旧实例和定时器

      // 先清空容器，避免多次渲染残留
      container.innerHTML = '';

      const updateState = (iframeEl) => {
        if (!iframeEl) {
          this.isShowCloudFlare = true;
          this.isHideMode = false;
          return;
        }
        iframeEl.style.width = '338px';
        const height = iframeEl.offsetHeight || iframeEl.getBoundingClientRect().height || 0;
        this.isHideMode = height === 0;
        this.isShowCloudFlare = true;
      };

      this.cfObserver = new MutationObserver(() => {
        const iframe = container.querySelector('iframe');
        if (iframe) {
          this.cfObserver.disconnect();
          this.cfObserver = null;

          this.$nextTick(() => updateState(iframe));

          if (typeof ResizeObserver !== 'undefined') {
            this.cfResizeObs = new ResizeObserver(() => updateState(iframe));
            this.cfResizeObs.observe(iframe);
          }
        }
      });
      this.cfObserver.observe(container, { childList: true, subtree: true });

      let retry = 0;
      this.timer2 = setInterval(() => {
        retry += 1;
        const iframe = container.querySelector('iframe');
        if (iframe || retry > 100) {
          clearInterval(this.timer2);
          this.timer2 = null;
          this.$nextTick(() => updateState(iframe));
        }
      }, 50);

      this.timer1 = setTimeout(() => {
        this.isShowCloudFlare = true;
      }, 3000);

      if (!window.turnstile || typeof turnstile.ready !== 'function') {
        // console.warn('[Turnstile] 脚本未加载');
        this.isShowCloudFlare = true;
        this.isHideMode = false;
        return;
      }

      turnstile.ready(() => {
        if (this.widgetId && window.turnstile) {
          turnstile.remove(this.widgetId);
          this.widgetId = null;
        }
        this.widgetId = turnstile.render(selector, {
          sitekey: siteKey,
          theme: this.cusSkin === '1' ? 'dark' : 'light',
          language: this.cloudFlareLan,
          callback: (token) => {
            setTimeout(() => {
              this.$emit('callback', {
                cloudFlareToken: token,
                verificationType: '3',
              });
            }, 300);
          },
          'error-callback': (err) => {
            console.warn('[Turnstile] 验证出错', err);
          },
        });
      });
    },

    cleanup() {
      if (this.timer1) { clearTimeout(this.timer1); this.timer1 = null; }
      if (this.timer2) { clearInterval(this.timer2); this.timer2 = null; }
      if (this.cfObserver) { this.cfObserver.disconnect(); this.cfObserver = null; }
      if (this.cfResizeObs) { this.cfResizeObs.disconnect(); this.cfResizeObs = null; }
      if (this.widgetId && window.turnstile) {
        turnstile.remove(this.widgetId);
        this.widgetId = null;
      }
      const container = document.querySelector('#cloundFlareWidget');
      if (container) {
        container.innerHTML = '';
      }
    },
  },
};
</script>

<style lang="stylus">
.cloudflare {
  height: auto;
  overflow: hidden;
  border-color: #666;
  margin-top: 0px;

  .box {
    position: relative;
    .error-mask {
      width: 150px;
      background: red;
      position: absolute;
      opacity: 0;
      left: 44px;
      z-index: 10;
    }
  }
}
</style>
