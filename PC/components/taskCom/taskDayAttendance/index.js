import dayAttendance from './dayAttendance.vue';

dayAttendance.install = (Vue) => {
  Vue.component(dayAttendance.name, dayAttendance);
};

export default dayAttendance;
