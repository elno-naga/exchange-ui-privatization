import taskCard from './taskCard.vue';

taskCard.install = (Vue) => {
  Vue.component(taskCard.name, taskCard);
};

export default taskCard;
