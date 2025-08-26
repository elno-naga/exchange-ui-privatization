import { templateConfig } from '@/utils';
import { getCookie } from '../../../utils/cookie';

export default {
  computed: {
    index_international_open() {
      // 0: 'china',
      // 1: 'international',
      // 2: 'biki',
      // 3: 'momo',
      // 4: 'japanese',
      // 5: 'korea',
      // 6: 'europe',
      // 7: 'bidesk',
      // 8: 'bitWind',
      let templates = this.$store.state.baseData.index_international_open;
      if (templates === 7) {
        templates = 1;
      }
      return templateConfig[templates];
    },
    swiperFlag() {
      return this.$store.state.baseData.swiperFlag;
    },
  },
  beforeCreate() {
    if (process.env.NODE_ENV === 'production') {
      const linkurl = this.$store.state.baseData.publicInfo
        ? this.$store.state.baseData.publicInfo.url : {};
      const lan = getCookie('lan');
      const { origin, protocol } = window.location;
      const arr = origin.split('.');
      const url = `${protocol}//www.${arr[arr.length - 2]}.${arr[arr.length - 1]}/${lan}`;
      window.location.href = linkurl.exUrl ? `${linkurl.exUrl}/${lan}/` : url;
    }
  },
};
