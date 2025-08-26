<template>
  <div class="v5-common-buttonTab">
    <ul class="c_list_nav" :style="boxStyle">
      <li
        v-for="(item, index) in buttonTab"
        :class="color(item)"
        :key="index"
        :style="[marginStyle, minWidthStyle, paddingWStyle]"
        @click="currentClick(item)"
      >
        <span>
          {{ item.name }}
        </span>
      </li>
    </ul>
  </div>
</template>
<script>
export default {
  name: 'c-buttonTab',
  data() {
    return {
      parentRect: {},
      activeLineStyle: {},
      activeLineWidth: 0,
    };
  },
  props: {
    name: {
      type: String,
      default: '',
    },
    // 当前选中状态
    currentTab: {
      default: 0,
      type: [Number, String],
    },
    // tab全部
    buttonTab: {
      default: () => [],
      type: Array,
    },
    // 整体高度
    lineHeight: {
      default: '32',
      type: [Number, String],
    },
    // 距离右边的距离
    marginRight: {
      default: '12',
      type: [Number, String],
    },
    // 左右padding
    paddingW: {
      default: '0 19px',
      type: String,
    },
    // 传入原始颜色class
    className: {
      default: '',
      type: String,
    },
    // 传人active颜色class
    activeClassName: {
      default: '',
      type: String,
    },
    // 选中条颜色
    activeColor: {
      default: '',
      type: String,
    },
    // 子元素是否设置最小宽度
    minWidth: {
      default: 'auto',
      type: String,
    },
  },
  computed: {
    // 整体高度
    boxStyle() {
      return {
        'line-height': `${this.lineHeight}px`,
      };
    },
    marginStyle() {
      return {
        'margin-right': `${this.marginRight}px`,
      };
    },
    minWidthStyle() {
      return {
        'min-width': this.minWidth,
      };
    },
    paddingWStyle() {
      return {
        padding: this.paddingW,
      };
    },
  },
  watch: {},
  mounted() {},
  methods: {
    // 输出颜色
    color(item) {
      if (item.key === this.currentTab) {
        return this.activeClassName;
      }
      return this.className;
    },
    // 点击切换
    currentClick(item) {
      this.$emit('currentType', item);
    },
  },
  created() {},
};
</script>
<style lang='stylus'>
.v5-common-buttonTab {
  position: relative;
  font-family: HarmonyOS-Medium;

  .c_list_nav {
    box-sizing: border-box;
    user-select: none;
    display: flex;
    float: none;

    li {
      cursor: pointer;
      position: relative;
      text-align: center;
      border-radius: 4px;

      span {
        font-size: 14px;
        letter-spacing: 0;
        text-align: left;
        line-height: 16px;
      }

      &:last-child {
        margin-right: 0;
      }
    }
  }
}

@media (max-width: 600px) {
  .v5-common-buttonTab {
    overflow-x: scroll;

    .c_list_nav {
      white-space: nowrap;
      display: flex;
    }
  }
}
</style>
