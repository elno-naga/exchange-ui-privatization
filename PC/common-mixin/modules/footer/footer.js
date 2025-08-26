import {
  getCookie,
} from '@/utils';

export default {
  name: 'foot',
  data() {
    return {
      sideList: [],
    };
  },
  computed: {
    linkurl() {
      if (this.$store.state.baseData.publicInfo) {
        return this.$store.state.baseData.publicInfo.url;
      }
      return {};
    },
    currentYear() {
      return new Date().getFullYear();
    },
    templateLayoutType() {
      return this.$store.state.baseData.templateLayoutType;
    },
    footerTemplateReceived() {
      return this.$store.state.baseData.footerTemplateReceived;
    },
    footerTemplate() {
      return this.$store.state.baseData.footerTemplate;
    },
    publicInfo() {
      return this.$store.state.baseData.publicInfo;
    },
    configFooterOpen() {
      if (this.publicInfo && this.publicInfo.switch) {
        return this.publicInfo.switch.config_footer_open;
      }
      return '0';
    },
    companyName() {
      if (this.publicInfo && this.publicInfo.msg) {
        return this.publicInfo.msg.company_name;
      }
      return '';
    },
    logoUrl() {
      let url = '';
      const userSkin = getCookie('cusSkin') || getCookie('defSkin'); // 用户选择的skin
      const isDark = userSkin.toString() === '1';
      if (this.publicInfo && this.publicInfo.msg) {
        const footerImg = isDark ? (this.publicInfo.msg.footer_logo_path_dark || this.publicInfo.msg.footer_logo_path) : this.publicInfo.msg.footer_logo_path;
        const logoImg = isDark ? (this.publicInfo.msg.logoUrl_dark || this.publicInfo.msg.logoUrl) : this.publicInfo.msg.logoUrl;
        url = footerImg || logoImg;
      }
      return url;
    },
  },
  methods: {
    goPage(fileName) {
      this.$router.push(`${fileName}`);
    },
    getData() {
      this.axios({
        url: this.$store.state.url.common.footer,
        headers: {},
        params: {},
        method: 'post',
      }).then((data) => {
        if (data.code === '0') {
          this.sideList = data.data;
        }
      });
    },
    jump(jumpPath) {
      if (window.HOSTAPI === 'co') {
        window.location.href = this.linkurl.exUrl ? `${this.linkurl.exUrl}${jumpPath}` : jumpPath;
      } else {
        this.$router.push(jumpPath);
      }
    },
  },
};
