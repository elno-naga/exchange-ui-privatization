import { imgMap } from '@/utils';
import iosTestFlight from './sourceIcon/iosTestFlight.svg';
import appStore from './sourceIcon/appStore.svg';
import googlePlay from './sourceIcon/googlePlay.svg';
import android from './sourceIcon/android.svg';

export default {
  name: 'appDownload',
  data() {
    return {
      flag: false,
      iconMap: {
        appStore,
        iosTextFlight: iosTestFlight,
        googlePlay,
        android,
        iosIpa: appStore,
      },
    };
  },
  watch: {
    appDownload(v) {
      if (v) { this.flag = true; }
    },
  },
  computed: {
    navList() {
      return [
        {
          url: this.imgs.download_flag_1,
          title: this.$t('appDownLoad.flag')[0].title,
          desc: this.$t('appDownLoad.flag')[0].desc,
        },
        {
          url: this.imgs.download_flag_2,
          title: this.$t('appDownLoad.flag')[1].title,
          desc: this.$t('appDownLoad.flag')[1].desc,
        },
        {
          url: this.imgs.download_flag_3,
          title: this.$t('appDownLoad.flag')[2].title,
          desc: this.$t('appDownLoad.flag')[2].desc,
        },
        {
          url: this.imgs.download_flag_4,
          title: this.$t('appDownLoad.flag')[3].title,
          desc: this.$t('appDownLoad.flag')[3].desc,
        },
      ];
    },
    stepList() {
      const { lan } = this.$store.state.baseData;
      let lang = lan;
      if (lan !== 'zh_CN') {
        lang = 'en_US';
      }
      return [
        {
          url: this.imgs[`download_ios_01_${lang}`],
          step: this.$t('appDownLoad.setUp.step')[0].step,
          title: this.$t('appDownLoad.setUp.step')[0].title,
          desc: this.$t('appDownLoad.setUp.step')[0].desc,
        },
        {
          url: this.imgs[`download_ios_02_${lang}`],
          step: this.$t('appDownLoad.setUp.step')[1].step,
          title: this.$t('appDownLoad.setUp.step')[1].title,
          desc: this.$t('appDownLoad.setUp.step')[1].desc,
        },
        {
          url: this.imgs[`download_ios_03_${lang}`],
          step: this.$t('appDownLoad.setUp.step')[2].step,
          title: this.$t('appDownLoad.setUp.step')[2].title,
          desc: this.$t('appDownLoad.setUp.step')[2].desc,
        },
        {
          url: this.imgs[`download_ios_04_${lang}`],
          step: this.$t('appDownLoad.setUp.step')[3].step,
          title: this.$t('appDownLoad.setUp.step')[3].title,
          desc: this.$t('appDownLoad.setUp.step')[3].desc,
        },
        {
          url: this.imgs[`download_ios_05_${lang}`],
          step: this.$t('appDownLoad.setUp.step')[4].step,
          title: this.$t('appDownLoad.setUp.step')[4].title,
          desc: this.$t('appDownLoad.setUp.step')[4].desc,
        },
      ];
    },
    appDownload() {
      return this.$store.state.baseData.app_download;
    },
    line1List() {
      return this.downloadList.slice(0, 2);
    },
    line2List() {
      return this.downloadList.slice(2);
    },
    downloadList() {
      const data = this.appDownload || {};
      const urlList = [data.ios_download_url, data.ios_test_flight_url, data.google_play_url, data.android_download_url, data.ios_ipa_url].map((item, index) => {
        let content = {};
        if (item) {
          switch (index) {
            case 0: content = { key: 'appStore', title: 'App Store' }; break;
            case 1: content = { key: 'iosTextFlight', title: 'iOS TestFlight' }; break;
            case 2: content = { key: 'googlePlay', title: 'Google Play' }; break;
            case 3: content = { key: 'android', title: 'Android' }; break;
            case 4: content = { key: 'iosIpa', title: 'iOS IPA' }; break;
            default: content = {};
          }
        }
        return content;
      });
      return urlList.filter((item) => !!item.key);
    },
    mainBg() {
      return `background-image: url("${imgMap.appdownload_bg}#0E1A2E"`;
    },
    imgs() {
      return imgMap;
    },
  },
  methods: {
    download(type) {
      let urlName = '';
      switch (type) {
        case 'appStore': urlName = this.appDownload.ios_download_url; break;
        case 'iosTextFlight': urlName = this.appDownload.ios_test_flight_url; break;
        case 'googlePlay': urlName = this.appDownload.google_play_url; break;
        case 'android': urlName = this.appDownload.android_download_url; break;
        case 'iosIpa': urlName = this.appDownload.ios_ipa_url; break;
        default: urlName = ''; break;
      }
      window.open(urlName);
    },
    init() {
      const footer = document.querySelector('#footer-box');
      if (footer) {
        footer.style.marginTop = 0;
      }
      if (this.appDownload) {
        this.flag = true;
      }
    },
  },
};
