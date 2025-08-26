import { getIconPath } from '@/utils';

export default {
  name: 'promotionCode',
  data() {
    return {
      getIconPath,
    };
  },
  methods: {
    init() {},
    closeFn() {
      this.$emit('closeModal');
    },
  },
};
