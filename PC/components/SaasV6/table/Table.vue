<template>
  <section class="common-table" :class="tableClass" ref="commonTable">
    <div :class="['common-table-content', bgClass]" :style="classBoxStyle">
      <vue-scroll :ops="xScrollOps">
        <div :class="['table-scroll-wrap', classBox]">
          <!-- 展示容器 -->
          <div class="text-3-cl" :class="['table-head', headClasses]">
            <table>
              <thead>
                <div class="tr">
                  <div
                    class="th"
                    v-for="item in columns"
                    :key="item.key"
                    :class="[
                      item.classes,
                      { 'is-hidden': setIsHidden(item) },
                    ]"
                    :style="cellStyleTh(item)"
                  >
                    <div
                      :class="{ isSorte: item.sortable }"
                      @click="
                        sortChange(item.key, item.sortable, item.isDefalutSort)
                      "
                    >
                      <slot :name="'th_' + item.key" :row="item">
                        {{ item.title }}
                      </slot>
                      <template v-if="item.sortable">
                        <svg
                          v-if="sorteKey === item.key && sortType === 'up'"
                          class="icon icon-10"
                          v-html="
                            getIconPath('table_sort', [
                              'text-1-cl',
                              'text-3-cl',
                            ])
                          "
                          viewBox="0 0 1024 1024"
                        ></svg>
                        <svg
                          v-else-if="
                            sorteKey === item.key && sortType === 'down'
                          "
                          class="icon icon-10"
                          v-html="
                            getIconPath('table_sort', [
                              'text-3-cl',
                              'text-1-cl',
                            ])
                          "
                          viewBox="0 0 1024 1024"
                        ></svg>
                        <svg
                          v-else
                          class="icon icon-10"
                          v-html="
                            getIconPath('table_sort', [
                              'text-3-cl',
                              'text-3-cl',
                            ])
                          "
                          viewBox="0 0 1024 1024"
                        ></svg>
                      </template>
                    </div>
                  </div>
                </div>
              </thead>
            </table>
          </div>
          <vue-scroll @handle-scroll="tableBodyScroll" ref="bodyScroll">
            <div
              class="table-body text-1-cl"
              :class="bodyClasses"
              :style="tableBodyHeight"
            >
              <div class="table-body-bar text-1-cl">
                <table v-if="tableDataList && tableDataList.length">
                  <tbody>
                    <template v-for="(item, index) in tableDataList">
                      <div
                        :key="index"
                        class="tr-bg"
                        :class="lineClasses"
                        @mouseover="lineHover = index"
                        @mouseout="lineHover = null"
                        @click="lineClick(item, index)"
                      >
                        <div class="tr-content">
                          <div
                            class="tr"
                            :class="[
                              lineClassesH(index),
                              {
                                'fill-6-bd': border,
                              },
                            ]"
                            :style="{ minHeight: cellHeight + 'px' }"
                          >
                            <div
                              class="td"
                              :class="{ 'is-hidden': setIsHidden(m) }"
                              v-for="(m, n) in columns"
                              :style="cellStyleTh(m)"
                              :key="m.key + n"
                            >
                              <c-skeleton v-if="loading" maxWidth="80px" display="inline-block"></c-skeleton>
                              <slot v-else :name="m.key" :row="item">
                                {{ item[m.key] }}
                              </slot>
                            </div>
                          </div>
                          <div
                            v-if="subFlag && !loading"
                            v-show="subContentId === item.id"
                            class="sub-table fill-3-bg"
                            @click.stop
                          >
                            <slot name="subContent" :row="item">
                              <div class="sub-table-wrap">
                                <div class="sub-table-head">
                                  <div class="sub-tr">
                                    <div
                                      class="sub-th text-2-cl"
                                      v-for="item in subColumns"
                                      :key="item.key"
                                      :class="item.classes"
                                      :style="cellStyleTh(item)"
                                    >
                                      {{ item.title }}
                                    </div>
                                  </div>
                                </div>
                                <div
                                  v-if="subContent && subContent.length"
                                  class="sub-table-body"
                                >
                                  <div
                                    class="sub-tr"
                                    v-for="(subItem, subIndex) in subContent"
                                    :key="'sub' + subIndex"
                                  >
                                    <div
                                      class="sub-td"
                                      v-for="(subM, subN) in subColumns"
                                      :style="cellStyleTh(subM)"
                                      :key="subM.key + subN"
                                    >
                                      <c-skeleton  v-if="subLoading" maxWidth="80px" display="inline-block"></c-skeleton>
                                      <slot
                                        v-else
                                        :name="'sub_' + subM.key"
                                        :row="subItem"
                                      >
                                        {{ subItem[subM.key] }}
                                      </slot>
                                    </div>
                                  </div>
                                </div>
                                <div v-else class="sub-no-data text-2-cl">
                                  <img
                                    class="no_data_img"
                                    :src="imgMap.search_no_data"
                                    alt=""
                                  />
                                  <p>
                                    <!-- 暂无数据 -->
                                    {{ $t("common.notData") }}
                                  </p>
                                </div>
                              </div>
                            </slot>
                          </div>
                        </div>
                      </div>
                    </template>
                  </tbody>
                </table>
                <div
                  v-else
                  class="no-data text-2-cl"
                  :style="{ height: emptyHeight }"
                >
                  <slot name="empty">
                    <img
                      class="no_data_img"
                      :src="imgMap.search_no_data"
                      alt=""
                    />
                    <p>
                      <!-- 暂无数据 -->
                      {{ $t("common.notData") }}
                    </p>
                  </slot>
                </div>
              </div>
            </div>
          </vue-scroll>
        </div>
      </vue-scroll>
    </div>
    <div
      v-if="hasPrefix"
      :class="['common-table-content', 'table-prefix-shadow', 'is-fixed', 'is-prefixed', bgClass]"
      :style="prefixBoxStyle"
    >
      <div :class="['table-scroll-wrap', classBox]">
        <!-- 展示容器 -->
        <div class="text-3-cl" :class="['table-head', headClasses]">
          <table>
            <thead>
              <div class="tr">
                <div
                  class="th"
                  v-for="item in columns"
                  :key="item.key"
                  :class="[item.classes, { 'is-hidden': !item.prefixed }]"
                  :style="cellStyleTh(item)"
                >
                  <div
                    :class="{ isSorte: item.sortable }"
                    @click="
                      sortChange(item.key, item.sortable, item.isDefalutSort)
                    "
                  >
                    <slot :name="'th_' + item.key" :row="item">
                      {{ item.title }}
                    </slot>
                    <template v-if="item.sortable">
                      <svg
                        v-if="sorteKey === item.key && sortType === 'up'"
                        class="icon icon-10"
                        v-html="
                          getIconPath('table_sort', [
                            'text-1-cl',
                            'text-3-cl',
                          ])
                        "
                        viewBox="0 0 1024 1024"
                      ></svg>
                      <svg
                        v-else-if="
                          sorteKey === item.key && sortType === 'down'
                        "
                        class="icon icon-10"
                        v-html="
                          getIconPath('table_sort', [
                            'text-3-cl',
                            'text-1-cl',
                          ])
                        "
                        viewBox="0 0 1024 1024"
                      ></svg>
                      <svg
                        v-else
                        class="icon icon-10"
                        v-html="
                          getIconPath('table_sort', [
                            'text-3-cl',
                            'text-3-cl',
                          ])
                        "
                        viewBox="0 0 1024 1024"
                      ></svg>
                    </template>
                  </div>
                </div>
              </div>
            </thead>
          </table>
        </div>
        <vue-scroll @handle-scroll="tableBodyScroll" ref="prefixScroll">
          <div
            class="table-body text-1-cl"
            :class="bodyClasses"
            :style="tableBodyHeight"
          >
            <div class="table-body-bar text-1-cl">
              <table v-if="tableDataList && tableDataList.length">
                <tbody>
                  <template v-for="(item, index) in tableDataList">
                    <div
                      :key="index"
                      class="tr-bg"
                      :class="lineClasses"
                      @mouseover="lineHover = index"
                      @mouseout="lineHover = null"
                      @click="lineClick(item, index)"
                    >
                      <div class="tr-content fill-6-bd">
                        <div
                          class="tr"
                          :class="[
                            lineClassesH(index),
                            {
                              'fill-6-bd': border,
                            },
                          ]"
                          :style="{ minHeight: cellHeight + 'px' }"
                        >
                          <div
                            class="td"
                            :class="{ 'is-hidden': !m.prefixed }"
                            v-for="(m, n) in columns"
                            :style="cellStyleTh(m)"
                            :key="m.key + n"
                          >
                            <c-skeleton v-if="loading" maxWidth="80px" display="inline-block"></c-skeleton>
                            <slot v-else :name="m.key" :row="item">
                              {{ item[m.key] }}
                            </slot>
                          </div>
                        </div>
                      </div>
                    </div>
                  </template>
                </tbody>
              </table>
            </div>
          </div>
        </vue-scroll>
      </div>
    </div>
    <div
      v-if="hasSuffix"
      :class="['common-table-content', 'table-suffix-shadow', 'is-fixed', 'is-suffixed', bgClass]"
      :style="suffixBoxStyle"
    >
      <div :class="['table-scroll-wrap', classBox]">
        <!-- 展示容器 -->
        <div class="text-3-cl" :class="['table-head', headClasses]">
          <table>
            <thead>
              <div class="tr">
                <div
                  class="th"
                  v-for="item in columns"
                  :key="item.key"
                  :class="[item.classes, { 'is-hidden': !item.suffixed }]"
                  :style="cellStyleTh(item)"
                >
                  <div
                    :class="{ isSorte: item.sortable }"
                    @click="
                      sortChange(item.key, item.sortable, item.isDefalutSort)
                    "
                  >
                    <slot :name="'th_' + item.key" :row="item">
                      {{ item.title }}
                    </slot>
                    <template v-if="item.sortable">
                      <svg
                        v-if="sorteKey === item.key && sortType === 'up'"
                        class="icon icon-10"
                        v-html="
                          getIconPath('table_sort', [
                            'text-1-cl',
                            'text-3-cl',
                          ])
                        "
                        viewBox="0 0 1024 1024"
                      ></svg>
                      <svg
                        v-else-if="
                          sorteKey === item.key && sortType === 'down'
                        "
                        class="icon icon-10"
                        v-html="
                          getIconPath('table_sort', [
                            'text-3-cl',
                            'text-1-cl',
                          ])
                        "
                        viewBox="0 0 1024 1024"
                      ></svg>
                      <svg
                        v-else
                        class="icon icon-10"
                        v-html="
                          getIconPath('table_sort', [
                            'text-3-cl',
                            'text-3-cl',
                          ])
                        "
                        viewBox="0 0 1024 1024"
                      ></svg>
                    </template>
                  </div>
                </div>
              </div>
            </thead>
          </table>
        </div>
        <vue-scroll @handle-scroll="tableBodyScroll" ref="suffixScroll">
          <div
            class="table-body text-1-cl"
            :class="bodyClasses"
            ref="suffixBody"
            :style="tableBodyHeight"
          >
            <div class="table-body-bar text-1-cl">
              <table v-if="tableDataList && tableDataList.length">
                <tbody>
                  <template v-for="(item, index) in tableDataList">
                    <div
                      :key="index"
                      class="tr-bg"
                      :class="lineClasses"
                      @mouseover="lineHover = index"
                      @mouseout="lineHover = null"
                      @click="lineClick(item, index)"
                    >
                      <div class="tr-content fill-6-bd">
                        <div
                          class="tr"
                          :class="[
                            lineClassesH(index),
                            {
                              'fill-6-bd': border,
                            },
                          ]"
                          :style="{ minHeight: cellHeight + 'px' }"
                        >
                          <div
                            class="td"
                            :class="{ 'is-hidden': !m.suffixed }"
                            v-for="(m, n) in columns"
                            :style="cellStyleTh(m)"
                            :key="m.key + n"
                          >
                            <c-skeleton v-if="loading" maxWidth="80px" display="inline-block"></c-skeleton>
                            <slot v-else :name="m.key" :row="item">
                              {{ item[m.key] }}
                            </slot>
                          </div>
                        </div>
                      </div>
                    </div>
                  </template>
                </tbody>
              </table>
            </div>
          </div>
        </vue-scroll>
      </div>
    </div>
  </section>
</template>

<script>
import { colorMap, getIconPath, imgMap } from '@/utils';

export default {
  name: 'c-saasV6-table',
  props: {
    size: {
      type: String,
      default: 'medium',
    },
    loading: {
      type: Boolean,
      default: false,
    },
    // 表头数据列表
    columns: {
      type: Array,
      default: () => [],
    },
    // 表格数据列表
    dataList: {
      type: Array,
      default: () => [],
    },
    border: {
      type: Boolean,
      default: true,
    },
    // 背景
    background: {
      type: Boolean,
      default: true,
    },
    // 整个表格根元素的class
    classes: {
      type: [String, Array],
      default: () => [],
    },
    // 表头class
    headClasses: {
      type: String,
      default: '',
    },
    // 表内容class
    bodyClasses: {
      type: String,
      default: '',
    },
    // 表格每一行class
    lineClasses: {
      type: String,
      default: '',
    },
    // 表格每一行的hover class
    lineClassesHover: {
      type: String,
      default: 'fill-4-bg',
    },
    // 表格body高度
    bodyHeight: {
      type: [Number, String],
      default: null,
    },
    // 表格每一行的高度
    cellHeight: {
      type: [Number, String],
      default: 64,
    },
    subFlag: {
      type: Boolean,
      default: false,
    },
    // 展开数据
    subContent: {
      type: Array,
      default: () => [],
    },
    // sub 表头
    subColumns: {
      type: Array,
      default: () => [],
    },
    // sub 表的自定义class
    subClass: {
      type: String,
      default: '',
    },
    subContentId: {
      type: [Number, String],
    },
    subLoading: {
      type: Boolean,
      default: false,
    },
    // 默认排序字段倒序高亮
    defaultSort: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      imgMap,
      colorMap,
      getIconPath,
      // 是否排序
      isSorte: false,
      // 排序 使用的Key
      sorteKey: '',
      // 排序方向
      sortType: '',
      // 是否使用默认排序
      isDefalutSort: false,
      // 滚动条配置
      ops: {
        rail: {
          gutterOfSide: '0px',
        },
      },
      xScrollOps: {
        bar: {
          keepShow: false,
          onlyShowBarOnScroll: true,
        },
        rail: {
          opacity: 0,
        },
      },
      lineHover: null, // 划过行
      prefixed: null,
      suffixed: null,
      hasPrefix: false,
      hasSuffix: false,
      prefixTableWidth: 0,
      suffixTableWidth: 0,
      columnWidth: 0,
      scrollTop: 0,
    };
  },
  computed: {
    tableClass() {
      const sizeClass = `common-table-${this.size}`;
      let borderClass = '';
      if (!this.border) {
        borderClass = 'common-noBorder-table';
      }
      return `${sizeClass} ${borderClass}`;
    },
    bgClass() {
      if (this.background) return 'fill-2-bg';
      return '';
    },
    classBoxStyle() {
      // const max = window.matchMedia('(max-width:960px)');
      let str = 'width: 100%;';
      // if (max.matches) {
      str += `min-width: ${this.h5Width}`;
      // }
      return str;
    },
    prefixBoxStyle() {
      return {
        width: this.prefixTableWidth,
      };
    },
    suffixBoxStyle() {
      return {
        width: this.suffixTableWidth,
      };
    },
    // 表格 根目录 class
    classBox() {
      const cls = this.isType(this.classes) === 'Array'
        ? [...this.classes]
        : this.classes;
      return cls;
    },
    // 表格 数据列表 设置排序
    tableDataList() {
      let list = [];
      if (this.loading) {
        list = new Array(4);
      } else if (!this.dataList || !this.dataList.length) {
        list = [];
      } else if (this.isSorte && this.sortType && this.isDefalutSort) {
        list = this.sortType === 'up'
          ? this.quickSort(this.dataList)
          : this.quickSort(this.dataList).reverse();
      } else {
        list = [...this.dataList];
      }
      return list;
    },
    // 表格内容 高度 超出高度 出现滚动条
    tableBodyHeight() {
      if (this.bodyHeight) {
        return { height: `${this.bodyHeight}px` };
      }
      return null;
    },
    emptyHeight() {
      return `${this.cellHeight * 4 + 4}px`;
    },
  },
  watch: {
    columns() {
      this.getFixedItem();
    },
  },
  mounted() {
    if (this.defaultSort) {
      this.sorteKey = this.defaultSort;
      this.sortType = 'down';
    } else {
      this.sorteKey = '';
      this.sortType = '';
    }
    this.$bus.$on('WINFOW_ON_RESIIZE', () => {
      this.setFixed();
    });
    if (this.columns.length) {
      this.getFixedItem();
    }
  },
  destroyed() {
    this.$bus.$off('WINFOW_ON_RESIIZE');
  },
  methods: {
    getFixedItem() {
      this.columnWidth = this.columns.reduce((pre, cur) => pre + parseFloat(cur.minWidth || cur.width), 0);
      this.prefixed = this.columns.find((item) => item.prefixed);
      this.suffixed = this.columns.find((item) => item.suffixed);
      this.setFixed();
    },
    setFixed() {
      this.$nextTick(() => {
        const tableWidth = this.$refs.commonTable.offsetWidth;
        if (this.prefixed) {
          this.prefixTableWidth = this.prefixed.minWidth || this.prefixed.width;
          this.hasPrefix = tableWidth < this.columnWidth;
        } else {
          this.hasPrefix = false;
        }
        if (this.suffixed) {
          this.suffixTableWidth = this.suffixed.minWidth || this.suffixed.width;
          this.hasSuffix = tableWidth < this.columnWidth;
        } else {
          this.hasSuffix = false;
        }
      });
    },
    setIsHidden(item) {
      return (item.prefixed && this.hasPrefix) || (item.suffixed && this.hasSuffix);
    },
    lineClassesH(index) {
      if (index === this.lineHover) {
        return this.lineClassesHover;
      }
      return null;
    },
    lineClick(item, index) {
      this.$emit('onLineClick', item, index);
    },
    isType(obj) {
      const types = Object.prototype.toString.call(obj);
      if (types === '[object Array]') {
        return 'Array';
      }
      if (types === '[object Object]') {
        return 'Object';
      }
      return 'string';
    },
    // 表头文字 居中
    cellStyleTh(item) {
      const style = {};
      if (item.width) {
        style.width = item.width;
      } else {
        style.flex = '1 0';
      }
      if (item.minWidth) {
        style.minWidth = item.minWidth;
      }
      if (item.align) {
        style['justify-content'] = item.align;
        style['text-align'] = item.align;
      }
      return style;
    },
    // 点击排序事件
    sortChange(key, sortable, isDefalutSort = true) {
      if (sortable) {
        this.isSorte = true;
        this.isDefalutSort = isDefalutSort;
        if (this.sorteKey !== key) {
          this.sortType = 'up';
          this.sorteKey = key;
        } else {
          this.sortType = this.sortType === 'down' ? null : 'down';
          this.sorteKey = this.sortType === null ? null : this.sorteKey;
        }

        if (this.defaultSort && key.toString() !== this.defaultSort) {
          if (this.sorteKey === null && this.sortType === null) {
            this.sorteKey = this.defaultSort;
            this.sortType = 'down';
          }
        }
        this.$emit('sortOnChange', {
          key: this.sorteKey,
          type: this.sortType,
          originKey: key,
        });
      }
    },
    getSortValue(item) {
      if (parseFloat(item[this.sorteKey])) {
        return parseFloat(item[this.sorteKey]);
      }
      return item[this.sorteKey];
    },
    // 排序
    quickSort(datas) {
      const list = JSON.parse(JSON.stringify(datas));
      return list.sort((a, b) => (this.getSortValue(a) > this.getSortValue(b) ? 1 : -1));
    },
    tableBodyScroll(e) {
      const scrollOptions = {
        x: 0,
        y: e.scrollTop,
      };
      if (this.$refs.bodyScroll) {
        this.$refs.bodyScroll.scrollTo(scrollOptions, 0);
      }
      if (this.$refs.suffixScroll) {
        this.$refs.suffixScroll.scrollTo(scrollOptions, 0);
      }
      if (this.$refs.prefixScroll) {
        this.$refs.prefixScroll.scrollTo(scrollOptions, 0);
      }
    },
  },
};
</script>

<style lang='stylus'>
.dark-theme {
  .table-prefix-shadow {
    box-shadow: 10px 0px 10px -10px rgba(0,0,0,1);
  }
  .table-suffix-shadow {
    box-shadow: -10px 0px 10px -10px rgba(0,0,0,1);
  }
}
.light-theme {
  .table-prefix-shadow {
    box-shadow: 10px 0px 10px -10px rgba(255,255,255,1);
  }
  .table-suffix-shadow {
    box-shadow: -10px 0px 10px -10px rgba(255,255,255,1);
  }
}
.common-table {
  font-family: HarmonyOS-Medium;
  position: relative;
  scrollbar-color: rgba(0, 0, 0, 0) rgba(0, 0, 0, 0);

  ::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0);
  }

  ::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0);
  }

  .expand-enter-active {
    transition: all 0.5s;
  }

  .expand-leave-active {
    transition: all 0.5s;
  }

  .expand-enter, .expand-leave-to {
    height: 0;
  }

  .table-scroll-wrap {
    width: fit-content;
    min-width: 100%;
  }

  .common-table-content {
    width: 100%;

    table {
      width: 100%;
    }

    .is-hidden {
      visibility: hidden;
    }

    &.is-fixed {
      position: absolute;
      top: 0;
      overflow: hidden;
      height: 100%;

      .table-scroll-wrap {
        position: absolute;
        top: 0;
      }
    }

    &.is-prefixed {
      left: 0;

      .table-scroll-wrap {
        left: 0;
      }
    }

    &.is-suffixed {
      right: 0;

      .table-scroll-wrap {
        right: 0;
      }
    }
  }

  .table-head {
    padding: 0 16px 12px;
    border: none;
    font-size: 12px;
    line-height: 14px;

    .tr {
      vertical-align: middle;
      display: flex;
    }

    .th {
      justify-content: left;
      padding: 0 8px;
      box-sizing: border-box;
      display: flex;
      align-items: center;

      &:first-child {
        padding-left: 0;
      }

      &:last-child {
        justify-content: right;
        padding-right: 0;
      }
    }

    .isSorte {
      cursor: pointer;
      user-select: none;
      display: inline-block;
      line-height: 14px;
      height: 14px;

      .icon {
        vertical-align: -0.1em;
      }
    }
  }

  .table-body {
    line-height: 16px;
    font-size: 14px;

    .table-body-bar {
      padding: 0;
    }

    .tr-bg {
      width: 100%;
      padding: 0;
      box-sizing: border-box;
    }

    .tr-content {
      width: 100%;
      transition: all 0.5s;
    }

    .tr {
      display: flex;
      width: 100%;
      box-sizing: border-box;
      align-items: center;
      padding: 12px 16px;
      border-bottom-style: solid;
      border-bottom-width: 1px;
    }

    .td {
      text-align: left;
      vertical-align: middle;
      flex-shrink: 0;
      padding: 0 8px;
      box-sizing: border-box;

      &:first-child {
        padding-left: 0;
      }

      &:last-child {
        text-align: right;
        padding-right: 0;
      }
    }
  }

  .sub-table {
    overflow: hidden;

    .sub-table-wrap {
      padding: 24px 40px;
    }

    .sub-table-head {
      margin-bottom: 12px;
      font-size: 12px;
      line-height: 14px;

      .sub-tr {
        vertical-align: middle;
        display: flex;

        .sub-td {
          flex: 1;
        }
      }
    }

    .sub-table-body {
      .sub-tr {
        display: flex;
        margin-bottom: 24px;

        &:last-child {
          margin-bottom: 0;
        }
      }
    }
  }

  .sub-no-data {
    margin-top: 16px;
    text-align: center;
    font-size: 12px;

    p {
      margin-top: 12px;
    }
  }

  .no-data {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    font-size: 12px;

    p {
      margin-top: 12px;
    }
  }

  .common-tabel-content {
    width: 100%;
  }

  &.common-noBorder-table {
    .table-body {
      .tr-content .tr {
        border: none;
      }
    }
  }

  &.common-table-small {
    .table-body {
      font-size: 12px;
    }
  }
}
</style>
