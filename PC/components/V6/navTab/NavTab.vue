<template>
  <div class="common-navTab" :class="navTabClass">
    <div
        v-show="showActiveBlock"
        class="active-block"
        :class="blockBg"
        ref="buttonTabBg"
        :style="blockBgStyle"
    ></div>
    <ul
        class="c_list_nav"
        :class="{ 'fill-3-bg': type === 'card', c_list_nav_card: type === 'card' }"
        :id="eleId"
    >
      <li
          v-for="(item, index) in navTab"
          class="c_list_nav_item"
          :style="contentStyle"
          :ref="'tabItem' + item[valueKey]"
          :class="color(item)"
          :key="index"
          @mouseover="hoverIndex = item[valueKey]"
          @mouseleave="hoverIndex = null"
          @click="currentClick(item)"
      >
        <template v-if="type === 'iconBlock' && item.icon">
          <span v-if="item[valueKey] !== currentTab" v-html="item.icon"></span>
          <span v-else v-html="item.activeIcon"></span>
        </template>
        <span>
          {{ item[labelKey] }}
        </span>
      </li>
    </ul>
    <div
        v-show="type == 'line'"
        ref="activeLine"
        class="active-line"
        :class="activeColor"
        :style="activeLineStyle"
    ></div>
  </div>
</template>
<script>
import { colorMap, getIconPath } from '../../../../utils';

export default {
  name: 'c-navTab',
  data() {
    return {
      colorMap,
      parentRect: {},
      activeLineStyle: {},
      activeLineWidth: 0,
      hoverIndex: null,
      eleId: '',
    };
  },
  props: {
    // 类型： line：底部下划线 block:快元素tab、 iconBlock:带icon的block 、card:叶签形式的买入卖出
    type: {
      validator(val) {
        return ['line', 'block', 'iconBlock', 'card'].indexOf(val) !== -1;
      },
      default: 'line',
    },
    // lg 55 md 40
    size: {
      type: String,
      default: 'lg',
    },
    height: {
      type: String,
      default: null,
    },
    id: {
      type: String,
      default: 'navTab_wrap',
    },
    // 当前选中状态 若没有任何选中值为null
    currentTab: {
      default: 0,
      type: [Number, String],
    },
    // tab全部  navTab类型为card类型时 navTab的属性可入background
    navTab: {
      default: () => [],
      type: Array,
    },
    // 距离右边的距离
    marginRight: {
      default: '20',
      type: [Number, String],
    },
    // 传入原始颜色class
    className: {
      default: 'text-2-cl',
      type: String,
    },
    // 传人active颜色class
    activeClassName: {
      default: '',
      type: String,
    },
    disabledClassName: {
      default: 'text-3-cl',
      type: String,
    },
    // 选中条颜色
    activeColor: {
      default: 'main-1-bg',
      type: String,
    },
    // 子元素是否设置最小宽度
    minWidth: {
      default: 'auto',
      type: String,
    },
    labelKey: {
      default: 'name',
      type: String,
    },
    valueKey: {
      default: 'index',
      type: String,
    },
  },
  computed: {
    // 滑动快的样式
    blockBgStyle() {
      return {
        borderRadius: this.size === 'lg' ? '4px' : '2px',
      };
    },
    // 滑动快背景颜色
    blockBg() {
      return this.activeClassName || 'fill-3-bg';
    },
    showActiveBlock() {
      const activeItem = this.navTab.find((item) => item[this.valueKey] === this.currentTab);
      return (this.type === 'block' || this.type === 'card') && activeItem != null;
    },
    // 根据类型获取基础样式
    contentStyle() {
      const { type } = this.$props;
      let marginRight = null;
      if (type === 'line') {
        marginRight = Number(this.marginRight) ? `${this.marginRight}px` : this.marginRight;
      }
      return {
        minWidth: this.minWidth,
        marginRight,
        height: this.height,
      };
    },
    navTabClass() {
      return `common-${this.size}-navTab common-${this.type}-navTab`;
    },
  },
  watch: {
    navTab(v) {
      if (v.length && v[0][this.labelKey]) {
        this.getNodeDetail();
      }
    },
    currentTab(v) {
      if (v !== null && v !== undefined) {
        this.setActiveLine(v);
      }
    },
  },
  mounted() {
    this.setId();

    if (this.navTab.length && this.navTab[0][this.labelKey]) {
      this.getNodeDetail();
    }
  },
  methods: {
    getIconPath,
    setId() {
      let num = window.sessionStorage.getItem('c-navTabId');
      if (num) {
        num = Number(num) + 1;
      } else {
        num = 1;
      }
      window.sessionStorage.setItem('c-navTabId', num);
      this.eleId = this.id + num;
    },

    // 字体颜色和背景色
    color(item) {
      if (item.disabled) {
        return `${this.disabledClassName} disabled`;
      }
      if (item[this.valueKey] === this.currentTab) {
        if (this.type === 'line') {
          return this.activeClassName || 'text-1-cl';
        }
        if (this.type === 'block') {
          // return this.activeClassName || 'fill-3-bg text-1-cl';
          return 'text-1-cl';
        }
        if (this.type === 'iconBlock') {
          return 'main-4-bg main-5-cl';
        }
        if (this.type === 'card') {
          return `${item.bg || 'main-1-bg'} ${item.color || 'text-4-cl'} tabItemIndex`;
        }
      }
      // hover状态
      if (this.hoverIndex === item[this.valueKey] && item[this.valueKey] !== this.currentTab) {
        if (this.type === 'line') {
          return this.activeClassName || 'text-1-cl';
        }
        if (this.type === 'block') {
          return 'text-1-cl';
        }
        if (this.type === 'iconBlock') {
          return 'fill-3-bg main-5-cl';
        }
        if (this.type === 'card') {
          return 'fill-3-bg text-1-cl';
        }
      } else if (this.hoverIndex === item[this.valueKey] && this.type === 'card') {
        return `${item.background || 'fill-3-bg'} text-1-cl`;
      }
      // 默认状态
      if (this.type === 'line') {
        return this.className;
      }
      if (this.type === 'block') {
        return 'text-2-cl';
      }
      if (this.type === 'iconBlock') {
        return 'fill-3-bg text-2-cl';
      }
      if (this.type === 'card') {
        return 'text-2-cl';
      }

      return this.className;
    },
    // 获取元素信息
    getNodeDetail() {
      this.$nextTick(() => {
        // const parentNode = document.querySelector(`#${this.eleId}`);
        // if (!parentNode) return;
        // this.parentRect = parentNode.getBoundingClientRect();
        if (this.$refs.activeLine) {
          this.activeLineWidth = this.$refs.activeLine.offsetWidth;
          this.setActiveLine(this.currentTab);
        }
      });
    },
    setActiveLine(index) {
      if (this.type !== 'line' && !this.showActiveBlock) return;
      const tabItem = this.$refs[`tabItem${index}`];
      if (tabItem && tabItem.length) {
        const parentNode = document.querySelector(`#${this.eleId}`);
        if (!parentNode) return;
        this.parentRect = parentNode.getBoundingClientRect();
        const childRect = tabItem[0].getBoundingClientRect();
        const itemWidth = tabItem[0].offsetWidth;
        // 底部线性动画
        if (this.type === 'line') {
          const left = childRect.left - this.parentRect.left + (itemWidth - this.activeLineWidth) / 2;
          this.activeLineStyle = {
            transform: `translateX(${left}px)`,
          };
        } else {
          // 块的背景色的动画
          const { buttonTabBg } = this.$refs;
          buttonTabBg.style.width = `${itemWidth}px`;
          const left = childRect.left - this.parentRect.left;
          buttonTabBg.style.left = `${left}px`;
        }
      }
    },

    // 点击切换
    currentClick(item) {
      const { disabled } = item;
      if (disabled) return;
      this.setActiveLine(item[this.valueKey]);
      this.$emit('currentType', item);
    },
  },
  created() {
  },
};
</script>
<style lang="stylus">
.common-navTab {
  position: relative;
  font-family: HarmonyOS-Medium;
  font-size: 14px;
  line-height: 16px;

  &.common-line-navTab {
    &.common-lg-navTab {
      .c_list_nav_item {
        font-size: 16px;
        line-height: 19px;
        padding: 20px 0 16px;
      }
    }

    &.common-md-navTab {
      .c_list_nav_item {
        padding: 14px 0;
      }
    }
  }

  &.common-block-navTab, &.common-iconBlock-navTab {
    &.common-lg-navTab {
      .c_list_nav_item {
        height: 32px;
        display: flex;
        align-items: center;
        padding: 0 16px;
        border-radius: 4px;
        margin-right: 12px;
      }
    }

    &.common-md-navTab {
      .c_list_nav_item {
        padding: 0 8px;
        font-size: 12px;
        line-height: 14px;
        height: 22px;
        display: flex;
        align-items: center;
        border-radius: 2px;
        margin-right: 8px;
      }
    }
  }

  &.common-card-navTab {
    .c_list_nav_item {
      width: 50%;
      display: flex;
      align-items: center;
      border-radius: 4px;
      box-sizing: border-box;
      justify-content: center;
    }

    &.common-lg-navTab {
      .c_list_nav_item {
        height: 32px;
        padding: 0 16px;
      }
    }

    &.common-md-navTab {
      .c_list_nav_item {
        height: 22px;
        padding: 0 8px;
        font-size: 12px;
        line-height: 14px;
      }
    }
  }

  .c_list_nav_card {
    width: 100%;
    border-radius: 4px;
  }

  .c_list_nav {
    box-sizing: border-box;
    user-select: none;
    display: flex;

    li {
      cursor: pointer;
      position: relative;
      text-align: center;
      flex-shrink: 0;

      svg {
        margin-right: 4px;
      }

      span {
        letter-spacing: 0;
        text-align: left;
        vertical-align: middle;
        display: inline-block;
      }

      &:last-child {
        margin-right: 0 !important;
      }

      &.disabled {
        cursor: not-allowed;
      }
    }

    .tabItemIndex {
      z-index: 99;
    }
  }

  .active-line {
    width: 24px;
    height: 4px;
    position: absolute;
    bottom: 0;
    left: 0;
    transition: all 0.3s;
  }

  .active-block {
    position: absolute;
    height: 100%;
    top: 0;
    transition: all 0.5s;
  }

}
</style>
