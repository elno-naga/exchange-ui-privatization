import { fixD, getIconPath, imgMap } from '@/utils';

export default {
  name: 'promotionRanking',
  data() {
    return {
      getIconPath,
      imgMap,
      rankingList: [],
    };
  },
  methods: {
    async init() {
      this.rankingList = await this.getData();
    },
    conFix() {
      let fix = 0;
      if (this.market && this.market.coinList && this.market.coinList.USDT) {
        fix = this.market.coinList.USDT.showPrecision;
      }
      return Number(fix);
    },
    getData() {
      return new Promise((resolve) => {
        this.axios({
          url: 'invitation/rewardRankingList',
          params: {},
          method: 'post',
        }).then((data) => {
          if (data.code.toString() === '0') {
            const fix = this.conFix();
            const list = data.data.list.map((item) => {
              const tempObj = {};
              tempObj.rewardUid = item.rewardUid;
              // 排行榜弹窗保留两位小数;
              tempObj.totalRewardAmount = Number(fixD(
                item.totalRewardAmount,
                fix,
              ));
              return tempObj;
            });
            resolve(list);
          }
        });
      });
    },
    closeFn() {
      this.$emit('closeModal');
    },
  },
  computed: {
    // market 接口
    market() {
      return this.$store.state.baseData.market;
    },
  },
};
