// Created by 任泽阳 on 18/12/06. // 按钮组件 // ***************************** // 注
1.该组件必须传入type // 注 2.组件内容通过slot传入
<template>
  <!--  -->
  <button
    class="common-button common-button"
    :style="contentStyle"
    :class="`${allClass} ${className}`"
    @click.stop="handClick"
    ref="button"
    @mousedown="handMouseDown"
    @mouseup="handMouseUp"
    @mouseenter="handMouseenter"
    @mouseleave="handMouseleave"
  >
    <div class="common-button-slot" :style="{ fontSize: fontSize }">
      <c-loading v-if="loading" size="14" className="text-4-bd" colorName="text-4-cl"></c-loading>
      <slot v-else v-bind:isHover="isHover" v-bind:isClick="isClick"/>
    </div>
  </button>
</template>
<script>
export default {
  name: 'c-button',
  data() {
    return {
      flag: true,
      wH: 0, // 动画变量
      nX: 0, // 动画变量
      nY: 0, // 动画变量
      canvClass: '', // 动画class
      isHover: false,
      isClick: false,
    };
  },
  props: {
    name: { default: '', type: String },
    // 主题类型 primary主色系蓝色  config配置浅和深色系  涨跌色:fall 跌  rise:涨 white:主要在引导气泡按钮使用

    colorType: {
      validator(val) {
        return ['primary', 'config', 'fall', 'rise', 'white', 'warning'].indexOf(val) !== -1;
      },
      default: 'primary',
    },
    // 类型  实心-solid 空心-hollow 文本-test secondary-次要按钮  primary存在三种类型 config存在实心-solid 空心-hollow  其他只有solid状态
    type: {
      validator(val) {
        return ['solid', 'hollow', 'text'].indexOf(val) !== -1;
      },
      default: 'solid',
    },
    className: { default: '', type: String }, // 根容器class 默认样式 不要传进来选中样式和滑过样式
    // *** 如果要配置颜色组 需要传入一整套颜色
    defaultColorClass: { default: '', type: String }, // 该组件默认颜色组
    hoverColorClass: { default: '', type: String }, // 该组件滑过颜色组 仅空心按钮 框线按钮
    activeColorClass: { default: '', type: String }, // 该组件选中颜色组 仅空心按钮 框线按钮
    // ***
    disabled: { default: false, type: Boolean }, // 是否禁用 (!** 该属性仅存在solid类型 **!)
    loading: { default: false, type: Boolean }, // 是否loading  (!** 该属性仅存在solid类型 **!)
    kind: { default: false, type: Boolean }, // false为蓝色系 true为灰色系  (!** 该属性仅存在text类型 **!)
    paddingW: { default: '', type: String }, // 左右padding
    height: { default: '', type: String }, // 该容器根容器 height属性
    width: { default: '', type: String }, // 该容器根容器 width属性
    marginTop: { default: '0px', type: String }, // 该组件根容器 margin-top属性
    fontSize: { default: '14px', type: String }, // 字体大小
  },
  created() {
    // 错误处理： 如果 disable和loading同时存在
    if (this.disabled && this.loading) {
      this.flag = false; // 不展示组件
      // throw('Common-button: disable 和 loading 只可存在一个') // 抛错
      // console.error('Common-button: disable 和 loading 只可存在一个');
    }
    this.$bus.$on('button-click', (name) => {
      if (name === this.name) {
        this.handClick();
      }
    });
  },
  computed: {
    contentStyle() {
      let { height, paddingW } = this.$props;
      const { width } = this.$props;
      switch (this.type) {
        // 实心
        case 'solid':
          height = height === '' ? '44px' : height;
          paddingW = paddingW === '' ? '20px' : paddingW;
          break;
        // 空心
        case 'hollow':
          height = height === '' ? '32px' : height;
          paddingW = paddingW === '' ? '20px' : paddingW;
          break;
        // 文本
        case 'text':
          height = height === '' ? '16px' : height;
          paddingW = paddingW === '' ? '10px' : paddingW;
          break;
        default:
          break;
      }
      const data = {
        width,
        height,
        paddingLeft: paddingW,
        paddingRight: paddingW,
        marginTop: this.marginTop,
      };
      if ((this.colorType === 'fall' || this.colorType === 'rise') && this.type === 'solid') {
        data.color = '#fff';
      }
      return data;
    },
    // 整理当前类型和状态
    nowType() {
      let type = 'solid';
      if (this.type === 'solid') {
        type = 'solid';
        if (this.loading) {
          type = 'solid-loading';
        }
        if (this.disabled) {
          type = 'solid-disabled';
        }
      } else if (this.type === 'hollow') {
        type = 'hollow';
        if (this.disabled) {
          type = 'hollow-disabled';
        }
      } else if (this.type === 'text') {
        type = 'text';
        if (this.kind) {
          type = 'text-king';
        }
        if (this.disabled) {
          type = 'text-disabled';
        }
      }
      return type;
    },
    // 基础样式
    infoClass() {
      switch (this.nowType) {
      // 实心
        case 'solid':
          return 'common-button-solid';
        case 'solid-loading':
          return 'common-button-solid-loading';
        case 'solid-disabled':
          return 'common-button-solid-disabled';
        // 框线
        case 'hollow':
          return 'common-button-hollow';
        case 'hollow-disabled':
          return 'common-button-hollow-disabled';
        // 文本
        case 'text':
          return 'common-button-text';
        case 'text-king':
          return 'common-button-text-kind';
        case 'text-disabled':
          return 'common-button-text-disabled';
        default:
          return 'common-button-solid';
      }
    },

    // 元素默认颜色
    defaultColor() {
      if (this.defaultColorClass.length > 0) {
        return this.defaultColorClass;
      }
      const defaultColors = {
        'solid-disabled': 'fill-7-bg text-2-cl',
        'hollow-disabled': 'text-3-cl fill-5-bd',
        'text-king': 'text-2-cl',
        'text-disabled': 'text-2-cl',
      // solid: 'main-1-bg text-1-cl',
      // 'solid-loading': 'main-1-bg text-1-cl',
      // hollow: 'main-1-cl main-1-bd',
      };

      const colorTypes = {
        primary: {
          solid: 'main-1-bg text-4-cl',
          'solid-loading': 'main-1-bg text-1-cl',
          hollow: 'main-1-cl main-1-bd',
          text: 'main-1-cl',
        },
        config: {
          solid: 'fill-3-bg text-1-cl',
          'solid-loading': 'fill-3-bg text-1-cl',
          hollow: 'text-1-cl fill-5-bd',
          text: 'text-1-cl',
        },
        fall: {
          solid: 'fall-1-bg ',
          'solid-loading': 'fall-1-bg ',
          hollow: 'fall-1-cl fall-1-bd',
          text: 'fall-1-cl',
        },
        rise: {
          solid: 'rise-1-bg',
          'solid-loading': 'rise-1-bg',
          hollow: 'rise-1-cl rise-1-bd',
          text: 'rise-1-cl',
        },
        white: {
          solid: 'main-1-cl text-4-bg',
          'solid-loading': 'main-1-cl text-4-bg',
          hollow: '',
          text: 'main-1-cl',
        },
        warning: {
          solid: 'warning-1-bg text-4-cl',
          'solid-loading': 'warning-1-bg text-4-cl',
          hollow: 'warning-1-bd warning-1-cl',
          text: 'warning-1-cl',
        },
      };

      const defaultColor = defaultColors[this.nowType];
      if (defaultColor) {
        return defaultColor;
      }

      const colorType = colorTypes[this.colorType];

      if (colorType) {
        const color = colorType[this.nowType];
        if (color) {
          return color;
        }
      }
      return 'main-1-bg text-1-cl';
    },
    // todo hollow-disabled的状态
    // 元素滑过颜色
    hoverColor() {
      if (this.hoverColorClass.length > 0) {
        return this.hoverColorClass;
      }
      const defaultColors = {
        'solid-disabled': 'fill-7-bg text-2-cl',
        'hollow-disabled': 'text-3-cl fill-5-bd',
        'text-king': 'text-2-cl',
        'text-disabled': 'text-2-cl',
      };
      const colorTypes = {
        primary: {
          solid: 'main-2-bg text-4-cl',
          'solid-loading': 'main-2-bg text-1-cl',
          hollow: 'main-2-cl main-2-bd',
          text: 'main-2-cl',
        },
        config: {
          solid: 'fill-6-bg text-1-cl',
          'solid-loading': 'fill-6-bg text-1-cl',
          hollow: 'main-1-cl main-1-bd',
          text: 'main-2-cl',
        },
        fall: {
          solid: 'fall-2-bg',
          'solid-loading': 'fall-2-bg',
          hollow: 'fall-2-cl fall-2-bd',
          text: 'fall-2-cl',
        },
        rise: {
          solid: 'rise-2-bg',
          'solid-loading': 'rise-2-bg',
          hollow: 'rise-2-cl rise-2-bd',
          text: 'fall-1-cl',
        },
        white: {
          solid: 'main-2-cl text-4-bg',
          'solid-loading': 'main-2-cl text-4-bg',
          hollow: '',
          text: 'main-2-cl',
        },
        warning: {
          solid: 'warning-2-bg text-4-cl',
          'solid-loading': 'warning-2-bg text-4-cl',
          hollow: 'warning-2-bd warning-2-cl',
          text: 'warning-2-cl',
        },
      };
      const defaultColor = defaultColors[this.nowType];
      if (defaultColor) {
        return defaultColor;
      }
      const colorType = colorTypes[this.colorType];
      if (colorType) {
        const color = colorType[this.nowType];
        if (color) {
          return color;
        }
      }
      return 'main-2-bg text-1-cl'; // ( class 背景色 字体色 )
    },
    // 元素点击颜色
    activeColor() {
      if (this.activeColorClass.length > 0) {
        return this.activeColorClass;
      }
      const defaultColors = {
        'solid-disabled': 'fill-7-bg text-2-cl',
        'hollow-disabled': 'main-1-cl main-1-bd',
        'text-king': 'text-2-cl',
        'text-disabled': 'text-2-cl',
      };
      const colorTypes = {
        primary: {
          solid: 'main-3-bg text-4-cl',
          'solid-loading': 'main-3-bg text-1-cl',
          hollow: 'main-3-cl main-3-bd',
          text: 'main-3-cl',
        },
        config: {
          solid: 'fill-7-bg text-1-cl',
          'solid-loading': 'fill-7-bg text-1-cl',
          hollow: 'main-1-cl main-1-bd',
          text: 'main-3-cl',
        },
        fall: {
          solid: 'fall-3-bg',
          'solid-loading': 'fall-3-bg',
          hollow: 'fall-3-cl fall-3-bd',
          text: 'fall-3-cl',
        },
        rise: {
          solid: 'rise-3-bg',
          'solid-loading': 'rise-3-bg',
          hollow: 'rise-3-cl rise-3-bd',
          text: 'rise-3-cl',
        },
        white: {
          solid: 'main-3-cl text-4-bg',
          'solid-loading': 'main-3-cl text-4-bg',
          hollow: '',
          text: 'main-3-cl',
        },
        warning: {
          solid: 'warning-3-bg text-4-cl',
          'solid-loading': 'warning-3-bg text-4-cl',
          hollow: 'warning-3-bd warning-3-cl',
          text: 'warning-3-cl',
        },
      };
      const defaultColor = defaultColors[this.nowType];
      if (defaultColor) {
        return defaultColor;
      }
      const colorType = colorTypes[this.colorType];
      if (colorType) {
        const color = colorType[this.nowType];
        if (color) {
          return color;
        }
      }
      return 'main-3-bg text-1-cl';
    },
    allClass() {
      let colorClass = this.defaultColor;
      if (this.isHover) {
        colorClass = this.hoverColor;
      }
      if (this.isClick) {
        colorClass = this.activeColor;
      }
      return `${this.infoClass} ${colorClass}`;
    },
    // 特效点击点
    canvStyle() {
      return {
        width: `${this.wH}px`,
        height: `${this.wH}px`,
        left: `${this.nX}px`,
        top: `${this.nY}px`,
      };
    },
  },

  methods: {
    // input 鼠标划入
    handMouseenter() {
      this.isHover = true;
    },
    // input 鼠标划出
    handMouseleave() {
      this.isHover = false;
    },
    handMouseDown() {
      this.isClick = true;
    },
    handMouseUp() {
      this.isClick = false;
    },
    handClick() {
      if (this.disabled || this.loading) return;
      this.$emit('click');
    },
  },
};
</script>

<style lang="stylus">
.common-button {
  font-family: HarmonyOS-Medium !important;
  &.common-button {
    transition: all 0.3s;
    box-sizing: border-box;
    border-radius: 4px;
    position: relative;
    overflow: hidden;
    text-align: center;
    cursor: pointer;
    user-select: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    .common-button-slot {
      position: relative;
      display: inline;
    }
    .button-background {
      width: 100%;
      height: 100%;
      position: absolute;
      left: 0;
      top: 0;
      z-index: 2;
    }
  }
  // 实心按钮 -- 默认
  &.common-button-solid {
    font-size: 14px;
  }

  // 实心按钮 -- 禁止
  &.common-button-solid-disabled {
    font-size: 14px;
    cursor: not-allowed!important;
    position: relative;
  }

  // 实心按钮 -- 等待
  &.common-button-solid-loading {
    font-size: 14px;
    cursor: not-allowed!important
  }

  // 空心按钮
  &.common-button-hollow {
    font-size: 14px
    border-width: 1px;
    border-style: solid;
  }
  &.common-button-hollow-disabled {
    cursor: not-allowed!important;
  }

  // 文本按钮
  &.common-button-text,
  &.common-button-text-kind {
    font-size: 14px;
    line-height: 16px;
  }
  &.common-button-text-disabled {
    cursor: not-allowed!important;
  }

  .button-canv {
    position: absolute;
    left: 20px;
    top: 20px;
    transform: scale(0);
  }
  .mmd-waves-effect {
    border-radius: 100%;
    background-color: #D8D8D8;

  }

  .mmd-waves-effect-animation {
    animation: mmd-maves-animation-definition 0.8s ease-out;
    /* 兼容各大浏览器 */
    -moz-animation: mmd-maves-animation-definition 0.8s ease-out;
    -webkit-animation: mmd-maves-animation-definition 0.8s ease-out;
    -o-animation: mmd-maves-animation-definition 0.8s ease-out;
  }

  @keyframes mmd-maves-animation-definition {
    from {
      transform: scale(0.1);
      opacity: 0.5;
    }

    to {
      transform: scale(2); /* 因为涟漪的大小为标签的最长边，为了保证点击标签边缘时，涟漪也能覆盖整个标签，scale值最小应为2 */
      opacity: 0;
    }
  }

  @keyframes mmd-maves-animation-definition {
    from {
      transform: scale(0.1);
      opacity: 0.5;
    }

    to {
      transform: scale(2); /* 因为涟漪的大小为标签的最长边，为了保证点击标签边缘时，涟漪也能覆盖整个标签，scale值最小应为2 */
      opacity: 0;
    }
  }

  @keyframes mmd-maves-animation-definition {
    from {
      transform: scale(0.1);
      opacity: 0.5;
    }

    to {
      transform: scale(2); /* 因为涟漪的大小为标签的最长边，为了保证点击标签边缘时，涟漪也能覆盖整个标签，scale值最小应为2 */
      opacity: 0;
    }
  }

  @keyframes mmd-maves-animation-definition {
    from {
      transform: scale(0.1);
      opacity: 0.5;
    }

    to {
      transform: scale(2); /* 因为涟漪的大小为标签的最长边，为了保证点击标签边缘时，涟漪也能覆盖整个标签，scale值最小应为2 */
      opacity: 0;
    }
  }
}
</style>
