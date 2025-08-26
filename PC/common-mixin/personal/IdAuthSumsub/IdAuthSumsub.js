import snsWebSdk from '@sumsub/websdk';
import { getCookie } from '@/utils';

export default {
  name: 'Sumsub',
  data() {
    return {
      lan: getCookie('lan') || 'en_US',
      levelName: '',
    };
  },
  watch: {},
  computed: {
    cusSkin() {
      return getCookie('cusSkin');
    },
    colorStr() {
      return ':root {--section-shadow-color:transparent;--primary-color:#606266;--gray-color:#A0A2AA;};';
    },
  },
  methods: {
    init() {
      this.levelName = this.$route.params.level;
      this.getAccessToken(this.launchWebSdk);
    },
    getAccessToken(callback) {
      this.axios({
        url: 'sumsub/getAccessToken',
        params: {
          sumsubLevel: this.levelName,
        },
      }).then(({ code, data, msg }) => {
        this.showLoading = false;
        if (code.toString() === '0') {
          callback(data);
        } else {
          this.$bus.$emit('tip', { text: msg, type: 'error' });
        }
      });
    },
    launchWebSdk(accessToken) {
      const snsWebSdkInstance = snsWebSdk.init(
        accessToken,
        () => this.getNewAccessToken(),
      )
        .withConf({
          lang: this.lan.split('_')[0],
          i18n: { document: { subTitles: { IDENTITY: 'Upload a document that proves your identity' } } },
          onMessage: (type, payload) => {
            console.log('WebSDK onMessage', type, payload);
          },
          uiConf: {
            scrollIntoView: false,
            customCssStr: this.colorStr,
          },
        })
        .withOptions({ addViewportTag: false, adaptIframeHeight: true })
        .on('idCheck.onReady', () => {
          console.log('idCheck onReady');
        })
        .on('idCheck.onInitialized', () => {
          console.log('idCheck onInitialized ');
        })
        .on('idCheck.onStepInitiated', () => {
          console.log('idCheck onStepInitiated ');
        })
        .on('idCheck.onStepCompleted', () => {
          console.log('idCheck onStepCompleted ');
        })
        .on('idCheck.onApplicantLoaded', () => {
          console.log('idCheck onApplicantLoaded  ');
        })
        .on('idCheck.onApplicantSubmitted', () => {
          console.log('onApplicantSubmitted');
          this.axios({
            url: 'sumsub/call_back',
            params: {
              sumsubLevel: this.levelName,
            },
          }).then(({ code, msg }) => {
            if (code.toString() !== '0') {
              this.$bus.$emit('tip', { text: msg, type: 'error' });
            }
          });
        })
        .on('idCheck.onError', (error) => {
          console.log('idCheck onError', error);
        })
        .build();
      snsWebSdkInstance.launch('#sumsub-websdk-container');
    },
    getNewAccessToken() {
      return new Promise((resolve) => {
        this.getAccessToken(resolve);
      });
    },
  },
};
