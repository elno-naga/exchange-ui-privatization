// 时间范围组件
<template>
  <div
      class="date_range_warpper"
      :class="sizeClass"
      :id="elementId"
      ref="dateWarpper"

  >
    <!-- title -->
    <div v-if="showPrompt" class="date_prompt">
      <slot name="promptExtend">{{ promptText }}</slot>
    </div>
    <!-- 展示容器 -->
    <div
        class="date_content fill-3-bg"
        :class="contentClass"
        :style="conentStyle"
        ref="dateContent"
        @mouseover="hover = true"
        @mouseleave="hover = false"
        @click="clickMenu">
      <!-- 输入框 -->
      <div class="input_warper">
        <input
            class="input_line text-1-cl"
            placeholder-class="text-3-cl"
            type="text"
            required
            :readonly="readonly"
            :placeholder="startPlaceholder || $t('components.datePicker.startTime')"
            :disabled="disabled"
            v-model="startTimeStr"
            @click="toggleInput('start')"
        />
        <span v-show="startFocused" class="input_line_focused main-1-bg" />
      </div>

      <span class="text-3-cl line-center">-</span>
      <div class="input_warper">
        <input
            class="input_line text-1-cl"
            placeholder-class="text-3-cl"
            type="text"
            required
            :readonly="readonly"
            :placeholder="endPlaceholder || $t('components.datePicker.endTime')"
            :disabled="disabled"
            v-model="endTimeStr"
            @click="toggleInput('end')"
        />
        <span v-show="endFocused" class="input_line_focused main-1-bg" />
      </div>
      <svg
          v-show="!startTime || !endTime || !visible || !clearable"
          class="time-icon"
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          v-html="getIconPath('timer', 'special-4-cl')"
      ></svg>
      <svg
          v-show="startTime && endTime && visible && clearable"
          class="time-icon"
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          v-html="getIconPath('timerClear', 'special-4-cl')"
          @click.stop="onClear"
      ></svg>
    </div>
    <calendar
        :values="rangeValue"
        :textTop="textTop"
        v-show="visible"
        :rangeTime="rangeTime"
        :buttonText="buttonText"
        @changeRangeTime="changeRangeTime"
        @onSaveTime="onSaveTime"
        ref="calendarRef"
        :disabledDate="disabledDate"
        :limitDays="limitDays"
    >
    </calendar>
  </div>
</template>

<script>
import { colorMap, getIconPath } from '../../../../utils';
import calendar from './Calendar.vue';
import timeUtil from './calendar';

export default {
  name: 'c-dateRangePicker',
  components: {
    calendar,
  },
  props: {
    size: {
      validator(val) {
        return ['lg', 'md', 'sm'].indexOf(val) !== -1;
      },
      default: 'md',
    },
    // 初始化默认 选中的值 String：直接显示，Number： 选项索引值
    name: {
      type: String,
      default: '',
    },
    // Title
    showPrompt: {
      type: Boolean,
      default: true,
    },
    promptText: {
      type: String,
      default: '',
    },
    elementId: {
      type: String,
      default: '',
    },
    values: {
      type: Array,
      default: () => [],
    },
    // 完全只读
    readonly: {
      type: Boolean,
      default: true,
    },
    // 禁用
    disabled: {
      type: Boolean,
      default: false,
    },
    // 清空
    clearable: {
      type: Boolean,
      default: true,
    },
    // 范围选择时开始日期的占位内容
    startPlaceholder: {
      type: String,
      default: '',
    },
    // 范围选择时结束日期的占位内容
    endPlaceholder: {
      type: String,
      default: '',
    },
    // 输入框样式
    styles: {
      type: [Object, String],
      default: '',
    },
    // 输入框宽度
    width: {
      type: String,
      default: '100%',
    },
    // 输入框高度
    height: {
      type: String,
      default: null,
    },
    textTop: {
      type: Array,
      default: () => ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
    },
    rangeTime: { // [{ type: 'week', num: 1 },{ type: 'month', num: 1 }]
      type: Array,
      default: () => [],
    },
    buttonText: {
      type: String,
      default: '',
    },
    // 禁用日期
    disabledDate: Function,
    limitDays: {
      type: Number,
      default: null,
    },
    format: { // timestamp-时间戳 timestr-字符串2000-1-1
      type: String,
      default: 'timestr',
    },
  },
  data() {
    return {
      colorMap,
      getIconPath,
      startTime: '',
      endTime: '',
      startTimeStr: '',
      endTimeStr: '',
      startFocused: false,
      endFocused: false,
      // 控制下拉框是都可见
      visible: false,
      hover: false,
    };
  },
  mounted() {
    this.getTime(this.values);
    window.addEventListener('resize', this.checkTransfer, false);
    document.addEventListener('scroll', this.checkTransfer, true);
    document.addEventListener('click', this.clickOutSide, true);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.checkTransfer, false);
    document.removeEventListener('scroll', this.checkTransfer, true);
    document.removeEventListener('click', this.clickOutSide, true);
    this.visible = false;
  },

  watch: {
    values(data) {
      this.getTime(data);
    },
    visible(v) {
      if (v) {
        this.resetPosition();
        this.checkTransfer();
      }
    },
  },
  computed: {
    conentStyle() {
      const styles = this.styles || {};
      if (this.width) styles.width = this.width;
      if (this.height) styles.height = this.height;
      return styles;
    },
    contentClass() {
      let bgClass = 'fill-3-bg';
      let bdClass = 'fill-3-bd';
      if (this.disabled) {
        bgClass = 'fill-7-bg';
        bdClass = 'fill-7-bd';
      }
      if (this.visible || this.hover) {
        bdClass = 'main-1-bd';
      }
      return `${bgClass} ${bdClass}`;
    },
    sizeClass() {
      return `date_${this.size}_wrapper`;
    },
    matchDom() { // 匹配框，需要相对于body
      return this.$refs.calendarRef.$el;
    },
    matchParent() { // 匹配框父级
      return this.$refs.dateContent;
    },
    rangeValue() {
      return [this.startTime, this.endTime];
    },
  },
  methods: {
    // 点击整个日期组件之外
    clickOutSide(e) {
      // 判断鼠标点击到触发按钮和弹出框外的区域
      if (!(this.matchDom && this.matchDom.contains(e.target)) && !(this.matchParent && this.matchParent.contains(e.target))) {
        this.visible = false;
        this.getTime(this.values);
      }
    },
    checkTransfer() {
      this.$nextTick(() => {
        const { scrollTop, scrollLeft } = document.documentElement;
        const bodyHeight = document.documentElement.clientHeight; // body 可视区域高度
        const matchHeight = this.matchDom.clientHeight; // 匹配DOM的高度
        const rect = this.matchParent.getBoundingClientRect(); // 取出匹配父级DOM的矩形对象
        // getBoundingClientRect.bottom为元素下边与页面上边的距离，所以元素下边与页面下边距离 = 页面高度 - getBoundingClientRect.bottom
        const bottom = bodyHeight - rect.bottom;
        if (bottom >= matchHeight + 4) { // 父级距离页面下边的高度大于等于匹配DOM的高度，则往下展示
          this.matchDom.style.bottom = 'auto';
          this.matchDom.style.top = `${rect.top + scrollTop + rect.height + 4}px`; // 匹配DOM的top = 父级矩形对象top + 父级的高度
        } else { // 父级距离页面下边的高度小玉匹配DOM的高度，则往上展示
          this.matchDom.style.top = 'auto';
          this.matchDom.style.bottom = `${bottom + rect.height + 4 - scrollTop}px`; // 匹配DOM的bottom = 父级矩形对象bottom + 父级的高度
        }
        const bodyWidth = document.documentElement.clientWidth; // body 可视区域高度
        const matchWidth = this.matchDom.clientWidth; // 匹配DOM的高度
        if ((bodyWidth - rect.left + scrollLeft >= matchWidth)) {
          this.matchDom.style.right = 'auto';
          this.matchDom.style.left = `${rect.left + scrollLeft}px`; // 匹配DOM的top = 父级矩形对象top + 父级的高度
        } else {
          this.matchDom.style.right = `${bodyWidth - rect.right - scrollLeft}px`;
          this.matchDom.style.left = 'auto'; // 匹配DOM的top = 父级矩形对象top + 父级的高度
        }
      });
    },
    resetPosition() {
      if (this.matchDom) {
        this.matchDom.style.left = 'auto';
        this.matchDom.style.top = 'auto';
        this.matchDom.style.right = 'auto';
        this.matchDom.style.bottom = 'auto';
      }
    },
    getTime(data) {
      if (data[0]) {
        const { timeStamp: timeStamp1 } = timeUtil.dateFormat(data[0]);
        this.startTime = timeStamp1;
        this.startTimeStr = timeUtil.dateToStr(timeStamp1);
      } else {
        this.startTime = '';
        this.startTimeStr = '';
      }
      if (data[1]) {
        const { timeStamp: timeStamp2 } = timeUtil.dateFormat(data[1]);
        this.endTime = timeStamp2;
        this.endTimeStr = timeUtil.dateToStr(timeStamp2);
      } else {
        this.endTime = '';
        this.endTimeStr = '';
      }
    },
    // 点击整个框
    clickMenu() {
      this.visible = true;
    },
    // 点击单个输入框
    toggleInput(type) {
      if (type === 'start') {
        this.startFocused = false;
      } else {
        this.endFocused = false;
      }
    },

    // 清除输入框
    onClear() {
      this.$emit('onSaveTime', []);
      this.visible = false;
      // this.$refs.calendarRef.onClearData();
    },
    changeRangeTime(values) {
      this.getTime(values);
    },
    onSaveTime(values) {
      this.visible = false;
      const [start, end] = values;
      if (this.format === 'timestr') {
        const startTime = timeUtil.dateToStr(start);
        const endTime = timeUtil.dateToStr(end);
        this.$emit('onSaveTime', [startTime, endTime], this.name);
      } else {
        const startTime = timeUtil.formatStartTime(start);
        const endTime = timeUtil.formatEndTime(end);
        this.$emit('onSaveTime', [startTime, endTime], this.name);
      }
    },
  },
};
</script>

<style scoped lang="stylus">
.date_range_warpper {
  position :relative;
  display: inline-block;
  margin:0 auto;

  &.date_lg_wrapper {
    .date_content {
      height: 44px;
    }
  }
  &.date_md_wrapper {
    .date_content {
      height: 40px;
    }
  }
  &.date_sm_wrapper {
    .date_content {
      height: 32px;
    }
  }

  .date_prompt {
    line-height: 16px;
    font-size: 14px;
    user-select: none;
    margin-bottom: 8px;
  }

  .date_content {
    padding: 0 12px;
    border-radius: 4px;
    box-sizing: border-box;
    font-size: 14px;
    display: flex;
    align-items: center;
    width: 100%;
    border-width: 1px;
    border-style: solid;
    transition: all 0.3s;
    min-width: 230px;

    .input_warper{
      position: relative;
      flex: 1;
      display: flex;
      .input_line{
        font-weight: 500;
        line-height: 16px;
        flex: 1;
        width: 0;
        font-size: 14px;
        text-align:center;
      }
      .input_line::placeholder{
        text-align:center;
      }
      .input_line_focused {
        position:absolute;
        width: 100%;
        height: 2px;
        bottom: -5px;
        left: 0
      }
    }

    .line-center{
      margin: 0 8px;
    }

    .time-icon{
      margin-left: 8px;
      cursor: pointer;
    }
  }

}
</style>
