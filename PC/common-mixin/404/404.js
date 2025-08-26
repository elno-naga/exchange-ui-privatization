import { imgMap } from '@/utils';

export default {
  name: '404',
  data() {
    return {
    };
  },
  computed: {
    imgUrl() {
      return imgMap.img404;
    },
    linkurl() {
      if (this.$store.state.baseData.publicInfo) {
        return this.$store.state.baseData.publicInfo.url;
      }
      return {};
    },
    headerLink() {
      if (process.env.NODE_ENV === 'development') {
        return {
          home: '/ex/',
        };
      }
      if (this.$store.state.baseData && this.$store.state.baseData.publicInfo) {
        return {
          home: this.linkurl.exUrl ? `${this.linkurl.exUrl}` : '',
        };
      }
      return '';
    },
  },
  props: {
  },
  methods: {
    init() {
    },
    gotoHomePage() {
      if (this.headerLink.home.indexOf('http') > -1) {
        window.location.href = this.headerLink.home;
      } else {
        this.$router.push(this.headerLink.home);
      }
    },
  },
};
