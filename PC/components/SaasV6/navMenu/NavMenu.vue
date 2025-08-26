<template>
  <aside :style="boxStyle" class="common-navMenu fill-2-bg">
    <vue-scroll>
      <ul class="navMenuList">
        <li v-for="(item, index) in navList" :key="index" class="nav-item">
          <div
            class="nav-item-content"
            :class="{
              [item.activeNavClass]:
                navListActive === item.id || hoverId === item.id,
              [item.navClass]: navListActive !== item.id && hoverId !== item.id,
            }"
            @click="listChanges(item)"
            @mouseover="hoverId = item.id"
            @mouseout="hoverId = null"
          >
            <div
              v-if="navListActive === item.id"
              class="active-line main-1-bg"
            ></div>
            <img
              v-if="
                item.customeMenu &&
                (navListActive === item.id || hoverId === item.id)
              "
              :src="item.activeIconSvg"
              class="customemenuStyle"
            />
            <img
              v-if="item.customeMenu && hoverId !== item.id"
              :src="item.iconSvg"
              class="customemenuStyle"
            />
            <span class="defMenuStyle" v-if="!item.customeMenu">
              <i
                class="nav-icon"
                v-if="navListActive === item.id || hoverId === item.id"
                v-html="item.activeIconSvg"
              ></i>
              <i class="nav-icon" v-else v-html="item.iconSvg"></i>
            </span>

            <span v-if="item.isShowTooltip">
              {{ item.navText }}
              <div class="tooltip main-1-bg" v-if="!isShowTooltip">
                <div class="tooltip-arrow main-1-bg"></div>
                <div class="tooltip-inner text-4-cl">
                  {{ item.toolTipContent }}
                </div>
                <div
                  class="tooltip-hide main-1-cl"
                  @click.stop="handleChangeTooltip"
                >
                  {{ $t("innov.get_it") }}
                </div>
              </div>
            </span>
            <span v-else>{{ item.navText }}</span>

            <em
              v-if="item.children && item.children.length"
              class="expand-icon"
              :class="{ expand: navExpand === item.id }"
            >
              <svg
                class="icon icon-10"
                viewBox="0 0 1024 1024"
                v-html="getIconPath('triangle', 'special-4-cl')"
              ></svg>
            </em>
          </div>

          <ol
            v-if="item.children && item.children.length"
            class="sub-nav-list"
            :style="{
              height:
                navExpand === item.id ? item.children.length * 48 + 'px' : 0,
            }"
          >
            <li
              v-for="(subItem, subIndex) in item.children"
              :key="index + subIndex"
              class="sub-nav-item"
              :class="{
                'text-1-cl':
                  subItem.id === subNavActive || subHover === subIndex,
              }"
              @mouseover="subHover = subIndex"
              @mouseleave="subHover = null"
              @click="subListChanges(subItem)"
            >
              {{ subItem.navText }}
            </li>
          </ol>
        </li>
      </ul>
    </vue-scroll>
  </aside>
</template>
<script>
import { colorMap, getIconPath, myStorage } from '@/utils';

export default {
  name: 'c-saasV6-navMenu',
  data() {
    return {
      colorMap,
      hoverId: '',
      subHover: null,
      navExpand: null,
      isShowTooltip: myStorage.get('isShowTooltip') || false, // 是否展示tooltip
    };
  },
  props: {
    // 组件整体宽度
    width: {
      default: '240',
      type: [Number, String],
    },
    // 菜单列表
    navList: {
      default: () => [],
      type: Array,
    },
    // 默认选中第几个
    navListActive: {
      default: 1,
      type: [Number, String],
    },
    // sub默认选中第几个
    subNavActive: {
      default: 1,
      type: [Number, String],
    },
  },
  computed: {
    // 组件整体宽度
    boxStyle() {
      return {
        width: `${this.width}px`,
      };
    },
  },
  watch: {
    navListActive: {
      handler(v) {
        if (v && this.navList) {
          const nav = this.navList.find((item) => item.id === v);
          if (nav && nav.children && nav.children.length) {
            this.navExpand = v;
          }
        }
      },
      immediate: true,
    },
  },
  methods: {
    getIconPath,
    // 菜单栏点击事件
    listChanges(item) {
      if (item.children && item.children.length) {
        if (this.navExpand !== item.id) {
          this.navExpand = item.id;
        } else {
          this.navExpand = null;
        }
      }
      this.$emit('listChange', item);
    },
    subListChanges(item) {
      this.$emit('subListChange', item);
    },
    handMouseenter(item) {
      this.hoverId = item.id;
    },
    handMouseleave() {
      this.hoverId = '';
    },
    handleChangeTooltip() {
      this.isShowTooltip = true;
      myStorage.set('isShowTooltip', this.isShowTooltip);
    },
  },
};
</script>
<style lang="stylus" scoped>
.common-navMenu {
  width: 100%;
  height: 100%;
  padding: 12px 0;
  box-sizing: border-box;

  .nav-item {
    .customemenuStyle {
      position: absolute;
      left: 16px;
      width: 16px;
      height: 20px;
    }

    .defMenuStyle {
      display: flex;
      align-items: center;
    }

    .nav-item-content {
      width: 100%;
      height: 52px;
      padding-left: 48px;
      padding-right: 16px;
      box-sizing: border-box;
      position: relative;
      cursor: pointer;
      display: flex;
      align-items: center;
      // justify-content: space-between;
      font-size: 14px;
      line-height: 16px;
      .expand-icon{
        position: absolute;
        right: 20px;
      }

      .tooltip {
        width: 176px;
        height: 74px;
        position: absolute;
        text-align: center;
        padding: 20px;
        z-index: 100;
        bottom: 45px;
        border-radius: 4px;
        left: 16px;

        .tooltip-inner {
          color: #FFF;
          font-family: HarmonyOS-Medium;
          font-size: 16px;
          font-style: normal;
          font-weight: 500;
          text-align: left;
        }

        .tooltip-arrow {
          width: 8px;
          height: 8px;
          position: absolute;
          left: 18%;
          margin-left: -4px;
          transform: rotate(45deg);
          bottom: -4px;
        }

        .tooltip-hide {
          background: #fff;
          height: 32px;
          width: 82px;
          border-radius: 4px;
          line-height: 32px;
          margin-top: 20px;
          position: absolute;
          right: 20px;
          bottom: 20px;
        }
      }

      i.nav-icon {
        position: absolute;
        left: 16px;

        ::v-deep {
          .icon {
            vertical-align: 0;
          }
        }
      }

      .active-line {
        position: absolute;
        left: 0px;
        top: 0;
        width: 4px;
        height: 100%;
        // border-radius: 2px 0px 0px 2px;
      }

      .expand-icon {
        svg {
          transition: all 0.5s;
        }

        &.expand {
          svg {
            transform: rotate(180deg);
          }
        }
      }
    }
  }

  .sub-nav-list {
    transition: all 0.5s;
    overflow: hidden;

    .sub-nav-item {
      width: 100%;
      height: 48px;
      line-height: 48px;
      padding-left: 48px;
      box-sizing: border-box;
      position: relative;
      cursor: pointer;
    }
  }
}
</style>
