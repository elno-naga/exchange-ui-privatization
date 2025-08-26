import { getCoinShowName, getIconPath } from '@/utils';

export default {
  data() {
    return {
      getIconPath,
      // 推荐币对列表
      recommendList: [],
      recommendDataList: [],
      loadingList: [1, 2, 3, 4],
      isLoding: true,
    };
  },
  computed: {
    // 全部 货币对
    symbolAll() {
      return this.$store.state.baseData.symbolAll;
    },
    // 全部币种列表
    coinList() {
      if (this.$store.state.baseData && this.$store.state.baseData.market) {
        return this.$store.state.baseData.market.coinList;
      }
      return null;
    },
  },
  methods: {
    init() {
      this.$bus.$on('RECOMMEEND_DATA', (data) => {
        this.setData(data);
      });
      this.getRecommendList();
    },
    getRecommendList() {
      if (this.$store.state.baseData && this.$store.state.baseData.market) {
        const { recommendSymbol } = this.$store.state.baseData.market;
        this.recommendList = recommendSymbol || [];
      }
    },
    thousands(num) {
      if (num) {
        const str = num.toString();
        const reg = str.indexOf('.') > -1 ? /(\d)(?=(\d{3})+\.)/g : /(\d)(?=(?:\d{3})+$)/g;
        return str.replace(reg, '$1,');
      }
      return num;
    },
    setData(data) {
      const dataList = [];
      this.recommendList.forEach((item) => {
        const itemData = data[item];
        if (itemData) {
          const showName = getCoinShowName(itemData.name, this.symbolAll);
          let icon = '';
          if (this.coinList && itemData.symbol && itemData.symbol.symbol) {
            icon = this.coinList[itemData.symbol.symbol] ? this.coinList[itemData.symbol.symbol].icon : '';
          }
          dataList.push({
            icon,
            showName,
            latestPrice: this.thousands(itemData.close.data),
            latestSub: this.thousands(itemData.close.price),
            increase: itemData.rose.data,
            icreaseClass: itemData.rose.class,
            volume: this.thousands(itemData.vol),
          });
        }
      });
      this.isLoding = false;
      this.recommendDataList = [...dataList];
    },
    // 去交易
    toTrade(item) {
      this.$router.push(`/trade/${item.showName.replace('/', '_')}`);
    },
  },
};
