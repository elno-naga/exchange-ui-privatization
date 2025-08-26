<template>
  <div class="rewards-banner">
    <div class="banner-intro">
      <div class="banner-title text-1-cl">
        {{ showTitle }}
      </div>
      <div class="banner-desc text-1-cl">
        {{ showDesc }}
      </div>
      <div v-if="btnText" class="banner-btn">
        <c-button className="btn-blue" height="44px" @click="jump">
          {{ btnText }}
        </c-button>
      </div>
    </div>
    <div class="banner-img">
      <img :src="showBanner" alt="">
    </div>
  </div>
</template>

<script>
import { getCookie } from '@/utils';
import taskBannerNight from '@/assets/images/taskCenter/task_banner_night.png';
import taskBanner from '@/assets/images/taskCenter/task_banner.png';

export default {
  name: 'c-task-banner',
  props: {
    title: String,
    desc: String,
    btnText: String,
    bannerImg: String,
    link: String,
    imgDomain: String,
  },
  data() {
    return {
      userSkin: getCookie('cusSkin') || getCookie('defSkin'), // 用户选择的skin
    };
  },
  computed: {
    isDarkTheme() {
      return this.userSkin === '1';
    },
    defaultImg() {
      return this.isDarkTheme ? taskBannerNight : taskBanner;
    },
    showBanner() {
      // return this.bannerImg ? this.bannerImg : this.defaultImg;
      return this.bannerImg;
    },
    showTitle() {
      if (this.title === undefined) {
        return '';
      }
      return (typeof this.title === 'string' && this.title.length > 0) ? this.title : this.$t('rewardsCenter.bannerTitle');
    },
    showDesc() {
      if (this.title === undefined) {
        return '';
      }
      return (typeof this.desc === 'string' && this.desc.length > 0) ? this.desc : this.$t('rewardsCenter.bannerDesc');
    },
  },
  methods: {
    jump() {
      if (!this.link) {
        return;
      }
      if (this.link.includes('http')) {
        window.open(this.link);
      } else {
        window.open(window.location.origin + this.link);
      }
    },
  },
};
</script>

<style lang="stylus" scoped>
.rewards-banner {
  display: flex;
  flex-direction: row;
  position: relative;
  min-width: 1300px;
  height: 480px;
  width: 100%;
  justify-content: center;

  .banner-intro {
    width: 1200px;
    margin-top: 132px;
    z-index: 1;

    .banner-title {
      font-size: 54px;
      font-weight: 700;
      max-width: 400px;
      line-height: 56px;
    }

    .banner-desc {
      font-size: 20px;
      margin-top: 16px;
      max-width: 500px;
      line-height: 22px;
    }

    .banner-btn {
      margin-top: 24px;

      .btn-blue {
        color: #FFFFFF;
        border-radius: 4px;
        padding: 0 14px;
        font-size: 16px;
        line-height: 44px;
        cursor: pointer;
        text-align: center;
        box-sizing: border-box;
        min-width: 183px;
        background: #2B61FF;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
      }
    }

  }

  .banner-img {
    max-width: 2560px;
    min-width: 1300px;
    width: 100%;
    height: 480px;
    position: absolute;
    left: 0;
    top: 0;
    overflow: hidden;

    img {
      position: absolute;
      left: 50%;
      margin-left: -1280px;
      width: 2560px;
      height: 480px;
    }
  }
}
</style>
