import messageBox from './messageBox.vue';

messageBox.install = (Vue) => {
  Vue.component(messageBox.name, messageBox);
};

export default messageBox;
