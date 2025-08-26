import {
  myStorage,
} from '@/utils';

export default {
  data() {
    return {
      // 当前市场选项
      marketOption: myStorage.get('homeMarkOption') || 'spot',
      // 当前自选,现货or合约
      marketSelectOpt: myStorage.get('marketSelectOpt') || 'spot',
    };
  },
  mounted() {
    this.$bus.$on('SWITCH-OPTION', (type) => {
      this.marketOption = type;
    });
    this.$bus.$on('SWITCH-MARKET-OPT', (type) => {
      this.marketSelectOpt = type;
    });
  },
};
