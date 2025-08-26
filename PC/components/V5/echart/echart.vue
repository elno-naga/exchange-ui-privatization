<template>
  <div class="echart_box">
    <div :id="id" class="echart_content"></div>
  </div>
</template>

<script>
import { getScript } from '@/utils';

export default {
  name: 'c-echart',
  props: {
    propData: {
      default: () => {},
      type: Object,
    },
    id: { default: '', type: String },
  },
  data() {
    return {
      myChart: null,
    };
  },
  watch: {
    propData() {
      this.init();
    },
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      if (!window.echarts) {
        this.loadingEchart = true;
        getScript(`${process.env.BASE_URL}static/js/echarts.min.js`).then(
          () => {
            this.initEachart();
          },
        );
      } else {
        this.initEachart();
      }
    },
    initEachart() {
      if (this.id) {
        const myChart = window.echarts.init(document.getElementById(this.id));
        this.myChart = myChart;
        if (this.propData && this.propData.series[0].data && this.propData.series[0].data.length) {
          this.myChart.setOption(this.propData);
        }
      }
    },
    setOption(option) {
      if (option) {
        this.myChart.setOption(option);
      } else {
        this.myChart.setOption(this.propData);
      }
    },
    dispatchEvent(params) {
      this.myChart.dispatchAction(params);
    },
  },
};
</script>

<style lang='stylus'>
.echart_box {
  width: 100%;
  height: 100%;
}

.echart_content {
  width: 100%;
  height: 100%;
}
</style>
