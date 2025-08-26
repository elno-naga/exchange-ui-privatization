<template>
  <transition name="slideInDown">

    <section class="wh_container special-1-bg" ref="calendarRef">
      <div class="wh_content_all fill-6-bd">
        <!-- 头部的左右标签 -->
        <div class="wh_top_changge_content text-1-cl">
        <span>
          <svg
              @click="PreYear(true)"
              v-html="getIconPath('calendar_double_arrow_left', 'special-4-cl')"
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
          ></svg>
          <svg
              v-html="getIconPath('calendar_arrow_left', 'special-4-cl')"
              @click="PreMonth(true)"
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
          ></svg>
        </span>
          {{ startDateTop }}
          <span>
          <svg
              v-html="getIconPath('calendar_arrow_right', 'special-4-cl')"
              @click="PreMonth(false)"
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
          ></svg>
          <svg
              @click="PreYear(false)"
              v-html="getIconPath('calendar_double_arrow_right', 'special-4-cl')"
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
          ></svg>
        </span>
        </div>
        <!-- 中间周几标记 -->

        <div class="wh_content">
          <div class="wh_content_item text-3-cl" v-for="(tag, index) in textTop" :key="index + 'tag'">
            {{ tag }}
          </div>

          <div class="wh_content">
            <div
                class="wh_content_item"
                v-for="(item, index) in dateList"
                :key="index"
                @click="clickDay(item)"
                :class="`${timeAllClass(item)}`"
                @mouseover="handMouseenter(item, 'start')"
                @mouseout="handMouseleave"
            >
              {{ item.id }}
            </div>
          </div>
        </div>
      </div>

      <c-button
          class="sureBotton"
          marginTop="12px"
          type="solid"
          :disabled="disabled"
          height="32px"
          paddingW="27px"
          @click="onSureButton"
      >
        {{ buttonText || $t('components.dialog.confirmText') }}
      </c-button>
    </section>
  </transition>

</template>
<script>
import timeUtil from './calendar';
import { colorMap, getIconPath } from '../../../../utils';

// const monthArray = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default {
  data() {
    return {
      colorMap,
      dateList: [], // 左边面板数据
      startDateTop: '', // 顶部年月展示
      startDate: null, // 开始时间  格式2021/08/08
      startDateStamp: null, // 选中的开始时间的时间戳 主要用来对比时间
      hoverDate: null, // hover的日期格式2021/08/08
      startYearMonth: '', // 开始面板展示的年月
      disabled: true,
    };
  },
  props: {
    value: {
      type: [Number, String],
      default: '',
    },
    textTop: {
      type: Array,
      default: () => ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
    },
    buttonText: {
      type: String,
      default: '',
    },
    // 禁用日期
    disabledDate: Function,
  },
  watch: {
    value(value) {
      this.initData(value, true);
    },
    startDate(value) {
      if (value) this.disabled = false;
      this.$emit('changeRangeTime', value);
    },
  },
  computed: {
    // 获取日期面板展示颜色
    timeAllClass() {
      return (item) => {
        // 默认字体颜色
        let timeClassColor = 'text-1-cl';
        let timeClassBg = '';
        if (item.otherMonth !== 'nowMonth' || item.disabled) {
          // 如果不是当月 默认都是不可点击状态
          timeClassColor = 'wh_content_item_disabled text-3-cl ';
        } else if (item.date === this.startDate) {
          // 选中状态
          timeClassColor = 'text-4-cl';
          timeClassBg = 'main-1-bg';
        } else if (item.isToday) {
          timeClassColor = 'main-1-cl';
          timeClassBg = 'special-6-bg';
        } else if (item.dayShow && item.otherMonth === 'nowMonth') {
          // 选中的范围且在可点击的月份内
          timeClassBg = 'main-4-bg';
          if (this.hoverDate === item.date) {
            timeClassColor = 'main-1-cl';
          }
        } else if (this.hoverDate === item.date) {
          timeClassColor = 'main-1-cl';
        }

        return `${timeClassColor} ${timeClassBg}`;
      };
    },
    matchDom() { // 匹配框，需要相对于body
      return this.$refs.calendarRef;
    },
  },
  created() {},
  mounted() {
    this.$nextTick(() => {
      const body = document.querySelector('body');
      // 将匹配DOM添加到body中
      if (body.append) { // 在IE11中 document.appendChild会报错
        body.append(this.matchDom);
      } else {
        body.appendChild(this.matchDom);
      }
      this.initData(this.value, true);
    });
  },

  beforeDestroy() {
    document.body.removeChild(this.matchDom);
  },

  methods: {
    getIconPath,
    initData(data, isNeedPanel) {
      this.disabled = !data;
      this.startDate = data || null;
      this.startDateStamp = this.startDate ? this.startDate / 1000 : null;
      // 为了获取第一个面板是哪个月
      const startDate = data ? new Date(data) : new Date();
      this.startYearMonth = startDate;
      this.getList(startDate, isNeedPanel);
    },

    onClearData() {
      this.disabled = true;
      this.startDateStamp = null;
      this.getList(null, false);
    },
    getList(date, isNeedPanel) {
      if (isNeedPanel) {
        this.startDateTop = `${date.getFullYear()}/${date.getMonth() + 1}`;
        this.dateList = timeUtil.getMonthList(date);
        for (let i = 0; i < this.dateList.length; i += 1) {
          if (this.disabledDate && this.disabledDate(this.dateList[i].date)) {
            this.dateList[i].disabled = true;
          }
        }
      }
      if (!isNeedPanel && date) {
        const clickTime = new Date(date).getTime() / 1000;
        this.startDateStamp = clickTime;
        this.startDate = date;
      }
    },

    handMouseenter(item) {
      if (item.otherMonth !== 'nowMonth' || item.disabled) {
        this.hoverDate = null;
      } else {
        this.hoverDate = item.date;
      }
    },
    handMouseleave() {
      this.hoverDate = null;
    },
    clickDay(item) {
      if (item.otherMonth !== 'nowMonth' || item.disabled) return;
      const clickTime = item.date / 1000;
      if (clickTime === this.startDateStamp) return;
      this.startDate = item.date;
    },
    PreMonth(isPre) {
      const startDate = timeUtil.getOtherMonthOrWeek(
        this.startYearMonth,
        isPre ? 'preMonth' : 'nextMonth',
      );
      this.startYearMonth = startDate;
      this.getList(startDate, true);
    },
    PreYear(isPre) {
      const startDate = timeUtil.getOtherYear(this.startYearMonth, isPre ? 'preYear' : 'nextYear');
      this.startYearMonth = startDate;
      this.getList(startDate, true);
    },

    onSureButton() {
      this.$emit('onSaveTime', this.startDate);
    },
  },
};
</script>
<style scoped lang="stylus">
.wh_container {
  width: 380px;
  box-sizing: border-box;
  margin: auto;
  padding: 20px 24px;
  border-radius: 4px;
  box-shadow: 0px 4px 10px 0px rgba(0, 0, 0, 0.1);
  position: absolute;
  left: auto;
  top: auto;
  z-index: 9;
  color: #009;
  /* overflow: hidden; */
  /* box-sizing: border-box; */
}
.wh_content_all {
  width: 100%;
  padding-bottom: 12px;
  border-bottom-width: 1px;
  border-bottom-style: solid;
}

.wh_top_changge_content {
  height: 16px;
  line-height: 16px;
  margin-bottom: 24px;
  display: flex;
  align-content: center;
  justify-content: space-between;
}
.wh_top_changge_content span {
  cursor: pointer;

  svg:first-child {
    margin-right: 4px;
  }
}

.wh_content {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  justify-content: space-between;
}

.wh_content:first-child .wh_content_item {
  font-size: 14px;
  font-weight: 500;
}
.wh_content_item {
  width: 32px;
  height: 32px;
  line-height: 32px;
  margin: auto;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  margin-right: 18px;
  border-radius: 4px;
}
.wh_content_item:nth-child(7n) {
  margin-right: 0px;
}
.wh_content_item_disabled {
  cursor: no-drop;
}
.sureBotton {
  float: right;
}
// 展开动画
.slideInDown-enter-active {
  transition: all 0.3s ease
}

.slideInDown-leave-active {
  transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1)
}

.slideInDown-enter, .slideInDown-leave-to {
  transform : translateY(-15px);
  opacity :0
}
</style>
