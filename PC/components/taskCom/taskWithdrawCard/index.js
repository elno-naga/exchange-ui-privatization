import withdrawCard from './withdrawCard.vue';

withdrawCard.install = (Vue) => {
  Vue.component(withdrawCard.name, withdrawCard);
};

export default withdrawCard;
