export default {
  props: {
    branchArr: {
      type: Array,
      default: () => [],
    },
    activeBranch: {
      type: String,
      default: '',
    },
    branchTip: {
      type: String,
      default: '',
    },
    titleClass: {
      type: String,
      default: 'text-2-cl',
    },
  },
  data() {
    return {
      iconHover: false,
      branchHover: null,
    };
  },
  methods: {
    setActiveBranch(v) {
      if (v.code === this.activeBranch) return;
      this.$emit('setActiveBranch', v.code, v.value);
    },
  },
};
