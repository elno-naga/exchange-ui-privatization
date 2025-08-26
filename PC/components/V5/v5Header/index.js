import Header from './v5Header.vue';

Header.install = (Vue) => {
  Vue.component(Header.name, Header);
};

export default Header;
