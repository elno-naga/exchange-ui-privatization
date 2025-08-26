// Created by 任泽阳 on 18/12/12. // 验证
<template>
  <section class="common-verify" :key="name">
    <!-- {{ verificationType }} -->
    <!-- 极验 -->
    <Geetest
      v-if="verificationType === '2'"
      @callback="callback"
      @getCaptchaObj="getCaptchaObj"
      :width="width"
      :product="product"
      :marginTop="marginTop"
      :errorHave="errorHave"
      :errorText="errorText"
      :errorFlag="errorFlag"
      :colorMap="colorMap"
      :geetestBg="geetestBg"
    />
    <!-- 阿里 -->
    <AliyunCaptcha
      v-if="verificationType === '1'"
      @callback="callback"
      :width="width"
      :marginTop="marginTop"
      :errorHave="errorHave"
      :errorText="errorText"
      :errorFlag="errorFlag"
    />
    <CloudFlare
      v-if="verificationType === '3'"
      @callback="callback"
      :colorMap="colorMap"
    ></CloudFlare>
  </section>
</template>
<script>
import AliyunCaptcha from './aliyunCaptcha.vue';
import Geetest from './geetest.vue';
import CloudFlare from './cloudFlare.vue';

export default {
  components: { Geetest, AliyunCaptcha, CloudFlare },
  name: 'c-verify',
  props: {
    product: { default: '', type: String },
    name: { default: '', type: String },
    width: { default: '100%', type: String }, // 该容器根容器 width属性
    marginTop: { default: '0px', type: String }, // 该组件根容器 margin-top属性
    errorHave: { default: false, type: Boolean }, // 是否有错误文案
    errorText: { default: '', type: String }, // 错误文案
    errorFlag: { default: false, type: Boolean }, // 错误文案是否显示
    geetestBg: { default: 'fill-1-bg', type: String }, // 极验的背景颜色
    colorMap: { default: () => {}, required: true },
  },
  data() {
    return {
      tartCaptchaV2: null, // 所有验证方式
    };
  },
  computed: {
    verificationType() {
      const { publicInfo } = this.$store.state.baseData;
      if (publicInfo && publicInfo.switch) {
        if (publicInfo.switch.verificationType === '2') {
          // 极验
          return '2';
        }
        if (publicInfo.switch.verificationType === '3') {
          // cloudflare
          return '3';
        }
        if (publicInfo.switch.verificationType === '0') {
          // 混合模式
          if (
            this.tartCaptchaV2
            && this.tartCaptchaV2.geetest
            && this.tartCaptchaV2.geetest.success
            && this.tartCaptchaV2.geetest.challenge
            && this.tartCaptchaV2.geetest.gt
            && this.tartCaptchaV2.cloudflare
            && this.tartCaptchaV2.cloudflare.siteKey
          ) {
            if (Number(Math.random()) > 0.5) {
              return '2';
            }
            return '3';
          }
          if (
            this.tartCaptchaV2
            && this.tartCaptchaV2.geetest
            && this.tartCaptchaV2.geetest.success
            && this.tartCaptchaV2.geetest.challenge
            && this.tartCaptchaV2.geetest.gt
          ) {
            return '2';
          }
          if (
            this.tartCaptchaV2
            && this.tartCaptchaV2.cloudflare
            && this.tartCaptchaV2.cloudflare.siteKey
          ) {
            return '3';
          }
          return '2';
        }
      }
      return '2';
    },
  },
  methods: {
    init() {
      this.axios({
        url: 'common/tartCaptchaV2',
        headers: {},
        params: {},
        method: 'post',
      }).then((data) => {
        if (data.code === '0') {
          this.tartCaptchaV2 = data.data;
          const { publicInfo } = this.$store.state.baseData;
          setTimeout(() => {
            if (publicInfo && publicInfo.switch) {
              if (
                publicInfo.switch.verificationType === '2'
              && !this.tartCaptchaV2.geetest
              ) {
              // 极验
                this.$bus.$emit('tip', {
                  text: this.$t('cloudFlare.verifyEroor'),
                  type: 'error',
                });
              }
              if (
                publicInfo.switch.verificationType === '3'
              && !this.tartCaptchaV2.cloudflare
              ) {
              // cloudflare
                this.$bus.$emit('tip', {
                  text: this.$t('cloudFlare.verifyEroor'),
                  type: 'error',
                });
              }
            }
          }, 1000);
        }
      });
    },
    callback(item) {
      this.$emit('callback', item);
    },
    getCaptchaObj(captchaObj) {
      this.$emit('getCaptchaObj', captchaObj);
    },
  },
  created() {
    this.init();
  },
  mounted() {
    // 验证类型传给使用页面
    setTimeout(() => {
      this.$emit('getVerificationType', this.verificationType);
    }, 500);
  },
};
</script>
<style lang='stylus'>
.common-verify {
  position: relative;
  z-index: 1;
}
</style>
