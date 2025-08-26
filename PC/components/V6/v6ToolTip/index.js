import ToolTip from './tooltip.vue';

ToolTip.install = (Vue) => {
  Vue.component(ToolTip.name, ToolTip);
};

export default ToolTip;
