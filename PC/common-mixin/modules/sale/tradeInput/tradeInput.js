import { fixD, fixInput } from '@/utils';

export default {
  name: 'tableList',
  components: {
  },
  data() {
    return {
      focusv: false,
      valueData: null,
      isHover: false,
    };
  },
  props: {
    datas: {
      type: Object,
    },
    value: {
      type: [String, Number],
      default: null,
    },
    name: {
      type: String,
      default: null,
    },
    fixValue: {
      type: [String, Number],
    },
    placeText: {
      type: String,
      default: '',
    },
    promptText: {
      type: String,
      default: '',
    },
    showPrompt: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    // 全部币种列表
    coinList() {
      if (this.$store.state.baseData && this.$store.state.baseData.market) {
        return this.$store.state.baseData.market.coinList;
      }
      return null;
    },
    ItemClass() {
      let bg = 'fill-3-bg';
      let bd = 'fill-2-bd';
      if (this.focusv || this.isHover) {
        bd = 'main-1-bd';
      }
      if (this.content && this.content.isError) {
        bd = 'fall-1-bd';
      }
      if (this.content && this.content.disabled) {
        bg = 'fill-5-bg';
        bd = '';
      }
      return [bg, bd];
    },
    content() {
      if (this.datas) {
        return this.datas;
      }
      return {};
    },
  },
  watch: {
    value(val) {
      this.valueData = fixInput(val, this.fixValue);
    },
  },
  methods: {
    init() {
      this.$bus.$on('SYMBOL_CURRENT', () => {
        setTimeout(() => {
          this.valueData = null;
        });
      });
      this.$bus.$on('ECHARTS_DATA', (data) => {
        const nData = JSON.parse(JSON.stringify(data));
        if (this.name === 'formData_1' && !this.valueData
          && !this.focusv) {
          if (nData.asksArr && nData.asksArr.length) {
            const f = nData.asksArr[0];
            if (f) {
              const [d] = f;
              this.valueData = fixD(d, this.fixValue);
              // this.$emit('onChanes', { name: this.name, value: d });
              this.$emit('onChanes', { name: this.name, value: this.valueData });
            }
          }
        }
        if (this.name === 'formData_3' && !this.valueData
          && !this.focusv) {
          if (nData.buysArr && nData.buysArr.length) {
            const i = nData.buysArr.length - 1;
            const f = nData.buysArr[i];
            if (f) {
              const [d] = f;
              this.valueData = fixD(d, this.fixValue);
              // this.$emit('onChanes', { name: this.name, value: d });
              this.$emit('onChanes', { name: this.name, value: this.valueData });
            }
          }
        }
      });
    },
    inputFocus() {
      if (!this.content.disabled) {
        this.focusv = true;
        this.$refs.inputs.focus();
      }
    },
    handle(type) {
      if (type === 'focus') {
        this.focusv = true;
      } else {
        this.focusv = false;
      }
    },
    handleInput(val) {
      const useVal = fixInput(val, this.fixValue);
      const decimal = useVal.toString().split('.')[1];
      if (decimal && decimal.length > this.fixValue) {
        this.valueData = fixD(useVal, this.fixValue);
      } else {
        this.valueData = useVal;
      }
      this.$emit('onChanes', { name: this.name, value: this.valueData, type: 'from' });
    },
    handleMouseEvent(event) {
      if (event === 'over') {
        this.isHover = true;
      }
      if (event === 'out') {
        this.isHover = false;
      }
    },
    handleAll() {
      this.$emit('handleAllClick', {});
    },
  },
};
