import Echart from './echart.vue';

Echart.install = (Vue) => {
  Vue.component(Echart.name, Echart);
};

export default Echart;
