import dialog from './dialog.vue';

dialog.install = (Vue) => {
  Vue.component(dialog.name, dialog);
};

export default dialog;
