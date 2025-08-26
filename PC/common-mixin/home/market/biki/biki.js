export default {
  methods: {
    lineClassesH(index) {
      if (index === this.hoverIndex) {
        return 'fill-3-bg';
      }
      return 'fill-1-bg';
    },
  },
};
