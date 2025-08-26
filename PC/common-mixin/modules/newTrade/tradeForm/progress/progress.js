export default {
  props: {
    name: {
      type: String,
      default: 'progress',
    },
    // 颜色class
    bgClass: {
      type: String,
      default: 'rise-1-bg',
    },
    bdClass: {
      type: String,
      default: 'rise-1-bd',
    },
    curPercent: {
      type: Number,
      default: 0,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      percent: 0,
      progressWidth: null,
      postionStart: '',
      isMouseDown: false,
      currentWidth: null,
      progressLeft: 0,
    };
  },
  watch: {
    curPercent(val) {
      if (!Number(val)) {
        this.percent = 0;
      } else if (val < 0) {
        this.percent = 0;
      } else if (val > 100) {
        this.percent = 100;
      } else if (val !== this.percent) {
        this.percent = val;
      }
    },
  },
  destroyed() {
    this.$bus.$off('WINFOW_ON_RESIIZE', () => {
      this.getEleAttr();
    });
  },
  methods: {
    init() {
      this.getEleAttr();
      this.$bus.$on('WINFOW_ON_RESIIZE', () => {
        this.getEleAttr();
      });
    },
    getEleAttr() {
      const $progress = document.querySelector(`.newTrade-progress.progress-${this.name}`);
      this.progressWidth = $progress ? $progress.offsetWidth : 0;
      this.progressLeft = $progress ? $progress.offsetLeft : 0;
    },
    setCurrentPercent(width) {
      let distance = width;
      if (distance <= 0) {
        distance = 0;
      }
      if (distance >= this.progressWidth) {
        distance = this.progressWidth;
      }
      this.percent = ((distance / this.progressWidth).toFixed(2)) * 100;
      this.$emit('change', this.name, this.percent);
    },
    handleMouse(event, type) {
      if (this.disabled || this.readonly) return;
      const { pageX } = event;
      if (type === 'click') {
        this.currentWidth = pageX - this.progressLeft;
        this.setCurrentPercent(this.currentWidth);
      }
      if (type === 'down') {
        this.isMouseDown = true;
        this.currentWidth = this.progressWidth * (this.percent / 100);
        this.postionStart = pageX;
      }
      if (type === 'move' && this.isMouseDown) {
        const distance = pageX - this.postionStart;
        const width = this.currentWidth + distance;
        this.setCurrentPercent(width);
      }
      if (type === 'up' || type === 'out') {
        this.isMouseDown = false;
      }
    },
  },
};
