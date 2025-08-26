<template>
  <ul
      @click="onPagerClick"
      class="pagenation-pager">
    <li
        :class="{
        'fill-3-bg text-1-cl': currentPage === 1,
        'fill-3-bg': pagerHover === 1,
      }"
        v-if="pageCount > 0"
        class="pager-number"
        @mouseover="pagerHover = 1"
        @mouseleave="pagerHover = null">1</li>
    <li
        class="pager-number more"
        v-if="showPrevMore"
    >...</li>
    <li
        v-for="pager in pagers"
        :key="pager"
        :class="{
        'fill-3-bg text-1-cl': currentPage === pager,
        'fill-3-bg': pagerHover === pager,
      }"
        class="pager-number"
        @mouseover="pagerHover = pager"
        @mouseleave="pagerHover = null"
    >
      {{ pager }}
    </li>
    <li
        class="pager-number more"
        v-if="showNextMore"
    >...</li>
    <li
        :class="{
        'fill-3-bg text-1-cl': currentPage === pageCount,
        'fill-3-bg': pagerHover === pageCount,
      }"
        class="pager-number"
        v-if="pageCount > 1"
        @mouseover="pagerHover = pageCount"
        @mouseleave="pagerHover = null"
    >
      {{ pageCount }}
    </li>
  </ul>
</template>

<script type="text/babel">
export default {
  name: 'Pager',

  props: {
    currentPage: Number,

    pageCount: Number,

    pagerCount: Number,

  },

  data() {
    return {
      current: null,
      showPrevMore: false,
      showNextMore: false,
      pagerHover: null,
    };
  },

  computed: {
    pagers() {
      const { pagerCount } = this;
      const halfPagerCount = (pagerCount - 1) / 2;

      const currentPage = Number(this.currentPage);
      const pageCount = Number(this.pageCount);

      let showPrevMore = false;
      let showNextMore = false;

      if (pageCount > pagerCount) {
        if (currentPage > pagerCount - halfPagerCount) {
          showPrevMore = true;
        }

        if (currentPage < pageCount - halfPagerCount) {
          showNextMore = true;
        }
      }

      const array = [];

      if (showPrevMore && !showNextMore) {
        const startPage = pageCount - (pagerCount - 2);
        for (let i = startPage; i < pageCount; i += 1) {
          array.push(i);
        }
      } else if (!showPrevMore && showNextMore) {
        for (let i = 2; i < pagerCount; i += 1) {
          array.push(i);
        }
      } else if (showPrevMore && showNextMore) {
        const offset = Math.floor(pagerCount / 2) - 1;
        for (let i = currentPage - offset; i <= currentPage + offset; i += 1) {
          array.push(i);
        }
      } else {
        for (let i = 2; i < pageCount; i += 1) {
          array.push(i);
        }
      }

      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      this.showPrevMore = showPrevMore;
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      this.showNextMore = showNextMore;

      return array;
    },
  },

  methods: {
    onPagerClick(event) {
      const { target } = event;
      if (target.tagName === 'UL') {
        return;
      }

      let newPage = Number(event.target.textContent);
      const { pageCount } = this;
      const { currentPage } = this;

      if (target.className.indexOf('more') !== -1) {
        return;
      }

      if (Number(newPage)) {
        if (newPage < 1) {
          newPage = 1;
        }

        if (newPage > pageCount) {
          newPage = pageCount;
        }
      }

      if (newPage !== currentPage) {
        this.$emit('change', newPage);
      }
    },
  },
};
</script>
<style lang="stylus" scoped>
.pagenation-pager {
  display: flex;

  .pager-number {
    min-width: 28px;
    height: 28px;
    border-radius: 4px;
    text-align: center;
    line-height: 28px;
    font-size: 14px;
    cursor: pointer;
    margin: 0 4px;
    padding: 0 4px;

    &.more {
      cursor: default;
    }
  }
}
</style>
