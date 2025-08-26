<template>
  <div
    v-if="show"
    class="reward-card main-1-bg"
    :class="showClass"
    @mouseenter="handMouseenter"
    @mouseleave="handMouseleave"
    @click="jumpTask"
  >
    <div class="reward-card-img">
      <img :src="showImg" alt="">
    </div>
    <div class="reward-card-msg">
      <div class="reward-card-title text-1-cl">
        {{ showTitle }}
        <img :src="'https://s3.ap-northeast-1.amazonaws.com/chainup-test/taskCenter_arrow.png'" alt="">
      </div>
      <div class="reward-card-desc text-1-cl">{{ showDesc }}</div>
    </div>
  </div>
</template>

<script>
import { imgMap } from '@/utils';

export default {
  name: 'c-reward-card',
  props: {
    source: String, // 1.首页 2.资产页 3.个人中心页
  },
  data() {
    return {
      show: false,
      hover: false,
      title: undefined,
      desc: undefined,
      img: undefined,
      imgMap,
    };
  },
  computed: {
    showClass() {
      return this.hover ? 'reward-card-show ' : '';
    },
    showTitle() {
      return this.title || this.$t('rewardsCenter.rewardDialogTitle');
    },
    showDesc() {
      return this.desc || this.$t('rewardsCenter.rewardDialogDesc');
    },
    showImg() {
      return this.img || this.imgMap.taskFloat;
    },
    linkurl() {
      if (this.$store.state.baseData.publicInfo) {
        return this.$store.state.baseData.publicInfo.url;
      }
      return {};
    },
  },
  methods: {
    handMouseenter() {
      this.hover = true;
    },
    handMouseleave() {
      this.hover = false;
    },
    // 路由跳转
    btnLink(link) {
      if (link.indexOf('http') > -1) {
        window.location.href = link;
      } else {
        this.$router.push(link);
      }
    },
    jumpTask() {
      const link = this.linkurl.exUrl ? `${this.linkurl.exUrl}/${this.lan}/taskCenter` : '';
      this.btnLink(link);
    },
  },
  mounted() {
    this.axios({
      url: 'reward_center_info',
      method: 'post',
    })
      .then((res) => {
        const {
          suspendedShowPage, suspendedImgUrl, suspendedTitle, suspendedSubTitle,
        } = res.data;
        this.title = suspendedTitle;
        this.desc = suspendedSubTitle;
        this.img = suspendedImgUrl;
        const showList = suspendedShowPage ? suspendedShowPage.split(',') : [];
        this.show = showList.includes(this.source);
      });
  },
};
</script>

<style scoped lang="stylus">
.reward-card {
  min-width: 181px;
  height: 64px;
  box-sizing: border-box;
  padding: 8px 16px 8px 12px;
  border-radius: 100px;
  display: flex;
  flex-direction: row;
  position: fixed;
  bottom: 200px;
  left: calc(100% - 60px);
  cursor: pointer;
  z-index:1000;

  .reward-card-img {
    width: 48px;
    height: 48px;
    margin-right: 8px;

    img {
      width: 48px;
      height: 48px;
    }
  }

  .reward-card-msg {
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    .reward-card-title {
      font-size: 18px;
      font-family: DINPro;
      font-weight: 700;
      line-height: 26px;
      color:#FFFFFF;
      img{
        width:12px;
        height:12px;
      }

    }

    .reward-card-desc {
      font-size: 12px;
      font-family: PingFang SC;
      font-weight: 500;
      line-height: 18px;
      color:#FFFFFF;
    }
  }

}

.reward-card-show {
  left: unset;
  right: 0;
}
</style>
