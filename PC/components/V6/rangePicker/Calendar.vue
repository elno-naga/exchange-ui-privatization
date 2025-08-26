<template>
  <transition name="slideInDown"  >
    <section class="wh_container special-1-bg" ref="calendarRef">
      <div class="wh_content_all fill-6-bd">
        <!-- 左边面板 -->
        <div class="wh_content_box">
          <!-- 头部的左右标签 -->
          <div class="wh_top_changge_content text-1-cl">
          <span class="wh_jiantou_warpper">
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
          </div>
          <!-- 中间周几标记 -->

          <div class="wh_content">
            <div
                class="wh_content_item text-3-cl"
                v-for="(tag, index) in textTop"
                :key="index + 'tag'"
            >
              {{ tag }}
            </div>
          </div>

          <div class="wh_content">
            <div
                class="wh_content_item"
                v-for="(item, index) in startList"
                :key="index"
                @click="clickDay(item, 'start')"
                :class="`${timeAllClass(item)}`"
                @mouseover="handMouseenter(item, 'start')"
                @mouseout="handMouseleave"
            >
              {{ item.id }}
            </div>
          </div>
        </div>
        <!-- 右边面板 -->
        <div class="wh_content_box wh_content_box1">
          <!-- 头部的左右标签 -->

          <div class="wh_top_changge_content text-1-cl">
            {{ endDateTop }}
            <span class="wh_jiantou_warpper wh_jiantou_warpper1">
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
            <div
                class="wh_content_item text-3-cl"
                v-for="(tag, index) in textTop"
                :key="index + 'tag'"
            >
              {{ tag }}
            </div>
          </div>

          <div class="wh_content">
            <div
                class="wh_content_item"
                v-for="(item, index) in endList"
                :key="index"
                @click="clickDay(item, 'end')"
                :class="`${timeAllClass(item)}`"
                @mouseover="handMouseenter(item, 'end')"
                @mouseout="handMouseleave"
            >
              {{ item.id }}
            </div>
          </div>
        </div>
      </div>

      <div class="wh_content_bottom">
        <c-navTab
            type="block"
            :currentTab="currentTab"
            marginRight="8"
            :navTab="rangeTimeList"
            activeClassName="special-6-bg text-1-cl"
            @currentType="changeRangeTime"
        />
        <c-button
            type="solid"
            :disabled="disabled"
            height="32px"
            paddingW="27px"
            @click="onSureButton"
        >
          {{ buttonText || $t('components.datePicker.sureButton') }}
        </c-button>
      </div>
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
      startList: [], // 左边面板数据
      endList: [], // 右边面板数据
      startDateTop: '', // 顶部年月展示
      endDateTop: '',
      startDate: null, // 开始时间  格式2021/08/08
      endDate: null, // 结束时间 格式2021/08/08
      startDateStamp: null, // 选中的开始时间的时间戳 主要用来对比时间
      endDateStamp: null, // 选中的结束时间的时间戳
      hoverDate: null, // hover的日期格式2021/08/08
      startYearMonth: '', // 开始面板展示的年月
      endYearMonth: '', // 右边结束面板展示的年月的日期
      currentTab: null, // 当前选中的日期范围
      disabled: true,
    };
  },
  props: {
    values: {
      type: Array,
      default: () => [],
    },
    textTop: {
      type: Array,
      default: () => ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
    },
    rangeTime: {
      type: Array,
      default: () => [
        { type: 'week', num: 1 },
        { type: 'month', num: 1 },
        { type: 'month', num: 3 },
        { type: 'month', num: 6 },
      ],
    },
    buttonText: {
      type: String,
      default: '',
    },
    disabledDate: Function,
    limitDays: {
      type: Number,
      default: null,
    },

  },
  watch: {
    values(value) {
      this.initData(value, true);
    },
    startDate(value) {
      if (value && this.endDate) this.disabled = false;
      this.$emit('changeRangeTime', [
        value || null,
        this.endDate || null,
      ]);
    },
    endDate(value) {
      if (value && this.startDate) this.disabled = false;
      this.$emit('changeRangeTime', [
        this.startDate,
        value,
      ]);
    },
  },
  computed: {
    rangeTimeList() {
      const tabs = this.rangeTime.map((data, index) => {
        const item = data;
        item.index = index;
        if (item.type === 'week') {
          item.name = `${item.num} ${this.$t('components.datePicker.week')}`;
        } else if (item.type === 'month') {
          item.name = `${item.num}  ${this.$t('components.datePicker.month')}`;
        }
        return item;
      });
      return tabs;
    },

    // 获取日期面板展示颜色
    timeAllClass() {
      return (item) => {
        // 默认字体颜色
        let timeClassColor = 'text-1-cl';
        let timeClassBg = '';
        let timeClassStatus = '';
        const nowTime = new Date(item.date).getTime() / 1000;
        if (item.otherMonth !== 'nowMonth' || item.disabled) {
          // 如果不是当月 默认都是不可点击状态
          timeClassColor = 'wh_content_item_disabled text-3-cl ';
        } else if (item.chooseDay) {
          // 选中状态
          timeClassColor = 'text-4-cl';
          timeClassBg = 'main-1-bg';
        } else if (item.isToday) {
          timeClassColor = 'main-1-cl';
          timeClassBg = 'special-6-bg';
          timeClassStatus = 'today-date';
          // if (item.dayShow && item.otherMonth === 'nowMonth') {
          //   timeClassBg = 'main-4-bg';
          // }
        } else if (item.dayShow && item.otherMonth === 'nowMonth') {
          // 选中的范围且在可点击的月份内
          timeClassBg = 'main-4-bg';
          if (this.hoverDate === item.date) {
            timeClassColor = 'main-1-cl';
          }
        } else if (this.hoverDate === item.date) {
          timeClassColor = 'main-1-cl';
        }
        // 开始时间
        if (nowTime === this.startDateStamp) {
          timeClassStatus = 'start-date';
        }
        // 结束时间
        if (nowTime === this.endDateStamp) {
          timeClassStatus = 'end-date';
        }
        if (this.hoverDate) {
          const hoverTime = new Date(this.hoverDate).getTime() / 1000;
          if (
            ((this.startDateStamp
                      && hoverTime < this.startDateStamp
                      && nowTime < this.startDateStamp
                      && nowTime >= hoverTime)
                  || (this.endDateStamp
                      && hoverTime > this.endDateStamp
                      && nowTime > this.endDateStamp
                      && nowTime <= hoverTime))
              && item.otherMonth === 'nowMonth'
          ) {
            timeClassBg = 'special-6-bg';
          }
        }
        return `${timeClassColor} ${timeClassBg} ${timeClassStatus}`;
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

      this.initData(this.values, true);
    });
  },

  beforeDestroy() {
    document.body.removeChild(this.matchDom);
  },

  methods: {
    getIconPath,
    initData(data, isNeedPanel) {
      if (data.length === 2 && data[1]) {
        this.disabled = false;
      } else {
        this.disabled = true;
      }
      this.startDate = data[0] || null;
      this.endDate = data[1] || null;

      // 为了获取第一个面板是哪个月
      const startDate = data[0] ? new Date(data[0]) : new Date();
      const endDate = timeUtil.getOtherMonthOrWeek(startDate, 'nextMonth');

      this.startDateStamp = this.startDate ? this.startDate / 1000 : null;
      this.endDateStamp = this.endDate ? this.endDate / 1000 : null;

      this.startYearMonth = startDate;
      this.endYearMonth = endDate;
      this.getList(startDate, 'start', isNeedPanel);
      this.getList(endDate, 'end', isNeedPanel);
    },

    getList(date, type, isNeedPanel) {
      let arr = [];
      // 获取或者更新面板需要获取面板展示的所有日期
      if (isNeedPanel) {
        if (type === 'start') {
          this.startDateTop = `${date.getFullYear()}/${date.getMonth() + 1}`;
          // this.startDateTop = `${monthArray[date.getMonth()]} ${date.getFullYear()}`;
        } else {
          this.endDateTop = `${date.getFullYear()}/${date.getMonth() + 1}`;

          // this.endDateTop = `${monthArray[date.getMonth()]} ${date.getFullYear()}`;
        }
        arr = timeUtil.getMonthList(date);
      } else if (type === 'start') {
        arr = this.startList;
      } else if (type === 'end') {
        arr = this.endList;
      }

      if (!isNeedPanel && date) {
        const clickTime = new Date(date).getTime() / 1000;
        if (!this.startDateStamp) {
          // 如果两个日期都不存在 先定义第一个日期
          this.startDateStamp = clickTime;
          this.startDate = date;
        } else if (this.startDateStamp > clickTime) {
          // 如果已经存在一个日期 判断哪个是第一个日期
          this.endDateStamp = this.startDateStamp;
          this.endDate = this.startDate;
          this.startDateStamp = clickTime;
          this.startDate = date;
        } else {
          this.endDateStamp = clickTime;
          this.endDate = date;
        }
      }

      for (let i = 0; i < arr.length; i += 1) {
        if (this.startDate && this.limitDays) {
          const limitDaysStamp = 3600 * 24 * Number(this.limitDays);
          const currentStamp = arr[i].date / 1000;
          if ((this.startDateStamp - limitDaysStamp) > currentStamp || currentStamp > (this.startDateStamp + limitDaysStamp)) {
            arr[i].disabled = true;
          } else {
            arr[i].disabled = false;
          }
        }
        if (this.disabledDate && this.disabledDate(arr[i].date)) {
          arr[i].disabled = true;
        }

        const k = arr[i];
        k.chooseDay = false;
        const nowTime = k.date;
        const t = nowTime / 1000;

        // dayShow 是否是在日期选择范围 前提两个选中日期同时存在
        if (this.startDateStamp && this.endDateStamp) {
          k.dayShow = t < this.endDateStamp && t > this.startDateStamp;
        } else if (this.startDateStamp && this.hoverDate) {
          const hoverTime = this.hoverDate / 1000;
          k.dayShow = (t < hoverTime && t > this.startDateStamp)
              || (t > hoverTime && t < this.startDateStamp);
        } else {
          k.dayShow = false;
        }

        // chooseDay 是否是选中的日期
        if (
          (this.startDateStamp && this.startDateStamp === t)
            || (this.endDateStamp && this.endDateStamp === t)
        ) {
          k.chooseDay = true;
        }
      }
      // 需要更新面板
      if (type === 'start') this.startList = arr;
      if (type === 'end') this.endList = arr;
    },

    handMouseenter(item) {
      if (item.otherMonth !== 'nowMonth') {
        this.hoverDate = null;
      } else {
        this.hoverDate = item.date;
      }
    },
    handMouseleave() {
      this.hoverDate = null;
    },
    clickDay(item, type) {
      const clickTime = item.date / 1000;
      if (
        clickTime === this.startDateStamp
          || clickTime === this.endDateStamp
          || item.otherMonth !== 'nowMonth' || item.disabled
      ) { return; }
      // 点击的可选日期
      this.currentTab = null;
      if (this.startDate && this.endDate) {
        this.startDate = null;
        this.startDateStamp = null;
        this.endDate = null;
        this.endDateStamp = null;
      }
      this.getList(item.date, type, false);
      this.getList(null, type === 'end' ? 'start' : 'end', false);
    },
    PreMonth(isPre) {
      if (isPre) {
        this.endList = this.startList;
        this.endDateTop = this.startDateTop;
        const startDate = timeUtil.getOtherMonthOrWeek(this.startYearMonth, 'preMonth');
        this.endYearMonth = this.startYearMonth;
        this.startYearMonth = startDate;
        this.getList(startDate, 'start', true);
      } else {
        this.startList = this.endList;
        this.startDateTop = this.endDateTop;
        const endDate = timeUtil.getOtherMonthOrWeek(this.endYearMonth, 'nextMonth');
        this.startYearMonth = this.endYearMonth;
        this.endYearMonth = endDate;
        this.getList(endDate, 'end', true);
      }
    },
    PreYear(isPre) {
      const startDate = timeUtil.getOtherYear(this.startYearMonth, isPre ? 'preYear' : 'nextYear');
      const endDate = timeUtil.getOtherYear(this.endYearMonth, isPre ? 'preYear' : 'nextYear');
      this.startYearMonth = startDate;
      this.endYearMonth = endDate;
      this.getList(startDate, 'start', true);
      this.getList(endDate, 'end', true);
    },
    // 底部日期范围按钮
    changeRangeTime(item) {
      this.startYearMonth = new Date().getTime();
      this.startDateStamp = this.startYearMonth / 1000;
      this.startDate = this.startYearMonth;
      this.disabled = false;
      this.currentTab = item.index;
      if (item.type === 'month') {
        // 展示的结束日期是哪个月
        this.endDate = timeUtil.getOtherMonthOrWeek(
          this.startYearMonth,
          'nextMonth',
          Number(item.num) || 1,
        );
        this.endDateStamp = new Date(this.endDate).getTime() / 1000;
        // 面板上结束的月
        const endDate = timeUtil.getOtherMonthOrWeek(this.startYearMonth, 'nextMonth', 1);
        this.endYearMonth = endDate;
        this.getList(new Date(), 'start', true);
        this.getList(endDate, 'end', true);
      } else {
        this.endDate = timeUtil.getOtherMonthOrWeek(this.startYearMonth, 'nextWeek');
        this.endDateStamp = new Date(this.endDate).getTime() / 1000;
        // 为了获取面板是哪个月
        const endDate = timeUtil.getOtherMonthOrWeek(this.startYearMonth, 'nextMonth', 1);
        this.endYearMonth = endDate;
        this.getList(new Date(), 'start', true);
        this.getList(endDate, 'end', true);
      }
    },
    onSureButton() {
      this.$emit('onSaveTime', [
        this.startDate,
        this.endDate,
      ]);
    },
  },
};
</script>
<style scoped lang="stylus">
/* 展开动画 */
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
.wh_container {
  width: fit-content;
  margin: auto;
  padding: 20px 24px;
  border-radius: 4px;
  box-shadow: 0px 4px 10px 0px rgba(0, 0, 0, 0.1);
  position: absolute;
  /* top: calc(100% + 4px); */
  left: auto;
  top: auto;
  z-index: 1009;
  /* overflow: hidden; */
  /* box-sizing: border-box; */
}
.wh_content_all {
  width: 100%;
  padding-bottom: 12px;
  display: flex;
  border-bottom-width: 1px;
  border-bottom-style: solid;
}
.wh_content_box {
  width: 224px;
}
.wh_content_box1 {
  margin-left: 40px;
}

.wh_top_changge_content {
  position: relative;
  text-align: center;
  height: 16px;
  line-height: 16px;
  margin-bottom: 24px;
}
.wh_top_changge_content span {
  cursor: pointer;
}
.wh_jiantou_warpper {
  cursor: pointer;
  position: absolute;
  left: 0;
  top: 0;

  svg:first-child {
    margin-right: 4px;
  }
}

.wh_jiantou_warpper1 {
  position: absolute;
  left: auto;
  right: 0;
}

.wh_content {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
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

  &.today-date {
    border-radius: 4px;
  }
  &.start-date {
    border-radius: 4px 0 0 4px;
  }
  &.end-date {
    border-radius: 0 4px 4px 0;
  }
}
.wh_content_item_disabled {
  cursor: no-drop;
}
.wh_content_bottom {
  margin-top: 12px;
  height: 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
