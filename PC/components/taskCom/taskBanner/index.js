import taskBanner from './taskBanner.vue';

taskBanner.install = (Vue) => {
  Vue.component(taskBanner.name, taskBanner);
};

export default taskBanner;
