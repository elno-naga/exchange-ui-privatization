<template>
  <div class='common-pagination' :class='classes' :style="paddingStyle">
    <div class='pagination-bar text-2-cl'>
      <template v-if="whiteOpen">
        <span
            class='pagination-btn btn-prev'
            :class="{
            disabled: currentPage === 1,
            'fill-3-bg': hover === 'prev',
          }"
            @click='pagination(-1)'
            @mouseover="handleMouseOver('prev', currentPage === 1)"
            @mouseleave="handleMouseLeave"
        >
          <svg
              v-if="currentPage === 1"
              class="icon icon-12"
              viewBox="0 0 1024 1024"
              v-html="getIconPath('pagination_prev', '#A0A2AA')">
          </svg>
          <svg
              v-else
              class="icon icon-12"
              viewBox="0 0 1024 1024"
              v-html="getIconPath('pagination_prev', '#606266')">
          </svg>
        </span>
        <Pager
            :currentPage="pages"
            :pageCount="totalPage"
            :pagerCount="pagerCount"
            @change="handleCurrentChange"
        />
        <span
            class='pagination-btn btn-next'
            :class="{
            disabled: currentPage === totalPage,
            'fill-3-bg': hover === 'next',
          }"
            @click='pagination(1)'
            @mouseover="handleMouseOver('next', currentPage === totalPage)"
            @mouseleave="handleMouseLeave"
        >
          <svg
              v-if="currentPage === totalPage"
              class="icon icon-12"
              viewBox="0 0 1024 1024"
              v-html="getIconPath('pagination_next', '#A0A2AA')">
          </svg>
          <svg
              v-else
              class="icon icon-12"
              viewBox="0 0 1024 1024"
              v-html="getIconPath('pagination_next', '#606266')">
          </svg>
        </span>
      </template>
      <template v-else>
        <span
            class='pagination-btn btn-prev'
            :class="{
            disabled: currentPage === 1,
            'fill-3-bg': hover === 'prev',
          }"
            @click='pagination(-1)'
            @mouseover="handleMouseOver('prev', currentPage === 1)"
            @mouseleave="handleMouseLeave"
        >
          <svg
              v-if="currentPage === 1"
              class="icon icon-12"
              viewBox="0 0 1024 1024"
              v-html="getIconPath('pagination_prev', 'text-3-cl')">
          </svg>
          <svg
              v-else
              class="icon icon-12"
              viewBox="0 0 1024 1024"
              v-html="getIconPath('pagination_prev', 'text-2-cl')">
          </svg>
        </span>
        <Pager
            :currentPage="pages"
            :pageCount="totalPage"
            :pagerCount="pagerCount"
            @change="handleCurrentChange"
        />
        <span
            class='pagination-btn btn-next'
            :class="{
            disabled: currentPage === totalPage,
            'fill-3-bg': hover === 'next',
          }"
            @click='pagination(1)'
            @mouseover="handleMouseOver('next', currentPage === totalPage)"
            @mouseleave="handleMouseLeave"
        >
          <svg
              v-if="currentPage === totalPage"
              class="icon icon-12"
              viewBox="0 0 1024 1024"
              v-html="getIconPath('pagination_next', 'text-3-cl')">
          </svg>
          <svg
              v-else
              class="icon icon-12"
              viewBox="0 0 1024 1024"
              v-html="getIconPath('pagination_next', 'text-2-cl')">
          </svg>
        </span>
      </template>
    </div>
  </div>
</template>
<script type='es6'>
import { colorMap, getIconPath } from '../../../../utils';
import Pager from './pager.vue';

export default {
  name: 'c-v6-pagination',
  components: {
    Pager,
  },
  data() {
    return {
      colorMap,
      pages: this.currentPage,
      hover: null,
    };
  },
  props: {
    total: { // 数据总条数
      type: Number,
      default: 0,
    },
    display: { // 每页显示条数
      type: Number,
      default: 20,
    },
    currentPage: { // 当前页码
      type: Number,
      default: 1,
    },
    classes: {
      type: String,
    },
    pagerCount: {
      type: Number,
      default: 5,
    },
    whiteOpen: {
      type: Number,
      default: 0,
    },
    paddingTop: {
      type: String,
      default: '24px',
    },
    paddingBottom: {
      type: String,
      default: '20px',
    },
  },
  computed: {
    totalPage() {
      return Math.ceil(parseFloat(this.total) / parseFloat(this.display)); // 总页数
    },
    startNumber() {
      return (parseFloat(this.currentPage) - 1) * parseFloat(this.display) + 1;
    },
    endNumber() {
      const num = parseFloat(this.currentPage) * parseFloat(this.display);
      if (num > this.total) {
        return this.total;
      }
      return num;
    },
    paddingStyle() {
      return {
        paddingTop: this.paddingTop,
        paddingBottom: this.paddingBottom,
      };
    },
  },
  watch: {
    currentPage(val) {
      this.pages = val;
    },
  },
  methods: {
    getIconPath,
    handleMouseOver(item, disabled) {
      if (!disabled) {
        this.hover = item;
      }
    },
    handleMouseLeave() {
      this.hover = null;
    },
    pagination(num) {
      if (num < 1) {
        if (parseFloat(this.currentPage) > 1 && parseFloat(this.pages) > 1) {
          this.pages -= 1;
          this.$emit('pagechange', this.pages);
        }
      } else if (parseFloat(this.currentPage) < parseFloat(this.totalPage)
          && parseFloat(this.pages) < parseFloat(this.totalPage)) {
        this.pages += 1;
        this.$emit('pagechange', this.pages);
      }
    },
    handleCurrentChange(page) {
      this.pages = page;
      this.$emit('pagechange', page);
    },
  },
};
</script>
<style scoped lang='stylus'>
.common-pagination {
  padding: 20px;
  font-family: HarmonyOS-Medium;
}
.pagination-bar {
  user-select: none;
  text-align: right;
  font-size: 12px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  .rotate {
    transform: rotate(180deg);
  }
  .num {
    margin-right: 12px;
  }
  .pagination-btn {
    display: flex;
    cursor: pointer;
    width: 24px;
    height: 24px;
    border-radius: 4px;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    &.btn-prev {
      margin-right: 4px;
    }

    &.btn-next {
      margin-left: 4px;
    }
  }
  .disabled {
    cursor: default;
  }
}
</style>
