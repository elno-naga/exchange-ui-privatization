import autocompleteV6 from './autocomplete.vue';

autocompleteV6.install = (Vue) => {
  Vue.component(autocompleteV6.name, autocompleteV6);
};

export default autocompleteV6;
