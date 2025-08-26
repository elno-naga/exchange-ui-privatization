<template>
  <div
    v-if="show"
    class="c-floatLayer"
    ref="cFloatLayer"
    @mouseover="setLayerStyle(true)"
    @mouseleave="setLayerStyle(false)">
    <div
      class="c-floatLayer-content"
      :class="'skin_'+skinTypeId"
      @click="goTaskCenter">
      <div class="layer-img">
        <img :src="icon" alt=""/>
      </div>
      <div class="layer-text">
        <div class="main-text">
          <span>{{mainTitle}}</span>
          <svg class='icon icon-12' aria-hidden='true' >
            <use xlink:href='#icon-v5_38'></use>
          </svg>
        </div>
        <div class="sub-text">{{subTitle}}</div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'c-floatLayer',
  props: {
    // 显示位置 2-资产 3-个人中心 4-登陆落地页 5-行情
    type: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      icon: '',
      mainTitle: '',
      subTitle: '',
      linkAddress: '',
    };
  },
  computed: {
    // 公共信息
    publicInfo() {
      return this.$store.state.baseData.publicInfo;
    },
    skinTypeId() {
      if (this.publicInfo && this.publicInfo.skin) {
        return this.publicInfo.skin.skinTypeId;
      }
      return '';
    },
    // 浮层开关
    show() {
      if (this.publicInfo && this.publicInfo.switch) {
        const { taskCenterFloatingLayer } = this.publicInfo.switch;
        if (taskCenterFloatingLayer && taskCenterFloatingLayer.indexOf(this.type) > -1) {
          return true;
        }
      }
      return false;
    },
  },
  watch: {
    show: {
      handler(v) {
        if (v) {
          this.getLayerConfig();
        }
      },
      immediate: true,
    },
  },
  methods: {
    getLayerConfig() {
      this.axios({
        url: 'common/get_flow_layer',
      }).then((data) => {
        if (data.code.toString() === '0') {
          const { icon, flowLayerMainTitle, flowLayerSubTitle } = data.data;
          if (icon) {
            this.icon = icon;
          } else {
            this.icon = 'https://saas-test-bucket-21.s3.ap-northeast-1.amazonaws.com/1411/upload/62427f86373f92920b911aee33d6683b.png';
          }
          if (flowLayerMainTitle) {
            this.mainTitle = flowLayerMainTitle;
          } else {
            this.mainTitle = this.$t('taskCenter.text81');
          }
          if (flowLayerSubTitle) {
            this.subTitle = flowLayerSubTitle;
          } else {
            this.subTitle = this.$t('taskCenter.text82');
          }
        } else {
          this.icon = 'https://saas-test-bucket-21.s3.ap-northeast-1.amazonaws.com/1411/upload/62427f86373f92920b911aee33d6683b.png';
          this.mainTitle = this.$t('taskCenter.text81');
          this.subTitle = this.$t('taskCenter.text82');
        }
        this.setLayerStyle(false);
      });
    },
    goTaskCenter() {
      if (this.linkAddress) {
        window.location.href = this.linkAddress;
      } else {
        this.$router.push('/taskCenter');
      }
    },
    setLayerStyle(expand) {
      this.$nextTick(() => {
        const layerEl = this.$refs.cFloatLayer;
        if (expand) {
          layerEl.style.right = '0px';
        } else {
          layerEl.style.right = `-${layerEl.offsetWidth - 60}px`;
        }
        setTimeout(() => {
          layerEl.style.opacity = 1;
        }, 500);
      });
    },
  },
};
</script>
<style lang="stylus" scoped>
.c-floatLayer {
  position: fixed;
  z-index: 1001;
  transition: right 0.3s;
  opacity: 0;
  padding-right: 20px;
  bottom: 20%;
  right: 0px;

  .c-floatLayer-content {
    display: flex;
    cursor: pointer;
    align-items: center;
    height: 64px;
    border-radius: 100px;
    padding: 8px 12px;
    box-sizing: border-box;
    background: linear-gradient(270deg, #2766FF 0%, #447BFF 0%, #6693FF 100%);

    .layer-img {
      width: 48px;
      height: 48px;
      display: flex;
      justify-content: center;
      align-items: center;
      background: #EEF3FF;
      border-radius: 100%;
      margin-right: 8px;

      img {
        max-width: 32px;
        max-height: 32px;
      }
    }

    .layer-text {
      color: #ffffff;

      .main-text {
        font-size: 18px;
        line-height: 25px;
        margin-bottom: 2px;
        display: flex;
        align-items: center;

        .icon-12 {
          font-size: 12px;
          margin-left: 4px;
        }
      }

      .sub-text {
        font-size: 12px;
        line-height: 17px;
        vertical-align: 0;
      }
    }

    &.skin_000002, &.skin_000005, &.skin_000007 {
      background: linear-gradient(270.2deg, #FAD432 0.18%, #FFDA5B 99.05%), linear-gradient(270deg, #F8CC1E 0%, #FFE788 100%);

      .layer-img {
        background: #FFFAE7;
      }

      .layer-text {
        color: #000000;
      }
    }

    &.skin_000003 {
      background: linear-gradient(270deg, #51AA89 0%, #7FC8B0 100%);

      .layer-img {
        background: #EAFFF7;
      }
    }

    &.skin_000004 {
      background: linear-gradient(270deg, #6946EB 0%, #A68EFF 100%);

      .layer-img {
        background: #F0ECFF;
      }
    }
  }
}
</style>
