<template>
  <div class="v5-common-step" :class="className">
    <ul class="step">
      <li
        class="step-item"
        v-for="(item, index) in stepList"
        :key="index"
        :style="{ paddingRight: paddingR }"
      >
        <div
          class="step-index-border"
          :class="activeStep === index ? bdColorActive : bdColor"
          :style="{ width: widthExternal, height: widthExternal }"
        >
          <span
            class="step-index"
            :class="[
              activeStep === index ? bgColorActive : bgColor,
              activeStep === index ? 'white' : 'text-2-cl',
            ]"
            :style="{ width: widthInternal, height: widthInternal }"
            >{{ index + 1 }}</span
          >
        </div>
        <p
          class="step-text"
          :class="activeStep === index ? 'text-1-cl' : 'text-2-cl'"
        >
          {{ item }}
        </p>
        <span
          v-if="index !== stepList.length - 1"
          class="line fill-6-bd"
          :style="{ width: `calc(${paddingR} - 6px)` }"
        ></span>
      </li>
    </ul>
  </div>
</template>
<script>
export default {
  name: 'c-v5-step',
  data() {
    return {};
  },
  props: {
    // 根元素的样式
    className: {
      default: '',
      type: String,
    },
    // 共有几步
    stepList: {
      default: () => [],
      type: Array,
    },
    // 当前第几步
    activeStep: {
      default: 0,
      type: [Number],
    },
    // 边框 传入原始颜色class
    bdColor: {
      default: 'fill-6-bd',
      type: String,
    },
    // 背景 传入原始颜色class
    bgColor: {
      default: 'fill-6-bg',
      type: String,
    },
    // 边框 active颜色class
    bdColorActive: {
      default: 'main-1-bd',
      type: String,
    },
    // 背景 active颜色class
    bgColorActive: {
      default: 'main-1-bg',
      type: String,
    },
    // 外部环形的宽度，高度等于宽度
    widthExternal: {
      default: '40px',
      type: String,
    },
    // 内部环形的宽度，高度等于宽度
    widthInternal: {
      default: '32px',
      type: String,
    },
    // 两个圆圈的间距
    paddingR: {
      default: '114px',
      type: String,
    },
  },
  computed: {},
  watch: {},
  mounted() {},
  methods: {},
  created() {},
};
</script>
<style lang='stylus'>
.v5-common-step {
  .white {
    color: #fff;
  }

  .step {
    display: flex;
    justify-content: center;

    .step-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;

      &:last-child {
        padding: 0 !important;
      }

      .line {
        display: block;
        position: absolute;
        border-bottom-width: 2px;
        border-bottom-style: dashed;
        right: 0;
        top: 20px;
      }

      .step-index-border {
        border-width: 1px;
        border-style: solid;
        border-radius: 100%;
        display: flex;
        justify-content: center;
        align-items: center;

        .step-index {
          border-radius: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
        }
      }

      .step-text {
        line-height: 16px;
        margin-top: 8px;
      }
    }
  }
}
</style>
